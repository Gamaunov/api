export const wait = (sec: number) => {
  return new Promise((res): void => {
    setTimeout(() => res(true), sec * 1000);
  });
};
