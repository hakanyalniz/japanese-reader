import { Outlet } from "react-router-dom";
import "./MainLayout.css";
import TopNavBar from "../components/NavBar/TopNavBar";
import Footer from "../components/Footer/Footer";

const Layout = () => {
  return (
    <div className="grid-container">
      <TopNavBar />
      <main className="container">
        <Outlet />
        {/* This is where child components (like Home, Blogs) will render */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
