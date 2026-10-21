import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import API_BASE_URL from "../../config/api";


/* ========================================
   PROFILE IMAGE URL
======================================== */

const getProfileImageUrl = (
  profileImage
) => {

  if (!profileImage) {
    return "";
  }


  if (
    profileImage.startsWith(
      "http://"
    ) ||
    profileImage.startsWith(
      "https://"
    ) ||
    profileImage.startsWith(
      "data:"
    ) ||
    profileImage.startsWith(
      "blob:"
    )
  ) {

    return profileImage;

  }


  const cleanPath =
    profileImage
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");


  return `${API_BASE_URL}/${cleanPath}`;

};


function AdminSidebar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    admin,
    setAdmin,
  ] = useState({
    name: "Admin User",
    email: "",
    role: "ADMIN",
    profile_image: "",
  });


  /* ========================================
     GET LOGGED-IN ADMIN
  ======================================== */

  useEffect(() => {

    const fetchAdmin =
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


          setAdmin(
            response.data
          );


        } catch (error) {

          console.error(
            "Failed to load admin:",
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

          }

        }

      };


    fetchAdmin();

  }, [navigate]);


  /* ========================================
     LIVE PROFILE IMAGE UPDATE
  ======================================== */

  useEffect(() => {

    const handleProfileImageUpdate =
      (event) => {

        const updatedProfileImage =
          typeof event.detail ===
          "string"
            ? event.detail
            : event.detail
                ?.profile_image;


        if (
          updatedProfileImage ===
          undefined
        ) {

          return;

        }


        setAdmin(
          (previousAdmin) => ({

            ...previousAdmin,

            profile_image:
              updatedProfileImage,

          })
        );

      };


    window.addEventListener(
      "admin-profile-image-updated",
      handleProfileImageUpdate
    );


    return () => {

      window.removeEventListener(
        "admin-profile-image-updated",
        handleProfileImageUpdate
      );

    };

  }, []);


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


  const initials =
    getInitials(
      admin.name
    );


  const profileImageUrl =
    getProfileImageUrl(
      admin.profile_image
    );


  const getNavClass =
    (path) => {

      return location.pathname === path
        ? "admin-nav-item admin-nav-active"
        : "admin-nav-item";

    };


  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/login");

  };


  return (

    <aside className="admin-sidebar">


      <div className="admin-logo">

        <div className="admin-logo-icon">

          <ShieldCheck
            size={25}
            strokeWidth={2.3}
          />

        </div>


        <div>

          <div className="admin-logo-title">

            Campus<span>Learn</span>

          </div>


          <div className="admin-logo-subtitle">

            Admin Portal

          </div>

        </div>

      </div>


      <div className="admin-navigation">


        <p className="admin-section-label">

          MANAGEMENT

        </p>


        <nav className="admin-menu">


          <button
            className={
              getNavClass(
                "/admin-dashboard"
              )
            }
            onClick={() =>
              navigate(
                "/admin-dashboard"
              )
            }
          >

            <LayoutDashboard
              size={19}
            />

            Dashboard

          </button>


          <button
            className={
              getNavClass(
                "/admin-users"
              )
            }
            onClick={() =>
              navigate(
                "/admin-users"
              )
            }
          >

            <Users
              size={19}
            />

            User Management

          </button>


          <button
            className={
              getNavClass(
                "/admin/students"
              )
            }
            onClick={() =>
              navigate(
                "/admin/students"
              )
            }
          >

            <GraduationCap
              size={19}
            />

            Students

          </button>


          <button
            className={
              getNavClass(
                "/admin/courses"
              )
            }
            onClick={() =>
              navigate(
                "/admin/courses"
              )
            }
          >

            <BookOpen
              size={19}
            />

            Courses

          </button>

        </nav>


        <p className="admin-section-label admin-second-section">

          SYSTEM

        </p>


        <nav className="admin-menu">


          <button
            className={
              getNavClass(
                "/admin/reports"
              )
            }
            onClick={() =>
              navigate(
                "/admin/reports"
              )
            }
          >

            <BarChart3
              size={19}
            />

            Reports

          </button>


          <button
            className={
              getNavClass(
                "/admin/settings"
              )
            }
            onClick={() =>
              navigate(
                "/admin/settings"
              )
            }
          >

            <Settings
              size={19}
            />

            Settings

          </button>

        </nav>

      </div>


      <div className="admin-sidebar-bottom">


        <button
          className="admin-logout"
          onClick={
            handleLogout
          }
        >

          <LogOut
            size={19}
          />

          Log out

        </button>


        <div className="admin-user-card">

          <div
            className="admin-avatar"
            style={{
              position: "relative",
              overflow: "hidden",
            }}
          >

            <span>
              {initials}
            </span>


            {profileImageUrl && (

              <img
                src={profileImageUrl}
                alt={`${admin.name || "Administrator"} profile`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(event) => {

                  event.currentTarget.style.display =
                    "none";

                }}
              />

            )}

          </div>


          <div>

            <strong>
              {admin.name}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>

      </div>

    </aside>

  );

}


export default AdminSidebar;