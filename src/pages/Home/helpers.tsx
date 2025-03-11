import ePub, { Rendition } from "epubjs";
import axios from "axios";

/**
 * Store ebook metadata for later use in reconstructing it if the user returns to the page after leaving it.
 */
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

/**
 * Store ebook data field metadata as base64, when the time to use it comes, turn it back to file using the data metadata and other metadata already collected.
 */
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

/**
 * Takes file input, open the epub file received, display it via the epubjs library. Registers themes and additional settings.
 * If the user has already opened an epub file previously, save the metadata and if the remove button hasn't yet been clicked,
 * use the metadata to load the epub again. This function runs when the file input element changes, as in, an input is entered.
 */
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
  setDictionaryData,
  setFoundDictionaryData
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
        } else {
          setFoundDictionaryData([]);
        }
      }
    }
  });
};

/**
 * Fetch data from Flask
 */
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

/**
 * Loops through the clicked character and all the way through the rest of the sentence and searches them inside the dictionary data.
 * Starts from the clicked character location, if found adds it at setFoundDictionaryData, then moves onto the next character in the sentence,
 * and adds that character, and the previous character, together. Searches that aswell. Loops through the sentence in this manner, searching for
 * word combinations.
 *
 * Example:
 *
 * 引きこもり
 *
 * clickedQuery is 引.
 *
 * currentWordBeingSearched is 引.
 *
 * Searches the currentWordBeingSearched in dictionaryData, then moves onto the next character, adding き into currentWordBeingSearched.
 *
 * Now currentWordBeingSearched is 引き, searches this in the dictionaryData aswell. And so on.
 */
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

  // control the font size and width of viewer
  if (width <= 600) {
    safeResize(currentRendition, viewer.offsetWidth, viewer.offsetHeight);
  } else if (width <= 915) {
    currentRendition.themes.fontSize("22px");
    safeResize(currentRendition, viewer.offsetWidth, viewer.offsetHeight);
  } else if (width <= 1115) {
    currentRendition.themes.fontSize("20px");
    safeResize(currentRendition, 800, viewer.offsetHeight);
  } else if (width <= 1400) {
    safeResize(currentRendition, 1000, viewer.offsetHeight);
  } else {
    currentRendition.themes.fontSize("18px");
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

/**
 * Will run the click method on the hidden file input element.
 */
export const handleAddEbook = () => {
  document.getElementById("fileInput")?.click();
};

let startX = 0;
let endX = 0;

const threshold = 30; // Minimum distance to be considered a swipe (in pixels)

/**
 * Records the current pageX and pageY coordinates through MouseEvent or TouchEvent.
 */
export const swipeStartHandler = (event: MouseEvent | TouchEvent) => {
  event.preventDefault();

  if (event.type == "mousedown") {
    startX = event.pageX;
  } else {
    const touch = event.touches[0];
    startX = touch.pageX;
  }
};

/**
 * Records the end point of the pageX and pageY coordinates. Subtracts them from the start coordinates and decides swipe direction according to result.
 */
export const swipeEndHandler = (
  event: MouseEvent | TouchEvent,
  currentRendition: Rendition
) => {
  event.preventDefault();

  if (event.type == "mouseup") {
    endX = event.pageX;
  } else {
    const touch = event.changedTouches[0];
    endX = touch.pageX;
  }

  const deltaX = endX - startX;

  if (Math.abs(deltaX) > threshold) {
    // Horizontal swipe
    if (deltaX > 0) {
      currentRendition.prev();
    } else {
      currentRendition.next();
    }
  }
};

/**
 * Checks if a deck exists or not.
 */
async function deckExists(deckName: string) {
  const response = await invokeAnkiConnect("deckNames");
  return response.includes(deckName);
}

/**
 * Creates a deck if it doesn't exist already.
 */
async function createDeckIfNotExists(deckName: string) {
  const exists = await deckExists(deckName);

  if (!exists) {
    await invokeAnkiConnect("createDeck", {
      deck: deckName,
    });
    console.log(`Deck "${deckName}" created.`);
  } else {
    console.log(`Deck "${deckName}" already exists.`);
  }
}

/**
 * Adds cards to the deck, creates a deck if it doesn't exist already.
 */
export const addCardToDeck: addCardToDeckInterface = async (
  deckName,
  front,
  back
) => {
  // First, ensure the deck exists
  await createDeckIfNotExists(deckName);

  // Add the card
  const note = {
    deckName: deckName,
    modelName: "Basic", // You can choose a different model if needed
    fields: {
      Front: `<h1>${front}</h1>
      <br/>
      <br/>
      <p style="visibility:hidden">${back.id}</p>`,
      Back: `<p>Kana: ${back.kana}</p><p>Meaning: ${back.meaning}</p>`,
    },
    tags: ["kanji"], // Optional: add tags if needed
  };

  const response = await invokeAnkiConnect("addNote", { note });
  console.log(response);
};

/**
 * Communicates with the AnkiConnect local API by executing commands.
 */
async function invokeAnkiConnect(action: string, params = {}) {
  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, version: 6, params }),
    });

    // Check if the response is OK (status code 2xx)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Optionally rethrow or handle error
  }
}
