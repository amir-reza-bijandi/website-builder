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
    const elementIndex = getElementIndexWithinLayer(element.id);
    const elementIndexMultiplier = maxLayer + 1 - element.layer;
    const ancestorList = getAncestorIdList(element.id)?.map(
      (elementId) => getElementById(elementId)!,
    );
    if (!ancestorList) return elementIndexMultiplier * (elementIndex + 1);

    const indexPoint = ancestorList
      .map((ancestor) => {
        const ancestorIndex = getElementIndexWithinLayer(ancestor.id);
        const ancestorIndexMultiplier = maxLayer + 1 - ancestor.layer;

        return ancestorIndexMultiplier * (ancestorIndex + 1);
      })
      .reduce((acc, cur) => acc + cur, 0);
    return indexPoint;
  });

  const maxIndexPoint = Math.max(...indexPointList);
  const elementIndexWithHighestIndexPoint =
    indexPointList.indexOf(maxIndexPoint);

  return elementIdList[elementIndexWithHighestIndexPoint];
}
