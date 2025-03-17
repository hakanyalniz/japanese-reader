import "./Dictionary.css";

function Dictionary() {
  return (
    <div>
      <div className="search-container">
        <input type="text" placeholder="Search..." id="searchBar" />
        <button id="searchButton">Search</button>
      </div>

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
