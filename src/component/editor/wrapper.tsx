import useCanvasStore from '@/store/canvas-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/utility/general-utilities';
import generateStyle from '@/utility/canvas/generate-style';
import type { CanvasStoreElement } from '@/type/canvas-store-types';

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
    })),
  );
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
    }
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
      className={cn(
        'shadow-transparent transition-[box-shadow]',
        isElementSelected && !isMoving && 'shadow-primary',
        isElementSelected && isResizing && 'shadow-primary/50',
      )}
    >
      {children}
    </div>
  );
}
