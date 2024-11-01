import Canvas from './component/editor/canvas';
import LeftPanel from './component/panel/left-panel';
import RightPanel from './component/panel/right-panel';
import TopPanel from './component/panel/top-panel';

import useUIScale from './hook/use-ui-scale';
import usePreventDefaultBrowserZoom from './hook/use-prevent-default-browser-zoom';
import usePanningWithSpaceKey from './hook/canvas/use-panning-with-space-key';
import useCrossLayerSelection from './hook/canvas/use-cross-layer-selection';
import usePreventDefaultContextMenu from './hook/use-prevent-default-context-menu';
import useDeleteWithDelKey from './hook/canvas/use-delete-with-del-key';
import useClipboardWithShortcut from './hook/clipboard/use-clipboard-with-shortcut';

export default function App() {
  usePreventDefaultBrowserZoom();
  usePreventDefaultContextMenu();
  usePanningWithSpaceKey();
  useDeleteWithDelKey();
  useClipboardWithShortcut();
  useCrossLayerSelection();

  const { isLeftPanelVisible, isRightPanelVisible } = useUIScale();

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <TopPanel />
      <div className='relative h-full'>
        <LeftPanel hidden={!isLeftPanelVisible} />
        <Canvas />
        <RightPanel hidden={!isRightPanelVisible} />
      </div>
    </div>
  );
}
