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
  INJECT: true,
  HANDPOSE_DETECTION: true,
  STORAGE: true,
  POPUP: true,
  CONTENT_SCRIPT: true,
  SERVICE_WORKER: true,
};

export const log = (type: LOG_TYPES, ...data: any[]): void => {
  if (!types[type] || !IS_DEV) return;
  console.log(...['@@CursorControl', ...data]);
};

export const error = (type: LOG_TYPES, ...data: any[]): void => {
  if (!types[type] || !IS_DEV) return;
  console.error(...['@@CursorControl', ...data]);
};
