import CONFIG from '@/config';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/component/ui/menubar';
import useUIStore from '@/store/ui-store';
import useCanvasStore from '@/store/canvas-store';
import createZoomView from '@/utility/canvas/create-zoom-view';
import { useShallow } from 'zustand/react/shallow';
import useDelete from '@/hook/canvas/use-delete';
import useChangeOrder from '@/hook/canvas/use-change-order';
import useClipboardOperation from '@/hook/clipboard/use-clipboard-operation';
import usePaste from '@/hook/clipboard/use-paste';
import useSelectionStore from '@/store/selection-store';

export default function GlobalMenubar() {
  const {
    isLeftPanelVisible,
    isRightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
    setUiScale,
    uiScale,
  } = useUIStore();

  const { view, setView } = useCanvasStore(
    useShallow((store) => ({
      view: store.view,
      setView: store.setView,
    })),
  );
  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );

  const isAnyElementSelected = selectedElementIdList.length > 0;

  const handleUIScaleUp: React.MouseEventHandler = () => {
    setUiScale(Number((uiScale + 0.1).toFixed(1)));
  };

  const handleUIScaleDown: React.MouseEventHandler = () => {
    setUiScale(Number((uiScale - 0.1).toFixed(1)));
  };

  const handleUIScaleRest: React.MouseEventHandler = () => {
    setUiScale(CONFIG.UI_SCALE);
  };

  const handleZoomIn: React.MouseEventHandler = () => {
    const canvas = document.getElementById('canvas')!;
    setView(
      createZoomView(canvas, view.zoomFactor * CONFIG.ZOOM_FACTOR_MULTIPLIER),
    );
  };

  const handleZoomOut: React.MouseEventHandler = () => {
    const canvas = document.getElementById('canvas')!;
    setView(
      createZoomView(canvas, view.zoomFactor / CONFIG.ZOOM_FACTOR_MULTIPLIER),
    );
  };

  const handleZoomReset: React.MouseEventHandler = () => {
    const canvas = document.getElementById('canvas')!;
    setView(createZoomView(canvas, 1));
  };

  const onDelete = useDelete();
  const onCut = useClipboardOperation('CUT');
  const onCopy = useClipboardOperation('COPY');
  const onPaste = usePaste();
  const onBringToFront = useChangeOrder('BRING_TO_FRONT');
  const onSendToBack = useChangeOrder('SEND_TO_BACK');

  const handleEditContextMenuSelect = (
    action:
      | 'CUT'
      | 'COPY'
      | 'DELETE'
      | 'PASTE'
      | 'BRING_TO_FRONT'
      | 'SEND_TO_BACK',
  ) => {
    if (action === 'CUT') onCut();
    else if (action === 'COPY') onCopy();
    else if (action === 'PASTE') onPaste(false);
    else if (action === 'DELETE') onDelete();
    else if (action === 'SEND_TO_BACK') onSendToBack();
    else if (action === 'BRING_TO_FRONT') onBringToFront();
  };

  return (
    <Menubar className='rounded-none border-none'>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New <MenubarShortcut>Ctrl+N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Save <MenubarShortcut>Ctrl+S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Import</MenubarItem>
          <MenubarItem>Export</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Redo <MenubarShortcut>Ctrl+Shift+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            disabled={!isAnyElementSelected}
            onMouseDown={() => handleEditContextMenuSelect('BRING_TO_FRONT')}
          >
            Bring To Front <MenubarShortcut>Ctrl+&#125;</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            disabled={!isAnyElementSelected}
            onMouseDown={() => handleEditContextMenuSelect('SEND_TO_BACK')}
          >
            Send To Back <MenubarShortcut>Ctrl+&#123;</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            disabled={!isAnyElementSelected}
            onMouseDown={() => handleEditContextMenuSelect('CUT')}
          >
            Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            disabled={!isAnyElementSelected}
            onMouseDown={() => handleEditContextMenuSelect('COPY')}
          >
            Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            disabled={!isAnyElementSelected}
            onMouseDown={() => handleEditContextMenuSelect('PASTE')}
          >
            Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            disabled={!isAnyElementSelected}
            onMouseDown={() => handleEditContextMenuSelect('DELETE')}
          >
            Delete <MenubarShortcut>Del</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent className='w-64'>
          <MenubarCheckboxItem
            checked={isLeftPanelVisible}
            onMouseDown={toggleLeftPanel}
          >
            Show Left Penel
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={isRightPanelVisible}
            onMouseDown={toggleRightPanel}
          >
            Show Right Panel
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            onMouseDown={handleZoomIn}
            disabled={view.zoomState === 'MAX'}
          >
            Zoom + <MenubarShortcut>Ctrl++</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            inset
            onMouseDown={handleZoomOut}
            disabled={view.zoomState === 'MIN'}
          >
            Zoom - <MenubarShortcut>Ctrl+-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset onMouseDown={handleZoomReset}>
            Reset Zoom <MenubarShortcut>Ctrl+0</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            disabled={uiScale === CONFIG.MAX_UI_SCALE}
            onMouseDown={handleUIScaleUp}
          >
            UI Scale +<MenubarShortcut>Shift+Ctrl++</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            inset
            disabled={uiScale === CONFIG.MIN_UI_SCALE}
            onMouseDown={handleUIScaleDown}
          >
            UI Scale -<MenubarShortcut>Shift+Ctrl+-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset onMouseDown={handleUIScaleRest}>
            Reset UI Scale
            <MenubarShortcut>Shift+Ctrl+0</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Documentation <MenubarShortcut>F1</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Tutorials</MenubarItem>
          <MenubarItem>Shortcuts</MenubarItem>
          <MenubarItem>About</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
