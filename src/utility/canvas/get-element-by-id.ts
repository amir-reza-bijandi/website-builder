import useElementStore from '@/store/element-store';

export default function getElementById(elementId: string) {
  return useElementStore
    .getState()
    .elementList.find((element) => element.id === elementId);
}
