import { TabIdentifier } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  getExtensionState,
  onExtensionStateChange,
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

onExtensionStateChange((state) => {
  state?.appState &&
    state?.appState?.newValue &&
    setIcon(state?.appState?.newValue);
});

(async () => {
  const state = await getExtensionState();
  setIcon(state.appState);
})();

const setIcon = (state: APPLICATION_STATES) => {
  console.log('setIcon', state);
  if (!state) return;

  const icon: '' | 'loading_' | 'active_' =
    state === APPLICATION_STATES.RUNNING
      ? 'active_'
      : state === APPLICATION_STATES.STARTING
      ? 'loading_'
      : state === APPLICATION_STATES.STOPPING
      ? 'loading_'
      : '';

  chrome.action.setIcon({
    path: {
      '16': 'icons/' + icon + '16x.png',
      '32': 'icons/' + icon + '32x.png',
      '48': 'icons/' + icon + '48x.png',
      '128': 'icons/' + icon + '128x.png',
    },
  });
};
