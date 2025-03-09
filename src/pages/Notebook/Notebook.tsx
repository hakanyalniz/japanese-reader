import { useSelector, useDispatch } from "react-redux";
import {
  selectDictionaryHistory,
  deleteDictionaryHistory,
} from "../../store/slices/fileSlices";

import "./Notebook.css";

function Notebook() {
  const dictionaryHistory = useSelector(selectDictionaryHistory);
  const dispatch = useDispatch();

  // Function to handle row deletion
  const handleDelete = (id: number) => {
    dispatch(deleteDictionaryHistory(id)); // Dispatch the action with the row id
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
// Persist the epub after it has been loaded
// when user clicks to upload epub get the input as state
// if they click remove book, clear the state, if not, when they come back to main from other page
// run the show epub function again from the state

// either take function from helper to main to run the states on it, since it cant run if not inside component
// or make the function return the user input
