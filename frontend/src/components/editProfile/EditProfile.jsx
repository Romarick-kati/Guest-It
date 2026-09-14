import { useEffect, useRef, useState } from "react";
import "./EditProfile.css";

function EditProfile({
  profileImage,
  onImageChange,
  onBack
}) {
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handlePhotoChange = (event) => {
    onImageChange(event);
    setShowPhotoOptions(false);
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

    const fakeEvent = {
          target: {
            files: [
              new File(
                [blob],
                "profile-camera-photo.jpg",
                {
                  type: "image/jpeg"
                }
              )
            ],
            value: ""
          }
        };

        onImageChange(fakeEvent);

        setShowCamera(false);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });

          streamRef.current = null;
        }
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="edit-profile-page">

      <div className="edit-profile-container">

        {/* PAGE HEADER */}
        <div className="edit-profile-header">

          <button
            className="back-btn"
            onClick={onBack}
          >
            Back to Profile
          </button>

          <span className="edit-page-label">
            ACCOUNT SETTINGS
          </span>

          <h1>Edit Profile</h1>

          <p>
            Update your personal information and profile picture.
          </p>

        </div>

        {/* PROFILE PICTURE */}
        <div className="edit-photo-card">

          <span className="edit-section-label">
            PROFILE PICTURE
          </span>

          <div className="edit-photo-wrapper">

            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="edit-profile-photo"
              />
            ) : (
              <div className="edit-profile-photo edit-photo-placeholder">
                GT
              </div>
            )}

            {/* PENCIL */}
            <button
              type="button"
              className="edit-photo-button"
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
                  htmlFor="edit-gallery-profile-image"
                  className="photo-option"
                >
                  Gallery
                </label>

                <input
                  id="edit-gallery-profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
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

          <p className="photo-help">
            Choose a picture from your gallery or camera.
          </p>

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
        <div className="edit-form-card">

          <span className="edit-section-label">
            PERSONAL INFORMATION
          </span>

          <div className="edit-form-grid">

            <div className="form-group">

              <label>Full Name</label>

              <input
                type="text"
                defaultValue="Ghislain Tabot"
              />

            </div>

            <div className="form-group">

              <label>Username</label>

              <input
                type="text"
                defaultValue="@ghislain123"
              />

            </div>

            <div className="form-group">

              <label>Phone Number</label>

              <input
                type="text"
                defaultValue="+237 6XX XXX XXX"
              />

            </div>

            <div className="form-group">

              <label>Account Type</label>

              <input
                type="text"
                value="Player"
                readOnly
              />

            </div>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="edit-actions">

          <button
            className="cancel-btn"
            onClick={onBack}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={() => {
              alert("Profile updated successfully!");
              onBack();
            }}
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditProfile;