import { useEffect, useState } from 'react';

export default function useRerender(rerender: boolean) {
  const [_, setRerenderTrigger] = useState(0);

  useEffect(() => {
    // Check if elements exist on the DOM
    if (rerender) {
      const timer = setTimeout(() => {
        setRerenderTrigger((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  });
}
