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

type EditContextMenuProps = React.PropsWithChildren<{ className?: string }>;

export default function EditContextMenu({
  children,
  className,
}: EditContextMenuProps) {
  const onDelete = useDelete();
  const onCut = useClipboardOperation('CUT');
  const onCopy = useClipboardOperation('COPY');
  const onPaste = usePaste();

  const handleDelete = () => {
    onDelete();
  };

  const handleCut = () => {
    onCut();
  };

  const handleCopy = () => {
    onCopy();
  };

  const handlePaste = () => {
    onPaste();
  };

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuItem>
          Bring To Front <ContextMenuShortcut>Ctrl+&#125;</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Send To Back <ContextMenuShortcut>Ctrl+&#123;</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleCut}>
          Cut <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste}>
          Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete}>
          Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
