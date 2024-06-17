import { cn } from '@/utility/general-utilities';
import Toolbox from './toolbox';
import ElementList from './element-list/element-list';

type LeftPanelProps = {
  hidden?: boolean;
};

export default function LeftPanel({ hidden = false }: LeftPanelProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 top-0 z-50 w-80 items-center border-r bg-background p-3 transition-transform',
        hidden && '-translate-x-full',
      )}
    >
      <ElementList />
      <Toolbox />
    </div>
  );
}
