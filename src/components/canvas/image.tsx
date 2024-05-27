import CanvasImageElement from '@/class/image';
import generateStyle from '@/lib/canvas/generateStyle';

type ImageProps = {
  element: CanvasImageElement;
};

export default function Image({ element }: ImageProps) {
  return (
    <div
      id={element.id}
      style={generateStyle(element)}
      className='rounded border'
    >
      This is an Image!
    </div>
  );
}
