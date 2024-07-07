import useElementStore from '@/store/element-store';

export default function useElementList(elementIdList: string[]) {
  const elementList = useElementStore((store) => store.elementList);
  return elementList.filter((element) =>
    elementIdList.some((elementId) => elementId === element.id),
  );
}
