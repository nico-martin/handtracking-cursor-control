import { TabIdentifierClient } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  ExtensionState,
  getExtensionState,
  onExtensionStateChange,
} from '../helpers/chromeStorage';
import { LOG_TYPES, log } from '../helpers/log';
import {
  init as initExtension,
  stop as stopExtension,
} from '../injectExtension';

const tabIdClient = new TabIdentifierClient();

const maybeActivate = async (
  changedState: ExtensionState,
  tabId: number
): Promise<'started' | 'stopped' | 'none'> => {
  const state = await getExtensionState();

  if (
    changedState?.appState === APPLICATION_STATES.STARTING &&
    state.activeOnTab === tabId
  ) {
    await initExtension();
    return 'started';
  }

  if (
    changedState?.appState === APPLICATION_STATES.STOPPING &&
    state.activeOnTab === tabId
  ) {
    await stopExtension();
    return 'stopped';
  }
  return 'none';
};

const init = async (): Promise<void> => {
  const tabId = await tabIdClient.getTabId();

  onExtensionStateChange(async (state) => {
    log(LOG_TYPES.CONTENT_SCRIPT, 'onExtensionStateChange', state);

    const maybe = await maybeActivate(
      {
        appState: state?.appState?.newValue,
        activeOnTab: state?.activeOnTab?.newValue,
      },
      tabId
    );
    log(LOG_TYPES.CONTENT_SCRIPT, 'onExtensionStateChange maybe', maybe);
  });
};

init().then(() => log(LOG_TYPES.CONTENT_SCRIPT, 'contentScript initialized'));
