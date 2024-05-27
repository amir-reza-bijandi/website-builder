import CanvasFrameElement from '@/class/frame';

type FrameProps = {
  element: CanvasFrameElement;
};

export default function Frame({ element }: FrameProps) {
  return <div className='h-full border'>This is a Frame!</div>;
}
