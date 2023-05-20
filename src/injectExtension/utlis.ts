export interface CenterAndDistance {
  center: { x: number; y: number };
  distance: number;
}

export interface CursorPoint {
  x: number;
  y: number;
  size: number;
}

export interface BrowserFrame {
  left: number;
  top: number;
  width: number;
  height: number;
}

export enum HANDPOSES {
  DEFAULT = 'default',
  INDEX_TO_THUMB = 'indexToThumb',
}

export const findCenterAndDistance = (
  indexTip: { x: number; y: number },
  thumbTip: { x: number; y: number }
): CenterAndDistance => {
  const centerX = ((thumbTip.x - indexTip.x) / 4) * 3 + indexTip.x;
  const centerY = ((thumbTip.y - indexTip.y) / 4) * 3 + indexTip.y;
  const distance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
  );
  return { center: { x: centerX, y: centerY }, distance: distance };
};

export const isFocusable = (e: Element): boolean => {
  if (!e || e.getAttribute('tabindex') === '-1') {
    return false;
  }

  const focusableTagNames = ['a', 'area', 'input', 'select', 'textarea'];
  if (focusableTagNames.indexOf(e.tagName.toLowerCase()) !== -1) {
    return true;
  }

  return (
    e.getAttribute('contentEditable') === 'true' ||
    e.getAttribute('tabindex') !== null
  );
};
