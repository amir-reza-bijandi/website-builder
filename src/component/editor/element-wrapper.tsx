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
  const { setSelectedElementIdList, selectedElementIdList, toolbox } =
    useCanvasStore();
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
      style={{
        ...generateStyle(element),
      }}
      onMouseDown={handleMouseDown}
      className={cn(isElementSelected && 'z-10')}
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
