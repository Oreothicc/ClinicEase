import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
  const [userDetails, setUserDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
        setUserDetails(null);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/");
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  function goToSpeechToText() {
    navigate("/speechtotext");
  }

  return (
    <div className="dashboard-container">
      {userDetails ? (
        <>
          {/* Quote & Date */}
          <h2>
            <i>
              "Good health is not something you can buy. However, it can be an
              incredibly valuable savings account."
            </i>
          </h2>
          <h3>{new Date().toLocaleDateString()}</h3>

          {/* Top Right Logout + User Icon */}
          <div className="topright">

            <div
              className="user-icon-container"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <img
                src="src/assets/account.png"
                alt="User"
                className="user-icon"
              />
              {showDropdown && (
                <div className="dropdown-menu" ref={dropdownRef}>
                  <p><strong>First name: </strong> {userDetails.firstName}</p>
                  <p><strong>Last Name:</strong> {userDetails.lastName}</p>
                  <p><strong> Email: </strong>{userDetails.email}</p>
                  <button onClick={handleLogout}> Logout </button>
                </div>
              )}
            </div>
          </div>

          {/* Welcome Message & Dashboard Image */}
          <div className="center-content">
            <h1>
              <i>Welcome {userDetails.firstName} 💗</i>
            </h1>
            <img src="src/assets/dashboardimg.jpg" className="dashboard-image" alt="Dashboard" />
          </div>

          {/* Buttons */}
          <button
            className="btn btn-secondary"
            onClick={goToSpeechToText}
            style={{ marginTop: "20px" }}
          >
            Go to Speech-to-Text
          </button>

          <button
            className="btn btn-secondary"
            onClick={goToSpeechToText}
            style={{ margin: "20px"  }}
          >
            Upload Prescription
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;
