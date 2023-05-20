import { LOG_TYPES, log } from './log';

export enum APPLICATION_STATES {
  IDLE = 'IDLE',
  STARTING = 'STARTING',
  STOPPING = 'STOPPING',
  RUNNING = 'RUNNING',
}

export interface ExtensionState {
  appState: APPLICATION_STATES;
  activeOnTab: number;
  showCamera: boolean;
  activeCameraId: string;
  cameras: Record<string, string>;
}

interface ListenerCallbackParams {
  appState: {
    newValue: APPLICATION_STATES;
    oldValue: APPLICATION_STATES;
  };
  activeOnTab: {
    newValue: number;
    oldValue: number;
  };
  showCamera: { newValue: boolean; oldValue: boolean };
  activeCameraId: { newValue: string; oldValue: string };
  cameras: {
    newValue: Record<string, string>;
    oldValue: Record<string, string>;
  };
}

export const initialExtensionState: ExtensionState = {
  appState: APPLICATION_STATES.IDLE,
  activeOnTab: 0,
  showCamera: false,
  activeCameraId: null,
  cameras: {},
};

export const getExtensionState = async (): Promise<ExtensionState> => {
  const store = await chrome.storage.local.get();
  log(LOG_TYPES.STORAGE, { getExtensionState: store });
  return Object.keys(initialExtensionState).reduce(
    (acc, key) =>
      store[key]
        ? {
            ...acc,
            [key]: store[key],
          }
        : acc,
    initialExtensionState
  );
};

export const updateExtensionState = async (
  state: Partial<ExtensionState>
): Promise<ExtensionState> => {
  const currState = await getExtensionState();
  const newState = { ...currState, ...state };
  log(LOG_TYPES.STORAGE, 'updateExtensionState', newState);
  await chrome.storage.local.set(newState);
  return newState;
};

export const onExtensionStateChange = (
  callback: (params: Partial<ListenerCallbackParams>) => void
) => {
  chrome.storage.local.onChanged.addListener((e) => {
    callback(
      Object.keys(initialExtensionState).reduce(
        (acc, key) =>
          key in e
            ? {
                ...acc,
                [key]: { newValue: e[key].newValue, oldValue: e[key].oldValue },
              }
            : acc,
        {}
      )
    );
  });
};
