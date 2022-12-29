import { getCurrentActiveTabId } from './chromeTabs';

export enum APPLICATION_STATES {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RUNNING = 'RUNNING',
}

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
