import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from '@/component/ui/context-menu';
import usePaste from '@/hook/clipboard/use-paste';

type CanvasContextMenuProps = React.PropsWithChildren;

export default function CanvasContextMenu({
  children,
}: CanvasContextMenuProps) {
  const onPaste = usePaste();
  const handlePaste: React.MouseEventHandler = ({ clientX, clientY }) => {
    onPaste({ x: clientX, y: clientY });
  };
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuItem onClick={handlePaste}>
          Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
