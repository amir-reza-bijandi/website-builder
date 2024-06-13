import React, {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import useCanvasStore from '@/store/canvas-store';
import useSelect from '@/hook/element-list/use-select';
import useReorder from '@/hook/element-list/use-reorder';
import { ChevronRightIcon, FrameIcon, ImageIcon, TypeIcon } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/utility/general-utilities';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import type { Placement } from '@/type/general-types';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import type { CanvasElementType } from '@/type/element-property-types';

type DropStatus = {
  targetId: string;
  dropLocation: Placement | null;
};

type ElementListContextValue = {
  isMouseDownRef: React.MutableRefObject<boolean>;
  isDraggingRef: React.MutableRefObject<boolean>;
  dropStatus: DropStatus;
  setDropStatus: React.Dispatch<React.SetStateAction<DropStatus>>;
};

export const ElementListContext = createContext<ElementListContextValue>(
  {} as ElementListContextValue,
);

const iconMap: Record<CanvasElementType, JSX.Element> = {
  FRAME: <FrameIcon size={16} />,
  TEXT: <TypeIcon size={16} />,
  IMAGE: <ImageIcon size={16} />,
};

const ElementList = memo(function () {
  const setSelectedElementIdList = useCanvasStore(
    (store) => store.setSelectedElementIdList,
  );
  const [dropStatus, setDropStatus] = useState<DropStatus>({
    targetId: '',
    dropLocation: null,
  });
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);

  // Clear selection when clicked on empty space of tree view
  const handleClearSelection = () => {
    setSelectedElementIdList([], false);
  };

  // Clear drop target when mouse pointer leaves the element list
  const handleClearDropTarget = () => {
    if (isDraggingRef.current) {
      setDropStatus(() => {
        return { dropLocation: null, targetId: '' };
      });
    }
  };

  return (
    <ScrollArea
      className='h-full'
      onMouseDown={handleClearSelection}
      onMouseLeave={handleClearDropTarget}
    >
      <div className='space-y-2'>
        <ElementListContext.Provider
          value={{
            dropStatus,
            setDropStatus,
            isDraggingRef,
            isMouseDownRef,
          }}
        >
          <ElementListRender />
        </ElementListContext.Provider>
      </div>
    </ScrollArea>
  );
});

type ElementListRenderProps = {
  elementId?: string;
  elementLayer?: number;
};

const ElementListRender = memo(function ({
  elementId,
  elementLayer = 0,
}: ElementListRenderProps) {
  const elementList = useCanvasStore((store) => store.elementList);
  // Filter item that are in the desired layer
  let layerElementList = elementList.filter(
    (item) => item.layer === elementLayer,
  );

  if (layerElementList.length) {
    if (elementLayer === 0) {
      return layerElementList.map((element, index) => (
        <ElementListItem key={element.id} element={element} index={index} />
      ));
    } else {
      // When rendering lower layers we need to filter items with the same parent
      layerElementList = layerElementList.filter(
        (element) => element.parentId === elementId,
      );
      return layerElementList.map((element, index) => (
        <ElementListItem key={element.id} element={element} index={index} />
      ));
    }
  }
});

type ElementListItemProps = {
  element: CanvasStoreElement;
  index: number;
};

