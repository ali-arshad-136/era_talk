import React from "react";
import ReactWebcam from "react-webcam";

const CameraFeed = ({ webcamRef }) => {
  return (
    <div style={{ position: "absolute", bottom: "30px", right: "20px", width: "390px", height: "200px" }}>
      <ReactWebcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          borderRadius: "34px",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        videoConstraints={{
          facingMode: "user",
        }}
      />
    </div>
  );
};

export default CameraFeed;
