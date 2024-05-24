import Canvas from './components/canvas';
import LeftPanel from './components/left-panel';
import RightPanel from './components/right-panel';
import TopPanel from './components/top-panel';

export default function App() {
  return (
    <div className='grid h-screen grid-cols-[330px_1fr_330px] grid-rows-[auto_1fr]'>
      <TopPanel />
      <LeftPanel />
      <Canvas />
      <RightPanel />
    </div>
  );
}
