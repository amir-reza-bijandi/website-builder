import { create } from 'zustand';
import type { CanvasStoreElement } from '@/type/canvas-store-types';

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
  setStatus: (status: ClipboardStoreStatus) => void;
};

const useClipboardStore = create<ClipboardStore>((set) => ({
  status: {
    operation: null,
    itemList: [],
  },
  setStatus(status) {
    set({ status });
  },
}));

export default useClipboardStore;
// useClipboardStore.subscribe((store) => console.log(store.status));
