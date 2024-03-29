// import Footer from "./Footer"
// import Header from "./Header"
import { type PropsWithChildren } from "react";

import Footer from "./Footer";
import Header from "./Header";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen md:h-screen flex flex-col">
      <Header />
      <main className="flex-1 md:overflow-y-scroll p-2">{children}</main>
      <Footer />
    </div>
  );
};
export default MainLayout;
