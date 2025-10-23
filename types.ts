
export enum AppTab {
  EDITOR = 'Image Editor',
  ANALYZER = 'Image Analyzer',
  MEME_GENERATOR = 'Meme Generator',
}

export interface MemeTemplate {
  id: string;
  url: string;
  name: string;
}
