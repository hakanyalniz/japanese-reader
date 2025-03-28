import ePub, { Rendition } from "epubjs";
import axios from "axios";

/**
 * Store ebook metadata for later use in reconstructing it if the user returns to the page after leaving it.
 *
 * @param file
 * @returns
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
 *
 * @param base64
 * @param name
 * @param type
 * @param lastModified
 * @returns
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
 *
 * @param setCurrentRendition
 * @param viewerRef
 * @param setIsEpubDisplayed
 * @param event
 * @param currentlyDisplayedEpub
 * @returns
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
          layout: "reflowable",
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

/**
 * Get the kanji/character the user clicked on, alongside the sentence in which that character appeared.
 *
 * @param currentRendition
 * @param clickedQuery
 * @param clickedQuerySentence
 * @param setDictionaryData
 * @param setFoundDictionaryData
 */
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

          handleDataFetching(
            {
              query: clickedCharacter,
            },
            setDictionaryData
          );
        } else {
          setFoundDictionaryData([]);
        }
      }
    }
  });
};

/**
 * Fetch data from Flask.
 *
 * @param setDictionaryData
 * @param params
 */
export const handleDataFetching = (
  params: Record<string, string>, // Accept multiple parameters as an object
  setDictionaryData?: React.Dispatch<
    React.SetStateAction<DictionaryItem[] | null>
  >
) => {
  return axios
    .get("http://127.0.0.1:5000/api/data", {
      params,
    })
    .then((response) => {
      if (setDictionaryData) {
        setDictionaryData(response.data);
      } else {
        return response.data;
      }
    })
    .catch((error) => {
      console.error("Error fetching data from Flask:", error);
      return 0;
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
 *
 * @param dictionaryData
 * @param clickedQuery
 * @param clickedQuerySentence
 * @param setFoundDictionaryData
 * @returns
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
  const tempResult: DictionaryItem[] = [];
  let currentWordBeingSearched = "";

  for (let x = 0; x < dictionaryData.length; x++) {
    currentWordBeingSearched = "";
    for (let y = startIndex; y <= endIndex; y++) {
      if (currentWordBeingSearched == dictionaryData[x]["kanji"]) {
        // Ensure that the result is not repeated inside the results
        if (!result.includes(dictionaryData[x])) {
          result.push({
            ...dictionaryData[x],
            sentence: clickedQuerySentence.current,
          });
          break;
        }
      } else if (currentWordBeingSearched == dictionaryData[x]["kana"]) {
        // if matching kanji not found, this looks for matching kana
        if (!tempResult.includes(dictionaryData[x])) {
          tempResult.push({
            ...dictionaryData[x],
            sentence: clickedQuerySentence.current,
          });
          break;
        }
      } else {
        // Add the first kanji in the dict list, so it is the default meaning
        if (x == 0 && y == startIndex) {
          result.push({
            ...dictionaryData[x],
            sentence: clickedQuerySentence.current,
          });
        }
        currentWordBeingSearched += clickedQuerySentence.current[y];
      }
    }
  }

  // The logic here is that, by finding the largest kana length, we can find the full word we clicked on
  // since the largest kana in the dictionary is also the full word
  // this happens due to the searching loop logic we have, in the word 引きこもり
  // the largest length will be the word itself, since we search by adding character and 引きこもりが is not a word
  // we also break the loop when the word is found
  // find the largest kana length in dictionary
  let largestCharacter = 0;
  tempResult.forEach((item) => {
    if (item.kana.length > largestCharacter) {
      largestCharacter = item.kana.length;
    }
  });
  // take sentence, start from search location
  // move 'largest kana length' to the right
  // take the word inbetween
  let fullWord = "";
  for (let y = startIndex; y < startIndex + largestCharacter; y++) {
    fullWord += clickedQuerySentence.current[y];
  }
  // take the dictionary results with the full word
  const fullWordDictionaryResult = tempResult.filter(
    (item) => item.kana == fullWord
  );
  // add it to result
  fullWordDictionaryResult.forEach((item) => {
    result.unshift(item);
  });
  // sort so the largest items appear first
  result.sort(
    (a, b) => b.kanji.length - a.kanji.length || b.kana.length - a.kana.length
  );

  return result;
};

/**
 * Resizes the IFrame that displays epub. A replacement for the official rendition.resize method.
 *
 * @param rendition
 * @param width
 * @param height
 * @returns
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
 *
 * @param currentRendition
 * @returns
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
 *
 * @param currentRendition
 */
export const handleNextPage = (currentRendition: Rendition | null) => {
  if (currentRendition) {
    currentRendition.next();
  }
};

/**
 * Handle pagination control previous page via HTML button.
 *
 * @param currentRendition
 */
export const handlePrevPage = (currentRendition: Rendition | null) => {
  if (currentRendition) {
    currentRendition.prev();
  }
};

/**
 * Clear the EPUB content and reset the viewer.
 *
 * @param setFoundDictionaryData
 * @param currentRendition
 * @param setIsEpubDisplayed
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
 *
 * @param currentRendition
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
 *
 */
export const handleAddEbook = () => {
  document.getElementById("fileInput")?.click();
};

let startX = 0;
let endX = 0;

const threshold = 30; // Minimum distance to be considered a swipe (in pixels)

/**
 * Records the current pageX and pageY coordinates through MouseEvent or TouchEvent.
 *
 * @param event
 */
export const swipeStartHandler = (event: MouseEvent | TouchEvent) => {
  if (event.type == "mousedown") {
    startX = event.pageX;
  } else {
    const touch = event.touches[0];
    startX = touch.pageX;
  }
};

/**
 * Records the end point of the pageX and pageY coordinates. Subtracts them from the start coordinates and decides swipe direction according to result.
 *
 * @param event
 * @param currentRendition
 */
export const swipeEndHandler = (
  event: MouseEvent | TouchEvent,
  currentRendition: Rendition
) => {
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
 *
 * @param deckName
 * @returns
 */
async function deckExists(deckName: string) {
  const response = await invokeAnkiConnect("deckNames");
  return response.includes(deckName);
}

/**
 * Creates a deck if it doesn't exist already.
 *
 * @param deckName
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
 *
 * @param deckName
 * @param front
 * @param back
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
      Back: `<p>${back.kana}</p><p>${back.meaning}</p><p>${back.sentence}</p>`,
    },
    tags: ["kanji"], // Optional: add tags if needed
  };

  const response = await invokeAnkiConnect("addNote", { note });
  console.log(response);
};

/**
 * Communicates with the AnkiConnect local API by executing commands.
 *
 * @param action
 * @param params
 * @returns
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

/**
 * Check if the user is logged in or not.
 */
export const checkLoginStatus = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/check-login", {
      method: "GET",
      credentials: "include", // Important for sending cookies
    });
    console.log("running");
    const data = await response.json();

    if (response.ok) {
      // Status code 200 means user is logged in
      console.log("Logged in as: ", data.user_id);
      return true;
    } else {
      // Status code 401 means user is not logged in
      console.log("Logged out");
      return false;
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

/**
 * Get notebook table from user_data.
 */
export async function getNoteBookData() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/notebook", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    // Check if the response is OK (status code 2xx)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Optionally rethrow or handle error
  }
}

/**
 * Post notebook table from user_data.
 */
export async function postNoteBookData(notebookContent: Array<unknown>) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/notebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notebookContent),
      credentials: "include",
    });
    // Check if the response is OK (status code 2xx)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Optionally rethrow or handle error
  }
}

/**
 * Delete item from server size table in the SQL database.
 */
export async function delNoteBookData(deleteItemId) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/notebookdel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteItemId),
      credentials: "include",
    });
    // Check if the response is OK (status code 2xx)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Optionally rethrow or handle error
  }
}
