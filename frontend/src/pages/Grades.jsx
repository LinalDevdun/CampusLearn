import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  Trophy,
  CircleCheckBig,
  Sparkles,
  FileText,
  MessageCircle,
  BarChart3,
} from "lucide-react";

import "../styles/grades.css";

import API_BASE_URL from "../config/api";


function Grades() {

  const [grades, setGrades] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================
     LOAD REAL STUDENT GRADES
  ======================================== */

  useEffect(() => {

    const loadGrades =
      async () => {

        try {

          setLoading(true);
          setError("");


          const token =
            localStorage.getItem(
              "token"
            );


          if (!token) {

            setError(
              "Please log in again."
            );

            return;

          }


          const response =
            await axios.get(
              `${API_BASE_URL}/my-grades`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          setGrades(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );


        } catch (loadError) {

          console.error(
            "Grades loading error:",
            loadError
          );


          setError(
            loadError.response
              ?.data?.error ||
            "Failed to load grades."
          );


        } finally {

          setLoading(false);

        }

      };


    loadGrades();

  }, []);


  /* ========================================
     GRADE HELPERS
  ======================================== */

  const normalizeGrade = (
    grade
  ) => {

    if (
      grade === null ||
      grade === undefined
    ) {

      return "";

    }


    return String(
      grade
    ).trim();

  };


  /* ========================================
     REAL RESULT PERCENTAGE

     Uses:
     1. percentage from backend
     2. marks / max marks as fallback
  ======================================== */

  const getResultPercentage = (
    result
  ) => {

    if (
      result?.percentage !== null &&
      result?.percentage !== undefined &&
      result?.percentage !== ""
    ) {

      const percentage =
        Number(
          result.percentage
        );


      if (
        !Number.isNaN(
          percentage
        )
      ) {

        return percentage;

      }

    }


    if (
      result?.marks_awarded !== null &&
      result?.marks_awarded !== undefined &&
      result?.marks_awarded !== "" &&
      result?.max_marks !== null &&
      result?.max_marks !== undefined &&
      result?.max_marks !== ""
    ) {

      const marks =
        Number(
          result.marks_awarded
        );


      const maxMarks =
        Number(
          result.max_marks
        );


      if (
        !Number.isNaN(marks) &&
        !Number.isNaN(maxMarks) &&
        maxMarks > 0
      ) {

        return (
          Math.round(
            (
              marks /
              maxMarks
            ) *
            10000
          ) /
          100
        );

      }

    }


    return null;

  };


  /* ========================================
     SCORE DISPLAY
  ======================================== */

  const getScoreDisplay = (
    result
  ) => {

    if (
      result?.marks_awarded !== null &&
      result?.marks_awarded !== undefined &&
      result?.marks_awarded !== "" &&
      result?.max_marks !== null &&
      result?.max_marks !== undefined &&
      result?.max_marks !== ""
    ) {

      const marks =
        Number(
          result.marks_awarded
        );


      const maxMarks =
        Number(
          result.max_marks
        );


      if (
        !Number.isNaN(marks) &&
        !Number.isNaN(maxMarks)
      ) {

        return `${marks} / ${maxMarks}`;

      }

    }


    const percentage =
      getResultPercentage(
        result
      );


    if (
      percentage !== null
    ) {

      return `${percentage}%`;

    }


    return "—";

  };


  /* ========================================
     GRADE CLASS
  ======================================== */

  const getGradeClass = (
    grade
  ) => {

    const value =
      normalizeGrade(
        grade
      ).toUpperCase();


    if (
      value.startsWith("A")
    ) {

      return "grade-a";

    }


    if (
      value.startsWith("B")
    ) {

      return "grade-b";

    }


    if (value) {

      return "grade-c";

    }


    return "grade-neutral";

  };


  /* ========================================
     REAL SUMMARY VALUES
  ======================================== */

  const numericGrades =
    useMemo(
      () =>

        grades
          .map(
            (item) =>
              getResultPercentage(
                item
              )
          )
          .filter(
            (score) =>
              score !== null
          ),

      [grades]
    );


  const averageScore =
    useMemo(
      () => {

        if (
          numericGrades.length === 0
        ) {

          return null;

        }


        const total =
          numericGrades.reduce(
            (
              sum,
              score
            ) =>
              sum + score,
            0
          );


        return Math.round(
          total /
          numericGrades.length
        );

      },

      [numericGrades]
    );


  const highestScore =
    useMemo(
      () => {

        if (
          numericGrades.length === 0
        ) {

          return null;

        }


        return Math.max(
          ...numericGrades
        );

      },

      [numericGrades]
    );


  const aGradeCount =
    useMemo(
      () =>

        grades.filter(
          (item) =>
            normalizeGrade(
              item.grade
            )
              .toUpperCase()
              .startsWith("A")
        ).length,

      [grades]
    );


  const bGradeCount =
    useMemo(
      () =>

        grades.filter(
          (item) =>
            normalizeGrade(
              item.grade
            )
              .toUpperCase()
              .startsWith("B")
        ).length,

      [grades]
    );


  const otherGradeCount =
    Math.max(
      grades.length -
      aGradeCount -
      bGradeCount,
      0
    );


  /* ========================================
     GRADE MIX PERCENTAGE
  ======================================== */

  const getGradeMixPercent = (
    count
  ) => {

    if (
      grades.length === 0
    ) {

      return 0;

    }


    return Math.round(
      (
        count /
        grades.length
      ) *
      100
    );

  };


  /* ========================================
     DATE
  ======================================== */

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "—";

    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  };


  return (

    <div className="grades-page">


      {/* ====================================
          ACADEMIC REPORT HEADER
      ==================================== */}

      <section className="academic-report">


        {/* REPORT COVER */}

        <div className="report-cover">


          <div className="report-cover-orb report-cover-orb-one" />

          <div className="report-cover-orb report-cover-orb-two" />


          <div className="report-cover-top">

            <div className="report-cover-icon">

              <GraduationCap
                size={24}
              />

            </div>


            <span>
              CAMPUSLEARN
            </span>

          </div>


          <div className="report-cover-content">

            <div className="report-eyebrow">

              <Sparkles
                size={12}
              />

              ACADEMIC REPORT

            </div>


            <h1>
              Grades & Results
            </h1>


            <p>

              Review your assessed
              coursework, scores and
              lecturer feedback in one
              organized academic record.

            </p>

          </div>


          <div className="report-cover-bottom">

            <div>

              <span>
                STATUS
              </span>

              <strong>

                {grades.length > 0
                  ? "Results Available"
                  : "Awaiting Results"}

              </strong>

            </div>


            <div>

              <span>
                GPA
              </span>

              <strong>
                Not calculated
              </strong>

            </div>

          </div>

        </div>


        {/* PERFORMANCE SNAPSHOT */}

        <div className="report-snapshot">


          <div className="report-snapshot-heading">

            <div>

              <span>
                PERFORMANCE SNAPSHOT
              </span>

              <h2>
                Your academic results
              </h2>

              <p>

                Based only on coursework
                currently graded by your
                lecturers.

              </p>

            </div>


            <div className="report-snapshot-icon">

              <BarChart3
                size={20}
              />

            </div>

          </div>


          <div className="report-average-area">


            <div className="report-average-score">

              <span>
                AVERAGE SCORE
              </span>


              <strong>

                {loading
                  ? "..."
                  : averageScore !== null
                    ? `${averageScore}%`
                    : "—"}

              </strong>


              <small>

                {grades.length === 0
                  ? "No graded results yet"
                  : `${numericGrades.length} numeric ${
                      numericGrades.length === 1
                        ? "result"
                        : "results"
                    } included`}

              </small>

            </div>


            <div className="report-mini-metrics">


              <div>

                <span>
                  Graded
                </span>

                <strong>

                  {loading
                    ? "..."
                    : grades.length}

                </strong>

              </div>


              <div>

                <span>
                  Highest
                </span>

                <strong>

                  {loading
                    ? "..."
                    : highestScore !== null
                      ? `${highestScore}%`
                      : "—"}

                </strong>

              </div>


              <div>

                <span>
                  A Grades
                </span>

                <strong>

                  {loading
                    ? "..."
                    : aGradeCount}

                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (

        <div className="grades-error">

          {error}

        </div>

      )}


      {/* ====================================
          RESULT METRICS STRIP
      ==================================== */}

      <section className="results-metrics-strip">


        <ResultMetric
          className="metric-purple"
          icon={
            <GraduationCap
              size={19}
            />
          }
          eyebrow="ACADEMIC"
          value="—"
          label="GPA Not Calculated"
        />


        <ResultMetric
          className="metric-blue"
          icon={
            <BookOpen
              size={19}
            />
          }
          eyebrow="RESULTS"
          value={
            loading
              ? "..."
              : grades.length
          }
          label="Graded Results"
        />


        <ResultMetric
          className="metric-green"
          icon={
            <CircleCheckBig
              size={19}
            />
          }
          eyebrow="PERFORMANCE"
          value={
            loading
              ? "..."
              : averageScore !== null
                ? `${averageScore}%`
                : "—"
          }
          label="Average Score"
        />


        <ResultMetric
          className="metric-orange"
          icon={
            <Award
              size={19}
            />
          }
          eyebrow="ACHIEVEMENT"
          value={
            loading
              ? "..."
              : aGradeCount
          }
          label="A Grades"
        />

      </section>


      {/* ====================================
          RESULTS WORKSPACE
      ==================================== */}

      <section className="grades-workspace">


        {/* ==================================
            GRADED PERFORMANCE
        ================================== */}

        <div className="grades-records-panel">


          <div className="records-heading">

            <div>

              <span>

                <FileText
                  size={13}
                />

                RESULT RECORD

              </span>


              <h2>
                Graded Performance
              </h2>


              <p>

                Coursework your lecturers
                have reviewed and graded.

              </p>

            </div>


            <strong>

              {grades.length}{" "}

              {grades.length === 1
                ? "result"
                : "results"}

            </strong>

          </div>


          <div className="course-grades-list">


            {loading ? (

              <div className="grades-empty-state">

                <div className="grades-loader" />

                <h3>
                  Loading your results...
                </h3>

                <p>
                  Retrieving your graded
                  coursework.
                </p>

              </div>

            ) : grades.length === 0 ? (

              <div className="grades-empty-state">

                <div className="grades-empty-icon">

                  <FileText
                    size={25}
                  />

                </div>

                <h3>
                  No graded results yet
                </h3>

                <p>

                  Your assessed coursework
                  will appear here after your
                  lecturer completes grading.

                </p>

              </div>

            ) : (

              grades.map(
                (
                  result,
                  index
                ) => {

                  const numericScore =
                    getResultPercentage(
                      result
                    );


                  return (

                    <article
                      className="course-grade-card"
                      key={
                        result.submission_id
                      }
                    >


                      <div className="result-number">

                        <span>
                          RESULT
                        </span>

                        <strong>

                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </strong>

                      </div>


                      <div
                        className={
                          `course-grade-letter ${getGradeClass(
                            result.grade
                          )}`
                        }
                      >

                        {normalizeGrade(
                          result.grade
                        ) || "—"}

                      </div>


                      <div className="course-grade-info">

                        <span className="course-grade-label">
                          ASSESSMENT
                        </span>


                        <h3>

                          {
                            result.assignment_title
                          }

                        </h3>


                        <div className="course-grade-feedback">

                          <MessageCircle
                            size={11}
                          />

                          <span>

                            {result.feedback ||
                              "No lecturer feedback provided."}

                          </span>

                        </div>

                      </div>


                      <div className="course-grade-score">

                        <span>
                          SCORE
                        </span>

                        <strong>

                          {numericScore !== null
                            ? `${numericScore}%`
                            : "Result"}

                        </strong>

                        <small>

                          {getScoreDisplay(
                            result
                          )}

                        </small>

                      </div>

                    </article>

                  );

                }
              )

            )}

          </div>

        </div>


        {/* ==================================
            GRADE MIX
        ================================== */}

        <aside className="grade-mix-panel">


          <div className="grade-mix-heading">

            <div className="grade-mix-icon">

              <Award
                size={19}
              />

            </div>


            <div>

              <span>
                GRADE PROFILE
              </span>

              <h2>
                Grade Mix
              </h2>

            </div>

          </div>


          <p className="grade-mix-copy">

            Distribution of the letter
            grades currently available in
            your academic record.

          </p>


          <div className="grade-mix-list">


            <GradeMixRow
              className="mix-a"
              label="A Grades"
              count={
                aGradeCount
              }
              percentage={
                getGradeMixPercent(
                  aGradeCount
                )
              }
            />


            <GradeMixRow
              className="mix-b"
              label="B Grades"
              count={
                bGradeCount
              }
              percentage={
                getGradeMixPercent(
                  bGradeCount
                )
              }
            />


            <GradeMixRow
              className="mix-other"
              label="Other Grades"
              count={
                otherGradeCount
              }
              percentage={
                getGradeMixPercent(
                  otherGradeCount
                )
              }
            />

          </div>


          <div className="grade-mix-note">

            <TrendingUp
              size={15}
            />


            <div>

              <strong>

                {grades.length === 0
                  ? "Waiting for results"
                  : "Results updated"}

              </strong>


              <span>

                {grades.length === 0
                  ? "Grade distribution will appear after grading."
                  : "This view updates from your real graded submissions."}

              </span>

            </div>

          </div>

        </aside>

      </section>


      {/* ====================================
          RECENT RESULTS
      ==================================== */}

      <section className="recent-results-section">


        <div className="recent-results-heading">

          <div>

            <span>

              <BookOpen
                size={13}
              />

              ACADEMIC RECORD

            </span>


            <h2>
              Recent Results
            </h2>


            <p>
              Detailed marks, grades and
              lecturer comments.
            </p>

          </div>


          <div className="results-count-badge">

            {grades.length} entries

          </div>

        </div>


        <div className="results-table-wrapper">

          <table className="results-table">

            <thead>

              <tr>

                <th>
                  Assignment
                </th>

                <th>
                  Submitted
                </th>

                <th>
                  Score
                </th>

                <th>
                  Grade
                </th>

                <th>
                  Feedback
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="results-empty-cell"
                  >

                    Loading results...

                  </td>

                </tr>

              ) : grades.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="results-empty-cell"
                  >

                    No graded results
                    available yet.

                  </td>

                </tr>

              ) : (

                grades.map(
                  (result) => {

                    const scoreDisplay =
                      getScoreDisplay(
                        result
                      );


                    return (

                      <tr
                        key={
                          result.submission_id
                        }
                      >

                        <td className="result-title">

                          {
                            result.assignment_title
                          }

                        </td>


                        <td>

                          {formatDate(
                            result.submitted_at
                          )}

                        </td>


                        <td>

                          <span className="result-score">

                            {scoreDisplay}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              `result-grade-badge ${getGradeClass(
                                result.grade
                              )}`
                            }
                          >

                            {normalizeGrade(
                              result.grade
                            ) || "—"}

                          </span>

                        </td>


                        <td className="result-feedback">

                          {result.feedback ||
                            "No lecturer feedback provided."}

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ====================================
          PERFORMANCE BANNER
      ==================================== */}

      <section className="grades-banner">


        <div className="grades-banner-orb grades-banner-orb-one" />

        <div className="grades-banner-orb grades-banner-orb-two" />


        <div className="grades-banner-icon">

          <Trophy
            size={24}
          />

        </div>


        <div className="grades-banner-content">


          <span>
            ACADEMIC MOMENTUM
          </span>


          <h3>

            {grades.length > 0
              ? "Keep building on your results"
              : "Your results are coming soon"}

          </h3>


          <p>

            {grades.length > 0

              ? `You currently have ${grades.length} graded ${
                  grades.length === 1
                    ? "submission"
                    : "submissions"
                }. Review your lecturer feedback to keep improving.`

              : "Your grades, marks and lecturer feedback will appear here after your submitted coursework has been graded."}

          </p>

        </div>


        <div className="grades-banner-score">

          <strong>

            {averageScore !== null
              ? `${averageScore}%`
              : "—"}

          </strong>

          <span>
            CURRENT AVERAGE
          </span>

        </div>

      </section>

    </div>

  );

}


/* ========================================
   RESULT METRIC
======================================== */

function ResultMetric({
  className,
  icon,
  eyebrow,
  value,
  label,
}) {

  return (

    <div
      className={
        `result-metric ${className}`
      }
    >

      <div className="result-metric-accent" />


      <div className="result-metric-icon">

        {icon}

      </div>


      <div>

        <span className="result-metric-eyebrow">

          {eyebrow}

        </span>


        <strong>
          {value}
        </strong>


        <small>
          {label}
        </small>

      </div>

    </div>

  );

}


/* ========================================
   GRADE MIX ROW
======================================== */

function GradeMixRow({
  className,
  label,
  count,
  percentage,
}) {

  return (

    <div
      className={
        `grade-mix-row ${className}`
      }
    >

      <div className="grade-mix-row-top">

        <span>
          {label}
        </span>

        <strong>
          {count}
        </strong>

      </div>


      <div className="grade-mix-track">

        <div
          className="grade-mix-fill"
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>


      <small>

        {percentage}% of results

      </small>

    </div>

  );

}


export default Grades;