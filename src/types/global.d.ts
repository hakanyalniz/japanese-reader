declare interface DictionaryItem {
  id: number;
  kanji: string;
  kana: string;
  meaning: string;
}

declare interface fileMetaData {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string;
}
