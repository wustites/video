import { YearData } from "../data/population";

export function interpolateData(
  data: YearData[],
  currentYear: number
): { province: string; births: number }[] {
  const years = data.map((d) => d.year).sort((a, b) => a - b);

  if (currentYear <= years[0]) {
    return data.find((d) => d.year === years[0])!.data;
  }

  if (currentYear >= years[years.length - 1]) {
    return data.find((d) => d.year === years[years.length - 1])!.data;
  }

  let prevYear = years[0];
  let nextYear = years[1];

  for (let i = 0; i < years.length - 1; i++) {
    if (currentYear >= years[i] && currentYear <= years[i + 1]) {
      prevYear = years[i];
      nextYear = years[i + 1];
      break;
    }
  }

  const prevData = data.find((d) => d.year === prevYear)!.data;
  const nextData = data.find((d) => d.year === nextYear)!.data;

  const t = (currentYear - prevYear) / (nextYear - prevYear);

  const provinces = [...new Set([...prevData.map((d) => d.province), ...nextData.map((d) => d.province)])];

  return provinces.map((province) => {
    const prevValue = prevData.find((d) => d.province === province)?.births ?? 0;
    const nextValue = nextData.find((d) => d.province === province)?.births ?? 0;
    return {
      province,
      births: Math.round(prevValue + (nextValue - prevValue) * t),
    };
  });
}

export function getTopN(
  data: { province: string; births: number }[],
  n: number
): { province: string; births: number }[] {
  return [...data].sort((a, b) => b.births - a.births).slice(0, n);
}
