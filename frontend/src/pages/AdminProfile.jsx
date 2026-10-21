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
  Settings,
  KeyRound,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import "../styles/adminProfile.css";


function AdminProfile() {

  const navigate =
    useNavigate();


  const [
    admin,
    setAdmin,
  ] = useState({
    name: "",
    email: "",
    role: "ADMIN",
  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
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
              "http://localhost:5000/me",
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


          <div className="ap-avatar">

            {getInitials(
              admin.name
            )}

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