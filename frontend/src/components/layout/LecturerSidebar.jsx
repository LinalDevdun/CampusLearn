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
  BookOpen,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Users,
  Sparkles,
  LogOut,
} from "lucide-react";

import API_BASE_URL from "../../config/api";


/* =========================================
   INITIALS
========================================= */

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


/* =========================================
   PROFILE IMAGE URL
========================================= */

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


function LecturerSidebar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================
     LECTURER DATA
  ======================================== */

  const [
    lecturer,
    setLecturer,
  ] = useState({

    name: "Lecturer User",
    email: "",
    role: "LECTURER",
    profile_image: "",

  });


  /* ========================================
     GET LOGGED-IN LECTURER
  ======================================== */

  useEffect(() => {

    const fetchLecturer =
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


        } catch (error) {

          console.error(
            "Failed to load lecturer:",
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

          }

        }

      };


    fetchLecturer();

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


        setLecturer(
          (previousLecturer) => ({

            ...previousLecturer,

            profile_image:
              updatedProfileImage,

          })
        );

      };


    window.addEventListener(
      "lecturer-profile-image-updated",
      handleProfileImageUpdate
    );


    return () => {

      window.removeEventListener(
        "lecturer-profile-image-updated",
        handleProfileImageUpdate
      );

    };

  }, []);


  /* ========================================
     INITIALS + PROFILE IMAGE
  ======================================== */

  const initials =
    getInitials(
      lecturer.name
    );


  const profileImageUrl =
    getProfileImageUrl(
      lecturer.profile_image
    );


  /* ========================================
     LOGOUT
  ======================================== */

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/login");

  };


  /* ========================================
     SCROLL TO DASHBOARD SECTION
  ======================================== */

  const scrollToSection =
    (sectionId) => {

      if (
        location.pathname ===
        "/lecturer-dashboard"
      ) {

        const section =
          document.getElementById(
            sectionId
          );


        if (section) {

          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

        }

        return;

      }


      navigate(
        "/lecturer-dashboard"
      );


      setTimeout(() => {

        const section =
          document.getElementById(
            sectionId
          );


        if (section) {

          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

        }

      }, 150);

    };


  /*
    Keep this function because it was part
    of the existing Lecturer Sidebar logic.
  */

  void scrollToSection;


  /* ========================================
     ACTIVE PAGE HELPER
  ======================================== */

  const getNavClass =
    (path) => {

      return (
        location.pathname === path
          ? "lecturer-nav-item lecturer-nav-active"
          : "lecturer-nav-item"
      );

    };


  return (

    <aside className="lecturer-sidebar">


      {/* ====================================
          LOGO
      ==================================== */}

      <div className="lecturer-logo">


        <div className="lecturer-logo-icon">

          <GraduationCap
            size={25}
            strokeWidth={2.3}
          />

        </div>


        <div>


          <div className="lecturer-logo-title">

            Campus<span>Learn</span>

          </div>


          <div className="lecturer-logo-subtitle">

            Lecturer Portal

          </div>


        </div>


      </div>


      {/* ====================================
          NAVIGATION
      ==================================== */}

      <div className="lecturer-navigation">


        <p className="lecturer-section-label">

          TEACHING

        </p>


        <nav className="lecturer-menu">


          {/* DASHBOARD */}

          <button
            className={
              getNavClass(
                "/lecturer-dashboard"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer-dashboard"
              )
            }
          >

            <LayoutDashboard
              size={19}
            />

            Dashboard

          </button>


          {/* MY COURSES */}

          <button
            className={
              getNavClass(
                "/lecturer/courses"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer/courses"
              )
            }
          >

            <BookOpen
              size={19}
            />

            My Courses

          </button>


          {/* ASSIGNMENTS */}

          <button
            className={
              getNavClass(
                "/lecturer/assignments"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer/assignments"
              )
            }
          >

            <ClipboardList
              size={19}
            />

            Assignments

          </button>


          {/* SUBMISSIONS */}

          <button
            className={
              getNavClass(
                "/lecturer/submissions"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer/submissions"
              )
            }
          >

            <FileCheck2
              size={19}
            />

            Submissions

          </button>


          {/* GRADING */}

          <button
            className={
              getNavClass(
                "/lecturer/grading"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer/grading"
              )
            }
          >

            <GraduationCap
              size={19}
            />

            Grading

          </button>


          {/* STUDENTS */}

          <button
            className={
              getNavClass(
                "/lecturer/students"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer/students"
              )
            }
          >

            <Users
              size={19}
            />

            Students

          </button>


        </nav>


        {/* ==================================
            TOOLS
        ================================== */}

        <p className="lecturer-section-label lecturer-second-section">

          TOOLS

        </p>


        <nav className="lecturer-menu">


          <button
            className={
              getNavClass(
                "/lecturer/tutor"
              )
            }
            onClick={() =>
              navigate(
                "/lecturer/tutor"
              )
            }
          >

            <Sparkles
              size={19}
            />

            AI Teaching Assistant

          </button>


        </nav>


      </div>


      {/* ====================================
          BOTTOM
      ==================================== */}

      <div className="lecturer-sidebar-bottom">


        {/* LOGOUT */}

        <button
          className="lecturer-logout"
          onClick={
            handleLogout
          }
        >

          <LogOut
            size={19}
          />

          Log out

        </button>


        {/* ==================================
            REAL LECTURER
        ================================== */}

        <div className="lecturer-user-card">


          <div
            className="lecturer-avatar"
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
                src={
                  profileImageUrl
                }
                alt={`${lecturer.name || "Lecturer"} profile`}
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

              {lecturer.name}

            </strong>


            <span>
              Lecturer
            </span>


          </div>


        </div>


      </div>


    </aside>

  );

}


export default LecturerSidebar;