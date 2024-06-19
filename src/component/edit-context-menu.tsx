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

type EditContextMenuProps = React.PropsWithChildren<{ className?: string }>;

export default function EditContextMenu({
  children,
  className,
}: EditContextMenuProps) {
  const handleDelete = useDelete();
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
        <ContextMenuItem>
          Cut <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete}>
          Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
