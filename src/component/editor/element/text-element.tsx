import CanvasTextModel from '@/model/text-model';
import Wrapper from '../wrapper';

type TextProps = {
  element: CanvasTextModel;
};

export default function Text({ element }: TextProps) {
  return (
    <Wrapper element={element}>
      <div className='pointer-events-none h-full border'>This is a Text!</div>
    </Wrapper>
  );
}
