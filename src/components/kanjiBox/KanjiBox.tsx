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

    // console.log(currentRendition);
    // console.log(currentRendition.manager);
    // console.log(currentRendition.manager.views);

    // console.log(event);
    // positionX.current = event.clientX;
    // positionY.current = event.clientY;

    positionX.current = event.screenX;
    positionY.current = event.screenY - 130;

    console.log(positionX.current, positionY.current);
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
