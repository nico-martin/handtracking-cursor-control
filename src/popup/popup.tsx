import { Fragment, render } from 'preact';
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
import { IS_DEV } from '../helpers/constants';
import { LOG_TYPES, log } from '../helpers/log';
import styles from './popup.module.css';

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
    log(LOG_TYPES.POPUP, 'popup extensionState', extensionState);
  }, [extensionState]);

  const start = async (): Promise<void> => {
    const tabId = await getCurrentActiveTabId();
    log(LOG_TYPES.POPUP, 'start on Tab', tabId);
    await updateExtensionState({
      activeOnTab: tabId,
      appState: APPLICATION_STATES.STARTING,
    });
  };

  const stop = async (): Promise<void> => {
    log(LOG_TYPES.POPUP, 'Stop');

    await updateExtensionState({
      appState: APPLICATION_STATES.STOPPING,
    });
  };

  const isLoading =
    extensionState.appState === APPLICATION_STATES.STARTING ||
    extensionState.appState === APPLICATION_STATES.STOPPING;

  const cameras = Object.entries(extensionState.cameras);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Handtracking Cursor Control</h1>
      </header>
      <main className={styles.main}>
        {extensionState.activeOnTab === activeTabId ? (
          <Fragment>
            <p>Cursor Control is currently active.</p>
            <div className={styles.footerButtonGroup}>
              <button
                className={styles.button}
                onClick={stop}
                disabled={isLoading}
              >
                {isLoading ? 'loading...' : 'Stop'}
              </button>
            </div>
            <label className={styles.showCamera}>
              Show camera
              <input
                type="checkbox"
                checked={extensionState.showCamera}
                onChange={async (e) =>
                  await updateExtensionState({
                    showCamera: (e.target as HTMLInputElement).checked,
                  })
                }
              />
            </label>
            {cameras.length > 1 && (
              <label className={styles.selectCamera}>
                Camera:
                <select
                  onChange={async (e) => {
                    await updateExtensionState({
                      activeCameraId: (e.target as HTMLInputElement).value,
                    });
                  }}
                >
                  {cameras.map(([id, label]) => (
                    <option
                      value={id}
                      selected={extensionState.activeCameraId === id}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </Fragment>
        ) : extensionState.activeOnTab !== 0 ? (
          <Fragment>
            <p>Cursor Control is currently active in a different tab.</p>
            <div className={styles.footerButtonGroup}>
              <button
                className={styles.button}
                onClick={stop}
                disabled={isLoading}
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
          </Fragment>
        ) : (
          <Fragment>
            <p>
              Cursor Control allows you to operate the website by gesture
              control.
            </p>
            <div className={styles.footerButtonGroup}>
              <button
                className={styles.button}
                onClick={start}
                disabled={isLoading}
              >
                {isLoading ? 'loading...' : 'Start'}
              </button>
            </div>
          </Fragment>
        )}
      </main>
      {IS_DEV && (
        <div>
          {/*<div>
            {Object.entries(extensionState).map(([key, value]) => (
              <p>
                {key}:<br />
                {JSON.stringify(value)}
              </p>
            ))}
          </div>*/}
          <button onClick={() => updateExtensionState(initialExtensionState)}>
            reset State
          </button>
        </div>
      )}
    </div>
  );
};

render(<App />, document.querySelector('#hcc-popup-container'));
