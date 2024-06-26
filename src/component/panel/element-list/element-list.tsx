import { memo, useState, useRef, createContext } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ScrollArea } from '@/component/ui/scroll-area';
import ElementListRender from './element-list-render';
import type { Placement } from '@/type/general-types';
import useSelectionStore from '@/store/selection-store';

type DropStatus = {
  targetId: string;
  dropLocation: Placement | null;
};

type ElementListContextValue = {
  isMouseDownRef: React.MutableRefObject<boolean>;
  isDraggingRef: React.MutableRefObject<boolean>;
  dropStatus: DropStatus;
  setDropStatus: React.Dispatch<React.SetStateAction<DropStatus>>;
  renameTargetId: string;
  setRenameTargetId: React.Dispatch<React.SetStateAction<string>>;
};

export const ElementListContext = createContext<ElementListContextValue>(
  {} as ElementListContextValue,
);

const ElementList = memo(function () {
  const { setSelectedElementIdList } = useSelectionStore(
    useShallow((store) => ({
      setSelectedElementIdList: store.setSelectedElementIdList,
    })),
  );
  const [dropStatus, setDropStatus] = useState<DropStatus>({
    targetId: '',
    dropLocation: null,
  });
  const [renameTargetId, setRenameTargetId] = useState('');
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);

  // Clear selection when clicked on empty space of tree view
  const handleClearSelection: React.MouseEventHandler = (e) => {
    // Only clear selection if the context menu is not the target
    const contextMenu = document.getElementById('edit-context-menu');
    if (contextMenu) {
      if (contextMenu.contains(e.target as Node)) {
        return;
      }
    }
    setSelectedElementIdList([], { isSelectionVisible: false });
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
      <div className='space-y-1'>
        <ElementListContext.Provider
          value={{
            dropStatus,
            setDropStatus,
            isDraggingRef,
            isMouseDownRef,
            renameTargetId,
            setRenameTargetId,
          }}
        >
          <ElementListRender />
        </ElementListContext.Provider>
      </div>
    </ScrollArea>
  );
});

export default ElementList;
