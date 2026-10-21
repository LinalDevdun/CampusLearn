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
  GraduationCap,
  CalendarDays,
  Hash,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Camera,
  UploadCloud,
  X,
} from "lucide-react";

import API_BASE_URL from "../config/api";


function StudentProfile() {

  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  /* ========================================
     STUDENT DATA
  ======================================== */

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================
     PROFILE IMAGE
  ======================================== */

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState(null);

  const [
    previewImage,
    setPreviewImage,
  ] =
    useState("");

  const [
    uploadingImage,
    setUploadingImage,
  ] =
    useState(false);

  const [
    imageError,
    setImageError,
  ] =
    useState("");


  /* ========================================
     LOAD STUDENT PROFILE
  ======================================== */

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          setLoading(true);

          setError("");


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


          setStudent(
            response.data
          );


        } catch (error) {

          console.error(
            "Failed to load student profile:",
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
            error.response?.data?.error ||
            "Failed to load profile."
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

        return "ST";

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
     PROFILE IMAGE URL
  ======================================== */

  const getProfileImageUrl =
    (profileImage) => {

      if (!profileImage) {

        return "";

      }


      const cleanPath =
        String(profileImage)

          .replace(
            /\\/g,
            "/"
          )

          .replace(
            /^.*?uploads\//,
            "uploads/"
          );


      return (
        `${API_BASE_URL}/${cleanPath}`
      );

    };


  const savedProfileImage =
    getProfileImageUrl(
      student?.profile_image
    );


  const displayedProfileImage =
    previewImage ||
    savedProfileImage;


  /* ========================================
     CHOOSE PROFILE IMAGE
  ======================================== */

  const handleImageChange =
    (event) => {

      setImageError("");


      const file =
        event.target.files?.[0];


      if (!file) {

        return;

      }


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

        setImageError(
          "Please select a JPG, JPEG, PNG or WEBP image."
        );

        event.target.value =
          "";

        return;

      }


      const maxFileSize =
        5 * 1024 * 1024;


      if (
        file.size >
        maxFileSize
      ) {

        setImageError(
          "Profile picture must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;

      }


      setSelectedImage(
        file
      );


      const reader =
        new FileReader();


      reader.onload =
        () => {

          setPreviewImage(
            reader.result
          );

        };


      reader.readAsDataURL(
        file
      );

    };


  /* ========================================
     CANCEL PROFILE IMAGE
  ======================================== */

  const cancelImageSelection =
    () => {

      setSelectedImage(
        null
      );

      setPreviewImage("");

      setImageError("");


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }

    };


  /* ========================================
     UPLOAD PROFILE IMAGE
  ======================================== */

  const handleUploadProfileImage =
    async () => {

      if (!selectedImage) {

        setImageError(
          "Please choose a profile picture first."
        );

        return;

      }


      try {

        setUploadingImage(
          true
        );

        setImageError("");


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
          selectedImage
        );


        const response =
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


        const updatedUser =
          response.data?.user;


        if (updatedUser) {

          setStudent(
            (previousStudent) => ({
              ...previousStudent,
              ...updatedUser,
            })
          );

        }


        setSelectedImage(
          null
        );

        setPreviewImage("");


        if (
          fileInputRef.current
        ) {

          fileInputRef.current.value =
            "";

        }


        /*
          Later StudentTopbar and
          StudentSidebar can listen to
          this event and update immediately.
        */

        window.dispatchEvent(
          new CustomEvent(
            "student-profile-image-updated",
            {
              detail: {
                profileImage:
                  updatedUser
                    ?.profile_image ||
                  "",
              },
            }
          )
        );


        alert(
          response.data?.message ||
          "Profile picture updated successfully!"
        );


      } catch (error) {

        console.error(
          "Profile image upload error:",
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


        setImageError(
          error.response?.data?.error ||
          "Failed to upload profile picture."
        );


      } finally {

        setUploadingImage(
          false
        );

      }

    };


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="student-profile-message">

        <div className="profile-loader" />

        <span>
          Loading your profile...
        </span>

      </div>

    );

  }


  /* ========================================
     ERROR
  ======================================== */

  if (error) {

    return (

      <div className="student-profile-error">

        {error}

      </div>

    );

  }


  return (

    <>

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================
           PAGE
        ===================================== */

        .student-profile-page {
          width: 100%;
          max-width: 1320px;

          margin: 0 auto;

          padding:
            42px 48px 60px;
        }


        /* =====================================
           PAGE HEADER
        ===================================== */

        .student-profile-page-header {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 24px;

          margin-bottom: 28px;
        }


        .student-profile-eyebrow {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 8px;

          color: #6857ee;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: .11em;

          text-transform: uppercase;
        }


        .student-profile-title {
          margin: 0;

          color: #101828;

          font-size: 32px;
          line-height: 1.15;

          font-weight: 800;

          letter-spacing: -.035em;
        }


        .student-profile-subtitle {
          margin: 8px 0 0;

          color: #7b879d;

          font-size: 14px;
          line-height: 1.6;
        }


        .profile-account-status {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 10px 14px;

          border-radius: 999px;

          background: #ecfdf5;

          border:
            1px solid #d1fae5;

          color: #047857;

          font-size: 12px;
          font-weight: 700;

          box-shadow:
            0 6px 18px
            rgba(16, 185, 129, .07);
        }


        .profile-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #10b981;

          box-shadow:
            0 0 0 4px
            rgba(16, 185, 129, .10);
        }


        /* =====================================
           MAIN PROFILE CARD
        ===================================== */

        .student-profile-card {
          overflow: hidden;

          border-radius: 25px;

          border:
            1px solid
            rgba(224, 228, 239, .9);

          background:
            rgba(255, 255, 255, .96);

          box-shadow:
            0 22px 60px
            rgba(44, 50, 100, .08);
        }


        /* =====================================
           HERO / BANNER
        ===================================== */

        .student-profile-hero {
          position: relative;

          min-height: 225px;

          overflow: hidden;

          padding: 40px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 30px;

          background:

            radial-gradient(
              circle at 78% 20%,
              rgba(121, 210, 255, .30),
              transparent 28%
            ),

            radial-gradient(
              circle at 15% 80%,
              rgba(170, 136, 255, .34),
              transparent 30%
            ),

            linear-gradient(
              120deg,
              #513ceb 0%,
              #5c56ee 48%,
              #527cec 100%
            );
        }


        .profile-hero-grid {
          position: absolute;

          inset: 0;

          opacity: .07;

          background-image:

            linear-gradient(
              rgba(255,255,255,.6) 1px,
              transparent 1px
            ),

            linear-gradient(
              90deg,
              rgba(255,255,255,.6) 1px,
              transparent 1px
            );

          background-size:
            55px 55px;
        }


        .profile-orb {
          position: absolute;

          border-radius: 50%;

          background:
            rgba(255,255,255,.08);

          border:
            1px solid
            rgba(255,255,255,.12);

          backdrop-filter:
            blur(8px);
        }


        .profile-orb-one {
          width: 170px;
          height: 170px;

          right: 70px;
          top: -85px;
        }


        .profile-orb-two {
          width: 105px;
          height: 105px;

          right: 220px;
          bottom: -55px;
        }


        .profile-hero-left {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 23px;
        }


        /* =====================================
           PROFILE AVATAR
        ===================================== */

        .profile-avatar-wrap {
          position: relative;

          flex-shrink: 0;
        }


        .profile-avatar {
          width: 92px;
          height: 92px;

          overflow: hidden;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 25px;

          color: white;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.22),
              rgba(255,255,255,.09)
            );

          border:
            1px solid
            rgba(255,255,255,.28);

          box-shadow:

            0 18px 40px
            rgba(31, 28, 110, .23),

            inset 0 1px 0
            rgba(255,255,255,.20);

          backdrop-filter:
            blur(18px);

          font-size: 27px;
          font-weight: 800;
        }


        .profile-avatar-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          border-radius: inherit;
        }


        /* =====================================
           CAMERA BUTTON
        ===================================== */

        .profile-camera-button {
          position: absolute;

          right: -7px;
          bottom: -7px;

          z-index: 5;

          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 0;

          color: #5b50e9;

          background: #ffffff;

          border:
            3px solid #6259eb;

          border-radius: 11px;

          box-shadow:
            0 7px 18px
            rgba(34, 31, 110, .20);

          cursor: pointer;

          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }


        .profile-camera-button:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 10px 22px
            rgba(34, 31, 110, .27);
        }


        .profile-camera-button:disabled {
          opacity: .6;

          cursor: not-allowed;
        }


        .profile-image-input {
          display: none;
        }


        .profile-avatar-badge {
          position: absolute;

          left: -6px;
          bottom: -5px;

          width: 30px;
          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #5b50e9;

          background: white;

          border:
            3px solid #6259eb;

          box-shadow:
            0 7px 18px
            rgba(34, 31, 110, .20);
        }


        .profile-name {
          margin: 0;

          color: white;

          font-size: 28px;

          line-height: 1.2;

          font-weight: 800;

          letter-spacing: -.025em;
        }


        .profile-meta-row {
          display: flex;

          flex-wrap: wrap;

          align-items: center;

          gap: 9px;

          margin-top: 11px;
        }


        .profile-role-pill,
        .profile-number-pill {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding: 7px 11px;

          border-radius: 999px;

          color:
            rgba(255,255,255,.94);

          background:
            rgba(255,255,255,.10);

          border:
            1px solid
            rgba(255,255,255,.16);

          backdrop-filter:
            blur(10px);

          font-size: 12px;
          font-weight: 700;
        }


        .profile-hero-right {
          position: relative;

          z-index: 2;

          min-width: 235px;

          padding: 18px 20px;

          border-radius: 18px;

          background:
            rgba(255,255,255,.10);

          border:
            1px solid
            rgba(255,255,255,.14);

          backdrop-filter:
            blur(14px);
        }


        .hero-mini-label {
          display: block;

          margin-bottom: 5px;

          color:
            rgba(255,255,255,.64);

          font-size: 11px;
          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: .09em;
        }


        .hero-mini-value {
          color: white;

          font-size: 14px;
          font-weight: 700;

          line-height: 1.5;

          word-break: break-word;
        }


        .hero-mini-divider {
          height: 1px;

          margin: 14px 0;

          background:
            rgba(255,255,255,.14);
        }


        /* =====================================
           CONTENT AREA
        ===================================== */

        .profile-content {
          padding: 30px;

          background:

            radial-gradient(
              circle at top right,
              rgba(102, 86, 238, .035),
              transparent 24%
            ),

            white;
        }


        /* =====================================
           PROFILE PICTURE UPLOAD PANEL
        ===================================== */

        .profile-photo-panel {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 27px;

          padding: 18px 20px;

          background:
            linear-gradient(
              135deg,
              #f8f8ff,
              #f4f7ff
            );

          border:
            1px solid #e4e5fb;

          border-radius: 16px;
        }


        .profile-photo-panel-left {
          display: flex;

          align-items: center;

          gap: 13px;
        }


        .profile-photo-panel-icon {
          width: 43px;
          height: 43px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #5d54e9;

          background: #ececff;

          border-radius: 12px;
        }


        .profile-photo-panel-left strong {
          display: block;

          margin-bottom: 3px;

          color: #29314b;

          font-size: 13px;
          font-weight: 800;
        }


        .profile-photo-panel-left span {
          color: #8a94a8;

          font-size: 11px;
          line-height: 1.5;
        }


        .profile-photo-actions {
          display: flex;

          align-items: center;

          gap: 9px;
        }


        .profile-photo-cancel-button,
        .profile-photo-upload-button {
          min-height: 38px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 14px;

          border-radius: 10px;

          font-size: 11px;
          font-weight: 750;

          cursor: pointer;
        }


        .profile-photo-cancel-button {
          color: #667085;

          background: white;

          border:
            1px solid #dfe3ec;
        }


        .profile-photo-upload-button {
          color: white;

          background:
            linear-gradient(
              135deg,
              #5d50e8,
              #6e64f2
            );

          border: none;

          box-shadow:
            0 6px 16px
            rgba(93, 80, 232, .18);
        }


        .profile-photo-upload-button:disabled,
        .profile-photo-cancel-button:disabled {
          opacity: .55;

          cursor: not-allowed;
        }


        .profile-image-error {
          margin:
            -14px 0 22px;

          padding: 11px 13px;

          color: #b42318;

          background: #fff1f0;

          border:
            1px solid #ffd5d2;

          border-radius: 10px;

          font-size: 12px;
          font-weight: 650;
        }


        .profile-section-heading {
          margin-bottom: 18px;
        }


        .profile-section-title {
          display: flex;

          align-items: center;

          gap: 9px;

          margin: 0;

          color: #182230;

          font-size: 17px;
          font-weight: 800;
        }


        .profile-section-title svg {
          color: #6255ea;
        }


        .profile-section-description {
          margin: 5px 0 0;

          color: #98a2b3;

          font-size: 12px;

          line-height: 1.5;
        }


        /* =====================================
           INFORMATION GRID
        ===================================== */

        .profile-information-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 15px;
        }


        .profile-info-card {
          position: relative;

          min-height: 105px;

          overflow: hidden;

          display: flex;

          align-items: center;

          gap: 16px;

          padding: 19px;

          border-radius: 16px;

          border:
            1px solid #eaedf5;

          background:
            linear-gradient(
              145deg,
              #fafbff,
              #ffffff
            );

          transition:
            transform .2s ease,
            border-color .2s ease,
            box-shadow .2s ease;
        }


        .profile-info-card:hover {
          transform:
            translateY(-2px);

          border-color:
            #ddd9ff;

          box-shadow:
            0 12px 25px
            rgba(76, 65, 185, .07);
        }


        .profile-info-card::after {
          content: "";

          position: absolute;

          width: 75px;
          height: 75px;

          right: -35px;
          bottom: -40px;

          border-radius: 50%;

          background:
            rgba(104, 87, 238, .035);
        }


        .profile-info-icon {
          width: 47px;
          height: 47px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 13px;

          color: #5b5ff0;

          background:
            linear-gradient(
              145deg,
              #efefff,
              #f4f7ff
            );

          border:
            1px solid #e8e8ff;
        }


        .profile-info-content {
          min-width: 0;
        }


        .profile-info-label {
          display: block;

          margin-bottom: 5px;

          color: #98a2b3;

          font-size: 11px;
          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: .055em;
        }


        .profile-info-value {
          display: block;

          color: #182230;

          font-size: 14px;
          font-weight: 750;

          line-height: 1.45;

          word-break: break-word;
        }


        /* =====================================
           SECURITY NOTE
        ===================================== */

        .profile-security-note {
          margin-top: 22px;

          padding: 15px 17px;

          display: flex;

          align-items: center;

          gap: 12px;

          border-radius: 14px;

          color: #657084;

          background:
            linear-gradient(
              90deg,
              #f7f7ff,
              #f8fbff
            );

          border:
            1px solid #e9ebf5;

          font-size: 12px;

          line-height: 1.55;
        }


        .profile-security-icon {
          width: 35px;
          height: 35px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #5f56e8;

          background: #ececff;
        }


        /* =====================================
           LOADING / ERROR
        ===================================== */

        .student-profile-message {
          min-height: 350px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 10px;

          color: #7c879e;

          font-size: 14px;
        }


        .profile-loader {
          width: 18px;
          height: 18px;

          border-radius: 50%;

          border:
            2px solid #e5e7ef;

          border-top-color:
            #6555ed;

          animation:
            studentProfileSpin
            .8s linear infinite;
        }


        .student-profile-error {
          margin: 45px;

          padding: 14px 16px;

          border-radius: 12px;

          color: #c33c3c;

          background: #fff2f2;

          border:
            1px solid #fee2e2;

          font-size: 14px;
        }


        @keyframes studentProfileSpin {

          to {
            transform:
              rotate(360deg);
          }

        }


        /* =====================================
           RESPONSIVE
        ===================================== */

        @media (max-width: 950px) {

          .student-profile-page {
            padding:
              32px 30px 50px;
          }


          .student-profile-hero {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .profile-hero-right {
            width: 100%;
          }

        }


        @media (max-width: 700px) {

          .student-profile-page {
            padding:
              26px 20px 45px;
          }


          .student-profile-page-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .student-profile-title {
            font-size: 28px;
          }


          .student-profile-hero {
            padding:
              30px 24px;
          }


          .profile-hero-left {
            align-items:
              flex-start;
          }


          .profile-avatar {
            width: 76px;
            height: 76px;

            border-radius: 20px;

            font-size: 22px;
          }


          .profile-name {
            font-size: 23px;
          }


          .profile-information-grid {
            grid-template-columns:
              1fr;
          }


          .profile-content {
            padding: 22px;
          }


          .profile-photo-panel {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .profile-photo-actions {
            width: 100%;
          }


          .profile-photo-cancel-button,
          .profile-photo-upload-button {
            flex: 1;
          }

        }


        @media (max-width: 480px) {

          .profile-hero-left {
            flex-direction:
              column;
          }


          .profile-meta-row {
            margin-top: 9px;
          }


          .profile-photo-actions {
            flex-direction:
              column;
          }


          .profile-photo-cancel-button,
          .profile-photo-upload-button {
            width: 100%;
          }

        }

      `}</style>


      <div className="student-profile-page">


        {/* ====================================
            PAGE HEADER
        ==================================== */}

        <div className="student-profile-page-header">


          <div>


            <div className="student-profile-eyebrow">

              <Sparkles size={13} />

              Student account

            </div>


            <h1 className="student-profile-title">

              My Profile

            </h1>


            <p className="student-profile-subtitle">

              Your personal and academic
              information in CampusLearn.

            </p>


          </div>


          <div className="profile-account-status">

            <span className="profile-status-dot" />

            Active Student

          </div>


        </div>


        {/* ====================================
            MAIN CARD
        ==================================== */}

        <div className="student-profile-card">


          {/* ==================================
              PROFILE HERO
          ================================== */}

          <div className="student-profile-hero">


            {/* DECORATION */}

            <div className="profile-hero-grid" />


            <div
              className="
                profile-orb
                profile-orb-one
              "
            />


            <div
              className="
                profile-orb
                profile-orb-two
              "
            />


            {/* LEFT */}

            <div className="profile-hero-left">


              <div className="profile-avatar-wrap">


                <div className="profile-avatar">


                  {displayedProfileImage ? (

                    <img
                      src={
                        displayedProfileImage
                      }
                      alt={
                        `${student?.name || "Student"} profile`
                      }
                      className="profile-avatar-image"
                    />

                  ) : (

                    getInitials(
                      student?.name
                    )

                  )}


                </div>


                {/* VERIFIED BADGE */}

                <div className="profile-avatar-badge">

                  <BadgeCheck
                    size={16}
                  />

                </div>


                {/* CAMERA BUTTON */}

                <button
                  type="button"
                  className="profile-camera-button"
                  title="Change profile picture"
                  disabled={
                    uploadingImage
                  }
                  onClick={() =>
                    fileInputRef.current
                      ?.click()
                  }
                >

                  <Camera size={15} />

                </button>


                {/* HIDDEN IMAGE INPUT */}

                <input
                  ref={
                    fileInputRef
                  }
                  className="profile-image-input"
                  type="file"
                  accept="
                    image/jpeg,
                    image/png,
                    image/webp
                  "
                  onChange={
                    handleImageChange
                  }
                />


              </div>


              <div>


                <h2 className="profile-name">

                  {student?.name ||
                    "Student"}

                </h2>


                <div className="profile-meta-row">


                  <span className="profile-role-pill">

                    <GraduationCap
                      size={13}
                    />

                    Student

                  </span>


                  <span className="profile-number-pill">

                    <Hash size={12} />

                    Student No.{" "}

                    {student
                      ?.student_number ??
                      "—"}

                  </span>


                </div>


              </div>


            </div>


            {/* RIGHT */}

            <div className="profile-hero-right">


              <span className="hero-mini-label">

                Degree Programme

              </span>


              <div className="hero-mini-value">

                {student?.degree ||
                  "Not available"}

              </div>


              <div className="hero-mini-divider" />


              <span className="hero-mini-label">

                Academic Batch

              </span>


              <div className="hero-mini-value">

                {student?.batch ||
                  "Not available"}

              </div>


            </div>


          </div>


          {/* ==================================
              PROFILE CONTENT
          ================================== */}

          <div className="profile-content">


            {/* ==================================
                SELECTED PHOTO ACTIONS
            ================================== */}

            {selectedImage && (

              <div className="profile-photo-panel">


                <div className="profile-photo-panel-left">


                  <div className="profile-photo-panel-icon">

                    <Camera size={19} />

                  </div>


                  <div>

                    <strong>
                      New profile picture selected
                    </strong>

                    <span>
                      {selectedImage.name}
                    </span>

                  </div>


                </div>


                <div className="profile-photo-actions">


                  <button
                    type="button"
                    className="profile-photo-cancel-button"
                    onClick={
                      cancelImageSelection
                    }
                    disabled={
                      uploadingImage
                    }
                  >

                    <X size={14} />

                    Cancel

                  </button>


                  <button
                    type="button"
                    className="profile-photo-upload-button"
                    onClick={
                      handleUploadProfileImage
                    }
                    disabled={
                      uploadingImage
                    }
                  >

                    <UploadCloud
                      size={15}
                    />

                    {uploadingImage
                      ? "Uploading..."
                      : "Upload Photo"}

                  </button>


                </div>


              </div>

            )}


            {/* IMAGE ERROR */}

            {imageError && (

              <div className="profile-image-error">

                {imageError}

              </div>

            )}


            {/* ==================================
                ACCOUNT INFORMATION
            ================================== */}

            <div className="profile-section-heading">


              <h3 className="profile-section-title">

                <User size={17} />

                Account Information

              </h3>


              <p className="profile-section-description">

                Your CampusLearn identity
                and academic details.

              </p>


            </div>


            <div className="profile-information-grid">


              {/* FULL NAME */}

              <ProfileItem
                icon={
                  <User size={19} />
                }
                label="Full Name"
                value={
                  student?.name || "—"
                }
              />


              {/* EMAIL */}

              <ProfileItem
                icon={
                  <Mail size={19} />
                }
                label="Campus Email"
                value={
                  student?.email || "—"
                }
              />


              {/* STUDENT NUMBER */}

              <ProfileItem
                icon={
                  <Hash size={19} />
                }
                label="Student Number"
                value={
                  student
                    ?.student_number ??
                  "—"
                }
              />


              {/* DEGREE */}

              <ProfileItem
                icon={
                  <GraduationCap
                    size={19}
                  />
                }
                label="Degree Programme"
                value={
                  student?.degree ||
                  "—"
                }
              />


              {/* BATCH */}

              <ProfileItem
                icon={
                  <CalendarDays
                    size={19}
                  />
                }
                label="Academic Batch"
                value={
                  student?.batch ||
                  "—"
                }
              />


            </div>


            {/* ==================================
                SECURITY
            ================================== */}

            <div className="profile-security-note">


              <div className="profile-security-icon">

                <ShieldCheck
                  size={18}
                />

              </div>


              <div>

                Your account information is
                securely managed by CampusLearn.
                Contact an administrator if any
                academic information shown here
                is incorrect.

              </div>


            </div>


          </div>


        </div>


      </div>


    </>

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

    <div className="profile-info-card">


      <div className="profile-info-icon">

        {icon}

      </div>


      <div className="profile-info-content">


        <span className="profile-info-label">

          {label}

        </span>


        <strong className="profile-info-value">

          {value}

        </strong>


      </div>


    </div>

  );

}


export default StudentProfile;