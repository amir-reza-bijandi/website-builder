import CanvasBaseModel from '@/model/base-model';
import type {
  CanvasElementType,
  ElementSpecificProperty,
} from './element-property-types';

type CanvasElementConfig<T extends CanvasElementType> =
  T extends CanvasElementType
    ? Partial<Omit<CanvasBaseModel<T>, 'type'>> & ElementSpecificProperty[T]
    : never;

export default CanvasElementConfig;
