import CanvasTextElement from '@/class/text';
import generateStyle from '@/lib/canvas/generateStyle';

type TextProps = {
  element: CanvasTextElement;
};

export default function Text({ element }: TextProps) {
  return (
    <div
      id={element.id}
      style={generateStyle(element)}
      className='rounded border'
    >
      This is a Text!
    </div>
  );
}
