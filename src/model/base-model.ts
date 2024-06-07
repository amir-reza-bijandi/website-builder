import { nanoid } from 'nanoid';
import type {
  CanvasElementType,
  CanvasElementPosition,
  CanvasElementConstraint,
} from '@/type/element-property-types';

export default abstract class CanvasBaseModel<T extends CanvasElementType> {
  constructor(
    readonly type: T,
    readonly id: string = `${type}-${nanoid()}`,
    readonly parentId: string = '',
    readonly displayName: string = type
      .toLowerCase()
      .split('')
      .map((char, index) => (index === 0 ? char.toUpperCase() : char))
      .join(''),
    readonly width: number | 'AUTO' = 'AUTO',
    readonly height: number | 'AUTO' = 'AUTO',
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
    this.width = width;
    this.height = height;
    this.position = position;
    this.constraint = constraint;
    this.layer = layer;
    this.order = order;
  }
}
