import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Settings2,
  Mail,
  BellRing,
  CalendarClock,
  Save,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import "../styles/lecturerSettings.css";

import API_BASE_URL from "../config/api";


function LecturerSettings() {

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


  /* ========================================
     LOAD SETTINGS
  ======================================== */

  useEffect(() => {

    const loadSettings =
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


          alert(
            error.response?.data?.error ||
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

  const toggleSetting =
    (settingName) => {

      setSettings(
        (previous) => ({
          ...previous,

          [settingName]:
            !previous[settingName],
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


        alert(
          response.data?.message ||
          "Settings saved successfully!"
        );


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


        alert(
          error.response?.data?.error ||
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
    Object.values(
      settings
    ).filter(Boolean).length;


  return (

    <div className="lecturer-settings-page">


      {/* ====================================
          HERO
      ==================================== */}

      <section className="lset-hero">


        <div className="lset-hero-content">


          <div className="lset-hero-icon">

            <Settings2 size={24} />

          </div>


          <div>

            <div className="lset-eyebrow">

              <Sparkles size={12} />

              LECTURER PREFERENCES

            </div>


            <h1>
              Settings
            </h1>


            <p>
              Control how CampusLearn keeps
              you informed about teaching,
              submissions and academic tasks.
            </p>

          </div>


        </div>


        {/* STATUS CARD */}

        <div className="lset-status-card">


          <div className="lset-status-top">

            <div className="lset-status-icon">

              <ShieldCheck size={19} />

            </div>


            <div>

              <span>
                NOTIFICATION STATUS
              </span>

              <strong>
                Preferences Active
              </strong>

            </div>

          </div>


          <div className="lset-status-count">

            <strong>
              {enabledCount}
            </strong>

            <span>
              / 3 enabled
            </span>

          </div>


          <div className="lset-status-track">

            <div
              className="lset-status-fill"
              style={{
                width:
                  `${(enabledCount / 3) * 100}%`,
              }}
            />

          </div>


        </div>


      </section>


      {/* ====================================
          SETTINGS WORKSPACE
      ==================================== */}

      <section className="lset-workspace">


        {/* WORKSPACE HEADER */}

        <div className="lset-workspace-header">


          <div>


            <span>
              COMMUNICATION CENTER
            </span>


            <h2>
              Notification Preferences
            </h2>


            <p>
              Choose which updates you want
              CampusLearn to send you.
            </p>


          </div>


          <div className="lset-live-badge">

            <CheckCircle2 size={15} />

            Saved to your account

          </div>


        </div>


        {/* ==================================
            CONTENT
        ================================== */}

        {loading ? (

          <div className="lset-loading">


            <div className="lset-spinner" />


            <span>
              Loading your preferences...
            </span>


          </div>

        ) : (

          <div className="lset-preference-grid">


            {/* EMAIL */}

            <PreferenceCard
              icon={
                <Mail size={21} />
              }
              category="ACCOUNT"
              title="Email Notifications"
              description="Receive important CampusLearn account and teaching updates by email."
              enabled={
                settings.email_notifications
              }
              onToggle={() =>
                toggleSetting(
                  "email_notifications"
                )
              }
              className="lset-email-card"
            />


            {/* SUBMISSIONS */}

            <PreferenceCard
              icon={
                <BellRing size={21} />
              }
              category="COURSEWORK"
              title="Submission Alerts"
              description="Get notified when students submit coursework for your modules."
              enabled={
                settings.submission_alerts
              }
              onToggle={() =>
                toggleSetting(
                  "submission_alerts"
                )
              }
              className="lset-submission-card"
            />


            {/* REMINDERS */}

            <PreferenceCard
              icon={
                <CalendarClock
                  size={21}
                />
              }
              category="ACADEMIC"
              title="Academic Reminders"
              description="Receive reminders about grading, deadlines and important academic tasks."
              enabled={
                settings.academic_reminders
              }
              onToggle={() =>
                toggleSetting(
                  "academic_reminders"
                )
              }
              className="lset-reminder-card"
            />


          </div>

        )}


        {/* ==================================
            SAVE AREA
        ================================== */}

        {!loading && (

          <div className="lset-save-area">


            <div className="lset-save-info">


              <div className="lset-save-info-icon">

                <ShieldCheck
                  size={17}
                />

              </div>


              <div>

                <strong>
                  Your preferences
                </strong>

                <span>
                  Changes will apply to your
                  Lecturer Portal account.
                </span>

              </div>


            </div>


            <button
              type="button"
              className="lset-save"
              onClick={
                saveSettings
              }
              disabled={saving}
            >

              <Save size={17} />


              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>


          </div>

        )}


      </section>


    </div>

  );

}


/* ========================================
   PREFERENCE CARD
======================================== */

function PreferenceCard({
  icon,
  category,
  title,
  description,
  enabled,
  onToggle,
  className,
}) {

  return (

    <article
      className={
        `lset-preference-card ${className} ${
          enabled
            ? "lset-preference-enabled"
            : ""
        }`
      }
    >


      {/* TOP */}

      <div className="lset-preference-top">


        <div className="lset-preference-icon">

          {icon}

        </div>


        <div
          className={
            enabled
              ? "lset-state-badge lset-state-on"
              : "lset-state-badge"
          }
        >

          <span />

          {enabled
            ? "Enabled"
            : "Disabled"}

        </div>


      </div>


      {/* TEXT */}

      <div className="lset-preference-content">


        <span className="lset-preference-category">

          {category}

        </span>


        <h3>
          {title}
        </h3>


        <p>
          {description}
        </p>


      </div>


      {/* FOOTER */}

      <div className="lset-preference-footer">


        <span>
          {enabled
            ? "Notifications are on"
            : "Notifications are off"}
        </span>


        <button
          type="button"
          className={
            enabled
              ? "lset-toggle lset-toggle-active"
              : "lset-toggle"
          }
          onClick={onToggle}
          aria-pressed={enabled}
          aria-label={
            `Toggle ${title}`
          }
        >

          <span />

        </button>


      </div>


    </article>

  );

}


export default LecturerSettings;