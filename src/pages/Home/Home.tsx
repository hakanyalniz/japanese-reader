import SidePanel from "../../components/SidePanel/SidePanel";
import "./Home.css";
import { Rendition } from "epubjs";
import { useState, useRef, useEffect } from "react";

import {
  handleFileInput,
  handleDataFetching,
  handleResize,
  handleNextPage,
  handlePrevPage,
  handleRemoveEbook,
  handleKeyDown,
  handleIFrameKey,
  handleAddEbook,
} from "./helpers";

function Home() {
  const [isEpubDisplayed, setIsEpubDisplayed] = useState(false); // Track if EPUB is being displayed
  const [dictionaryData, setDictionaryData] = useState<
    { [key: string]: unknown }[] | null
  >([]); // Store the fetched dictionary data
  // When we find the query inside the dictionary data, store them here
  const [foundDictionaryData, setFoundDictionaryData] = useState<
    { [key: string]: unknown }[] | null
  >([]);

  const clickedQuerySentence = useRef<string | null>(null); // Ref for the clicked text for searching
  const clickedQuery = useRef<string>(null);

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const viewerRef = useRef<HTMLDivElement>(null); // Ref for the viewer container

  const [currentRendition, setCurrentRendition] = useState<Rendition | null>(
    null
  );

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

            handleDataFetching(setDictionaryData, "query", clickedCharacter);
          }
        }
      }
    });
  }, [currentRendition]);

  useEffect(() => {
    if (
      !dictionaryData ||
      !clickedQuery.current ||
      !clickedQuerySentence.current
    )
      return;
    // Reset the founds every search
    setFoundDictionaryData([]);

    // Get the index of the query from the sentence
    const startIndex = clickedQuerySentence.current.indexOf(
      clickedQuery.current
    );

    const endIndex = clickedQuerySentence.current.length;

    setFoundDictionaryData((prevList) => [...prevList, ...loopSearchDict()]);

    // Then, search for the next character in the query
    // look at the kanji field and see if the rest of the query is there
    // 引きこもり;
    // Start searching the sentence from that point on
    // Fetch all the data that hits
    // see if the character at clickedQuerySentence[y] is equal to dictionaryData[x]
    // if not, add the next character, and see if that is equal
    // and so on. The idea is that, we start searching from the 引
    // all the way 引きこもり, so we can find the word.
    const loopSearchDict = () => {
      if (
        !dictionaryData ||
        !clickedQuery.current ||
        !clickedQuerySentence.current
      )
        return;

      const result = [];
      let currentWordBeingSearched = "";
      for (let x = 0; x < dictionaryData.length; x++) {
        currentWordBeingSearched = "";
        for (let y = startIndex; y < endIndex; y++) {
          if (currentWordBeingSearched == dictionaryData[x]["kanji"]) {
            if (!result.includes(dictionaryData[x])) {
              result.push(dictionaryData[x]);
            }
          } else {
            currentWordBeingSearched += clickedQuerySentence.current[y];
          }
        }
      }
      return result;
    };
  }, [dictionaryData]);

  useEffect(() => console.log(foundDictionaryData), [foundDictionaryData]);

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
                handleRemoveEbook(currentRendition, setIsEpubDisplayed)
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
                onChange={(e) =>
                  handleFileInput(
                    e,
                    setCurrentRendition,
                    viewerRef,
                    setIsEpubDisplayed
                  )
                }
                style={{ display: "none" }} // Hides the input element but keeps it accessible
              />
            </div>
          )}
        </div>

        <div id="viewer" ref={viewerRef}></div>
      </div>

      <SidePanel />
    </div>
  );
}

export default Home;
