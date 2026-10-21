import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  GraduationCap,
  Sparkles,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  BrainCircuit,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import API_BASE_URL from "../config/api";


function Login() {

  const navigate =
    useNavigate();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  /* ========================================
     LOGIN
  ======================================== */

const handleLogin =
  async (e) => {

    e.preventDefault();


    try {

      setLoading(true);

      setMessage("");

      setMessageType("");


      const response =
        await axios.post(
          `${API_BASE_URL}/login`,
          {
            email,
            password,
          }
        );


      /* ========================================
         SAVE LOGIN DETAILS
      ======================================== */

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "role",
        response.data.role
      );


      const userRole =
        response.data.role;


      const mustChangePassword =
        response.data
          .must_change_password ===
        true;


      /* ========================================
         FIRST LOGIN / TEMP PASSWORD
      ======================================== */

      if (mustChangePassword) {

        localStorage.setItem(
          "must_change_password",
          "true"
        );


        setMessage(
          "Temporary password accepted. Please create a new password to continue."
        );

        setMessageType(
          "success"
        );


        setTimeout(() => {

          navigate(
            "/set-new-password",
            {
              replace: true,
            }
          );

        }, 900);


        return;

      }


      /* ========================================
         NORMAL LOGIN
      ======================================== */

      localStorage.removeItem(
        "must_change_password"
      );


      setMessage(
        "Login successful! Taking you to your dashboard..."
      );

      setMessageType(
        "success"
      );


      setTimeout(() => {

        if (
          userRole === "ADMIN"
        ) {

          navigate(
            "/admin-dashboard"
          );

        } else if (
          userRole === "LECTURER"
        ) {

          navigate(
            "/lecturer-dashboard"
          );

        } else {

          navigate(
            "/dashboard"
          );

        }

      }, 900);


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      localStorage.removeItem(
        "must_change_password"
      );


      setMessage(
        error.response
          ?.data?.error ||
        "Login failed. Please check your email and password."
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


        /* =====================================
           PAGE
        ===================================== */

        .login-page {

          position: fixed;

          inset: 0;

          width: 100vw;

          height: 100vh;

          display: grid;

          grid-template-columns:
            minmax(0, 1.12fr)
            minmax(480px, .88fr);

          overflow: hidden;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background:
            #f7f8fd;

        }


        /* =====================================
           LEFT BRAND AREA
        ===================================== */

        .login-brand-panel {

          position: relative;

          overflow: hidden;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 70px;

          color: white;

          background:

            radial-gradient(
              circle at 14% 15%,
              rgba(142, 86, 255, .68),
              transparent 30%
            ),

            radial-gradient(
              circle at 86% 22%,
              rgba(64, 216, 255, .30),
              transparent 28%
            ),

            radial-gradient(
              circle at 52% 90%,
              rgba(106, 76, 255, .38),
              transparent 35%
            ),

            linear-gradient(
              135deg,
              #10042f 0%,
              #25106d 34%,
              #2b17b9 65%,
              #0863c8 100%
            );

        }


        .login-brand-grid {

          position: absolute;

          inset: 0;

          opacity: .065;

          background-image:

            linear-gradient(
              rgba(255,255,255,.5) 1px,
              transparent 1px
            ),

            linear-gradient(
              90deg,
              rgba(255,255,255,.5) 1px,
              transparent 1px
            );

          background-size:
            72px 72px;

          mask-image:

            radial-gradient(
              circle at center,
              black,
              transparent 80%
            );

        }


        .brand-orb {

          position: absolute;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.12);

          background:

            linear-gradient(
              145deg,
              rgba(255,255,255,.10),
              rgba(255,255,255,.02)
            );

          backdrop-filter:
            blur(10px);

          animation:
            loginOrbFloat
            7s ease-in-out
            infinite;

        }


        .brand-orb-one {

          width: 290px;
          height: 290px;

          left: -90px;
          top: -90px;

        }


        .brand-orb-two {

          width: 230px;
          height: 230px;

          right: -70px;
          bottom: -55px;

          animation-delay:
            1.4s;

        }


        .brand-orbit {

          position: absolute;

          width: 680px;

          height: 300px;

          left: 50%;

          top: 49%;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.08);

          transform:
            translate(-50%,-50%)
            rotate(-10deg);

        }


        .brand-content {

          position: relative;

          z-index: 3;

          width:
            min(100%, 650px);

          animation:
            loginFadeUp
            .8s ease-out both;

        }


        /* =====================================
           LOGO
        ===================================== */

        .login-brand-logo {

          position: relative;

          width: 78px;

          height: 78px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 34px;

          border-radius: 23px;

          color: white;

          background:

            linear-gradient(
              145deg,
              rgba(255,255,255,.20),
              rgba(255,255,255,.07)
            );

          border:
            1px solid
            rgba(255,255,255,.20);

          box-shadow:

            0 18px 45px
            rgba(3,7,45,.32),

            inset 0 1px 0
            rgba(255,255,255,.15);

          backdrop-filter:
            blur(18px);

        }


        .login-brand-logo svg {

          width: 39px;

          height: 39px;

        }


        .login-logo-spark {

          position: absolute;

          width: 27px;

          height: 27px;

          right: -7px;

          top: -6px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background:

            linear-gradient(
              135deg,
              #9a78ff,
              #62ddff
            );

          box-shadow:

            0 7px 18px
            rgba(90,210,255,.30);

        }


        /* =====================================
           BRAND COPY
        ===================================== */

        .brand-badge {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:

            8px 13px;

          margin-bottom:
            22px;

          border-radius:
            999px;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.12);

          color:
            rgba(240,247,255,.82);

          font-size:
            11px;

          font-weight:
            700;

          text-transform:
            uppercase;

          letter-spacing:
            .13em;

        }


        .brand-badge-dot {

          width: 7px;

          height: 7px;

          border-radius:
            50%;

          background:
            #70e4ff;

          box-shadow:

            0 0 12px
            rgba(112,228,255,.9);

        }


        .login-brand-title {

          margin: 0;

          max-width:
            600px;

          font-size:
            clamp(
              3rem,
              5vw,
              5.2rem
            );

          line-height:
            .98;

          letter-spacing:
            -.05em;

          font-weight:
            800;

          color: white;

        }


        .login-brand-title span {

          background:

            linear-gradient(
              90deg,
              #a797ff 0%,
              #78ddff 55%,
              #67fff1 100%
            );

          background-clip:
            text;

          -webkit-background-clip:
            text;

          color: transparent;

        }


        .login-brand-description {

          margin:
            24px 0 0;

          max-width:
            560px;

          font-size:
            16px;

          line-height:
            1.75;

          color:
            rgba(231,238,255,.72);

        }


        /* =====================================
           FEATURE ROW
        ===================================== */

        .login-feature-list {

          display: flex;

          flex-direction: column;

          gap: 14px;

          margin-top:
            42px;

        }


        .login-feature {

          display: flex;

          align-items: center;

          gap: 14px;

          color:
            rgba(245,248,255,.82);

          font-size:
            13px;

        }


        .feature-icon-box {

          width: 42px;

          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          background:
            rgba(255,255,255,.08);

          border:
            1px solid
            rgba(255,255,255,.11);

          backdrop-filter:
            blur(10px);

        }


        .feature-icon-box svg {

          width: 19px;

          height: 19px;

        }


        /* =====================================
           RIGHT SIDE
        ===================================== */

        .login-form-panel {

          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          padding:
            55px 48px;

          background:

            radial-gradient(
              circle at top right,
              rgba(105,87,255,.08),
              transparent 26%
            ),

            #f7f8fd;

        }


        .login-form-container {

          width: 100%;

          max-width:
            440px;

          animation:
            formEnter
            .8s
            cubic-bezier(
              .2,.8,.2,1
            )
            both;

        }


        /* =====================================
           MOBILE LOGO
        ===================================== */

        .mobile-login-brand {

          display: none;

          align-items: center;

          gap: 11px;

          margin-bottom:
            32px;

        }


        .mobile-login-icon {

          width: 44px;

          height: 44px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          color: white;

          background:

            linear-gradient(
              135deg,
              #5b47ed,
              #6579ef
            );

        }


        .mobile-login-brand strong {

          display: block;

          color:
            #111827;

          font-size:
            18px;

        }


        .mobile-login-brand span {

          display: block;

          margin-top: 2px;

          color:
            #98a2b3;

          font-size:
            11px;

        }


        /* =====================================
           FORM HEADER
        ===================================== */

        .login-eyebrow {

          margin-bottom:
            12px;

          color:
            #6655ed;

          font-size:
            12px;

          font-weight:
            700;

          letter-spacing:
            .12em;

          text-transform:
            uppercase;

        }


        .login-heading {

          margin: 0;

          color:
            #101828;

          font-size:
            38px;

          line-height:
            1.1;

          letter-spacing:
            -.035em;

          font-weight:
            800;

        }


        .login-description {

          margin:
            12px 0 34px;

          color:
            #7c879e;

          font-size:
            14px;

          line-height:
            1.65;

        }


        /* =====================================
           MESSAGE
        ===================================== */

        .login-message {

          display: flex;

          align-items:
            flex-start;

          gap: 10px;

          margin-bottom:
            22px;

          padding:
            13px 14px;

          border-radius:
            12px;

          font-size:
            12px;

          line-height:
            1.5;

          font-weight:
            600;

          animation:
            loginMessageEnter
            .25s ease-out;

        }


        .login-message-success {

          color:
            #047857;

          background:
            #ecfdf5;

          border:
            1px solid
            #d1fae5;

        }


        .login-message-error {

          color:
            #c33c3c;

          background:
            #fff2f2;

          border:
            1px solid
            #fee2e2;

        }


        .login-message svg {

          flex-shrink: 0;

          margin-top: 1px;

        }


        /* =====================================
           FORM
        ===================================== */

        .modern-login-form {

          display: flex;

          flex-direction: column;

          gap: 21px;

        }


        .login-field {

          display: flex;

          flex-direction: column;

          gap: 8px;

        }


        .login-label {

          color:
            #344054;

          font-size:
            12px;

          font-weight:
            650;

        }


        .login-input-wrapper {

          position: relative;

          display: flex;

          align-items: center;

        }


        .login-input-icon {

          position: absolute;

          left: 15px;

          color:
            #98a2b3;

          pointer-events: none;

        }


        .modern-login-input {

          width: 100%;

          height: 52px;

          padding:
            0 46px;

          border-radius:
            13px;

          border:
            1px solid
            #e4e7ec;

          outline: none;

          color:
            #101828;

          background:
            #ffffff;

          font-family:
            inherit;

          font-size:
            13px;

          transition:
            border-color .2s,
            box-shadow .2s,
            background .2s;

        }


        .modern-login-input::placeholder {

          color:
            #a9b1c0;

        }


        .modern-login-input:hover {

          border-color:
            #ccd2df;

        }


        .modern-login-input:focus {

          border-color:
            #7162ed;

          background:
            #ffffff;

          box-shadow:

            0 0 0 4px
            rgba(99,82,233,.09);

        }


        .password-toggle {

          position: absolute;

          right: 11px;

          width: 34px;

          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          border-radius:
            9px;

          background:
            transparent;

          color:
            #98a2b3;

          cursor: pointer;

          transition:
            background .2s,
            color .2s;

        }


        .password-toggle:hover {

          color:
            #6254e8;

          background:
            #f3f1ff;

        }


        /* =====================================
           SIGN IN BUTTON
        ===================================== */

        .modern-login-button {

          width: 100%;

          height: 53px;

          margin-top:
            6px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          border: none;

          border-radius:
            13px;

          color: white;

          background:

            linear-gradient(
              100deg,
              #5846e8 0%,
              #6658ee 55%,
              #4776ed 100%
            );

          box-shadow:

            0 12px 24px
            rgba(87,72,226,.23);

          font-family:
            inherit;

          font-size:
            13px;

          font-weight:
            700;

          cursor: pointer;

          transition:

            transform .2s,
            box-shadow .2s,
            opacity .2s;

        }


        .modern-login-button:hover:not(:disabled) {

          transform:
            translateY(-1px);

          box-shadow:

            0 15px 30px
            rgba(87,72,226,.30);

        }


        .modern-login-button:active:not(:disabled) {

          transform:
            translateY(0);

        }


        .modern-login-button:disabled {

          cursor:
            not-allowed;

          opacity: .72;

        }


        .button-loader {

          width: 17px;

          height: 17px;

          border-radius:
            50%;

          border:
            2px solid
            rgba(255,255,255,.35);

          border-top-color:
            #ffffff;

          animation:
            loginButtonSpin
            .8s linear infinite;

        }


        /* =====================================
           SIGN UP
        ===================================== */

        .signup-text {

          margin:
            27px 0 0;

          text-align:
            center;

          color:
            #98a2b3;

          font-size:
            12px;

        }


        .signup-link {

          margin-left: 4px;

          color:
            #6252eb;

          text-decoration:
            none;

          font-weight:
            700;

        }


        .signup-link:hover {

          text-decoration:
            underline;

        }


        /* =====================================
           SECURITY NOTE
        ===================================== */

        .login-security {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          margin-top:
            28px;

          color:
            #b1b8c5;

          font-size:
            10px;

        }


        .security-dot {

          width: 5px;

          height: 5px;

          border-radius:
            50%;

          background:
            #55cfa0;

        }


        /* =====================================
           ANIMATIONS
        ===================================== */

        @keyframes
        loginFadeUp {

          from {

            opacity: 0;

            transform:
              translateY(18px);

          }

          to {

            opacity: 1;

            transform:
              translateY(0);

          }

        }


        @keyframes
        formEnter {

          from {

            opacity: 0;

            transform:
              translateX(22px);

          }

          to {

            opacity: 1;

            transform:
              translateX(0);

          }

        }


        @keyframes
        loginOrbFloat {

          0%,
          100% {

            transform:
              translate(0,0);

          }

          50% {

            transform:
              translate(
                15px,
                13px
              );

          }

        }


        @keyframes
        loginButtonSpin {

          to {

            transform:
              rotate(360deg);

          }

        }


        @keyframes
        loginMessageEnter {

          from {

            opacity: 0;

            transform:
              translateY(-5px);

          }

          to {

            opacity: 1;

            transform:
              translateY(0);

          }

        }


        /* =====================================
           RESPONSIVE
        ===================================== */

        @media
        (max-width: 1050px) {

          .login-page {

            grid-template-columns:
              .95fr 1.05fr;

          }


          .login-brand-panel {

            padding:
              48px;

          }


          .login-brand-title {

            font-size:
              3.7rem;

          }

        }


        @media
        (max-width: 820px) {

          .login-page {

            display: block;

            overflow-y: auto;

            background:

              radial-gradient(
                circle at top left,
                rgba(112,91,238,.11),
                transparent 30%
              ),

              #f7f8fd;

          }


          .login-brand-panel {

            display: none;

          }


          .login-form-panel {

            min-height:
              100vh;

            padding:
              38px 24px;

          }


          .mobile-login-brand {

            display: flex;

          }


          .login-form-container {

            max-width:
              450px;

          }

        }


        @media
        (max-width: 520px) {

          .login-form-panel {

            align-items:
              flex-start;

            padding:
              28px 20px;

          }


          .login-form-container {

            padding-top:
              12px;

          }


          .login-heading {

            font-size:
              31px;

          }


          .login-description {

            margin-bottom:
              28px;

          }


          .modern-login-input {

            height:
              50px;

          }


          .modern-login-button {

            height:
              51px;

          }

        }

      `}</style>


      <div className="login-page">


        {/* ==================================
            LEFT BRAND PANEL
        ================================== */}

        <section className="login-brand-panel">


          <div className="login-brand-grid" />


          <div
            className="
              brand-orb
              brand-orb-one
            "
          />


          <div
            className="
              brand-orb
              brand-orb-two
            "
          />


          <div className="brand-orbit" />


          <div className="brand-content">


            {/* LOGO */}

            <div className="login-brand-logo">

              <GraduationCap />

              <span className="login-logo-spark">

                <Sparkles
                  size={15}
                />

              </span>

            </div>


            {/* BADGE */}

            <div className="brand-badge">

              <span className="brand-badge-dot" />

              AI-Powered Learning

            </div>


            {/* TITLE */}

            <h1 className="login-brand-title">

              Learn smarter.

              <br />

              Grow with{" "}

              <span>
                CampusLearn AI
              </span>

            </h1>


            {/* DESCRIPTION */}

            <p className="login-brand-description">

              One intelligent learning
              environment for students,
              lecturers and academic
              administrators.

            </p>


            {/* FEATURES */}

            <div className="login-feature-list">


              <div className="login-feature">

                <div className="feature-icon-box">

                  <BrainCircuit />

                </div>

                AI-powered academic
                assistance and support

              </div>


              <div className="login-feature">

                <div className="feature-icon-box">

                  <BookOpen />

                </div>

                Courses, assignments and
                learning resources in one place

              </div>


              <div className="login-feature">

                <div className="feature-icon-box">

                  <BarChart3 />

                </div>

                Real-time learning progress
                and academic insights

              </div>


            </div>


          </div>

        </section>


        {/* ==================================
            RIGHT LOGIN PANEL
        ================================== */}

        <section className="login-form-panel">


          <div className="login-form-container">


            {/* MOBILE BRAND */}

            <div className="mobile-login-brand">

              <div className="mobile-login-icon">

                <GraduationCap
                  size={24}
                />

              </div>

              <div>

                <strong>
                  CampusLearn AI
                </strong>

                <span>
                  AI-Powered Learning
                </span>

              </div>

            </div>


            {/* HEADER */}

            <div className="login-eyebrow">

              Welcome back

            </div>


            <h2 className="login-heading">

              Sign in to continue

            </h2>


            <p className="login-description">

              Enter your CampusLearn
              credentials to access your
              personalized workspace.

            </p>


            {/* MESSAGE */}

            {message && (

              <div
                className={`
                  login-message
                  ${
                    messageType ===
                    "success"

                      ? "login-message-success"

                      : "login-message-error"
                  }
                `}
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


            {/* ==================================
                FORM
            ================================== */}

            <form
              className="modern-login-form"
              onSubmit={handleLogin}
            >


              {/* EMAIL */}

              <div className="login-field">

                <label className="login-label">

                  Email Address

                </label>


                <div className="login-input-wrapper">

                  <Mail
                    size={18}
                    className="login-input-icon"
                  />


                  <input
                    className="modern-login-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    required
                    autoComplete="email"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-field">

                <label className="login-label">

                  Password

                </label>


                <div className="login-input-wrapper">

                  <LockKeyhole
                    size={18}
                    className="login-input-icon"
                  />


                  <input
                    className="modern-login-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    required
                    autoComplete="current-password"
                  />


                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      <EyeOff
                        size={17}
                      />

                    ) : (

                      <Eye
                        size={17}
                      />

                    )}

                  </button>

                </div>

              </div>


              {/* SIGN IN */}

              <button
                type="submit"
                className="modern-login-button"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="button-loader" />

                    Signing in...
                  </>

                ) : (

                  <>
                    Sign In

                    <ArrowRight
                      size={17}
                    />
                  </>

                )}

              </button>


            </form>





            {/* SECURITY */}

            <div className="login-security">

              <span className="security-dot" />

              Secure authentication powered
              by CampusLearn

            </div>


          </div>

        </section>


      </div>

    </>

  );

}


export default Login;