import { memo } from 'react';
import ElementListItem from './element-list-item';
import useElementStore from '@/store/element-store';

type ElementListRenderProps = {
  elementId?: string;
  elementLayer?: number;
};

const ElementListRender = memo(function ({
  elementId,
  elementLayer = 0,
}: ElementListRenderProps) {
  const elementList = useElementStore((store) => store.elementList);
  // Filter item that are in the desired layer
  let layerElementList = elementList.filter(
    (item) => item.layer === elementLayer,
  );

  if (layerElementList.length) {
    if (elementLayer === 0) {
      return layerElementList.map((element, index) => (
        <ElementListItem key={element.id} element={element} index={index} />
      ));
    } else {
      // When rendering lower layers we need to filter items with the same parent
      layerElementList = layerElementList.filter(
        (element) => element.parentId === elementId,
      );
      return layerElementList.map((element, index) => (
        <ElementListItem key={element.id} element={element} index={index} />
      ));
    }
  }
});

export default ElementListRender;
