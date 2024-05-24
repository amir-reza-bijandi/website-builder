import MainMenubar from './main-menubar';

export default function TopPanel() {
  return (
    <header className='col-span-3 flex items-center gap-2 border-b px-4'>
      <h1 className='text-glg font-semibold text-primary'>Builder</h1>
      <MainMenubar />
    </header>
  );
}
