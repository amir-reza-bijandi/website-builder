import { CanvasStoreElement } from '@/type/canvas-store-types';
import { memo } from 'react';
import Frame from './element/frame-element';
import Text from './element/text-element';
import Image from './element/image-element';
import useCanvasStore from '@/store/canvas-store';

type RenderProps = {
  elementId?: string;
  layer?: number;
};

export default function Render({ elementId, layer = 0 }: RenderProps) {
  const elementList = useCanvasStore((store) => store.elementList);
  let layerElementList = elementList.filter(
    (element) => element.layer === layer,
  );

  if (layerElementList.length) {
    if (layer === 0 && !elementId) {
      return layerElementList.map((element) => (
        <CanvasElement key={element.id} element={element} />
      ));
    } else {
      layerElementList = elementList.filter(
        (element) => element.parentId === elementId && element.layer === layer,
      );
      return layerElementList.map((element) => (
        <CanvasElement key={element.id} element={element} />
      ));
    }
  }
}

type CanvasElementProps = {
  element: CanvasStoreElement;
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
