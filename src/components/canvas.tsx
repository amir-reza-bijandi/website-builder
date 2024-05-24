export default function Canvas() {
  return (
    <main className='relative w-full overflow-hidden'>
      <div className='absolute left-1/2 top-1/2 flex h-[10000px] w-[10000px] -translate-x-1/2 -translate-y-1/2 items-center justify-center'>
        This is the center of the canvas
      </div>
    </main>
  );
}
