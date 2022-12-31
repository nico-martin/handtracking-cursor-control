import { getCurrentActiveTabId } from './chromeTabs';
import { log } from './log';

export enum APPLICATION_STATES {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
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
  log('updateExtensionState', newState);
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

/*
export const setExtensionActiveOnTab = async (
  value: boolean
): Promise<number> => {
  try {
    const tabId = await getCurrentActiveTabId();
    await chrome.storage.local.set({
      extensionActiveOnTab: value ? tabId : null,
    });
    return tabId;
  } catch (e) {
    throw e;
  }
};

export const getExtensionActiveOnTab = async (): Promise<number> => {
  const store = await chrome.storage.local.get();
  return store?.extensionActiveOnTab || 0;
};

export const setApplicationState = async (
  state: APPLICATION_STATES
): Promise<APPLICATION_STATES> => {
  try {
    await chrome.storage.local.set({
      applicationState: state,
    });
    return state;
  } catch (e) {
    throw e;
  }
};

export const getApplicationState = async (): Promise<APPLICATION_STATES> => {
  const store = await chrome.storage.local.get();
  return store?.applicationState || APPLICATION_STATES.IDLE;
};
*/
