// Old code kept for the sake of documentation

useEffect(() => {
  const parentElement = document.querySelector("#viewer");

  // Create a MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Check if an iframe was added
        const iframe = parentElement?.querySelector("iframe");
        if (iframe) {
          // console.log("Iframe found:", iframe);

          // Stop observing once the iframe is found
          observer.disconnect();

          const handleKeyDown = (event: KeyboardEvent) => {
            if (currentRendition) {
              if (event.key === "ArrowRight") {
                currentRendition.next();
              } else if (event.key === "ArrowLeft") {
                currentRendition.prev();
              }
            }
          };

          // iframe.addEventListener("load", () => {
          //   console.log("Iframe has loaded!");
          //   // Attach the keydown event listener to the iframe's contentDocument
          //   iframe.contentDocument?.addEventListener(
          //     "keydown",
          //     handleKeyDown
          //   );
          // });
          iframe.contentWindow?.addEventListener("keydown", handleKeyDown);
        }
      }
    }
  });

  if (parentElement) {
    observer.observe(parentElement, { childList: true, subtree: true });
  }
}, [currentRendition]);

useEffect(() => {
  if (!currentlyDisplayedEpub) return;

  const reader = new FileReader();
  reader.readAsArrayBuffer(currentlyDisplayedEpub);

  console.log("currentlyDisplayedEpub", currentlyDisplayedEpub);
  const createBlobUrl = (file: File): string =>
    URL.createObjectURL(currentlyDisplayedEpub);
  const reloadFile = (blobUrl: string): File => {
    return new File([blobUrl], "filename.epub", {
      type: "application/epub+zip",
    });
  };
  let file = createBlobUrl(currentlyDisplayedEpub);
  console.log("createBlobUrl", reloadFile(file));

  handleFileInput(
    setCurrentRendition,
    viewerRef,
    setIsEpubDisplayed,
    undefined,
    currentlyDisplayedEpub
  );
}, [currentlyDisplayedEpub]);
