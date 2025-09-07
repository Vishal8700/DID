import { BrowserRouter, Routes, Route } from "react-router-dom";
import Success from "./components/Success";
import NewAuth from "./components/NewAuth";
import "./App.css";
import { N } from "ethers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/success" element={<Success />} />
        <Route path="/" element={<NewAuth /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
