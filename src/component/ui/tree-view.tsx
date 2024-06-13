import { cn } from '@/utility/general-utilities';
import { ChevronRightIcon } from 'lucide-react';
import React, {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollArea } from './scroll-area';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import { Placement } from '@/type/general-types';
import useCanvasStore from '@/store/canvas-store';

export type TreeViewItem = {
  id: string;
  parentId: string;
  value: string;
  layer: number;
  icon: JSX.Element;
};

export type TreeViewSelectEvent = React.MouseEvent & {
  selectedItemId: string;
  selectedItemLayer: number;
  mouse: 'CLICK' | 'DOWN';
};

export type TreeViewSelectEventHandler = (event: TreeViewSelectEvent) => void;

export type TreeViewReorderEvent = {
  itemIdList: string[];
  targetId: string;
  dropLocation: Placement;
};

export type TreeViewReorderEventHandler = (event: TreeViewReorderEvent) => void;

type TreeViewProps = {
  itemList: TreeViewItem[];
  selectedItemIdList: string[];
  onSelect?: TreeViewSelectEventHandler;
  onReorder?: TreeViewReorderEventHandler;
};

type DropStatus = {
  targetId: string;
  dropLocation: Placement | null;
};

type TreeViewContextValue = TreeViewProps & {
  isMouseDownRef: React.MutableRefObject<boolean>;
  isDraggingRef: React.MutableRefObject<boolean>;
  dropStatus: DropStatus;
  setDropStatus: React.Dispatch<React.SetStateAction<DropStatus>>;
};

const TreeViewContext = createContext<TreeViewContextValue>(
  {} as TreeViewContextValue,
);

const TreeView = memo(function (props: TreeViewProps) {
  const [dropStatus, setDropStatus] = useState<DropStatus>({
    targetId: '',
    dropLocation: null,
  });
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);

  // Clear selection when clicked on empty space of tree view
  const handleClearSelection: React.MouseEventHandler = (e) => {
    props.onSelect?.({
      ...e,
      selectedItemId: '',
      selectedItemLayer: 0,
      mouse: 'DOWN',
    });
  };

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
        <TreeViewContext.Provider
          value={{
            ...props,
            dropStatus,
            setDropStatus,
            isDraggingRef,
            isMouseDownRef,
          }}
        >
          <TreeViewRender />
        </TreeViewContext.Provider>
      </div>
    </ScrollArea>
  );
});

type TreeViewRenderProps = {
  itemId?: string;
  itemLayer?: number;
};

const TreeViewRender = memo(function ({
  itemId,
  itemLayer = 0,
}: TreeViewRenderProps) {
  const { itemList } = useContext(TreeViewContext);
  // Filter item that are in the desired layer
  let layerItemList = itemList.filter((item) => item.layer === itemLayer);

  if (layerItemList.length) {
    if (itemLayer === 0) {
      return layerItemList.map((item, index) => (
        <TreeViewItem key={item.id} item={item} index={index} />
      ));
    } else {
      // When rendering lower layers we need to filter items with the same parent
      layerItemList = layerItemList.filter((item) => item.parentId === itemId);
      return layerItemList.map((item, index) => (
        <TreeViewItem key={item.id} item={item} index={index} />
      ));
    }
  }
});

type TreeViewItemProps = {
  item: TreeViewItem;
  index: number;
};

const TreeViewItem = memo(function ({
  item: { id, value, layer, icon },
  index,
}: TreeViewItemProps) {
  const {
    selectedItemIdList,
    itemList,
    onSelect,
    onReorder,
    dropStatus,
    setDropStatus,
    isDraggingRef,
    isMouseDownRef,
  } = useContext(TreeViewContext);
  const [isExpanded, setExpand] = useState(false);
  const elementList = useCanvasStore((store) => store.elementList);

  const isSelected = selectedItemIdList.some(
    (selectedItemId) => selectedItemId === id,
  );
  const hasChildren = itemList.some((item) => item.parentId === id);
  /* Check whether the current item that is being rendered is an ancestor of
     an selected item */
  const isSelectedAncestor = useMemo(
    () =>
      selectedItemIdList
        .map((selectedItemId) => getAncestorIdList(selectedItemId))
        .some((list) => list?.some((ancestorId) => ancestorId === id)),
    [selectedItemIdList, id, elementList],
  );
  const isDropTarget = dropStatus.targetId === id;
  const selectOnReleaseRef = useRef(false);

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
      onSelect?.({
        ...e,
        selectedItemId: id,
        selectedItemLayer: layer,
        mouse: 'CLICK',
      });
    }
    isMouseDownRef.current = true;

    document.body.addEventListener('mouseup', handleDrop);
  };

  const handleMouseUp: React.MouseEventHandler = (e) => {
    if (selectOnReleaseRef.current) {
      onSelect?.({
        ...e,
        selectedItemId: id,
        selectedItemLayer: layer,
        mouse: 'CLICK',
      });
      selectOnReleaseRef.current = false;
    }
  };

  const handleMouseMove: React.MouseEventHandler = (e) => {
    const NON_CENTER_HITBOX = 10;
    if (isMouseDownRef.current) {
      isDraggingRef.current = true;
    }
    if (isMouseDownRef.current) {
      const { clientX, clientY, currentTarget } = e;
      e.stopPropagation();
      const targetRect = currentTarget.getBoundingClientRect();
      const deltaY = clientY - targetRect.top;
      let dropLocation: Placement | null = null;

      if (
        clientX >= targetRect.left &&
        clientX <= targetRect.left + targetRect.width
      ) {
        if (deltaY < NON_CENTER_HITBOX) {
          dropLocation = 'BEFORE';
        } else if (deltaY > targetRect.height - NON_CENTER_HITBOX) {
          dropLocation = 'AFTER';
        } else {
          dropLocation = 'INSIDE';
        }
      }

      // Prevent unnecessary rerender when hovering over items
      if (
        dropLocation !== dropStatus.dropLocation ||
        id !== dropStatus.targetId
      ) {
        // Prevent changing drop target when hovering descendents
        const descendentList = selectedItemIdList
          .map((itemId) => getDescendentIdList(itemId))
          .flat();
        const isDescendent = descendentList.includes(id);
        if (isDescendent) return;

        setDropStatus({ dropLocation, targetId: id });
      }
    }
  };

  const handleDrop = () => {
    if (isDraggingRef.current) {
      setDropStatus((lastState) => {
        if (lastState.dropLocation) {
          onReorder?.({
            itemIdList: selectedItemIdList,
            targetId: lastState.targetId,
            dropLocation: lastState.dropLocation,
          });
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
      onMouseMove={handleMouseMove}
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
          {icon}
        </div>
        {/* Input to use for renaming */}
        <input
          style={{
            paddingLeft: `calc(3.8rem + (${layer} * 1.8rem))`,
            boxShadow: `0 0 0 0.1rem var(--tw-shadow-color)`,
          }}
          className='pointer-events-none h-full w-full rounded bg-transparent shadow-transparent outline-none transition-shadow focus-visible:shadow-primary'
          type='text'
          defaultValue={value}
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
          <TreeViewRender itemId={id} itemLayer={layer + 1} />
        </div>
      )}
    </div>
  );
});

export default TreeView;
