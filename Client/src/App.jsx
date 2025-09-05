import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Success from "./components/Success";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
