import { useEffect } from 'react';
import Canvas from './components/canvas';
import LeftPanel from './components/left-panel';
import RightPanel from './components/right-panel';
import TopPanel from './components/top-panel';

import useUIStore from './store/ui';

export default function App() {
  const { isLeftPanelVisible, isRightPanelVisible, uiScale } = useUIStore();

  useEffect(() => {
    // Calculate the new font size based on the UI scale
    const currentSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const targetSize = uiScale * currentSize;
    const newSize = (targetSize * 100) / currentSize;

    // Set the new font size
    document.documentElement.style.fontSize = `${newSize}%`;
  }, [uiScale]);

  return (
    <div className='flex h-screen flex-col'>
      <TopPanel />
      <div className='relative h-full'>
        <LeftPanel hidden={!isLeftPanelVisible} />
        <Canvas />
        <RightPanel hidden={!isRightPanelVisible} />
      </div>
    </div>
  );
}
