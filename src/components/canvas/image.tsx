import CanvasImageElement from '@/class/image';

type ImageProps = {
  element: CanvasImageElement;
};

export default function Image({ element }: ImageProps) {
  return <div className='h-full border'>This is an Image!</div>;
}
