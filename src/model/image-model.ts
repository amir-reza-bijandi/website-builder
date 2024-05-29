import CanvasBaseModel from './base-model';
import type CanvasElementConfig from '@/type/element-config-type';

export default class CanvasImageModel extends CanvasBaseModel<'IMAGE'> {
  readonly src: string;
  constructor({
    id,
    parentId,
    width,
    height,
    position,
    constraint,
    layer,
    order,
    src = '',
  }: CanvasElementConfig<'IMAGE'>) {
    super(
      'IMAGE',
      id,
      parentId,
      width,
      height,
      position,
      constraint,
      layer,
      order,
    );
    this.src = src;
  }
}
