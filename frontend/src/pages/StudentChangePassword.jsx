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
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  LoaderCircle,
} from "lucide-react";

import API_BASE_URL from "../config/api";


function StudentChangePassword() {

  const navigate =
    useNavigate();


  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    showCurrent,
    setShowCurrent,
  ] = useState(false);

  const [
    showNew,
    setShowNew,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  /* ========================================
     PASSWORD STRENGTH
  ======================================== */

  const getPasswordStrength = (
    password
  ) => {

    if (!password) {

      return {
        label: "Not set",
        score: 0,
      };

    }


    let score = 0;


    if (password.length >= 6) {
      score += 1;
    }


    if (password.length >= 10) {
      score += 1;
    }


    if (/[A-Z]/.test(password)) {
      score += 1;
    }


    if (/[0-9]/.test(password)) {
      score += 1;
    }


    if (
      /[^A-Za-z0-9]/.test(
        password
      )
    ) {
      score += 1;
    }


    if (score <= 1) {

      return {
        label: "Weak",
        score: 1,
      };

    }


    if (score <= 3) {

      return {
        label: "Good",
        score: 3,
      };

    }


    return {
      label: "Strong",
      score: 5,
    };

  };


  const passwordStrength =
    getPasswordStrength(
      newPassword
    );


  const passwordsMatch =
    confirmPassword.length >
      0 &&
    newPassword ===
      confirmPassword;


  /* ========================================
     CHANGE PASSWORD
  ======================================== */

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        setError(
          "Please complete all password fields."
        );

        return;

      }


      if (
        newPassword.length < 6
      ) {

        setError(
          "New password must contain at least 6 characters."
        );

        return;

      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "New password and confirmation do not match."
        );

        return;

      }


      if (
        currentPassword ===
        newPassword
      ) {

        setError(
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
              currentPassword,
              newPassword,
            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        setSuccess(
          response.data
            ?.message ||
          "Password changed successfully!"
        );


        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");


        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);


        setTimeout(() => {

          setSuccess("");

        }, 4000);


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


        setError(
          error.response
            ?.data?.error ||
          "Failed to change password."
        );


      } finally {

        setSaving(false);

      }

    };


  return (

    <>

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================
           PAGE
        ===================================== */

        .student-password-page {

          width: 100%;

          max-width: 1320px;

          padding:
            42px 48px 60px;

        }


        /* =====================================
           PAGE HEADER
        ===================================== */

        .password-page-header {

          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 22px;

          margin-bottom: 27px;

        }


        .password-eyebrow {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 8px;

          color: #6958ee;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: .11em;

          text-transform: uppercase;

        }


        .password-page-title {

          margin: 0;

          color: #101828;

          font-size: 32px;

          line-height: 1.15;

          font-weight: 800;

          letter-spacing: -.035em;

        }


        .password-page-subtitle {

          margin: 8px 0 0;

          color: #7b879d;

          font-size: 14px;

          line-height: 1.6;

        }


        .password-secure-badge {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 10px 14px;

          border-radius: 999px;

          color: #047857;

          background: #ecfdf5;

          border: 1px solid #d1fae5;

          font-size: 12px;

          font-weight: 700;

        }


        /* =====================================
           HERO
        ===================================== */

        .password-hero {

          position: relative;

          min-height: 190px;

          overflow: hidden;

          margin-bottom: 22px;

          padding: 32px 34px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 30px;

          border-radius: 24px;

          background:

            radial-gradient(
              circle at 83% 20%,
              rgba(113, 208, 255, .30),
              transparent 28%
            ),

            radial-gradient(
              circle at 12% 90%,
              rgba(187, 141, 255, .34),
              transparent 31%
            ),

            linear-gradient(
              120deg,
              #513bea 0%,
              #5f57ed 50%,
              #4f7bee 100%
            );

          box-shadow:
            0 22px 50px
            rgba(76, 69, 196, .17);

        }


        .password-hero-grid {

          position: absolute;

          inset: 0;

          opacity: .06;

          background-image:

            linear-gradient(
              rgba(255,255,255,.7)
              1px,
              transparent 1px
            ),

            linear-gradient(
              90deg,
              rgba(255,255,255,.7)
              1px,
              transparent 1px
            );

          background-size:
            54px 54px;

        }


        .password-orb {

          position: absolute;

          border-radius: 50%;

          background:
            rgba(255,255,255,.08);

          border:
            1px solid
            rgba(255,255,255,.13);

        }


        .password-orb-one {

          width: 155px;

          height: 155px;

          right: 48px;

          top: -90px;

        }


        .password-orb-two {

          width: 95px;

          height: 95px;

          right: 235px;

          bottom: -55px;

        }


        .password-hero-content {

          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 20px;

        }


        .password-hero-icon {

          width: 70px;

          height: 70px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 20px;

          color: white;

          background:
            rgba(255,255,255,.13);

          border:
            1px solid
            rgba(255,255,255,.23);

          backdrop-filter:
            blur(12px);

          box-shadow:
            0 14px 30px
            rgba(34, 28, 119, .20);

        }


        .password-hero-title {

          margin: 0;

          color: white;

          font-size: 23px;

          font-weight: 800;

          letter-spacing: -.02em;

        }


        .password-hero-copy {

          max-width: 580px;

          margin: 8px 0 0;

          color:
            rgba(255,255,255,.78);

          font-size: 13px;

          line-height: 1.65;

        }


        .password-hero-status {

          position: relative;

          z-index: 2;

          min-width: 200px;

          padding: 18px 20px;

          border-radius: 17px;

          background:
            rgba(255,255,255,.10);

          border:
            1px solid
            rgba(255,255,255,.16);

          backdrop-filter:
            blur(13px);

        }


        .password-hero-status-label {

          display: block;

          margin-bottom: 6px;

          color:
            rgba(255,255,255,.62);

          font-size: 11px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: .09em;

        }


        .password-hero-status-value {

          display: flex;

          align-items: center;

          gap: 8px;

          color: white;

          font-size: 14px;

          font-weight: 700;

        }


        /* =====================================
           MAIN FORM CARD
        ===================================== */

        .password-card {

          display: grid;

          grid-template-columns:
            1fr 320px;

          gap: 0;

          overflow: hidden;

          border-radius: 24px;

          border:
            1px solid #e9ecf4;

          background: white;

          box-shadow:
            0 20px 50px
            rgba(35, 43, 90, .07);

        }


        .password-form-side {

          padding: 31px;

        }


        .password-card-header {

          display: flex;

          align-items: center;

          gap: 14px;

          margin-bottom: 25px;

        }


        .password-card-icon {

          width: 48px;

          height: 48px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 14px;

          color: #5b59ee;

          background:
            linear-gradient(
              145deg,
              #ececff,
              #f4f6ff
            );

          border:
            1px solid #e4e4ff;

        }


        .password-card-title {

          margin: 0;

          color: #182230;

          font-size: 18px;

          font-weight: 800;

        }


        .password-card-subtitle {

          margin: 5px 0 0;

          color: #98a2b3;

          font-size: 12px;

          line-height: 1.5;

        }


        /* =====================================
           MESSAGES
        ===================================== */

        .password-message {

          margin-bottom: 18px;

          padding: 12px 14px;

          display: flex;

          align-items: flex-start;

          gap: 9px;

          border-radius: 12px;

          font-size: 12px;

          font-weight: 600;

          line-height: 1.5;

        }


        .password-message.error {

          color: #c33c3c;

          background: #fff2f2;

          border:
            1px solid #fee2e2;

        }


        .password-message.success {

          color: #047857;

          background: #ecfdf5;

          border:
            1px solid #d1fae5;

        }


        /* =====================================
           FIELDS
        ===================================== */

        .password-field {

          margin-bottom: 18px;

        }


        .password-label {

          display: block;

          margin-bottom: 8px;

          color: #344054;

          font-size: 13px;

          font-weight: 700;

        }


        .password-input-wrapper {

          position: relative;

          display: flex;

          align-items: center;

        }


        .password-input-icon {

          position: absolute;

          left: 15px;

          color: #9aa5b8;

          pointer-events: none;

        }


        .password-input {

          width: 100%;

          height: 53px;

          padding:
            0 48px 0 45px;

          outline: none;

          border:
            1px solid #e3e7ef;

          border-radius: 13px;

          background:
            #fbfcff;

          color: #101828;

          font-family: inherit;

          font-size: 13px;

          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            background .2s ease;

        }


        .password-input:focus {

          background: white;

          border-color: #7464ef;

          box-shadow:
            0 0 0 4px
            rgba(101, 85, 234, .08);

        }


        .password-eye-button {

          position: absolute;

          right: 10px;

          width: 34px;

          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          border-radius: 9px;

          color: #98a2b3;

          background: transparent;

          cursor: pointer;

          transition:
            color .2s,
            background .2s;

        }


        .password-eye-button:hover {

          color: #6254e8;

          background: #f1efff;

        }


        /* =====================================
           PASSWORD STRENGTH
        ===================================== */

        .password-strength {

          margin:
            -6px 0 20px;

          padding: 13px 14px;

          border-radius: 12px;

          background: #fafbff;

          border:
            1px solid #edf0f6;

        }


        .strength-top {

          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 9px;

        }


        .strength-title {

          color: #667085;

          font-size: 11px;

          font-weight: 700;

        }


        .strength-label {

          color: #6255ed;

          font-size: 11px;

          font-weight: 800;

        }


        .strength-bars {

          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 5px;

        }


        .strength-bar {

          height: 5px;

          border-radius: 999px;

          background: #e8eaf2;

          transition:
            background .2s ease;

        }


        .strength-bar.active {

          background:
            linear-gradient(
              90deg,
              #6b54ee,
              #507aef
            );

        }


        /* =====================================
           MATCH STATUS
        ===================================== */

        .password-match {

          display: flex;

          align-items: center;

          gap: 6px;

          margin:
            -8px 0 19px;

          font-size: 11px;

          font-weight: 600;

        }


        .password-match.match {

          color: #059669;

        }


        .password-match.no-match {

          color: #98a2b3;

        }


        /* =====================================
           SAVE
        ===================================== */

        .password-save-area {

          margin-top: 24px;

          padding-top: 21px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          border-top:
            1px solid #edf0f5;

        }


        .password-save-note {

          color: #98a2b3;

          font-size: 11px;

          line-height: 1.5;

        }


        .password-save-button {

          min-width: 175px;

          height: 46px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border: none;

          border-radius: 12px;

          color: white;

          background:
            linear-gradient(
              100deg,
              #5845e9,
              #5f59ef,
              #4e78ee
            );

          font-family: inherit;

          font-size: 12px;

          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 11px 24px
            rgba(86, 74, 224, .22);

          transition:
            transform .2s,
            box-shadow .2s,
            opacity .2s;

        }


        .password-save-button:hover {

          transform:
            translateY(-1px);

          box-shadow:
            0 14px 28px
            rgba(86, 74, 224, .27);

        }


        .password-save-button:disabled {

          cursor: not-allowed;

          opacity: .65;

          transform: none;

        }


        .password-spin {

          animation:
            passwordSpin
            .8s linear infinite;

        }


        /* =====================================
           SECURITY SIDE PANEL
        ===================================== */

        .password-security-side {

          padding: 31px 27px;

          background:

            radial-gradient(
              circle at top right,
              rgba(101, 85, 234, .08),
              transparent 35%
            ),

            linear-gradient(
              145deg,
              #f8f8ff,
              #f4f7ff
            );

          border-left:
            1px solid #e9ecf4;

        }


        .security-side-icon {

          width: 50px;

          height: 50px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 18px;

          border-radius: 15px;

          color: #5e55e9;

          background: white;

          border:
            1px solid #e5e4ff;

          box-shadow:
            0 10px 22px
            rgba(74, 63, 180, .08);

        }


        .security-side-title {

          margin: 0;

          color: #182230;

          font-size: 17px;

          font-weight: 800;

        }


        .security-side-copy {

          margin:
            7px 0 22px;

          color: #8490a4;

          font-size: 12px;

          line-height: 1.6;

        }


        .security-check-list {

          display: flex;

          flex-direction: column;

          gap: 11px;

        }


        .security-check {

          display: flex;

          align-items: center;

          gap: 9px;

          padding: 10px 11px;

          border-radius: 11px;

          color: #667085;

          background:
            rgba(255,255,255,.7);

          border:
            1px solid #e9ecf4;

          font-size: 11px;

          line-height: 1.4;

        }


        .security-check.good {

          color: #047857;

          background: #f0fdf8;

          border-color: #d5f5e5;

        }


        .security-check-icon {

          flex-shrink: 0;

          color: #6558ed;

        }


        .security-check.good
        .security-check-icon {

          color: #10b981;

        }


        .security-tip {

          margin-top: 24px;

          padding: 13px;

          border-radius: 12px;

          color: #6e7890;

          background: white;

          border:
            1px solid #e7eaf1;

          font-size: 11px;

          line-height: 1.55;

        }


        @keyframes passwordSpin {

          to {

            transform:
              rotate(360deg);

          }

        }


        /* =====================================
           RESPONSIVE
        ===================================== */

        @media (max-width: 980px) {

          .password-card {

            grid-template-columns:
              1fr;

          }


          .password-security-side {

            border-left: none;

            border-top:
              1px solid #e9ecf4;

          }

        }


        @media (max-width: 760px) {

          .student-password-page {

            padding:
              30px 22px 48px;

          }


          .password-page-header {

            align-items:
              flex-start;

            flex-direction:
              column;

          }


          .password-page-title {

            font-size: 28px;

          }


          .password-hero {

            padding: 26px;

            align-items:
              flex-start;

            flex-direction:
              column;

          }


          .password-hero-status {

            width: 100%;

          }


          .password-form-side {

            padding: 23px;

          }


          .password-save-area {

            align-items:
              stretch;

            flex-direction:
              column;

          }


          .password-save-button {

            width: 100%;

          }

        }


        @media (max-width: 480px) {

          .password-hero-content {

            align-items:
              flex-start;

            flex-direction:
              column;

          }

        }

      `}</style>


      <div className="student-password-page">


        {/* ====================================
            PAGE HEADER
        ==================================== */}

        <div className="password-page-header">

          <div>

            <div className="password-eyebrow">

              <Sparkles size={13} />

              Account security

            </div>


            <h1 className="password-page-title">

              Change Password

            </h1>


            <p className="password-page-subtitle">

              Protect your CampusLearn
              account with a secure password.

            </p>

          </div>


          <div className="password-secure-badge">

            <ShieldCheck size={15} />

            Secure Account

          </div>

        </div>


        {/* ====================================
            HERO
        ==================================== */}

        <div className="password-hero">

          <div className="password-hero-grid" />


          <div
            className="
              password-orb
              password-orb-one
            "
          />


          <div
            className="
              password-orb
              password-orb-two
            "
          />


          <div className="password-hero-content">

            <div className="password-hero-icon">

              <KeyRound size={31} />

            </div>


            <div>

              <h2 className="password-hero-title">

                Keep your account protected.

              </h2>


              <p className="password-hero-copy">

                Update your password regularly
                and choose something unique that
                you do not use for other accounts.

              </p>

            </div>

          </div>


          <div className="password-hero-status">

            <span className="password-hero-status-label">

              Security Status

            </span>


            <div className="password-hero-status-value">

              <ShieldCheck size={17} />

              Password Protected

            </div>

          </div>

        </div>


        {/* ====================================
            MAIN CARD
        ==================================== */}

        <form
          className="password-card"
          onSubmit={handleSubmit}
        >


          {/* ==================================
              FORM SIDE
          ================================== */}

          <div className="password-form-side">


            <div className="password-card-header">

              <div className="password-card-icon">

                <LockKeyhole size={22} />

              </div>


              <div>

                <h2 className="password-card-title">

                  Update your password

                </h2>


                <p className="password-card-subtitle">

                  Confirm your current password
                  before creating a new one.

                </p>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="password-message error">

                <AlertCircle size={16} />

                <span>

                  {error}

                </span>

              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div className="password-message success">

                <CheckCircle2 size={16} />

                <span>

                  {success}

                </span>

              </div>

            )}


            {/* CURRENT PASSWORD */}

            <PasswordField
              label="Current Password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={
                setCurrentPassword
              }
              show={showCurrent}
              onToggle={() =>
                setShowCurrent(
                  (previous) =>
                    !previous
                )
              }
              icon={
                <LockKeyhole
                  size={17}
                />
              }
            />


            {/* NEW PASSWORD */}

            <PasswordField
              label="New Password"
              placeholder="Create a new password"
              value={newPassword}
              onChange={
                setNewPassword
              }
              show={showNew}
              onToggle={() =>
                setShowNew(
                  (previous) =>
                    !previous
                )
              }
              icon={
                <ShieldCheck
                  size={17}
                />
              }
            />


            {/* STRENGTH */}

            <div className="password-strength">

              <div className="strength-top">

                <span className="strength-title">

                  Password strength

                </span>


                <span className="strength-label">

                  {passwordStrength.label}

                </span>

              </div>


              <div className="strength-bars">

                {[1, 2, 3, 4, 5].map(
                  (item) => (

                    <span
                      key={item}
                      className={
                        item <=
                        passwordStrength.score
                          ? "strength-bar active"
                          : "strength-bar"
                      }
                    />

                  )
                )}

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <PasswordField
              label="Confirm New Password"
              placeholder="Enter your new password again"
              value={confirmPassword}
              onChange={
                setConfirmPassword
              }
              show={showConfirm}
              onToggle={() =>
                setShowConfirm(
                  (previous) =>
                    !previous
                )
              }
              icon={
                <ShieldCheck
                  size={17}
                />
              }
            />


            {confirmPassword && (

              <div
                className={
                  passwordsMatch
                    ? "password-match match"
                    : "password-match no-match"
                }
              >

                {passwordsMatch ? (

                  <>

                    <CheckCircle2
                      size={13}
                    />

                    Passwords match

                  </>

                ) : (

                  <>

                    <AlertCircle
                      size={13}
                    />

                    Passwords do not match yet

                  </>

                )}

              </div>

            )}


            {/* SAVE */}

            <div className="password-save-area">

              <span className="password-save-note">

                Your new password will
                take effect immediately.

              </span>


              <button
                type="submit"
                className="password-save-button"
                disabled={saving}
              >

                {saving ? (

                  <>

                    <LoaderCircle
                      size={16}
                      className="password-spin"
                    />

                    Updating...

                  </>

                ) : (

                  <>

                    <Save size={16} />

                    Update Password

                  </>

                )}

              </button>

            </div>

          </div>


          {/* ==================================
              SECURITY SIDE
          ================================== */}

          <div className="password-security-side">

            <div className="security-side-icon">

              <Shield size={23} />

            </div>


            <h3 className="security-side-title">

              Password Security

            </h3>


            <p className="security-side-copy">

              A stronger password helps
              protect your courses,
              submissions and personal
              information.

            </p>


            <div className="security-check-list">


              <SecurityCheck
                good={
                  newPassword.length >= 6
                }
                text="At least 6 characters"
              />


              <SecurityCheck
                good={
                  /[A-Z]/.test(
                    newPassword
                  )
                }
                text="Contains an uppercase letter"
              />


              <SecurityCheck
                good={
                  /[0-9]/.test(
                    newPassword
                  )
                }
                text="Contains a number"
              />


              <SecurityCheck
                good={
                  /[^A-Za-z0-9]/.test(
                    newPassword
                  )
                }
                text="Contains a special character"
              />


              <SecurityCheck
                good={
                  passwordsMatch
                }
                text="Confirmation matches"
              />

            </div>


            <div className="security-tip">

              <strong>
                Quick tip:
              </strong>{" "}

              Avoid using your name,
              student number or the same
              password you use for email or
              social media.

            </div>

          </div>

        </form>

      </div>

    </>

  );

}


/* ========================================
   PASSWORD FIELD
======================================== */

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
  icon,
}) {

  return (

    <div className="password-field">

      <label className="password-label">

        {label}

      </label>


      <div className="password-input-wrapper">

        <span className="password-input-icon">

          {icon}

        </span>


        <input
          className="password-input"
          type={
            show
              ? "text"
              : "password"
          }
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete="off"
          required
        />


        <button
          type="button"
          className="password-eye-button"
          onClick={onToggle}
          aria-label={
            show
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >

          {show ? (

            <EyeOff size={17} />

          ) : (

            <Eye size={17} />

          )}

        </button>

      </div>

    </div>

  );

}


/* ========================================
   SECURITY CHECK
======================================== */

function SecurityCheck({
  good,
  text,
}) {

  return (

    <div
      className={
        good
          ? "security-check good"
          : "security-check"
      }
    >

      <CheckCircle2
        size={14}
        className="security-check-icon"
      />


      <span>

        {text}

      </span>

    </div>

  );

}


export default StudentChangePassword;