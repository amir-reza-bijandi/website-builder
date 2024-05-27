import CanvasElementConfig from '@/type/element-config';
import CanvasBaseElement from './base';
import { CanvasFrameElementOverflow } from '@/type/element-property';

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
