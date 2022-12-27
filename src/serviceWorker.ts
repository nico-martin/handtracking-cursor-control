const getCurrentActiveTabId = async (): Promise<number> => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs.length !== 0 ? tabs[0].id : null;
};

const getExtensionActiveOnTab = async (): Promise<number> => {
  const storage = await chrome.storage.local.get();
  return storage?.extensionActiveOnTab || null;
};

const setExtensionActiveOnTab = async (value: boolean): Promise<number> => {
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

chrome.runtime.onMessage.addListener(async (e) => {
  console.log("onMessage.addListener", e);
  if (e.type === "extensionActiveOnTab") {
    await setExtensionActiveOnTab(e.payload);
  }
});

// todo: on new page if is active on this tab, restart the camera
