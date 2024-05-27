import useCanvasStore, { CanvasElement } from '@/store/canvas';
import Frame from './frame';
import Text from './text';
import Image from './image';
import generateStyle from '@/lib/canvas/generateStyle';
import { useRef } from 'react';

type SelectWrapperProps = ElementRenderProps;

export default function SelectWrapper({ element }: SelectWrapperProps) {
  const {
    setSelectedElementIds,
    selectedElementIds,
    updateElement,
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
      if (element.id !== selectedElementIds[0]) {
        e.stopPropagation();
        setSelectedElementIds([element.id]);
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
    }
  };
  const handleElementMoveEnd = () => {
    document.body.removeEventListener('mousemove', handleElementMove);
    document.body.removeEventListener('mouseleave', handleElementMoveEnd);
    document.body.removeEventListener('mouseup', handleElementMoveEnd);
  };
  return (
    <div
      id={element.id}
      style={{
        // Select border
        boxShadow: `0 0 0 calc(1px / ${view.zoomFactor}) ${element.id === selectedElementIds[0] ? 'hsl(var(--primary))' : 'transparent'}`,
        ...generateStyle(element),
      }}
      onMouseDown={handleMouseDown}
    >
      <ElementRender element={element} />
    </div>
  );
}

type ElementRenderProps = {
  element: CanvasElement;
};

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
