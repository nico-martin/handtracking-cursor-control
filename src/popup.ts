import styles from "./popup.css";
import { sendMessage } from "./helpers/chromeMessage";
import { MESSAGE_TYPES } from "./helpers/constants";
import { log, error } from "./helpers/log";
const container = document.querySelector("#hcc-popup-container");

if (container) {
  container.classList.add(styles.container);
  const toggleButton = document.createElement("button");
  let started: boolean = false;
  toggleButton.innerText = "Start3";
  toggleButton.classList.add(styles.toggleButton);
  toggleButton.onclick = async () => {
    log("toggleButton.onclick");
    try {
      if (started) {
        toggleButton.innerText = "Start";
      } else {
        toggleButton.innerText = "End";
      }
      started = !started;
      sendMessage<boolean>(MESSAGE_TYPES.SET_STATE, started, (e) => log(e));
    } catch (e) {
      error("error", e);
    }
  };
  container.appendChild(toggleButton);
}
