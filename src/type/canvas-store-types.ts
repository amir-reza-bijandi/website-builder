import CanvasFrameModel from '@/model/frame-model';
import CanvasImageModel from '@/model/image-model';
import CanvasTextModel from '@/model/text-model';

import type { CanvasElementType } from '@/type/element-property-types';

export type CanvasStoreAction = 'ADD' | 'SELECT' | 'PAN';
export type CanvasStoreTool = CanvasElementType | null | undefined;
export type CanvasStoreToolbox = {
  action: CanvasStoreAction;
  tool: CanvasStoreTool;
};

export type CanvasStoreView = {
  zoomLevel: number;
  zoomState: 'MAX' | 'MIN' | 'NORMAL';
  offsetX: number;
  offsetY: number;
};

export type CanvasStoreElement =
  | CanvasFrameModel
  | CanvasTextModel
  | CanvasImageModel;
