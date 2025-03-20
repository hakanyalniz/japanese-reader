import { Link } from "react-router-dom";
import LogIn from "../LogIn/LogIn";
import "./TopNavBar.css";
import { useEffect, useState } from "react";

const TopNavBar = () => {
  const [logInStatus, setLogInStatus] = useState<boolean>(true);

  const logInPopUp = () => {
    if (logInStatus) {
      setLogInStatus(false);
    } else {
      setLogInStatus(true);
    }
  };

  useEffect(() => {
    console.log(logInStatus);
  }, [logInStatus]);
  return (
    <div className="top-nav">
      {logInStatus ? null : <LogIn logInPopUp={logInPopUp} />}
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
        <button className="nav-button" onClick={logInPopUp}>
          {logInStatus ? "Log in" : "Log out"}
        </button>
      </div>
    </div>
  );
};

export default TopNavBar;
