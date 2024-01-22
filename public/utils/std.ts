import * as events from 'events';

export const removeActive = (html) => {
  html?.classList.remove('active');
  html?.classList.add('noactive');
};
export const addActive = (html) => {
  html?.classList.add('active');
  html?.classList.remove('noactive');
};
export const roundFloat = (rating: number) => {
  const rounded = Math.round(rating * 10) / 10;
  if (Number.isInteger(rounded)) {
    return `${rounded}.0`;
  }

  return `${rounded}`;
};

export const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const isPush = (targetEvent, HTMLName: string) => {
  return targetEvent.target.closest(HTMLName) !== null;
};
