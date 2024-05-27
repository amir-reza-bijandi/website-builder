import CanvasTextElement from '@/model/text-model';

type TextProps = {
  element: CanvasTextElement;
};

export default function Text({ element }: TextProps) {
  return <div className='h-full border'>This is a Text!</div>;
}
