import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import BusinessIdeaGenerator from "./components/pages/BusinessIdeaGenerator";
import LoginForm from "./components/pages/LoginForm";
import SignupForm from "./components/pages/SignupForm";
import StockVisualizer from "./components/pages/StockVisualizer";
import IdeaChatbot from "./components/pages/IdeaChatbot";

function App() {
  return (
    <Router>
      <div className="App" style={{ fontFamily: "Montserrat" }}>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/top" element={<StockVisualizer />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/bot" element={<IdeaChatbot />} />
          <Route path="/bus" element={<BusinessIdeaGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
