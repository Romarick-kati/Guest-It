import { useEffect, useState } from "react";
import logo from "../../assets/on-point-logo.png";
import { checkUsername, signUp } from "../../lib/auth";
import "./SignUp.css";

function SignUp({ onBack, onSignIn, onAuthenticated }) {
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+237");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cleanUsername = username.trim().replace(/^@+/, "").toLowerCase();

  useEffect(() => {
    if (!cleanUsername) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return undefined;
    }

    if (cleanUsername.length < 3 || !/^[a-z0-9_]+$/.test(cleanUsername)) {
      setUsernameStatus("invalid");
      setUsernameMessage("Use 3+ letters, numbers, or underscores.");
      return undefined;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking username...");
    const timer = window.setTimeout(async () => {
      try {
        const result = await checkUsername(cleanUsername);
        setUsernameStatus(result.available ? "available" : "taken");
        setUsernameMessage(result.available ? "Username is available." : "That username is already taken.");
      } catch (err) {
        setUsernameStatus("invalid");
        setUsernameMessage(err.message);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [cleanUsername]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (usernameStatus !== "available") {
      setError("Choose an available username before continuing.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await signUp({ username: cleanUsername, countryCode, phoneNumber, password });
      onAuthenticated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LEFT SIDE */}
        <div className="auth-visual">
          <button type="button" className="auth-back-btn" onClick={onBack} aria-label="Go back">
            <span aria-hidden="true">&lt;</span>
          </button>

          <img
            src={logo}
            alt="ON Point"
            className="auth-logo"
          />

          <div className="visual-content">
            <h1>WELCOME</h1>

            <p>
              Guess smart. Win the moment.
            </p>
          </div>
        </div>


        {/* RIGHT SIDE */}
        <div className="auth-form-side">
          <div className="auth-form-container">

            <div className="form-heading">
              <h2>Create Account</h2>
              <p>Join ON Point and put your knowledge to the test</p>
            </div>


            <form className="auth-form" onSubmit={handleSubmit}>

              {/* USERNAME */}
              <div className="form-field">
                <label>Username</label>

                <input
                  type="text"
                  className="standard-input"
                  placeholder="Username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  autoComplete="username"
                  required
                />
                {usernameMessage && (
                  <p className={`username-status username-status-${usernameStatus}`}>
                    {usernameMessage}
                  </p>
                )}
              </div>


              {/* PHONE NUMBER */}
              <div className="form-field">
                <label>Phone Number</label>

                <div className="phone-input">
                  <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
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
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    required
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
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
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
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>
              )}


              {error && <p className="auth-error">{error}</p>}

              {/* SIGN UP */}
              <button
                type="submit"
                className="main-auth-btn"
                disabled={submitting || usernameStatus !== "available"}
              >
                {submitting ? "CREATING..." : "SIGN UP"}
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
