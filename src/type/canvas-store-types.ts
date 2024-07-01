import CanvasFrameModel from '@/model/frame-model';
import CanvasImageModel from '@/model/image-model';
import CanvasTextModel from '@/model/text-model';

export type CanvasStoreElement =
  | CanvasFrameModel
  | CanvasTextModel
  | CanvasImageModel;
