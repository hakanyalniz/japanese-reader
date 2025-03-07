import { Link } from "react-router-dom";
import "./TopNavBar.css";

const TopNavBar = () => {
  return (
    <div className="top-nav">
      <div className="left-nav">
        <Link className="nav-button" to="/">
          Home
        </Link>
        <Link className="nav-button" to="instructions">
          Instructions
        </Link>
        <Link className="nav-button" to="notebook">
          Notebook
        </Link>
      </div>
      <div className="right-nav"></div>
    </div>
  );
};

export default TopNavBar;
