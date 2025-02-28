import "./SidePanel.css";
import { useState } from "react";

const SidePanel = () => {
  const [panelVisibility, setPanelVisibility] = useState(true);

  const handlePanelMove = () => {
    setPanelVisibility(!panelVisibility);
  };

  return (
    <div className={`side-panel ${panelVisibility ? "show" : "hide"}`}>
      <div id="panel-move" onClick={handlePanelMove}>
        {"<<<"}
      </div>
      Side Panel Content
    </div>
  );
};

export default SidePanel;
