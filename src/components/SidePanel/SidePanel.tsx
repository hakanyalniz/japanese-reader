import "./SidePanel.css";

const SidePanel = () => {
  const handlePanelMove = () => {
    console.log("test");
  };

  return (
    <div className="side-panel">
      <div onClick={handlePanelMove}>{"<"}</div>
      Side Panel
    </div>
  );
};

export default SidePanel;
