  import React, { useEffect, useState } from "react";
  import { auth, db } from "./firebase";
  import { doc, getDoc } from "firebase/firestore";
  import { useNavigate } from "react-router-dom";

  function Dashboard() {
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate(); // Add this before calling navigate()

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserDetails(docSnap.data());
            } else {
              console.log("No user data found");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          setUserDetails(null); // Reset state if user logs out
          navigate("/"); // Redirect to login page
        }
      });

      return () => unsubscribe(); // Cleanup on unmount
    }, [navigate]); // Ensure useEffect runs when navigate changes

    async function handleLogout() {
      try {
        await auth.signOut();
        navigate("/"); // Navigate to login page
        console.log("User logged out successfully!");
      } catch (error) {
        console.error("Error logging out:", error.message);
      }
    }
    
    // Function to navigate to SpeechToText component
    function goToSpeechToText() {
      navigate("/speechtotext"); // Adjust route based on your setup
    }

    return (
      <div>
        {userDetails ? (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={userDetails.photo}
                width={"40%"}
                style={{ borderRadius: "50%" }}
              />
            </div>
            <h3>Welcome {userDetails.firstName} 💗💗</h3>
            <div>
              <p>Email: {userDetails.email}</p>
              <p>First Name: {userDetails.firstName}</p>
              <p>Last Name: {userDetails.lastName}</p>
            </div>

            <button className="btn btn-secondary" onClick={goToSpeechToText} style={{ marginRight: "10px" }}>
              Go to Speech-to-Text
            </button>

            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
  export default Dashboard;