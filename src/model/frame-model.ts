import CanvasBaseModel from './base-model';
import type CanvasElementConfig from '@/type/element-config-type';
import type {
  CanvasFrameElementOverflow,
  CanvasFrameElementDisplay,
} from '@/type/element-property-types';

export default class CanvasFrameModel extends CanvasBaseModel<'FRAME'> {
  readonly overflow: CanvasFrameElementOverflow;
  readonly display: CanvasFrameElementDisplay;

  constructor({
    id,
    parentId,
    width,
    height,
    position,
    constraint,
    layer,
    order,
    overflow = {
      x: 'VISIBLE',
      y: 'VISIBLE',
    },
    display = {
      mode: 'BLOCK',
    },
  }: CanvasElementConfig<'FRAME'>) {
    super(
      'FRAME',
      id,
      parentId,
      width,
      height,
      position,
      constraint,
      layer,
      order,
    );
    this.overflow = overflow;
    this.display = display;
  }
}
