const showLog = true;

export const log = (...data: any[]): void => {
  if (!showLog) return;
  console.log(...['@@CursorControl', ...data]);
};

export const error = (...data: any[]): void => {
  if (!showLog) return;
  console.error(...['@@CursorControl', ...data]);
};
