import { Link } from "react-router-dom";
import "./TopNavBar.css";

const TopNavBar = () => {
  return (
    <div className="top-nav">
      <div className="left-nav">
        <Link className="nav-button" to="/">
          Home
        </Link>
        <Link className="nav-button" to="dictionary">
          Dictionary
        </Link>
        <Link className="nav-button" to="notebook">
          Notebook
        </Link>
      </div>
      <div className="right-nav">
        <button className="nav-button">Login</button>
      </div>
    </div>
  );
};

export default TopNavBar;
