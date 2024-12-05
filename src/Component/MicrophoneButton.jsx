import React from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { IconButton, Box } from "@mui/material";
import { StopCircle } from "@mui/icons-material";

const MicrophoneButton = ({ stopSpeech, onClick, isListening, isSpeaking }) => {
  return (
    <Box
      sx={{
        display: "flex", // Use flexbox for alignment
        alignItems: "center", // Center items vertically
        justifyContent: "center", // Center items horizontally
        gap: "16px", // Space between buttons
      }}
    >
      {/* Microphone Button */}
      <IconButton
        onClick={onClick}
        sx={{
          width: "80px",
          height: "80px",
          backgroundColor: isListening ? "#f44336" : isSpeaking === false ? "#4caf50" : "grey", // Red when listening, green when off
          color: "#fff",
          "&:hover": {
            backgroundColor: isListening ? "#d32f2f" : isSpeaking === false ? "#388e3c" : "grey",
          },
          boxShadow: 3,
        }}
        disabled={isSpeaking === true}
      >
        {isListening ? <MicOffIcon sx={{ fontSize: "50px" }} /> : <MicIcon sx={{ fontSize: "50px" }} />}
      </IconButton>

      {/* Stop Button */}
      {isSpeaking && (
        <StopCircle
          sx={{
            backgroundColor: "#F44336", // Red for "Stop"
            color: "white",
            cursor: "pointer",
            borderRadius: "50%", // Fully rounded corners
            width: "50px", // Set smaller width
            height: "50px", // Set smaller height
            display: "flex", // Center the stop icon inside the circle
            alignItems: "center",
            justifyContent: "center",
            boxShadow: 2,
          }}
          onClick={stopSpeech}
        />
      )}
    </Box>
  );
};

export default MicrophoneButton;
