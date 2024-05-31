import useCanvasStore from '@/store/canvas-store';
import Frame from './element/frame-element';
import Text from './element/text-element';
import Image from './element/image-element';
import generateStyle from '@/utility/canvas/generate-style';
import { memo } from 'react';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import { cn } from '@/utility/general-utilities';
import useMove from '@/hook/canvas/use-move';

type CanvasElementWrapperProps = {
  element: CanvasStoreElement;
};

export default function CanvasElementWrapper({
  element,
}: CanvasElementWrapperProps) {
  const {
    setSelectedElementIdList,
    selectedElementIdList,
    toolbox,
    view,
    isResizing,
    isMoving,
  } = useCanvasStore();
  const handleMove = useMove(element);
  const isElementSelected = selectedElementIdList.includes(element.id);

  const handleMouseDown = ({
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) => {
    if (toolbox.action === 'SELECT') {
      if (!isElementSelected) {
        setSelectedElementIdList([element.id], true);
      }
      handleMove({ x: clientX, y: clientY });
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
        isElementSelected && 'z-10',
        isElementSelected && !isMoving && 'shadow-primary',
        isElementSelected && isResizing && 'shadow-primary/50',
      )}
    >
      <ElementRender element={element} />
    </div>
  );
}

type ElementRenderProps = CanvasElementWrapperProps;

const ElementRender = memo(function ({ element }: ElementRenderProps) {
  switch (element.type) {
    case 'FRAME':
      return <Frame key={element.id} element={element} />;
    case 'TEXT':
      return <Text key={element.id} element={element} />;
    case 'IMAGE':
      return <Image key={element.id} element={element} />;
  }
});
