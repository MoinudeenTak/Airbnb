const FLASH_MESSAGE_KEY = "flashMessage";

export const setFlashMessage = (message) => {
  sessionStorage.setItem(FLASH_MESSAGE_KEY, message);
};

export const getFlashMessage = () => {
  return sessionStorage.getItem(FLASH_MESSAGE_KEY);
};

export const clearFlashMessage = () => {
  sessionStorage.removeItem(FLASH_MESSAGE_KEY);
};