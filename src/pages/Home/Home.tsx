import SidePanel from "../../components/SidePanel/SidePanel";
import "./Home.css";
import ePub, { Rendition } from "epubjs";
import { useState, useRef, useEffect } from "react";

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
            body: { background: "#242424", color: "white" },
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

  // handle pagination controls via buttons
  const handleNextPage = () => {
    if (currentRendition) {
      currentRendition.next();
    }
  };

  const handlePrevPage = () => {
    if (currentRendition) {
      currentRendition.prev();
    }
  };

  // navigate pagination via keyboard, one works inside iframe, the other outside it
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentRendition) {
        if (event.key === "ArrowRight") {
          currentRendition.next();
        } else if (event.key === "ArrowLeft") {
          currentRendition.prev();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentRendition]);

  // Navigate using keyboard keys inside iframe
  useEffect(() => {
    if (currentRendition) {
      currentRendition.on("keydown", (event: { key: string }) => {
        if (event.key === "ArrowRight") {
          currentRendition.next();
        } else if (event.key === "ArrowLeft") {
          currentRendition.prev();
        }
      });
    }
  }, [currentRendition]);

  // Clear the EPUB content and reset the viewer
  const handleRemoveEbook = () => {
    if (currentRendition) {
      currentRendition.destroy(); // Destroy the current rendition and clear the viewer
    }
    setIsEpubDisplayed(false); // Reset the state
  };

  return (
    <div className="home-flex">
      <div className="container">
        <div id="ebook-navigation">
          <button
            className="nav-button"
            onClick={handlePrevPage}
            disabled={!currentRendition}
          >
            Previous
          </button>
          <button
            className="nav-button"
            onClick={handleNextPage}
            disabled={!currentRendition}
          >
            Next
          </button>
        </div>
        <div id="add-remove-container">
          {isEpubDisplayed && (
            <button className="nav-button" onClick={handleRemoveEbook}>
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
