// import React from 'react'
// import { Link, NavLink, useNavigate } from 'react-router-dom'
// import {useSelector} from 'react-redux'
// import Container from '../../Container/Container'


// function Header() {
//   const {isAuthenticated} = useSelector((state) => state.user)
//   const navigate = useNavigate()

//   const navItems = [
//     {
//       name: 'Home',
//       slug: "/",
//       active: true
//     },
//     {
//       name: 'Products',
//       slug: "/products",
//       active: true
//     },
//     {
//       name: 'Search',
//       slug: "/search",
//       active: true
//     },
//     {
//       name: 'Cart',
//       slug: "/cart",
//       active: true
//     },
//     {
//       name: 'Account',
//       slug: "/account",
//       active: true
//     },
//     {
//       name: "Login",
//       slug: "/login",
//       active: !isAuthenticated,
//   }
//   ]


//   return (
//     <header className='py-3 shadow bg-red-400'>
//       <Container>
//       <nav className='flex'>
//           <div className='mr-4'>
//             <Link to='/'>
//               {/* <Logo width='70px'   /> */}
//               <h1>Ecomm</h1>

//               </Link>
//           </div>
//           <ul className='flex ml-auto'>
//             {navItems.map((item) => 
//             item.active ? (
//               <li key={item.name}>
//                 <NavLink
//                 // onClick={() => navigate(item.slug)}
//                 to={item.slug}
//                 className='inline-bock px-6 py-2 duration-200 hover:bg-blue-100 rounded-full headerLink'
//                 >{item.name}</NavLink>
//               </li>
//             ) : null
//             )}
//           </ul>
//         </nav>
//       </Container>
        
//     </header>
//   )
// }

// export default Header


import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "../../Container/Container";

function Header() {
  const { isAuthenticated } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false); // State for toggling the menu

  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "Products", slug: "/products", active: true },
    { name: "Search", slug: "/search", active: true },
    { name: "Cart", slug: "/cart", active: true },
    { name: "Account", slug: "/account", active: isAuthenticated },
    { name: "Login", slug: "/login", active: !isAuthenticated },
  ];

  return (
    <header className="py-3 shadow bg-red-400">
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
            className="block lg:hidden p-2 text-white"
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
            className={`lg:flex lg:items-center lg:gap-6 absolute lg:static top-16 left-0 w-full lg:w-auto bg-red-400 lg:bg-transparent p-4 lg:p-0 transition-transform duration-300 ease-in-out ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name} className="mb-4 lg:mb-0">
                    <NavLink
                      to={item.slug}
                      className="block px-4 py-2 text-white rounded-md hover:bg-red-500 duration-200 headerLink"
                      onClick={() => setMenuOpen(false)} // Close menu on link click
                    >
                      {item.name}
                    </NavLink>
                  </li>
                )
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
