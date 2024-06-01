import type {
  CanvasStoreView,
  CanvasStoreToolbox,
  CanvasStoreElement,
} from '@/type/canvas-store-types';
import { create } from 'zustand';

type CanvasStore = {
  view: CanvasStoreView;
  toolbox: CanvasStoreToolbox;
  isPanning: boolean;
  isMoving: boolean;
  isResizing: boolean;
  elementList: CanvasStoreElement[];
  selectedElementIdList: string[];
  isSelectionVisible: boolean;
  setView: (view: Partial<CanvasStoreView>) => void;
  setToolbox: (toolbox: Partial<CanvasStoreToolbox>) => void;
  setPanning: (isPanning: boolean) => void;
  setMoving: (isMoving: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  addElement: (element: CanvasStoreElement) => void;
  updateElement: (...updatedElements: CanvasStoreElement[]) => void;
  setSelectedElementIdList: (
    idList: string[],
    isSelectionVisible?: boolean,
  ) => void;
  setSelectionVisible: (visible: boolean) => void;
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
  elementList: [],
  selectedElementIdList: [],
  isSelectionVisible: false,
  isPanning: false,
  isResizing: false,
  isMoving: false,
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
  setPanning(isPanning) {
    set({ isPanning });
  },
  setMoving(isMoving) {
    set({ isMoving });
  },
  setResizing(isResizing) {
    set({ isResizing });
  },
  addElement(element) {
    set((store) => ({
      elementList: [...store.elementList, element],
    }));
  },
  updateElement(...updatedElements) {
    set((store) => {
      return {
        elementList: store.elementList.map((element) => {
          const updatedElement = updatedElements.find(
            (updatedElement) => updatedElement.id === element.id,
          );
          if (updatedElement) {
            return updatedElement;
          }
          return element;
        }),
      };
    });
  },
  setSelectedElementIdList(idList, isSelectionVisible) {
    set((store) => ({
      selectedElementIdList: idList,
      isSelectionVisible: isSelectionVisible || store.isSelectionVisible,
    }));
  },
  setSelectionVisible(visible) {
    set({ isSelectionVisible: visible });
  },
}));

export default useCanvasStore;
