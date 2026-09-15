export type City = {name: string; x: number; y: number};
export type School = {city: string; name: string; type: string; tag: string; desc: string; x: number; y: number};

export const CITIES: City[] = [
  {name:'济南',x:45,y:42},{name:'青岛',x:78,y:38},{name:'淄博',x:57,y:36},{name:'枣庄',x:30,y:74},
  {name:'东营',x:61,y:20},{name:'烟台',x:88,y:18},{name:'潍坊',x:71,y:28},{name:'济宁',x:39,y:61},
  {name:'泰安',x:48,y:54},{name:'威海',x:96,y:24},{name:'日照',x:73,y:63},{name:'临沂',x:61,y:70},
  {name:'德州',x:39,y:19},{name:'聊城',x:28,y:29},{name:'滨州',x:52,y:14},{name:'菏泽',x:18,y:62},
];

export const SCHOOLS: School[] = [
  {city:'济南',name:'山东大学',type:'综合类 · 教育部直属',tag:'学科门类齐全',desc:'基础学科、医学、人文社科与工科交叉布局。',x:45,y:42},
  {city:'青岛',name:'中国海洋大学',type:'海洋特色 · 教育部直属',tag:'海洋科学',desc:'以海洋和水产学科见长，面向海洋事业培养人才。',x:78,y:38},
  {city:'青岛',name:'中国石油大学（华东）',type:'能源特色 · 工科优势',tag:'能源与石化',desc:'地学、能源、化工与工程技术形成特色组合。',x:78,y:38},
  {city:'威海',name:'哈尔滨工业大学（威海）',type:'工科底色 · 校区办学',tag:'先进制造',desc:'关注智能制造、海洋与信息技术等方向。',x:96,y:24},
  {city:'淄博',name:'山东理工大学',type:'工科特色 · 应用导向',tag:'产业实践',desc:'机械、车辆、农业工程与信息技术值得关注。',x:57,y:36},
];
