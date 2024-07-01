import type {
  CanvasStoreToolbox,
  CanvasStoreElement,
} from '@/type/canvas-store-types';
import type { Placement } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import getElementById from '@/utility/canvas/get-element-by-id';
import scaleWithzoomLevel from '@/utility/canvas/scale-with-zoom-level';
import { create } from 'zustand';

type CanvasStore = {
  toolbox: CanvasStoreToolbox;
  isPanning: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isFocused: boolean;
  elementList: CanvasStoreElement[];

  setToolbox: (toolbox: Partial<CanvasStoreToolbox>) => void;
  setPanning: (isPanning: boolean) => void;
  setMoving: (isMoving: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setFocus: (isFocused: boolean) => void;
  addElement: (...elementList: CanvasStoreElement[]) => void;
  updateElement: (...updatedElements: CanvasStoreElement[]) => void;
  deleteElement: (...elementIdList: string[]) => void;
  changeElementOrder: (
    elementIdList: string[],
    targetElementId: string,
    placement: Placement,
  ) => void;
};

const useCanvasStore = create<CanvasStore>((set) => ({
  toolbox: {
    action: 'SELECT',
    tool: null,
  },
  elementList: [],
  isPanning: false,
  isResizing: false,
  isMoving: false,
  isFocused: true,
  isCrossLayerSelectionAllowed: false,
  hoverTargetId: '',
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
  addElement(...elementList) {
    set((store) => ({
      elementList: [...store.elementList, ...elementList],
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
    const descendentIdList = elementIdList
      .map((elementId) => getDescendentIdList(elementId))
      .flat();

    set((store) => ({
      elementList: store.elementList.filter(
        (element) =>
          !descendentIdList.includes(element.id) &&
          !elementIdList.includes(element.id),
      ),
    }));
  },
  changeElementOrder(elementIdList, targetElementId, placement) {
    try {
      const canvasRect = document
        .getElementById('canvas')!
        .getBoundingClientRect();
      const targetElement = getElementById(targetElementId);
      if (!targetElement) throw new Error('Target element not found!');

      set((store) => {
        const updatedElementList = elementIdList.map((id) => {
          const element = getElementById(id)!;
          if (element.position.mode === 'ABSOLUTE') {
            const elementRect = document
              .getElementById(element.id)!
              .getBoundingClientRect();

            let { left, right, top, bottom } = element.position;
            const { mode } = element.position;
            let layer = targetElement.layer;
            let parentId = targetElement.parentId;
            let deltaLayer = targetElement.layer - element.layer;

            if (placement === 'BEFORE' || placement === 'AFTER') {
              if (targetElement.parentId) {
                // Calculate position based on the new parent
                const targetParentElementRect = document
                  .getElementById(targetElement.parentId)!
                  .getBoundingClientRect();

                ({ left, right, top, bottom } = scaleWithzoomLevel({
                  left: elementRect.left - targetParentElementRect.left,
                  right: targetParentElementRect.right - elementRect.right,
                  top: elementRect.top - targetParentElementRect.top,
                  bottom: targetParentElementRect.bottom - elementRect.bottom,
                }));
              } else {
                // Calculate position based on canvas
                ({ left, right, top, bottom } = scaleWithzoomLevel({
                  left: elementRect.left - canvasRect.left,
                  right: canvasRect.right - elementRect.right,
                  top: elementRect.top - canvasRect.top,
                  bottom: canvasRect.bottom - elementRect.bottom,
                }));
              }
            } else {
              deltaLayer = targetElement.layer + 1 - element.layer;
              // Calculate position based on the target element
              const targetElementRect = document
                .getElementById(targetElement.id)!
                .getBoundingClientRect();

              ({ left, right, top, bottom } = scaleWithzoomLevel({
                left: elementRect.left - targetElementRect.left,
                right: targetElementRect.right - elementRect.right,
                top: elementRect.top - targetElementRect.top,
                bottom: targetElementRect.bottom - elementRect.bottom,
              }));

              layer = targetElement.layer + 1;
              parentId = targetElement.id;
            }

            const updatedElement = createElement(element.type, {
              ...element,
              layer,
              parentId,
              position: {
                mode,
                left,
                right,
                top,
                bottom,
              },
            })!;

            return [updatedElement, deltaLayer] as [CanvasStoreElement, number];
          } else {
            return [element, 0] as [CanvasStoreElement, number];
          }
        });

        // Remove elements from element list
        const filteredElementList = store.elementList.filter(
          (element) => !elementIdList.includes(element.id),
        );
        const targetElementIndex = filteredElementList.findIndex(
          (element) => element.id === targetElementId,
        );

        // Insert elements to element list
        if (placement === 'BEFORE') {
          filteredElementList.splice(
            targetElementIndex,
            0,
            ...updatedElementList.map(([element]) => element),
          );
        } else if (placement === 'AFTER') {
          filteredElementList.splice(
            targetElementIndex + 1,
            0,
            ...updatedElementList.map(([element]) => element),
          );
        } else {
          // Find index of the last child in element list
          const lastLayerChildIndex = filteredElementList.reduce(
            (result, element, index) =>
              element.layer > targetElement.layer &&
              element.parentId === targetElement.id &&
              index > result
                ? index
                : result,
            0,
          );
          filteredElementList.splice(
            lastLayerChildIndex + 1,
            0,
            ...updatedElementList.map(([element]) => element),
          );
        }

        // Change layer of descendents
        const result = filteredElementList.map((element) => {
          const ancestorIdList = getAncestorIdList(element.id);
          if (ancestorIdList) {
            const result = updatedElementList.find(([updatedElement]) =>
              ancestorIdList.includes(updatedElement.id),
            );
            if (result) {
              const [, deltaLayer] = result;
              const updatedElement = createElement(element.type, {
                ...element,
                layer: element.layer + deltaLayer,
              })!;
              return updatedElement;
            }
          }
          return element;
        });

        return {
          elementList: result,
        };
      });
    } catch (error) {
      console.error(error);
    }
  },
}));

export default useCanvasStore;
