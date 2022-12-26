const showLog = false;

export const log = (...data: any[]): void => {
  if (!showLog) return;
  //console.log("// Handtracking Cursor Control");
  console.log(...data);
};

export const error = (...data: any[]): void => {
  if (!showLog) return;
  //console.error("// ERROR: Handtracking Cursor Control");
  console.error(...data);
};
