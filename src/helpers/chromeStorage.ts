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
}

export const initialExtensionState: ExtensionState = {
  appState: APPLICATION_STATES.IDLE,
  activeOnTab: 0,
};

export const getExtensionState = async (): Promise<ExtensionState> => {
  const store = await chrome.storage.local.get();
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
