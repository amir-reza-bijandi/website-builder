export type Position = {
  x: number;
  y: number;
};

export type Direction = 'NW' | 'NE' | 'SE' | 'SW' | 'N' | 'E' | 'S' | 'W';

export type AbsoluteRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
