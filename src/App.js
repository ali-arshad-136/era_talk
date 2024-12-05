import React, { useState, useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useSpeechSynthesis } from "react-speech-kit";
import EinsteinAvatar from "./Component/EinsteinAvatar";
import MicrophoneButton from "./Component/MicrophoneButton";
import CameraFeed from "./Component/CameraFeed";
import Header from "./Component/Header"; // Import the Header component
import axios from "axios";
import { StopCircle } from "@mui/icons-material";



const App = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const { speak } = useSpeechSynthesis();
  const [utterance, setUtterance] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const toggleCamera = () => {
    setCameraOn((prev) => !prev);
  };

  const startRecording = async () => {
    if (isSpeaking === false) {
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();

      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        processAudio(audioBlob);
      };
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsListening(false);
  };

  const transcribeAudioWithWhisper = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    try {
      const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return "Sorry, I couldn't transcribe the audio.";
    }
  };
  const processAudio = async (audioBlob) => {
    // Step 1: Transcribe the audio
    const transcription = await transcribeAudioWithWhisper(audioBlob);
    const userMessage = { role: "user", content: transcription };

    // Update conversation history with the new user message
    setConversationHistory((prev) => [...prev, userMessage]);

    // Step 2: Fetch AI response
    const systemPrompt = {
      role: "system",
      content: `You are Einstein having friendly chats with British students (ages 8-16). Respond naturally while following these rules:
        RESPONSE RULES:
        - Maximum 3 sentences per response
        - Always end with ONE engaging question
        - Use simple everyday examples
        - Keep scientific concepts relatable
        - No expressions, gestures, or interjections
        VOICE:
        - Friendly, grandfatherly tone
        - Mix gentle humour with wisdom
        - Show excitement about student's curiosity
        - Simple, clear responses
        MUST:
        - Keep language simple for children
        - Use British English terms
        - Maintain friendly conversation flow
        - Make science relatable to daily life
        AVOID:
        - Complex scientific terms
        - Multiple questions in one response
        - Adult topics or controversial subjects
        - Long explanations`,
    };

    const updatedHistory = [systemPrompt, ...conversationHistory, userMessage];
    const aiMessageContent = await getAIResponse(transcription, updatedHistory);

    // Add AI response to conversation history
    const aiMessage = { role: "assistant", content: aiMessageContent };
    setConversationHistory((prev) => [...prev, aiMessage]);

    // Step 3: Update chat history for display
    setChatHistory((prev) => [...prev, { sender: "User", text: transcription }]);

    // Step 4: Generate speech
    await generateSpeechWithGoogleTTS(aiMessageContent);
  };
  const getAIResponse = async (message, conversationHistory) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o", // Adjust model as needed
          messages: conversationHistory, // Pass system prompt + history
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLoading(false);
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setLoading(false);
      return "Sorry, I couldn't get an answer.";
    }
  };

  useEffect(() => {
    // Reset to the beginning of the speech
  }, []);

  // Function to generate speech using Google Cloud TTS
  const generateSpeechWithGoogleTTS = async (text) => {
    const apiKey = process.env.REACT_APP_GOOGLETTS_API_KEY;

    try {
      const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        input: { text: text },
        voice: {
          languageCode: "en-US",
          name: "en-US-Wavenet-D", // Choose a suitable voice
        },
        audioConfig: { audioEncoding: "MP3" },
      });

      // Get the audio content and create an audio element
      const audioContent = response.data.audioContent;
      const audioUrl = `data:audio/mp3;base64,${audioContent}`;
      const audio = new Audio(audioUrl);

      // Split the text into words
      const words = text.split(" ");
      let wordIndex = 0; // To track the current word being added

      // Add the entire message to the chat history as a placeholder (empty initially)
      setChatHistory((prev) => [
        ...prev,
        { sender: "Albert Einstein", text: "" }, // Placeholder for AI message
      ]);

      // Track the audio progress and update chat history at the appropriate time
      audio.ontimeupdate = () => {
        let newcounter = 0;
        const currentTime = audio.currentTime; // Get current time of the audio
        const totalDuration = audio.duration; // Total duration of the audio
        const wordDuration = totalDuration / words.length; // Time per word

        const currentWordIndex = Math.floor(currentTime / wordDuration); // Get the index for the current word

        if (currentWordIndex > wordIndex) {
          const currentWord = words[currentWordIndex - 1]; // Get the current word to add

          // Only add the word if it is not the same as the last word added
          wordIndex = currentWordIndex;

          // Update chat history
          setChatHistory((prev) => {
            const updatedHistory = [...prev];
            const lastMessage = updatedHistory[updatedHistory.length - 1];

            if (lastMessage && lastMessage.sender === "Albert Einstein") {
              if (currentWordIndex === lastMessage.text.split(" ").length) {
                lastMessage.text += currentWord + " ";
              }
            } else {
            }
            return updatedHistory;
          });
        }
      };
      setUtterance(audio);
      // Play the audio and handle the end of speech
      audio.onended = () => {
        setIsSpeaking(false); // Set speaking to false when the audio ends
      };

      // Start playing the audio
      audio.play();
      setIsSpeaking(true);
    } catch (error) {
      console.error("Error generating speech with Google TTS:", error);
      setIsSpeaking(false);
    }
  };

  const pauseSpeech = () => {
    if (utterance && utterance.pause) {
      utterance.pause(); // Pause the speech

      setIsSpeaking(false); // Update pause state
    }
  };

  // Function to resume speech
  const resumeSpeech = () => {
    if (utterance && utterance.play) {
      utterance.play(); // Resume the speech
      setIsSpeaking(true); // Update pause state
    }
  };
  const stopSpeech = () => {
    if (utterance && utterance.pause) {
      utterance?.pause(); // Pause the speech immediately
      utterance.currentTime = 0; // Reset to the beginning of the speech
      setIsSpeaking(false); // Mark as not speaking
    }
  };
  const handleKeyDown = (event) => {
    if (event.code === "Space") {
      event.preventDefault(); // Prevent default spacebar behavior

      if (isSpeaking) {
        // If speaking, stop the speech and start listening
        stopSpeech();
        startRecording();
      } else if (!isListening) {
        // If not already listening, start listening
        startRecording();
      }
    }
  };

  const handleKeyUp = (event) => {
    if (event.code === "Space" && isListening) {
      event.preventDefault(); // Prevent default spacebar behavior
      stopRecording();
    }
  };

  useEffect(() => {
    // Add event listeners for keydown and keyup
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isListening, isSpeaking]); // Re-add listeners whenever `isListening` changes
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 3,
        paddingTop: 0,
        height: "100vh",
        backgroundColor: "white",
        position: "relative",
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginTop: 3, // Added marginTop to provide spacing from the header
        }}
      >
        <Box sx={{ flex: 1, textAlign: "center" }}>
          {/* Einstein Avatar */}
          <EinsteinAvatar isSpeaking={isSpeaking} isListening={isListening} />

          {/* Microphone Button */}
          <Box sx={{ marginTop: 1 }}>
            <MicrophoneButton
              stopSpeech={stopSpeech}
              isSpeaking={isSpeaking}
              onClick={isListening ? stopRecording : startRecording}
              isListening={isListening}
            />
          </Box>
        </Box>

        {/* Chat History and Controls */}
        <Box
          sx={{
            width: "20%", // Full width for mobile responsiveness
            height: "300px", // Let height adjust based on content
            marginRight: "40px",
            overflowY: "auto",
            backgroundColor: "#F5F5F5",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "10%",
            position: "relative",
          }}
          ref={chatContainerRef}
        >
          {/* Chat History */}
          <Typography variant="h6" sx={{ marginBottom: "16px", textAlign: "center" }}>
            Chat History
          </Typography>

          <Box sx={{ flexGrow: 1 }}>
            {chatHistory.map((msg, idx) => (
              <Box key={idx} sx={{ marginBottom: "16px" }}>
                <Button
                  sx={{
                    backgroundColor: msg.sender === "User" ? "skyblue" : "white",
                    color: "black",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    textAlign: "left",
                    display: "inline-block",
                    width: "auto",
                    wordWrap: "break-word", // Ensures text doesn't overflow
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold", display: "inline" }}>
                    {msg.sender}:
                  </Typography>
                  <Typography variant="body2" sx={{ display: "inline", marginLeft: "4px" }}>
                    {msg.text}
                  </Typography>
                </Button>
                {loading && idx + 1 === chatHistory.length && (
                  <Box sx={{ display: "inline", marginLeft: "10px", verticalAlign: "middle" }}>
                    <CircularProgress size={20} color="primary" />
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Control Buttons (Pause, Resume, Stop) */}
        </Box>
      </Box>

      {/* Camera Feed */}
      {cameraOn && <CameraFeed webcamRef={webcamRef} />}
    </Box>
  );
};

export default App;
