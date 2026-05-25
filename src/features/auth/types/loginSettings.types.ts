export type Ticker = {
  text: string;
  isActive: boolean;
};

export type Slide = {
  slideNo: number;
  headline: string;
  imageUrl: string;
};

export type DocumentButton = {
  key: string;
  labelName: string;
  url: string;
};

export type LoginPageSettings = {
  ticker: Ticker;
  slides: Slide[];
  documentButtons: DocumentButton[];
};
