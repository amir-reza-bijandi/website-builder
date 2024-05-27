import CanvasFrameElement from '@/class/frame';
import generateStyle from '@/lib/canvas/generateStyle';

type FrameProps = {
  element: CanvasFrameElement;
};

export default function Frame({ element }: FrameProps) {
  return (
    <div
      id={element.id}
      style={generateStyle(element)}
      className='rounded border'
    >
      This is a Frame!
    </div>
  );
}
