import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/component/ui/context-menu';
import useDelete from '@/hook/canvas/use-delete';
import React from 'react';
import usePaste from '@/hook/clipboard/use-paste';
import useClipboardOperation from '@/hook/clipboard/use-clipboard-operation';
import useClipboardStore from '@/store/clipboard-store';
import { useShallow } from 'zustand/react/shallow';

type EditContextMenuProps = React.PropsWithChildren<{
  className?: string;
  useMousePositionForPaste?: boolean;
}>;

export default function EditContextMenu({
  children,
  className,
  useMousePositionForPaste = true,
}: EditContextMenuProps) {
  const { setPastePosition, status } = useClipboardStore(
    useShallow((store) => ({
      setPastePosition: store.setPastePosition,
      status: store.status,
    })),
  );

  const onDelete = useDelete();
  const onCut = useClipboardOperation('CUT');
  const onCopy = useClipboardOperation('COPY');
  const onPaste = usePaste();

  const handleDelete: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const handleCut: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onCut();
  };

  const handleCopy: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onCopy();
  };

  const handlePaste: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onPaste(useMousePositionForPaste);
  };

  // Set paste position whenever context menu appears
  const handleMouseDown: React.MouseEventHandler = ({
    clientX,
    clientY,
    button,
  }) => {
    if (button === 2) {
      setPastePosition({ x: clientX, y: clientY });
    }
  };

  const isPastingAllowed = status.operation;

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger className={className} onMouseDown={handleMouseDown}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuItem>
          Bring To Front <ContextMenuShortcut>Ctrl+&#125;</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Send To Back <ContextMenuShortcut>Ctrl+&#123;</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onMouseDown={handleCut}>
          Cut <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onMouseDown={handleCopy}>
          Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onMouseDown={handlePaste} disabled={!isPastingAllowed}>
          Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onMouseDown={handleDelete}>
          Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
