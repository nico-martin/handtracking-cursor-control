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
