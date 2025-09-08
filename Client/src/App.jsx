import { BrowserRouter, Routes, Route } from "react-router-dom";
import Success from "./components/Success";
import NewAuth from "./components/NewAuth";
import "./App.css";
import { N } from "ethers";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/success" element={<Success />} />
        <Route path="/" element={<NewAuth /> } />
        <Route path="/dashboard" element={<Dashboard/> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
