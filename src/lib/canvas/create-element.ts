import CanvasFrameElement from '@/class/frame';
import CanvasImageElement from '@/class/image';
import CanvasTextElement from '@/class/text';
import CanvasElementConfig from '@/type/element-config';
import { CanvasElementType } from '@/type/element-property';

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
