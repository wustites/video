// Illustrative anchor series stitched from publicly reported figures.
// Intended to show trends, not to replace official datasets.

export type Metric = {
  id: string;
  label: string;
  unit: string;
  color: string;
  min: number;
  max: number;
  values: number[];
  tickLabels: string[];
  formatter?: (value: number) => string;
};

export type EventChipData = {
  date: string;
  title: string;
  note: string;
  color: string;
};

export const SOURCES = [
  'Electoral Commission',
  'UK Parliament',
  'House of Commons Library',
  'NatCen / Ashcroft polls',
];

const pct = (value: number) => `${value.toFixed(1)}%`;

// Average "Leave" share in published national polls, Sep 2015 → Jun 2016.
export const POLLS: Metric = {
  id: 'polls',
  label: 'Leave share in national polls',
  unit: 'average of published polls',
  color: '#ff6b4a',
  min: 44,
  max: 56,
  values: [48, 49, 47, 50, 48, 51, 49, 52, 51, 51.5, 52, 53],
  tickLabels: ['Sep 15', 'Dec 15', 'Mar 16', 'Jun 16'],
  formatter: pct,
};

// Turnout and Leave share by age band (post-referendum estimates).
export const AGE_REMAIN: Metric = {
  id: 'ageRemain',
  label: 'Remain vote share by age',
  unit: '% voting Remain',
  color: '#5ea7ff',
  min: 30,
  max: 75,
  values: [71, 62, 52, 44, 41, 36],
  tickLabels: ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
  formatter: pct,
};

// Leave vote share by constituent nation.
export type NationResult = {
  name: string;
  leave: number;
  remain: number;
  color: string;
};

export const NATIONS: NationResult[] = [
  {name: 'England', leave: 53.4, remain: 46.6, color: '#ff6b4a'},
  {name: 'Wales', leave: 52.5, remain: 47.5, color: '#f6c85f'},
  {name: 'N. Ireland', leave: 44.2, remain: 55.8, color: '#62d7c2'},
  {name: 'Scotland', leave: 38.0, remain: 62.0, color: '#5ea7ff'},
];

// Number of days from the vote to key milestones on the exit timetable.
export const TIMELINE_DAYS: {label: string; days: number; color: string}[] = [
  {label: 'Vote', days: 0, color: '#ff6b4a'},
  {label: 'Article 50', days: 282, color: '#f6c85f'},
  {label: 'Exit day', days: 1317, color: '#c29bff'},
  {label: 'Transition ends', days: 1655, color: '#62d7c2'},
];

export const EVENTS: EventChipData[] = [
  {
    date: '2015',
    title: 'Referendum pledged',
    note: 'Conservative manifesto promises an in–out vote; the European Union Referendum Act passes in December.',
    color: '#f6c85f',
  },
  {
    date: 'Feb 2016',
    title: 'Renegotiation deal',
    note: 'Cameron returns from Brussels with a reform package, then sets the date for 23 June.',
    color: '#62d7c2',
  },
  {
    date: 'Jun 2016',
    title: 'The vote',
    note: 'Leave 51.9% – Remain 48.1% on a 72.2% turnout. Cameron resigns the next morning.',
    color: '#ff6b4a',
  },
  {
    date: 'Mar 2017',
    title: 'Article 50 triggered',
    note: 'A two-year clock starts. May calls a snap election and loses her majority.',
    color: '#c29bff',
  },
  {
    date: '2018–19',
    title: 'Deal rejected three times',
    note: 'The Commons rejects the withdrawal agreement by record margins; May resigns.',
    color: '#5ea7ff',
  },
  {
    date: 'Oct 2019',
    title: 'A new deal, a new deadlock',
    note: 'Johnson rewrites the backstop; Parliament forces an extension; a general election is called.',
    color: '#f6c85f',
  },
  {
    date: 'Dec 2019',
    title: '"Get Brexit done"',
    note: 'Conservatives win an 80-seat majority. The withdrawal agreement clears Parliament in January.',
    color: '#62d7c2',
  },
  {
    date: '31 Jan 2020',
    title: 'Brexit day',
    note: 'The UK leaves the EU after 47 years, entering an 11-month transition.',
    color: '#ff6b4a',
  },
  {
    date: '24 Dec 2020',
    title: 'Trade deal struck',
    note: 'The EU–UK Trade and Cooperation Agreement is agreed days before the transition deadline.',
    color: '#5ea7ff',
  },
];
