import { useEffect } from 'react';
import usePaste from './use-paste';
import useClipboardOperation from './use-clipboard-operation';

export default function useClipboardWithShortcut() {
  const handlePaste = usePaste();
  const handleCopy = useClipboardOperation('COPY');
  const handleCut = useClipboardOperation('CUT');

  useEffect(() => {
    const handlePasteWithShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === 'v') {
          handlePaste(false);
        } else if (e.key === 'c') {
          handleCopy();
        } else if (e.key === 'x') {
          handleCut();
        }
      }
    };

    document.addEventListener('keydown', handlePasteWithShortcut, false);
    return () =>
      document.removeEventListener('keydown', handlePasteWithShortcut);
  }, [handlePaste]);
}
