import CanvasFrameModel from '@/model/frame-model';
import CanvasImageModel from '@/model/image-model';
import CanvasTextModel from '@/model/text-model';

import validateElementConfig from './validate-element-config';

import type CanvasElementConfig from '@/type/element-config-type';
import type { CanvasElementType } from '@/type/element-property-types';

export default function createElement<T extends CanvasElementType>(
  type: T,
  config: CanvasElementConfig<T>,
) {
  const isConfigValid = validateElementConfig(config);
  if (!isConfigValid) return null;
  switch (type) {
    case 'TEXT':
      return new CanvasTextModel(config);
    case 'IMAGE':
      return new CanvasImageModel(config);
    default:
      return new CanvasFrameModel(config);
  }
}
