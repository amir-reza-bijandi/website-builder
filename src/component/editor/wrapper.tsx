import useCanvasStore from '@/store/canvas-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/utility/general-utilities';
import generateStyle from '@/utility/canvas/generate-style';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import useMove from '@/hook/canvas/use-move';

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
    })),
  );
  const handleMove = useMove([element.id]);
  const isElementSelected = selectedElementIdList.includes(element.id);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (toolbox.action === 'SELECT') {
      if (!isElementSelected) {
        if (element.layer === layer) {
          if (e.shiftKey) {
            setSelectedElementIdList(
              [...selectedElementIdList, element.id],
              true,
            );
          } else {
            setSelectedElementIdList([element.id], true);
          }
        } else {
          if (element.layer < layer) {
            setSelectedElementIdList([element.id], true);
            setLayer(element.layer);
          }
        }
      }
      handleMove({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetId = (e.target as HTMLElement).id;
    if (toolbox.action === 'SELECT') {
      if (hoverTargetId !== targetId) {
        setHoverTargetId('');
      }
      if (targetId !== hoverTargetId) {
        setHoverTargetId(targetId);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverTargetId('');
  };

  return (
    <div
      id={element.id}
      style={
        {
          ...generateStyle(element),
          boxShadow: `0 0 0 calc(2px / ${view.zoomFactor}) var(--tw-shadow-color)`,
        } as React.CSSProperties
      }
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'pointer-events-none shadow-transparent transition-[box-shadow]',
        isElementSelected && !isMoving && 'shadow-primary',
        isElementSelected && isResizing && 'shadow-primary/50',
        // Stop children from preventing the selection of parent
        element.layer <= layer && 'pointer-events-auto',
        !isElementSelected &&
          !isMoving &&
          !isResizing &&
          hoverTargetId === element.id &&
          'shadow-primary',
      )}
    >
      {children}
    </div>
  );
}