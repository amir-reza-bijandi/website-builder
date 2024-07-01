import useElementStore, { ElementStoreElement } from '@/store/element-store';
import { memo } from 'react';
import Frame from './element/frame-element';
import Text from './element/text-element';
import Image from './element/image-element';

type RenderProps = {
  elementId?: string;
  layer?: number;
};

export default function Render({ elementId, layer = 0 }: RenderProps) {
  const elementList = useElementStore((store) => store.elementList);
  // Filter element that are in the desired layer
  let layerElementList = elementList.filter(
    (element) => element.layer === layer,
  );

  if (layerElementList.length) {
    if (layer === 0 && !elementId) {
      return layerElementList.map((element) => (
        <CanvasElement key={element.id} element={element} />
      ));
    } else {
      // When rendering lower layers we need to filter elements with the same parent
      layerElementList = layerElementList.filter(
        (element) => element.parentId === elementId,
      );
      return layerElementList.map((element) => (
        <CanvasElement key={element.id} element={element} />
      ));
    }
  }
}

type CanvasElementProps = {
  element: ElementStoreElement;
};

const CanvasElement = memo(function ({ element }: CanvasElementProps) {
  switch (element.type) {
    case 'FRAME':
      return <Frame key={element.id} element={element} />;
    case 'TEXT':
      return <Text key={element.id} element={element} />;
    case 'IMAGE':
      return <Image key={element.id} element={element} />;
  }
});
