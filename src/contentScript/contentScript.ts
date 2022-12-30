import { TabIdentifierClient } from 'chrome-tab-identifier';

import {
  APPLICATION_STATES,
  onExtensionStateChange,
} from '../helpers/chromeStorage';
import InjectExtension from './InjectExtension';

const tabIdClient = new TabIdentifierClient();

let injectExtension: InjectExtension = null;

tabIdClient.getTabId().then((tabId) => {
  onExtensionStateChange(async (state) => {
    if (state?.appState?.newValue === APPLICATION_STATES.LOADING) {
      if (state?.activeOnTab?.newValue === tabId) {
        injectExtension = new InjectExtension();
      } else {
        if (injectExtension) {
          await injectExtension.destroy();
          injectExtension = null;
        }
      }
    }
  });
});
