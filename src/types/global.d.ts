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

declare interface handleFileInputInterface {
  (
    setCurrentRendition: React.Dispatch<React.SetStateAction<Rendition | null>>,
    viewerRef: React.RefObject<HTMLDivElement | null>,
    setIsEpubDisplayed: React.Dispatch<React.SetStateAction<boolean>>,
    event?: React.ChangeEvent<HTMLInputElement>,
    currentlyDisplayedEpub?: fileMetaData
  ): File | undefined;
}

declare interface getClickedKanjiInterface {
  (
    currentRendition: Rendition | null,
    clickedQuery: React.RefObject<string | null>,
    clickedQuerySentence: React.RefObject<string | null>,
    setDictionaryData: React.Dispatch<
      React.SetStateAction<DictionaryItem[] | null>
    >
  ): void;
}
