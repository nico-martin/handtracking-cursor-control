import styles from "./popup.css";
import { sendMessage } from "./helpers/chromeMessage";
import { MESSAGE_TYPES } from "./helpers/constants";
import { log, error } from "./helpers/log";
const container = document.querySelector("#hcc-popup-container");
let started: boolean = false,
  heading: HTMLParagraphElement,
  toggleButton: HTMLButtonElement,
  activeTabP: HTMLParagraphElement;

const getExtensionActiveOnTab = async (): Promise<number> => {
  const storage = await chrome.storage.local.get();
  return storage?.extensionActiveOnTab || null;
};

const onActiveTabIdChange = (activeTabId) => {
  if (activeTabId) {
    toggleButton.innerText = "End";
    activeTabP.innerText = activeTabId;
  } else {
    toggleButton.innerText = "Start";
    activeTabP.innerText = "";
  }
};

const start = async () => {
  if (container) {
    container.classList.add(styles.container);
    const activeTabId = await getExtensionActiveOnTab();
    started = Boolean(activeTabId);

    heading = document.createElement("p");
    heading.innerHTML = `<b>Handtracking Cursor Control</b>`;
    container.appendChild(heading);

    toggleButton = document.createElement("button");
    toggleButton.classList.add(styles.toggleButton);
    toggleButton.onclick = async () => {
      log("toggleButton.onclick");
      try {
        started = !started;
        await chrome.runtime.sendMessage({
          type: "extensionActiveOnTab",
          payload: started,
        });

        //sendMessage<boolean>(MESSAGE_TYPES.SET_STATE, started, (e) => log(e));
      } catch (e) {
        error("error", e);
      }
    };
    container.appendChild(toggleButton);

    activeTabP = document.createElement("p");
    activeTabP.innerHTML = "";
    container.appendChild(activeTabP);

    onActiveTabIdChange(activeTabId);
  }
};

chrome.storage.local.onChanged.addListener((e) => {
  onActiveTabIdChange(e.extensionActiveOnTab.newValue);
});

start();
