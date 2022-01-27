import Footer from "./Footer"
import Header from "./Header"

function MainLayout({ children }) {
  return (
    <div className="md:h-screen flex flex-col">
      <Header />
      <main className="flex-1 md:overflow-y-scroll p-2">{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout

// see https://simplernerd.com/nextjs-multiple-layouts/
