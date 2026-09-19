import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Playground from "./pages/Playground";
import Demo from "./pages/Demo";
;

export default function App() {
  return (
    <div>



      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </div>
  );
}