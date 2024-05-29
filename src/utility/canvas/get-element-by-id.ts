import useCanvasStore from '@/store/canvas-store';

export default function getElementById(elementId: string) {
  return useCanvasStore
    .getState()
    .elementList.find((element) => element.id === elementId);
}
