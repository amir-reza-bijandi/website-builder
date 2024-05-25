import { FrameIcon, ImageIcon, MousePointerIcon, TypeIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import useCanvasStore, { CanvasTool } from '@/store/canvas';

type Tool = {
  type: Exclude<CanvasTool, null | undefined>;
  icon: React.ReactNode;
  label: string;
};

const toolbox: Readonly<Tool[]> = [
  { type: 'FRAME', icon: <FrameIcon />, label: 'Frame' },
  { type: 'TEXT', icon: <TypeIcon />, label: 'Text' },
  { type: 'IMAGE', icon: <ImageIcon />, label: 'Image' },
];

export default function Toolbox() {
  const {
    toolbox: { tool },
    setToolbox,
  } = useCanvasStore();

  const handleToolChange = (value: string) => {
    if (!value) return;
    if (value === 'SELECT') {
      setToolbox({ action: 'SELECT' });
    } else {
      setToolbox({ action: 'ADD', tool: value as CanvasTool });
    }
  };

  return (
    <ToggleGroup
      type='single'
      value={tool ? tool : 'SELECT'}
      onValueChange={handleToolChange}
      className='absolute left-full top-0 m-2 flex gap-1 rounded border p-1'
    >
      <ToggleGroupItem
        value={'SELECT'}
        className='hover:bg-primary/50 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        aria-label={`Switch to select tool`}
      >
        <MousePointerIcon />
      </ToggleGroupItem>

      {toolbox.map((tool) => (
        <ToggleGroupItem
          key={tool.type}
          value={tool.type}
          className='hover:bg-primary/50 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          aria-label={`Switch to ${tool.label} tool`}
        >
          {tool.icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
