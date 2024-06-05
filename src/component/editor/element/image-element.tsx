import CanvasImageModel from '@/model/image-model';
import Wrapper from '../wrapper';

type ImageProps = {
  element: CanvasImageModel;
};

export default function Image({ element }: ImageProps) {
  return (
    <Wrapper element={element}>
      <div className='h-full border'>This is an Image!</div>
    </Wrapper>
  );
}
