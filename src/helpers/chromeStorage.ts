import { getCurrentActiveTabId } from './chromeTabs';

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
