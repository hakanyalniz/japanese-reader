import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <header>Header Content</header>
      <main>
        <Outlet />
        {/* This is where child components (like Home, Blogs) will render */}
      </main>
      <footer>Footer Content</footer>
    </div>
  );
};

export default Layout;
