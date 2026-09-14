import { useState } from "react";
import logo from "../../assets/on-point-logo.png";
import "./SignUp.css";

function SignUp({ onSignIn }) {
  const [passwordFocused, setPasswordFocused] = useState(false);
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
            <h1>WELCOME</h1>

            <p>
              Welcome to a place where curiosity meets challenge.
              Test your knowledge, discover new things, and see how far you can go.
            </p>
          </div>
        </div>


        {/* RIGHT SIDE */}
        <div className="auth-form-side">
          <div className="auth-form-container">

            <div className="form-heading">
              <h2>Create Account</h2>
              <p>Join OnPoint and put your knowledge to the test</p>
            </div>


            <form className="auth-form">

              {/* FULL NAME */}
              <div className="form-field">
                <label>Full Name</label>

                <input
                  type="text"
                  className="standard-input"
                  placeholder="Full Name"
                />
              </div>


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
                    onFocus={() => setPasswordFocused(true)}
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


              {/* CONFIRM PASSWORD
                  ONLY APPEARS AFTER PASSWORD IS FOCUSED */}
              {passwordFocused && (
                <div className="form-field confirm-password-field">
                  <label>Confirm Password</label>

                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>
              )}


              {/* SIGN UP */}
              <button
                type="submit"
                className="main-auth-btn"
              >
                SIGN UP
              </button>

            </form>


            {/* SWITCH TO SIGN IN */}
            <div className="auth-switch">
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={onSignIn}
              >
                Sign In
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default SignUp;