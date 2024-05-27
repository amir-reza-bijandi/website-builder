import { CanvasElement } from '@/store/canvas';

export default function generateStyle(
  element: CanvasElement,
): React.CSSProperties {
  const { display, position } = element;
  return {
    display: displayMap[display.mode],
    position: positionMap[position.mode],
    width: display.width === 'AUTO' ? 'auto' : display.width,
    height: display.height === 'AUTO' ? 'auto' : display.height,
    ...(position.mode === 'ABSOLUTE'
      ? {
          top: position.top === 'AUTO' ? 'auto' : position.top,
          left: position.left === 'AUTO' ? 'auto' : position.left,
          right: position.right === 'AUTO' ? 'auto' : position.right,
          bottom: position.bottom === 'AUTO' ? 'auto' : position.bottom,
        }
      : {}),
    ...(display.mode === 'FLEX'
      ? {
          flexDirection: flexDirectionMap[display.direction],
          justifyContent: flexJustifyMap[display.justify],
          alignItems: flexAlignMap[display.align],
          flexWrap: flexWrapMap[display.wrap],
          gap: display.gap,
          marginTop: display.margin.top,
          marginRight: display.margin.right,
          marginBottom: display.margin.bottom,
          marginLeft: display.margin.left,
        }
      : {}),
  };
}

// MAP
const positionMap = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative',
} as const;

const displayMap = {
  BLOCK: 'block',
  FLEX: 'flex',
} as const;

const flexDirectionMap = {
  ROW: 'row',
  COLUMN: 'column',
} as const;

const flexJustifyMap = {
  START: 'flex-start',
  CENTER: 'center',
  END: 'flex-end',
  SPACE_BETWEEN: 'space-between',
  SPACE_AROUND: 'space-around',
  SPACE_EVENLY: 'space-evenly',
} as const;

const flexAlignMap = {
  START: 'flex-start',
  CENTER: 'center',
  END: 'flex-end',
  STRETCH: 'stretch',
} as const;

const flexWrapMap = {
  WRAP: 'wrap',
  NOWRAP: 'nowrap',
  WRAP_REVERSE: 'wrap-reverse',
} as const;
