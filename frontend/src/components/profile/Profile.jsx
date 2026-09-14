import { useEffect, useRef, useState } from "react";
import EditProfile from "../editProfile/EditProfile";
import "./Profile.css";

function Profile() {
  const [profileImage, setProfileImage] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setShowPhotoOptions(false);
    }

    event.target.value = "";
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setShowCamera(false);
  };

  const openCamera = async () => {
    setShowPhotoOptions(false);
    setCameraError("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        setShowCamera(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
        audio: false
      });

      streamRef.current = stream;
      setShowCamera(true);
    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "No camera was found on this device."
        );
      } else {
        setCameraError(
          "Unable to access the camera. Please check your camera permissions."
        );
      }

      setShowCamera(true);
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setProfileImage(imageUrl);
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  if (showEditProfile) {
    return (
      <EditProfile
        profileImage={profileImage}
        onImageChange={handleImageChange}
        onBack={() => setShowEditProfile(false)}
      />
    );
  }

  return (
    <div className="profile-page">

      {/* PROFILE HEADER */}
      <div className="profile-header">

        <h1 className="profile-page-title">
          PLAYER PROFILE
        </h1>

        {/* PROFILE PICTURE */}
        <div className="profile-photo-wrapper">

          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="profile-photo"
            />
          ) : (
            <div className="profile-photo-placeholder">
              GT
            </div>
          )}

          {/* SMALL EDIT PENCIL */}
          <button
            type="button"
            className="profile-photo-edit"
            title="Edit profile picture"
            onClick={() =>
              setShowPhotoOptions(!showPhotoOptions)
            }
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L14.06 6.19 3 17.25z" />
              <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 3.75-1.83z" />
            </svg>
          </button>

          {/* PHOTO OPTIONS */}
          {showPhotoOptions && (
            <div className="photo-options">

              {/* GALLERY */}
              <label
                htmlFor="profile-gallery-image"
                className="photo-option"
              >
                Gallery
              </label>

              <input
                id="profile-gallery-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              {/* CAMERA */}
              <button
                type="button"
                className="photo-option photo-camera-option"
                onClick={openCamera}
              >
                Camera
              </button>

            </div>
          )}

        </div>

        {/* PLAYER INFORMATION */}
        <div className="profile-details">

          <h2>Ghislain Tabot</h2>

          <p className="profile-username">
            @ghislain123
          </p>

          <p className="profile-status">
            ON Point Player
          </p>

          <button
            className="edit-profile-btn"
            onClick={() => setShowEditProfile(true)}
          >
            Edit Profile
          </button>

        </div>

      </div>

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="camera-overlay">

          <div className="camera-modal">

            <div className="camera-header">
              <h2>Take Profile Picture</h2>

              <button
                type="button"
                className="camera-close"
                onClick={stopCamera}
              >
                ×
              </button>
            </div>

            {cameraError ? (
              <div className="camera-error">
                <p>{cameraError}</p>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="camera-cancel-btn"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="camera-preview">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                  />
                </div>

                <div className="camera-actions">

                  <button
                    type="button"
                    className="camera-cancel-btn"
                    onClick={stopCamera}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="take-photo-btn"
                    onClick={takePhoto}
                  >
                    Take Photo
                  </button>

                </div>
              </>
            )}

          </div>

        </div>
      )}

      {/* PERSONAL INFORMATION */}
      <section className="profile-section">

        <div className="section-heading">
          <span className="section-label">ACCOUNT</span>
          <h2>Personal Information</h2>
        </div>

        <div className="information-card">

          <div className="information-item">
            <span>Full Name</span>
            <strong>Ghislain Tabot</strong>
          </div>

          <div className="information-item">
            <span>Username</span>
            <strong>@ghislain123</strong>
          </div>

          <div className="information-item">
            <span>Phone Number</span>
            <strong>+237 6XX XXX XXX</strong>
          </div>

          <div className="information-item">
            <span>Account Type</span>
            <strong>Player</strong>
          </div>

        </div>

      </section>

      {/* GUESS IT STATISTICS */}
      <section className="profile-section">

        <div className="section-heading">
          <span className="section-label">PERFORMANCE</span>
          <h2>Guess it Statistics</h2>
        </div>

        <div className="statistics-grid">

          <div className="stat-card">
            <span>Games Played</span>
            <strong>48</strong>
          </div>

          <div className="stat-card">
            <span>Games Won</span>
            <strong>31</strong>
          </div>

          <div className="stat-card">
            <span>Points</span>
            <strong>2,450</strong>
          </div>

          <div className="stat-card">
            <span>Win Rate</span>
            <strong>65%</strong>
          </div>

        </div>

        <div className="performance-card">

          <div className="performance-item">
            <span>Accuracy</span>
            <strong>82%</strong>
          </div>

          <div className="performance-item">
            <span>Best Score</span>
            <strong>950</strong>
          </div>

          <div className="performance-item">
            <span>Winning Streak</span>
            <strong>7 Games</strong>
          </div>

        </div>

      </section>

      {/* ACHIEVEMENTS */}
      <section className="profile-section">

        <div className="section-heading">
          <span className="section-label">PROGRESS</span>
          <h2>Achievements</h2>
        </div>

        <div className="achievements-grid">

          <div className="achievement-card">
            <div className="achievement-badge">
              10W
            </div>

            <div>
              <h3>First Victory</h3>
              <p>Won your first 10 games.</p>
            </div>
          </div>

          <div className="achievement-card">
            <div className="achievement-badge">
              1K
            </div>

            <div>
              <h3>Point Master</h3>
              <p>Earned more than 1,000 points.</p>
            </div>
          </div>

          <div className="achievement-card">
            <div className="achievement-badge">
              7S
            </div>

            <div>
              <h3>Hot Streak</h3>
              <p>Won 7 games consecutively.</p>
            </div>
          </div>

          <div className="achievement-card locked">
            <div className="achievement-badge">
              50
            </div>

            <div>
              <h3>Legend</h3>
              <p>Win 50 Guess it games.</p>
            </div>
          </div>

        </div>

      </section>

      {/* RANK */}
      <section className="profile-section">

        <div className="section-heading">
          <span className="section-label">LEADERBOARD</span>
          <h2>Rank & Leaderboard</h2>
        </div>

        <div className="rank-card">

          <div className="rank-position">
            <span>Your Current Rank</span>
            <strong>#24</strong>
          </div>

          <div className="rank-details">

            <div>
              <span>Qualified Games</span>
              <strong>42</strong>
            </div>

            <div>
              <span>Total Points</span>
              <strong>2,450</strong>
            </div>

            <div>
              <span>Next Rank</span>
              <strong>#20</strong>
            </div>

          </div>

          <div className="rank-progress">

            <div className="rank-progress-header">
              <span>Progress to next rank</span>
              <strong>85%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Profile;
