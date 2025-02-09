import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./LoginPage"; 
import Register from "./register";
import Dashboard from "./dashboard";
import SpeechToText from "./components/SpeechToText";
import { fetchGeminiResponse } from "./components/GeminiPrompt";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "./firebase"; // Adjust the path based on your folder structure
import { doc } from "firebase/firestore";


function App() {
  const [response, setResponse] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch user details from Firestore
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          console.log("No such user document!");
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);


  return (
      <Router>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/speechtotext" element={user ? <SpeechToText /> : <Navigate to="/" />} />
          </Routes>
          <ToastContainer />
      </Router>
  );
}

export default App;

