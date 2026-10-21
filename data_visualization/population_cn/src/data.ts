/**
 * China births. National: NBS statistical communiqués (2020–2024) and the post-census
 * revision NBS announced for 2016 (1,883万). Provinces, 2024: provincial statistical
 * communiqués and 《中国统计年鉴2025》 as compiled by Yicai (第一财经, 2025-10-26).
 * Unit: 万人. See README for links.
 */

/** National births; 2017–2019 are omitted because only pre-revision figures are published. */
export const NATIONAL: {year: number; births: number}[] = [
  {year: 2016, births: 1883},
  {year: 2020, births: 1202},
  {year: 2021, births: 1062},
  {year: 2022, births: 956},
  {year: 2023, births: 902},
  {year: 2024, births: 954},
];

/** Provinces with the most births in 2024; `change` is vs 2023 where published. */
export const PROVINCES_2024: {name: string; births: number; change?: number; color: string}[] = [
  {name: '广东', births: 113, change: 10, color: '#e6194b'},
  {name: '河南', births: 76.2, change: 6.7, color: '#3cb44b'},
  {name: '山东', births: 64.9, change: 3.9, color: '#4363d8'},
  {name: '四川', births: 53.6, color: '#f58231'},
  {name: '河北', births: 43.6, color: '#911eb4'},
  {name: '江苏', births: 42.6, change: 1.7, color: '#42d4f4'},
];

export const FACTS = {
  guangdongShare: 11.8,
  guangdongStreak: 7,
  over30Provinces: 14,
  over30Births: 696.8,
  over30Share: 73,
};
