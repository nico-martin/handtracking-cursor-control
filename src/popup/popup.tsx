import { Fragment, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { sendMessage } from '../helpers/chromeMessage';
import {
  APPLICATION_STATES,
  getExtensionActiveOnTab,
  setExtensionActiveOnTab,
} from '../helpers/chromeStorage';
import { getCurrentActiveTabId, goToTab } from '../helpers/chromeTabs';
import { MESSAGE_TYPES } from '../helpers/constants';
import { log } from '../helpers/log';
import styles from './popup.css';

const App = () => {
  const [extensionActiveOnTabId, setExtensionActiveOnTabId] =
    useState<number>(0);
  const [activeTabId, setActiveTabId] = useState<number>(0);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const asyncSetActiveTabId = async () => {
    setActiveTabId(await getCurrentActiveTabId());
  };

  const asyncSetExtensionActiveOnTabId = async () => {
    setExtensionActiveOnTabId(await getExtensionActiveOnTab());
  };

  useEffect(() => {
    asyncSetActiveTabId();
    asyncSetExtensionActiveOnTabId();
    chrome.storage.local.onChanged.addListener((e) => {
      if (
        e.extensionActiveOnTab &&
        e.extensionActiveOnTab.newValue !== e.extensionActiveOnTab.oldValue
      ) {
        setExtensionActiveOnTabId(e.extensionActiveOnTab.newValue || 0);
      }
      if (
        e.applicationState &&
        e.applicationState.newValue !== e.applicationState.oldValue
      ) {
        setIsStarting(
          e.applicationState.newValue === APPLICATION_STATES.LOADING
        );
      }
    });
  }, []);

  const onToggleClick = async (newState: boolean) => {
    log('toggleButton.onclick', newState);
    try {
      await setExtensionActiveOnTab(newState);
      const tabId = await getCurrentActiveTabId();
      const result = await sendMessage<boolean>(
        tabId,
        MESSAGE_TYPES.SET_STATE,
        newState
      );
      log(result);
    } catch (e) {
      alert(e.toString());
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Handtracking Cursor Control</h1>
      </header>
      {extensionActiveOnTabId === activeTabId ? (
        <main className={styles.main}>
          <p>Cursor Control is currently active.</p>
          <div className={styles.footerButtonGroup}>
            <button
              className={styles.button}
              onClick={() => onToggleClick(false)}
            >
              Stop
            </button>
          </div>
        </main>
      ) : extensionActiveOnTabId !== 0 ? (
        <main className={styles.main}>
          <p>Cursor Control is currently active in a different tab.</p>
          <div className={styles.footerButtonGroup}>
            <button
              className={styles.button}
              onClick={() => onToggleClick(false)}
            >
              Stop
            </button>
            <button
              className={styles.button}
              onClick={() => goToTab(extensionActiveOnTabId)}
            >
              Switch Tab
            </button>
          </div>
        </main>
      ) : (
        <main className={styles.main}>
          <p>
            Cursor Control allows you to operate the website by gesture control.
          </p>
          <div className={styles.footerButtonGroup}>
            <button
              className={styles.button}
              onClick={() => onToggleClick(true)}
            >
              {isStarting ? 'loading...' : 'Start'}
            </button>
          </div>
        </main>
      )}
    </div>
  );
};

render(<App />, document.querySelector('#hcc-popup-container'));