const ElementListItem = memo(function ({
  element: { id, type, displayName, layer },
  index,
}: ElementListItemProps) {
  const { dropStatus, setDropStatus, isDraggingRef, isMouseDownRef } =
    useContext(ElementListContext);
  const { elementList, selectedElementIdList, changeElementOrder } =
    useCanvasStore(
      useShallow((store) => ({
        elementList: store.elementList,
        selectedElementIdList: store.selectedElementIdList,
        changeElementOrder: store.changeElementOrder,
      })),
    );
  const [isExpanded, setExpand] = useState(false);
  const handleSelect = useSelect();
  const selectOnReleaseRef = useRef(false);
  const { handleReorder, handleDrag } = useReorder(id, selectOnReleaseRef);

  const isSelected = selectedElementIdList.some(
    (selectedElementId) => selectedElementId === id,
  );
  const hasChildren = elementList.some((item) => item.parentId === id);
  /* Check whether the current item that is being rendered is an ancestor of
     an selected item */
  const isSelectedAncestor = useMemo(
    () =>
      selectedElementIdList
        .map((selectedElementId) => getAncestorIdList(selectedElementId))
        .some((list) => list?.some((ancestorId) => ancestorId === id)),
    [selectedElementIdList, id, elementList],
  );
  const isDropTarget = dropStatus.targetId === id;

  // Expand the currect items when an item is selected through canvas
  useEffect(() => {
    if (isSelectedAncestor) {
      setExpand(true);
    }
  }, [isSelectedAncestor]);

  const handleExpand: React.MouseEventHandler = (e) => {
    /* Since there is a parent child relationship between items, 
       this prevents clicking on the child to trigger the same 
       event for the parent */
    e.stopPropagation();
    setExpand((lastState) => !lastState);
  };

  const handleMouseDown: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    if (isSelected) {
      selectOnReleaseRef.current = true;
    } else {
      handleSelect(id, layer, e.ctrlKey);
    }
    handleReorder();
  };

  const handleMouseUp: React.MouseEventHandler = (e) => {
    if (selectOnReleaseRef.current) {
      handleSelect(id, layer, e.ctrlKey);
      selectOnReleaseRef.current = false;
    }
  };

  const handleDrop = () => {
    if (isDraggingRef.current) {
      setDropStatus((lastState) => {
        if (lastState.dropLocation) {
          const selectedElementIdList =
            useCanvasStore.getState().selectedElementIdList;
          if (
            selectedElementIdList.length !== 1 ||
            selectedElementIdList[0] !== lastState.targetId
          )
            changeElementOrder(
              useCanvasStore.getState().selectedElementIdList,
              lastState.targetId,
              lastState.dropLocation,
            );
        }
        return { dropLocation: null, targetId: '' };
      });
      selectOnReleaseRef.current = false;
      isDraggingRef.current = false;
    }
    isMouseDownRef.current = false;
    document.body.removeEventListener('mouseup', handleDrop);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleDrag}
      style={
        {
          '--offset': `calc((${layer} * 1.8rem) + ${layer === 0 ? '0' : '0.5rem'})`,
        } as React.CSSProperties
      }
      className={cn(
        'relative before:absolute before:-inset-[0.3125rem] before:block before:border-solid before:border-primary',
        isDropTarget &&
          dropStatus.dropLocation === 'INSIDE' &&
          !isSelected &&
          'before:inset-0 before:rounded before:border-2',
        isDropTarget &&
          dropStatus.dropLocation === 'BEFORE' &&
          'before:translate-x-[var(--offset)] before:border-t-2',
        isDropTarget &&
          dropStatus.dropLocation === 'BEFORE' &&
          index === 0 &&
          layer === 0 &&
          'before:inset-0',
        isDropTarget &&
          dropStatus.dropLocation === 'AFTER' &&
          'before:translate-x-[var(--offset)] before:border-b-2',
      )}
    >
      <div
        className={cn(
          'relative h-10 rounded',
          // Change styles based on current state
          isSelected && 'bg-primary text-primary-foreground',
          isSelected &&
            dropStatus.targetId &&
            'bg-primary/50 text-primary-foreground',
          isSelectedAncestor && 'text-primary',
          isExpanded && 'rounded-bl-none rounded-br-none',
        )}
      >
        {/* Showing the expand icon only if there are children to render */}
        {hasChildren && (
          <div
            style={{ left: `calc(0.5rem + (${layer} * 1.8rem))` }}
            className={cn(
              'absolute flex h-full items-center transition-transform before:absolute before:left-1/2 before:block before:h-full before:w-8 before:-translate-x-1/2',
              isExpanded && 'rotate-90',
            )}
            onMouseDown={handleExpand}
          >
            <ChevronRightIcon size={16} />
          </div>
        )}
        {/* Item icon */}
        <div
          style={{ left: `calc(2rem + (${layer} * 1.8rem))` }}
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2',
          )}
        >
          {iconMap[type]}
        </div>
        {/* Input to use for renaming */}
        <input
          style={{
            paddingLeft: `calc(3.8rem + (${layer} * 1.8rem))`,
            boxShadow: `0 0 0 0.1rem var(--tw-shadow-color)`,
          }}
          className='pointer-events-none h-full w-full rounded bg-transparent shadow-transparent outline-none transition-shadow focus-visible:shadow-primary'
          type='text'
          defaultValue={displayName}
        />
      </div>
      {/* Showing children only if item is expanded */}
      {isExpanded && (
        <div
          className={cn(
            'space-y-2',
            isSelected &&
              'rounded-bl rounded-br bg-primary/5 outline outline-[1px] -outline-offset-1 outline-primary',
            isSelected &&
              dropStatus.targetId &&
              'text-primary-foreground outline-none outline-0',
          )}
        >
          <ElementListRender elementId={id} elementLayer={layer + 1} />
        </div>
      )}
    </div>
  );
});

export default ElementList;
