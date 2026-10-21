import {
  useEffect,
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
} from "lucide-react";

import "../styles/lecturerProfile.css";

import API_BASE_URL from "../config/api";


function LecturerProfile() {

  const navigate =
    useNavigate();


  const [lecturer, setLecturer] =
    useState({
      name: "",
      email: "",
      role: "LECTURER",
    });


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


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
            loadError.response?.status === 401 ||
            loadError.response?.status === 403
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
     INITIALS
  ======================================== */

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


            <div className="lp-avatar">

              {getInitials(
                lecturer.name
              )}

            </div>


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