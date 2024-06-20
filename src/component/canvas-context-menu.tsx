import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/component/ui/context-menu';
import usePaste from '@/hook/clipboard/use-paste';
import useClipboardStore from '@/store/clipboard-store';
import { useShallow } from 'zustand/react/shallow';

type CanvasContextMenuProps = React.PropsWithChildren;

export default function CanvasContextMenu({
  children,
}: CanvasContextMenuProps) {
  const onPaste = usePaste();
  const { setPastePosition, status } = useClipboardStore(
    useShallow((store) => ({
      setPastePosition: store.setPastePosition,
      status: store.status,
    })),
  );
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

  const isPastingAllowed = status.operation;

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger onMouseDown={handleMouseDown}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuItem onClick={handlePaste} disabled={!isPastingAllowed}>
          Paste
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
