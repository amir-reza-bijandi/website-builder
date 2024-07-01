import getAncestorIdList from './get-ancestor-id-list';
import getElementById from './get-element-by-id';
import getElementIndexWithinLayer from './get-element-index-within-layer';

export default function getOverlapTargetId(elementIdList: string[]) {
  if (elementIdList.length === 0) return null;

  const elementList = elementIdList.map((elementId) =>
    getElementById(elementId),
  );
  const maxLayer = Math.max(
    ...elementList.map((element) => element?.layer ?? 0),
  );

  const indexPointList = elementList.map((element) => {
    if (!element) return 0;
    const elementIndex = getElementIndexWithinLayer(element.id) + 1;
    const elementIndexMultiplier = 10 ** (maxLayer + 1 - element.layer);
    const elementIndexPoint = elementIndexMultiplier * elementIndex;

    const ancestorList = getAncestorIdList(element.id)?.map(
      (elementId) => getElementById(elementId)!,
    );
    if (!ancestorList) return elementIndexPoint;

    const ancestorIndexPoint = ancestorList
      .map((ancestor) => {
        const ancestorIndex = getElementIndexWithinLayer(ancestor.id) + 1;
        const ancestorIndexMultiplier = 10 ** (maxLayer + 1 - ancestor.layer);
        return ancestorIndexMultiplier * ancestorIndex;
      })
      .reduce((acc, cur) => acc + cur, 0);
    return ancestorIndexPoint + elementIndexPoint;
  });

  const maxIndexPoint = Math.max(...indexPointList);
  const elementIndexWithHighestIndexPoint =
    indexPointList.indexOf(maxIndexPoint);

  return elementIdList[elementIndexWithHighestIndexPoint];
}
