import useCanvasStore from '@/store/canvas-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/utility/general-utilities';
import generateStyle from '@/utility/canvas/generate-style';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import useMove from '@/hook/canvas/use-move';
import getElementById from '@/utility/canvas/get-element-by-id';
import EditContextMenu from '../edit-context-menu';
import useClipboardStore from '@/store/clipboard-store';

type WrapperProps = {
  element: CanvasStoreElement;
  children: React.ReactNode;
};

export default function Wrapper({ element, children }: WrapperProps) {
  const {
    setSelectedElementIdList,
    selectedElementIdList,
    toolbox,
    view,
    isResizing,
    isMoving,
    layer,
    setLayer,
    hoverTargetId,
    setHoverTargetId,
    isCrossLayerSelectionAllowed,
  } = useCanvasStore(
    useShallow((store) => ({
      setSelectedElementIdList: store.setSelectedElementIdList,
      selectedElementIdList: store.selectedElementIdList,
      toolbox: store.toolbox,
      view: store.view,
      isResizing: store.isResizing,
      isMoving: store.isMoving,
      layer: store.layer,
      setLayer: store.setLayer,
      hoverTargetId: store.hoverTargetId,
      setHoverTargetId: store.setHoverTargetId,
      isCrossLayerSelectionAllowed: store.isCrossLayerSelectionAllowed,
    })),
  );
  const setPastePosition = useClipboardStore((store) => store.setPastePosition);
  const handleMove = useMove([element.id]);
  const isElementSelected = selectedElementIdList.includes(element.id);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolbox.action === 'SELECT') {
      e.stopPropagation();
      if (!isElementSelected) {
        if (element.layer === layer || isCrossLayerSelectionAllowed) {
          // Select mutiple elements
          if (e.shiftKey && e.button === 0) {
            const selectedElementList = selectedElementIdList.map(
              (elementId) => getElementById(elementId)!,
            );
            const selectedChildIndex = selectedElementList.findIndex(
              (element) => element.parentId === element.id,
            );
            // Prevent selecting children and parent at the same time
            if (selectedChildIndex !== -1) {
              selectedElementList.splice(selectedChildIndex, 1);
              setSelectedElementIdList(
                selectedElementList.map((element) => element.id),
                true,
              );
            } else {
              setSelectedElementIdList(
                [...selectedElementIdList, element.id],
                true,
              );
            }
          } else {
            setSelectedElementIdList([element.id], true);
            setLayer(element.layer);
          }
        }
        // Prevent selecting parent and children at the same time
        else {
          if (element.layer < layer) {
            setSelectedElementIdList([element.id], true);
            setLayer(element.layer);
          }
        }
      }
      if (e.button === 0) {
        // Move element
        handleMove({ x: e.clientX, y: e.clientY });
      }
    }
    /* Since this event prevents it's parent event from triggering
       We have to set the paste position here */
    if (e.button === 2) {
      setPastePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // setup for the highlight effect of selectable elements
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolbox.action === 'SELECT') {
      e.stopPropagation();
      setHoverTargetId(element.id);
    }
  };

  const handleMouseLeave = () => {
    setHoverTargetId('');
  };

  return (
    <EditContextMenu>
      <div
        id={element.id}
        style={
          {
            ...generateStyle(element),
            boxShadow: `0 0 0 calc(2px / ${view.zoomFactor}) var(--tw-shadow-color)`,
          } as React.CSSProperties
        }
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'pointer-events-none shadow-transparent transition-[box-shadow]',
          // Fade effect when moving elements
          isElementSelected && !isMoving && 'shadow-primary',
          isElementSelected && isResizing && 'shadow-primary/50',
          // Make non-relevant elements non-interactive
          element.layer <= layer && 'pointer-events-auto',
          // Make every element interactive when cross layer selection mode is active
          isCrossLayerSelectionAllowed && 'pointer-events-auto',
          // Highlight effect when hovering over selectable element
          !isElementSelected &&
            !isMoving &&
            !isResizing &&
            hoverTargetId === element.id &&
            'shadow-primary',
        )}
      >
        {children}
      </div>
    </EditContextMenu>
  );
}
