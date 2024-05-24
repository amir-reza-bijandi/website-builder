import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import useUIStore from '@/store/ui';
import CONFIG from '@/config';

export default function GlobalMenubar() {
  const {
    isLeftPanelVisible,
    isRightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
    setUiScale,
    uiScale,
  } = useUIStore();

  const handleUIScaleUp: React.MouseEventHandler = () => {
    setUiScale(Number((uiScale + 0.1).toFixed(1)));
  };

  const handleUIScaleDown: React.MouseEventHandler = () => {
    setUiScale(Number((uiScale - 0.1).toFixed(1)));
  };

  const handleRestUIScale: React.MouseEventHandler = () => {
    setUiScale(CONFIG.UI_SCALE);
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
          <MenubarItem>
            Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>Ctrl+Shift+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Bring To Front <MenubarShortcut>Ctrl+&#125;</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Send To Back <MenubarShortcut>Ctrl+&#123;</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
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
          <MenubarItem inset>
            Zoom + <MenubarShortcut>Ctrl++</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset>
            Zoom - <MenubarShortcut>Ctrl+-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem inset>
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
          <MenubarItem inset onClick={handleRestUIScale}>
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
