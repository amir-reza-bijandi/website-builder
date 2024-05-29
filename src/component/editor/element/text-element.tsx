import CanvasTextModel from '@/model/text-model';

type TextProps = {
  element: CanvasTextModel;
};

export default function Text({ element }: TextProps) {
  return <div className='h-full border'>This is a Text!</div>;
}
