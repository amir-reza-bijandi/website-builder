import type { ElementStoreElement } from '@/store/element-store';
import type { CanvasFrameElementDisplay } from '@/type/element-property-types';

export default function generateStyle(
  element: ElementStoreElement,
): React.CSSProperties {
  const { position, width, height } = element;
  let display = {} as CanvasFrameElementDisplay;
  if ('display' in element) {
    display = element.display;
  }
  return {
    display: displayMap[display.mode],
    position: positionMap[position.mode],
    width: width === 'AUTO' ? 'auto' : width,
    height: height === 'AUTO' ? 'auto' : height,
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
