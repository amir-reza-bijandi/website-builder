import useCanvasStore from '@/store/canvas-store';
import useClipboardStore, {
  ClipboardStoreStatus,
} from '@/store/clipboard-store';
import { CanvasStoreElement } from '@/type/canvas-store-types';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import getElementById from '@/utility/canvas/get-element-by-id';
import scaleWithZoomFactor from '@/utility/canvas/scale-with-zoom-factor';
import { useShallow } from 'zustand/react/shallow';

export default function usePaste() {
  const status = useClipboardStore((store) => store.status);
  const {
    selectedElementIdList,
    setSelectedElementIdList,
    addElement,
    setLayer,
    layer,
    view,
  } = useCanvasStore(
    useShallow((store) => ({
      selectedElementIdList: store.selectedElementIdList,
      setSelectedElementIdList: store.setSelectedElementIdList,
      addElement: store.addElement,
      setLayer: store.setLayer,
      layer: store.layer,
      view: store.view,
    })),
  );

  const handlePaste = (mousePosition?: Position) => {
    if (!status.operation) return;
    let newElementList: CanvasStoreElement[] = [];

    // Paste inside a selection
    if (selectedElementIdList.length) {
      newElementList = createPasteInSelectionElementList(
        selectedElementIdList,
        status,
        view.zoomFactor,
      );
    }
    // Paste outside a selection
    else {
      if (mousePosition) {
        newElementList = createPasteInCanvasElementList(
          status,
          mousePosition,
          view.zoomFactor,
        );
      }
    }

    addElement(...newElementList);

    // Change the selection
    setSelectedElementIdList(
      newElementList
        .sort((a, b) => a.layer - b.layer)
        .filter((element, _, array) => element.layer === array[0].layer)
        .map((element) => element.id),
    );

    // Change the layer to the min layer
    const minLayer = newElementList
      .sort((a, b) => a.layer - b.layer)
      .at(0)!.layer;
    if (layer !== minLayer) {
      setLayer(minLayer);
    }
  };
  return handlePaste;
}

function createPasteInSelectionElementList(
  selectedElementIdList: string[],
  clipboardStatus: ClipboardStoreStatus,
  zoomFactor: number,
) {
  return selectedElementIdList
    .map((selectedElementId) => {
      const selectedElement = getElementById(selectedElementId)!;
      // Paste only inside a frame
      if (selectedElement.type !== 'FRAME') return [];
      return clipboardStatus.itemList.map(
        ([clipboardItem, clipboardItemChildren, clipboardItemRect]) => {
          let newElement = clipboardItem;
          const parentRect = scaleWithZoomFactor(
            document
              .getElementById(selectedElement.id)!
              .getBoundingClientRect(),
          );
          let deltaLayer = selectedElement.layer + 1 - clipboardItem.layer;

          // Check whether the element has a parent
          if (clipboardItem.parentId) {
            if (clipboardItem.position.mode === 'ABSOLUTE') {
              const newElementRight =
                parentRect.width / zoomFactor -
                (+clipboardItem.position.left +
                  clipboardItemRect.width / zoomFactor);

              const newElementBottom =
                parentRect.height / zoomFactor -
                (+clipboardItem.position.left +
                  clipboardItemRect.height / zoomFactor);

              newElement = createElement(clipboardItem.type, {
                ...clipboardItem,
                // Pass undefined to create a new id
                id: undefined,
                layer: selectedElement.layer + 1,
                parentId: selectedElement.id,
                position: {
                  ...clipboardItem.position,
                  right: newElementRight,
                  bottom: newElementBottom,
                },
              })!;
            }
          } else {
            if (clipboardItem.position.mode === 'ABSOLUTE') {
              const newElementX =
                (parentRect.width - clipboardItemRect.width) / 2;
              const newElementY =
                (parentRect.height - clipboardItemRect.height) / 2;

              newElement = createElement(clipboardItem.type, {
                ...clipboardItem,
                // Pass undefined to create a new id
                id: undefined,
                layer: selectedElement.layer + 1,
                parentId: selectedElement.id,
                position: {
                  mode: 'ABSOLUTE',
                  left: newElementX,
                  right: newElementX,
                  top: newElementY,
                  bottom: newElementY,
                },
              })!;
            }
          }
          if (clipboardItemChildren) {
            const newChildren = clipboardItemChildren.map((child) => ({
              ...child,
              parentId:
                child.parentId === clipboardItem.id
                  ? newElement.id
                  : child.parentId,
              layer: child.layer + deltaLayer,
            }));
            return [newElement, ...newChildren];
          }
          return [newElement];
        },
      );
    })
    .flat(2);
}

function createPasteInCanvasElementList(
  clipboardStatus: ClipboardStoreStatus,
  mousePosition: Position,
  zoomFactor: number,
) {
  return clipboardStatus.itemList
    .map(([clipboardItem, clipboardItemChildren, clipboardItemRect]) => {
      const deltaLayer = -clipboardItem.layer;

      let newElement = clipboardItem;

      const canvasRect = document
        .getElementById('canvas')!
        .getBoundingClientRect();

      const newElementLeft =
        (mousePosition.x - canvasRect.left) / zoomFactor -
        clipboardItemRect.width / 2;
      const newElementTop =
        (mousePosition.y - canvasRect.top) / zoomFactor -
        clipboardItemRect.height / 2;
      const newElementBottom =
        canvasRect.height / zoomFactor -
        (newElementTop + clipboardItemRect.height);
      const newElementRight =
        canvasRect.width / zoomFactor -
        (newElementLeft + clipboardItemRect.width);

      newElement = createElement(clipboardItem.type, {
        ...clipboardItem,
        id: undefined,
        layer: 0,
        parentId: '',
        position: {
          mode: 'ABSOLUTE',
          left: newElementLeft,
          right: newElementRight,
          top: newElementTop,
          bottom: newElementBottom,
        },
      })!;

      if (clipboardItemChildren) {
        const newChildren = clipboardItemChildren.map((child) => ({
          ...child,
          parentId:
            child.parentId === clipboardItem.id
              ? newElement.id
              : child.parentId,
          layer: child.layer + deltaLayer,
        }));
        return [newElement, ...newChildren];
      }
      return [newElement];
    })
    .flat(1);
}
