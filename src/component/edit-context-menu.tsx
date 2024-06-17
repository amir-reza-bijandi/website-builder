import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/component/ui/context-menu';

type EditContextMenuProps = React.PropsWithChildren;

export default function EditContextMenu({ children }: EditContextMenuProps) {
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent
        id='edit-context-menu'
        onMouseDown={(e) => {
          if (e.button === 2) {
            e.preventDefault();
          }
        }}
      >
        <ContextMenuItem>Bring To Front</ContextMenuItem>
        <ContextMenuItem>Send To Back</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
