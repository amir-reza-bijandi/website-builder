import { ElementListContext } from '@/component/panel/element-list/element-list';
import getElementById from '@/utility/canvas/get-element-by-id';
import { capitalize } from '@/utility/general-utilities';
import { useContext } from 'react';
import createElement from '@/utility/canvas/create-element';
import { CanvasStoreElement } from '@/type/canvas-store-types';
import useCanvasStore from '@/store/canvas-store';

export default function useRename(element: CanvasStoreElement) {
  const { id, type } = element;
  const updateElement = useCanvasStore((store) => store.updateElement);
  const { setRenameTargetId, renameTargetId } = useContext(ElementListContext);

  const handleItemDoubleClick: React.MouseEventHandler<HTMLDivElement> = (
    e,
  ) => {
    e.stopPropagation();
    setRenameTarget(id);

    // Focus the input
    const input = e.currentTarget.querySelector('input');
    if (input) {
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }
  };

  // Update element display name on every key press
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = ({
    currentTarget: input,
  }) => {
    const updatedElement = createElement(type, {
      ...element,
      displayName: input.value,
    })!;
    updateElement(updatedElement);
  };

  // Rename element when the enter or escape key is pressed
  const handleInputKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setRenameTarget('');
    }
  };

  // Rename element whenever the input looses focus
  const handleInputBlur: React.FocusEventHandler = () => {
    setRenameTarget('');
  };

  // Disable rename when clicked outside of the current rename target
  const handleChangeRenameTargetOnClick = () => {
    if (renameTargetId && renameTargetId !== id) {
      setRenameTarget('');
    }
  };

  // Disable rename when right click
  const handleChangeRenameTargetOnRightClick = () => {
    setRenameTarget('');
  };

  // Change the rename target
  const setRenameTarget = (targetId: string) => {
    const input = document.getElementById(
      `ELEMENT-LIST-INPUT-${id}`,
    ) as HTMLInputElement | null;
    setRenameTargetId((oldTargetId) => {
      if (input) {
        // Prevent showing the caret after the rename
        input.blur();
        // Use the element type if display name is an empty string
        if (!input.value) {
          const oldTarget = getElementById(oldTargetId);
          if (oldTarget) {
            const updatedElement = createElement(type, {
              ...oldTarget,
              displayName: capitalize(oldTarget.type),
            })!;
            updateElement(updatedElement);
          }
        }
      }
      return targetId;
    });
    input?.blur();
  };

  return {
    handleItemDoubleClick,
    handleInputChange,
    handleInputKeyDown,
    handleInputBlur,
    handleChangeRenameTargetOnClick,
    handleChangeRenameTargetOnRightClick,
  };
}
