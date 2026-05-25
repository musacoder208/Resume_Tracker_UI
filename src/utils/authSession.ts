const KEY = '_isActive';

export const setActiveSession = (): void => sessionStorage.setItem(KEY, 'true');
export const clearActiveSession = (): void => sessionStorage.removeItem(KEY);
export const isActiveSession = (): boolean => sessionStorage.getItem(KEY) === 'true';
