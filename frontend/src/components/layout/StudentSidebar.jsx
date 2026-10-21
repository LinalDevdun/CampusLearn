import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  ChartNoAxesCombined,
  GraduationCap,
  Sparkles,
  Bell,
  LogOut,
} from "lucide-react";

import API_BASE_URL from "../../config/api";


function StudentSidebar() {

  const navigate =
    useNavigate();


  /* ========================================
     STUDENT DATA
  ======================================== */

  const [student, setStudent] =
    useState({
      name: "Student User",
      email: "",
      role: "STUDENT",
      profile_image: "",
    });


  /* ========================================
     GET LOGGED-IN STUDENT
  ======================================== */

  useEffect(() => {

    const fetchStudent =
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


          setStudent(
            response.data
          );

        } catch (error) {

          console.error(
            "Failed to load student:",
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


    fetchStudent();

  }, [navigate]);


  /* ========================================
     LIVE PROFILE IMAGE UPDATE
  ======================================== */

  useEffect(() => {

    const handleProfileImageUpdated =
      (event) => {

        setStudent(
          (previousStudent) => ({
            ...previousStudent,

            profile_image:
              event.detail?.profileImage ??
              previousStudent.profile_image,
          })
        );
      };


    window.addEventListener(
      "student-profile-image-updated",
      handleProfileImageUpdated
    );


    return () => {

      window.removeEventListener(
        "student-profile-image-updated",
        handleProfileImageUpdated
      );
    };

  }, []);


  /* ========================================
     INITIALS
  ======================================== */

  const getInitials =
    (name) => {

      if (!name) {

        return "ST";
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
      student.name
    );


  /* ========================================
     PROFILE IMAGE URL
  ======================================== */

  const getProfileImageUrl =
    (profileImage) => {

      if (!profileImage) {

        return "";
      }


      if (
        /^https?:\/\//i.test(
          String(profileImage)
        )
      ) {

        return String(
          profileImage
        );
      }


      const cleanPath =
        String(profileImage)
          .replace(
            /\\/g,
            "/"
          )
          .replace(
            /^.*?uploads\//,
            "uploads/"
          );


      return (
        `${API_BASE_URL}/${cleanPath}`
      );
    };


  const profileImageUrl =
    getProfileImageUrl(
      student.profile_image
    );


  /* ========================================
     LOGOUT
  ======================================== */

  const handleLogout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "role"
      );

      navigate("/login");
    };


  /* ========================================
     MAIN MENU
  ======================================== */

  const mainMenu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "My Courses",
      path: "/my-courses",
      icon: BookOpen,
    },

    {
      name: "Assignments",
      path: "/assignments",
      icon: ClipboardList,
    },

    {
      name: "Deadlines",
      path: "/deadlines",
      icon: CalendarDays,
    },

    {
      name: "Learning Progress",
      path: "/progress",
      icon: ChartNoAxesCombined,
    },

    {
      name: "Grades",
      path: "/grades",
      icon: GraduationCap,
    },
  ];


  /* ========================================
     LEARNING MENU
  ======================================== */

  const learningMenu = [
    {
      name: "AI Study Tutor",
      path: "/tutor",
      icon: Sparkles,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
  ];


  /* ========================================
     MENU ITEM
  ======================================== */

  const renderMenuItem =
    (item) => {

      const Icon =
        item.icon;


      return (

        <NavLink
          key={
            item.path
          }
          to={
            item.path
          }
          className={({
            isActive,
          }) =>
            `sidebar-link ${
              isActive
                ? "sidebar-link-active"
                : ""
            }`
          }
        >

          <Icon
            size={19}
            strokeWidth={2}
          />

          <span>
            {item.name}
          </span>

        </NavLink>

      );
    };


  return (

    <aside className="student-sidebar">


      {/* ====================================
          LOGO
      ==================================== */}

      <div className="sidebar-logo">


        <div className="sidebar-logo-icon">

          <GraduationCap
            size={25}
            strokeWidth={2.3}
          />

        </div>


        <div>


          <div className="sidebar-logo-title">

            Campus
            <span>
              Learn
            </span>

          </div>


          <div className="sidebar-logo-subtitle">

            Student Portal

          </div>


        </div>


      </div>


      {/* ====================================
          NAVIGATION
      ==================================== */}

      <div className="sidebar-navigation">


        <p className="sidebar-section-title">

          MAIN

        </p>


        <nav className="sidebar-menu">

          {mainMenu.map(
            renderMenuItem
          )}

        </nav>


        <p className="sidebar-section-title sidebar-second-section">

          LEARNING

        </p>


        <nav className="sidebar-menu">

          {learningMenu.map(
            renderMenuItem
          )}

        </nav>


      </div>


      {/* ====================================
          BOTTOM
      ==================================== */}

      <div className="sidebar-bottom">


        {/* LOGOUT */}

        <button
          type="button"
          className="sidebar-logout"
          onClick={
            handleLogout
          }
        >

          <LogOut
            size={19}
          />

          <span>
            Log out
          </span>

        </button>


        {/* ==================================
            STUDENT PROFILE
        ================================== */}

        <div className="sidebar-user">


          <div
            className="sidebar-avatar"
            style={{
              overflow:
                "hidden",
            }}
          >

            {profileImageUrl ? (

              <img
                src={
                  profileImageUrl
                }
                alt={
                  `${
                    student.name ||
                    "Student"
                  } profile`
                }
                style={{
                  width:
                    "100%",

                  height:
                    "100%",

                  display:
                    "block",

                  objectFit:
                    "cover",

                  borderRadius:
                    "inherit",
                }}
              />

            ) : (

              initials

            )}

          </div>


          <div className="sidebar-user-info">

            <p>
              {student.name}
            </p>

            <span>
              Student
            </span>

          </div>


        </div>


      </div>


    </aside>

  );
}


export default StudentSidebar;