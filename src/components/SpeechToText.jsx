import { use } from "react";
import { useState } from "react";

const SpeechToText = ({ onTextGenerated }) => {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";

  const startListening = () => {
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };
  };

  const listenName = () => {
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setName(transcript);
    };
  };

  const confirm=()=>{
    onTextGenerated(text);
  }

  return (
    <div>
      <label>Name: </label>
      <input type="text" id="nameInput" placeholder="Type Name"  value={name} onChange={(e) => setName(e.target.value)}/>
      <button onClick={listenName}>Speak</button>
      <br></br>
      
      <label>Problem:</label>
      <input type="text" id="problem" placeholder="Type Problem" value={text} onChange={(e) => setText(e.target.value)}/>
      <button onClick={startListening}>Start Speaking</button><br></br>

      <button onClick={confirm}>Confirm</button>
    </div>
    
    
  );
};

export default SpeechToText;

          
