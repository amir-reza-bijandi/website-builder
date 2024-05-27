import useCanvasStore from '@/store/canvas-store';
import SelectWrapper from './select-wrapper';

export default function Render() {
  const { elementList } = useCanvasStore();
  return elementList.map((element) => (
    <SelectWrapper key={element.id} element={element} />
  ));
}
