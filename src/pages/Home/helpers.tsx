import ePub, { Rendition } from "epubjs";
import axios from "axios";

export const storeFileMetaData = (file: File | undefined) => {
  if (file == undefined) return;
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const base64 = fileReader.result; // File data as base64

      const fileMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: base64, // Store the file's data
      };

      resolve(fileMetadata); // Resolve the promise with the metadata
    };

    fileReader.onerror = (error) => {
      reject(error); // Reject the promise if there's an error
    };

    fileReader.readAsDataURL(file); // Read the file as base64
  });
};

const base64ToFile = (
  base64: string,
  name: string,
  type: string,
  lastModified: number
) => {
  const base64Data = base64.split(",")[1]; // Remove the data URL prefix
  const binaryString = atob(base64Data); // Convert base64 to binary string
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type });
  return new File([blob], name, { type, lastModified });
};

// When file input changes display the epub file
export const handleFileInput: handleFileInputInterface = (
  setCurrentRendition,
  viewerRef,
  setIsEpubDisplayed,
  event?,
  currentlyDisplayedEpub?
) => {
  let file;

  if (currentlyDisplayedEpub) {
    file = base64ToFile(
      currentlyDisplayedEpub.data,
      currentlyDisplayedEpub.name,
      currentlyDisplayedEpub.type,
      currentlyDisplayedEpub.lastModified
    );
  } else if (event?.target) {
    file = event.target.files?.[0];
  }

  if (file && file.type === "application/epub+zip") {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (viewerRef.current && e.target?.result) {
        const book = ePub(e.target.result); // Load the EPUB file

        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          allowScriptedContent: true,
          spread: "none",
        });

        // select themes to make the epub viewer look different
        rendition.themes.register("gray", {
          body: {
            background: "#242424",
            color: "white",
          },
        });
        rendition.themes.select("gray");

        rendition.display();

        setCurrentRendition(rendition); // Store the rendition in state
        setIsEpubDisplayed(true); // EPUB is now displayed
      }
    };

    reader.readAsArrayBuffer(file);
    return file;
  } else {
    alert("Please upload a valid EPUB file.");
  }
};

