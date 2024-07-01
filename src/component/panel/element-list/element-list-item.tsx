import EditContextMenu from '@/component/edit-context-menu';
import useReorder from '@/hook/element-list/use-reorder';
import useSelect from '@/hook/element-list/use-select';
import useElementStore, { ElementStoreElement } from '@/store/element-store';
import { CanvasElementType } from '@/type/element-property-types';
import { cn } from '@/utility/general-utilities';
import { FrameIcon, TypeIcon, ImageIcon, ChevronRightIcon } from 'lucide-react';
import { memo, useContext, useRef } from 'react';
import { ElementListContext } from './element-list';
import ElementListRender from './element-list-render';
import useExpand from '@/hook/element-list/use-expand';
import useRename from '@/hook/element-list/use-rename';
import useSelectionStore from '@/store/selection-store';

const iconMap: Record<CanvasElementType, JSX.Element> = {
  FRAME: <FrameIcon size={16} />,
  TEXT: <TypeIcon size={16} />,
  IMAGE: <ImageIcon size={16} />,
};

type ElementListItemProps = {
  element: ElementStoreElement;
  index: number;
};

const ElementListItem = memo(function ({
  element,
  index,
}: ElementListItemProps) {
  const { id, type, displayName, layer } = element;

  const { dropStatus, renameTargetId } = useContext(ElementListContext);

  const elementList = useElementStore((store) => store.elementList);
  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );

  // Select hook
  const handleSelect = useSelect();
  // Expand hook
  const { isExpanded, handleExpand, isAncestorOfSelectedElement } =
    useExpand(id);
  // Rename hook
  const {
    handleChangeRenameTargetOnClick,
    handleChangeRenameTargetOnRightClick,
    handleInputBlur,
    handleInputChange,
    handleInputKeyDown,
    handleItemDoubleClick,
  } = useRename(element);
  // Reorder hook
  const selectOnReleaseRef = useRef(false);
  const { handleReorder, handleDrag } = useReorder(id, selectOnReleaseRef);

  // Check whether element is selected or not
  const isSelected = selectedElementIdList.some(
    (selectedElementId) => selectedElementId === id,
  );

  // Check whether element has children or not
  const hasChildren = elementList.some((item) => item.parentId === id);

  // Check whether element is a drop target
  const isDropTarget = dropStatus.targetId === id;

  const handleMouseDown: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    // Click
    if (e.button === 0) {
      if (isSelected) {
        selectOnReleaseRef.current = true;
      } else {
        handleSelect(id, layer, e.ctrlKey);
      }
      handleReorder();
      handleChangeRenameTargetOnClick();
    }
    // Right click
    else if (e.button === 2) {
      // Disable mutliple selection on right click
      if (!isSelected) {
        handleSelect(id, layer, false);
      }
      handleChangeRenameTargetOnRightClick();
    }
  };

  const handleMouseUp: React.MouseEventHandler = (e) => {
    if (selectOnReleaseRef.current) {
      handleSelect(id, layer, e.ctrlKey);
      selectOnReleaseRef.current = false;
    }
  };

  return (
    <EditContextMenu className='block' useMousePositionForPaste={false}>
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleDrag}
        onDoubleClick={handleItemDoubleClick}
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
            type === 'FRAME' &&
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
            isAncestorOfSelectedElement && 'text-primary',
            isExpanded && 'rounded-bl-none rounded-br-none',
            renameTargetId === id && 'bg-transparent text-foreground',
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
              // Prevent from triggering rename
              onDoubleClick={(e) => e.stopPropagation()}
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
            id={`ELEMENT-LIST-INPUT-${id}`}
            style={{
              paddingLeft: `calc(3.8rem + (${layer} * 1.8rem))`,
            }}
            className={cn(
              'pointer-events-none h-full w-full rounded bg-transparent shadow-transparent outline-none transition-shadow focus-visible:shadow-primary',
              renameTargetId === id &&
                'pointer-events-auto outline outline-2 -outline-offset-2 outline-primary',
            )}
            type='text'
            value={displayName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
          />
        </div>
        {/* Showing children only if item is expanded */}
        {isExpanded && (
          <div
            className={cn(
              'space-y-1',
              isSelected &&
                'rounded-bl rounded-br bg-primary/5 outline outline-[1px] -outline-offset-1 outline-primary',
              isSelected &&
                dropStatus.targetId &&
                'text-primary-foreground outline-none outline-0',
              renameTargetId && 'outline-transparent',
            )}
          >
            <ElementListRender elementId={id} elementLayer={layer + 1} />
          </div>
        )}
      </div>
    </EditContextMenu>
  );
});

export default ElementListItem;
