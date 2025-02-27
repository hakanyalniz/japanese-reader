import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/MainLayout";
import Home from "./pages/Home";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
