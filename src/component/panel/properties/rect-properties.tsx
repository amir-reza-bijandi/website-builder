import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useSelectionStore from '@/store/selection-store';
import useElementStore, { ElementStoreElement } from '@/store/element-store';
import { CanvasElementPositioning } from '@/type/element-property-types';
import createElement from '@/utility/canvas/create-element';
import scaleWithZoomLevel from '@/utility/canvas/scale-with-zoom-level';

const RectInputContext = createContext({
  elementList: [] as ElementStoreElement[],
  rect: { x: 0, y: 0, width: 0, height: 0 },
  hasSameRect: {
    x: false,
    y: false,
    width: false,
    height: false,
  },
});

export default function RectProperties() {
  const elementList = useElementStore((store) => store.elementList);
  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );

  const selectedElementList = useMemo(
    () =>
      elementList.filter((element) =>
        selectedElementIdList.some((elementId) => elementId === element.id),
      ),
    [elementList, selectedElementIdList],
  );

  const [hasSameRect, setHasSameRect] = useState({
    x: false,
    y: false,
    width: false,
    height: false,
  });

  const rectRef = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (selectedElementList.length > 0) {
      const hasSameX = hasSameRectPropertyValue(selectedElementList, 'LEFT');
      const hasSameY = hasSameRectPropertyValue(selectedElementList, 'TOP');
      const hasSameWidth = hasSameSize(selectedElementList, 'WIDTH');
      const hasSameHeight = hasSameSize(selectedElementList, 'HEIGHT');

      setHasSameRect({
        x: hasSameX,
        y: hasSameY,
        width: hasSameWidth,
        height: hasSameHeight,
      });
    }

    if (selectedElementList[0]?.position.mode === 'ABSOLUTE') {
      let { left: x, top: y } = selectedElementList[0].position;
      x = +x;
      y = +y;

      const { width, height } = scaleWithZoomLevel(
        document
          .getElementById(selectedElementList[0].id)!
          .getBoundingClientRect(),
      );

      rectRef.current = {
        x,
        y,
        width,
        height,
      };
    }
  }, [selectedElementList]);

  return (
    <RectInputContext.Provider
      value={{
        elementList: selectedElementList,
        rect: rectRef.current,
        hasSameRect,
      }}
    >
      <div className='flex flex-col gap-3'>
        {/* Position */}
        <div className='flex w-full justify-between gap-4'>
          <RectInput label='X' />
          <RectInput label='Y' />
        </div>
        {/* Size */}
        <div className='flex w-full justify-between gap-4'>
          <RectInput label='W' />
          <RectInput label='H' />
        </div>
      </div>
    </RectInputContext.Provider>
  );
}

type RectInputStringLabel = 'W' | 'H' | 'X' | 'Y';

type RectInputProps = {
  label: RectInputStringLabel | JSX.Element;
};

function RectInput({ label }: RectInputProps) {
  const labelMap: Record<RectInputStringLabel, keyof typeof rect> = useMemo(
    () => ({
      H: 'height',
      W: 'width',
      X: 'x',
      Y: 'y',
    }),
    [],
  );

  const updateElement = useElementStore((store) => store.updateElement);
  const { elementList, rect, hasSameRect } = useContext(RectInputContext);
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(
      typeof label === 'string'
        ? hasSameRect[labelMap[label]]
          ? String(rect[labelMap[label]])
          : 'Mixed'
        : '',
    );
  }, [hasSameRect, label, labelMap, rect]);

  const handleSubmit: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      let useLastValue = false;
      const newValue = e.currentTarget.value;

      if (newValue === 'Mixed') {
        useLastValue = true;
      } else {
        if (isNaN(Number(newValue))) {
          useLastValue = true;
        }
      }

      if (label === 'X' || label === 'Y') {
        updateElement(
          ...elementList.map((element) =>
            element.position.mode === 'ABSOLUTE'
              ? createElement(element.type, {
                  ...element,
                  position: {
                    ...element.position,
                    ...(label === 'X'
                      ? {
                          left: useLastValue
                            ? element.position.left
                            : element.position.left === +newValue
                              ? element.position.left
                              : +newValue,
                          right: useLastValue
                            ? element.position.right
                            : +element.position.right +
                              (+element.position.left - +newValue),
                        }
                      : {}),
                    ...(label === 'Y'
                      ? {
                          top: useLastValue
                            ? element.position.top
                            : element.position.top === +newValue
                              ? element.position.top
                              : +newValue,
                          bottom: useLastValue
                            ? element.position.bottom
                            : +element.position.bottom +
                              (+element.position.top - +newValue),
                        }
                      : {}),
                  },
                })!
              : element,
          ),
        );
      } else {
        updateElement(
          ...elementList.map((element) =>
            element.position.mode === 'ABSOLUTE'
              ? createElement(element.type, {
                  ...element,
                  position: {
                    ...element.position,
                    ...(label === 'W'
                      ? {
                          right: useLastValue
                            ? element.position.right
                            : +element.position.right +
                              (scaleWithZoomLevel(
                                document
                                  .getElementById(element.id)!
                                  .getBoundingClientRect(),
                              ).width -
                                +newValue),
                        }
                      : {}),
                    ...(label === 'H'
                      ? {
                          bottom: useLastValue
                            ? element.position.bottom
                            : +element.position.bottom +
                              (scaleWithZoomLevel(
                                document
                                  .getElementById(element.id)!
                                  .getBoundingClientRect(),
                              ).height -
                                +newValue),
                        }
                      : {}),
                  },
                })!
              : element,
          ),
        );
      }
    }
  };

  return (
    <div className='flex flex-1 items-center gap-2'>
      <Label className='block w-[0.875rem]'>{label}</Label>
      <Input
        className='transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0'
        value={value}
        onKeyDown={handleSubmit}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </div>
  );
}

type RectProperty = Uppercase<keyof CanvasElementPositioning>;

function hasSameRectPropertyValue(
  elementList: ElementStoreElement[],
  propertyName: RectProperty,
) {
  return elementList.every(
    (element) =>
      element.position.mode === 'ABSOLUTE' &&
      elementList[0].position.mode === 'ABSOLUTE' &&
      element.position[
        propertyName.toLowerCase() as Lowercase<RectProperty>
      ] ===
        elementList[0].position[
          propertyName.toLowerCase() as Lowercase<RectProperty>
        ],
  );
}

function hasSameSize(
  elementList: ElementStoreElement[],
  size: 'WIDTH' | 'HEIGHT',
) {
  const width = scaleWithZoomLevel(
    document.getElementById(elementList[0]?.id)!.getBoundingClientRect(),
  ).width;
  const height = scaleWithZoomLevel(
    document.getElementById(elementList[0]?.id)!.getBoundingClientRect(),
  ).height;

  return elementList.every((element) =>
    size === 'WIDTH'
      ? scaleWithZoomLevel(
          document.getElementById(element.id)!.getBoundingClientRect(),
        ).width === width
      : scaleWithZoomLevel(
          document.getElementById(element.id)!.getBoundingClientRect(),
        ).height === height,
  );
}
