import SidePanel from "../../components/SidePanel/SidePanel";
import "./Home.css";
import { Rendition } from "epubjs";
import { useState, useRef, useEffect } from "react";

import {
  setCurrentlyDisplayedEpub,
  selectCurrentlyDisplayedEpub,
} from "../../store/slices/fileSlices";
import { useDispatch, useSelector } from "react-redux";

import {
  handleFileInput,
  handleDataFetching,
  loopSearchDict,
  handleResize,
  handleNextPage,
  handlePrevPage,
  handleRemoveEbook,
  handleKeyDown,
  handleIFrameKey,
  handleAddEbook,
  storeFileMetaData,
} from "./helpers";

export interface DictionaryItem {
  id: number;
  kanji: string;
  kana: string;
  meaning: string;
}

export interface fileMetaData {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string;
}

function Home() {
  const [currentRendition, setCurrentRendition] = useState<Rendition | null>(
    null
  );
  const [isEpubDisplayed, setIsEpubDisplayed] = useState(false); // Track if EPUB is being displayed
  const [dictionaryData, setDictionaryData] = useState<DictionaryItem[] | null>(
    []
  ); // Store the fetched dictionary data

  // When we find the query inside the dictionary data, store them here
  const [foundDictionaryData, setFoundDictionaryData] = useState<
    DictionaryItem[]
  >([]);

  const clickedQuerySentence = useRef<string | null>(null); // Ref for the clicked text for searching
  const clickedQuery = useRef<string>(null);

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const viewerRef = useRef<HTMLDivElement>(null); // Ref for the viewer container

  const currentlyDisplayedEpub = useSelector(selectCurrentlyDisplayedEpub);
  const dispatch = useDispatch();

  // Resize the epub font to make it responsive
  useEffect(() => {
    // Call handleResize at the beginning for resizing the window
    handleResize(currentRendition);

    window.addEventListener("resize", () => handleResize(currentRendition));

    return () =>
      window.removeEventListener("resize", () =>
        handleResize(currentRendition)
      );
  }, [currentRendition]);

  // navigate pagination via keyboard, one works inside iframe, the other outside it
  useEffect(() => {
    document.addEventListener("keydown", (e) =>
      handleKeyDown(currentRendition, e)
    );

    return () =>
      document.addEventListener("keydown", (e) =>
        handleKeyDown(currentRendition, e)
      );
  }, [currentRendition]);

  // Navigate using keyboard keys inside iframe
  useEffect(() => {
    handleIFrameKey(currentRendition);
  }, [currentRendition]);

  // get the kanji that the user clicked on
  useEffect(() => {
    currentRendition?.on("click", () => {
      const iframe = document.querySelector("iframe");
      if (!iframe) return;

      // Access the iframe's document
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Get the selection within the iframe
      const selection = iframeDoc.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const { startContainer, startOffset } = range;

        // Ensure the clicked target is a text node
        if (startContainer.nodeType === Node.TEXT_NODE) {
          const clickedCharacter = startContainer.textContent?.[startOffset];
          console.log(startContainer.textContent);
          clickedQuerySentence.current = startContainer.textContent;

          if (clickedCharacter) {
            console.log(clickedCharacter);
            clickedQuery.current = clickedCharacter;

            handleDataFetching(setDictionaryData, {
              query: clickedCharacter,
            });
          }
        }
      }
    });
  }, [currentRendition]);

  // When new dictionary data comes, it means something new was clicked
  // loop through the dictionary data and get what we want
  useEffect(() => {
    if (
      !dictionaryData ||
      !clickedQuery.current ||
      !clickedQuerySentence.current
    )
      return;

    const loopResults = loopSearchDict(
      dictionaryData,
      clickedQuery,
      clickedQuerySentence,
      setFoundDictionaryData
    );
    setFoundDictionaryData((prevList) => [...prevList, ...loopResults]);
  }, [dictionaryData]);

  // When the page is reloaded, run handleFileInput with the metadata we extracted
  // it will reconstruct as a file in the other side
  useEffect(() => {
    if (!currentlyDisplayedEpub) return;

    handleFileInput(
      setCurrentRendition,
      viewerRef,
      setIsEpubDisplayed,
      undefined,
      currentlyDisplayedEpub
    );
  }, [currentlyDisplayedEpub]);

  return (
    <div className="home-flex">
      <div className="container">
        <div id="ebook-navigation">
          <button
            className="nav-button"
            onClick={() => handlePrevPage(currentRendition)}
            disabled={!currentRendition}
          >
            Previous
          </button>
          <button
            className="nav-button"
            onClick={() => handleNextPage(currentRendition)}
            disabled={!currentRendition}
          >
            Next
          </button>
        </div>
        <div id="add-remove-container">
          {isEpubDisplayed && (
            <button
              className="nav-button"
              onClick={() =>
                handleRemoveEbook(
                  setFoundDictionaryData,
                  currentRendition,
                  setIsEpubDisplayed
                )
              }
            >
              Remove Ebook
            </button>
          )}
          {!isEpubDisplayed && ( // Only render the button and input if EPUB isn't displayed
            <div>
              <button
                className="nav-button"
                id="add-ebook"
                onClick={handleAddEbook}
              >
                Add Ebook
              </button>
              <input
                type="file"
                id="fileInput"
                accept=".epub"
                ref={fileInputRef}
                onChange={(e) => {
                  // take the return of file, extract metadata, we can then reconstruct the file to reload the epub
                  // Store the metadata in redux, so it stays there even in reload
                  let metaData;

                  storeFileMetaData(
                    handleFileInput(
                      setCurrentRendition,
                      viewerRef,
                      setIsEpubDisplayed,
                      e
                    )
                  )?.then((fileMetadata) => {
                    metaData = fileMetadata;
                    dispatch(setCurrentlyDisplayedEpub(metaData));
                  });
                }}
                style={{ display: "none" }} // Hides the input element but keeps it accessible
              />
            </div>
          )}
        </div>

        <div id="viewer" ref={viewerRef}></div>
      </div>

      <SidePanel foundDictionaryData={foundDictionaryData} />
    </div>
  );
}

export default Home;
