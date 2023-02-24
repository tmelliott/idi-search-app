// import Footer from "./Footer"
// import Header from "./Header"
import { PropsWithChildren } from "react";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="md:h-screen flex flex-col">
      {/* <Header /> */}
      <header>HEADER</header>
      <main className="flex-1 md:overflow-y-scroll p-2">{children}</main>
      {/* <Footer /> */}
      <footer>FOOTER</footer>
    </div>
  );
};
export default MainLayout;
