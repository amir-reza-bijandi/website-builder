import CanvasFrameElement from '@/model/frame-model';
import CanvasImageElement from '@/model/image-model';
import CanvasTextElement from '@/model/text-model';

import type CanvasElementConfig from '@/type/element-config-type';
import type { CanvasElementType } from '@/type/element-property-types';

export default function createElement<T extends CanvasElementType>(
  type: T,
  config: CanvasElementConfig<T>,
) {
  switch (type) {
    case 'TEXT':
      return new CanvasTextElement(config);
    case 'IMAGE':
      return new CanvasImageElement(config);
    default:
      return new CanvasFrameElement(config);
  }
}
