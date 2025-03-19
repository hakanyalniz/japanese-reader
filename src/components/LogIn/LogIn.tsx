import "./LogIn.css";
import { useState } from "react";

const LogIn = () => {
  const [signUp, setSignUp] = useState(Boolean);

  const dissappearForm = () => {
    const element = document.getElementById("login-box");
    if (element) {
      element.style.display = "none";
    }
  };

  const handleRegister = () => {
    if (signUp) {
      setSignUp(false);
    } else {
      setSignUp(true);
    }
  };

  return (
    <div id="login-box">
      {signUp ? (
        <>
          <h3>Sign up</h3>
          <form action="">
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" onClick={dissappearForm}>
              Login
            </button>
            <p>Not registered?</p>
            <span className="nav-button" onClick={handleRegister}>
              Log in
            </span>
          </form>
        </>
      ) : (
        <>
          <h3>Log In</h3>
          <form action="">
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" onClick={dissappearForm}>
              Login
            </button>
            <p>Not registered?</p>
            <span className="nav-button" onClick={handleRegister}>
              Sign up
            </span>
          </form>
        </>
      )}
    </div>
  );
};

export default LogIn;
