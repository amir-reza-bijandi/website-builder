import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from '@/component/ui/context-menu';
import usePaste from '@/hook/clipboard/use-paste';
import useClipboardStore from '@/store/clipboard-store';

type CanvasContextMenuProps = React.PropsWithChildren;

export default function CanvasContextMenu({
  children,
}: CanvasContextMenuProps) {
  const onPaste = usePaste();
  const setPastePosition = useClipboardStore((store) => store.setPastePosition);
  const handlePaste = () => {
    onPaste(true);
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

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger onMouseDown={handleMouseDown}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuItem onClick={handlePaste}>
          Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
