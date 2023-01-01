import { TabIdentifierClient } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  ExtensionState,
  getExtensionState,
  onExtensionStateChange,
  updateExtensionState,
} from '../helpers/chromeStorage';
import { LOG_TYPES, log } from '../helpers/log';
import InjectExtension from '../injectExtension/InjectExtension';

const tabIdClient = new TabIdentifierClient();
const injectExtension = new InjectExtension();

const maybeActivate = async (
  changedState: ExtensionState,
  tabId: number
): Promise<'started' | 'stopped' | 'none'> => {
  const state = await getExtensionState();

  if (
    changedState?.appState === APPLICATION_STATES.STARTING &&
    state.activeOnTab === tabId
  ) {
    await injectExtension.start();
    return 'started';
  }

  if (
    changedState?.appState === APPLICATION_STATES.STOPPING &&
    state.activeOnTab === tabId
  ) {
    await injectExtension.destroy();
    await updateExtensionState({ activeOnTab: 0 });
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
