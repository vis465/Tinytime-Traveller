import React, { useState, useEffect } from "react";
import axios from "axios";

export default function VideoDisplay() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/webhooks/video");
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();
  }, []);

  return (
    <div className="container">
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <div key={index} className="row mb-4">
            <div className="col-md-6">
              <video controls width="100%" height="auto" className="border rounded">
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="col-md-6">
              <h3>{video.story}</h3>
            </div>
          </div>
        ))
      ) : (
        <p>No videos available</p>
      )}
    </div>
  );
}
