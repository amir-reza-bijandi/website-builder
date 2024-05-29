import CanvasFrameModel from '@/model/frame-model';

type FrameProps = {
  element: CanvasFrameModel;
};

export default function Frame({ element }: FrameProps) {
  return <div className='h-full border'>This is a Frame!</div>;
}
