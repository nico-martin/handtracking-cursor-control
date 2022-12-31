import { TabIdentifierClient } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  ExtensionState,
  getExtensionState,
  onExtensionStateChange,
} from '../helpers/chromeStorage';
import InjectExtension from './InjectExtension';

const tabIdClient = new TabIdentifierClient();

let injectExtension: InjectExtension = null;

// todo: contentScript is not really reliable, change to executeScript
//  https://developer.chrome.com/docs/extensions/reference/scripting/#handling-results

const maybeActivate = async (state: ExtensionState, tabId: number) => {
  if (state?.appState === APPLICATION_STATES.LOADING) {
    if (state?.activeOnTab === tabId) {
      injectExtension = new InjectExtension();
    } else {
      if (injectExtension) {
        await injectExtension.destroy();
        injectExtension = null;
      }
    }
  }
};

tabIdClient.getTabId().then((tabId) => {
  onExtensionStateChange((state) =>
    maybeActivate(
      {
        appState: state?.appState?.newValue,
        activeOnTab: state?.activeOnTab?.newValue,
      },
      tabId
    )
  );

  getExtensionState().then((state) => maybeActivate(state, tabId));
});
