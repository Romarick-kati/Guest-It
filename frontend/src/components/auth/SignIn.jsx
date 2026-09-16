import { useState } from "react";
import logo from "../../assets/on-point-logo.png";
import { signIn } from "../../lib/auth";
import { icons } from "../ui/icons";
import "./SignIn.css";

const ChevronLeftIcon = icons.chevronLeft;

function SignIn({ onBack, onSignUp, onAuthenticated }) {
  const [method, setMethod] = useState("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+237");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signIn(method === "email" ? { email, password } : { countryCode, phoneNumber, password });
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
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <img
            src={logo}
            alt="ON Point"
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
              <p>Welcome back to ON Point</p>
            </div>


            <form className="auth-form" onSubmit={handleSubmit}>

              {/* SIGN-IN METHOD */}
              <div className="signin-method-toggle">
                <button
                  type="button"
                  className={method === "phone" ? "active" : ""}
                  onClick={() => setMethod("phone")}
                >
                  Phone
                </button>
                <button
                  type="button"
                  className={method === "email" ? "active" : ""}
                  onClick={() => setMethod("email")}
                >
                  Email
                </button>
              </div>

              {method === "phone" ? (
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
              ) : (
                <div className="form-field">
                  <label>Email</label>

                  <input
                    type="email"
                    className="standard-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              )}


              {/* PASSWORD */}
              <div className="form-field">
                <label>Password</label>

                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
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


              {error && <p className="auth-error">{error}</p>}

              {/* SIGN IN */}
              <button
                type="submit"
                className="main-auth-btn"
                disabled={submitting}
              >
                {submitting ? "SIGNING IN..." : "SIGN IN"}
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
