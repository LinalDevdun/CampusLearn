import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Download,
  BarChart3,
  Activity,
  CircleCheckBig,
  Sparkles,
  ShieldCheck,
  UserRoundCog,
  Clock3,
  Gauge,
  ArrowUpRight,
} from "lucide-react";

import "../styles/adminReports.css";


function AdminReports() {

  const navigate =
    useNavigate();


  /* ========================================
     REPORT DATA
  ======================================== */

  const [
    reportData,
    setReportData,
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
     LOAD REPORT DATA
  ======================================== */

  useEffect(() => {

    const loadReports =
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
              "http://localhost:5000/admin/reports/overview",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          setReportData(
            response.data
          );


        } catch (error) {

          console.error(
            "Admin Reports Error:",
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
            "Failed to load report data."
          );


        } finally {

          setLoading(false);

        }

      };


    loadReports();

  }, [navigate]);


  /* ========================================
     SAFE VALUES
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


  const userDistribution =
    reportData
      ?.user_distribution || {

      students: 0,

      lecturers: 0,

      administrators: 0,

      active_accounts: 0,

    };


  const academicPerformance =
    reportData
      ?.academic_performance || {

      average_score: 0,

      assignment_completion: 0,

      full_assignment_completion: 0,

    };


  const courseData =
    reportData
      ?.course_enrollment || [];


  const recentActivity =
    reportData
      ?.recent_activity || [];


  /* ========================================
     HELPERS
  ======================================== */

  const formatPercent =
    (value) => {

      const number =
        Number(value) || 0;


      if (
        Number.isInteger(
          number
        )
      ) {

        return `${number}%`;

      }


      return `${number.toFixed(
        1
      )}%`;

    };


  const clampPercent =
    (value) => {

      return Math.min(
        Math.max(
          Number(value) || 0,
          0
        ),
        100
      );

    };


  /* ========================================
     ACTIVITY TIME
  ======================================== */

  const formatActivityTime =
    (dateValue) => {

      if (!dateValue) {

        return "Unknown time";

      }


      const date =
        new Date(
          dateValue
        );


      const now =
        new Date();


      const difference =
        now.getTime() -
        date.getTime();


      const minutes =
        Math.floor(
          difference /
          (1000 * 60)
        );


      const hours =
        Math.floor(
          difference /
          (
            1000 *
            60 *
            60
          )
        );


      const days =
        Math.floor(
          difference /
          (
            1000 *
            60 *
            60 *
            24
          )
        );


      if (minutes < 1) {

        return "Just now";

      }


      if (minutes < 60) {

        return `${minutes} ${
          minutes === 1
            ? "minute"
            : "minutes"
        } ago`;

      }


      if (hours < 24) {

        return `${hours} ${
          hours === 1
            ? "hour"
            : "hours"
        } ago`;

      }


      if (days === 1) {

        return "Yesterday";

      }


      if (days < 7) {

        return `${days} days ago`;

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
     DERIVED ANALYTICS
  ======================================== */

  const totalRoleUsers =
    Number(
      userDistribution.students
    ) +
    Number(
      userDistribution.lecturers
    ) +
    Number(
      userDistribution.administrators
    );


  const studentShare =
    totalRoleUsers > 0
      ? (
          Number(
            userDistribution.students
          ) /
          totalRoleUsers
        ) * 100
      : 0;


  const lecturerShare =
    totalRoleUsers > 0
      ? (
          Number(
            userDistribution.lecturers
          ) /
          totalRoleUsers
        ) * 100
      : 0;


  const adminShare =
    Math.max(
      0,
      100 -
      studentShare -
      lecturerShare
    );


  const activeRate =
    Number(
      summary.total_users
    ) > 0
      ? Math.round(
          (
            Number(
              summary.active_accounts
            ) /
            Number(
              summary.total_users
            )
          ) * 100
        )
      : 0;


  const totalEnrollment =
    courseData.reduce(
      (
        total,
        course
      ) =>
        total +
        (
          Number(
            course.students
          ) || 0
        ),
      0
    );


  /* ========================================
     EXPORT REPORT
  ======================================== */

  const handleExportReport =
    () => {

      if (!reportData) {

        alert(
          "Report data is not available yet."
        );

        return;

      }


      const escapeCSV =
        (value) => {

          if (
            value === null ||
            value === undefined
          ) {

            return "";

          }


          const text =
            String(value);


          return `"${text.replace(
            /"/g,
            '""'
          )}"`;

        };


      const rows = [];


      rows.push([
        "CampusLearn Reports & Analytics",
      ]);


      rows.push([
        "Generated",
        new Date().toLocaleString(),
      ]);


      rows.push([]);


      /* SUMMARY */

      rows.push([
        "SUMMARY",
      ]);


      rows.push([
        "Metric",
        "Value",
      ]);


      rows.push([
        "Total Users",
        summary.total_users,
      ]);


      rows.push([
        "Students",
        summary.students,
      ]);


      rows.push([
        "Lecturers",
        summary.lecturers,
      ]);


      rows.push([
        "Administrators",
        summary.administrators,
      ]);


      rows.push([
        "Active Accounts",
        summary.active_accounts,
      ]);


      rows.push([
        "Active Courses",
        summary.active_courses,
      ]);


      rows.push([
        "Average Score",
        `${summary.average_score}%`,
      ]);


      rows.push([]);


      /* PERFORMANCE */

      rows.push([
        "ACADEMIC PERFORMANCE",
      ]);


      rows.push([
        "Metric",
        "Percentage",
      ]);


      rows.push([
        "Average Student Score",
        `${academicPerformance.average_score}%`,
      ]);


      rows.push([
        "Assignment Completion",
        `${academicPerformance.assignment_completion}%`,
      ]);


      rows.push([
        "Full Assignment Completion",
        `${academicPerformance.full_assignment_completion}%`,
      ]);


      rows.push([]);


      /* COURSE ENROLLMENT */

      rows.push([
        "COURSE ENROLLMENT",
      ]);


      rows.push([
        "Course",
        "Program",
        "Batch",
        "Students",
        "Relative Enrollment %",
      ]);


      courseData.forEach(
        (course) => {

          rows.push([
            course.name,
            course.degree || "",
            course.batch || "",
            course.students,
            `${course.percentage}%`,
          ]);

        }
      );


      rows.push([]);


      /* USER DISTRIBUTION */

      rows.push([
        "USER DISTRIBUTION",
      ]);


      rows.push([
        "Role",
        "Count",
      ]);


      rows.push([
        "Students",
        userDistribution.students,
      ]);


      rows.push([
        "Lecturers",
        userDistribution.lecturers,
      ]);


      rows.push([
        "Administrators",
        userDistribution.administrators,
      ]);


      rows.push([
        "Active Accounts",
        userDistribution.active_accounts,
      ]);


      rows.push([]);


      /* RECENT ACTIVITY */

      rows.push([
        "RECENT ACTIVITY",
      ]);


      rows.push([
        "Type",
        "Title",
        "Description",
        "Date / Time",
      ]);


      recentActivity.forEach(
        (activity) => {

          rows.push([
            activity.event_type,
            activity.title,
            activity.description,
            activity.event_time
              ? new Date(
                  activity.event_time
                ).toLocaleString()
              : "",
          ]);

        }
      );


      const csvContent =
        rows
          .map(
            (row) =>
              row
                .map(
                  escapeCSV
                )
                .join(",")
          )
          .join("\n");


      const blob =
        new Blob(
          [
            "\uFEFF",
            csvContent,
          ],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      const date =
        new Date()
          .toISOString()
          .split("T")[0];


      link.href =
        url;


      link.download =
        `CampusLearn_Report_${date}.csv`;


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


      URL.revokeObjectURL(
        url
      );

    };


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="admin-reports-page">

        <div className="ar-page-state">

          <div className="ar-spinner" />

          <h3>
            Building analytics snapshot
          </h3>

          <p>
            Getting the latest CampusLearn
            statistics from PostgreSQL.
          </p>

        </div>

      </div>

    );

  }


  /* ========================================
     ERROR
  ======================================== */

  if (error) {

    return (

      <div className="admin-reports-page">

        <div className="ar-page-state ar-error-state">

          <BarChart3 size={30} />

          <h3>
            Unable to load analytics
          </h3>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="admin-reports-page">


      {/* ====================================
          REPORT HEADER
      ==================================== */}

      <section className="ar-report-header">


        <div>


          <div className="ar-eyebrow">

            <Sparkles size={12} />

            CAMPUS INTELLIGENCE

          </div>


          <h1>
            Reports & Analytics
          </h1>


          <p>

            A live view of platform
            engagement, enrollment and
            academic performance.

          </p>


        </div>


        <button
          type="button"
          className="ar-export-button"
          onClick={
            handleExportReport
          }
        >

          <Download size={15} />

          Export Report

        </button>


      </section>


      {/* ====================================
          ANALYTICS BRIEF
      ==================================== */}

      <section className="ar-briefing">


        {/* LEFT */}

        <div className="ar-briefing-main">


          <div className="ar-briefing-label">

            <Activity size={13} />

            LIVE PLATFORM SNAPSHOT

          </div>


          <h2>
            CampusLearn at a glance.
          </h2>


          <p>

            Current system activity
            summarized into one
            administrative performance
            view.

          </p>


          <div className="ar-briefing-metrics">


            <BriefMetric
              label="Users"
              value={
                summary.total_users
              }
            />


            <BriefMetric
              label="Students"
              value={
                summary.students
              }
            />


            <BriefMetric
              label="Courses"
              value={
                summary.active_courses
              }
            />


            <BriefMetric
              label="Enrollments"
              value={
                totalEnrollment
              }
            />


          </div>


        </div>


        {/* SCORE */}

        <div className="ar-score-focus">


          <div className="ar-score-top">

            <span>
              ACADEMIC SCORE
            </span>

            <TrendingUp
              size={17}
            />

          </div>


          <div
            className="ar-score-ring"
            style={{
              "--score":
                `${clampPercent(
                  summary.average_score
                ) * 3.6}deg`,
            }}
          >

            <div>

              <strong>

                {formatPercent(
                  summary.average_score
                )}

              </strong>

              <span>
                AVERAGE
              </span>

            </div>

          </div>


          <p>
            Platform-wide graded
            assessment performance.
          </p>


        </div>


        {/* ACCOUNT HEALTH */}

        <div className="ar-health-focus">


          <div className="ar-health-icon">

            <ShieldCheck
              size={20}
            />

          </div>


          <span>
            ACCOUNT HEALTH
          </span>


          <h3>
            {activeRate}% Active
          </h3>


          <div className="ar-health-track">

            <div
              style={{
                width:
                  `${activeRate}%`,
              }}
            />

          </div>


          <div className="ar-health-meta">

            <span>
              {
                summary.active_accounts
              } active
            </span>

            <span>
              {
                Math.max(
                  Number(
                    summary.total_users
                  ) -
                  Number(
                    summary.active_accounts
                  ),
                  0
                )
              } inactive
            </span>

          </div>


        </div>


      </section>


      {/* ====================================
          COURSE ENROLLMENT LANDSCAPE
      ==================================== */}

      <section className="ar-enrollment-panel">


        <div className="ar-section-heading">


          <div>


            <div className="ar-section-kicker">

              <BarChart3 size={12} />

              ENROLLMENT LANDSCAPE

            </div>


            <h2>
              Course Participation
            </h2>


            <p>
              Compare student enrollment
              across active courses.
            </p>


          </div>


          <div className="ar-enrollment-total">

            <span>
              TOTAL ENROLLMENTS
            </span>

            <strong>
              {totalEnrollment}
            </strong>

          </div>


        </div>


        {courseData.length ===
        0 ? (

          <div className="ar-inline-empty">

            No course enrollment data
            available yet.

          </div>

        ) : (

          <div className="ar-course-landscape">


            {courseData.map(
              (
                course,
                index
              ) => (

                <div
                  className="ar-course-row"
                  key={
                    course.id ||
                    `${course.name}-${index}`
                  }
                >


                  <div className="ar-course-number">

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>


                  <div className="ar-course-content">


                    <div className="ar-course-info">


                      <div>

                        <strong>
                          {course.name}
                        </strong>

                        <span>

                          {course.degree ||
                            "Program not assigned"}

                          {course.batch
                            ? ` · Batch ${course.batch}`
                            : ""}

                        </span>

                      </div>


                      <div className="ar-course-count">

                        <strong>
                          {course.students}
                        </strong>

                        <span>
                          {course.students ===
                          1
                            ? "student"
                            : "students"}
                        </span>

                      </div>


                    </div>


                    <div className="ar-progress-track">

                      <div
                        className="ar-progress-fill"
                        style={{
                          width:
                            `${clampPercent(
                              course.percentage
                            )}%`,
                        }}
                      />

                    </div>


                  </div>


                </div>

              )
            )}


          </div>

        )}


      </section>


      {/* ====================================
          INSIGHT GRID
      ==================================== */}

      <section className="ar-insight-grid">


        {/* USER MIX */}

        <div className="ar-insight-panel ar-user-mix-panel">


          <div className="ar-panel-heading">

            <div>

              <span>
                COMMUNITY MIX
              </span>

              <h2>
                User Distribution
              </h2>

              <p>
                Registered accounts by role.
              </p>

            </div>


            <Users size={18} />

          </div>


          <div className="ar-user-mix-content">


            <div
              className="ar-user-donut"
              style={{
                background:
                  `conic-gradient(
                    #7c4fe0 0 ${studentShare}%,
                    #4058df ${studentShare}% ${studentShare + lecturerShare}%,
                    #0f8f83 ${studentShare + lecturerShare}% 100%
                  )`,
              }}
            >

              <div>

                <strong>
                  {totalRoleUsers}
                </strong>

                <span>
                  USERS
                </span>

              </div>

            </div>


            <div className="ar-user-legend">


              <UserLegend
                colorClass="ar-dot-student"
                label="Students"
                value={
                  userDistribution
                    .students
                }
                percent={
                  studentShare
                }
              />


              <UserLegend
                colorClass="ar-dot-lecturer"
                label="Lecturers"
                value={
                  userDistribution
                    .lecturers
                }
                percent={
                  lecturerShare
                }
              />


              <UserLegend
                colorClass="ar-dot-admin"
                label="Administrators"
                value={
                  userDistribution
                    .administrators
                }
                percent={
                  adminShare
                }
              />


            </div>


          </div>


          <div className="ar-active-account-note">

            <CircleCheckBig
              size={17}
            />

            <div>

              <span>
                ACTIVE ACCOUNTS
              </span>

              <strong>

                {
                  userDistribution
                    .active_accounts
                }{" "}
                accounts currently enabled

              </strong>

            </div>

          </div>


        </div>


        {/* ACADEMIC PERFORMANCE */}

        <div className="ar-insight-panel">


          <div className="ar-panel-heading">

            <div>

              <span>
                LEARNING OUTCOMES
              </span>

              <h2>
                Academic Performance
              </h2>

              <p>
                Platform-wide performance
                indicators.
              </p>

            </div>


            <Gauge size={18} />

          </div>


          <div className="ar-performance-stack">


            <PerformanceMetric
              icon={
                <TrendingUp
                  size={17}
                />
              }
              label="Average Student Score"
              value={
                academicPerformance
                  .average_score
              }
              formattedValue={
                formatPercent(
                  academicPerformance
                    .average_score
                )
              }
              className="ar-performance-score"
            />


            <PerformanceMetric
              icon={
                <CircleCheckBig
                  size={17}
                />
              }
              label="Assignment Completion"
              value={
                academicPerformance
                  .assignment_completion
              }
              formattedValue={
                formatPercent(
                  academicPerformance
                    .assignment_completion
                )
              }
              className="ar-performance-completion"
            />


            <PerformanceMetric
              icon={
                <BookOpen
                  size={17}
                />
              }
              label="Full Assignment Completion"
              value={
                academicPerformance
                  .full_assignment_completion
              }
              formattedValue={
                formatPercent(
                  academicPerformance
                    .full_assignment_completion
                )
              }
              className="ar-performance-full"
            />


          </div>


        </div>


      </section>


      {/* ====================================
          RECENT ACTIVITY
      ==================================== */}

      <section className="ar-activity-panel">


        <div className="ar-section-heading">


          <div>


            <div className="ar-section-kicker">

              <Clock3 size={12} />

              SYSTEM TIMELINE

            </div>


            <h2>
              Recent Activity
            </h2>


            <p>
              Latest events recorded across
              CampusLearn.
            </p>


          </div>


          <div className="ar-live-badge">

            <span />

            Live activity

          </div>


        </div>


        {recentActivity.length ===
        0 ? (

          <div className="ar-inline-empty">

            No recent activity
            available yet.

          </div>

        ) : (

          <div className="ar-activity-timeline">


            {recentActivity.map(
              (
                activity,
                index
              ) => (

                <div
                  className="ar-activity-item"
                  key={
                    `${activity.event_type}-${activity.event_time}-${index}`
                  }
                >


                  <div className="ar-timeline-column">

                    <div className="ar-activity-dot" />

                    {index !==
                      recentActivity.length -
                        1 && (

                      <div className="ar-timeline-line" />

                    )}

                  </div>


                  <div className="ar-activity-content">


                    <div className="ar-activity-top">


                      <div>

                        <span>
                          {
                            activity.event_type ||
                            "ACTIVITY"
                          }
                        </span>

                        <strong>
                          {
                            activity.title
                          }
                        </strong>

                      </div>


                      <div className="ar-activity-time">

                        <Clock3
                          size={11}
                        />

                        {formatActivityTime(
                          activity.event_time
                        )}

                      </div>


                    </div>


                    <p>
                      {
                        activity.description
                      }
                    </p>


                  </div>


                </div>

              )
            )}


          </div>

        )}


      </section>


    </div>

  );

}


/* ========================================
   BRIEF METRIC
======================================== */

function BriefMetric({
  label,
  value,
}) {

  return (

    <div className="ar-brief-metric">

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

    </div>

  );

}


/* ========================================
   USER LEGEND
======================================== */

function UserLegend({
  colorClass,
  label,
  value,
  percent,
}) {

  return (

    <div className="ar-user-legend-item">


      <div
        className={
          `ar-user-legend-dot ${colorClass}`
        }
      />


      <div>

        <span>
          {label}
        </span>

        <small>
          {Math.round(
            percent
          )}% of users
        </small>

      </div>


      <strong>
        {value}
      </strong>


    </div>

  );

}


/* ========================================
   PERFORMANCE METRIC
======================================== */

function PerformanceMetric({
  icon,
  label,
  value,
  formattedValue,
  className,
}) {

  const percent =
    Math.min(
      Math.max(
        Number(value) || 0,
        0
      ),
      100
    );


  return (

    <div
      className={
        `ar-performance-card ${className}`
      }
    >


      <div className="ar-performance-top">


        <div className="ar-performance-icon">

          {icon}

        </div>


        <div>

          <span>
            {label}
          </span>

          <strong>
            {formattedValue}
          </strong>

        </div>


        <ArrowUpRight
          className="ar-performance-arrow"
          size={14}
        />


      </div>


      <div className="ar-performance-track">

        <div
          style={{
            width:
              `${percent}%`,
          }}
        />

      </div>


    </div>

  );

}


export default AdminReports;