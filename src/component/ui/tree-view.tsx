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
import getElementAncestorIdList from '@/utility/canvas/get-element-ancestor-id-list';

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
  let layerItemList = itemList.filter((item) => item.layer === itemLayer);

  if (layerItemList.length) {
    if (itemLayer === 0) {
      return layerItemList.map((item) => (
        <TreeViewItem key={item.id} item={item} />
      ));
    } else {
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
  const isSelectedAncestor = useMemo(
    () =>
      selectedItemIdList
        .map((selectedItemId) => getElementAncestorIdList(selectedItemId))
        .some((list) => list?.some((ancestorId) => ancestorId === id)),
    [selectedItemIdList, id],
  );

  useEffect(() => {
    if (isSelectedAncestor) {
      setExpand(true);
    }
  }, [isSelectedAncestor]);

  const handleExpand: React.MouseEventHandler = (e) => {
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
          isSelected && 'bg-primary text-primary-foreground',
          isSelectedAncestor && 'text-primary',
          isExpanded && 'rounded-bl-none rounded-br-none',
        )}
      >
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
        <div
          style={{ left: `calc(2rem + (${layer} * 1.8rem))` }}
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2',
          )}
        >
          {icon}
        </div>
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
