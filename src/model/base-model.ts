import { nanoid } from 'nanoid';
import CONFIG from '@/config';
import type {
  CanvasElementType,
  CanvasElementDisplay,
  CanvasElementPosition,
  CanvasElementConstraint,
} from '@/type/element-property-types';

export default abstract class CanvasBaseElement<T extends CanvasElementType> {
  constructor(
    readonly type: T,
    readonly id: string = `${type}-${nanoid()}`,
    readonly parentId: string = '',
    readonly display: CanvasElementDisplay = {
      mode: 'BLOCK',
      width: CONFIG.DEFAULT_ELEMENT_WIDTH,
      height: CONFIG.DEFAULT_ELEMENT_HEIGHT,
    },
    readonly position: CanvasElementPosition = {
      mode: 'ABSOLUTE',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    readonly constraint: CanvasElementConstraint = {
      vertical: 'TOP',
      horizontal: 'LEFT',
    },
    readonly layer: number = 0,
    readonly order: number = 0,
  ) {
    this.type = type;
    this.id = id;
    this.parentId = parentId;
    this.display = display;
    this.position = position;
    this.constraint = constraint;
    this.layer = layer;
    this.order = order;
  }
}
