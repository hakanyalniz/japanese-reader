import { useSelector, useDispatch } from "react-redux";
import {
  selectDictionaryHistory,
  deleteDictionaryHistory,
} from "../../store/slices/fileSlices";

import "./Notebook.css";
import { useEffect } from "react";

// Define a Type for the table row data

function Notebook() {
  const dictionaryHistory = useSelector(selectDictionaryHistory);
  const dispatch = useDispatch();

  // Function to handle row deletion
  const handleDelete = (kanji) => {
    dispatch(deleteDictionaryHistory(kanji)); // Dispatch the action with the row id
  };

  useEffect(() => {
    console.log(dictionaryHistory);
  }, [dictionaryHistory]);

  return (
    <div>
      <div className="table-container">
        <table className="kanji-table">
          <thead>
            <tr>
              <th>KANJI</th>
              <th>KANA</th>
              <th>MEANING</th>
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
                      onClick={() => handleDelete(item["kanji"])}
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
