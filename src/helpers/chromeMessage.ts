import { MESSAGE_TYPES } from "./constants";

const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export const sendMessage = <T = any>(
  type: MESSAGE_TYPES,
  payload: T,
  callback: (response: string) => void
) => {
  getActiveTab().then((tab) => {
    chrome.tabs.sendMessage(tab.id, { type, payload }, callback);
  });
};

export const onMessageReceive = <T = any>(
  callback: (type: MESSAGE_TYPES, payload: T) => void,
  response: string = ""
) =>
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    callback(message.type, message.payload);
    sendResponse(response);
  });
