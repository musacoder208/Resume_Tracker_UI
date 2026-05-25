import type { LoginPageSettings, Slide, Ticker, DocumentButton } from '../types/loginSettings.types';

type RawTicker = {
  text?: string;
  isActive?: boolean;
};

type RawSlide = {
  slideNo?: number;
  headline?: string;
  imageUrl?: string;
};

type RawDocumentButton = {
  key?: string;
  labelName?: string;
  url?: string;
};

type RawLoginPageSettingsResponse = {
  data?: {
    ticker?: RawTicker;
    slides?: RawSlide[];
    documentButtons?: RawDocumentButton[];
  };
};

const mapTicker = (raw?: RawTicker): Ticker => ({
  text: raw?.text ?? '',
  isActive: raw?.isActive ?? false,
});

const mapSlide = (raw: RawSlide): Slide => ({
  slideNo: raw.slideNo ?? 0,
  headline: raw.headline ?? '',
  imageUrl: raw.imageUrl ?? '',
});

const mapDocumentButton = (raw: RawDocumentButton): DocumentButton => ({
  key: raw.key ?? '',
  labelName: raw.labelName ?? '',
  url: raw.url ?? '',
});

export const mapLoginPageSettingsResponse = (
  response: RawLoginPageSettingsResponse
): LoginPageSettings => ({
  ticker: mapTicker(response.data?.ticker),
  slides: (response.data?.slides ?? []).map(mapSlide).sort((a, b) => a.slideNo - b.slideNo),
  documentButtons: (response.data?.documentButtons ?? []).map(mapDocumentButton),
});
