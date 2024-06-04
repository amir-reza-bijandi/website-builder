import useCanvasStore from '@/store/canvas-store';
import CanvasElementWrapper from './element-wrapper';

export default function CanvasRender() {
  const elementList = useCanvasStore((store) => store.elementList);
  return elementList.map((element) => (
    <CanvasElementWrapper key={element.id} element={element} />
  ));
}
