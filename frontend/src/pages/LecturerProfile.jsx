import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  User,
  Mail,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Camera,
  LoaderCircle,
} from "lucide-react";

import "../styles/lecturerProfile.css";

import API_BASE_URL from "../config/api";


/* =========================================
   INITIALS
========================================= */

const getInitials = (name) => {

  if (!name) {
    return "LE";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

};


/* =========================================
   PROFILE IMAGE URL
========================================= */

const getProfileImageUrl = (
  profileImage
) => {

  if (!profileImage) {
    return "";
  }


  if (
    profileImage.startsWith(
      "http://"
    ) ||
    profileImage.startsWith(
      "https://"
    ) ||
    profileImage.startsWith(
      "data:"
    ) ||
    profileImage.startsWith(
      "blob:"
    )
  ) {

    return profileImage;

  }


  const cleanPath =
    profileImage
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");


  return `${API_BASE_URL}/${cleanPath}`;

};


function LecturerProfile() {

  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  const [
    lecturer,
    setLecturer,
  ] = useState({

    name: "",
    email: "",
    role: "LECTURER",
    profile_image: "",

  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);


  const [
    photoMessage,
    setPhotoMessage,
  ] = useState("");


  const [
    photoError,
    setPhotoError,
  ] = useState("");


  /* ========================================
     LOAD PROFILE
  ======================================== */

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );


          if (!token) {

            navigate("/login");

            return;

          }


          const response =
            await axios.get(
              `${API_BASE_URL}/me`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          setLecturer(
            response.data
          );


        } catch (loadError) {

          console.error(
            "Failed to load lecturer profile:",
            loadError
          );


          if (
            loadError.response?.status ===
              401 ||
            loadError.response?.status ===
              403
          ) {

            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "role"
            );

            navigate("/login");

            return;

          }


          setError(
            "Failed to load lecturer profile."
          );


        } finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, [navigate]);


  /* ========================================
     UPLOAD PROFILE IMAGE
  ======================================== */

  const handleProfileImageChange =
    async (event) => {

      const file =
        event.target.files?.[0];


      /*
        Allow selecting the same image again
        after this upload.
      */

      event.target.value = "";


      if (!file) {
        return;
      }


      setPhotoMessage("");

      setPhotoError("");


      /* =====================================
         FILE TYPE VALIDATION
      ===================================== */

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        setPhotoError(
          "Please select a JPG, PNG or WEBP image."
        );

        return;

      }


      /* =====================================
         FILE SIZE VALIDATION
         Maximum 5 MB
      ===================================== */

      const maximumFileSize =
        5 * 1024 * 1024;


      if (
        file.size >
        maximumFileSize
      ) {

        setPhotoError(
          "Profile image must be smaller than 5 MB."
        );

        return;

      }


      try {

        setUploadingPhoto(true);


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        const formData =
          new FormData();


        formData.append(
          "profileImage",
          file
        );


        /* =====================================
           UPLOAD IMAGE
        ===================================== */

        await axios.put(
          `${API_BASE_URL}/me/profile-image`,
          formData,
          {
            headers: {

              Authorization:
                `Bearer ${token}`,

            },
          }
        );


        /* =====================================
           RELOAD PROFILE FROM DATABASE
        ===================================== */

        const profileResponse =
          await axios.get(
            `${API_BASE_URL}/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const updatedLecturer =
          profileResponse.data;


        setLecturer(
          updatedLecturer
        );


        /*
          Immediately tell the Lecturer
          Topbar and Sidebar about the
          new profile image.
        */

        window.dispatchEvent(
          new CustomEvent(
            "lecturer-profile-image-updated",
            {
              detail: {
                profile_image:
                  updatedLecturer
                    ?.profile_image ||
                  "",
              },
            }
          )
        );


        setPhotoMessage(
          "Profile picture updated successfully."
        );


      } catch (uploadError) {

        console.error(
          "Failed to upload lecturer profile image:",
          uploadError
        );


        if (
          uploadError.response?.status ===
            401 ||
          uploadError.response?.status ===
            403
        ) {

          /*
            Do not automatically log out for
            a 403 caused by a backend role
            restriction on this upload route.
          */

          if (
            uploadError.response?.status ===
            401
          ) {

            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "role"
            );

            navigate("/login");

            return;

          }

        }


        setPhotoError(
          uploadError.response?.data?.error ||
          "Failed to update profile picture."
        );


      } finally {

        setUploadingPhoto(false);

      }

    };


  /* ========================================
     PROFILE IMAGE
  ======================================== */

  const profileImageUrl =
    getProfileImageUrl(
      lecturer.profile_image
    );


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="lecturer-profile-page">

        <div className="lp-loading">

          <div className="lp-loading-spinner" />

          <span>
            Loading your profile...
          </span>

        </div>

      </div>

    );

  }


  /* ========================================
     ERROR
  ======================================== */

  if (error) {

    return (

      <div className="lecturer-profile-page">

        <div className="lp-loading lp-error">

          {error}

        </div>

      </div>

    );

  }


  return (

    <div className="lecturer-profile-page">


      {/* ====================================
          PAGE INTRO
      ==================================== */}

      <section className="lp-page-header">


        <div>

          <div className="lp-eyebrow">

            <Sparkles size={13} />

            FACULTY PROFILE

          </div>


          <h1>
            My Profile
          </h1>


          <p>
            Your CampusLearn lecturer identity
            and account information.
          </p>

        </div>


        <div className="lp-header-badge">

          <ShieldCheck size={17} />

          Lecturer Account

        </div>


      </section>


      {/* ====================================
          PROFILE WORKSPACE
      ==================================== */}

      <section className="lp-profile-shell">


        {/* ==================================
            LEFT IDENTITY PANEL
        ================================== */}

        <aside className="lp-identity-panel">


          <div className="lp-identity-decoration lp-decoration-one" />

          <div className="lp-identity-decoration lp-decoration-two" />


          <div className="lp-identity-top">


            <div className="lp-identity-label">

              <GraduationCap size={15} />

              CAMPUSLEARN FACULTY

            </div>


            {/* ================================
                PROFILE IMAGE / INITIALS
            ================================ */}

            <div
              className="lp-avatar"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >

              <span>

                {getInitials(
                  lecturer.name
                )}

              </span>


              {profileImageUrl && (

                <img
                  src={profileImageUrl}
                  alt={`${lecturer.name || "Lecturer"} profile`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(event) => {

                    event.currentTarget.style.display =
                      "none";

                  }}
                />

              )}

            </div>


            {/* HIDDEN FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleProfileImageChange
              }
              style={{
                display: "none",
              }}
            />


            {/* CHANGE PHOTO BUTTON */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploadingPhoto}
              style={{
                marginTop: "14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minHeight: "38px",
                padding: "9px 16px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.25)",
                background:
                  "rgba(255,255,255,0.14)",
                color: "inherit",
                font: "inherit",
                fontWeight: 700,
                cursor:
                  uploadingPhoto
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  uploadingPhoto
                    ? 0.7
                    : 1,
              }}
            >

              {uploadingPhoto ? (

                <LoaderCircle
                  size={15}
                />

              ) : (

                <Camera
                  size={15}
                />

              )}


              {uploadingPhoto
                ? "Uploading..."
                : profileImageUrl
                  ? "Change Photo"
                  : "Add Photo"}

            </button>


            {photoMessage && (

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >

                {photoMessage}

              </div>

            )}


            {photoError && (

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >

                {photoError}

              </div>

            )}


            <h2>

              {lecturer.name ||
                "Lecturer"}

            </h2>


            <p>
              Lecturer
            </p>


            <div className="lp-role-chip">

              <ShieldCheck size={13} />

              Academic Staff

            </div>


          </div>


          <div className="lp-identity-bottom">


            <div>

              <span>
                PORTAL
              </span>

              <strong>
                Lecturer
              </strong>

            </div>


            <div className="lp-identity-divider" />


            <div>

              <span>
                ACCESS
              </span>

              <strong>
                Teaching Workspace
              </strong>

            </div>


          </div>


        </aside>


        {/* ==================================
            ACCOUNT DETAILS
        ================================== */}

        <div className="lp-information-panel">


          <div className="lp-information-header">


            <div>

              <span>
                ACCOUNT OVERVIEW
              </span>

              <h3>
                Lecturer Information
              </h3>

              <p>
                Your account details used
                across the CampusLearn
                Lecturer Portal.
              </p>

            </div>


            <div className="lp-information-icon">

              <User size={20} />

            </div>


          </div>


          <div className="lp-details">


            <ProfileDetail
              icon={
                <User size={19} />
              }
              label="Full Name"
              value={
                lecturer.name || "—"
              }
              className="lp-detail-blue"
            />


            <ProfileDetail
              icon={
                <Mail size={19} />
              }
              label="Email Address"
              value={
                lecturer.email || "—"
              }
              className="lp-detail-purple"
            />


            <ProfileDetail
              icon={
                <ShieldCheck
                  size={19}
                />
              }
              label="Account Role"
              value="Lecturer"
              className="lp-detail-green"
            />


            <ProfileDetail
              icon={
                <GraduationCap
                  size={19}
                />
              }
              label="Workspace"
              value="Lecturer Portal"
              className="lp-detail-orange"
            />


          </div>


          {/* ==================================
              FOOTER NOTE
          ================================== */}

          <div className="lp-profile-note">


            <div className="lp-profile-note-icon">

              <ShieldCheck size={17} />

            </div>


            <div>

              <strong>
                Account information
              </strong>

              <p>
                Your profile information is
                connected to your CampusLearn
                lecturer account.
              </p>

            </div>


          </div>


        </div>


      </section>


    </div>

  );

}


/* ========================================
   DETAIL ITEM
======================================== */

function ProfileDetail({
  icon,
  label,
  value,
  className,
}) {

  return (

    <div
      className={
        `lp-detail-card ${className}`
      }
    >


      <div className="lp-detail-icon">

        {icon}

      </div>


      <div className="lp-detail-content">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>


    </div>

  );

}


export default LecturerProfile;