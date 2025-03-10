import { useSelector, useDispatch } from "react-redux";
import {
  selectDictionaryHistory,
  deleteDictionaryHistory,
} from "../../store/slices/fileSlices";

import { addCardToDeck } from "../Home/helpers";

import "./Notebook.css";

function Notebook() {
  const dictionaryHistory = useSelector(selectDictionaryHistory);
  const dispatch = useDispatch();

  // Function to handle row deletion
  const handleDelete = (id: number) => {
    dispatch(deleteDictionaryHistory(id)); // Dispatch the action with the row id
  };

  const handleAddToAnki = () => {
    dictionaryHistory.map((card) => {
      addCardToDeck("Epub Reader", card.kanji, card);
    });
  };

  return (
    <div>
      <div className="table-container">
        <table className="kanji-table">
          <thead>
            <tr>
              <th>KANJI</th>
              <th>KANA</th>
              <th>MEANING</th>
              <td className="add-anki" onClick={handleAddToAnki}>
                <button className="nav-button">Add To Anki</button>
              </td>
            </tr>
          </thead>
          <tbody>
            {dictionaryHistory.map((item, index) => {
              return (
                <tr key={index}>
                  <td> {item["kanji"]}</td>
                  <td> {item["kana"]}</td>
                  <td> {item["meaning"]}</td>
                  <td>
                    <button className="table-btn">Edit</button>
                    <button
                      onClick={() => handleDelete(item["id"])}
                      className="table-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Notebook;

// Create an example field alongside other kanji entries
// Create seperate file for interface
// Create seperate page for detailed kanji view
// Create a dictionary page
