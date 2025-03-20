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

  const logOut = () => {
    fetch(`http://127.0.0.1:5000/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
    return;
  };

  useEffect(() => {
    console.log(logInStatus);
  }, [logInStatus]);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/protected-content", {
        method: "GET",
        credentials: "include", // Important for sending cookies
      });

      const data = await response.json();

      if (response.ok) {
        // Status code 200 means user is logged in
        console.log("Logged in as: ", data.user_id);
      } else {
        // Status code 401 means user is not logged in
        console.log("Logged out");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  return (
    <div className="top-nav">
      <button onClick={checkLoginStatus}>Logout</button>
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
        {logInStatus ? (
          <button className="nav-button" onClick={logInPopUp}>
            Log in
          </button>
        ) : (
          <button className="nav-button" onClick={logOut}>
            Log out
          </button>
        )}
      </div>
    </div>
  );
};

export default TopNavBar;
