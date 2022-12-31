// todo: on new page if is active on this tab, restart the camera
import { TabIdentifier } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  getExtensionState,
  updateExtensionState,
} from './helpers/chromeStorage';

const tabIdentifier = new TabIdentifier();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log(changeInfo, tab);
  if (changeInfo.status == 'complete') {
    const state = await getExtensionState();
    if (
      tabId === state.activeOnTab &&
      state.appState === APPLICATION_STATES.RUNNING
    ) {
      await updateExtensionState({
        appState: APPLICATION_STATES.LOADING,
        activeOnTab: tabId,
      });
      console.log('activate', tabId);
    }
  }
});
