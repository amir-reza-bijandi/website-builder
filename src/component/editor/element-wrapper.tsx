import useCanvasStore from '@/store/canvas-store';
import Frame from './element/frame-element';
import Text from './element/text-element';
import Image from './element/image-element';
import generateStyle from '@/utility/canvas/generate-style';
import { useRef } from 'react';
import type { CanvasStoreElement } from '@/type/canvas-store-types';

type CanvasElementWrapperProps = {
  element: CanvasStoreElement;
};

export default function CanvasElementWrapper({
  element,
}: CanvasElementWrapperProps) {
  const {
    setSelectedElementIdList,
    setSelectionVisible,
    updateElement,
    selectedElementIdList,
    isSelectionVisible,
    toolbox,
    view,
  } = useCanvasStore();
  const initialSelectMouseOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (element.position.mode === 'ABSOLUTE') {
      initialSelectMouseOffset.current = {
        x: e.clientX / view.zoomFactor - +element.position.left,
        y: e.clientY / view.zoomFactor - +element.position.top,
      };
    }
    if (toolbox.action === 'SELECT') {
      if (element.id !== selectedElementIdList[0]) {
        e.stopPropagation();
        setSelectedElementIdList([element.id], true);
      }
      document.body.addEventListener('mousemove', handleElementMove);
      document.body.addEventListener('mouseleave', handleElementMoveEnd);
      document.body.addEventListener('mouseup', handleElementMoveEnd);
    }
  };

  const handleElementMove = ({ clientX, clientY }: MouseEvent) => {
    if (element.position.mode === 'ABSOLUTE') {
      const { x: initialClientOffsetX, y: initialClientOffsetY } =
        initialSelectMouseOffset.current;

      // Take zoom factor into account
      const scaledClientX = clientX / view.zoomFactor;
      const scaledClientY = clientY / view.zoomFactor;

      const left = scaledClientX - initialClientOffsetX;
      const top = scaledClientY - initialClientOffsetY;
      const right = +element.position.right + +element.position.left - left;
      const bottom = +element.position.bottom + (+element.position.top - top);

      updateElement({
        ...element,
        position: { ...element.position, left, top, right, bottom },
      });

      // Hide selection when moving element
      if (isSelectionVisible) {
        setSelectionVisible(false);
      }
    }
  };
  const handleElementMoveEnd = () => {
    // Show selection when stopping moving
    if (isSelectionVisible) {
      setSelectionVisible(true);
    }
    document.body.removeEventListener('mousemove', handleElementMove);
    document.body.removeEventListener('mouseleave', handleElementMoveEnd);
    document.body.removeEventListener('mouseup', handleElementMoveEnd);
  };
  return (
    <div
      id={element.id}
      style={{
        ...generateStyle(element),
      }}
      onMouseDown={handleMouseDown}
    >
      <ElementRender element={element} />
    </div>
  );
}

type ElementRenderProps = CanvasElementWrapperProps;

function ElementRender({ element }: ElementRenderProps) {
  switch (element.type) {
    case 'FRAME':
      return <Frame key={element.id} element={element} />;
    case 'TEXT':
      return <Text key={element.id} element={element} />;
    case 'IMAGE':
      return <Image key={element.id} element={element} />;
  }
}
