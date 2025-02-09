  // import { signInWithEmailAndPassword } from "firebase/auth";
  // import React, { useState } from "react";
  // import { auth } from "./firebase";
  // import { toast } from "react-toastify";
  // import SignInwithGoogle from "./signInWithGoogle";
  // import { useNavigate } from "react-router-dom";

  // function Login() {
  //   const [email, setEmail] = useState("");
  //   const [password, setPassword] = useState("");
  //   const navigate = useNavigate();

  //   // const handleSubmit = async (e) => {
  //   //   e.preventDefault();
  //   //   try {
  //   //     await signInWithEmailAndPassword(auth, email, password);
  //   //     console.log("User logged in Successfully");
  //   //     // window.location.href = "/dashboard";
  //   //     // toast.success("User logged in Successfully", {
  //   //     //   position: "top-center",
  //   //     // });
  //   //     toast.success("User logged in Successfully", { position: "top-center" });
  //   //     setTimeout(() => {
  //   //       navigate("/dashboard");
  //   //       // window.location.href = "/dashboard";
  //   //     }, 1000); // Adding a delay ensures the toast is displayed
  //   //   } catch (error) {
  //   //     console.log(error.message);

  //   //     toast.error(error.message, {
  //   //       position: "bottom-center",
  //   //     });
  //   //   }
  //   // };
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //       await signInWithEmailAndPassword(auth, email, password);
  //       toast.success("User logged in Successfully", { position: "top-center" });
    
        
  //       setTimeout(() => {
  //         navigate("/dashboard");
  //       }, 1000);

  //     } catch (error) {
  //       toast.error(error.message, { position: "bottom-center" });
  //     }
  //   };
    

  //   return (
  //     <div className="login-page-container">
  //       {/* Left Side - Login Form */}
  //       <div className="login-form">
  //         <h1>Welcome back!</h1>
  //         <h3 className="login-tag-line">ClinicEase, where voice meets care!👩🏻‍⚕️🩺</h3>

  //         <form onSubmit={handleSubmit}>
  //           <div>
  //             <label>Email address</label>
  //             <input
  //               type="email"
  //               className="form-control"
  //               placeholder="Enter email"
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //             />
  //           </div>

  //           <div>
  //             <label>Password</label>
  //             <input
  //               type="password"
  //               className="form-control"
  //               placeholder="Enter password"
  //               value={password}
  //               onChange={(e) => setPassword(e.target.value)}
  //             />
  //           </div>

  //           <div>
  //             <button type="submit" className="btn btn-primary">
  //               Submit
  //             </button>
  //           </div>
  //           <p className="register-here">
  //             New user? <a href="/register">Register Here</a>
  //           </p>
  //           <p>
  //             <SignInwithGoogle />
  //           </p>
  //         </form>
  //       </div>

  //       {/* Right Side - Image */}
  //       <div className="login-image">
  //         <img src="/login_img.jpg" alt="ClinicEase Illustration" />
  //       </div>
  //     </div>
  //   );
  // }

  // export default Login;


  import { signInWithEmailAndPassword } from "firebase/auth";
  import React, { useState, useEffect } from "react";
  import { auth } from "./firebase";
  import { toast, ToastContainer } from "react-toastify";
  import SignInwithGoogle from "./signInWithGoogle";
  import { useNavigate } from "react-router-dom";
  import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
  import OtpInput from "otp-input-react";
  import PhoneInput from "react-phone-input-2";
  import "react-phone-input-2/lib/style.css";
  import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
  import { CgSpinner } from "react-icons/cg";
  
  function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ph, setPh] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!window.recaptchaVerifier) {
        setupRecaptcha();  // Ensure reCAPTCHA is initialized when the component mounts
      }
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("User logged in Successfully", { position: "top-center" });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } catch (error) {
        toast.error(error.message, { position: "bottom-center" });
      }
    };
  
    function setupRecaptcha() {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, 
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => onSignup(), // Executes on successful reCAPTCHA
          }
        );
      } catch (error) {
        console.error("reCAPTCHA Initialization Error:", error);
      }
    }
  
    async function onSignup() {
      if (!window.recaptchaVerifier) {
        setupRecaptcha();  // Ensure reCAPTCHA is initialized
      }
    
      setLoading(true);
      const appVerifier = window.recaptchaVerifier;
      const formatPh = `+${ph.trim()}`; // Use `ph` instead of `phone`
      console.log(formatPh);
    
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, formatPh, appVerifier);
        window.confirmationResult = confirmationResult;
        setShowOTP(true);
        toast.success("OTP sent successfully!");
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Error sending OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
  
    async function onOTPVerify() {
      setLoading(true);
      try {
        const res = await window.confirmationResult.confirm(otp);
        setUser(res.user);
        toast.success("OTP Verified! Login Successful");
        console.log("User after OTP verification:", res.user);
        navigate("/dashboard");

      } catch (error) {
        console.error("OTP Verification Error:", error);
        toast.error("Invalid OTP! Try again.");
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <>
       
     
      <div className="login-page-container">
     
        <ToastContainer />
        <div id="recaptcha-container"></div>
  
        {/* Left Side - Login Form */}
        <div className="login-form">
          <h1>Welcome back!</h1>
          <h3 className="login-tag-line">ClinicEase, where voice meets care!👩🏻‍⚕️🩺</h3>
  
          {!showOTP ? (
            <form onSubmit={handleSubmit}>
              <div>
                <label>Email address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
              <p className="register-here">
                New user? <a href="/register">Register Here</a>
              </p>
              <p>
                <SignInwithGoogle />
              </p>
              
            </form>
          ) : (
            <div className="otp-verification">
              <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                <BsFillShieldLockFill size={30} />
              </div>
              <label className="font-bold text-xl text-center">
                Enter your OTP
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                OTPLength={6}
                otpType="number"
                autoFocus
                className="opt-container"
              />
              <button
                onClick={onOTPVerify}
                className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
              >
                {loading && <CgSpinner size={20} className="mt-1 animate-spin" />}
                <span>Verify OTP</span>
              </button>
            </div>
          )}
  
          {!showOTP && (
            <>
              <button 
        onClick={() => window.location.href = "http://127.0.0.1:5000"} 
        style={{
          marginTop: "20px",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom:"20px"
        }}>
        Login with Facial Recognition
      </button>
              <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                <BsTelephoneFill size={30} />  <label className="font-bold text-xl text-center">
                Verify your phone number
              </label>
              </div>
             
              <PhoneInput country={"in"} value={ph} onChange={setPh} />
              <button
                onClick={onSignup}
                className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
              >
                {loading && <CgSpinner size={20} className="mt-1 animate-spin" />}
                <span>Send code via SMS</span>
              </button>
            </>
          )}
        </div>
  
        {/* Right Side - Image */}
        <div className="login-image">
          <img src="/login_img.jpg" alt="ClinicEase Illustration" />
        </div>
      </div>
      </>
    );
  }
  
  export default Login;
  