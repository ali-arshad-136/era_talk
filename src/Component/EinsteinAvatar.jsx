import React, { useEffect, useRef } from "react";
import { Typography } from "@mui/material";
import "./Css/EinsteinAvatar.css"; // Add animations
import image from "../Images/einstien.svg";
import speakingVideo from "../Vedios/speaking.mp4"; // Replace with actual video for speaking
import notSpeakingVideo from "../Vedios/idol.mp4"; // Replace with actual video for not speaking

const EinsteinAvatar = ({ isSpeaking, isListening }) => {
  // Create a reference for the video element to update the source directly
  const videoRef = useRef(null);

  useEffect(() => {
    // Update the video source based on the `isSpeaking` prop
    if (videoRef.current) {
      const newVideoSrc = isSpeaking ? speakingVideo : notSpeakingVideo;
      // Set the video source without causing a re-render
      videoRef.current.src = newVideoSrc;
    }
  }, [isSpeaking]); // This will run whenever the `isSpeaking` prop changes

  return (
    <div style={{ textAlign: "center" }}>
      <div className="">
        {/* Display the Einstein image */}

        {/* Conditional rendering of video based on isSpeaking */}
        <video
          ref={videoRef} // Attach the ref to the video element
          autoPlay
          loop
          muted
          style={{
            width: "90%",
            height: "auto",
            borderRadius: "4%",
            padding: "0px",
          }}
        >
          {/* The video source will be set directly in the useEffect */}
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default EinsteinAvatar;
