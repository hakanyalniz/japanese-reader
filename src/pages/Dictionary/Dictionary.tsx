import "./Dictionary.css";
import { handleDataFetching } from "../Home/helpers";

import { useEffect, useState } from "react";

function Dictionary() {
  const [searchResults, setSearchResults] = useState([]);
  let searchBar: HTMLInputElement;

  const handleFormButtonClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (searchBar.value == "") {
      setSearchResults([]);
    }

    if (!searchBar || !searchBar.value || searchBar.value == "") return;

    handleDataFetching({
      query: searchBar.value,
    }).then((data) => setSearchResults(data.slice(0, 20)));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    searchBar = document.getElementById("searchBar") as HTMLInputElement;
    searchBar.addEventListener("input", handleFormButtonClick);
  }, []);

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
            {searchResults.map((item, index) => {
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
    </div>
  );
}

export default Dictionary;
