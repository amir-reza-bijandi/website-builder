import { cn } from '@/utility/general-utilities';
import { ChevronRightIcon } from 'lucide-react';
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ScrollArea } from './scroll-area';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';

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
};

export type TreeViewSelectEventHandler = (event: TreeViewSelectEvent) => void;

type TreeViewProps = {
  itemList: TreeViewItem[];
  selectedItemIdList: string[];
  onSelect?: TreeViewSelectEventHandler;
};

type TreeViewContextValue = TreeViewProps;

const TreeViewContext = createContext<TreeViewContextValue>(
  {} as TreeViewContextValue,
);

const TreeView = memo(function (props: TreeViewProps) {
  // Clear selection when clicked on empty space of tree view
  const handleClearSelection: React.MouseEventHandler = (e) => {
    props.onSelect?.({ ...e, selectedItemId: '', selectedItemLayer: 0 });
  };
  return (
    <ScrollArea className='h-full' onMouseDown={handleClearSelection}>
      <div className='space-y-2'>
        <TreeViewContext.Provider value={props}>
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
      return layerItemList.map((item) => (
        <TreeViewItem key={item.id} item={item} />
      ));
    } else {
      // When rendering lower layers we need to filter items with the same parent
      layerItemList = layerItemList.filter((item) => item.parentId === itemId);
      return layerItemList.map((item) => (
        <TreeViewItem key={item.id} item={item} />
      ));
    }
  }
});

type TreeViewItemProps = {
  item: TreeViewItem;
};

const TreeViewItem = memo(function ({
  item: { id, value, layer, icon },
}: TreeViewItemProps) {
  const { selectedItemIdList, itemList, onSelect } =
    useContext(TreeViewContext);
  const [isExpanded, setExpand] = useState(false);

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
    [selectedItemIdList, id],
  );

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

  const handleSelect: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onSelect?.({ ...e, selectedItemId: id, selectedItemLayer: layer });
  };

  return (
    <div onMouseDown={handleSelect}>
      <div
        className={cn(
          'relative h-10 rounded',
          // Change styles based on current state
          isSelected && 'bg-primary text-primary-foreground',
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
              ' rounded-bl rounded-br bg-primary/5 outline outline-[1px] -outline-offset-1 outline-primary',
          )}
        >
          <TreeViewRender itemId={id} itemLayer={layer + 1} />
        </div>
      )}
    </div>
  );
});

export default TreeView;
