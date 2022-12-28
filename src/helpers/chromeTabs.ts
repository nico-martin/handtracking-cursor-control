export const getCurrentActiveTab = async (): Promise<chrome.tabs.Tab> => {
  const tabs =
    (await chrome?.tabs?.query({
      active: true,
      currentWindow: true,
    })) || [];

  return tabs.length !== 0 ? tabs[0] : null;
};

export const getCurrentActiveTabId = async (): Promise<number> => {
  const tab = await getCurrentActiveTab();

  return tab ? tab.id : null;
};

export const goToTab = (id: number) =>
  chrome.tabs.update(id, { selected: true });
