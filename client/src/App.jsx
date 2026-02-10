import React, { useState } from "react";
import Sidebar from "./component/Sidebar";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatBox from "./component/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import { assets } from "./assets/assets";
import './assets/prism.css'
import Loading from "./pages/Loading";
import { useAppcontext } from "./context/Appcontext";
import Login from "./pages/Login";
import {Toaster} from 'react-hot-toast'

const App = () => {
  const {user,loadingUser} = useAppcontext()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {pathname} = useLocation()

  if(pathname ==='/loading' || loadingUser) return<Loading/>

  return (
    <>
    <Toaster/>
    {!isMenuOpen && <img src={assets.menu_icon} className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert" onClick={() =>setIsMenuOpen(true)} />}

    {user ? (
      <div className="bg-white text-black dark:bg-gradient-to-b dark:from-[#242124] dark:to-[#000000] dark:text-white transition-colors duration-300">
        <div className="flex h-screen w-screen md:overflow-hidden">
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <Routes>
            <Route path="/" element={<ChatBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </div>
      </div>
    ):(
      <div>
        <Login/>
      </div>
    )}
      
    </>
  );
};

export default App;
