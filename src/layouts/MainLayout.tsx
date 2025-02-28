import { Outlet } from "react-router-dom";
import "./MainLayout.css";
import TopNavBar from "../components/NavBar/TopNavBar";

const Layout = () => {
  return (
    <div className="grid-container">
      <TopNavBar />
      <main>
        <Outlet />
        {/* This is where child components (like Home, Blogs) will render */}
      </main>
    </div>
  );
};

export default Layout;
