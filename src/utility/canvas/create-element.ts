import CanvasFrameElement from '@/model/frame-model';
import CanvasImageElement from '@/model/image-model';
import CanvasTextElement from '@/model/text-model';

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
      return new CanvasTextElement(config);
    case 'IMAGE':
      return new CanvasImageElement(config);
    default:
      return new CanvasFrameElement(config);
  }
}
