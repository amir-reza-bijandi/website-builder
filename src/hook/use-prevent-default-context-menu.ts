import { useEffect } from 'react';

export default function usePreventDefaultContextMenu() {
  const handleContextMenu = (e: Event) => {
    e.preventDefault();
  };
  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
}
