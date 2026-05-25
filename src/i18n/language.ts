import { i18n } from '@/i18n';
import { applyDirection } from '@/i18n/rtl';

export async function changeLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);

  applyDirection(lang);
}
