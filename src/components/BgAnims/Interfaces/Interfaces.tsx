//Random Paths
export interface RandomPathsPoint {
  x: number;
  y: number;
}
export interface RandomPathsItem {
  id: string;
  points: RandomPathsPoint[];
  segmentsLength: number[];
  segmentsPrefix: number[];
  totalPathLength: number;
  createdAt: number;
  drawDuration: number;
  eraseDuration: number;
  lineWidth: number;
  strokeStyle: string;
}

export interface RandomPathsProps {
  baseInterval: number;
  animationDuration: number;
  pathSegments: number;
  maxActive?: number;
  lengthsAmp?: { min: number; max: number };
  strokeColor: string;
  strokeWidth: number;
  advancedConfig?: RandomPathsAdvCfg;
  freeze: boolean;
}

export interface RandomPathsAdvCfg {
  targetFrameBudget?: number;
  avgFrameMsAlpha?: number;
  drawEveryNThresholds?: number[];
  drawEveryNValues?: number[];
  spawnMultiplierValues?: number[];
}

//Matrix
export interface MatrixColumnItem {
  id: string;
  x: number;
  y: number;
  speed: number;
  fontSize: number;
  chars: number[];
  height: number;
  nextMutateAt: number;
  startAt: number;
  createdAt: number;
}

export interface MatrixTextProps {
  baseInterval: number;
  baseFontSize: number;
  fontSizeAmp?: { min: number; max: number };
  speedRange: { min: number; max: number };
  mutateInterval?: number;
  mutateChancePercent?: number;
  fillColor: string;
  charSet: string[];
  sizeAmps?: {
    length: { min: number; max: number };
    maxColumns: number;
  };
  advancedConfig?: {
    targetFrameBudget: number;
    avgFrameMsAlpha: number;
    drawEveryNThresholds: number[];
    drawEveryNValues: number[];
    spawnMultiplierValues: number[];
  };
  freeze: boolean;
}
