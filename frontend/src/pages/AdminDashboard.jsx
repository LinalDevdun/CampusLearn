import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  UserPlus,
  BarChart3,
  Settings,
  CalendarDays,
  Database,
  Server,
  CircleCheckBig,
  ArrowRight,
  Activity,
  UserCog,
  Sparkles,
  TrendingUp,
  Clock3,
  ExternalLink,
} from "lucide-react";

import "../styles/adminDashboard.css";

import API_BASE_URL from "../config/api";


function AdminDashboard() {

  const navigate =
    useNavigate();


  /* ========================================
     LOGGED-IN ADMIN
  ======================================== */

  const [
    admin,
    setAdmin,
  ] = useState({
    name: "Admin",
    email: "",
    role: "ADMIN",
  });


  /* ========================================
     REPORT / DASHBOARD DATA
  ======================================== */

  const [
    reportData,
    setReportData,
  ] = useState(null);


  const [
    recentUsers,
    setRecentUsers,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* ========================================
     AUTH ERROR
  ======================================== */

  const handleAuthError =
    useCallback(
      (error) => {

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

          localStorage.removeItem(
            "user"
          );

          navigate("/login");

          return true;

        }


        return false;

      },
      [navigate]
    );


  /* ========================================
     INITIALS
  ======================================== */

  const getInitials =
    (name = "") => {

      const words =
        name
          .trim()
          .split(/\s+/)
          .filter(Boolean);


      if (words.length === 0) {

        return "U";

      }


      if (words.length === 1) {

        return words[0]
          .charAt(0)
          .toUpperCase();

      }


      return (
        words[0].charAt(0) +
        words[
          words.length - 1
        ].charAt(0)
      ).toUpperCase();

    };


  /* ========================================
     FORMAT ROLE
  ======================================== */

  const formatRole =
    (role) => {

      if (!role) {

        return "User";

      }


      const upper =
        role.toUpperCase();


      if (upper === "ADMIN") {
        return "Admin";
      }


      if (upper === "LECTURER") {
        return "Lecturer";
      }


      if (upper === "STUDENT") {
        return "Student";
      }


      return role;

    };


  /* ========================================
     FORMAT LAST LOGIN
  ======================================== */

  const formatLastLogin =
    (value) => {

      if (!value) {

        return "Never";

      }


      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "Never";

      }


      return date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

    };


  /* ========================================
     LOAD DASHBOARD DATA
  ======================================== */

  const loadDashboard =
    useCallback(
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


          const config = {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          };


          const [
            adminResponse,
            reportsResponse,
            usersResponse,
          ] =
            await Promise.all([

              axios.get(
                `${API_BASE_URL}/me`,
                config
              ),

              axios.get(
                `${API_BASE_URL}/admin/reports/overview`,
                config
              ),

              axios.get(
                `${API_BASE_URL}/admin/users`,
                config
              ),

            ]);


          /* ADMIN */

          setAdmin(
            adminResponse.data
          );


          /* REPORT DATA */

          setReportData(
            reportsResponse.data
          );


          /* LATEST USERS */

          const users =
            Array.isArray(
              usersResponse.data
            )
              ? usersResponse.data
              : [];


          const latestUsers =
            [...users]
              .sort(
                (a, b) =>
                  Number(b.id) -
                  Number(a.id)
              )
              .slice(0, 5)
              .map(
                (user) => ({

                  id:
                    user.id,

                  name:
                    user.name ||
                    "Unknown User",

                  initials:
                    getInitials(
                      user.name
                    ),

                  email:
                    user.email ||
                    "No email",

                  role:
                    formatRole(
                      user.role
                    ),

                  lastLogin:
                    formatLastLogin(
                      user.last_login
                    ),

                  active:
                    user.is_active !==
                    false,

                })
              );


          setRecentUsers(
            latestUsers
          );


        } catch (error) {

          console.error(
            "Admin Dashboard Error:",
            error
          );


          if (
            handleAuthError(
              error
            )
          ) {

            return;

          }


          setError(
            error.response?.data
              ?.error ||
            "Failed to load dashboard data."
          );


        } finally {

          setLoading(false);

        }

      },
      [
        navigate,
        handleAuthError,
      ]
    );


  /* ========================================
     INITIAL LOAD
  ======================================== */

  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);


  /* ========================================
     SAFE DATA
  ======================================== */

  const summary =
    reportData?.summary || {

      total_users: 0,
      students: 0,
      lecturers: 0,
      administrators: 0,
      active_accounts: 0,
      active_courses: 0,
      average_score: 0,

    };


  const distribution =
    reportData
      ?.user_distribution || {

      students: 0,
      lecturers: 0,
      administrators: 0,
      active_accounts: 0,

    };


  /* ========================================
     DERIVED VALUES
  ======================================== */

  const totalDistribution =
    Number(distribution.students || 0) +
    Number(distribution.lecturers || 0) +
    Number(distribution.administrators || 0);


  const getPercentage =
    (value) => {

      if (!totalDistribution) {
        return 0;
      }

      return Math.round(
        (Number(value || 0) /
          totalDistribution) *
          100
      );

    };


  const activeRate =
    Number(summary.total_users) > 0
      ? Math.round(
          (
            Number(
              summary.active_accounts || 0
            ) /
            Number(
              summary.total_users
            )
          ) * 100
        )
      : 0;


  /* ========================================
     STAT CARDS
  ======================================== */

  const stats = [

    {
      label: "Total Users",
      value:
        summary.total_users,
      description:
        "All platform accounts",
      icon:
        Users,
      className:
        "ad-stat-teal",
    },

    {
      label: "Students",
      value:
        summary.students,
      description:
        "Registered learners",
      icon:
        GraduationCap,
      className:
        "ad-stat-purple",
    },

    {
      label: "Lecturers",
      value:
        summary.lecturers,
      description:
        "Teaching staff",
      icon:
        UserCog,
      className:
        "ad-stat-blue",
    },

    {
      label: "Active Courses",
      value:
        summary.active_courses,
      description:
        "Current modules",
      icon:
        BookOpen,
      className:
        "ad-stat-orange",
    },

  ];


  /* ========================================
     USER DISTRIBUTION
  ======================================== */

  const userDistribution = [

    {
      label: "Students",
      count:
        distribution.students,
      description:
        "Registered student accounts",
      icon:
        GraduationCap,
      className:
        "ad-role-student",
      barClass:
        "ad-role-bar-purple",
    },

    {
      label: "Lecturers",
      count:
        distribution.lecturers,
      description:
        "Teaching staff accounts",
      icon:
        Users,
      className:
        "ad-role-lecturer",
      barClass:
        "ad-role-bar-blue",
    },

    {
      label: "Administrators",
      count:
        distribution.administrators,
      description:
        "System administrator accounts",
      icon:
        ShieldCheck,
      className:
        "ad-role-admin",
      barClass:
        "ad-role-bar-teal",
    },

  ];


  /* ========================================
     DATE
  ======================================== */

  const currentDate =
    new Date()
      .toLocaleDateString(
        "en-US",
        {
          weekday: "short",
          month: "short",
          day: "numeric",
        }
      );


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="admin-dashboard-page">

        <div className="ad-loading">

          <div className="ad-loading-spinner" />

          <strong>
            Loading Admin Command Center
          </strong>

          <span>
            Getting live CampusLearn data...
          </span>

        </div>

      </div>

    );

  }


  return (

    <div className="admin-dashboard-page">


      {/* ====================================
          COMMAND HERO
      ==================================== */}

      <section className="ad-command-hero">


        <div className="ad-command-main">


          <div className="ad-command-eyebrow">

            <Sparkles size={12} />

            CAMPUSLEARN ADMIN COMMAND CENTER

          </div>


          <h1>

            Welcome back,
            <span> {admin.name}</span>

          </h1>


          <p>

            Monitor accounts, academic
            activity and platform operations
            from one central workspace.

          </p>


          <div className="ad-command-chips">


            <div>

              <CircleCheckBig
                size={13}
              />

              {activeRate}% active accounts

            </div>


            <div>

              <BookOpen
                size={13}
              />

              {summary.active_courses} active courses

            </div>


            <div>

              <TrendingUp
                size={13}
              />

              {summary.average_score || 0}% avg score

            </div>


          </div>


        </div>


        {/* RIGHT STATUS */}

        <div className="ad-command-status">


          <div className="ad-command-status-top">


            <div className="ad-command-status-icon">

              <Activity size={21} />

            </div>


            <div>

              <span>
                PLATFORM STATUS
              </span>

              <strong>
                Operational
              </strong>

            </div>


          </div>


          <div className="ad-command-divider" />


          <div className="ad-command-status-grid">


            <div>

              <span>
                USERS
              </span>

              <strong>
                {summary.total_users}
              </strong>

            </div>


            <div>

              <span>
                ACTIVE
              </span>

              <strong>
                {summary.active_accounts}
              </strong>

            </div>


          </div>


          <div className="ad-command-date">

            <CalendarDays size={13} />

            {currentDate}

          </div>


        </div>


      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (

        <div className="ad-error">

          {error}

        </div>

      )}


      {/* ====================================
          STAT CARDS
      ==================================== */}

      <section className="ad-stats">


        {stats.map(
          (stat) => {

            const Icon =
              stat.icon;


            return (

              <div
                className={
                  `ad-stat-card ${stat.className}`
                }
                key={stat.label}
              >


                <div className="ad-stat-top">


                  <div className="ad-stat-icon">

                    <Icon size={21} />

                  </div>


                  <span className="ad-stat-label">

                    {stat.label}

                  </span>


                </div>


                <div className="ad-stat-content">

                  <strong>
                    {stat.value}
                  </strong>

                  <span>
                    {stat.description}
                  </span>

                </div>


              </div>

            );

          }
        )}


      </section>


      {/* ====================================
          PLATFORM OVERVIEW
      ==================================== */}

      <section className="ad-main-grid">


        {/* USER DISTRIBUTION */}

        <div className="ad-panel ad-distribution-panel">


          <div className="ad-panel-header">


            <div>

              <span className="ad-panel-eyebrow">
                PEOPLE & ACCESS
              </span>

              <h2>
                User Distribution
              </h2>

              <p>
                Account distribution across
                the CampusLearn platform.
              </p>

            </div>


            <button
              className="ad-panel-link"
              type="button"
              onClick={() =>
                navigate(
                  "/admin-users"
                )
              }
            >

              Manage Users

              <ArrowRight
                size={13}
              />

            </button>


          </div>


          <div className="ad-user-distribution">


            {userDistribution.map(
              (role) => {

                const Icon =
                  role.icon;

                const percentage =
                  getPercentage(
                    role.count
                  );


                return (

                  <div
                    className="ad-role-row"
                    key={role.label}
                  >


                    <div
                      className={
                        `ad-role-icon ${role.className}`
                      }
                    >

                      <Icon size={18} />

                    </div>


                    <div className="ad-role-body">


                      <div className="ad-role-heading">

                        <div>

                          <strong>
                            {role.label}
                          </strong>

                          <span>
                            {role.description}
                          </span>

                        </div>


                        <div className="ad-role-count">

                          {role.count}

                          <small>
                            {percentage}%
                          </small>

                        </div>

                      </div>


                      <div className="ad-role-track">

                        <div
                          className={
                            `ad-role-fill ${role.barClass}`
                          }
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>


                    </div>


                  </div>

                );

              }
            )}


          </div>


        </div>


        {/* SYSTEM STATUS */}

        <div className="ad-panel ad-system-panel">


          <div className="ad-panel-header">


            <div>

              <span className="ad-panel-eyebrow">
                PLATFORM SERVICES
              </span>

              <h2>
                System Status
              </h2>

              <p>
                Core CampusLearn services.
              </p>

            </div>


            <div className="ad-health-pill">

              <span />

              Healthy

            </div>


          </div>


          <div className="ad-system-list">


            <SystemItem
              icon={
                <Database size={17} />
              }
              title="PostgreSQL Database"
              description="Primary application database"
              status="Connected"
            />


            <SystemItem
              icon={
                <Server size={17} />
              }
              title="Backend API"
              description="Node.js / Express service"
              status="Online"
            />


            <SystemItem
              icon={
                <CircleCheckBig
                  size={17}
                />
              }
              title="Authentication"
              description="JWT and role-based access"
              status="Active"
            />


          </div>


          <div className="ad-system-summary">


            <div>

              <Activity size={17} />

            </div>


            <p>

              Core platform services are
              available for CampusLearn users.

            </p>


          </div>


        </div>


      </section>


      {/* ====================================
          QUICK ACTIONS
      ==================================== */}

      <section className="ad-section">


        <div className="ad-section-heading-row">


          <div>

            <span>
              ADMIN SHORTCUTS
            </span>

            <h2>
              Quick Actions
            </h2>

            <p>
              Jump directly into common
              administration tasks.
            </p>

          </div>


          <div className="ad-section-heading-icon">

            <Activity size={18} />

          </div>


        </div>


        <div className="ad-quick-actions">


          <QuickAction
            icon={
              <UserPlus size={20} />
            }
            title="Add User"
            description="Create student, lecturer or administrator accounts."
            className="ad-action-teal"
            onClick={() =>
              navigate(
                "/admin-users"
              )
            }
          />


          <QuickAction
            icon={
              <BookOpen size={20} />
            }
            title="Manage Courses"
            description="Review academic courses and module information."
            className="ad-action-blue"
            onClick={() =>
              navigate(
                "/admin/courses"
              )
            }
          />


          <QuickAction
            icon={
              <BarChart3 size={20} />
            }
            title="View Reports"
            description="Explore platform and academic statistics."
            className="ad-action-purple"
            onClick={() =>
              navigate(
                "/admin/reports"
              )
            }
          />


          <QuickAction
            icon={
              <Settings size={20} />
            }
            title="System Settings"
            description="Manage CampusLearn administration preferences."
            className="ad-action-orange"
            onClick={() =>
              navigate(
                "/admin/settings"
              )
            }
          />


        </div>


      </section>


      {/* ====================================
          LATEST USERS
      ==================================== */}

      <section className="ad-section">


        <div className="ad-section-heading-row">


          <div>

            <span>
              ACCOUNT ACTIVITY
            </span>

            <h2>
              Latest User Accounts
            </h2>

            <p>
              Recently added CampusLearn
              account records.
            </p>

          </div>


          <button
            className="ad-view-all"
            type="button"
            onClick={() =>
              navigate(
                "/admin-users"
              )
            }
          >

            View all users

            <ExternalLink size={13} />

          </button>


        </div>


        <div className="ad-table-wrapper">


          <table className="ad-table">


            <thead>

              <tr>

                <th>
                  User
                </th>

                <th>
                  Role
                </th>

                <th>
                  Last Login
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>


              {recentUsers.length ===
                0 && (

                <tr>

                  <td
                    colSpan="4"
                    className="ad-table-empty"
                  >
                    No users found.
                  </td>

                </tr>

              )}


              {recentUsers.map(
                (user) => (

                  <tr
                    key={user.id}
                  >


                    <td>

                      <div className="ad-user-table-profile">


                        <div className="ad-table-avatar">

                          {user.initials}

                        </div>


                        <div>

                          <strong>
                            {user.name}
                          </strong>

                          <span>
                            {user.email}
                          </span>

                        </div>


                      </div>

                    </td>


                    <td>

                      <span
                        className={
                          `ad-role-badge ad-role-badge-${user.role.toLowerCase()}`
                        }
                      >

                        {user.role}

                      </span>

                    </td>


                    <td>

                      <div className="ad-last-login">

                        <Clock3
                          size={13}
                        />

                        {user.lastLogin}

                      </div>

                    </td>


                    <td>

                      {user.active ? (

                        <span className="ad-active-badge">

                          <CircleCheckBig
                            size={10}
                          />

                          Active

                        </span>

                      ) : (

                        <span className="ad-disabled-badge">

                          Disabled

                        </span>

                      )}

                    </td>


                  </tr>

                )
              )}


            </tbody>


          </table>


        </div>


      </section>


    </div>

  );

}


/* ========================================
   SYSTEM ITEM
======================================== */

function SystemItem({
  icon,
  title,
  description,
  status,
}) {

  return (

    <div className="ad-system-item">


      <div className="ad-system-left">


        <div className="ad-system-icon">

          {icon}

        </div>


        <div>

          <strong>
            {title}
          </strong>

          <span>
            {description}
          </span>

        </div>


      </div>


      <span className="ad-status-online">

        <i />

        {status}

      </span>


    </div>

  );

}


/* ========================================
   QUICK ACTION
======================================== */

function QuickAction({
  icon,
  title,
  description,
  className,
  onClick,
}) {

  return (

    <button
      type="button"
      className={
        `ad-action-card ${className}`
      }
      onClick={onClick}
    >


      <div className="ad-action-top">


        <div className="ad-action-icon">

          {icon}

        </div>


        <ArrowRight
          size={15}
          className="ad-action-arrow"
        />

      </div>


      <div>

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>

      </div>


    </button>

  );

}


export default AdminDashboard;