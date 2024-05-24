import { cn } from '@/lib/utils';

type RightPanelProps = {
  hidden?: boolean;
};

export default function RightPanel({ hidden }: RightPanelProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 top-0 z-50 flex w-80 items-center justify-center border-l transition-transform',
        hidden && 'translate-x-full',
      )}
    >
      Right Panel
    </div>
  );
}
