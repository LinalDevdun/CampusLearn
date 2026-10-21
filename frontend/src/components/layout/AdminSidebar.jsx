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


function AdminSidebar() {

  const navigate = useNavigate();
  const location = useLocation();


  /* ========================================
     ADMIN DATA
  ======================================== */

  const [admin, setAdmin] = useState({
    name: "Admin User",
    email: "",
    role: "ADMIN",
  });


  /* ========================================
     GET LOGGED-IN ADMIN
  ======================================== */

  useEffect(() => {

    const fetchAdmin = async () => {

      try {

        const token =
          localStorage.getItem("token");


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


        setAdmin(response.data);

      } catch (error) {

        console.error(
          "Failed to load admin:",
          error
        );


        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {

          localStorage.removeItem("token");
          localStorage.removeItem("role");

          navigate("/login");

        }

      }

    };


    fetchAdmin();

  }, [navigate]);


  /* ========================================
     INITIALS
  ======================================== */

  const getInitials = (name) => {

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
    getInitials(admin.name);


  /* ========================================
     ACTIVE PAGE HELPER
  ======================================== */

  const getNavClass = (path) => {

    return location.pathname === path
      ? "admin-nav-item admin-nav-active"
      : "admin-nav-item";

  };


  /* ========================================
     LOGOUT
  ======================================== */

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login");

  };


  return (
    <aside className="admin-sidebar">


      {/* LOGO */}

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



      {/* NAVIGATION */}

      <div className="admin-navigation">


        <p className="admin-section-label">

          MANAGEMENT

        </p>


        <nav className="admin-menu">


          {/* DASHBOARD */}

          <button
            className={getNavClass(
              "/admin-dashboard"
            )}
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



          {/* USER MANAGEMENT */}

          <button
            className={getNavClass(
              "/admin-users"
            )}
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



          {/* STUDENTS */}

          <button
            className={getNavClass(
              "/admin/students"
            )}
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



          {/* COURSES */}

          <button
            className={getNavClass(
              "/admin/courses"
            )}
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



        {/* SYSTEM */}

        <p className="admin-section-label admin-second-section">

          SYSTEM

        </p>


        <nav className="admin-menu">


          {/* REPORTS */}

          <button
            className={getNavClass(
              "/admin/reports"
            )}
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



          {/* SETTINGS */}

          <button
            className={getNavClass(
              "/admin/settings"
            )}
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



      {/* BOTTOM */}

      <div className="admin-sidebar-bottom">


        {/* LOGOUT */}

        <button
          className="admin-logout"
          onClick={handleLogout}
        >

          <LogOut
            size={19}
          />

          Log out

        </button>



        {/* ADMIN PROFILE */}

        <div className="admin-user-card">

          <div className="admin-avatar">

            {initials}

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