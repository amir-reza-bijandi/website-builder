import { AbsoluteRect, Position } from '@/type/general-types';
import scaleWithZoomLevel from './scale-with-zoom-level';

export default function calculateDrawingRect(
  initialPointerPosition: Position,
  currentPointerPosition: Position,
  originRect: AbsoluteRect,
): AbsoluteRect {
  const scaledInitialPointerPosition = scaleWithZoomLevel(
    initialPointerPosition,
  );
  const scaledCurrentPointerPosition = scaleWithZoomLevel(
    currentPointerPosition,
  );
  const scaledOriginRect = scaleWithZoomLevel(originRect);

  const left =
    scaledCurrentPointerPosition.x - scaledInitialPointerPosition.x >= 0
      ? scaledInitialPointerPosition.x - scaledOriginRect.left
      : scaledCurrentPointerPosition.x - scaledOriginRect.left;
  const top =
    scaledCurrentPointerPosition.y - scaledInitialPointerPosition.y >= 0
      ? scaledInitialPointerPosition.y - scaledOriginRect.top
      : scaledCurrentPointerPosition.y - scaledOriginRect.top;
  const right =
    scaledCurrentPointerPosition.x - scaledInitialPointerPosition.x >= 0
      ? scaledOriginRect.right - scaledCurrentPointerPosition.x
      : scaledOriginRect.right - scaledInitialPointerPosition.x;
  const bottom =
    scaledCurrentPointerPosition.y - scaledInitialPointerPosition.y >= 0
      ? scaledOriginRect.bottom - scaledCurrentPointerPosition.y
      : scaledOriginRect.bottom - scaledInitialPointerPosition.y;

  return { left, right, top, bottom };
}
