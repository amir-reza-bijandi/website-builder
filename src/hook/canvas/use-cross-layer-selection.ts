import useCanvasStore from '@/store/canvas-store';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function useCrossLayerSelection() {
  const { isCrossLayerSelectionAllowed, setCrossLayerSelection, isFocused } =
    useCanvasStore(
      useShallow((store) => ({
        isCrossLayerSelectionAllowed: store.isCrossLayerSelectionAllowed,
        setCrossLayerSelection: store.setCrossLayerSelection,
        isFocused: store.isFocused,
      })),
    );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocused) {
        if (e.key === 'Control') {
          if (!isCrossLayerSelectionAllowed) {
            setCrossLayerSelection(true);
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isFocused) {
        if (e.key === 'Control') {
          if (isCrossLayerSelectionAllowed) {
            setCrossLayerSelection(false);
          }
        }
      }
    };
    document.body.addEventListener('keydown', handleKeyDown, false);
    document.body.addEventListener('keyup', handleKeyUp, false);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown, false);
      document.body.removeEventListener('keyup', handleKeyUp, false);
    };
  }, [isCrossLayerSelectionAllowed, setCrossLayerSelection, isFocused]);
}
