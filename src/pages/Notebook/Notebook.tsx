import { useSelector, useDispatch } from "react-redux";
import {
  selectDictionaryHistory,
  deleteDictionaryHistory,
  addDictionaryHistory,
} from "../../store/slices/fileSlices";

import { useState, useEffect } from "react";

import {
  addCardToDeck,
  checkLoginStatus,
  getNoteBookData,
  postNoteBookData,
  delNoteBookData,
} from "../Home/helpers";

import "./Notebook.css";

function Notebook() {
  const [logInStatus, setLogInStatus] = useState<boolean>(false);

  const dictionaryHistory = useSelector(selectDictionaryHistory);
  const dispatch = useDispatch();

  // Function to handle row deletion
  const handleDelete = (id: number) => {
    console.log("inside handledelete");
    delNoteBookData(id);
    dispatch(deleteDictionaryHistory(id));
  };

  const handleAddToAnki = () => {
    dictionaryHistory.map((card) => {
      addCardToDeck("Epub Reader", card.kanji, card);
    });
  };

  const handlePostNotebook = () => {
    console.log("logInStatus", logInStatus);
    if (logInStatus == true) {
      console.log("dictionaryHistory", dictionaryHistory);
      postNoteBookData(dictionaryHistory);
    }
  };

  const handleGetNotebook = async () => {
    if (logInStatus == true) {
      const noteBookContent = await getNoteBookData();
      console.log("noteBookContent", noteBookContent);
      dispatch(addDictionaryHistory(noteBookContent));
    }
  };

  // Checks if user is logged in on page refresh
  useEffect(() => {
    (async () => {
      setLogInStatus(await checkLoginStatus());
    })();
  }, []);

  // If user is logged in, post their notebook into server
  useEffect(() => {
    console.log("posting to database");

    handlePostNotebook();
  }, [logInStatus]);

  // // If user is logged in, get their notebook from server
  useEffect(() => {
    console.log("fetching from database");
    if (logInStatus == true) {
      handleGetNotebook();
    }
  });

  return (
    <div>
      <div className="table-container">
        <table className="kanji-table">
          <thead>
            <tr>
              <th>KANJI</th>
              <th>KANA</th>
              <th>MEANING</th>
              <td className="add-anki">
                <button className="nav-button" onClick={handleAddToAnki}>
                  Add To Anki
                </button>
                <button className="nav-button" onClick={handlePostNotebook}>
                  Add To Notebook
                </button>
                <button className="nav-button" onClick={handleGetNotebook}>
                  Get Notebook
                </button>
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
