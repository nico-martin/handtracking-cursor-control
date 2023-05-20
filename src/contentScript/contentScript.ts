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
  changedState: Partial<ExtensionState>,
  tabId: number
): Promise<'started' | 'stopped' | 'none'> => {
  const state = await getExtensionState();
  log(LOG_TYPES.CONTENT_SCRIPT, 'maybeActivate', state, tabId);

  if (
    changedState?.appState === APPLICATION_STATES.STARTING &&
    state.activeOnTab === tabId
  ) {
    await initExtension(state.showCamera, state.activeCameraId);
    log(LOG_TYPES.CONTENT_SCRIPT, 'maybeActivate started');
    return 'started';
  }

  if (
    changedState?.appState === APPLICATION_STATES.STOPPING &&
    state.activeOnTab === tabId
  ) {
    await stopExtension();
    log(LOG_TYPES.CONTENT_SCRIPT, 'maybeActivate stopped');
    return 'stopped';
  }
  log(LOG_TYPES.CONTENT_SCRIPT, 'maybeActivate none');
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
        showCamera: state?.showCamera?.newValue,
        activeCameraId: state?.activeCameraId?.newValue,
      },
      tabId
    );
    log(LOG_TYPES.CONTENT_SCRIPT, 'onExtensionStateChange maybe', maybe);
  });

  await maybeActivate(await getExtensionState(), tabId);
};

init().then(() => log(LOG_TYPES.CONTENT_SCRIPT, 'contentScript initialized'));
