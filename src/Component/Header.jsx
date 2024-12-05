import React from "react";
import { Box, IconButton, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import backIcon from "../Images/backButton.svg";
import avatarIcon from "../Images/header.jpg";
const Header = () => {
  return (
    <Box
      sx={{
        position: "fixed", // Make the header fixed at the top
        top: 0,
        left: 0,
        width: "100vw",
        zIndex: 1000, // Ensure the header is above other content
        display: "flex",
        alignItems: "center",
        justifyContent: "",
        gap: "16px",
        backgroundColor: "#F5F5F5",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        padding: "10px 20px", // Add padding to move buttons inward
      }}
    >
      {/* Back Button */}
      <img src={backIcon} style={{ width: "46px", height: "46px" }} alt="" />

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          display: "flex", // Flexbox container for alignment
          alignItems: "center", // Align items vertically
          justifyContent: "center", // Center-align horizontally
        }}
      >
        <img
          src={avatarIcon}
          style={{
            height: "50px",
            width: "50px",
            borderRadius: "40px",
            marginRight: "10px", // Space between image and text
          }}
          alt="avatar"
        />
        Albert Einstein
      </Typography>

      {/* Quiz Button */}
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#c4c4c4",
          color: "#000",
          textTransform: "none",
          borderRadius: "16px",
          marginRight: "4%",
          display: "none",
          "&:hover": {
            backgroundColor: "#b0b0b0",
          },
        }}
      >
        Quiz
      </Button>
    </Box>
  );
};

export default Header;
