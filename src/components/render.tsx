import useCanvasStore from '@/store/canvas';
import SelectWrapper from './canvas/select-wrapper';

export default function Render() {
  const { elementList } = useCanvasStore();
  return elementList.map((element) => (
    <SelectWrapper key={element.id} element={element} />
  ));
}
