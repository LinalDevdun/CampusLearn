import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  BookOpen,
  Users,
  ClipboardList,
  FileCheck2,
  Plus,
  UploadCloud,
  GraduationCap,
  UserCheck,
  CalendarDays,
  ArrowRight,
  Clock3,
  Sparkles,
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";

import "../styles/lecturerDashboard.css";

import API_BASE_URL from "../config/api";


function LecturerDashboard() {

  const navigate =
    useNavigate();


  /* ========================================
     LOGGED-IN LECTURER
  ======================================== */

  const [lecturer, setLecturer] =
    useState({
      name: "Lecturer",
      email: "",
      role: "LECTURER",
    });


  /* ========================================
     DASHBOARD DATA
  ======================================== */

  const [dashboard, setDashboard] =
    useState({

      stats: {
        active_courses: 0,
        total_students: 0,
        total_submissions: 0,
        waiting_to_grade: 0,
        total_assignments: 0,
        graded_submissions: 0,
        average_score: null,
      },

      courses: [],
      students: [],
      recent_submissions: [],
      activity: [],
      reminders: [],

    });


  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  /* ========================================
     LOAD LECTURER + DASHBOARD
  ======================================== */

  useEffect(() => {

    const fetchDashboard =
      async () => {

        try {

          setLoading(true);
          setErrorMessage("");


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
            lecturerResponse,
            dashboardResponse,
          ] =
            await Promise.all([

              axios.get(
                `${API_BASE_URL}/me`,
                config
              ),

              axios.get(
                `${API_BASE_URL}/lecturer/dashboard`,
                config
              ),

            ]);


          setLecturer(
            lecturerResponse.data
          );


          setDashboard({

            stats:
              dashboardResponse.data
                ?.stats || {},

            courses:
              dashboardResponse.data
                ?.courses || [],

            students:
              dashboardResponse.data
                ?.students || [],

            recent_submissions:
              dashboardResponse.data
                ?.recent_submissions || [],

            activity:
              dashboardResponse.data
                ?.activity || [],

            reminders:
              dashboardResponse.data
                ?.reminders || [],

          });


        } catch (error) {

          console.error(
            "Lecturer Dashboard Error:",
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


          setErrorMessage(
            error.response?.data
              ?.error ||
            "Failed to load lecturer dashboard."
          );


        } finally {

          setLoading(false);

        }

      };


    fetchDashboard();

  }, [navigate]);


  /* ========================================
     SAFE VALUES
  ======================================== */

  const statsData =
    dashboard.stats || {};


  const activeCourses =
    Number(
      statsData.active_courses || 0
    );


  const totalStudents =
    Number(
      statsData.total_students || 0
    );


  const totalSubmissions =
    Number(
      statsData.total_submissions || 0
    );


  const waitingToGrade =
    Number(
      statsData.waiting_to_grade || 0
    );


  const totalAssignments =
    Number(
      statsData.total_assignments || 0
    );


  const gradedSubmissions =
    Number(
      statsData.graded_submissions || 0
    );


  const averageScore =

    statsData.average_score === null ||
    statsData.average_score ===
      undefined

      ? null

      : Number(
          statsData.average_score
        );


  const gradingRate =

    totalSubmissions > 0

      ? Math.round(
          (
            gradedSubmissions /
            totalSubmissions
          ) *
          100
        )

      : 0;


  /* ========================================
     SUMMARY CARDS
  ======================================== */

  const stats = [

    {
      label: "Active Courses",
      helper:
        "Modules currently being taught",
      value: activeCourses,
      icon: BookOpen,
      className:
        "lecturer-stat-blue",
    },

    {
      label: "Total Students",
      helper:
        "Students across your courses",
      value: totalStudents,
      icon: Users,
      className:
        "lecturer-stat-purple",
    },

    {
      label: "Submissions",
      helper:
        "Student work received",
      value: totalSubmissions,
      icon: FileCheck2,
      className:
        "lecturer-stat-green",
    },

    {
      label: "To Grade",
      helper:
        waitingToGrade === 0
          ? "You're all caught up"
          : "Reviews still waiting",
      value: waitingToGrade,
      icon: ClipboardList,
      className:
        "lecturer-stat-orange",
    },

  ];


  /* ========================================
     WEEKLY SUBMISSION ACTIVITY
  ======================================== */

  const activity =
    useMemo(() => {

      const days = [

        {
          day: "Mon",
          dayNumber: 1,
        },

        {
          day: "Tue",
          dayNumber: 2,
        },

        {
          day: "Wed",
          dayNumber: 3,
        },

        {
          day: "Thu",
          dayNumber: 4,
        },

        {
          day: "Fri",
          dayNumber: 5,
        },

        {
          day: "Sat",
          dayNumber: 6,
        },

        {
          day: "Sun",
          dayNumber: 7,
        },

      ];


      const values =
        days.map((day) => {

          const found =
            dashboard.activity.find(
              (item) =>
                Number(
                  item.day_number
                ) ===
                day.dayNumber
            );


          return {

            ...day,

            value:
              Number(
                found?.submission_count ||
                0
              ),

          };

        });


      const maximum =
        Math.max(

          ...values.map(
            (item) =>
              item.value
          ),

          0

        );


      return values.map(
        (item) => ({

          ...item,

          height:

            item.value === 0 ||
            maximum === 0

              ? 0

              : Math.max(
                  18,

                  Math.round(
                    (
                      item.value /
                      maximum
                    ) *
                    86
                  )
                ),

        })
      );

    }, [dashboard.activity]);


  /* ========================================
     RECENT SUBMISSIONS
  ======================================== */

  const submissions =
    useMemo(() => {

      return dashboard
        .recent_submissions
        .map(
          (submission) => {

            const hasGrade =

              submission.grade !==
                null &&

              submission.grade !==
                undefined &&

              String(
                submission.grade
              ).trim() !== "";


            return {

              ...submission,

              status:
                hasGrade
                  ? "graded"
                  : "pending",

            };

          }
        );

    }, [
      dashboard.recent_submissions,
    ]);


  /* ========================================
     STUDENT DISPLAY DATA
  ======================================== */

  const students =
    useMemo(() => {

      return dashboard.students.map(
        (student) => {

          const initials =

            student.name

              ? student.name
                  .split(" ")
                  .filter(Boolean)
                  .map(
                    (word) =>
                      word.charAt(0)
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()

              : "ST";


          return {

            ...student,

            initials,

            progress:
              Number(
                student.progress || 0
              ),

            course:
              `${

                student.degree ||
                "Program not assigned"

              }${

                student.batch
                  ? ` • Batch ${student.batch}`
                  : ""

              }`,

          };

        }
      );

    }, [dashboard.students]);


  /* ========================================
     ACADEMIC REMINDERS
  ======================================== */

  const reminders =
    useMemo(() => {

      return (
        dashboard.reminders || []
      ).map((reminder) => {

        const days =
          Number(
            reminder.days_until_due
          );


        let message =
          "Academic task requires attention";


        if (
          reminder.reminder_type ===
          "overdue"
        ) {

          message =
            `Overdue by ${Math.abs(days)} day${

              Math.abs(days) === 1
                ? ""
                : "s"

            }`;

        } else if (
          reminder.reminder_type ===
          "due_today"
        ) {

          message =
            "Due today";

        } else if (
          reminder.reminder_type ===
          "due_soon"
        ) {

          message =
            `Due in ${days} day${

              days === 1
                ? ""
                : "s"

            }`;

        } else if (
          Number(
            reminder.waiting_to_grade
          ) > 0
        ) {

          message =
            `${reminder.waiting_to_grade} submission${

              Number(
                reminder.waiting_to_grade
              ) === 1
                ? ""
                : "s"

            } waiting to grade`;

        }


        return {

          ...reminder,

          message,

        };

      });

    }, [dashboard.reminders]);


  /* ========================================
     DATE + GREETING
  ======================================== */

  const currentDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
      }
    );


  const currentHour =
    new Date().getHours();


  const greeting =

    currentHour < 12

      ? "Good Morning"

      : currentHour < 18

      ? "Good Afternoon"

      : "Good Evening";


  /* ========================================
     UI
  ======================================== */

  return (

    <div className="lecturer-dashboard-page">


      {/* ====================================
          HERO / TEACHING COMMAND CENTER
      ==================================== */}

      <section className="lecturer-command-center">


        <div className="lecturer-command-main">


          <div className="lecturer-command-badge">

            <Sparkles size={13} />

            TEACHING COMMAND CENTER

          </div>


          <h1>

            {greeting},{" "}

            <span>
              {lecturer.name}
            </span>{" "}

            👋

          </h1>


          <p>

            Manage your courses, student
            activity, submissions and grading
            workload from one focused workspace.

          </p>


          <div className="lecturer-command-chips">


            <div>

              <BookOpen size={14} />

              <strong>
                {activeCourses}
              </strong>

              Active courses

            </div>


            <div>

              <Users size={14} />

              <strong>
                {totalStudents}
              </strong>

              Students

            </div>


            <div>

              <ClipboardList size={14} />

              <strong>
                {totalAssignments}
              </strong>

              Assignments

            </div>

          </div>


          <div className="lecturer-command-date">

            <CalendarDays size={14} />

            {currentDate}

          </div>

        </div>


        {/* TEACHING SNAPSHOT */}

        <div className="lecturer-command-snapshot">


          <div className="snapshot-top">

            <div>

              <span>
                GRADING WORKLOAD
              </span>

              <h2>

                {waitingToGrade === 0
                  ? "You're all caught up"
                  : `${waitingToGrade} waiting to grade`}

              </h2>

            </div>


            <div className="snapshot-zap">

              <Zap size={18} />

            </div>

          </div>


          <div className="snapshot-middle">


            <div
              className="lecturer-grading-ring"
              style={{
                "--grading-progress":
                  `${gradingRate * 3.6}deg`,
              }}
            >

              <div className="lecturer-grading-ring-inner">

                <strong>
                  {gradingRate}%
                </strong>

                <span>
                  REVIEWED
                </span>

              </div>

            </div>


            <div className="snapshot-details">

              <div>

                <span>
                  Graded
                </span>

                <strong>
                  {gradedSubmissions}
                </strong>

              </div>


              <div>

                <span>
                  Average Score
                </span>

                <strong>

                  {averageScore !== null
                    ? `${averageScore}%`
                    : "—"}

                </strong>

              </div>

            </div>

          </div>


          <button
            type="button"
            className="snapshot-action"
            onClick={() =>
              navigate(
                "/lecturer/grading"
              )
            }
          >

            Open Grading

            <ArrowRight size={14} />

          </button>

        </div>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {errorMessage && (

        <div className="lecturer-dashboard-error">

          {errorMessage}

        </div>

      )}


      {/* ====================================
          STATS
      ==================================== */}

      <section className="lecturer-stats">

        {stats.map((stat) => {

          const Icon =
            stat.icon;


          return (

            <article
              className={
                `lecturer-stat-card ${stat.className}`
              }
              key={stat.label}
            >

              <div className="lecturer-stat-accent" />


              <div className="lecturer-stat-icon">

                <Icon size={21} />

              </div>


              <div className="lecturer-stat-content">

                <span className="lecturer-stat-eyebrow">

                  {stat.label}

                </span>


                <strong>

                  {loading
                    ? "..."
                    : stat.value}

                </strong>


                <p>
                  {stat.helper}
                </p>

              </div>

            </article>

          );

        })}

      </section>


      {/* ====================================
          ACADEMIC REMINDERS
      ==================================== */}

      {!loading &&
        reminders.length > 0 && (

        <section className="lecturer-attention-section">


          <div className="lecturer-section-heading">

            <div>

              <span className="lecturer-section-kicker">

                <Target size={13} />

                ATTENTION QUEUE

              </span>


              <h2>
                Academic Reminders
              </h2>


              <p>

                Deadlines and teaching tasks
                that need your attention.

              </p>

            </div>

          </div>


          <div className="lecturer-reminder-grid">

            {reminders
              .slice(0, 4)
              .map(
                (reminder) => (

                  <article
                    className="lecturer-reminder-card"
                    key={reminder.id}
                  >

                    <div className="lecturer-reminder-icon">

                      <Clock3 size={18} />

                    </div>


                    <div className="lecturer-reminder-content">

                      <span>
                        ACADEMIC ALERT
                      </span>


                      <h3>
                        {reminder.title}
                      </h3>


                      <p>
                        {reminder.course_title}
                      </p>

                    </div>


                    <div className="lecturer-reminder-status">

                      {reminder.message}

                    </div>

                  </article>

                )
              )}

          </div>

        </section>

      )}


      {/* ====================================
          COURSE PORTFOLIO + ACTIVITY
      ==================================== */}

      <section className="lecturer-overview-grid">


        {/* COURSE PORTFOLIO */}

        <div
          className="lecturer-panel lecturer-course-portfolio"
          id="lecturer-courses"
        >

          <div className="lecturer-panel-header-row">


            <div>

              <span className="lecturer-section-kicker">

                <BookOpen size={13} />

                COURSE PORTFOLIO

              </span>


              <h2>
                Your Teaching Space
              </h2>


              <p>

                Courses currently assigned
                to your lecturer account.

              </p>

            </div>


            <button
              type="button"
              className="lecturer-text-button"
              onClick={() =>
                navigate(
                  "/lecturer/courses"
                )
              }
            >

              View courses

              <ChevronRight size={14} />

            </button>

          </div>


          <div className="lecturer-course-list">

            {!loading &&
              dashboard.courses.length ===
                0 && (

                <div className="lecturer-empty-note">

                  No courses are currently
                  assigned to you.

                </div>

              )}


            {dashboard.courses
              .slice(0, 5)
              .map(
                (course, index) => (

                  <article
                    className="lecturer-course-item"
                    key={course.id}
                  >

                    <div className="lecturer-course-number">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>


                    <div className="lecturer-course-icon">

                      <BookOpen
                        size={18}
                      />

                    </div>


                    <div className="lecturer-course-info">

                      <h3>
                        {course.title}
                      </h3>


                      <p>

                        {course.degree}

                        {course.batch &&
                          ` • Batch ${course.batch}`}

                      </p>

                    </div>


                    <div className="lecturer-course-students">

                      <Users size={13} />

                      <strong>

                        {Number(
                          course.student_count ||
                          0
                        )}

                      </strong>

                      students

                    </div>

                  </article>

                )
              )}

          </div>

        </div>


        {/* SUBMISSION PULSE */}

        <div className="lecturer-panel lecturer-activity-panel">


          <div className="lecturer-panel-header-row">


            <div>

              <span className="lecturer-section-kicker">

                <Activity size={13} />

                WEEKLY PULSE

              </span>


              <h2>
                Submission Activity
              </h2>


              <p>

                Student submissions received
                during this week.

              </p>

            </div>


            <div className="activity-total-pill">

              {totalSubmissions}

              <span>
                total
              </span>

            </div>

          </div>


          <div className="lecturer-activity-chart">

            {activity.map(
              (item) => (

                <div
                  className="lecturer-chart-column"
                  key={item.day}
                >

                  <strong>
                    {item.value}
                  </strong>


                  <div className="lecturer-chart-track">

                    <div
                      className="lecturer-chart-bar"
                      style={{
                        height:
                          item.value === 0
                            ? "5px"
                            : `${item.height}%`,
                      }}
                    />

                  </div>


                  <span>
                    {item.day}
                  </span>

                </div>

              )
            )}

          </div>


          <div className="lecturer-activity-footer">

            <BarChart3 size={14} />

            <span>

              Weekly submission distribution

            </span>

          </div>

        </div>

      </section>


      {/* ====================================
          QUICK ACTIONS
      ==================================== */}

      <section
        className="lecturer-dashboard-section"
        id="lecturer-assignments"
      >

        <div className="lecturer-section-heading">


          <div>

            <span className="lecturer-section-kicker">

              <Zap size={13} />

              TEACHING SHORTCUTS

            </span>


            <h2>
              Quick Actions
            </h2>


            <p>

              Jump directly into your most
              common teaching tasks.

            </p>

          </div>

        </div>


        <div className="lecturer-quick-actions">


          <button
            type="button"
            className="lecturer-action-card action-blue"
            onClick={() =>
              navigate(
                "/lecturer/courses"
              )
            }
          >

            <div className="lecturer-action-top">

              <div className="lecturer-action-icon">

                <Plus size={20} />

              </div>

              <ArrowRight size={15} />

            </div>


            <div>

              <span>
                COURSE BUILDER
              </span>

              <h3>
                Create Course
              </h3>

              <p>

                Build and manage a module
                for your students.

              </p>

            </div>

          </button>


          <button
            type="button"
            className="lecturer-action-card action-purple"
            onClick={() =>
              navigate(
                "/lecturer/assignments"
              )
            }
          >

            <div className="lecturer-action-top">

              <div className="lecturer-action-icon">

                <ClipboardList
                  size={20}
                />

              </div>

              <ArrowRight size={15} />

            </div>


            <div>

              <span>
                COURSEWORK
              </span>

              <h3>
                Create Assignment
              </h3>

              <p>

                Publish coursework and
                configure deadlines.

              </p>

            </div>

          </button>


          <button
            type="button"
            className="lecturer-action-card action-green"
            onClick={() =>
              navigate(
                "/lecturer/courses"
              )
            }
          >

            <div className="lecturer-action-top">

              <div className="lecturer-action-icon">

                <UploadCloud
                  size={20}
                />

              </div>

              <ArrowRight size={15} />

            </div>


            <div>

              <span>
                RESOURCES
              </span>

              <h3>
                Upload Material
              </h3>

              <p>

                Share PDFs and learning
                resources with students.

              </p>

            </div>

          </button>


          <button
            type="button"
            className="lecturer-action-card action-orange"
            onClick={() =>
              navigate(
                "/lecturer/grading"
              )
            }
          >

            <div className="lecturer-action-top">

              <div className="lecturer-action-icon">

                <GraduationCap
                  size={20}
                />

              </div>

              <ArrowRight size={15} />

            </div>


            <div>

              <span>
                ASSESSMENT
              </span>

              <h3>
                Grade Submissions
              </h3>

              <p>

                Review student work,
                scores and feedback.

              </p>

            </div>

          </button>

        </div>

      </section>


      {/* ====================================
          RECENT SUBMISSIONS
      ==================================== */}

      <section
        className="lecturer-dashboard-section"
        id="lecturer-submissions"
      >

        <div className="lecturer-section-heading">


          <div>

            <span className="lecturer-section-kicker">

              <FileCheck2 size={13} />

              SUBMISSION STREAM

            </span>


            <h2>
              Recent Submissions
            </h2>


            <p>

              Latest coursework received
              from your students.

            </p>

          </div>


          <button
            type="button"
            className="lecturer-section-button"
            onClick={() =>
              navigate(
                "/lecturer/submissions"
              )
            }
          >

            View All

            <ArrowRight
              size={14}
            />

          </button>

        </div>


        <div className="lecturer-table-wrapper">

          <table className="lecturer-table">

            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Assignment
                </th>

                <th>
                  Program / Batch
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {submissions.length ===
                0 &&
                !loading && (

                <tr>

                  <td
                    colSpan="5"
                    className="lecturer-table-empty"
                  >

                    No student submissions yet.

                  </td>

                </tr>

              )}


              {submissions
                .slice(0, 6)
                .map(
                  (submission) => (

                    <tr
                      key={
                        submission.submission_id
                      }
                    >

                      <td className="lecturer-table-primary">

                        {
                          submission.student_name
                        }

                      </td>


                      <td>

                        {
                          submission.assignment_title
                        }

                      </td>


                      <td>

                        {
                          submission.degree
                        }

                        {submission.batch &&
                          ` • ${submission.batch}`}

                      </td>


                      <td>

                        <span
                          className={
                            `lecturer-status-badge lecturer-status-${submission.status}`
                          }
                        >

                          {submission.status ===
                            "pending" && (

                            <Clock3
                              size={11}
                            />

                          )}


                          {submission.status ===
                            "graded" && (

                            <UserCheck
                              size={11}
                            />

                          )}


                          {submission.status ===
                          "pending"
                            ? "To Grade"
                            : "Graded"}

                        </span>

                      </td>


                      <td>

                        <button
                          type="button"
                          className="lecturer-table-action"
                          onClick={() =>
                            navigate(
                              "/lecturer/grading"
                            )
                          }
                        >

                          Review

                          <ChevronRight
                            size={12}
                          />

                        </button>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ====================================
          GRADING OVERVIEW
      ==================================== */}

      <section
        className="lecturer-dashboard-section"
        id="lecturer-grading"
      >

        <div className="lecturer-section-heading">


          <div>

            <span className="lecturer-section-kicker">

              <TrendingUp size={13} />

              ASSESSMENT HEALTH

            </span>


            <h2>
              Grading Overview
            </h2>


            <p>

              Monitor grading workload,
              completion and performance.

            </p>

          </div>

        </div>


        <div className="lecturer-grading-grid">


          <article className="grading-overview-card grading-orange">

            <ClipboardList size={20} />

            <div>

              <span>
                WAITING
              </span>

              <strong>
                {waitingToGrade}
              </strong>

              <p>
                Submissions to grade
              </p>

            </div>

          </article>


          <article className="grading-overview-card grading-green">

            <FileCheck2 size={20} />

            <div>

              <span>
                COMPLETED
              </span>

              <strong>
                {gradedSubmissions}
              </strong>

              <p>
                Graded submissions
              </p>

            </div>

          </article>


          <article className="grading-overview-card grading-blue">

            <Users size={20} />

            <div>

              <span>
                STUDENTS
              </span>

              <strong>
                {totalStudents}
              </strong>

              <p>
                Student records
              </p>

            </div>

          </article>


          <article className="grading-overview-card grading-purple">

            <GraduationCap
              size={20}
            />

            <div>

              <span>
                AVERAGE
              </span>

              <strong>

                {averageScore !== null
                  ? `${averageScore}%`
                  : "—"}

              </strong>

              <p>
                Numeric score
              </p>

            </div>

          </article>

        </div>

      </section>


      {/* ====================================
          STUDENT PROGRESS
      ==================================== */}

      <section
        className="lecturer-dashboard-section"
        id="lecturer-students"
      >

        <div className="lecturer-section-heading">


          <div>

            <span className="lecturer-section-kicker">

              <Users size={13} />

              STUDENT SNAPSHOT

            </span>


            <h2>
              Student Progress
            </h2>


            <p>

              Assignment completion progress
              across your students.

            </p>

          </div>


          <button
            type="button"
            className="lecturer-text-button"
            onClick={() =>
              navigate(
                "/lecturer/students"
              )
            }
          >

            View students

            <ChevronRight
              size={14}
            />

          </button>

        </div>


        {!loading &&
          students.length === 0 && (

          <div className="lecturer-empty-note">

            No students are currently
            assigned to the programs and
            batches you teach.

          </div>

        )}


        <div className="lecturer-student-grid">

          {students
            .slice(0, 4)
            .map(
              (student) => (

                <article
                  className="lecturer-student-card"
                  key={student.id}
                >

                  <div className="lecturer-student-card-top">

                    <div className="lecturer-student-avatar">

                      {student.initials}

                    </div>


                    <span className="lecturer-student-active">

                      Active

                    </span>

                  </div>


                  <h3>
                    {student.name}
                  </h3>


                  <p>
                    {student.course}
                  </p>


                  <div className="lecturer-student-progress">

                    <div className="lecturer-student-progress-info">

                      <span>
                        Coursework Progress
                      </span>

                      <strong>

                        {
                          student.progress
                        }%

                      </strong>

                    </div>


                    <div className="lecturer-student-progress-track">

                      <div
                        className="lecturer-student-progress-fill"
                        style={{
                          width:
                            `${student.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                </article>

              )
            )}

        </div>

      </section>

    </div>

  );

}


export default LecturerDashboard;