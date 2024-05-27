import CanvasFrameElement from '@/model/frame-model';
import CanvasImageElement from '@/model/image-model';
import CanvasTextElement from '@/model/text-model';

import type { CanvasElementType } from '@/type/element-property-types';

export type CanvasAction = 'ADD' | 'SELECT' | 'PAN';
export type CanvasTool = CanvasElementType | null | undefined;
export type CanvasToolbox = {
  action: CanvasAction;
  tool: CanvasTool;
};

export type CanvasView = {
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
};

export type CanvasElement =
  | CanvasFrameElement
  | CanvasTextElement
  | CanvasImageElement;
