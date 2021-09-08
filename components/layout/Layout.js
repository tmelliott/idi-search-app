import Footer from "./Footer"
import Header from "./Header"

function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-scroll p-2">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout