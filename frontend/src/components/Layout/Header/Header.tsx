import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import Container from "@/components/Container/Container";

interface NavItem {
  name: string;
  slug: string;
  active: boolean;
}

function Header(): React.ReactElement {
  const { isAuthenticated, user, wishlist } = useAppSelector((state) => state.user);
  const { cartItems } = useAppSelector((state) => state.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const wishlistCount = wishlist ? wishlist.length : 0;
  const cartCount = cartItems ? cartItems.length : 0;

  const navItems: NavItem[] = [
    { name: "Home", slug: "/", active: true },
    { name: "Products", slug: "/products", active: true },
    { name: "Search", slug: "/search", active: true },
    { name: "Cart", slug: "/cart", active: true },
    { name: "Wishlist", slug: "/wishlist", active: isAuthenticated },
    { name: "Dashboard", slug: "/admin/dashboard", active: isAuthenticated && user?.role === "admin" },
    { name: "Account", slug: "/account", active: isAuthenticated },
    { name: "Login", slug: "/login", active: !isAuthenticated },
  ];

  return (
    <header className="py-3 shadow bg-red-400 relative z-50">
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="mr-4">
            <Link to="/">
              <h1 className="text-white text-xl font-bold">Ecomm</h1>
            </Link>
          </div>

          {/* Hamburger Button */}
          <button
            className="block lg:hidden p-2 text-white relative z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Nav Links */}
          <ul
            className={`lg:flex lg:items-center lg:gap-6 absolute lg:static top-16 left-0 w-full lg:w-auto bg-red-400 lg:bg-transparent p-4 lg:p-0 transition-transform duration-300 ease-in-out z-50 ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            {navItems.map((item) => {
              if (!item.active) return null;

              if (item.name === "Cart") {
                return (
                  <li key={item.name} className="mb-4 lg:mb-0">
                    <NavLink
                      to={item.slug}
                      title="Cart"
                      className={({ isActive }) =>
                        `flex items-center justify-center p-2.5 rounded-full transition-all duration-200 shadow-sm border ${
                          isActive
                            ? "bg-white text-red-500 border-white scale-105 shadow-md"
                            : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                        }`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 fill-current ${isActive ? "text-red-500" : "text-white"}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                          {cartCount > 0 && (
                            <span
                              className={`ml-1 text-xs font-extrabold px-1.5 py-0.5 rounded-full leading-none shadow ${
                                isActive ? "bg-red-500 text-white" : "bg-white text-red-500"
                              }`}
                            >
                              {cartCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              }

              if (item.name === "Wishlist") {
                return (
                  <li key={item.name} className="mb-4 lg:mb-0">
                    <NavLink
                      to={item.slug}
                      title="Wishlist"
                      className={({ isActive }) =>
                        `flex items-center justify-center p-2.5 rounded-full transition-all duration-200 shadow-sm border ${
                          isActive
                            ? "bg-white text-red-500 border-white scale-105 shadow-md"
                            : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                        }`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 fill-current ${isActive ? "text-red-500" : "text-white"}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {wishlistCount > 0 && (
                            <span
                              className={`ml-1 text-xs font-extrabold px-1.5 py-0.5 rounded-full leading-none shadow ${
                                isActive ? "bg-red-500 text-white" : "bg-white text-red-500"
                              }`}
                            >
                              {wishlistCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              }

              return (
                <li key={item.name} className="mb-4 lg:mb-0">
                  <NavLink
                    to={item.slug}
                    className="block px-4 py-2 text-white rounded-md hover:bg-red-500 duration-200 headerLink"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
