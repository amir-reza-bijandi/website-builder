import type {
  CanvasStoreView,
  CanvasStoreToolbox,
  CanvasStoreElement,
} from '@/type/canvas-store-types';
import { produce } from 'immer';
import { create } from 'zustand';

type CanvasStore = {
  view: CanvasStoreView;
  toolbox: CanvasStoreToolbox;
  elementList: CanvasStoreElement[];
  selectedElementIdList: string[];
  isSelectionVisible: boolean;
  setView: (view: Partial<CanvasStoreView>) => void;
  setToolbox: (toolbox: Partial<CanvasStoreToolbox>) => void;
  addElement: (element: CanvasStoreElement) => void;
  updateElement: (updatedElement: CanvasStoreElement) => void;
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
  addElement(element) {
    set((store) => ({
      elementList: [...store.elementList, element],
    }));
  },
  updateElement(updatedElement) {
    set(
      produce<CanvasStore>((store) => {
        try {
          const index = store.elementList.findIndex(
            (element) => element.id === updatedElement.id,
          );
          if (index === -1) throw new Error('Element not found');
          const oldElement = store.elementList[index];
          const newElement = { ...oldElement, ...updatedElement };
          store.elementList[index] = newElement;
        } catch (error) {
          console.error(error);
        }
      }),
    );
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
