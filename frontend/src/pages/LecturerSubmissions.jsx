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
  FileCheck2,
  Search,
  Users,
  Clock3,
  CircleCheckBig,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Eye,
  Download,
  X,
  FileText,
  Award,
  Sparkles,
  Inbox,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import "../styles/lecturerSubmissions.css";

import API_BASE_URL from "../config/api";


function LecturerSubmissions() {

  const navigate =
    useNavigate();


  /* ========================================
     STATE
  ======================================== */

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] =
    useState(null);


  /* ========================================
     LOAD REAL SUBMISSIONS
  ======================================== */

  useEffect(() => {

    const loadSubmissions =
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
              `${API_BASE_URL}/lecturer/submissions`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const realSubmissions =
            Array.isArray(
              response.data?.submissions
            )
              ? response.data.submissions
              : [];


          setSubmissions(
            realSubmissions
          );


        } catch (loadError) {

          console.error(
            "Failed to load lecturer submissions:",
            loadError
          );


          if (
            loadError.response?.status === 401 ||
            loadError.response?.status === 403
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
            loadError.response?.data?.error ||
            "Failed to load submissions."
          );


        } finally {

          setLoading(false);

        }

      };


    loadSubmissions();

  }, [navigate]);


  /* ========================================
     HELPERS
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


  const isSubmissionGraded =
    (submission) => {

      return (
        submission.grade !== null &&
        submission.grade !== undefined &&
        submission.grade !== ""
      );

    };


  /* ========================================
     COUNTS
  ======================================== */

  const totalSubmissions =
    submissions.length;


  const toGradeCount =
    submissions.filter(
      (submission) =>
        !isSubmissionGraded(
          submission
        )
    ).length;


  const gradedCount =
    submissions.filter(
      (submission) =>
        isSubmissionGraded(
          submission
        )
    ).length;


  const uniqueStudents =
    new Set(
      submissions.map(
        (submission) =>
          submission.student_id
      )
    ).size;


  const gradingProgress =
    totalSubmissions > 0

      ? Math.round(
          (
            gradedCount /
            totalSubmissions
          ) * 100
        )

      : 0;


  /* ========================================
     MOST RECENT SUBMISSION
  ======================================== */

  const latestSubmission =
    useMemo(() => {

      if (
        submissions.length === 0
      ) {
        return null;
      }


      return [
        ...submissions,
      ].sort(
        (a, b) =>
          new Date(
            b.submitted_at || 0
          ) -
          new Date(
            a.submitted_at || 0
          )
      )[0];

    }, [submissions]);


  /* ========================================
     FILTER
  ======================================== */

  const filteredSubmissions =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return submissions.filter(
        (submission) => {

          const studentName =
            submission.student_name ||
            "";

          const assignmentTitle =
            submission.assignment_title ||
            "";

          const degree =
            submission.degree ||
            "";

          const batch =
            submission.batch ||
            "";

          const studentEmail =
            submission.student_email ||
            "";


          const matchesSearch =

            !search ||

            studentName
              .toLowerCase()
              .includes(search) ||

            assignmentTitle
              .toLowerCase()
              .includes(search) ||

            degree
              .toLowerCase()
              .includes(search) ||

            batch
              .toLowerCase()
              .includes(search) ||

            studentEmail
              .toLowerCase()
              .includes(search);


          const currentStatus =
            isSubmissionGraded(
              submission
            )
              ? "Graded"
              : "To Grade";


          const matchesStatus =

            statusFilter === "All" ||

            currentStatus ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      submissions,
      searchTerm,
      statusFilter,
    ]);


  /* ========================================
     DATE FORMAT
  ======================================== */

  const formatDate =
    (date) => {

      if (!date) {
        return "—";
      }


      return new Date(
        date
      ).toLocaleString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    };


  const formatShortDate =
    (date) => {

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
        }
      );

    };


  /* ========================================
     FILE URL
  ======================================== */

  const getFileUrl =
    (filePath) => {

      if (!filePath) {
        return "";
      }


      const normalized =
        String(filePath)
          .replace(
            /\\/g,
            "/"
          );


      const uploadsIndex =
        normalized
          .toLowerCase()
          .lastIndexOf(
            "/uploads/"
          );


      let relativePath;


      if (
        uploadsIndex !== -1
      ) {

        relativePath =
          normalized.slice(
            uploadsIndex + 1
          );

      } else if (
        normalized
          .toLowerCase()
          .startsWith(
            "uploads/"
          )
      ) {

        relativePath =
          normalized;

      } else {

        const fileName =
          normalized
            .split("/")
            .pop();


        relativePath =
          `uploads/${fileName}`;

      }


      return (
        `${API_BASE_URL}/${relativePath}`
      );

    };


  /* ========================================
     FILE NAME
  ======================================== */

  const getFileName =
    (filePath) => {

      if (!filePath) {
        return "Submission file";
      }


      return String(filePath)
        .replace(
          /\\/g,
          "/"
        )
        .split("/")
        .pop();

    };


  /* ========================================
     OPEN FILE
  ======================================== */

  const handleOpenFile =
    (submission) => {

      const fileUrl =
        getFileUrl(
          submission.file_path
        );


      if (!fileUrl) {

        alert(
          "No submission file is available."
        );

        return;

      }


      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );

    };


  /* ========================================
     GO TO GRADING PAGE
  ======================================== */

  const handleGradeSubmission =
    (submission) => {

      navigate(
        "/lecturer/grading",
        {
          state: {
            submissionId:
              submission
                .submission_id,
          },
        }
      );

    };


  return (

    <div className="lecturer-submissions-page">


      {/* ====================================
          REVIEW HUB
      ==================================== */}

      <section className="ls-review-hub">


        {/* LEFT */}

        <div className="ls-review-intro">


          <div className="ls-review-heading">


            <div className="ls-review-heading-icon">

              <Inbox size={22} />

            </div>


            <div>

              <span className="ls-kicker">

                <Sparkles size={12} />

                SUBMISSION REVIEW HUB

              </span>


              <h1>
                Review. Grade. Complete.
              </h1>


              <p>

                Keep student coursework
                organized, review every
                submission and move each
                assessment smoothly through
                your grading workflow.

              </p>

            </div>

          </div>


          <div className="ls-review-metrics">


            <div className="ls-review-metric">

              <span>
                TOTAL RECEIVED
              </span>

              <strong>
                {totalSubmissions}
              </strong>

              <small>
                Student files
              </small>

            </div>


            <div className="ls-review-metric">

              <span>
                REVIEW QUEUE
              </span>

              <strong>
                {toGradeCount}
              </strong>

              <small>
                Awaiting grading
              </small>

            </div>


            <div className="ls-review-metric">

              <span>
                COMPLETED
              </span>

              <strong>
                {gradedCount}
              </strong>

              <small>
                Results published
              </small>

            </div>


            <div className="ls-review-metric">

              <span>
                STUDENTS
              </span>

              <strong>
                {uniqueStudents}
              </strong>

              <small>
                Unique learners
              </small>

            </div>

          </div>

        </div>


        {/* RIGHT */}

        <aside className="ls-queue-panel">


          <div className="ls-queue-top">

            <div>

              <span>
                REVIEW QUEUE
              </span>

              <strong>
                {toGradeCount}
              </strong>

              <p>
                awaiting review
              </p>

            </div>


            <div className="ls-queue-icon">

              <FileCheck2
                size={23}
              />

            </div>

          </div>


          <div
            className="ls-grading-ring"
            style={{
              background:
                `conic-gradient(
                  #ffffff ${gradingProgress * 3.6}deg,
                  rgba(255,255,255,0.16) 0deg
                )`,
            }}
          >

            <div className="ls-grading-ring-inner">

              <strong>
                {gradingProgress}%
              </strong>

              <span>
                REVIEWED
              </span>

            </div>

          </div>


          <div className="ls-grading-progress-copy">

            <TrendingUp
              size={15}
            />

            <div>

              <strong>
                Grading progress
              </strong>

              <span>

                {gradedCount} of{" "}
                {totalSubmissions} submissions
                reviewed

              </span>

            </div>

          </div>


          <div className="ls-latest-submission">

            <span>
              LATEST SUBMISSION
            </span>


            {latestSubmission ? (

              <>

                <strong>

                  {
                    latestSubmission
                      .student_name
                  }

                </strong>

                <p>

                  {
                    latestSubmission
                      .assignment_title
                  }

                </p>

                <small>

                  {
                    formatShortDate(
                      latestSubmission
                        .submitted_at
                    )
                  }

                </small>

              </>

            ) : (

              <>

                <strong>
                  No activity yet
                </strong>

                <p>
                  New submissions will appear here.
                </p>

              </>

            )}

          </div>

        </aside>

      </section>


      {/* ====================================
          FINDER
      ==================================== */}

      <section className="ls-toolbar">


        <div className="ls-toolbar-label">

          <div>

            <SlidersHorizontal
              size={18}
            />

          </div>


          <span>

            <strong>
              Submission Finder
            </strong>

            Find student coursework

          </span>

        </div>


        <div className="ls-search">

          <Search size={17} />


          <input
            type="text"
            placeholder="Search student, assignment or program..."
            value={
              searchTerm
            }
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          className="ls-filter"
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="All">
            All Submissions
          </option>

          <option value="To Grade">
            To Grade
          </option>

          <option value="Graded">
            Graded
          </option>

        </select>

      </section>


      {/* ====================================
          LIST HEADING
      ==================================== */}

      <section className="ls-list-heading">


        <div>

          <span>

            <FileCheck2
              size={13}
            />

            REVIEW INBOX

          </span>


          <h2>
            Student Submissions
          </h2>


          <p>

            Open coursework, check results
            and continue to grading.

          </p>

        </div>


        <div className="ls-result-count">

          {filteredSubmissions.length}

          <span>

            {filteredSubmissions.length === 1
              ? "submission"
              : "submissions"}

          </span>

        </div>

      </section>


      {/* ====================================
          LOADING
      ==================================== */}

      {loading && (

        <section className="ls-state-box">

          <div className="ls-state-icon">

            <Inbox size={24} />

          </div>

          <h3>
            Loading submissions...
          </h3>

          <p>

            Preparing your review inbox.

          </p>

        </section>

      )}


      {/* ====================================
          ERROR
      ==================================== */}

      {!loading && error && (

        <section className="ls-state-box">

          <div className="ls-state-icon">

            <FileCheck2
              size={24}
            />

          </div>

          <h3>
            Unable to load submissions
          </h3>

          <p>
            {error}
          </p>

        </section>

      )}


      {/* ====================================
          SUBMISSION CARDS
      ==================================== */}

      {!loading &&
        !error && (

        <section className="ls-submission-list">


          {filteredSubmissions.map(
            (submission) => {

              const isGraded =
                isSubmissionGraded(
                  submission
                );


              return (

                <article
                  className={
                    isGraded
                      ? "ls-submission-card ls-card-graded"
                      : "ls-submission-card ls-card-pending"
                  }
                  key={
                    submission
                      .submission_id
                  }
                >


                  {/* STUDENT */}

                  <div className="ls-student-block">


                    <div className="ls-student-avatar">

                      {getInitials(
                        submission
                          .student_name
                      )}

                    </div>


                    <div>

                      <span className="ls-small-label">
                        STUDENT
                      </span>

                      <strong>

                        {
                          submission
                            .student_name
                        }

                      </strong>

                      <small>

                        ID{" "}
                        {
                          submission
                            .student_id
                        }

                      </small>

                    </div>

                  </div>


                  {/* ASSIGNMENT */}

                  <div className="ls-assignment-block">

                    <span className="ls-small-label">
                      ASSIGNMENT
                    </span>

                    <h3>

                      {
                        submission
                          .assignment_title
                      }

                    </h3>


                    <div className="ls-assignment-meta">


                      <span>

                        <BookOpen
                          size={12}
                        />

                        {
                          submission.degree ||
                          "No degree"
                        }

                        {" • "}

                        {
                          submission.batch ||
                          "No batch"
                        }

                      </span>


                      <span>

                        <CalendarDays
                          size={12}
                        />

                        {formatDate(
                          submission
                            .submitted_at
                        )}

                      </span>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="ls-status-block">

                    <span className="ls-small-label">
                      REVIEW STATUS
                    </span>


                    <span
                      className={
                        isGraded
                          ? "ls-status ls-status-graded"
                          : "ls-status ls-status-pending"
                      }
                    >

                      {isGraded ? (

                        <CircleCheckBig
                          size={11}
                        />

                      ) : (

                        <Clock3
                          size={11}
                        />

                      )}


                      {isGraded
                        ? "Graded"
                        : "To Grade"}

                    </span>

                  </div>


                  {/* GRADE */}

                  <div className="ls-grade-block">

                    <span className="ls-small-label">
                      GRADE
                    </span>


                    {isGraded ? (

                      <div className="ls-grade-value">

                        {
                          submission.grade
                        }

                      </div>

                    ) : (

                      <div className="ls-grade-empty">

                        —

                      </div>

                    )}

                  </div>


                  {/* ACTION */}

                  <div className="ls-card-action">

                    <button
                      type="button"
                      className="ls-review-button"
                      onClick={() =>
                        setSelectedSubmission(
                          submission
                        )
                      }
                    >

                      <Eye size={14} />

                      Review

                      <ChevronRight
                        size={13}
                      />

                    </button>

                  </div>

                </article>

              );

            }
          )}


          {filteredSubmissions.length ===
            0 && (

            <div className="ls-state-box">

              <div className="ls-state-icon">

                <Search size={24} />

              </div>

              <h3>
                No submissions found
              </h3>

              <p>

                There are no submissions
                matching your current search
                or filter.

              </p>

            </div>

          )}

        </section>

      )}


      {/* ====================================
          REVIEW MODAL
      ==================================== */}

      {selectedSubmission && (

        <div className="ls-modal-overlay">

          <div className="ls-review-modal">


            {/* HEADER */}

            <div className="ls-modal-header">


              <div className="ls-modal-title">

                <div className="ls-modal-title-icon">

                  <Eye size={19} />

                </div>


                <div>

                  <span>
                    SUBMISSION REVIEW
                  </span>

                  <h2>
                    Review Submission
                  </h2>

                  <p>

                    Inspect student details,
                    coursework and current
                    grading status.

                  </p>

                </div>

              </div>


              <button
                type="button"
                className="ls-modal-close"
                onClick={() =>
                  setSelectedSubmission(
                    null
                  )
                }
              >

                <X size={18} />

              </button>

            </div>


            {/* STUDENT */}

            <div className="ls-review-student">


              <div className="ls-review-avatar">

                {getInitials(
                  selectedSubmission
                    .student_name
                )}

              </div>


              <div>

                <span>
                  STUDENT SUBMISSION
                </span>

                <h3>

                  {
                    selectedSubmission
                      .student_name
                  }

                </h3>

                <p>

                  {
                    selectedSubmission
                      .student_email ||

                    `Student ID ${selectedSubmission.student_id}`
                  }

                </p>

              </div>


              <div
                className={
                  isSubmissionGraded(
                    selectedSubmission
                  )
                    ? "ls-review-state ls-review-state-graded"
                    : "ls-review-state ls-review-state-pending"
                }
              >

                {isSubmissionGraded(
                  selectedSubmission
                )
                  ? "Graded"
                  : "Awaiting Review"}

              </div>

            </div>


            {/* INFO GRID */}

            <div className="ls-review-grid">


              <div className="ls-review-info">

                <BookOpen
                  size={17}
                />

                <div>

                  <span>
                    Program / Batch
                  </span>

                  <strong>

                    {
                      selectedSubmission
                        .degree ||
                      "No degree"
                    }

                    {" • "}

                    {
                      selectedSubmission
                        .batch ||
                      "No batch"
                    }

                  </strong>

                </div>

              </div>


              <div className="ls-review-info">

                <FileCheck2
                  size={17}
                />

                <div>

                  <span>
                    Assignment
                  </span>

                  <strong>

                    {
                      selectedSubmission
                        .assignment_title
                    }

                  </strong>

                </div>

              </div>


              <div className="ls-review-info">

                <CalendarDays
                  size={17}
                />

                <div>

                  <span>
                    Submitted
                  </span>

                  <strong>

                    {formatDate(
                      selectedSubmission
                        .submitted_at
                    )}

                  </strong>

                </div>

              </div>


              <div className="ls-review-info">

                <Award size={17} />

                <div>

                  <span>
                    Grade
                  </span>

                  <strong>

                    {
                      selectedSubmission
                        .grade ||
                      "Not graded yet"
                    }

                  </strong>

                </div>

              </div>

            </div>


            {/* FILE */}

            <div className="ls-file-card">


              <div className="ls-file-icon">

                <FileText size={22} />

              </div>


              <div>

                <span>
                  SUBMISSION FILE
                </span>

                <strong>

                  {getFileName(
                    selectedSubmission
                      .file_path
                  )}

                </strong>

                <p>
                  Student coursework attachment
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  handleOpenFile(
                    selectedSubmission
                  )
                }
              >

                <Download size={15} />

                Open File

                <ArrowUpRight
                  size={13}
                />

              </button>

            </div>


            {/* CURRENT RESULT */}

            {isSubmissionGraded(
              selectedSubmission
            ) && (

              <div className="ls-result-box">

                <CircleCheckBig
                  size={20}
                />

                <div>

                  <strong>
                    Assessment Completed
                  </strong>

                  <span>

                    Result:{" "}

                    {
                      selectedSubmission
                        .grade
                    }


                    {selectedSubmission
                      .feedback && (

                      <>

                        {" • "}

                        {
                          selectedSubmission
                            .feedback
                        }

                      </>

                    )}

                  </span>

                </div>

              </div>

            )}


            {/* FOOTER */}

            <div className="ls-modal-actions">

              <button
                type="button"
                className="ls-secondary-button"
                onClick={() =>
                  setSelectedSubmission(
                    null
                  )
                }
              >

                Close

              </button>


              <button
                type="button"
                className="lecturer-primary-button"
                onClick={() =>
                  handleGradeSubmission(
                    selectedSubmission
                  )
                }
              >

                <GraduationCap
                  size={15}
                />


                {isSubmissionGraded(
                  selectedSubmission
                )
                  ? "View Grade"
                  : "Grade Submission"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default LecturerSubmissions;