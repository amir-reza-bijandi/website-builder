import CanvasTextElement from '@/class/text';

type TextProps = {
  element: CanvasTextElement;
};

export default function Text({ element }: TextProps) {
  return <div className='h-full border'>This is a Text!</div>;
}
