import { create } from 'zustand';
import type { CanvasElementType } from '@/type/element-property-types';

export type ToolboxStoreAction = 'ADD' | 'SELECT' | 'PAN';
export type ToolboxStoreTool = CanvasElementType | null | undefined;
export type Toolbox = {
  action: ToolboxStoreAction;
  tool: ToolboxStoreTool;
};

type ToolboxStore = Toolbox & {
  setToolbox: (toolbox: Partial<Toolbox>) => void;
};

const useToolboxStore = create<ToolboxStore>((set) => ({
  action: 'SELECT',
  tool: null,
  setToolbox({ action, tool }) {
    set((store) => ({
      action: action ?? store.action,
      tool: tool ?? null,
    }));
  },
}));

export default useToolboxStore;
