import { useState } from "react";
import SpeechToText from "./components/SpeechToText";
import { fetchGeminiResponse } from "./components/GeminiPrompt";

function App() {
  const [response, setResponse] = useState("");

  const handleSpeechToText = async (text) => {
    console.log("User said:", text);
    const aiResponse = await fetchGeminiResponse(text);
    setResponse(aiResponse);
  };

  return (
    <div>
      <SpeechToText onTextGenerated={handleSpeechToText} />
      <h2>Translation:</h2>
      <p>{response}</p>
    </div>
  );
}

export default App;
