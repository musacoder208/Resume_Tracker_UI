//this is the entry point file . react render AppProviders into the DOM

import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/app/provider/providers';
import { applyTheme } from '@/theme/applyTheme';
import { getStoredTheme } from '@/utils/themeStorage';
import '@/styles/index.css';
import '@/styles/global.css';

applyTheme(getStoredTheme());

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
);
