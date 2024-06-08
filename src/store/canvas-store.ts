import type {
  CanvasStoreView,
  CanvasStoreToolbox,
  CanvasStoreElement,
} from '@/type/canvas-store-types';
import { create } from 'zustand';

type CanvasStore = {
  view: CanvasStoreView;
  layer: number;
  toolbox: CanvasStoreToolbox;
  isPanning: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isFocused: boolean;
  isCrossLayerSelectionAllowed: boolean;
  elementList: CanvasStoreElement[];
  selectedElementIdList: string[];
  hoverTargetId: string;
  isSelectionVisible: boolean;
  setView: (view: Partial<CanvasStoreView>) => void;
  setLayer: (layerIndex: number) => void;
  setToolbox: (toolbox: Partial<CanvasStoreToolbox>) => void;
  setPanning: (isPanning: boolean) => void;
  setMoving: (isMoving: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setFocus: (isFocused: boolean) => void;
  setCrossLayerSelection: (isCrossLayerSelectionAllowed: boolean) => void;
  addElement: (element: CanvasStoreElement) => void;
  updateElement: (...updatedElements: CanvasStoreElement[]) => void;
  deleteElement: (...elementIdList: string[]) => void;
  setSelectedElementIdList: (
    idList: string[],
    isSelectionVisible?: boolean,
  ) => void;
  setHoverTargetId: (targetId: string) => void;
  setSelectionVisible: (visible: boolean) => void;
};

const useCanvasStore = create<CanvasStore>((set) => ({
  view: {
    zoomFactor: 1,
    zoomState: 'NORMAL',
    offsetX: 0,
    offsetY: 0,
  },
  layer: 0,
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
  isFocused: true,
  isCrossLayerSelectionAllowed: false,
  hoverTargetId: '',
  setView({ zoomFactor, zoomState, offsetX, offsetY }) {
    set((store) => ({
      view: {
        zoomFactor: zoomFactor ?? store.view.zoomFactor,
        zoomState: zoomState ?? store.view.zoomState,
        offsetX: offsetX ?? store.view.offsetX,
        offsetY: offsetY ?? store.view.offsetY,
      },
    }));
  },
  setLayer(layerIndex) {
    set({ layer: layerIndex });
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
  setFocus(isFocused) {
    set({ isFocused });
  },
  setCrossLayerSelection(isCrossLayerSelectionAllowed) {
    set({ isCrossLayerSelectionAllowed });
  },
  addElement(element) {
    set((store) => ({
      elementList: [...store.elementList, element],
    }));
  },
  updateElement(...updatedElements) {
    set((store) => ({
      elementList: store.elementList.map((element) => {
        const updatedElement = updatedElements.find(
          (updatedElement) => updatedElement.id === element.id,
        );
        if (updatedElement) {
          return updatedElement;
        }
        return element;
      }),
    }));
  },
  deleteElement(...elementIdList) {
    set((store) => ({
      elementList: store.elementList.filter(
        (element) =>
          !elementIdList.some(
            (elementToRemoveId) =>
              element.id === elementToRemoveId ||
              // Remove child child elements as well
              element.parentId === elementToRemoveId,
          ),
      ),
      // Remove elements from selection
      selectedElementIdList: store.selectedElementIdList.filter(
        (selectedElementId) =>
          !elementIdList.some(
            (elementToRemoveId) => elementToRemoveId === selectedElementId,
          ),
      ),
      // Reseting the layer
      layer: 0,
    }));
  },
  setSelectedElementIdList(idList, isSelectionVisible) {
    set((store) => ({
      selectedElementIdList: idList,
      isSelectionVisible: isSelectionVisible || store.isSelectionVisible,
    }));
  },
  setHoverTargetId(targetId) {
    set({ hoverTargetId: targetId });
  },
  setSelectionVisible(visible) {
    set({ isSelectionVisible: visible });
  },
}));

export default useCanvasStore;
