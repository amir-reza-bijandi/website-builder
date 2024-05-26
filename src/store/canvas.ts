import { create } from 'zustand';

export type CanvasAction = 'ADD' | 'SELECT' | 'PAN';
export type CanvasTool = 'FRAME' | 'TEXT' | 'IMAGE' | null | undefined;
export type CanvasToolbox = {
  action: CanvasAction;
  tool: CanvasTool;
};

export type CanvasView = {
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
};

type CanvasStore = {
  view: CanvasView;
  toolbox: CanvasToolbox;
  setView: (view: Partial<CanvasView>) => void;
  setToolbox: (toolbox: Partial<CanvasToolbox>) => void;
};

const useCanvasStore = create<CanvasStore>((set) => ({
  view: {
    zoomFactor: 1,
    offsetX: 0,
    offsetY: 0,
  },
  toolbox: {
    action: 'SELECT',
    tool: null,
  },
  setView({ zoomFactor, offsetX, offsetY }) {
    set((store) => ({
      view: {
        zoomFactor: zoomFactor ?? store.view.zoomFactor,
        offsetX: offsetX ?? store.view.offsetX,
        offsetY: offsetY ?? store.view.offsetY,
      },
    }));
  },
  setToolbox({ action, tool }) {
    set((store) => ({
      toolbox: {
        action: action ?? store.toolbox.action,
        tool: tool ?? null,
      },
    }));
  },
}));

export default useCanvasStore;
