import "./Dictionary.css";
import { handleDataFetching } from "../Home/helpers";

import { useEffect, useState } from "react";

function Dictionary() {
  const [searchResults, setSearchResults] = useState(0);

  const handleFormButtonClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const searchBar = document.getElementById("searchBar") as HTMLInputElement;

    if (!searchBar) return;

    handleDataFetching({
      query: searchBar.value,
    }).then((data) => setSearchResults(data));
  };

  useEffect(() => {
    console.log(searchResults);
  }, [searchResults]);

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
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
}

export default Dictionary;
