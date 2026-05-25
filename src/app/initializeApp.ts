//One-time async setup (e.g. load config, set i18n locale). Called from AppInitialization after auth resolves.

import { i18n } from "@/i18n";
import { applyDirection } from "@/i18n/rtl";

export async function initializeApp(): Promise<void> {
  applyDirection(i18n.language);

  i18n.on('languageChanged', (lng) => {
    applyDirection(lng);
  });

  return Promise.resolve();
}
