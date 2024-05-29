import CanvasBaseModel from './base-model';
import type CanvasElementConfig from '@/type/element-config-type';

export default class CanvasTextModel extends CanvasBaseModel<'TEXT'> {
  readonly text: string;
  constructor({
    id,
    parentId,
    width,
    height,
    position,
    constraint,
    layer,
    order,
    text = 'Enter you text here',
  }: CanvasElementConfig<'TEXT'>) {
    super(
      'TEXT',
      id,
      parentId,
      width,
      height,
      position,
      constraint,
      layer,
      order,
    );
    this.text = text;
  }
}
