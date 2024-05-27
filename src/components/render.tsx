import useCanvasStore from '@/store/canvas';
import Frame from './canvas/frame';
import Text from './canvas/text';
import Image from './canvas/image';

export default function Render() {
  const { elementList } = useCanvasStore();
  return elementList.map((element) => {
    switch (element.type) {
      case 'FRAME':
        return <Frame key={element.id} element={element} />;
      case 'TEXT':
        return <Text key={element.id} element={element} />;
      case 'IMAGE':
        return <Image key={element.id} element={element} />;
    }
  });
}
