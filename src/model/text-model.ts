import CanvasBaseElement from './base-model';
import type CanvasElementConfig from '@/type/element-config-type';

export default class CanvasTextElement extends CanvasBaseElement<'TEXT'> {
  readonly text: string;
  constructor({
    id,
    parentId,
    display,
    position,
    constraint,
    layer,
    order,
    text = 'Enter you text here',
  }: CanvasElementConfig<'TEXT'>) {
    super('TEXT', id, parentId, display, position, constraint, layer, order);
    this.text = text;
  }
}
