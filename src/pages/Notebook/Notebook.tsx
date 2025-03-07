import { useSelector } from "react-redux";
import { selectDictionaryHistory } from "../../store/slices/fileSlices";

function Notebook() {
  const dictionaryHistory = useSelector(selectDictionaryHistory);
  console.log("dictionaryHistory", dictionaryHistory);

  return (
    <div>
      {dictionaryHistory.map((item, index) => {
        return (
          <div key={index} className="kanji-history">
            {item["kanji"]}
          </div>
        );
      })}
    </div>
  );
}

export default Notebook;
