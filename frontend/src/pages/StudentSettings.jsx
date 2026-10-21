import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Settings,
  Mail,
  BellRing,
  CalendarClock,
  Save,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Bell,
  LoaderCircle,
} from "lucide-react";

import API_BASE_URL from "../config/api";


function StudentSettings() {

  const navigate =
    useNavigate();


  const [settings, setSettings] =
    useState({
      email_notifications: true,
      submission_alerts: true,
      academic_reminders: true,
    });


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* ========================================
     LOAD SETTINGS
  ======================================== */

  useEffect(() => {

    const loadSettings =
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
              `${API_BASE_URL}/user/settings`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          setSettings({

            email_notifications:
              response.data
                ?.email_notifications ??
              true,

            submission_alerts:
              response.data
                ?.submission_alerts ??
              true,

            academic_reminders:
              response.data
                ?.academic_reminders ??
              true,

          });


        } catch (error) {

          console.error(
            "Failed to load settings:",
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
            "Failed to load settings."
          );


        } finally {

          setLoading(false);

        }

      };


    loadSettings();

  }, [navigate]);


  /* ========================================
     TOGGLE SETTING
  ======================================== */

  const toggleSetting = (
    settingName
  ) => {

    setSuccess("");


    setSettings(
      (previous) => ({
        ...previous,

        [settingName]:
          !previous[
            settingName
          ],
      })
    );

  };


  /* ========================================
     SAVE SETTINGS
  ======================================== */

  const saveSettings =
    async () => {

      try {

        setSaving(true);

        setError("");

        setSuccess("");


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
            `${API_BASE_URL}/user/settings`,

            settings,

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        setSuccess(
          response.data?.message ||
          "Your notification preferences have been saved."
        );


        setTimeout(() => {

          setSuccess("");

        }, 3500);


      } catch (error) {

        console.error(
          "Failed to save settings:",
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
          "Failed to save settings."
        );


      } finally {

        setSaving(false);

      }

    };


  /* ========================================
     ENABLED COUNT
  ======================================== */

  const enabledCount =
    Object.values(settings)
      .filter(Boolean)
      .length;


  return (

    <>

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================
           PAGE
        ===================================== */

        .student-settings-page {

          width: 100%;

          max-width: 1320px;

          padding:
            42px 48px 60px;

        }


        /* =====================================
           PAGE HEADER
        ===================================== */

        .settings-page-header {

          display: flex;

          align-items: flex-end;

          justify-content:
            space-between;

          gap: 22px;

          margin-bottom: 27px;

        }


        .settings-eyebrow {

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


        .settings-page-title {

          margin: 0;

          color: #101828;

          font-size: 32px;

          line-height: 1.15;

          font-weight: 800;

          letter-spacing: -.035em;

        }


        .settings-page-subtitle {

          margin: 8px 0 0;

          color: #7b879d;

          font-size: 14px;

          line-height: 1.6;

        }


        .settings-status-badge {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            10px 14px;

          border-radius:
            999px;

          color: #584ee8;

          background:
            #f0efff;

          border:
            1px solid
            #e1deff;

          font-size: 12px;

          font-weight: 700;

        }


        /* =====================================
           HERO
        ===================================== */

        .settings-hero {

          position: relative;

          overflow: hidden;

          min-height: 190px;

          margin-bottom: 22px;

          padding:
            30px 34px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 30px;

          border-radius: 24px;

          color: white;

          background:

            radial-gradient(
              circle at 84% 20%,
              rgba(108, 208, 255, .28),
              transparent 26%
            ),

            radial-gradient(
              circle at 12% 90%,
              rgba(180, 139, 255, .36),
              transparent 31%
            ),

            linear-gradient(
              120deg,
              #513bea 0%,
              #5e57ed 50%,
              #4f7bee 100%
            );

          box-shadow:
            0 22px 50px
            rgba(76, 69, 196, .17);

        }


        .settings-hero-grid {

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
            52px 52px;

        }


        .settings-orb {

          position: absolute;

          border-radius: 50%;

          background:
            rgba(255,255,255,.08);

          border:
            1px solid
            rgba(255,255,255,.12);

        }


        .settings-orb-one {

          width: 150px;

          height: 150px;

          right: 40px;

          top: -85px;

        }


        .settings-orb-two {

          width: 90px;

          height: 90px;

          right: 235px;

          bottom: -52px;

        }


        .settings-hero-left {

          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 20px;

        }


        .settings-hero-icon {

          width: 68px;

          height: 68px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 19px;

          background:
            rgba(255,255,255,.13);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter:
            blur(12px);

          box-shadow:
            0 14px 30px
            rgba(34, 28, 119, .20);

        }


        .settings-hero-title {

          margin: 0;

          color: white;

          font-size: 23px;

          font-weight: 800;

          letter-spacing: -.02em;

        }


        .settings-hero-copy {

          max-width: 580px;

          margin:
            8px 0 0;

          color:
            rgba(255,255,255,.77);

          font-size: 13px;

          line-height: 1.65;

        }


        .settings-hero-stat {

          position: relative;

          z-index: 2;

          min-width: 180px;

          padding:
            18px 20px;

          border-radius: 17px;

          text-align: center;

          background:
            rgba(255,255,255,.10);

          border:
            1px solid
            rgba(255,255,255,.16);

          backdrop-filter:
            blur(13px);

        }


        .settings-hero-stat strong {

          display: block;

          color: white;

          font-size: 28px;

          line-height: 1;

          font-weight: 800;

        }


        .settings-hero-stat span {

          display: block;

          margin-top: 7px;

          color:
            rgba(255,255,255,.70);

          font-size: 11px;

          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing:
            .08em;

        }


        /* =====================================
           MAIN PANEL
        ===================================== */

        .settings-panel {

          overflow: hidden;

          padding: 28px;

          border:
            1px solid
            #e9ecf4;

          border-radius: 23px;

          background:
            rgba(255,255,255,.97);

          box-shadow:
            0 20px 50px
            rgba(35, 43, 90, .07);

        }


        .settings-panel-heading {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 22px;

        }


        .settings-panel-heading-left {

          display: flex;

          align-items: center;

          gap: 14px;

        }


        .settings-panel-icon {

          width: 46px;

          height: 46px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          color: #5d59ee;

          background:
            linear-gradient(
              145deg,
              #ececff,
              #f3f6ff
            );

          border:
            1px solid
            #e5e4ff;

        }


        .settings-panel-title {

          margin: 0;

          color: #182230;

          font-size: 17px;

          font-weight: 800;

        }


        .settings-panel-description {

          margin:
            5px 0 0;

          color: #98a2b3;

          font-size: 12px;

          line-height: 1.5;

        }


        .settings-count {

          color: #6759ed;

          font-size: 12px;

          font-weight: 700;

          padding:
            7px 10px;

          border-radius: 999px;

          background:
            #f2f1ff;

        }


        /* =====================================
           SETTING CARDS
        ===================================== */

        .settings-grid {

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 15px;

        }


        .setting-card {

          position: relative;

          min-height: 215px;

          overflow: hidden;

          padding: 20px;

          display: flex;

          flex-direction: column;

          justify-content:
            space-between;

          border-radius: 18px;

          border:
            1px solid
            #e9ecf4;

          background:
            linear-gradient(
              145deg,
              #fbfbff,
              #ffffff
            );

          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease;

        }


        .setting-card:hover {

          transform:
            translateY(-3px);

          border-color:
            #dcd8ff;

          box-shadow:
            0 14px 30px
            rgba(74, 65, 185, .08);

        }


        .setting-card.enabled {

          border-color:
            #dcd9ff;

          background:

            radial-gradient(
              circle at top right,
              rgba(102, 86, 238, .07),
              transparent 40%
            ),

            linear-gradient(
              145deg,
              #fbfbff,
              #ffffff
            );

        }


        .setting-card-top {

          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 12px;

        }


        .setting-icon-box {

          width: 48px;

          height: 48px;

          display: flex;

          align-items: center;

          justify-content:
            center;

          border-radius: 14px;

          color: #5b5ff0;

          background:
            linear-gradient(
              145deg,
              #eeefff,
              #f3f6ff
            );

          border:
            1px solid
            #e4e5ff;

        }


        .setting-card-status {

          display: inline-flex;

          align-items: center;

          gap: 5px;

          padding:
            6px 8px;

          border-radius:
            999px;

          font-size: 10px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing:
            .06em;

        }


        .setting-card-status.on {

          color: #047857;

          background:
            #ecfdf5;

        }


        .setting-card-status.off {

          color: #7b879d;

          background:
            #f2f4f7;

        }


        .setting-status-dot {

          width: 5px;

          height: 5px;

          border-radius: 50%;

          background:
            currentColor;

        }


        .setting-card-title {

          margin:
            17px 0 0;

          color: #182230;

          font-size: 15px;

          font-weight: 800;

          line-height: 1.35;

        }


        .setting-card-description {

          margin:
            7px 0 0;

          min-height: 46px;

          color: #8c97aa;

          font-size: 12px;

          line-height: 1.55;

        }


        .setting-card-bottom {

          margin-top: 18px;

          padding-top: 16px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          border-top:
            1px solid #edf0f5;

        }


        .setting-card-bottom span {

          color: #98a2b3;

          font-size: 11px;

          font-weight: 600;

        }


        /* =====================================
           MODERN TOGGLE
        ===================================== */

        .modern-toggle {

          position: relative;

          width: 52px;

          height: 29px;

          flex-shrink: 0;

          padding: 3px;

          border: none;

          border-radius: 999px;

          cursor: pointer;

          transition:
            all .22s ease;

        }


        .modern-toggle.enabled {

          background:
            linear-gradient(
              100deg,
              #5d4ef0,
              #557af0
            );

          box-shadow:
            0 6px 16px
            rgba(89, 81, 236, .25);

        }


        .modern-toggle.disabled {

          background: #dce1ea;

        }


        .modern-toggle-circle {

          display: block;

          width: 23px;

          height: 23px;

          border-radius: 50%;

          background: white;

          box-shadow:
            0 2px 5px
            rgba(18, 28, 55, .18);

          transition:
            transform .22s ease;

        }


        .modern-toggle.enabled
        .modern-toggle-circle {

          transform:
            translateX(23px);

        }


        /* =====================================
           SAVE AREA
        ===================================== */

        .settings-save-area {

          margin-top: 23px;

          padding-top: 20px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          border-top:
            1px solid #edf0f5;

        }


        .settings-security {

          display: flex;

          align-items: center;

          gap: 10px;

          color: #8490a4;

          font-size: 12px;

          line-height: 1.5;

        }


        .settings-security-icon {

          width: 34px;

          height: 34px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          color: #5b57eb;

          background: #efefff;

          border-radius: 10px;

        }


        .settings-save-button {

          min-width: 155px;

          min-height: 45px;

          padding:
            0 18px;

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
            transform .2s ease,
            box-shadow .2s ease,
            opacity .2s ease;

        }


        .settings-save-button:hover {

          transform:
            translateY(-1px);

          box-shadow:
            0 14px 28px
            rgba(86, 74, 224, .27);

        }


        .settings-save-button:disabled {

          opacity: .65;

          cursor: not-allowed;

          transform: none;

        }


        .spin-icon {

          animation:
            settingsSpin
            .8s linear infinite;

        }


        /* =====================================
           MESSAGES
        ===================================== */

        .settings-message {

          margin-bottom: 18px;

          padding:
            12px 14px;

          display: flex;

          align-items: center;

          gap: 9px;

          border-radius: 12px;

          font-size: 12px;

          font-weight: 600;

        }


        .settings-message.error {

          color: #c33c3c;

          background: #fff2f2;

          border:
            1px solid #fee2e2;

        }


        .settings-message.success {

          color: #047857;

          background: #ecfdf5;

          border:
            1px solid #d1fae5;

        }


        /* =====================================
           LOADING
        ===================================== */

        .settings-loading {

          min-height: 260px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 12px;

          color: #8490a4;

          font-size: 13px;

        }


        .settings-loading-ring {

          width: 28px;

          height: 28px;

          border-radius: 50%;

          border:
            3px solid #ececf5;

          border-top-color:
            #6255ed;

          animation:
            settingsSpin
            .8s linear infinite;

        }


        @keyframes settingsSpin {

          to {

            transform:
              rotate(360deg);

          }

        }


        /* =====================================
           RESPONSIVE
        ===================================== */

        @media (max-width: 1000px) {

          .settings-grid {

            grid-template-columns:
              1fr;

          }


          .setting-card {

            min-height: auto;

          }

        }


        @media (max-width: 760px) {

          .student-settings-page {

            padding:
              30px 22px 48px;

          }


          .settings-page-header {

            align-items:
              flex-start;

            flex-direction:
              column;

          }


          .settings-page-title {

            font-size: 28px;

          }


          .settings-hero {

            padding: 26px;

            align-items:
              flex-start;

            flex-direction:
              column;

          }


          .settings-hero-stat {

            width: 100%;

          }


          .settings-panel {

            padding: 21px;

          }


          .settings-panel-heading {

            align-items:
              flex-start;

            flex-direction:
              column;

          }


          .settings-save-area {

            align-items:
              stretch;

            flex-direction:
              column;

          }


          .settings-save-button {

            width: 100%;

          }

        }


        @media (max-width: 480px) {

          .settings-hero-left {

            align-items:
              flex-start;

            flex-direction:
              column;

          }

        }

      `}</style>


      <div className="student-settings-page">


        {/* ====================================
            PAGE HEADER
        ==================================== */}

        <div className="settings-page-header">

          <div>

            <div className="settings-eyebrow">

              <Sparkles size={13} />

              Personalize your experience

            </div>


            <h1 className="settings-page-title">

              Settings

            </h1>


            <p className="settings-page-subtitle">

              Choose how CampusLearn keeps
              you informed about your studies.

            </p>

          </div>


          <div className="settings-status-badge">

            <SlidersHorizontal
              size={14}
            />

            Student Preferences

          </div>

        </div>


        {/* ====================================
            HERO
        ==================================== */}

        <div className="settings-hero">

          <div className="settings-hero-grid" />


          <div
            className="
              settings-orb
              settings-orb-one
            "
          />


          <div
            className="
              settings-orb
              settings-orb-two
            "
          />


          <div className="settings-hero-left">

            <div className="settings-hero-icon">

              <Bell size={30} />

            </div>


            <div>

              <h2 className="settings-hero-title">

                Stay connected,
                your way.

              </h2>


              <p className="settings-hero-copy">

                Control the notifications
                and academic reminders you
                receive while using
                CampusLearn.

              </p>

            </div>

          </div>


          <div className="settings-hero-stat">

            <strong>

              {enabledCount}/3

            </strong>


            <span>

              Preferences Enabled

            </span>

          </div>

        </div>


        {/* ====================================
            ERROR
        ==================================== */}

        {error && (

          <div className="settings-message error">

            {error}

          </div>

        )}


        {/* ====================================
            SUCCESS
        ==================================== */}

        {success && (

          <div className="settings-message success">

            <CheckCircle2
              size={16}
            />

            {success}

          </div>

        )}


        {/* ====================================
            SETTINGS PANEL
        ==================================== */}

        <div className="settings-panel">


          <div className="settings-panel-heading">

            <div className="settings-panel-heading-left">

              <div className="settings-panel-icon">

                <Settings size={21} />

              </div>


              <div>

                <h2 className="settings-panel-title">

                  Notification Preferences

                </h2>


                <p className="settings-panel-description">

                  Fine-tune the academic
                  alerts you want to receive.

                </p>

              </div>

            </div>


            {!loading && (

              <div className="settings-count">

                {enabledCount} active

              </div>

            )}

          </div>


          {loading ? (

            <div className="settings-loading">

              <div className="settings-loading-ring" />

              Loading your preferences...

            </div>

          ) : (

            <>


              <div className="settings-grid">


                {/* EMAIL */}

                <SettingCard

                  icon={
                    <Mail size={21} />
                  }

                  title="Email Notifications"

                  description="Receive important account and academic updates directly through your CampusLearn email."

                  enabled={
                    settings
                      .email_notifications
                  }

                  onToggle={() =>
                    toggleSetting(
                      "email_notifications"
                    )
                  }

                />


                {/* ASSIGNMENTS */}

                <SettingCard

                  icon={
                    <BellRing
                      size={21}
                    />
                  }

                  title="Assignment Updates"

                  description="Stay informed when assignments, submissions or important coursework updates are available."

                  enabled={
                    settings
                      .submission_alerts
                  }

                  onToggle={() =>
                    toggleSetting(
                      "submission_alerts"
                    )
                  }

                />


                {/* REMINDERS */}

                <SettingCard

                  icon={
                    <CalendarClock
                      size={21}
                    />
                  }

                  title="Academic Reminders"

                  description="Get helpful reminders about upcoming deadlines, academic tasks and important study dates."

                  enabled={
                    settings
                      .academic_reminders
                  }

                  onToggle={() =>
                    toggleSetting(
                      "academic_reminders"
                    )
                  }

                />

              </div>


              {/* ====================================
                  SAVE AREA
              ==================================== */}

              <div className="settings-save-area">


                <div className="settings-security">

                  <div className="settings-security-icon">

                    <ShieldCheck
                      size={17}
                    />

                  </div>


                  <span>

                    Your preferences are
                    securely saved to your
                    CampusLearn account.

                  </span>

                </div>


                <button

                  type="button"

                  className="settings-save-button"

                  onClick={
                    saveSettings
                  }

                  disabled={
                    saving
                  }

                >

                  {saving ? (

                    <>

                      <LoaderCircle
                        size={16}
                        className="spin-icon"
                      />

                      Saving...

                    </>

                  ) : (

                    <>

                      <Save size={16} />

                      Save Preferences

                    </>

                  )}

                </button>

              </div>

            </>

          )}

        </div>

      </div>

    </>

  );

}


/* ========================================
   SETTING CARD
======================================== */

function SettingCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
}) {

  return (

    <div

      className={
        enabled
          ? "setting-card enabled"
          : "setting-card"
      }

    >

      <div>


        <div className="setting-card-top">

          <div className="setting-icon-box">

            {icon}

          </div>


          <div

            className={
              enabled
                ? "setting-card-status on"
                : "setting-card-status off"
            }

          >

            <span className="setting-status-dot" />

            {enabled
              ? "Enabled"
              : "Off"}

          </div>

        </div>


        <h3 className="setting-card-title">

          {title}

        </h3>


        <p className="setting-card-description">

          {description}

        </p>

      </div>


      <div className="setting-card-bottom">

        <span>

          {enabled
            ? "Notifications active"
            : "Notifications paused"}

        </span>


        <button

          type="button"

          className={
            enabled
              ? "modern-toggle enabled"
              : "modern-toggle disabled"
          }

          onClick={onToggle}

          aria-label={
            `Toggle ${title}`
          }

          aria-pressed={
            enabled
          }

        >

          <span className="modern-toggle-circle" />

        </button>

      </div>

    </div>

  );

}


export default StudentSettings;