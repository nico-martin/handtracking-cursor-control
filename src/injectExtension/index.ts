import {
  APPLICATION_STATES,
  onExtensionStateChange,
  updateExtensionState,
} from '../helpers/chromeStorage';
import CursorControl from './CursorControl';

let cursorControl: CursorControl;

export const init = async (
  showCamera: boolean = false,
  activeCameraId: string = ''
) => {
  cursorControl = CursorControl.getInstance();
  await cursorControl.initialize(activeCameraId);
  await cursorControl.startPrediction();
  cursorControl.setShowVideo(showCamera);
  onExtensionStateChange((state) => {
    state?.showCamera &&
      state.showCamera.newValue !== state.showCamera.oldValue &&
      cursorControl.setShowVideo(state.showCamera.newValue);

    state?.activeCameraId &&
      state.activeCameraId?.newValue !== state.activeCameraId?.oldValue &&
      cursorControl.setActiveCameraId(state.activeCameraId?.newValue);
  });
  await updateExtensionState({
    appState: APPLICATION_STATES.RUNNING,
    cameras: cursorControl.getCameraIds(),
  });
};

export const stop = async () => {
  cursorControl && cursorControl.destroy();
  await updateExtensionState({
    appState: APPLICATION_STATES.IDLE,
    activeOnTab: 0,
  });
};
