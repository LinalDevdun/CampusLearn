import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  GraduationCap,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import API_BASE_URL from "../config/api";


function SetNewPassword() {

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  /* ========================================
     CHANGE PASSWORD
  ======================================== */

  const handlePasswordChange =
    async (event) => {

      event.preventDefault();

      setMessage("");
      setMessageType("");


      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        setMessage(
          "Please complete all password fields."
        );

        setMessageType("error");

        return;
      }


      if (newPassword.length < 6) {

        setMessage(
          "New password must contain at least 6 characters."
        );

        setMessageType("error");

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setMessage(
          "New password and confirm password do not match."
        );

        setMessageType("error");

        return;
      }


      if (
        currentPassword ===
        newPassword
      ) {

        setMessage(
          "Your new password must be different from the temporary password."
        );

        setMessageType("error");

        return;
      }


      try {

        setLoading(true);


        const token =
          localStorage.getItem("token");


        if (!token) {

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }


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


        localStorage.removeItem(
          "must_change_password"
        );


        setMessage(
          "Password updated successfully! Taking you to your dashboard..."
        );

        setMessageType(
          "success"
        );


        const role =
          localStorage.getItem("role");


        setTimeout(() => {

          if (
            role === "ADMIN"
          ) {

            navigate(
              "/admin-dashboard",
              {
                replace: true,
              }
            );

          } else if (
            role === "LECTURER"
          ) {

            navigate(
              "/lecturer-dashboard",
              {
                replace: true,
              }
            );

          } else {

            navigate(
              "/dashboard",
              {
                replace: true,
              }
            );

          }

        }, 1200);


      } catch (error) {

        console.error(
          "Change password error:",
          error
        );


        setMessage(
          error.response
            ?.data?.error ||
          "Failed to update password. Please try again."
        );

        setMessageType(
          "error"
        );


      } finally {

        setLoading(false);

      }

    };


  return (

    <>

      <style>{`

        * {
          box-sizing: border-box;
        }


        .new-password-page {

          min-height: 100vh;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 30px;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background:

            radial-gradient(
              circle at 15% 20%,
              rgba(117, 83, 255, .18),
              transparent 32%
            ),

            radial-gradient(
              circle at 90% 85%,
              rgba(67, 175, 255, .16),
              transparent 30%
            ),

            #f7f8fd;

        }


        .new-password-card {

          width: 100%;

          max-width: 500px;

          padding: 38px;

          border-radius: 24px;

          background:
            rgba(255, 255, 255, .96);

          border:
            1px solid
            rgba(227, 231, 239, .95);

          box-shadow:
            0 25px 65px
            rgba(49, 46, 129, .13);

        }


        .password-logo {

          width: 58px;

          height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 22px;

          border-radius: 17px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #5846e8,
              #4776ed
            );

          box-shadow:
            0 12px 28px
            rgba(88, 70, 232, .25);

        }


        .password-eyebrow {

          margin-bottom: 9px;

          color: #6555ed;

          font-size: 11px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: .12em;

        }


        .password-title {

          margin: 0;

          color: #101828;

          font-size: 31px;

          line-height: 1.15;

          letter-spacing: -.035em;

        }


        .password-description {

          margin:
            12px 0 27px;

          color: #7c879e;

          font-size: 13px;

          line-height: 1.65;

        }


        .password-message {

          display: flex;

          align-items: flex-start;

          gap: 9px;

          margin-bottom: 20px;

          padding: 12px 13px;

          border-radius: 11px;

          font-size: 12px;

          font-weight: 600;

          line-height: 1.5;

        }


        .password-message.success {

          color: #047857;

          background: #ecfdf5;

          border:
            1px solid #d1fae5;

        }


        .password-message.error {

          color: #c33c3c;

          background: #fff2f2;

          border:
            1px solid #fee2e2;

        }


        .password-form {

          display: flex;

          flex-direction: column;

          gap: 18px;

        }


        .password-field {

          display: flex;

          flex-direction: column;

          gap: 7px;

        }


        .password-field label {

          color: #344054;

          font-size: 12px;

          font-weight: 700;

        }


        .password-input-wrapper {

          position: relative;

          display: flex;

          align-items: center;

        }


        .password-input-icon {

          position: absolute;

          left: 14px;

          color: #98a2b3;

        }


        .password-input {

          width: 100%;

          height: 51px;

          padding:
            0 47px;

          border:
            1px solid #e4e7ec;

          border-radius: 13px;

          outline: none;

          color: #101828;

          background: white;

          font-family: inherit;

          font-size: 13px;

          transition:
            border-color .2s,
            box-shadow .2s;

        }


        .password-input:focus {

          border-color: #7162ed;

          box-shadow:
            0 0 0 4px
            rgba(99, 82, 233, .09);

        }


        .password-eye {

          position: absolute;

          right: 10px;

          width: 34px;

          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          border-radius: 9px;

          background: transparent;

          color: #98a2b3;

          cursor: pointer;

        }


        .password-eye:hover {

          color: #6254e8;

          background: #f3f1ff;

        }


        .password-submit {

          width: 100%;

          height: 52px;

          margin-top: 5px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border: none;

          border-radius: 13px;

          color: white;

          background:
            linear-gradient(
              100deg,
              #5846e8,
              #6658ee,
              #4776ed
            );

          font-family: inherit;

          font-size: 13px;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 12px 25px
            rgba(87, 72, 226, .22);

        }


        .password-submit:disabled {

          opacity: .7;

          cursor: not-allowed;

        }


        .password-security {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          margin-top: 25px;

          color: #98a2b3;

          font-size: 10px;

        }


        .password-security-dot {

          width: 5px;

          height: 5px;

          border-radius: 50%;

          background: #55cfa0;

        }


        @media (max-width: 560px) {

          .new-password-page {

            padding: 18px;

          }


          .new-password-card {

            padding: 27px 22px;

          }


          .password-title {

            font-size: 27px;

          }

        }

      `}</style>


      <div className="new-password-page">

        <div className="new-password-card">


          <div className="password-logo">

            <GraduationCap
              size={29}
            />

          </div>


          <div className="password-eyebrow">

            First-time security setup

          </div>


          <h1 className="password-title">

            Create your new password

          </h1>


          <p className="password-description">

            You're currently using a temporary
            CampusLearn password. Create your own
            password before continuing to your
            account.

          </p>


          {message && (

            <div
              className={`password-message ${messageType}`}
            >

              {messageType ===
              "success" ? (

                <CheckCircle2
                  size={17}
                />

              ) : (

                <AlertCircle
                  size={17}
                />

              )}

              <span>
                {message}
              </span>

            </div>

          )}


          <form
            className="password-form"
            onSubmit={
              handlePasswordChange
            }
          >


            {/* TEMPORARY PASSWORD */}

            <div className="password-field">

              <label>
                Temporary Password
              </label>


              <div className="password-input-wrapper">

                <LockKeyhole
                  size={17}
                  className="password-input-icon"
                />


                <input
                  className="password-input"
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter temporary password"
                  value={
                    currentPassword
                  }
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  required
                />


                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                >

                  {showCurrentPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}

                </button>

              </div>

            </div>


            {/* NEW PASSWORD */}

            <div className="password-field">

              <label>
                New Password
              </label>


              <div className="password-input-wrapper">

                <ShieldCheck
                  size={17}
                  className="password-input-icon"
                />


                <input
                  className="password-input"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a new password"
                  value={
                    newPassword
                  }
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  minLength={6}
                  required
                />


                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                >

                  {showNewPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}

                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="password-field">

              <label>
                Confirm New Password
              </label>


              <div className="password-input-wrapper">

                <ShieldCheck
                  size={17}
                  className="password-input-icon"
                />


                <input
                  className="password-input"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password again"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  minLength={6}
                  required
                />


                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >

                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}

                </button>

              </div>

            </div>


            <button
              type="submit"
              className="password-submit"
              disabled={loading}
            >

              {loading ? (
                "Updating password..."
              ) : (
                <>
                  Save New Password

                  <ArrowRight
                    size={17}
                  />
                </>
              )}

            </button>

          </form>


          <div className="password-security">

            <span className="password-security-dot" />

            Secure password update powered by CampusLearn

          </div>

        </div>

      </div>

    </>

  );

}


export default SetNewPassword;