export const getClickedKanji: getClickedKanjiInterface = (
  currentRendition,
  clickedQuery,
  clickedQuerySentence,
  setDictionaryData
) => {
  currentRendition?.on("click", () => {
    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    // Access the iframe's document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
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
};

// Fetch data from Flask
export const handleDataFetching = (
  setDictionaryData: React.Dispatch<
    React.SetStateAction<DictionaryItem[] | null>
  >,
  params: Record<string, string> // Accept multiple parameters as an object
) => {
  axios
    .get("http://127.0.0.1:5000/api/data", {
      params,
    })
    .then((response) => {
      setDictionaryData(response.data);
    })
    .catch((error) => {
      console.error("Error fetching data from Flask:", error);
    });
};

interface loopSearchDictInterface {
  (
    dictionaryData: DictionaryItem[],
    clickedQuery: React.RefObject<string | null>,
    clickedQuerySentence: React.RefObject<string | null>,
    setFoundDictionaryData: React.Dispatch<
      React.SetStateAction<DictionaryItem[]>
    >
  ): DictionaryItem[];
}
// Then, search for the next character in the query
// look at the kanji field and see if the rest of the query is there
// 引きこもり;
// Start searching the sentence from that point on
// Fetch all the data that hits
// see if the character at clickedQuerySentence[y] is equal to dictionaryData[x]
// if not, add the next character, and see if that is equal
// and so on. The idea is that, we start searching from the 引
// all the way 引きこもり, so we can find the word.
export const loopSearchDict: loopSearchDictInterface = (
  dictionaryData,
  clickedQuery,
  clickedQuerySentence,
  setFoundDictionaryData
) => {
  if (!dictionaryData || !clickedQuery.current || !clickedQuerySentence.current)
    return [];

  // Reset the founds every search
  setFoundDictionaryData([]);

  // Get the index of the query from the sentence
  const startIndex = clickedQuerySentence.current.indexOf(clickedQuery.current);
  // How many characters/index should be searched from the general sentence?
  // Setting the limit to 5 can miss some words, but will catch 99 percent of them, it will also be faster
  // const endIndex = clickedQuerySentence.current.length;
  const endIndex = startIndex + 5;

  const result: DictionaryItem[] = [];
  let currentWordBeingSearched = "";

  for (let x = 0; x < dictionaryData.length; x++) {
    currentWordBeingSearched = "";
    for (let y = startIndex; y <= endIndex; y++) {
      if (currentWordBeingSearched == dictionaryData[x]["kanji"]) {
        // Ensure that the result is not repeated inside the results
        if (!result.includes(dictionaryData[x])) {
          result.push(dictionaryData[x]);
          break;
        }
      } else {
        // Add the first kanji in the dict list, so it is the default meaning
        if (x == 0 && y == startIndex) {
          result.push(dictionaryData[x]);
        }
        currentWordBeingSearched += clickedQuerySentence.current[y];
      }
    }
  }
  return result;
};

/**
 * Resizes the IFrame that displays epub. A replacement for the official rendition.resize method.
 */
export const safeResize = (
  rendition: Rendition,
  width: number,
  height: number
) => {
  if (!rendition) return;

  try {
    // First try the standard resize
    rendition.resize(width, height);
  } catch (e) {
    console.log(e);
    // If that fails, implement a fallback
    if (rendition.settings) {
      if (width) rendition.settings.width = width;
      if (height) rendition.settings.height = height;
    }
  }
};

/**
 * Resize the epub font to make it more responsive.
 */
export const handleResize = (currentRendition: Rendition | null) => {
  const width = window.innerWidth;

  const viewer: HTMLElement = document.querySelector("#viewer")!;
  const sidePanel: HTMLElement | null = document.querySelector(".side-panel");

  if (!currentRendition || !sidePanel) return;

  // control the side panel
  // Apply specific class to side panel, which will then change kanji info font
  if (width <= 1600) {
    sidePanel.style.width = "200px";

    sidePanel.classList.remove("side-panel-info-40", "side-panel-info-50");
    sidePanel.classList.add("side-panel-info-30");
  } else if (width <= 1700) {
    sidePanel.style.width = "250px";

    sidePanel.classList.remove("side-panel-info-30", "side-panel-info-50");
    sidePanel.classList.add("side-panel-info-40");
  } else {
    sidePanel.style.width = "300px";

    sidePanel.classList.remove("side-panel-info-30", "side-panel-info-40");
    sidePanel.classList.add("side-panel-info-50");
  }

  // control the font size and width of viewer
  if (width <= 600) {
    safeResize(currentRendition, 300, viewer.offsetHeight);
  } else if (width <= 915) {
    currentRendition.themes.fontSize("10px"); // Small font size for mobile
    safeResize(currentRendition, 500, viewer.offsetHeight);
  } else if (width <= 1115) {
    currentRendition.themes.fontSize("12px"); // Medium font size for tablets
    safeResize(currentRendition, 800, viewer.offsetHeight);
  } else if (width <= 1400) {
    currentRendition.themes.fontSize("13px"); // Medium font size for tablets
    safeResize(currentRendition, 1000, viewer.offsetHeight);
  } else {
    currentRendition.themes.fontSize("18px"); // Larger font size for desktops
    safeResize(currentRendition, viewer.offsetWidth, viewer.offsetHeight);
  }
};

/**
 * Handle pagination control next page via HTML button.
 */
export const handleNextPage = (currentRendition: Rendition | null) => {
  if (currentRendition) {
    currentRendition.next();
  }
};

/**
 * Handle pagination control previous page via HTML button.
 */
export const handlePrevPage = (currentRendition: Rendition | null) => {
  if (currentRendition) {
    currentRendition.prev();
  }
};

/**
 * Clear the EPUB content and reset the viewer.
 */
export const handleRemoveEbook = (
  setFoundDictionaryData: React.Dispatch<
    React.SetStateAction<DictionaryItem[]>
  >,
  currentRendition: Rendition | null,
  setIsEpubDisplayed: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (currentRendition) {
    currentRendition.destroy(); // Destroy the current rendition and clear the viewer
  }
  setIsEpubDisplayed(false); // Reset the state
  // Empty the items inside the found dictionary, mainly so that they dont appear in side bar
  setFoundDictionaryData([]);
};

/**
 * Navigate pagination via keyboard arrow keys while the focus is outside of the IFrame.
 */
export const handleKeyDown = (
  currentRendition: Rendition | null,
  event: KeyboardEvent
) => {
  if (currentRendition) {
    if (event.key === "ArrowRight") {
      currentRendition.next();
    } else if (event.key === "ArrowLeft") {
      currentRendition.prev();
    }
  }
};

/**
 * Navigate pagination via keyboard arrow keys while the focus is inside of the IFrame.
 */
export const handleIFrameKey = (currentRendition: Rendition | null) => {
  if (currentRendition) {
    currentRendition.on("keydown", (event: { key: string }) => {
      if (event.key === "ArrowRight") {
        currentRendition.next();
      } else if (event.key === "ArrowLeft") {
        currentRendition.prev();
      }
    });
  }
};

// Clicking the button will click the hidden file input
export const handleAddEbook = () => {
  document.getElementById("fileInput")?.click();
};
