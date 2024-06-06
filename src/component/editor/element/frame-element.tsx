import CanvasFrameModel from '@/model/frame-model';
import Wrapper from '../wrapper';
import Render from '../render';

type FrameProps = {
  element: CanvasFrameModel;
};

export default function Frame({ element }: FrameProps) {
  return (
    <Wrapper element={element}>
      <div className='pointer-events-none relative h-full border'>
        This is a Frame!
        <Render elementId={element.id} layer={element.layer + 1} />
      </div>
    </Wrapper>
  );
}
