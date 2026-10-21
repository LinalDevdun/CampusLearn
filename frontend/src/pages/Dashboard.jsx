import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Award,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Sparkles,
  BrainCircuit,
  Database,
  Code2,
  Globe2,
  Sigma,
  Network,
  GraduationCap,
  Clock3,
  Target,
  Zap,
  CheckCircle2,
} from "lucide-react";

import "../styles/dashboard.css";


function Dashboard() {

  const navigate =
    useNavigate();


  /* ========================================
     DASHBOARD DATA
  ======================================== */

  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* ========================================
     FETCH STUDENT DASHBOARD
  ======================================== */

  useEffect(() => {

    const fetchDashboard =
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
              "http://localhost:5000/student/dashboard",
              {
                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },
              }
            );


          setDashboardData(
            response.data
          );


        } catch (error) {

          console.error(
            "Failed to load student dashboard:",
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


          setError(
            error.response?.data
              ?.error ||
              "Failed to load dashboard."
          );


        } finally {

          setLoading(false);

        }

      };


    fetchDashboard();

  }, [navigate]);


  /* ========================================
     GREETING
  ======================================== */

  const hour =
    new Date().getHours();


  const greeting =
    hour < 12

      ? "Good morning"

      : hour < 18

        ? "Good afternoon"

        : "Good evening";


  /* ========================================
     CURRENT DATE
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
     DATE FORMATTER
  ======================================== */

  const formatDueDate =
    (dateValue) => {

      if (!dateValue) {

        return "No due date";

      }


      const dueDate =
        new Date(dateValue);


      const today =
        new Date();


      const tomorrow =
        new Date();


      tomorrow.setDate(
        today.getDate() + 1
      );


      const dueOnly =
        dueDate.toDateString();


      const todayOnly =
        today.toDateString();


      const tomorrowOnly =
        tomorrow.toDateString();


      if (
        dueOnly === todayOnly
      ) {

        return "Today";

      }


      if (
        dueOnly === tomorrowOnly
      ) {

        return "Tomorrow";

      }


      return dueDate
        .toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        );

    };


  /* ========================================
     COURSE VISUAL STYLES
  ======================================== */

  const courseStyles = [

    {
      icon: BrainCircuit,
      cover: "course-violet",
    },

    {
      icon: Database,
      cover: "course-emerald",
    },

    {
      icon: Code2,
      cover: "course-blue",
    },

    {
      icon: Globe2,
      cover: "course-amber",
    },

    {
      icon: Sigma,
      cover: "course-rose",
    },

    {
      icon: Network,
      cover: "course-cyan",
    },

  ];


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-loading">

          <div className="dashboard-loader" />

          <span>
            Preparing your learning space...
          </span>

        </div>

      </div>

    );

  }


  /* ========================================
     ERROR
  ======================================== */

  if (
    error ||
    !dashboardData
  ) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-error">

          {error ||
            "Dashboard data unavailable."}

        </div>

      </div>

    );

  }


  /* ========================================
     EXTRACT API DATA
  ======================================== */

  const student =
    dashboardData.student || {};


  const dashboardStats =
    dashboardData.stats || {};


  const courses =
    dashboardData.courses || [];


  const assignments =
    dashboardData
      .upcoming_assignments || [];


  const overallProgress =
    Number(
      dashboardStats
        .overall_progress
    ) || 0;


  const averageScore =
    Number(
      dashboardStats
        .average_score
    ) || 0;


  /* ========================================
     STATISTICS
  ======================================== */

  const stats = [

    {
      label:
        "Enrolled Courses",

      value:
        dashboardStats
          .enrolled_courses ?? 0,

      description:
        "Active courses",

      icon:
        BookOpen,

      color:
        "stat-purple",

      smallIcon:
        GraduationCap,
    },

    {
      label:
        "Assignments",

      value:
        dashboardStats
          .total_assignments ?? 0,

      description:
        `${dashboardStats
          .due_this_week ?? 0} due this week`,

      icon:
        ClipboardCheck,

      color:
        "stat-blue",

      smallIcon:
        Clock3,
    },

    {
      label:
        "Overall Progress",

      value:
        `${overallProgress}%`,

      description:
        `${dashboardStats
          .submitted_assignments ??
          0} submitted`,

      icon:
        TrendingUp,

      color:
        "stat-green",

      smallIcon:
        Target,
    },

    {
      label:
        "Average Score",

      value:
        `${Math.round(
          averageScore
        )}%`,

      description:
        averageScore > 0
          ? "Graded work"
          : "No grades yet",

      icon:
        Award,

      color:
        "stat-orange",

      smallIcon:
        Award,
    },

  ];


  return (

    <div className="dashboard-page">


      {/* ====================================
          HERO
      ==================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-grid" />

        <div className="dashboard-hero-orb dashboard-orb-one" />

        <div className="dashboard-hero-orb dashboard-orb-two" />


        <div className="dashboard-hero-left">

          <div className="dashboard-hero-badge">

            <Sparkles size={13} />

            Your learning space

          </div>


          <h1>

            {greeting},{" "}

            <span>
              {student.name ||
                "Student"}
            </span>

            <span className="dashboard-wave">
              👋
            </span>

          </h1>


          <p className="dashboard-hero-description">

            Stay on top of your courses,
            assignments and academic progress
            with everything you need in one
            place.

          </p>


          <div className="dashboard-hero-chips">

            <span>

              <GraduationCap
                size={14}
              />

              {student.degree ||
                "Student"}

            </span>


            {student.batch && (

              <span>

                <CalendarDays
                  size={14}
                />

                Batch {student.batch}

              </span>

            )}


            <span>

              <CheckCircle2
                size={14}
              />

              Active student

            </span>

          </div>

        </div>


        <div className="dashboard-hero-right">

          <div className="dashboard-date">

            <CalendarDays
              size={15}
            />

            {currentDate}

          </div>


          <div className="hero-progress-card">

            <div
              className="hero-progress-ring"
              style={{
                background:
                  `conic-gradient(
                    #ffffff 0deg ${overallProgress * 3.6}deg,
                    rgba(255,255,255,0.18) ${overallProgress * 3.6}deg 360deg
                  )`,
              }}
            >

              <div className="hero-progress-inner">

                <strong>
                  {overallProgress}%
                </strong>

                <span>
                  PROGRESS
                </span>

              </div>

            </div>


            <div>

              <span className="hero-progress-label">

                Learning progress

              </span>


              <strong className="hero-progress-title">

                {overallProgress === 100

                  ? "All caught up!"

                  : overallProgress >= 60

                    ? "Great momentum"

                    : "Keep moving forward"}

              </strong>


              <span className="hero-progress-copy">

                {dashboardStats
                  .submitted_assignments ?? 0}{" "}
                assignments submitted

              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================
          STATS
      ==================================== */}

      <section className="dashboard-stats">

        {stats.map((stat) => {

          const Icon =
            stat.icon;

          const SmallIcon =
            stat.smallIcon;


          return (

            <div
              className={
                `stat-card ${stat.color}`
              }
              key={stat.label}
            >

              <div className="stat-top-line">

                <div className="stat-icon">

                  <Icon
                    size={23}
                    strokeWidth={2}
                  />

                </div>


                <div className="stat-mini-badge">

                  <SmallIcon
                    size={11}
                  />

                </div>

              </div>


              <div className="stat-content">

                <p className="stat-value">

                  {stat.value}

                </p>


                <p className="stat-label">

                  {stat.label}

                </p>


                <span className="stat-small">

                  {stat.description}

                </span>

              </div>

            </div>

          );

        })}

      </section>


      {/* ====================================
          COURSES
      ==================================== */}

      <section className="dashboard-section">


        <div className="dashboard-section-heading">

          <div>

            <div className="section-kicker">

              <BookOpen size={13} />

              Your learning

            </div>


            <h2>
              Continue Learning
            </h2>


            <p>
              Courses available for your
              degree and batch.
            </p>

          </div>


          <button
            className="dashboard-text-button"
            onClick={() =>
              navigate("/my-courses")
            }
          >

            View all

            <ArrowRight
              size={15}
            />

          </button>

        </div>


        {courses.length === 0 ? (

          <div className="dashboard-empty">

            <BookOpen size={28} />

            <h3>
              No courses yet
            </h3>

            <p>
              Courses have not been assigned
              to your degree and batch yet.
            </p>

          </div>

        ) : (

          <div className="dashboard-courses">

            {courses.map(
              (
                course,
                index
              ) => {

                const style =
                  courseStyles[
                    index %
                    courseStyles.length
                  ];


                const CourseIcon =
                  style.icon;


                return (

                  <article
                    className="dashboard-course-card"
                    key={course.id}
                  >

                    <div
                      className={
                        `course-cover ${style.cover}`
                      }
                    >

                      <div className="course-cover-pattern" />


                      <div className="course-cover-icon">

                        <CourseIcon
                          size={27}
                          strokeWidth={1.8}
                        />

                      </div>


                      <span className="course-cover-number">

                        0{index + 1}

                      </span>

                    </div>


                    <div className="course-card-body">

                      <span className="course-category">

                        {course.degree ||
                          "Course"}

                      </span>


                      <h3>

                        {course.title}

                      </h3>


                      <div className="course-instructor-row">

                        <div className="course-lecturer-avatar">

                          {(
                            course
                              .lecturer_name ||
                            "L"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>


                        <span>

                          {course
                            .lecturer_name ||
                            "Not assigned"}

                        </span>

                      </div>


                      <div className="course-progress-info">

                        <span>
                          Assignment progress
                        </span>

                        <strong>
                          {overallProgress}%
                        </strong>

                      </div>


                      <div className="course-progress-track">

                        <div
                          className="course-progress-bar"
                          style={{
                            width:
                              `${overallProgress}%`,
                          }}
                        />

                      </div>


                      <div className="course-footer">

                        <button
                          className="continue-button"
                          onClick={() =>
                            navigate(
                              "/my-courses"
                            )
                          }
                        >

                          Continue learning

                          <ArrowRight
                            size={14}
                          />

                        </button>


                        <span className="course-percentage">

                          {
                            course.lesson_count
                          }{" "}

                          {
                            course.lesson_count ===
                            1
                              ? "lesson"
                              : "lessons"
                          }

                        </span>

                      </div>

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ====================================
          BOTTOM GRID
      ==================================== */}

      <section className="dashboard-bottom-grid">


        {/* ASSIGNMENTS */}

        <div className="dashboard-panel assignments-panel">


          <div className="panel-header">

            <div>

              <div className="panel-kicker">

                <ClipboardList
                  size={13}
                />

                Stay on track

              </div>


              <h2>
                Upcoming Assignments
              </h2>

            </div>


            <button
              className="dashboard-text-button"
              onClick={() =>
                navigate(
                  "/assignments"
                )
              }
            >

              View all

              <ArrowRight
                size={14}
              />

            </button>

          </div>


          <div className="assignment-list">

            {assignments.length ===
            0 ? (

              <div className="assignment-empty">

                <CheckCircle2
                  size={26}
                />

                <strong>
                  You're all clear!
                </strong>

                <span>
                  No pending assignments.
                </span>

              </div>

            ) : (

              assignments.map(
                (
                  assignment,
                  index
                ) => (

                  <div
                    className="assignment-item"
                    key={
                      assignment.id
                    }
                  >

                    <div className="assignment-number">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>


                    <div className="assignment-icon">

                      <ClipboardList
                        size={17}
                      />

                    </div>


                    <div className="assignment-details">

                      <h4>

                        {
                          assignment.title
                        }

                      </h4>


                      <p>

                        {
                          assignment.degree ||
                          "Assignment"
                        }

                      </p>

                    </div>


                    <span className="assignment-due">

                      <Clock3 size={11} />

                      {formatDueDate(
                        assignment
                          .due_date
                      )}

                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* PROGRESS */}

        <div className="dashboard-panel weekly-progress-card">


          <div className="panel-header">

            <div>

              <div className="panel-kicker">

                <TrendingUp
                  size={13}
                />

                Your momentum

              </div>


              <h2>
                Learning Progress
              </h2>

            </div>

          </div>


          <div className="progress-summary">


            <div
              className="progress-ring"
              style={{
                background:
                  `conic-gradient(
                    #6755ed 0deg ${overallProgress * 3.6}deg,
                    #eeeeF6 ${overallProgress * 3.6}deg 360deg
                  )`,
              }}
            >

              <div className="progress-ring-inner">

                <strong>

                  {overallProgress}%

                </strong>


                <span>

                  COMPLETED

                </span>

              </div>

            </div>


            <p className="weekly-message">

              {dashboardStats
                .total_assignments ===
              0

                ? "No assignments are available yet."

                : overallProgress ===
                  100

                  ? "Everything submitted. Amazing work! 🎉"

                  : overallProgress >=
                    75

                    ? "You're making excellent progress."

                    : overallProgress >=
                      40

                      ? "Nice progress. Keep the momentum going!"

                      : "Every completed task moves you forward."}

            </p>


            <button
              className="progress-button"
              onClick={() =>
                navigate(
                  "/progress"
                )
              }
            >

              View full progress

              <ArrowRight
                size={14}
              />

            </button>

          </div>

        </div>

      </section>


      {/* ====================================
          AI ASSISTANT
      ==================================== */}

      <section className="ai-dashboard-banner">


        <div className="ai-grid-pattern" />

        <div className="ai-glow ai-glow-one" />

        <div className="ai-glow ai-glow-two" />


        <div className="ai-dashboard-content">


          <div className="ai-dashboard-icon">

            <BrainCircuit
              size={27}
            />

          </div>


          <div>

            <div className="ai-banner-label">

              <Zap size={12} />

              AI-powered learning

            </div>


            <h3>

              Need help with your studies?

            </h3>


            <p>

              Ask CampusLearn AI to explain
              difficult concepts, summarize
              topics or help you prepare for
              your next class.

            </p>

          </div>

        </div>


        <button
          className="ai-dashboard-button"
          onClick={() =>
            navigate("/tutor")
          }
        >

          <Sparkles
            size={15}
          />

          Ask AI Tutor

          <ArrowRight
            size={15}
          />

        </button>

      </section>

    </div>

  );

}


export default Dashboard;