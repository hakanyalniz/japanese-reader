import "./Dictionary.css";
import { handleDataFetching } from "../Home/helpers";

import { useEffect, useState } from "react";

function Dictionary() {
  const [searchResults, setSearchResults] = useState([]);
  const [currentPagination, setCurrentPagination] = useState(0);
  let searchBar: HTMLInputElement;

  // Change the below values to play with pagination numbers
  const ITEM_PER_PAGINATION = 13;

  // So, currentPageFirstItem will be 0, 10, 20, 30 and so on
  // currentPageLastItem will be 10, 20, 30, 40 and so on
  // the logic here is that lastItem will be 10 ahead of first item
  // This way, we get 10 slices off the array in order
  const currentPageFirstItem = currentPagination * ITEM_PER_PAGINATION;
  const currentPageLastItem =
    currentPagination * ITEM_PER_PAGINATION + ITEM_PER_PAGINATION;

  const handleFormButtonClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (searchBar.value == "") {
      setSearchResults([]);
    }

    if (!searchBar || !searchBar.value || searchBar.value == "") return;

    handleDataFetching({
      query: searchBar.value,
    }).then((data) => {
      console.log(data);

      return setSearchResults(data);
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    searchBar = document.getElementById("searchBar") as HTMLInputElement;
    searchBar.addEventListener("input", handleFormButtonClick);
  }, []);

  const handleNextPagination = () => {
    setCurrentPagination((prevState) => {
      return (prevState = prevState + 1);
    });
  };

  const handlePrevPagination = () => {
    setCurrentPagination((prevState) => {
      if (prevState > 0) {
        return (prevState = prevState - 1);
      }
      return prevState;
    });
  };

  useEffect(() => {
    console.log(currentPagination);
  });

  return (
    <div>
      <form className="search-container">
        <input type="text" placeholder="Search..." id="searchBar" required />
        <button id="searchButton" onClick={handleFormButtonClick}>
          Search
        </button>
      </form>

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
            {searchResults
              .slice(currentPageFirstItem, currentPageLastItem)
              .map((item, index) => {
                return (
                  <tr key={index}>
                    <td> {item["kanji"]}</td>
                    <td> {item["kana"]}</td>
                    <td> {item["meaning"]}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="pagination-buttons">
        <button onClick={handlePrevPagination}>Prev</button>
        <span className="pagination-number">{currentPagination}</span>
        <button onClick={handleNextPagination}>Next</button>
      </div>
    </div>
  );
}

export default Dictionary;

// Add pagination
