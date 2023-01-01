import { IS_DEV } from './constants';

export enum LOG_TYPES {
  INJECT = 'INJECT',
  HPD = 'HANDPOSE_DETECTION',
  STORAGE = 'STORAGE',
  POPUP = 'POPUP',
  CONTENT_SCRIPT = 'CONTENT_SCRIPT',
  SERVICE_WORKER = 'SERVICE_WORKER',
}

const types: Record<LOG_TYPES, boolean> = {
  INJECT: false,
  HANDPOSE_DETECTION: false,
  STORAGE: false,
  POPUP: false,
  CONTENT_SCRIPT: false,
  SERVICE_WORKER: false,
};

export const log = (type: LOG_TYPES, ...data: any[]): void => {
  if (!types[type] || !IS_DEV) return;
  console.log(...['@@CursorControl', ...data]);
};

export const error = (type: LOG_TYPES, ...data: any[]): void => {
  if (!types[type] || !IS_DEV) return;
  console.error(...['@@CursorControl', ...data]);
};
