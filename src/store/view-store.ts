import { create } from 'zustand';

export type View = {
  zoomLevel: number;
  zoomState: 'MAX' | 'MIN' | 'NORMAL';
  offsetX: number;
  offsetY: number;
};

type ViewStore = View & {
  setView: (view: Partial<View>) => void;
};

const useViewStore = create<ViewStore>((set) => ({
  offsetX: 0,
  offsetY: 0,
  zoomLevel: 1,
  zoomState: 'NORMAL',
  setView({ offsetX, offsetY, zoomLevel, zoomState }) {
    set((store) => ({
      zoomLevel: zoomLevel ?? store.zoomLevel,
      zoomState: zoomState ?? store.zoomState,
      offsetX: offsetX ?? store.offsetX,
      offsetY: offsetY ?? store.offsetY,
    }));
  },
}));

export default useViewStore;
