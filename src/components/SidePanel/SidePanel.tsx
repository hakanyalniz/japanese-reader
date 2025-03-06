import "./SidePanel.css";
import { useState } from "react";

interface ChildProps {
  foundDictionaryData: {
    kanji: string;
    kana: string;
    meaning: string;
  }[];
}

const SidePanel: React.FC<ChildProps> = ({ foundDictionaryData }) => {
  const [panelVisibility, setPanelVisibility] = useState(true);

  const handlePanelMove = () => {
    setPanelVisibility(!panelVisibility);
  };

  return (
    <div className={`side-panel ${panelVisibility ? "show" : "hide"}`}>
      <div id="panel-move" onClick={handlePanelMove}>
        {"<<<"}
      </div>
      <div className="kanji-def">
        {foundDictionaryData.map((item, index) => {
          return (
            <div key={index} className="kanji-card">
              <div className="kanji-info">{item["kanji"]}</div>
              <div className="kana-info">{item["kana"]}</div>
              <div className="meaning-info">{item["meaning"]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SidePanel;
