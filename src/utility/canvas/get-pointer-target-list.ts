import useElementStore from '@/store/element-store';
import { CanvasElementType } from '@/type/element-property-types';

export default function getPointerTargetList(
  pointerX: number,
  pointerY: number,
  elementTypeList?: CanvasElementType[],
) {
  const elementList = useElementStore.getState().elementList;
  return elementList.filter((element) => {
    const elementRect = document
      .getElementById(element.id)
      ?.getBoundingClientRect();
    return elementRect
      ? (elementTypeList && elementTypeList.length
          ? elementTypeList.some((elementType) => element.type === elementType)
          : true) &&
          pointerX >= elementRect.left &&
          pointerX <= elementRect.left + elementRect.width &&
          pointerY >= elementRect.top &&
          pointerY <= elementRect.top + elementRect.height
      : false;
  });
}
