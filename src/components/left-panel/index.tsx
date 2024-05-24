import { cn } from '@/lib/utils';

type LeftPanelProps = {
  hidden?: boolean;
};

export default function LeftPanel({ hidden = false }: LeftPanelProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 top-0 flex w-80 items-center justify-center border-r transition-transform',
        hidden && '-translate-x-full',
      )}
    >
      Left Panel
    </div>
  );
}