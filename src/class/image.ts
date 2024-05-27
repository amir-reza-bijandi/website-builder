import CanvasElementConfig from '@/type/element-config';
import CanvasBaseElement from './base';

export default class CanvasImageElement extends CanvasBaseElement<'IMAGE'> {
  readonly src: string;
  constructor({
    id,
    parentId,
    display,
    position,
    constraint,
    layer,
    order,
    src,
  }: CanvasElementConfig<'IMAGE'>) {
    super('IMAGE', id, parentId, display, position, constraint, layer, order);
    this.src = src;
  }
}
