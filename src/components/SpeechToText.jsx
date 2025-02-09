import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophoneAlt, faStop } from "@fortawesome/free-solid-svg-icons";
import { fetchGeminiResponse } from "./GeminiPrompt"; 
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Adjust based on your folder structure
import { collection, addDoc, Timestamp } from "firebase/firestore";

import { getAuth } from "firebase/auth";

const SpeechToText = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [problem, setProblem] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [response, setResponse] = useState(""); 
  const [showAnalysis, setShowAnalysis] = useState(false); 

  const auth = getAuth()

  const [details, setDetails] = useState({
    name: "",
    gender: "",
    age: "",
    medicalhistory: "",
    problem: "",
  });

  const startListening = (field, setField) => {
    setIsListening(true);
    setActiveField(field);

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setField(speechText);
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    setActiveField(null);
  };

  
  

  const confirmDetails = async () => {
    const user = auth.currentUser; // Get the logged-in user
    if (!user) {
      alert("No user is logged in!");
      console.error("User not authenticated.");
      return;
    }

    const userId = user.uid; // Get unique user ID
    const details = { name, gender, age, medicalHistory, problem, createdAt: Timestamp.now() };

    try {
      await addDoc(collection(db, "users", userId, "patients"), details); // Store under specific user
      console.log("Patient details stored successfully for user:", userId);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error storing patient details:", error);
      alert("Failed to save data.");
    }

    const promptText = `Name: ${details.name}, Gender: ${details.gender}, Age: ${details.age}, Medical History: ${details.medicalHistory}, Problem: ${details.problem}`;
    const aiResponse = await fetchGeminiResponse(promptText);
    
    setResponse(aiResponse);
    setShowAnalysis(true);
  };

  return (
    <div className="form-container">
      <div className="left-section">
            <h2>Patient Details</h2>
            {[
              { label: "Name", value: name, setValue: setName, field: "name" },
              { label: "Gender", value: gender, setValue: setGender, field: "gender" },
              { label: "Age", value: age, setValue: setAge, field: "age" },
              { label: "Medical History", value: medicalHistory, setValue: setMedicalHistory, field: "medicalHistory" },
              { label: "Problem", value: problem, setValue: setProblem, field: "problem" },
            ].map(({ label, value, setValue, field }) => (
              <div className="speech-input-container" key={field}>
                <label>{label}:</label>
                <input type="text" placeholder={`Enter ${label}`} value={value} onChange={(e) => setValue(e.target.value)} />
                <button onClick={() => startListening(field, setValue)} disabled={isListening && activeField !== field}>
                  {isListening && activeField === field ? <FontAwesomeIcon icon={faStop} onClick={stopListening} /> : <FontAwesomeIcon icon={faMicrophoneAlt} />}
                </button>
              </div>
            ))}

            <button className="confirm-btn" onClick={confirmDetails}>Confirm</button>
            <button onClick={() => window.location.reload()}>Back</button>

      </div>

      {/* Analysis Section */}
      {showAnalysis && (
        <div className="analysis-container">
          <h2>Patient Details:</h2>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Gender:</strong> {gender}</p>
          <p><strong>Age:</strong> {age}</p>
          <p><strong>Medical History:</strong> {medicalHistory}</p>
          <p><strong>Problem:</strong> {problem}</p>

          <h2>Analysis:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
