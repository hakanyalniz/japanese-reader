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

    const rect = generalContainer.getBoundingClientRect();
    const parentRect =
      generalContainer.offsetParent?.getBoundingClientRect() as DOMRect;
    const containerMarginLeft = -(rect.width - parentRect.width) / 2;

    const iframe = document.querySelector("iframe");

    if (!iframe) return;

    // Access the iframe's document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;
    const iframeRect = iframe.getBoundingClientRect();

    // The clientX takes the width of the iframe into account, which is in thousands due to how epubjs calculates pagination
    // to deal with this we need to delete the extra iframe width that is taken into account
    // and then we also need to take into account the margin of the container, which effects iframe width
    positionX.current = event.clientX - -iframeRect.x - containerMarginLeft;
    positionY.current = event.clientY + 30;

    if (positionY.current > iframeRect.height - 200) {
      positionY.current -= 250;
    }

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
