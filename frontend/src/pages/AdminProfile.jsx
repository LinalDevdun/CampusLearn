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
  Settings,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Camera,
  LoaderCircle,
} from "lucide-react";

import "../styles/adminProfile.css";

import API_BASE_URL from "../config/api";


/* ========================================
   PROFILE IMAGE URL
======================================== */

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


function AdminProfile() {

  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  const [
    admin,
    setAdmin,
  ] = useState({
    name: "",
    email: "",
    role: "ADMIN",
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
     LOAD ADMIN PROFILE
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


          setAdmin(
            response.data
          );


        } catch (error) {

          console.error(
            "Failed to load admin profile:",
            error
          );


          if (
            error.response?.status === 401 ||
            error.response?.status === 403
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
            "Failed to load administrator profile."
          );


        } finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, [navigate]);


  /* ========================================
     INITIALS
  ======================================== */

  const getInitials =
    (name) => {

      if (!name) {
        return "AD";
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


  /* ========================================
     UPLOAD PROFILE IMAGE
  ======================================== */

  const handleProfileImageChange =
    async (event) => {

      const file =
        event.target.files?.[0];


      event.target.value = "";


      if (!file) {
        return;
      }


      setPhotoMessage("");
      setPhotoError("");


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


        const updatedAdmin =
          profileResponse.data;


        setAdmin(
          updatedAdmin
        );


        window.dispatchEvent(
          new CustomEvent(
            "admin-profile-image-updated",
            {
              detail: {
                profile_image:
                  updatedAdmin
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
          "Failed to upload admin profile image:",
          uploadError
        );


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


        setPhotoError(
          uploadError.response?.data?.error ||
          "Failed to update profile picture."
        );


      } finally {

        setUploadingPhoto(false);

      }

    };


  const profileImageUrl =
    getProfileImageUrl(
      admin.profile_image
    );


  if (loading) {

    return (

      <div className="admin-profile-page">

        <div className="ap-state">
          Loading profile...
        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="admin-profile-page">

        <div className="ap-state">
          {error}
        </div>

      </div>

    );

  }


  return (

    <div className="admin-profile-page">


      {/* HEADER */}

      <section className="ap-header">

        <div className="ap-eyebrow">

          <Sparkles size={12} />

          ADMINISTRATOR IDENTITY

        </div>

        <h1>
          Your Profile
        </h1>

        <p>
          View your CampusLearn administrator
          account and security information.
        </p>

      </section>


      {/* PROFILE HERO */}

      <section className="ap-profile-hero">


        <div className="ap-identity">


          {/* PROFILE IMAGE */}

          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
          >

            <div
              className="ap-avatar"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >

              <span>
                {getInitials(
                  admin.name
                )}
              </span>


              {profileImageUrl && (

                <img
                  src={profileImageUrl}
                  alt={`${admin.name || "Administrator"} profile`}
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


            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploadingPhoto}
              title={
                profileImageUrl
                  ? "Change profile picture"
                  : "Add profile picture"
              }
              aria-label={
                profileImageUrl
                  ? "Change profile picture"
                  : "Add profile picture"
              }
              style={{
                position: "absolute",
                right: "-7px",
                bottom: "-7px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "11px",
                border:
                  "3px solid #ffffff",
                background:
                  "#ffffff",
                color:
                  "#2563eb",
                boxShadow:
                  "0 6px 18px rgba(15, 23, 42, 0.16)",
                cursor:
                  uploadingPhoto
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  uploadingPhoto
                    ? 0.7
                    : 1,
                zIndex: 3,
              }}
            >

              {uploadingPhoto ? (

                <LoaderCircle
                  size={17}
                />

              ) : (

                <Camera
                  size={17}
                />

              )}

            </button>

          </div>


          <div>

            <span className="ap-role-label">
              SYSTEM ADMINISTRATOR
            </span>

            <h2>
              {admin.name}
            </h2>

            <p>
              {admin.email}
            </p>


            <div className="ap-active-badge">

              <CheckCircle2
                size={12}
              />

              Active Administrator

            </div>


            {photoMessage && (

              <p
                style={{
                  marginTop: "10px",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >

                {photoMessage}

              </p>

            )}


            {photoError && (

              <p
                style={{
                  marginTop: "10px",
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >

                {photoError}

              </p>

            )}

          </div>


        </div>


        <div className="ap-security-box">

          <div className="ap-security-icon">

            <ShieldCheck
              size={22}
            />

          </div>

          <span>
            ACCOUNT ACCESS
          </span>

          <strong>
            Administrator
          </strong>

          <p>
            Full CampusLearn management
            privileges.
          </p>

        </div>


      </section>


      {/* INFORMATION */}

      <section className="ap-content-grid">


        <div className="ap-info-panel">


          <div className="ap-section-heading">

            <span>
              ACCOUNT DETAILS
            </span>

            <h2>
              Profile Information
            </h2>

          </div>


          <div className="ap-details-grid">


            <ProfileItem
              icon={
                <User size={18} />
              }
              label="Full Name"
              value={
                admin.name
              }
            />


            <ProfileItem
              icon={
                <Mail size={18} />
              }
              label="Email Address"
              value={
                admin.email
              }
            />


            <ProfileItem
              icon={
                <ShieldCheck
                  size={18}
                />
              }
              label="Account Role"
              value="Administrator"
            />


            <ProfileItem
              icon={
                <Settings
                  size={18}
                />
              }
              label="Portal"
              value="Admin Portal"
            />


          </div>


        </div>


        {/* QUICK SECURITY */}

        <aside className="ap-account-panel">


          <div className="ap-account-icon">

            <ShieldCheck
              size={23}
            />

          </div>


          <span>
            ACCOUNT CONTROL
          </span>

          <h2>
            Manage your account
          </h2>

          <p>
            Review system preferences or
            update your administrator
            password.
          </p>


          <button
            type="button"
            className="ap-settings-button"
            onClick={() =>
              navigate(
                "/admin/settings"
              )
            }
          >

            <Settings
              size={15}
            />

            System Settings

          </button>


          <button
            type="button"
            className="ap-password-button"
            onClick={() => {

              navigate(
                "/admin/settings"
              );


              setTimeout(() => {

                document
                  .querySelector(
                    ".aset-password-vault"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                    block:
                      "start",
                  });

              }, 250);

            }}
          >

            <KeyRound
              size={15}
            />

            Change Password

          </button>


        </aside>


      </section>


    </div>

  );

}


/* ========================================
   PROFILE ITEM
======================================== */

function ProfileItem({
  icon,
  label,
  value,
}) {

  return (

    <div className="ap-detail-card">


      <div className="ap-detail-icon">

        {icon}

      </div>


      <div>

        <span>
          {label}
        </span>

        <strong>
          {value || "Not available"}
        </strong>

      </div>


    </div>

  );

}


export default AdminProfile;