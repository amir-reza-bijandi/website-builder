import { create } from 'zustand';

type CurrentActionStore = {
  isPanning: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isFocused: boolean;

  setPanning: (isPanning: boolean) => void;
  setMoving: (isMoving: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setFocus: (isFocused: boolean) => void;
};

const useCurrentActionStore = create<CurrentActionStore>((set) => ({
  isPanning: false,
  isResizing: false,
  isMoving: false,
  isFocused: true,
  isCrossLayerSelectionAllowed: false,
  hoverTargetId: '',
  setPanning(isPanning) {
    set({ isPanning });
  },
  setMoving(isMoving) {
    set({ isMoving });
  },
  setResizing(isResizing) {
    set({ isResizing });
  },
  setFocus(isFocused) {
    set({ isFocused });
  },
}));

export default useCurrentActionStore;
