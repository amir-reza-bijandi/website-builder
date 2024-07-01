import useClipboardStore, {
  ClipboardStoreStatus,
} from '@/store/clipboard-store';
import useSelectionStore from '@/store/selection-store';
import useViewStore from '@/store/view-store';
import useElementStore, { ElementStoreElement } from '@/store/element-store';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import getElementById from '@/utility/canvas/get-element-by-id';
import scaleWithZoomLevel from '@/utility/canvas/scale-with-zoom-level';
import { nanoid } from 'nanoid';
import { useShallow } from 'zustand/react/shallow';

export default function usePaste() {
  const { status, pastePosition } = useClipboardStore(
    useShallow((store) => ({
      status: store.status,
      pastePosition: store.pastePosition,
    })),
  );
  const zoomLevel = useViewStore((store) => store.zoomLevel);
  const addElement = useElementStore((store) => store.addElement);
  const { layer, setLayer, selectedElementIdList, setSelectedElementIdList } =
    useSelectionStore(
      useShallow((store) => ({
        selectedElementIdList: store.selectedElementIdList,
        setSelectedElementIdList: store.setSelectedElementIdList,
        setLayer: store.setLayer,
        layer: store.layer,
      })),
    );

  const handlePaste = (useMousePosition: boolean = false) => {
    if (!status.operation) return;
    let newElementList: ElementStoreElement[] = [];

    // Paste inside a selection
    if (selectedElementIdList.length) {
      newElementList = createPasteInSelectionElementList(
        selectedElementIdList,
        status,
        zoomLevel,
        useMousePosition,
        pastePosition,
      );
    }
    // Paste outside a selection
    else {
      if (useMousePosition) {
        newElementList = createMousePasteInCanvasElementList(
          status,
          pastePosition,
          zoomLevel,
        );
      }
    }

    if (newElementList.length) {
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
    }
  };

  return handlePaste;
}

function createPasteInSelectionElementList(
  selectedElementIdList: string[],
  clipboardStatus: ClipboardStoreStatus,
  zoomLevel: number,
  useMousePosition: boolean,
  pastePosition: Position,
) {
  return selectedElementIdList
    .map((selectedElementId) => {
      const selectedElement = getElementById(selectedElementId)!;
      // Paste only inside a frame
      if (selectedElement.type !== 'FRAME') return [];
      return clipboardStatus.itemList.map(
        ([clipboardItem, clipboardItemChildren, clipboardItemRect]) => {
          let newElement = clipboardItem;
          const parentRect = scaleWithZoomLevel(
            document
              .getElementById(selectedElement.id)!
              .getBoundingClientRect(),
          );
          const deltaLayer = selectedElement.layer + 1 - clipboardItem.layer;

          if (useMousePosition) {
            const { x: mouseX, y: mouseY } = pastePosition;
            const newElementLeft =
              (mouseX - parentRect.left * zoomLevel) / zoomLevel -
              clipboardItemRect.width / 2;
            const newElementTop =
              (mouseY - parentRect.top * zoomLevel) / zoomLevel -
              clipboardItemRect.height / 2;
            const newElementRight =
              parentRect.width - (newElementLeft + clipboardItemRect.width);
            const newElementBottom =
              parentRect.height - (newElementTop + clipboardItemRect.height);

            newElement = createElement(clipboardItem.type, {
              ...clipboardItem,
              id: undefined,
              layer: selectedElement.layer + 1,
              parentId: selectedElement.id,
              position: {
                mode: 'ABSOLUTE',
                left: newElementLeft,
                right: newElementRight,
                top: newElementTop,
                bottom: newElementBottom,
              },
            })!;
          } else {
            // Check whether the element has a parent
            if (clipboardItem.parentId) {
              if (clipboardItem.position.mode === 'ABSOLUTE') {
                const newElementRight =
                  parentRect.width / zoomLevel -
                  (+clipboardItem.position.left +
                    clipboardItemRect.width / zoomLevel);

                const newElementBottom =
                  parentRect.height / zoomLevel -
                  (+clipboardItem.position.left +
                    clipboardItemRect.height / zoomLevel);

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
          }

          if (clipboardItemChildren) {
            return [
              newElement,
              ...createChildren(
                clipboardItem,
                clipboardItemChildren,
                deltaLayer,
                newElement.id,
              ),
            ];
          }
          return [newElement];
        },
      );
    })
    .flat(2);
}

function createMousePasteInCanvasElementList(
  clipboardStatus: ClipboardStoreStatus,
  mousePosition: Position,
  zoomLevel: number,
) {
  return clipboardStatus.itemList
    .map(([clipboardItem, clipboardItemChildren, clipboardItemRect]) => {
      const deltaLayer = -clipboardItem.layer;

      let newElement = clipboardItem;

      const canvasRect = document
        .getElementById('canvas')!
        .getBoundingClientRect();

      const newElementLeft =
        (mousePosition.x - canvasRect.left) / zoomLevel -
        clipboardItemRect.width / 2;
      const newElementTop =
        (mousePosition.y - canvasRect.top) / zoomLevel -
        clipboardItemRect.height / 2;
      const newElementBottom =
        canvasRect.height / zoomLevel -
        (newElementTop + clipboardItemRect.height);
      const newElementRight =
        canvasRect.width / zoomLevel -
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
        return [
          newElement,
          ...createChildren(
            clipboardItem,
            clipboardItemChildren,
            deltaLayer,
            newElement.id,
          ),
        ];
      }
      return [newElement];
    })
    .flat(1);
}

function createChildren(
  clipboardItem: ElementStoreElement,
  clipboardItemChildren: ElementStoreElement[],
  deltaLayer: number,
  parentId: string,
) {
  const uniqueId = nanoid(4);
  return clipboardItemChildren.map(
    (child) =>
      createElement(child.type, {
        ...child,
        id: child.id + uniqueId,
        parentId:
          child.parentId === clipboardItem.id
            ? parentId
            : child.parentId + uniqueId,
        layer: child.layer + deltaLayer,
      })!,
  );
}
