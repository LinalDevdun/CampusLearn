import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Circle,
  LogOut,
} from "lucide-react";

import "../styles/lecturerChangePassword.css";

import API_BASE_URL from "../config/api";


function LecturerChangePassword() {

  const navigate =
    useNavigate();


  const [formData, setFormData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });


  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  /* ========================================
     HANDLE INPUT
  ======================================== */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  /* ========================================
     PASSWORD CHECKS
  ======================================== */

  const passwordChecks = {

    length:
      formData.newPassword.length >= 6,

    uppercase:
      /[A-Z]/.test(
        formData.newPassword
      ),

    number:
      /[0-9]/.test(
        formData.newPassword
      ),

    symbol:
      /[^A-Za-z0-9]/.test(
        formData.newPassword
      ),

  };


  const passwordStrength =
    Object.values(
      passwordChecks
    ).filter(Boolean).length;


  const getStrengthLabel = () => {

    if (!formData.newPassword) {
      return "Waiting for password";
    }

    if (passwordStrength <= 1) {
      return "Weak";
    }

    if (passwordStrength === 2) {
      return "Fair";
    }

    if (passwordStrength === 3) {
      return "Good";
    }

    return "Strong";

  };


  const getStrengthClass = () => {

    if (!formData.newPassword) {
      return "lcp-strength-empty";
    }

    if (passwordStrength <= 1) {
      return "lcp-strength-weak";
    }

    if (passwordStrength === 2) {
      return "lcp-strength-fair";
    }

    if (passwordStrength === 3) {
      return "lcp-strength-good";
    }

    return "lcp-strength-strong";

  };


  /* ========================================
     CHANGE PASSWORD
  ======================================== */

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      if (
        !formData.currentPassword ||
        !formData.newPassword ||
        !formData.confirmPassword
      ) {

        alert(
          "Please complete all password fields."
        );

        return;

      }


      if (
        formData.newPassword.length < 6
      ) {

        alert(
          "New password must contain at least 6 characters."
        );

        return;

      }


      if (
        formData.newPassword !==
        formData.confirmPassword
      ) {

        alert(
          "New password and confirmation password do not match."
        );

        return;

      }


      if (
        formData.currentPassword ===
        formData.newPassword
      ) {

        alert(
          "New password must be different from your current password."
        );

        return;

      }


      try {

        setSaving(true);


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        const response =
          await axios.put(
            `${API_BASE_URL}/change-password`,

            {
              currentPassword:
                formData.currentPassword,

              newPassword:
                formData.newPassword,
            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        alert(
          response.data.message ||
          "Password changed successfully!"
        );


        /* ==================================
           LOG OUT AFTER PASSWORD CHANGE
        ================================== */

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "role"
        );


        navigate("/login");


      } catch (error) {

        console.error(
          "Change password error:",
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


        alert(
          error.response?.data?.error ||
          "Failed to change password."
        );


      } finally {

        setSaving(false);

      }

    };


  return (

    <div className="lecturer-change-password-page">


      {/* ====================================
          SECURITY HERO
      ==================================== */}

      <section className="lcp-security-hero">


        <div className="lcp-hero-main">


          <div className="lcp-hero-icon">

            <KeyRound size={25} />

          </div>


          <div>

            <div className="lcp-eyebrow">

              <Sparkles size={12} />

              ACCOUNT SECURITY

            </div>


            <h1>
              Change Password
            </h1>


            <p>
              Refresh your CampusLearn password
              and keep your lecturer workspace
              protected.
            </p>

          </div>


        </div>


        <div className="lcp-security-status">


          <div className="lcp-security-status-icon">

            <ShieldCheck size={20} />

          </div>


          <div>

            <span>
              SECURITY STATUS
            </span>

            <strong>
              Password Protected
            </strong>

          </div>


        </div>


      </section>


      {/* ====================================
          MAIN SECURITY WORKSPACE
      ==================================== */}

      <section className="lcp-workspace">


        {/* ==================================
            PASSWORD FORM
        ================================== */}

        <div className="lcp-form-panel">


          <div className="lcp-panel-header">


            <div className="lcp-panel-header-icon">

              <LockKeyhole size={21} />

            </div>


            <div>

              <span>
                PASSWORD UPDATE
              </span>

              <h2>
                Create a new password
              </h2>

              <p>
                Confirm your current password
                before creating a new one.
              </p>

            </div>


          </div>


          <form
            className="lcp-form"
            onSubmit={
              handleSubmit
            }
          >


            {/* CURRENT PASSWORD */}

            <div className="lcp-field">

              <label>
                Current Password
              </label>


              <div className="lcp-password-input">


                <div className="lcp-input-leading-icon">

                  <LockKeyhole
                    size={17}
                  />

                </div>


                <input
                  type={
                    showCurrent
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={
                    formData.currentPassword
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />


                <button
                  type="button"
                  className="lcp-eye-button"
                  onClick={() =>
                    setShowCurrent(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label="Show or hide current password"
                >

                  {showCurrent ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>


              </div>

            </div>


            {/* NEW PASSWORD */}

            <div className="lcp-field">

              <div className="lcp-label-row">

                <label>
                  New Password
                </label>


                <span
                  className={
                    `lcp-inline-strength ${getStrengthClass()}`
                  }
                >
                  {getStrengthLabel()}
                </span>

              </div>


              <div className="lcp-password-input">


                <div className="lcp-input-leading-icon">

                  <KeyRound size={17} />

                </div>


                <input
                  type={
                    showNew
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    formData.newPassword
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Create your new password"
                  autoComplete="new-password"
                />


                <button
                  type="button"
                  className="lcp-eye-button"
                  onClick={() =>
                    setShowNew(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label="Show or hide new password"
                >

                  {showNew ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>


              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="lcp-field">

              <label>
                Confirm New Password
              </label>


              <div className="lcp-password-input">


                <div className="lcp-input-leading-icon">

                  <ShieldCheck
                    size={17}
                  />

                </div>


                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                />


                <button
                  type="button"
                  className="lcp-eye-button"
                  onClick={() =>
                    setShowConfirm(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label="Show or hide confirmation password"
                >

                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>


              </div>


              {formData.confirmPassword && (

                <div
                  className={
                    formData.newPassword ===
                    formData.confirmPassword
                      ? "lcp-match-message lcp-match-success"
                      : "lcp-match-message lcp-match-error"
                  }
                >

                  {formData.newPassword ===
                  formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}

                </div>

              )}


            </div>


            {/* ACTIONS */}

            <div className="lcp-actions">


              <button
                type="button"
                className="lcp-cancel"
                onClick={() =>
                  navigate(
                    "/lecturer-dashboard"
                  )
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="lcp-submit"
                disabled={saving}
              >

                <LockKeyhole
                  size={17}
                />


                {saving
                  ? "Updating..."
                  : "Update Password"}

              </button>


            </div>


          </form>


        </div>


        {/* ==================================
            SECURITY GUIDE
        ================================== */}

        <aside className="lcp-security-panel">


          <div className="lcp-security-panel-icon">

            <ShieldCheck size={24} />

          </div>


          <span className="lcp-security-eyebrow">
            PASSWORD HEALTH
          </span>


          <h3>
            Build a secure password
          </h3>


          <p className="lcp-security-description">
            A stronger password helps protect
            your courses, submissions, grading
            information and lecturer account.
          </p>


          {/* STRENGTH */}

          <div className="lcp-strength-box">


            <div className="lcp-strength-heading">

              <span>
                Password strength
              </span>

              <strong
                className={
                  getStrengthClass()
                }
              >
                {getStrengthLabel()}
              </strong>

            </div>


            <div className="lcp-strength-bars">

              {[1, 2, 3, 4].map(
                (level) => (

                  <span
                    key={level}
                    className={
                      passwordStrength >=
                      level
                        ? `lcp-strength-bar lcp-strength-bar-active ${getStrengthClass()}`
                        : "lcp-strength-bar"
                    }
                  />

                )
              )}

            </div>


          </div>


          {/* REQUIREMENTS */}

          <div className="lcp-requirements">


            <PasswordRequirement
              complete={
                passwordChecks.length
              }
              text="At least 6 characters"
            />


            <PasswordRequirement
              complete={
                passwordChecks.uppercase
              }
              text="Contains an uppercase letter"
            />


            <PasswordRequirement
              complete={
                passwordChecks.number
              }
              text="Contains a number"
            />


            <PasswordRequirement
              complete={
                passwordChecks.symbol
              }
              text="Contains a symbol"
            />


          </div>


          {/* LOGOUT NOTE */}

          <div className="lcp-logout-note">


            <div>

              <LogOut size={17} />

            </div>


            <p>
              After changing your password,
              CampusLearn will securely sign
              you out and return you to the
              login page.
            </p>


          </div>


        </aside>


      </section>


    </div>

  );

}


/* ========================================
   PASSWORD REQUIREMENT
======================================== */

function PasswordRequirement({
  complete,
  text,
}) {

  return (

    <div
      className={
        complete
          ? "lcp-requirement lcp-requirement-complete"
          : "lcp-requirement"
      }
    >

      {complete ? (

        <CheckCircle2
          size={15}
        />

      ) : (

        <Circle
          size={15}
        />

      )}


      <span>
        {text}
      </span>

    </div>

  );

}


export default LecturerChangePassword;