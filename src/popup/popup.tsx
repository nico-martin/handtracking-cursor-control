import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import {
  APPLICATION_STATES,
  ExtensionState,
  getExtensionState,
  initialExtensionState,
  onExtensionStateChange,
  updateExtensionState,
} from '../helpers/chromeStorage';
import { getCurrentActiveTabId, goToTab } from '../helpers/chromeTabs';
import { log } from '../helpers/log';
import styles from './popup.css';

const App = () => {
  const [extensionState, setExtensionState] = useState<ExtensionState>(
    initialExtensionState
  );
  const [activeTabId, setActiveTabId] = useState<number>(0);

  const asyncSetActiveTabId = async () => {
    setActiveTabId(await getCurrentActiveTabId());
  };

  const asyncSpdateExtensionState = async () => {
    setExtensionState(await getExtensionState());
  };

  useEffect(() => {
    asyncSetActiveTabId();
    asyncSpdateExtensionState();

    onExtensionStateChange((e) => {
      setExtensionState((currState) =>
        Object.keys(currState).reduce(
          (acc, key) =>
            key in e
              ? {
                  ...acc,
                  [key]: e[key].newValue,
                }
              : acc,
          currState
        )
      );
    });
  }, []);

  useEffect(() => {
    console.log('popup extensionState', extensionState);
  }, [extensionState]);

  const onToggleClick = async (newState: boolean) => {
    log('toggleButton.onclick', newState);
    try {
      const tabId = await getCurrentActiveTabId();

      await updateExtensionState({
        activeOnTab: newState ? tabId : 0,
        appState: APPLICATION_STATES.LOADING,
      });
    } catch (e) {
      alert(e);
    }
  };

  const isLoading = extensionState.appState === APPLICATION_STATES.LOADING;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Handtracking Cursor Control</h1>
      </header>
      {extensionState.activeOnTab === activeTabId ? (
        <main className={styles.main}>
          <p>Cursor Control is currently active.</p>
          <div className={styles.footerButtonGroup}>
            <button
              className={styles.button}
              onClick={() => onToggleClick(false)}
            >
              {isLoading ? 'loading...' : 'Stop'}
            </button>
          </div>
        </main>
      ) : extensionState.activeOnTab !== 0 ? (
        <main className={styles.main}>
          <p>Cursor Control is currently active in a different tab.</p>
          <div className={styles.footerButtonGroup}>
            <button
              className={styles.button}
              onClick={() => onToggleClick(false)}
            >
              {isLoading ? 'loading...' : 'Stop'}
            </button>
            <button
              className={styles.button}
              onClick={() => goToTab(extensionState.activeOnTab)}
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
              {isLoading ? 'loading...' : 'Start'}
            </button>
          </div>
        </main>
      )}
      <button onClick={() => updateExtensionState(initialExtensionState)}>
        reset State
      </button>
    </div>
  );
};

render(<App />, document.querySelector('#hcc-popup-container'));
