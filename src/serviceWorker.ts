import { setExtensionActiveOnTab } from './helpers/chromeStorage';

chrome.runtime.onMessage.addListener(async (e) => {
  console.log('onMessage.addListener', e);
  if (e.type === 'extensionActiveOnTab') {
    await setExtensionActiveOnTab(e.payload);
  }
});

// todo: on new page if is active on this tab, restart the camera
