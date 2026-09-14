import { useState } from "react";
import logo from "../../assets/on-point-logo.png";
import "./SignIn.css";

function SignIn({ onSignUp }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LEFT SIDE */}
        <div className="auth-visual">
          <img
            src={logo}
            alt="OnPoint"
            className="auth-logo"
          />

          <div className="visual-content">
            <h1>WELCOME BACK</h1>

            <p>
              Good to have you back. Pick up where you left off,
              challenge your knowledge, and see what you can discover.
            </p>
          </div>
        </div>


        {/* RIGHT SIDE */}
        <div className="auth-form-side">
          <div className="auth-form-container">

            <div className="form-heading">
              <h2>Sign In</h2>
              <p>Welcome back to OnPoint</p>
            </div>


            <form className="auth-form">

              {/* PHONE NUMBER */}
              <div className="form-field">
                <label>Phone Number</label>

                <div className="phone-input">
                  <select defaultValue="+237">
                    <option value="+237">CM +237</option>
                    <option value="+33">FR +33</option>
                    <option value="+1">US +1</option>
                    <option value="+44">UK +44</option>
                    <option value="+234">NG +234</option>
                    <option value="+225">CI +225</option>
                    <option value="+221">SN +221</option>
                    <option value="+49">DE +49</option>
                  </select>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                  />
                </div>
              </div>


              {/* PASSWORD */}
              <div className="form-field">
                <label>Password</label>

                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>


              {/* SIGN IN */}
              <button
                type="submit"
                className="main-auth-btn"
              >
                SIGN IN
              </button>

            </form>


            {/* SWITCH TO SIGN UP */}
            <div className="auth-switch">
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={onSignUp}
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default SignIn;