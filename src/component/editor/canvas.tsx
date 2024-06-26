import useCanvasStore from '@/store/canvas-store';
import { cn } from '@/utility/general-utilities';
import CanvasRender from './render';
import CanvasSelect from './select';
import usePan from '@/hook/canvas/use-pan';
import useResizeOnCreate from '@/hook/canvas/use-resize-on-create';
import useZoom from '@/hook/canvas/use-zoom';
import { useShallow } from 'zustand/react/shallow';
import CanvasContextMenu from '../canvas-context-menu';
import useSelectionStore from '@/store/selection-store';

export default function Canvas() {
  const { view, toolbox, setFocus } = useCanvasStore(
    useShallow((store) => ({
      view: store.view,
      toolbox: store.toolbox,
      setFocus: store.setFocus,
    })),
  );
  const { selectedElementIdList, setLayer, setSelectedElementIdList } =
    useSelectionStore(
      useShallow((store) => ({
        setSelectedElementIdList: store.setSelectedElementIdList,
        selectedElementIdList: store.selectedElementIdList,
        setLayer: store.setLayer,
      })),
    );

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
    // Clear selection when clicking on an empty part of canvas
    const canvas = currentTarget.children[0];
    if (target === canvas && toolbox.action === 'SELECT') {
      if (selectedElementIdList.length) {
        setSelectedElementIdList([], {
          isSelectionVisible: false,
          layer: 0,
        });
        setLayer(0);
      }
    }

    const mousePosition = { x: clientX, y: clientY };

    // Allows for panning
    handlePan(mousePosition);

    // Allows for creating and reszing elements
    handleResizeOnCreate(mousePosition);
  };

  // Change the focus state of the canvas
  const handleFocus: React.FocusEventHandler = () => {
    setFocus(true);
  };
  const handleBlur: React.FocusEventHandler = () => {
    setFocus(false);
  };

  return (
    <CanvasContextMenu>
      <main
        className={cn(
          'relative flex h-full items-center justify-center overflow-hidden',
          toolbox.action === 'ADD' && 'cursor-custom-crosshair',
          isPanningAllowed &&
            'cursor-custom-grab active:cursor-custom-grabbing',
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
          tabIndex={-1}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <CanvasRender />
          <CanvasSelect />
        </div>
      </main>
    </CanvasContextMenu>
  );
}
