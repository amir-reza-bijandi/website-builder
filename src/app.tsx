import Canvas from './component/editor/canvas';
import LeftPanel from './component/panel/left-panel';
import RightPanel from './component/panel/right-panel';
import TopPanel from './component/panel/top-panel';

import useUIScale from './hook/use-ui-scale';
import usePreventDefaultBrowserZoom from './hook/use-prevent-default-browser-zoom';
import usePanningWithSpaceKey from './hook/use-panning-with-space-key';

export default function App() {
  usePreventDefaultBrowserZoom();
  usePanningWithSpaceKey();
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
