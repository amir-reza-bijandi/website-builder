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

export default function GlobalMenubar() {
  const {
    isLeftPanelVisible,
    isRightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
    setUiScale,
    uiScale,
  } = useUIStore();

  const { view, setView, selectedElementIdList } = useCanvasStore(
    useShallow((store) => ({
      view: store.view,
      setView: store.setView,
      selectedElementIdList: store.selectedElementIdList,
    })),
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

  const handleDelete = () => {
    onDelete();
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
          <MenubarItem disabled={!isAnyElementSelected}>
            Bring To Front <MenubarShortcut>Ctrl+&#125;</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!isAnyElementSelected}>
            Send To Back <MenubarShortcut>Ctrl+&#123;</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled={!isAnyElementSelected}>
            Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!isAnyElementSelected}>
            Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!isAnyElementSelected}>
            Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!isAnyElementSelected} onClick={handleDelete}>
            Delete <MenubarShortcut>Del</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent className='w-64'>
          <MenubarCheckboxItem
            checked={isLeftPanelVisible}
            onClick={toggleLeftPanel}
          >
            Show Left Penel
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={isRightPanelVisible}
            onClick={toggleRightPanel}
          >
            Show Right Panel
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            onClick={handleZoomIn}
            disabled={view.zoomState === 'MAX'}
          >
            Zoom + <MenubarShortcut>Ctrl++</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            inset
            onClick={handleZoomOut}
            disabled={view.zoomState === 'MIN'}
          >
            Zoom - <MenubarShortcut>Ctrl+-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset onClick={handleZoomReset}>
            Reset Zoom <MenubarShortcut>Ctrl+0</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            disabled={uiScale === CONFIG.MAX_UI_SCALE}
            onClick={handleUIScaleUp}
          >
            UI Scale +<MenubarShortcut>Shift+Ctrl++</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            inset
            disabled={uiScale === CONFIG.MIN_UI_SCALE}
            onClick={handleUIScaleDown}
          >
            UI Scale -<MenubarShortcut>Shift+Ctrl+-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset onClick={handleUIScaleRest}>
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
