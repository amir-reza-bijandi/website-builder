import { create } from 'zustand';
import CONFIG from '../config';

type UIStore = {
  uiScale: number;
  isLeftPanelVisible: boolean;
  isRightPanelVisible: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setUiScale: (scale: number) => void;
};

const useUIStore = create<UIStore>((set) => ({
  uiScale: localStorage.getItem('uiScale')
    ? Number(localStorage.getItem('uiScale'))
    : CONFIG.UI_SCALE,
  isLeftPanelVisible: localStorage.getItem('isLeftPanelVisible')
    ? Boolean(localStorage.getItem('isLeftPanelVisible'))
    : CONFIG.IS_LEFT_PANEL_VISIBLE,
  isRightPanelVisible: localStorage.getItem('isRightPanelVisible')
    ? Boolean(localStorage.getItem('isRightPanelVisible'))
    : CONFIG.IS_RIGHT_PANEL_VISIBLE,
  toggleLeftPanel() {
    set((store) => {
      const newState = !store.isLeftPanelVisible;
      localStorage.setItem('isLeftPanelVisible', String(newState));
      return { isLeftPanelVisible: newState };
    });
  },
  toggleRightPanel() {
    set((store) => {
      const newState = !store.isRightPanelVisible;
      localStorage.setItem('isRightPanelVisible', String(newState));
      return { isRightPanelVisible: newState };
    });
  },
  setUiScale(scale) {
    if (scale > CONFIG.MAX_UI_SCALE || scale < CONFIG.MIN_UI_SCALE) return;
    localStorage.setItem('uiScale', String(scale));
    set({ uiScale: scale });
  },
}));

export default useUIStore;
