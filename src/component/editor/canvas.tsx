import useCanvasStore from '@/store/canvas-store';
import { cn } from '@/utility/general-utilities';
import CanvasRender from './render';
import CanvasSelect from './select';
import usePan from '@/hook/canvas/use-pan';
import useResizeOnCreate from '@/hook/canvas/use-resize-on-create';
import useZoom from '@/hook/canvas/use-zoom';

export default function Canvas() {
  const { view, toolbox, setSelectedElementIdList, selectedElementIdList } =
    useCanvasStore();

  const handlePan = usePan();
  const handleResizeOnCreate = useResizeOnCreate();
  const handleZoom = useZoom();

  const isPanningAllowed = toolbox.action === 'PAN';

  const handleMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    currentTarget,
    target,
  }) => {
    // Clear selection when clicking on canvas
    const canvas = currentTarget.children[0];
    if (target === canvas && toolbox.action !== 'PAN') {
      if (selectedElementIdList[0]) {
        setSelectedElementIdList([], false);
      }
    }

    const mousePositin = { x: clientX, y: clientY };

    handlePan(mousePositin);
    handleResizeOnCreate(mousePositin);
  };

  return (
    <main
      className={cn(
        'relative flex h-full items-center justify-center overflow-hidden',
        toolbox.action === 'ADD' && 'cursor-custom-crosshair',
        isPanningAllowed && 'cursor-custom-grab active:cursor-custom-grabbing',
      )}
      onWheel={handleZoom}
      onMouseDown={handleMouseDown}
    >
      <div
        id='canvas'
        style={
          {
            transform: `translate(calc(${view.offsetX}px), calc(${view.offsetY}px)) scale(${view.zoomFactor})`,
          } as React.CSSProperties
        }
        className='absolute flex h-[10000px] w-[10000px] origin-top-left select-none items-center justify-center'
      >
        <CanvasRender />
        <CanvasSelect />
      </div>
    </main>
  );
}
