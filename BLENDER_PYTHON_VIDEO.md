# 使用 Blender Python 生成视频

本文档介绍如何使用 Blender 的 Python API（`bpy`）以代码创建场景、设置关键帧并渲染视频。示例以 Blender 4.5 LTS 为基线；Blender Python API 会随版本变化，项目应固定 Blender 版本并在升级后重新渲染关键镜头。

## 适用场景

Blender Python 适合生成：

- 三维产品展示、镜头环绕和机械结构动画；
- 粒子、流体、布料、刚体等物理模拟；
- 需要真实灯光、阴影、材质和景深的镜头；
- 大量仅数据、文字或模型参数不同的批量视频；
- 供 HyperFrames、Remotion 或非线性编辑软件继续合成的透明背景素材。

它不是制作所有视频的最低成本方案。以二维文字排版、榜单、图表和字幕为主时，HTML/CSS 通常迭代更快；Blender 更适合作为三维镜头生成器，或承担整条视频中视觉复杂度最高的部分。

## 工作原理

Blender 内置 Python 解释器，并通过 `bpy` 暴露场景数据和操作接口。一个自动化脚本通常按以下顺序运行：

1. 清理或载入场景。
2. 创建模型、材质、相机和灯光。
3. 为对象属性插入关键帧，或配置约束、驱动器和模拟。
4. 设置分辨率、FPS、帧范围、渲染引擎和输出格式。
5. 保存 `.blend` 文件，并在无界面的后台模式中渲染。

视频时长由帧范围和 FPS 决定：

```text
duration_seconds = (frame_end - frame_start + 1) / fps
```

例如第 1–150 帧、30 FPS 的时间线会渲染 5 秒视频。

## 推荐项目结构

```text
blender-video/
  scripts/
    build_scene.py
  assets/
    models/
    textures/
  project.blend
  renders/
    frames/
    final/
```

约定：

- 脚本负责可重复地重建场景，不把关键逻辑只留在 `.blend` 文件中。
- 输入资源使用相对项目根目录的可解析路径。
- 临时帧序列和最终视频分目录保存。
- 不提交大体积缓存、临时帧和渲染产物，除非它们是明确的交付物。

## 最小可运行示例

下面的脚本创建一个旋转立方体、相机和灯光，并配置 5 秒 MP4 输出。代码面向 Blender 4.5 LTS。

```python
from pathlib import Path
import math

import bpy


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def create_material(name, color):
    material = bpy.data.materials.new(name=name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True

    principled = material.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (*color, 1.0)
    principled.inputs["Roughness"].default_value = 0.28
    principled.inputs["Metallic"].default_value = 0.15
    return material


def build_scene(output_path):
    clear_scene()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"

    # 30 FPS × 150 帧 = 5 秒。
    scene.frame_start = 1
    scene.frame_end = 150
    scene.render.fps = 30
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100

    # 创建主体并插入旋转关键帧。
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.0, 0.0))
    cube = bpy.context.object
    cube.name = "HeroCube"
    cube.data.materials.append(create_material("HeroMaterial", (0.06, 0.32, 0.80)))

    cube.rotation_euler = (math.radians(18), 0.0, 0.0)
    cube.keyframe_insert(data_path="rotation_euler", frame=1)
    cube.rotation_euler = (
        math.radians(18),
        0.0,
        math.radians(360),
    )
    cube.keyframe_insert(data_path="rotation_euler", frame=150)

    # 相机朝向原点。
    bpy.ops.object.camera_add(location=(5.8, -5.8, 4.2))
    camera = bpy.context.object
    scene.camera = camera
    track = camera.constraints.new(type="TRACK_TO")
    track.target = cube
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    camera.data.lens = 52

    # 主光与柔和补光。
    bpy.ops.object.light_add(type="AREA", location=(4.0, -3.0, 6.0))
    key_light = bpy.context.object
    key_light.data.energy = 1100
    key_light.data.shape = "DISK"
    key_light.data.size = 5.0

    bpy.ops.object.light_add(type="AREA", location=(-4.0, 1.0, 2.5))
    fill_light = bpy.context.object
    fill_light.data.energy = 500
    fill_light.data.size = 4.0

    scene.world.color = (0.008, 0.012, 0.025)

    # 直接输出 H.264 MP4。
    scene.render.filepath = str(output_path)
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "MEDIUM"


project_root = Path(bpy.path.abspath("//"))
output = project_root / "renders" / "final" / "cube.mp4"
output.parent.mkdir(parents=True, exist_ok=True)

build_scene(output)
bpy.ops.wm.save_as_mainfile(filepath=str(project_root / "project.blend"))
```

先创建目录并将脚本保存为 `scripts/build_scene.py`，然后执行：

```bash
cd blender-video

# 构建场景；脚本异常时返回非零退出码。
blender --background --python-exit-code 1 --python scripts/build_scene.py

# 使用 project.blend 中保存的设置渲染完整动画。
# -a/--render-anim 应放在渲染参数之后。
blender --background project.blend --render-anim
```

开发阶段也可以打开 `project.blend`，在 Blender UI 中检查相机、材质和关键帧，再用同一条后台命令完成正式渲染。

## 更稳健的生产渲染

正式项目优先输出 PNG 或 OpenEXR 帧序列，再单独编码视频，而不是直接生成 MP4。帧序列具有以下优势：

- 中断后只需补渲缺失帧；
- 可以把不同帧分配给多台机器；
- 编码失败不会丢失昂贵的三维渲染结果；
- OpenEXR 可保留高动态范围、透明通道和多种渲染 pass；
- 可在合成完成后统一决定编码器、码率、色彩格式和音频参数。

