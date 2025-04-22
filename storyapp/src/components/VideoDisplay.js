import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./storify.css";

export default function VideoDisplay() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/fetchvideos");
      console.log("Fetched data:", response.data);

      const videoData = response.data.urls || [];
      setVideos(videoData);
    } catch (error) {
      console.error("Error fetching video data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkVideoStatus = async () => {
    setChecking(true);
    setMessage("");
    try {
      const response = await axios.get("http://localhost:4000/check-video-status");
      if (response.data.url) {
        await axios.post("http://localhost:4000/add-video", { url: response.data.url });
        setMessage("Video is ready! Refreshing...");
        window.location.reload();
      } else {
        setMessage(response.data.message || "Video is still processing. Try again later.");
      }
    } catch (error) {
      console.error("Error checking video status:", error);
   
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="storify-container bg-gradient-to-r from-indigo-100 to-purple-100 min-h-screen p-6 rounded-lg relative">
      <a href="/" style={{ textDecoration: "none" }}>
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-600 animate-bounce">Tiny Time Travellers</h1>
      </a>
      <div className="floating-shapes"></div>
      
      <div className="text-center mb-6">
        <button
          onClick={checkVideoStatus}
          className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700"
          disabled={checking}
        >
          {checking ? "Checking..." : "Check Video Status"}
        </button>
        {message && <p className="mt-2 text-purple-600">{message}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 storify-container">
          {videos.map((video, index) => (
            <div key={index} className="video-card p-6 rounded-xl shadow-lg bg-white transform hover:scale-105 transition-all duration-300 relative">
              <div className="absolute top-2 left-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                {index + 1}
              </div>
              <div className="border-4 border-dashed border-purple-400 p-2 rounded-lg">
                <video controls width="50%" height="500px" className="rounded-lg shadow-inner">
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-xl shadow-md">
          <img src="/api/placeholder/200/200" alt="No videos" className="mx-auto w-32 h-32 mb-4" />
          <p className="text-2xl font-bold text-purple-500">Oops! No videos yet!</p>
          <p className="text-lg text-purple-400 mt-2">Check back soon for awesome videos!</p>
        </div>
      )}
    </div>
  );
}
