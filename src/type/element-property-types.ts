/* Base */
export type CanvasElementType = 'FRAME' | 'TEXT' | 'IMAGE';

export type CanvasElementSpacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CanvasElementPositioning = {
  top: number | 'AUTO';
  right: number | 'AUTO';
  bottom: number | 'AUTO';
  left: number | 'AUTO';
};
export type CanvasElementDisplayBase = {
  width: number | 'AUTO';
  height: number | 'AUTO';
};
export type CanvasElementDisplayBlock = { mode: 'BLOCK' };
export type CanvasElementDisplayFlex = {
  mode: 'FLEX';
  direction: 'ROW' | 'COLUMN';
  justify:
    | 'START'
    | 'END'
    | 'CENTER'
    | 'SPACE_BETWEEN'
    | 'SPACE_AROUND'
    | 'SPACE_EVENLY';
  align: 'START' | 'END' | 'CENTER' | 'STRETCH';
  wrap: 'NOWRAP' | 'WRAP' | 'WRAP_REVERSE';
  gap: number;
  margin: CanvasElementSpacing;
  padding: CanvasElementSpacing;
};
export type CanvasElementDisplay = CanvasElementDisplayBase &
  (CanvasElementDisplayFlex | CanvasElementDisplayBlock);

export type CanvasElementPositionRelative = { mode: 'RELATIVE' };
export type CanvasElementPositionAbsolute = {
  mode: 'ABSOLUTE';
} & CanvasElementPositioning;
export type CanvasElementPosition =
  | CanvasElementPositionRelative
  | CanvasElementPositionAbsolute;

export type CanvasElementConstraintMode =
  | 'TOP'
  | 'BOTTOM'
  | 'LEFT'
  | 'RIGHT'
  | 'LEFT_AND_RIGHT'
  | 'TOP_AND_BOTTOM';

export type CanvasElementConstraint = {
  vertical: CanvasElementConstraintMode;
  horizontal: CanvasElementConstraintMode;
};

/* Specific */
export type CanvasFrameElementOverflowMode =
  | 'NONE'
  | 'HIDDEN'
  | 'SCROLL'
  | 'AUTO'
  | 'VISIBLE';

export type CanvasFrameElementOverflow = {
  x: CanvasFrameElementOverflowMode;
  y: CanvasFrameElementOverflowMode;
};

export type ElementSpecificProperty = {
  FRAME: {
    overflow?: CanvasFrameElementOverflow;
  };
  IMAGE: {
    src?: string;
  };
  TEXT: {
    text?: string;
  };
};
