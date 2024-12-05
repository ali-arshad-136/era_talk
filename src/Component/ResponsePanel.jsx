import React from "react";
import { Box, Button } from "@mui/material";

const ResponsePanel = ({ options, onOptionClick }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {options.map((option, idx) => (
        <Button
          sx={{
            backgroundColor: "white", // Background color
            color: "black", // Text color
            padding: "8px 16px", // Padding
            borderRadius: "20px", // Rounded corners
            "&:hover": {
              backgroundColor: "white", // Hover state
            },
          }}
          key={idx}
          onClick={() => onOptionClick(option)} // Trigger option click
        >
          {option}
        </Button>
      ))}
    </Box>
  );
};

export default ResponsePanel;
