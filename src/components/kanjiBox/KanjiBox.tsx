import { useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addDictionaryHistory } from "../../store/slices/fileSlices";

import "./KanjiBox.css";

const KanjiBox: React.FC<KanjiBoxInterface> = ({
  currentRendition,
  foundDictionaryData,
}) => {
  const dispatch = useDispatch();
  const positionX = useRef(0);
  const positionY = useRef(0);
  const localKanjiNumber = useRef(0);

  // Used for the kanji box, which will show information about the kanji clicked
  const kanjiBox = useRef<HTMLDivElement>(null);

  const handleKanjiBox = (event: { clientX: number; clientY: number }) => {
    if (!kanjiBox.current) return;

    const generalContainer = document.getElementById(
      "container"
    ) as HTMLElement;
    const generalContainerWidth = parseFloat(
      window.getComputedStyle(generalContainer).marginLeft
    );

    const iframe = document.querySelector("iframe");

    if (!iframe) return;

    // Access the iframe's document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;
    const iframeRect = iframe.getBoundingClientRect();
    // console.log("iframe", iframe);
    console.log("event.clientX", event.clientX);
    // console.log("iframeRect", iframeRect);

    console.log("generalContainerWidth", generalContainerWidth);
    positionX.current = event.clientX - -iframeRect.x - generalContainerWidth;
    // positionX.current = event.clientX % generalContainerWidth;

    positionY.current = event.clientY + 30;
    console.log("positionX.current", positionX.current);

    kanjiBox.current.style.top = `${positionY.current}px`;
    kanjiBox.current.style.left = `${positionX.current}px`;
  };

  useEffect(() => {
    if (!kanjiBox.current) return;

    localKanjiNumber.current = foundDictionaryData.length;

    if (localKanjiNumber.current === 0) {
      kanjiBox.current.style.visibility = "hidden";
    } else {
      kanjiBox.current.style.visibility = "visible";
    }
  }, [foundDictionaryData]);

  useEffect(() => {
    if (!currentRendition) return;

    currentRendition.on(
      "click",
      (event: { clientX: number; clientY: number }) => handleKanjiBox(event)
    );
  }, [currentRendition]);

  return (
    <div id="kanji-box" ref={kanjiBox}>
      {foundDictionaryData.map((item, index) => {
        return (
          <div key={index} className="kanji-card">
            <div className="kanji-info">{item["kanji"]}</div>
            <div className="kana-info">{item["kana"]}</div>
            <div className="meaning-info">{item["meaning"]}</div>
            <button
              className="nav-button"
              onClick={() => dispatch(addDictionaryHistory(item))}
            >
              Add
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default KanjiBox;
