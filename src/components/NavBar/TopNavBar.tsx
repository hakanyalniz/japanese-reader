import { Link } from "react-router-dom";
import LogIn from "../LogIn/LogIn";
import "./TopNavBar.css";
import { useEffect, useState } from "react";

const TopNavBar = () => {
  const [logInStatus, setLogInStatus] = useState<boolean>(false);
  const [loginFormClose, setLoginFormClose] = useState(true);

  // The loginFormClose is used to close or open the login box
  const logInPopUp = () => {
    console.log("test");
    if (loginFormClose) {
      setLoginFormClose(false);
    } else {
      setLoginFormClose(true);
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
        setLogInStatus(false);
      });
    return;
  };

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/check-login", {
        method: "GET",
        credentials: "include", // Important for sending cookies
      });
      console.log("running");
      const data = await response.json();

      if (response.ok) {
        // Status code 200 means user is logged in
        console.log("Logged in as: ", data.user_id);
        setLogInStatus(true);
      } else {
        // Status code 401 means user is not logged in
        console.log("Logged out");
        setLogInStatus(false);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  // Checks if user is logged in on page refresh
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <div className="top-nav">
      <button onClick={checkLoginStatus}>Check Login Status</button>
      {loginFormClose ? null : (
        <LogIn
          logInStatus={logInStatus}
          logInPopUp={logInPopUp}
          setLogInStatus={setLogInStatus}
        />
      )}
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
          <button className="nav-button" onClick={logOut}>
            Log out
          </button>
        ) : (
          <button className="nav-button" onClick={logInPopUp}>
            Log in
          </button>
        )}
      </div>
    </div>
  );
};

export default TopNavBar;
