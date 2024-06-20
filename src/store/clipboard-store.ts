import { create } from 'zustand';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import { Position } from '@/type/general-types';

export type ClipboardStoreStatus = {
  operation: ClipboardStoreOperation;
  itemList: ClipboardStoreItem[];
};

export type ClipboardStoreOperation = 'COPY' | 'CUT' | null;
export type ClipboardStoreItem = [
  CanvasStoreElement,
  CanvasStoreElement[] | null,
  DOMRect,
];

type ClipboardStore = {
  status: ClipboardStoreStatus;
  pastePosition: Position;
  setStatus: (status: ClipboardStoreStatus) => void;
  setPastePosition: (position: Position) => void;
};

const useClipboardStore = create<ClipboardStore>((set) => ({
  status: {
    operation: null,
    itemList: [],
  },
  pastePosition: { x: 0, y: 0 },
  setStatus(status) {
    set({ status });
  },
  setPastePosition(position) {
    set({ pastePosition: position });
  },
}));

export default useClipboardStore;