把脚本中的输出设置改为：

```python
frames_dir = project_root / "renders" / "frames"
frames_dir.mkdir(parents=True, exist_ok=True)

scene.render.filepath = str(frames_dir / "frame_######")
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
```

渲染后使用 FFmpeg 编码：

```bash
ffmpeg \
  -framerate 30 \
  -start_number 1 \
  -i renders/frames/frame_%06d.png \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -crf 18 \
  -movflags +faststart \
  renders/final/video.mp4
```

如果帧包含透明通道，不要编码为普通 H.264；应选择支持 alpha 的中间格式，或保留 PNG/OpenEXR 序列交给后续合成流程。

## Eevee 与 Cycles

| 维度 | Eevee | Cycles |
| --- | --- | --- |
| 渲染方式 | 实时光栅化 | 路径追踪 |
| 速度 | 快，适合频繁预览和批量短视频 | 慢，取决于采样、光线路径和硬件 |
| 视觉特点 | 风格化、运动图形和常规产品展示性价比高 | 复杂反射、折射、全局光照和写实材质更自然 |
| 常见用途 | 数据视觉、社交媒体动画、快速迭代 | 写实产品镜头、建筑、影视级三维镜头 |

应先用 Eevee 验证镜头、节奏和构图。只有视觉目标确实依赖路径追踪时再切换 Cycles，并在固定硬件上测试单帧耗时和显存峰值。

## 与 HyperFrames 配合

本仓库以二维信息视频为主，推荐采用混合工作流：

1. Blender Python 生成三维镜头或透明背景帧序列。
2. FFmpeg 将帧序列编码为中间视频。
3. HyperFrames 负责标题、图表、字幕、旁白、转场和多语言版本。
4. 在 HyperFrames 中将 Blender 视频作为静音 `<video>` 轨道接入，音频继续使用独立 `<audio>` 轨道。

这种分工让 Blender 专注于三维渲染，让 HTML/CSS 保持文字和数据排版的高迭代速度。若整条视频都由三维镜头构成，也可以完全在 Blender 的 Video Sequence Editor 或 Compositor 中完成，但需要自行维护字幕、音频、版本化和质量检查流程。

## 批处理与 CI

建议在 CI 或渲染节点中：

- 固定 Blender 4.5 LTS 的具体补丁版本和系统镜像；
- 使用 `--background`，避免依赖桌面环境；
- 使用 `--python-exit-code 1`，让脚本异常明确导致任务失败；
- 记录 Blender 版本、GPU 驱动、渲染引擎、采样数和编码命令；
- 把输出写入显式目录，不依赖操作者的用户配置；
- 先渲染少量代表帧做冒烟测试，再启动完整动画；
- 对不可信 `.blend` 文件禁用自动执行脚本，避免直接运行未知驱动器或内嵌代码。

渲染单帧进行检查：

```bash
blender --background project.blend --render-output renders/smoke/frame_##### --render-frame 75
```

渲染指定范围：

```bash
blender --background project.blend --frame-start 1 --frame-end 150 --render-anim
```

Blender 命令行参数按出现顺序执行。载入 `.blend` 文件可能覆盖之前设置的输出选项，因此应先写文件名，再写覆盖参数，并把 `--render-frame` 或 `--render-anim` 放在最后。

## 常见问题

### 后台渲染结果与 UI 不一致

检查活动相机、渲染引擎、View Layer、色彩管理和依赖资源路径。不要依赖未保存的 UI 状态；正式渲染前保存 `.blend`，并让脚本显式设置关键参数。

### 材质在另一台机器丢失

纹理可能引用了本机绝对路径。使用项目内相对路径，或在交付前通过 Blender 的资源打包功能把外部资源写入 `.blend`。

### 动画闪烁或结果不可复现

固定随机种子、模拟缓存、Blender 版本、渲染设备和采样参数。涉及物理模拟时先 bake 缓存，再分布式渲染帧序列。

### 直接渲染 MP4 中断后文件损坏

改用帧序列。完整帧可保留并续渲，最后再执行一次 FFmpeg 编码。

### 渲染速度过慢

先降低分辨率百分比、采样数、反弹次数和高成本效果；用少量代表帧定位瓶颈。不要在没有基准数据的情况下直接增加并发，因为显存、纹理加载和编码也可能成为瓶颈。

## 交付检查

- [ ] 固定 Blender 版本并记录渲染设备。
- [ ] 脚本能从干净场景重复构建项目。
- [ ] 帧范围、FPS、分辨率和目标时长一致。
- [ ] 相机、灯光、材质和资源路径在后台模式中可用。
- [ ] 随机过程与模拟已固定种子或 bake。
- [ ] 代表帧通过构图、曝光、锯齿和文字安全区检查。
- [ ] 长任务使用可续渲的帧序列。
- [ ] FFmpeg 编码参数满足发布平台要求。
- [ ] 最终视频完成时长、音画同步和首尾帧检查。

## 官方资料

- [Blender Python API](https://docs.blender.org/api/current/)
- [Blender 4.5 LTS Manual](https://docs.blender.org/manual/en/latest/)
- [Command Line Arguments](https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html)
- [Command Line Rendering](https://docs.blender.org/manual/en/latest/advanced/command_line/render.html)
- [Rendering Animations](https://docs.blender.org/manual/en/latest/render/output/animation.html)
- [Output Properties](https://docs.blender.org/manual/en/latest/render/output/properties/output.html)
- [Scripting & Security](https://docs.blender.org/manual/en/latest/advanced/scripting/security.html)
