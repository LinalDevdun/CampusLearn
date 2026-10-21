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
  Bell,
  ShieldCheck,
  Database,
  Save,
  Mail,
  School,
  CalendarDays,
  LockKeyhole,
  KeyRound,
  Sparkles,
  Activity,
  CheckCircle2,
  TriangleAlert,
  Eye,
  EyeOff,
} from "lucide-react";

import "../styles/adminSettings.css";


function AdminSettings() {

  const navigate =
    useNavigate();


  /* ========================================
     SYSTEM SETTINGS
  ======================================== */

  const [
    settings,
    setSettings,
  ] = useState({

    systemName: "",
    contactEmail: "",
    semester: "Semester 1",
    academicYear: "2026",
    emailNotifications: true,
    assignmentAlerts: true,
    maintenanceMode: false,

  });


  /* ========================================
     PASSWORD FORM
  ======================================== */

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({

    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

  });


  /* ========================================
     PASSWORD VISIBILITY
  ======================================== */

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);


  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  /* ========================================
     PAGE STATE
  ======================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    messageType,
    setMessageType,
  ] = useState("success");


  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");


  const [
    passwordMessageType,
    setPasswordMessageType,
  ] = useState("success");


  /* ========================================
     LOAD SETTINGS
  ======================================== */

  useEffect(() => {

    const loadSettings =
      async () => {

        try {

          setLoading(true);

          setMessage("");


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
              "http://localhost:5000/admin/settings",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const data =
            response.data;


          setSettings({

            systemName:
              data.system_name ||
              "",

            contactEmail:
              data.contact_email ||
              "",

            semester:
              data.current_semester ||
              "Semester 1",

            academicYear:
              data.academic_year ||
              "2026",

            emailNotifications:
              data.email_notifications ===
              true,

            assignmentAlerts:
              data.assignment_alerts ===
              true,

            maintenanceMode:
              data.maintenance_mode ===
              true,

          });


        } catch (error) {

          console.error(
            "Load Settings Error:",
            error
          );


          if (
            error.response?.status ===
              401 ||
            error.response?.status ===
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


          setMessageType(
            "error"
          );


          setMessage(
            error.response?.data
              ?.error ||
            "Failed to load system settings."
          );


        } finally {

          setLoading(false);

        }

      };


    loadSettings();

  }, [navigate]);


  /* ========================================
     SETTINGS INPUT CHANGE
  ======================================== */

  const handleChange =
    (event) => {

      const {
        name,
        value,
        type,
        checked,
      } = event.target;


      setSettings(
        (previousSettings) => ({

          ...previousSettings,

          [name]:
            type ===
            "checkbox"
              ? checked
              : value,

        })
      );


      setMessage("");

    };


  /* ========================================
     PASSWORD INPUT CHANGE
  ======================================== */

  const handlePasswordChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setPasswordForm(
        (previousForm) => ({

          ...previousForm,

          [name]:
            value,

        })
      );


      setPasswordMessage("");

    };


  /* ========================================
     SAVE SYSTEM SETTINGS
  ======================================== */

  const handleSave =
    async () => {

      if (
        !settings.systemName.trim()
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "System name is required."
        );

        return;

      }


      if (
        !settings.contactEmail.trim()
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "System contact email is required."
        );

        return;

      }


      if (
        !settings.semester
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "Please select a semester."
        );

        return;

      }


      if (
        !settings.academicYear
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "Please select an academic year."
        );

        return;

      }


      try {

        setSaving(true);

        setMessage("");


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
            "http://localhost:5000/admin/settings",

            {

              systemName:
                settings.systemName,

              contactEmail:
                settings.contactEmail,

              semester:
                settings.semester,

              academicYear:
                settings.academicYear,

              emailNotifications:
                settings.emailNotifications,

              assignmentAlerts:
                settings.assignmentAlerts,

              maintenanceMode:
                settings.maintenanceMode,

            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const saved =
          response.data.settings;


        setSettings({

          systemName:
            saved.system_name,

          contactEmail:
            saved.contact_email,

          semester:
            saved.current_semester,

          academicYear:
            saved.academic_year,

          emailNotifications:
            saved.email_notifications ===
            true,

          assignmentAlerts:
            saved.assignment_alerts ===
            true,

          maintenanceMode:
            saved.maintenance_mode ===
            true,

        });


        setMessageType(
          "success"
        );


        setMessage(
          "Settings saved successfully!"
        );


      } catch (error) {

        console.error(
          "Save Settings Error:",
          error
        );


        if (
          error.response?.status ===
            401 ||
          error.response?.status ===
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


        setMessageType(
          "error"
        );


        setMessage(
          error.response?.data
            ?.error ||
          "Failed to save system settings."
        );


      } finally {

        setSaving(false);

      }

    };


  /* ========================================
     CHANGE ADMIN PASSWORD
  ======================================== */

  const handleChangePassword =
    async (event) => {

      event.preventDefault();


      if (
        !passwordForm.currentPassword
      ) {

        setPasswordMessageType(
          "error"
        );

        setPasswordMessage(
          "Please enter your current password."
        );

        return;

      }


      if (
        !passwordForm.newPassword
      ) {

        setPasswordMessageType(
          "error"
        );

        setPasswordMessage(
          "Please enter a new password."
        );

        return;

      }


      if (
        passwordForm.newPassword
          .length < 6
      ) {

        setPasswordMessageType(
          "error"
        );

        setPasswordMessage(
          "New password must contain at least 6 characters."
        );

        return;

      }


      if (
        passwordForm.currentPassword ===
        passwordForm.newPassword
      ) {

        setPasswordMessageType(
          "error"
        );

        setPasswordMessage(
          "New password must be different from your current password."
        );

        return;

      }


      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {

        setPasswordMessageType(
          "error"
        );

        setPasswordMessage(
          "New password and confirm password do not match."
        );

        return;

      }


      try {

        setChangingPassword(
          true
        );

        setPasswordMessage("");


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        await axios.put(
          "http://localhost:5000/admin/change-password",

          {

            currentPassword:
              passwordForm.currentPassword,

            newPassword:
              passwordForm.newPassword,

          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setPasswordForm({

          currentPassword: "",
          newPassword: "",
          confirmPassword: "",

        });


        setPasswordMessageType(
          "success"
        );


        setPasswordMessage(
          "Password changed successfully! Redirecting to login..."
        );


        setTimeout(() => {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "role"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");

        }, 1500);


      } catch (error) {

        console.error(
          "Change Password Error:",
          error
        );


        if (
          error.response?.status ===
            401 ||
          error.response?.status ===
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


        setPasswordMessageType(
          "error"
        );


        setPasswordMessage(
          error.response?.data
            ?.error ||
          "Failed to change password."
        );


      } finally {

        setChangingPassword(
          false
        );

      }

    };


  /* ========================================
     PASSWORD STRENGTH
  ======================================== */

  const passwordChecks = {

    length:
      passwordForm
        .newPassword
        .length >= 6,

    uppercase:
      /[A-Z]/.test(
        passwordForm
          .newPassword
      ),

    number:
      /[0-9]/.test(
        passwordForm
          .newPassword
      ),

    symbol:
      /[^A-Za-z0-9]/.test(
        passwordForm
          .newPassword
      ),

  };


  const strengthScore =
    Object.values(
      passwordChecks
    ).filter(Boolean).length;


  const strengthLabels = [
    "Waiting",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="admin-settings-page">

        <div className="aset-page-state">

          <div className="aset-spinner" />

          <h3>
            Loading system controls
          </h3>

          <p>
            Getting CampusLearn settings
            from PostgreSQL.
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="admin-settings-page">


      {/* ====================================
          HEADER
      ==================================== */}

      <section className="aset-page-header">


        <div>


          <div className="aset-eyebrow">

            <Sparkles size={12} />

            ADMIN CONTROL CENTER

          </div>


          <h1>
            System Settings
          </h1>


          <p>
            Configure the CampusLearn
            environment, academic cycle,
            alerts and security.
          </p>


        </div>


        <button
          type="button"
          className="aset-save-top"
          onClick={
            handleSave
          }
          disabled={
            saving
          }
        >

          <Save size={15} />

          {saving
            ? "Saving..."
            : "Save Changes"}

        </button>


      </section>


      {/* ====================================
          MESSAGE
      ==================================== */}

      {message && (

        <div
          className={
            messageType ===
            "success"
              ? "aset-message aset-message-success"
              : "aset-message aset-message-error"
          }
        >

          {messageType ===
          "success" ? (

            <CheckCircle2
              size={16}
            />

          ) : (

            <TriangleAlert
              size={16}
            />

          )}

          <span>
            {message}
          </span>

        </div>

      )}


      {/* ====================================
          CONTROL HERO
      ==================================== */}

      <section className="aset-control-hero">


        <div className="aset-control-main">


          <div className="aset-control-kicker">

            <Settings size={13} />

            LIVE SYSTEM CONFIGURATION

          </div>


          <h2>

            {settings.systemName ||
              "CampusLearn"}

          </h2>


          <p>

            Central administration
            workspace for your university
            learning environment.

          </p>


          <div className="aset-control-tags">


            <span>

              <CalendarDays
                size={12}
              />

              {settings.semester}

            </span>


            <span>

              <GraduationCapIcon />

              Academic Year{" "}
              {settings.academicYear}

            </span>


            <span>

              <Mail size={12} />

              {
                settings.contactEmail ||
                "No contact email"
              }

            </span>


          </div>


        </div>


        {/* ENVIRONMENT STATUS */}

        <div className="aset-environment">


          <div className="aset-environment-top">

            <div>

              <span>
                ENVIRONMENT STATUS
              </span>

              <strong>
                Operational
              </strong>

            </div>


            <div className="aset-environment-icon">

              <Activity size={19} />

            </div>

          </div>


          <EnvironmentRow
            label="Authentication"
            value="Active"
            active
          />


          <EnvironmentRow
            label="PostgreSQL"
            value="Connected"
            active
          />


          <EnvironmentRow
            label="Maintenance"
            value={
              settings
                .maintenanceMode
                ? "Enabled"
                : "Off"
            }
            warning={
              settings
                .maintenanceMode
            }
          />


        </div>


      </section>


      {/* ====================================
          CONFIGURATION CANVAS
      ==================================== */}

      <section className="aset-config-grid">


        {/* GENERAL */}

        <div className="aset-workspace-card">


          <div className="aset-workspace-header">


            <div className="aset-icon aset-teal">

              <Settings size={20} />

            </div>


            <div>

              <span>
                PLATFORM IDENTITY
              </span>

              <h2>
                General Configuration
              </h2>

              <p>
                Core system identity and
                administration contact.
              </p>

            </div>


          </div>


          <div className="aset-form-group">

            <label>
              System Name
            </label>


            <div className="aset-input">

              <School size={16} />

              <input
                type="text"
                name="systemName"
                value={
                  settings.systemName
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
                placeholder="CampusLearn"
              />

            </div>

          </div>


          <div className="aset-form-group">

            <label>
              System Contact Email
            </label>


            <div className="aset-input">

              <Mail size={16} />

              <input
                type="email"
                name="contactEmail"
                value={
                  settings.contactEmail
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
                placeholder="admin@campuslearn.lk"
              />

            </div>

          </div>


          <div className="aset-workspace-footer">

            <span>
              Public system identity
            </span>

            <CheckCircle2
              size={14}
            />

          </div>


        </div>


        {/* ACADEMIC */}

        <div className="aset-workspace-card">


          <div className="aset-workspace-header">


            <div className="aset-icon aset-purple">

              <CalendarDays
                size={20}
              />

            </div>


            <div>

              <span>
                ACADEMIC CYCLE
              </span>

              <h2>
                Academic Period
              </h2>

              <p>
                Define the semester and
                academic year currently in
                operation.
              </p>

            </div>


          </div>


          <div className="aset-academic-display">


            <div>

              <span>
                CURRENT PERIOD
              </span>

              <strong>
                {settings.semester}
              </strong>

            </div>


            <div className="aset-period-divider" />


            <div>

              <span>
                ACADEMIC YEAR
              </span>

              <strong>
                {settings.academicYear}
              </strong>

            </div>


          </div>


          <div className="aset-form-row">


            <div className="aset-form-group">

              <label>
                Current Semester
              </label>

              <select
                name="semester"
                value={
                  settings.semester
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
              >

                <option value="Semester 1">
                  Semester 1
                </option>

                <option value="Semester 2">
                  Semester 2
                </option>

              </select>

            </div>


            <div className="aset-form-group">

              <label>
                Academic Year
              </label>

              <select
                name="academicYear"
                value={
                  settings.academicYear
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
              >

                <option value="2026">
                  2026
                </option>

                <option value="2027">
                  2027
                </option>

                <option value="2028">
                  2028
                </option>

                <option value="2029">
                  2029
                </option>

                <option value="2030">
                  2030
                </option>

              </select>

            </div>


          </div>


        </div>


      </section>


      {/* ====================================
          OPERATIONS
      ==================================== */}

      <section className="aset-operations-grid">


        {/* NOTIFICATIONS */}

        <div className="aset-operation-card">


          <div className="aset-operation-heading">


            <div className="aset-icon aset-blue">

              <Bell size={20} />

            </div>


            <div>

              <span>
                COMMUNICATION CONTROL
              </span>

              <h2>
                Notification Routing
              </h2>

              <p>
                Decide which platform
                events produce alerts.
              </p>

            </div>


          </div>


          <ToggleSetting
            title="Email Notifications"
            description="Send important CampusLearn system updates by email."
            name="emailNotifications"
            checked={
              settings
                .emailNotifications
            }
            onChange={
              handleChange
            }
            disabled={
              saving
            }
          />


          <ToggleSetting
            title="Assignment Alerts"
            description="Notify users about assignment and coursework activity."
            name="assignmentAlerts"
            checked={
              settings
                .assignmentAlerts
            }
            onChange={
              handleChange
            }
            disabled={
              saving
            }
          />


        </div>


        {/* SECURITY */}

        <div className="aset-operation-card">


          <div className="aset-operation-heading">


            <div className="aset-icon aset-orange">

              <ShieldCheck
                size={20}
              />

            </div>


            <div>

              <span>
                PLATFORM SECURITY
              </span>

              <h2>
                Security & Availability
              </h2>

              <p>
                Review infrastructure and
                control platform access.
              </p>

            </div>


          </div>


          <div className="aset-security-row">


            <div className="aset-security-symbol">

              <LockKeyhole
                size={17}
              />

            </div>


            <div>

              <strong>
                JWT Authentication
              </strong>

              <span>
                Role-based authentication
                is enabled.
              </span>

            </div>


            <span className="aset-status">

              Active

            </span>


          </div>


          <div className="aset-security-row">


            <div className="aset-security-symbol">

              <Database
                size={17}
              />

            </div>


            <div>

              <strong>
                PostgreSQL Database
              </strong>

              <span>
                Primary application database
                is available.
              </span>

            </div>


            <span className="aset-status">

              Connected

            </span>


          </div>


          <div
            className={
              settings
                .maintenanceMode
                ? "aset-maintenance-control aset-maintenance-active"
                : "aset-maintenance-control"
            }
          >


            <div>


              <div className="aset-maintenance-label">

                <TriangleAlert
                  size={16}
                />

                <strong>
                  Maintenance Mode
                </strong>

              </div>


              <p>
                Temporarily restrict normal
                users from accessing
                CampusLearn.
              </p>


            </div>


            <label className="aset-switch">

              <input
                type="checkbox"
                name="maintenanceMode"
                checked={
                  settings
                    .maintenanceMode
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
              />

              <span />

            </label>


          </div>


        </div>


      </section>


      {/* ====================================
          ADMIN PASSWORD VAULT
      ==================================== */}

      <section className="aset-password-vault">


        <div className="aset-vault-left">


          <div className="aset-vault-heading">


            <div className="aset-vault-icon">

              <KeyRound size={21} />

            </div>


            <div>

              <span>
                ADMIN CREDENTIAL VAULT
              </span>

              <h2>
                Change Administrator Password
              </h2>

              <p>
                Update the password used to
                access this administrator
                account.
              </p>

            </div>


          </div>


          {passwordMessage && (

            <div
              className={
                passwordMessageType ===
                "success"
                  ? "aset-message aset-message-success"
                  : "aset-message aset-message-error"
              }
            >

              {passwordMessageType ===
              "success" ? (

                <CheckCircle2
                  size={15}
                />

              ) : (

                <TriangleAlert
                  size={15}
                />

              )}

              <span>
                {passwordMessage}
              </span>

            </div>

          )}


          <form
            className="aset-password-form"
            onSubmit={
              handleChangePassword
            }
          >


            {/* CURRENT */}

            <div className="aset-form-group">

              <label>
                Current Password
              </label>


              <PasswordField
                icon={
                  <LockKeyhole
                    size={16}
                  />
                }
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={
                  passwordForm
                    .currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={
                  changingPassword
                }
                visible={
                  showCurrentPassword
                }
                onToggle={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
              />

            </div>


            {/* NEW */}

            <div className="aset-form-group">

              <label>
                New Password
              </label>


              <PasswordField
                icon={
                  <KeyRound
                    size={16}
                  />
                }
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                name="newPassword"
                value={
                  passwordForm
                    .newPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={
                  changingPassword
                }
                visible={
                  showNewPassword
                }
                onToggle={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
              />

            </div>


            {/* CONFIRM */}

            <div className="aset-form-group">

              <label>
                Confirm New Password
              </label>


              <PasswordField
                icon={
                  <ShieldCheck
                    size={16}
                  />
                }
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  passwordForm
                    .confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Re-enter new password"
                autoComplete="new-password"
                disabled={
                  changingPassword
                }
                visible={
                  showConfirmPassword
                }
                onToggle={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              />

            </div>


            <div className="aset-password-action">

              <button
                type="submit"
                className="aset-change-password"
                disabled={
                  changingPassword
                }
              >

                <KeyRound size={15} />

                {changingPassword
                  ? "Changing..."
                  : "Change Password"}

              </button>

            </div>


          </form>


        </div>


        {/* PASSWORD HEALTH */}

        <aside className="aset-password-health">


          <div className="aset-health-shield">

            <ShieldCheck size={24} />

          </div>


          <span>
            PASSWORD HEALTH
          </span>


          <h3>
            Build a secure password
          </h3>


          <p>
            Use a stronger password to
            protect administrative access
            and CampusLearn system data.
          </p>


          <div className="aset-strength-box">


            <div className="aset-strength-heading">

              <span>
                Password strength
              </span>

              <strong>

                {
                  strengthLabels[
                    strengthScore
                  ]
                }

              </strong>

            </div>


            <div className="aset-strength-bars">


              {[1, 2, 3, 4].map(
                (level) => (

                  <i
                    key={level}
                    className={
                      strengthScore >=
                      level
                        ? "aset-strength-active"
                        : ""
                    }
                  />

                )
              )}


            </div>


          </div>


          <PasswordRule
            active={
              passwordChecks.length
            }
            text="At least 6 characters"
          />


          <PasswordRule
            active={
              passwordChecks.uppercase
            }
            text="Contains an uppercase letter"
          />


          <PasswordRule
            active={
              passwordChecks.number
            }
            text="Contains a number"
          />


          <PasswordRule
            active={
              passwordChecks.symbol
            }
            text="Contains a symbol"
          />


          <div className="aset-logout-note">

            <LockKeyhole
              size={15}
            />

            <span>
              After changing the password,
              you will be signed out and
              asked to log in again.
            </span>

          </div>


        </aside>


      </section>


    </div>

  );

}


/* ========================================
   SMALL GRADUATION ICON
======================================== */

function GraduationCapIcon() {

  return (

    <School size={12} />

  );

}


/* ========================================
   ENVIRONMENT ROW
======================================== */

function EnvironmentRow({
  label,
  value,
  active = false,
  warning = false,
}) {

  return (

    <div className="aset-environment-row">


      <div
        className={
          warning
            ? "aset-status-dot aset-status-dot-warning"
            : active
              ? "aset-status-dot aset-status-dot-active"
              : "aset-status-dot"
        }
      />


      <span>
        {label}
      </span>


      <strong
        className={
          warning
            ? "aset-environment-warning"
            : ""
        }
      >

        {value}

      </strong>


    </div>

  );

}


/* ========================================
   TOGGLE SETTING
======================================== */

function ToggleSetting({
  title,
  description,
  name,
  checked,
  onChange,
  disabled,
}) {

  return (

    <div className="aset-toggle-card">


      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <label className="aset-switch">

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />

        <span />

      </label>


    </div>

  );

}


/* ========================================
   PASSWORD FIELD
======================================== */

function PasswordField({
  icon,
  type,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  visible,
  onToggle,
}) {

  return (

    <div className="aset-password-input">


      <span className="aset-password-field-icon">

        {icon}

      </span>


      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
      />


      <button
        type="button"
        className="aset-eye-button"
        onClick={onToggle}
        tabIndex={-1}
      >

        {visible ? (
          <EyeOff size={16} />
        ) : (
          <Eye size={16} />
        )}

      </button>


    </div>

  );

}


/* ========================================
   PASSWORD RULE
======================================== */

function PasswordRule({
  active,
  text,
}) {

  return (

    <div
      className={
        active
          ? "aset-password-rule aset-password-rule-active"
          : "aset-password-rule"
      }
    >

      <span>

        {active && (
          <CheckCircle2
            size={13}
          />
        )}

      </span>

      <p>
        {text}
      </p>

    </div>

  );

}


export default AdminSettings;