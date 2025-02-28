import "./TopNavBar.css";

const TopNavBar = () => {
  return (
    <div className="top-nav">
      <div className="left-nav">
        <span className="nav-button">Home</span>
        <span className="nav-button">Instructions</span>
      </div>
      <div className="right-nav">
        <span className="nav-button">Add Ebook</span>
      </div>
    </div>
  );
};

export default TopNavBar;
