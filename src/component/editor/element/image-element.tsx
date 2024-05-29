import CanvasImageModel from '@/model/image-model';

type ImageProps = {
  element: CanvasImageModel;
};

export default function Image({ element }: ImageProps) {
  return <div className='h-full border'>This is an Image!</div>;
}
