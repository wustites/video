#!/usr/bin/env python3
"""中文旁白：由 ~/tts 的 synthesis 预发布（Qwen3-TTS 克隆声音）生成，再在本地对齐字幕时间。

  python3 scripts/zh_voiceover.py text > ~/tts/texts/input.txt
      把 cues.json 的中文字幕拼成合成文本（每段一行）。
  python3 scripts/zh_voiceover.py align <speaker>-zh-speech.mp3
      复制为 public/voiceover/narration.zh.mp3，用 ffmpeg silencedetect 找出相邻两条字幕之间的停顿，
      写 timing.zh.json：{"durations": 每段时长, "cues": [{"p","c","start","end"}]}。

Qwen3-TTS 不输出逐词时间，也不用本地语音识别：每个标点都是可能的停顿位置，检测到的停顿按音节比例的
预期时间与这些位置做有序对齐（编辑距离），字幕边界取字幕末尾的位置；没有停顿的位置按音节插值。
逐条打印字幕时间和语速，语速异常（可能读漏或对齐错误）时报错，需人工确认。
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

VO = Path("public/voiceover")


def load_cues():
    return json.loads((VO / "cues.json").read_text(encoding="utf-8"))


DIGITS = "〇一二三四五六七八九"


def spoken(zh):
    """合成用读法：四位年份逐字读（2026 → 二〇二六），字幕仍显示数字。"""
    return re.sub(r"(?<!\d)(1[89]\d\d|20\d\d)(?!\d)", lambda m: "".join(DIGITS[int(d)] for d in m.group(1)), zh)


def cmd_text():
    print("\n".join("".join(spoken(zh) for _, zh in paragraph) for paragraph in load_cues()))


def probe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def silences(path, noise="-38dB", min_len=0.12):
    log = subprocess.run(["ffmpeg", "-nostdin", "-i", str(path), "-af", f"silencedetect=noise={noise}:d={min_len}",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    return list(zip(starts, ends))


def syllables(text):
    """近似音节数：汉字、数字各算一个，连续拉丁字母按字母数（APEC 逐字母读）。"""
    return len(re.findall(r"[\u4e00-\u9fff〇0-9A-Za-z]", text))


def cmd_align(speech):
    cues = load_cues()
    flat = [(p, c, zh) for p, paragraph in enumerate(cues) for c, (_, zh) in enumerate(paragraph)]
    total = probe_duration(speech)
    found = silences(speech, noise="-40dB", min_len=0.08)
    lead = next((e for s, e in found if s <= 0.05), 0.0)
    gaps = []
    for s, e in found:
        if s <= 0.05 or e >= total - 0.05:
            continue
        if gaps and s - gaps[-1][1] < 0.08:  # 合并被短促噪声打断的同一个停顿
            gaps[-1] = (gaps[-1][0], e)
        else:
            gaps.append((s, e))

    # 切成“标点之间的片段”：每个片段结尾都是一个可能的停顿位置（slot），字幕结尾的 slot 即字幕边界
    pieces = []  # (cue index, syllables, is_cue_end, is_sentence_end)
    for i, (_, _, zh) in enumerate(flat):
        parts = [x for x in re.split(r"(?<=[，。、：；！？])", spoken(zh)) if x]
        for n, part in enumerate(parts):
            pieces.append((i, syllables(part), n == len(parts) - 1, part[-1] in "。：；！？"))
    slots = pieces[:-1]
    S, J = len(slots), len(gaps)

    # 有序对齐（动态规划）：为每个 slot 选一个停顿或不选。代价看局部一致性——相邻两个选中停顿之间的
    # 语音时长应接近“这几段的音节数 ÷ 语速”，所以误差不会沿时间轴累积；跳过句末 slot、
    # 或把较长的停顿当作句内停顿丢弃都要付出代价。语速取两轮：先全局估计，再用第一轮结果重估。
    def solve(rate):
        INF = float("inf")
        # 状态 (s, j)：slot s（-1 为开头）落在停顿 j（-1 为开头）
        best = {(-1, -1): (0.0, None)}
        end_of = lambda j: lead if j < 0 else gaps[j][1]
        for s in range(S + 1):  # s == S 表示结尾
            for j in range(J + 1 if s == S else J):
                jj = J if s == S else j
                if s == S and j != J:
                    continue
                start_here = total if s == S else gaps[j][0]
                cand = (INF, None)
                for ps in range(max(-1, s - 5), s):
                    syl = sum(pieces[k][1] for k in range(ps + 1, s + 1))
                    skipped_slots = sum(1.5 if slots[k][3] else 0.4 for k in range(ps + 1, s))
                    for pj in range(max(-1, jj - 7), jj):
                        if (ps, pj) not in best:
                            continue
                        dur = start_here - end_of(pj)
                        if dur <= 0:
                            continue
                        skipped_gaps = sum(0.3 + 4.0 * (gaps[k][1] - gaps[k][0]) for k in range(pj + 1, jj))
                        err = (dur - syl / rate) / (0.3 + 0.06 * syl)
                        c = best[(ps, pj)][0] + err * err + skipped_slots + skipped_gaps
                        if c < cand[0]:
                            cand = (c, (ps, pj))
                if cand[1] is not None:
                    best[(s, jj)] = cand
        assign, state = [None] * S, best[(S, J)][1]
        while state != (-1, -1):
            s, j = state
            assign[s] = gaps[j]
            state = best[state][1]
        return assign

    rate = sum(x[1] for x in pieces) / (total - lead - sum(e - s for s, e in gaps))
    assign = solve(rate)
    matched = [g for g in assign if g]
    rate = sum(x[1] for x in pieces) / (total - lead - sum(e - s for s, e in matched))
    assign = solve(rate)

    # 没有停顿的 slot：在前后已确定的停顿之间按音节插值
    known = [(-1, (lead, lead))] + [(s, g) for s, g in enumerate(assign) if g] + [(S, (total, total))]
    for (s0, g0), (s1, g1) in zip(known, known[1:]):
        if s1 - s0 <= 1:
            continue
        syl = [pieces[k][1] for k in range(s0 + 1, s1 + 1)]
        span, acc = g1[0] - g0[1], 0
        for k in range(s0 + 1, s1):
            acc += syl[k - s0 - 1]
            point = g0[1] + span * acc / sum(syl)
            assign[k] = (point, point)

    bounds = [assign[s] for s, x in enumerate(slots) if x[2]]
    timing, bad = [], []
    for i, (p, c, zh) in enumerate(flat):
        start = lead if i == 0 else bounds[i - 1][1]
        end = total if i == len(flat) - 1 else bounds[i][0]
        timing.append({"p": p, "c": c, "start": round(start, 3), "end": round(end, 3)})
        rate_i = syllables(spoken(zh)) / max(end - start, 0.01)
        flag = not 2.5 <= rate_i <= 7.5  # 正常语速约 4~5.5 音节/秒
        bad += [i] if flag else []
        kind = "插值" if i < len(bounds) and bounds[i][0] == bounds[i][1] else "停顿"
        print(f"{'!!' if flag else '  '} {p}.{c} {start:6.2f}–{end:6.2f}s {rate_i:4.1f}音节/秒 结束于{kind} | {zh}")
    if bad:
        raise SystemExit(f"{len(bad)} 条字幕语速异常（可能读漏或对齐错误），请人工检查")

    # 段落分界取段间停顿的中点
    durations, prev = [], 0.0
    for p in range(len(cues)):
        last = max(i for i, q in enumerate(timing) if q["p"] == p)
        cut = total if last == len(timing) - 1 else sum(bounds[last]) / 2
        durations.append(round(cut - prev, 3))
        prev = cut

    shutil.copyfile(speech, VO / "narration.zh.mp3")
    (VO / "timing.zh.json").write_text(json.dumps(
        {"source": Path(speech).name, "synthetic_audio": True, "durations": durations, "cues": timing},
        ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"total {total:.2f}s, paragraphs {durations}")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "text":
        cmd_text()
    elif len(sys.argv) == 3 and sys.argv[1] == "align":
        cmd_align(sys.argv[2])
    else:
        raise SystemExit(__doc__)
