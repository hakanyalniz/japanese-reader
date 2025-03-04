import SidePanel from "../../components/SidePanel/SidePanel";
import "./Home.css";
import ePub, { Rendition } from "epubjs";
import { useState, useRef, useEffect } from "react";

import {
  handleResize,
  handleNextPage,
  handlePrevPage,
  handleRemoveEbook,
  handleKeyDown,
  handleIFrameKey,
} from "./helpers";

function Home() {
  const [isEpubDisplayed, setIsEpubDisplayed] = useState(false); // Track if EPUB is being displayed

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const viewerRef = useRef<HTMLDivElement>(null); // Ref for the viewer container

  const [currentRendition, setCurrentRendition] = useState<Rendition | null>(
    null
  );

  // Clicking the button will click the hidden file input
  const handleAddEbook = () => {
    document.getElementById("fileInput")?.click();
  };

  // When file input changes display the epub file
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

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

      reader.readAsArrayBuffer(file); // Read the EPUB file as an ArrayBuffer
    } else {
      alert("Please upload a valid EPUB file.");
    }
  };

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
          if (clickedCharacter) {
            console.log(clickedCharacter);
          } else {
            console.log("You clicked outside the text.");
          }
        } else {
          console.log("You clicked outside the text.");
        }
      }
    });
  }, [currentRendition]);

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
                onChange={handleFileInput}
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
