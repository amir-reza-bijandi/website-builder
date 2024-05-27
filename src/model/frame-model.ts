import CanvasBaseElement from './base-model';
import type CanvasElementConfig from '@/type/element-config-type';
import type { CanvasFrameElementOverflow } from '@/type/element-property-types';

export default class CanvasFrameElement extends CanvasBaseElement<'FRAME'> {
  readonly overflow: CanvasFrameElementOverflow;
  constructor({
    id,
    parentId,
    display,
    position,
    constraint,
    layer,
    order,
    overflow = {
      x: 'VISIBLE',
      y: 'VISIBLE',
    },
  }: CanvasElementConfig<'FRAME'>) {
    super('FRAME', id, parentId, display, position, constraint, layer, order);
    this.overflow = overflow;
  }
}
