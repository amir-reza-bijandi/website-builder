import useUIScale from './hook/use-ui-scale';
import Canvas from './components/canvas';
import LeftPanel from './components/left-panel';
import RightPanel from './components/right-panel';
import TopPanel from './components/top-panel';
import usePreventDefaultBrowserZoom from './hook/use-prevent-default-browser-zoom';
import useAllowPanning from './hook/useAllowPanning';
import useCanvasStore from './store/canvas';

useCanvasStore.subscribe(console.log);

export default function App() {
  usePreventDefaultBrowserZoom();
  useAllowPanning();
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
