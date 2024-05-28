import type CanvasElementConfig from '@/type/element-config-type';
import type { CanvasElementType } from '@/type/element-property-types';

export default function validateElementConfig<T extends CanvasElementType>({
  position,
  width,
  height,
}: CanvasElementConfig<T>) {
  try {
    if (position?.mode === 'ABSOLUTE') {
      if (typeof width === 'number' && typeof height === 'number') {
        throw new Error(
          'width and height cannot be number when position mode is ABSOLUTE',
        );
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
