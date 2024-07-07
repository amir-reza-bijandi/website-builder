import { cn } from '@/utility/general-utilities';
import RectProperties from './properties/rect-properties';
import useSelectionStore from '@/store/selection-store';

type RightPanelProps = {
  hidden?: boolean;
};

export default function RightPanel({ hidden }: RightPanelProps) {
  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );
  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 top-0 z-50 flex w-80 flex-col items-center gap-3 border-l bg-background p-3 transition-transform',
        hidden && 'translate-x-full',
      )}
    >
      {selectedElementIdList.length > 0 && <RectProperties />}
    </div>
  );
}
