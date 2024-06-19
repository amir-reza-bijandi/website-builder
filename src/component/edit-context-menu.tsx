import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/component/ui/context-menu';

type EditContextMenuProps = React.PropsWithChildren<{ className?: string }>;

export default function EditContextMenu({
  children,
  className,
}: EditContextMenuProps) {
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
        <ContextMenuItem>
          Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
