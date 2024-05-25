import { useEffect } from 'react';
import useUIStore from '@/store/ui';

export default function useUIScale() {
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

  return { isLeftPanelVisible, isRightPanelVisible };
}
