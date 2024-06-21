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
import useChangeOrder from '@/hook/canvas/use-change-order';

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
  const onBringToFront = useChangeOrder('BRING_TO_FRONT');
  const onSendToBack = useChangeOrder('SEND_TO_BACK');

  const handleEditContextMenuSelect = (
    e: React.MouseEvent,
    action:
      | 'CUT'
      | 'COPY'
      | 'DELETE'
      | 'PASTE'
      | 'BRING_TO_FRONT'
      | 'SEND_TO_BACK',
  ) => {
    e.stopPropagation();
    if (action === 'CUT') onCut();
    else if (action === 'COPY') onCopy();
    else if (action === 'PASTE') onPaste(useMousePositionForPaste);
    else if (action === 'DELETE') onDelete();
    else if (action === 'SEND_TO_BACK') onSendToBack();
    else if (action === 'BRING_TO_FRONT') onBringToFront();
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
        <ContextMenuItem
          onMouseDown={(e) => handleEditContextMenuSelect(e, 'BRING_TO_FRONT')}
        >
          Bring To Front <ContextMenuShortcut>Ctrl+&#125;</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onMouseDown={(e) => handleEditContextMenuSelect(e, 'SEND_TO_BACK')}
        >
          Send To Back <ContextMenuShortcut>Ctrl+&#123;</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onMouseDown={(e) => handleEditContextMenuSelect(e, 'CUT')}
        >
          Cut <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onMouseDown={(e) => handleEditContextMenuSelect(e, 'COPY')}
        >
          Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onMouseDown={(e) => handleEditContextMenuSelect(e, 'PASTE')}
          disabled={!isPastingAllowed}
        >
          Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onMouseDown={(e) => handleEditContextMenuSelect(e, 'DELETE')}
        >
          Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
