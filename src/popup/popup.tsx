import { Fragment, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { getExtensionActiveOnTab } from '../helpers/chromeStorage';
import { getCurrentActiveTabId, goToTab } from '../helpers/chromeTabs';
import { log } from '../helpers/log';
import styles from './popup.css';

const App = () => {
  const [extensionActiveOnTabId, setExtensionActiveOnTabId] =
    useState<number>(0);
  const [activeTabId, setActiveTabId] = useState<number>(0);

  const asyncSetActiveTabId = async () => {
    setActiveTabId(await getCurrentActiveTabId());
  };

  const asyncSetExtensionActiveOnTabId = async () => {
    setExtensionActiveOnTabId(await getExtensionActiveOnTab());
  };

  useEffect(() => {
    asyncSetActiveTabId();
    asyncSetExtensionActiveOnTabId();
    chrome.storage.local.onChanged.addListener((e) =>
      setExtensionActiveOnTabId(e.extensionActiveOnTab.newValue || 0)
    );
  }, []);

  const onToggleClick = async (newState: boolean) => {
    log('toggleButton.onclick', newState);
    try {
      await chrome.runtime.sendMessage({
        type: 'extensionActiveOnTab',
        payload: newState,
      });
      log('toggleButton.onclick message sent');

      //sendMessage<boolean>(MESSAGE_TYPES.SET_STATE, started, (e) => log(e));
    } catch (e) {
      alert(e.toString());
    }
  };

  return (
    <div className={styles.container}>
      <p>
        <b>Handtracking Cursor Control</b>
      </p>
      {extensionActiveOnTabId === activeTabId ? (
        <Fragment>
          <button onClick={() => onToggleClick(false)}>End</button>
          <p>Is active here</p>
        </Fragment>
      ) : extensionActiveOnTabId !== 0 ? (
        <Fragment>
          <button onClick={() => onToggleClick(false)}>End</button>
          <p>Is active on Tab {extensionActiveOnTabId}</p>
          <button onClick={() => goToTab(extensionActiveOnTabId)}>
            {extensionActiveOnTabId}
          </button>
        </Fragment>
      ) : (
        <Fragment>
          <button onClick={() => onToggleClick(true)}>Start</button>
          <br />
          TabID: {activeTabId}
        </Fragment>
      )}
    </div>
  );
};

render(<App />, document.querySelector('#hcc-popup-container'));
