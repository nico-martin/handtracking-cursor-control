import { TabIdentifier } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  getExtensionState,
  updateExtensionState,
} from '../helpers/chromeStorage';
import { LOG_TYPES, log } from '../helpers/log';

const tabIdentifier = new TabIdentifier();

chrome.tabs.onUpdated.addListener(async (tabId, { status }, tab) => {
  if (status == 'complete') {
    log(LOG_TYPES.SERVICE_WORKER, 'onUpdated', tabId);

    const state = await getExtensionState();
    if (
      tabId === state.activeOnTab &&
      state.appState === APPLICATION_STATES.RUNNING
    ) {
      await updateExtensionState({
        appState: APPLICATION_STATES.STARTING,
        activeOnTab: tabId,
      });
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabid, removed) => {
  await updateExtensionState({
    appState: APPLICATION_STATES.IDLE,
    activeOnTab: 0,
  });
});

chrome.windows.onRemoved.addListener(async (windowid) => {
  await updateExtensionState({
    appState: APPLICATION_STATES.IDLE,
    activeOnTab: 0,
  });
});
