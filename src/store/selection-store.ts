import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import getElementById from '@/utility/canvas/get-element-by-id';
import { create } from 'zustand';

// TYPE
type SelectionStore = {
  selectedElementIdList: string[];
  isSelectionVisible: boolean;
  layer: number;
  hoverTargetId: string;
  isCrossLayerSelectionAllowed: boolean;

  setSelectedElementIdList: (
    elementIdList: string[],
    config?: {
      behaviour?: 'ADD' | 'REPLACE' | 'REMOVE';
      isSelectionVisible?: boolean;
      layer?: number;
    },
  ) => void;
  setSelectionVisible: (visible: boolean) => void;
  setLayer: (layer: number) => void;
  setHoverTargetId: (targetId: string) => void;
  setCrossLayerSelection: (isCrossLayerSelectionAllowed: boolean) => void;
};

// STORE
const useSelectionStore = create<SelectionStore>((set) => ({
  selectedElementIdList: [],
  isSelectionVisible: false,
  layer: 0,
  hoverTargetId: '',
  isCrossLayerSelectionAllowed: false,

  setSelectedElementIdList(elementIdList, config) {
    set((store) => {
      const behaviour = config?.behaviour ?? 'REPLACE';
      let newSelectedElementIdList = elementIdList;

      if (behaviour === 'ADD') {
        newSelectedElementIdList = [
          ...store.selectedElementIdList,
          ...elementIdList,
        ];
      }

      // Remove duplicates
      newSelectedElementIdList = [...new Set(newSelectedElementIdList)];

      // Descendents that are passed to be selected
      const descendentIdList = newSelectedElementIdList
        .map((elementId) => getDescendentIdList(elementId))
        .flat();

      // Filter out descendent elements
      newSelectedElementIdList = newSelectedElementIdList.filter(
        (elementId) => !descendentIdList.includes(elementId),
      );

      // Ancestors that are passed to be selected
      const ancestorIdList = newSelectedElementIdList
        .map((elementId) => getAncestorIdList(elementId))
        .flat();

      // Filter out ancestor elements
      newSelectedElementIdList = newSelectedElementIdList.filter(
        (elementId) => !ancestorIdList.includes(elementId),
      );
      return {
        selectedElementIdList: newSelectedElementIdList,
        isSelectionVisible:
          config?.isSelectionVisible ?? store.isSelectionVisible,
        layer:
          config?.layer ??
          // Change layer the max layer
          Math.max(
            ...newSelectedElementIdList.map(
              (elementId) => getElementById(elementId)!.layer,
            ),
          ),
      };
    });
  },
  setSelectionVisible(visible) {
    set(() => ({
      isSelectionVisible: visible,
    }));
  },
  setLayer(layer) {
    set(() => ({
      layer,
    }));
  },
  setHoverTargetId(targetId) {
    set({ hoverTargetId: targetId });
  },
  setCrossLayerSelection(isCrossLayerSelectionAllowed) {
    set({ isCrossLayerSelectionAllowed });
  },
}));

export default useSelectionStore;
