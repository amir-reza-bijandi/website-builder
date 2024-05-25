import { create } from 'zustand';

export type View = {
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
};

type CanvasStore = {
  view: View;
  isPanningAllowed: boolean;
  setView: (view: Partial<View>) => void;
  setPanningAllowed: (isPanningAllowed: boolean) => void;
};

const useCanvasStore = create<CanvasStore>((set) => ({
  view: {
    zoomFactor: 1,
    offsetX: 0,
    offsetY: 0,
  },
  isPanningAllowed: false,
  setView({ zoomFactor, offsetX, offsetY }) {
    set((store) => ({
      view: {
        zoomFactor: zoomFactor ?? store.view.zoomFactor,
        offsetX: offsetX ?? store.view.offsetX,
        offsetY: offsetY ?? store.view.offsetY,
      },
    }));
  },
  setPanningAllowed(isPanningAllowed) {
    set({ isPanningAllowed });
  },
}));

export default useCanvasStore;
