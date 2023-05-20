import {
  APPLICATION_STATES,
  updateExtensionState,
} from '../helpers/chromeStorage';
import CursorControl from './CursorControl';

let cursorControl: CursorControl;

export const init = async () => {
  cursorControl = CursorControl.getInstance();
  await cursorControl.initialize();
  await cursorControl.startPrediction();
  await updateExtensionState({ appState: APPLICATION_STATES.RUNNING });
};

export const stop = async () => {
  cursorControl && cursorControl.destroy();
  await updateExtensionState({
    appState: APPLICATION_STATES.IDLE,
    activeOnTab: 0,
  });
};
