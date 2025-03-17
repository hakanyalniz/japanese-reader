import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/MainLayout";
import Home from "./pages/Home/Home";
import Notebook from "./pages/Notebook/Notebook";
import Dictionary from "./pages/Dictionary/Dictionary";
import "./styles/App.css";

import { Provider } from "react-redux";
import store from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="notebook" element={<Notebook />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
