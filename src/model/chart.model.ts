
export interface SimpleDataModel {
  name: string;
  value: string;
  color?: string;
}

export interface RaceBarDataModel {
  name: string;
  value: number;
  year: number;
  lastValue: number;
  rank: number;
  colour?: string;
}

export interface LegendValuesModel {
  textValue: string;
  colorValue?: string;
  image?: string;
  imageWidth?: string;
  imageHeight?: string
}

export interface DivergingBarModel {
  position: number,
  name: string,
  value: number,
  color?: string
}

export interface GaugeModel {
  minValue: number,
  maxValue: number,
  value: number,
  pointerWidth?: number,
  ringWidth?: number,
  transitionMs?: number,
  colors?: any
}

export interface LineChartModel {
  label: string;
  data: any[];
  color: string;
  legend: string;
}

export interface GroupeLabales {
  name: string;
  color: string;
}
