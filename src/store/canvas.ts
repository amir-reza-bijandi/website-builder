import CanvasFrameElement from '@/class/frame';
import CanvasImageElement from '@/class/image';
import CanvasTextElement from '@/class/text';
import { CanvasElementType } from '@/type/element-property';
import { produce } from 'immer';
import { create } from 'zustand';

export type CanvasAction = 'ADD' | 'SELECT' | 'PAN';
export type CanvasTool = CanvasElementType | null | undefined;
export type CanvasToolbox = {
  action: CanvasAction;
  tool: CanvasTool;
};

export type CanvasView = {
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
};

export type CanvasElement =
  | CanvasFrameElement
  | CanvasTextElement
  | CanvasImageElement;

type CanvasStore = {
  view: CanvasView;
  toolbox: CanvasToolbox;
  elementList: CanvasElement[];
  selectedElementIds: string[];
  setView: (view: Partial<CanvasView>) => void;
  setToolbox: (toolbox: Partial<CanvasToolbox>) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (updatedElement: CanvasElement) => void;
  setSelectedElementIds: (id: string[]) => void;
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
  selectedElementIds: [],
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
  setSelectedElementIds(idList) {
    set({ selectedElementIds: idList });
  },
}));

export default useCanvasStore;
