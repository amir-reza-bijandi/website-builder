import CanvasBaseModel from './base-model';
import type CanvasElementConfig from '@/type/element-config-type';

export default class CanvasImageModel extends CanvasBaseModel<'IMAGE'> {
  readonly src: string;
  constructor({
    id,
    parentId,
    displayName,
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
      displayName,
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
