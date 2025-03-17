import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import VideoDisplay from "./components/VideoDisplay";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/video" element={<VideoDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
