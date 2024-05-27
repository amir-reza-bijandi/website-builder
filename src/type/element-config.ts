import CanvasBaseElement from '@/class/base';
import { CanvasElementType, ElementSpecificProperty } from './element-property';

type CanvasElementConfig<T extends CanvasElementType> =
  T extends CanvasElementType
    ? Partial<Omit<CanvasBaseElement<T>, 'type'>> & ElementSpecificProperty[T]
    : never;

export default CanvasElementConfig;
