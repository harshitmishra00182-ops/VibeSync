import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Explore from "./pages/Explore";
import Experience from './pages/Experience';


const App = () => {
  const [isMinimalist, setIsMinimalist] = useState(false);
  return (
    <BrowserRouter>
      <Navbar  isMinimalist={isMinimalist}
        setIsMinimalist={setIsMinimalist}/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
              <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
