import { Rendition } from "epubjs";

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

  if (!currentRendition) return;

  if (width <= 600) {
    safeResize(currentRendition, 300, viewer.offsetHeight);
  } else if (width <= 915) {
    currentRendition.themes.fontSize("10px"); // Small font size for mobile
    safeResize(currentRendition, 500, viewer.offsetHeight);
  } else if (width <= 1115) {
    currentRendition.themes.fontSize("12px"); // Medium font size for tablets
    safeResize(currentRendition, 800, viewer.offsetHeight);
  } else if (width <= 1400) {
    currentRendition.themes.fontSize("14px"); // Medium font size for tablets
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
  currentRendition: Rendition | null,
  setIsEpubDisplayed: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (currentRendition) {
    currentRendition.destroy(); // Destroy the current rendition and clear the viewer
  }
  setIsEpubDisplayed(false); // Reset the state
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
