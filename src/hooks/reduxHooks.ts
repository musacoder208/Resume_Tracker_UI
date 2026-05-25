//Typed wrappers: useAppDispatch() and useAppSelector() — use these everywhere instead of raw Redux hook

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store/store';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
