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
  ClipboardList,
  Search,
  Clock3,
  UploadCloud,
  FileText,
  CalendarDays,
  GraduationCap,
  CircleCheckBig,
  Send,
  RefreshCw,
  Award,
  Inbox,
  Sparkles,
  SlidersHorizontal,
  Target,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  ArrowUpRight,
  TimerReset,
} from "lucide-react";

import "../styles/assignments.css";

import API_BASE_URL from "../config/api";


function Assignments() {

  const navigate =
    useNavigate();


  /* ========================================
     STATE
  ======================================== */

  const [
    assignments,
    setAssignments,
  ] = useState([]);


  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState({});


  const [
    submittedAssignments,
    setSubmittedAssignments,
  ] = useState([]);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const [
    loading,
    setLoading,
  ] = useState(true);


  /* ========================================
     FETCH ASSIGNMENTS
  ======================================== */

  useEffect(() => {

    const fetchAssignments =
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
              `${API_BASE_URL}/assignments`,
              {
                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },
              }
            );


          setAssignments(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );


        } catch (error) {

          console.error(
            "Error fetching assignments:",
            error
          );


        } finally {

          setLoading(false);

        }

      };


    fetchAssignments();

  }, [navigate]);


  /* ========================================
     FILE SELECTION
  ======================================== */

  const handleFileChange = (
    assignmentId,
    file
  ) => {

    if (!file) {
      return;
    }


    setSelectedFiles(
      (previous) => ({

        ...previous,

        [assignmentId]:
          file,

      })
    );

  };


  /* ========================================
     SUBMIT / RESUBMIT
  ======================================== */

  const handleSubmit =
    async (
      assignmentId
    ) => {

      const file =
        selectedFiles[
          assignmentId
        ];


      if (!file) {

        alert(
          "Please select a file to upload first."
        );

        return;

      }


      const formData =
        new FormData();


      formData.append(
        "assignmentId",
        assignmentId
      );


      formData.append(
        "file",
        file
      );


      try {

        const token =
          localStorage.getItem(
            "token"
          );


        const response =
          await axios.post(
            `${API_BASE_URL}/submissions`,

            formData,

            {
              headers: {

                "Content-Type":
                  "multipart/form-data",

                Authorization:
                  `Bearer ${token}`,

              },
            }
          );


        alert(
          response.data.message
        );


        setSubmittedAssignments(
          (previous) =>

            previous.includes(
              assignmentId
            )

              ? previous

              : [
                  ...previous,
                  assignmentId,
                ]
        );


      } catch (error) {

        console.error(
          "Error submitting assignment:",
          error
        );


        if (
          error.response &&
          error.response.data.error
        ) {

          alert(
            error.response.data.error
          );

        } else {

          alert(
            "Failed to submit assignment."
          );

        }

      }

    };


  /* ========================================
     DATE FORMAT
  ======================================== */

  const formatDueDate = (
    dateString
  ) => {

    if (!dateString) {

      return "No due date";

    }


    return new Date(
      dateString
    ).toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  /* ========================================
     SHORT DATE
  ======================================== */

  const formatShortDate = (
    dateString
  ) => {

    if (!dateString) {

      return "No deadline";

    }


    return new Date(
      dateString
    ).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
      }
    );

  };


  /* ========================================
     STATUS
  ======================================== */

  const getAssignmentStatus = (
    assignment
  ) => {

    if (
      assignment.is_graded
    ) {

      return "graded";

    }


    if (
      assignment.is_submitted ||
      submittedAssignments.includes(
        assignment.id
      )
    ) {

      return "submitted";

    }


    return "pending";

  };


  /* ========================================
     DUE STATE
  ======================================== */

  const getDueState = (
    assignment
  ) => {

    const status =
      getAssignmentStatus(
        assignment
      );


    if (
      status !== "pending" ||
      !assignment.due_date
    ) {

      return "normal";

    }


    const now =
      new Date();


    const due =
      new Date(
        assignment.due_date
      );


    const difference =
      due.getTime() -
      now.getTime();


    if (difference < 0) {

      return "overdue";

    }


    const oneDay =
      24 * 60 * 60 * 1000;


    if (
      difference <= oneDay
    ) {

      return "urgent";

    }


    if (
      difference <=
      oneDay * 3
    ) {

      return "soon";

    }


    return "normal";

  };


  /* ========================================
     COUNTS
  ======================================== */

  const totalAssignments =
    assignments.length;


  const pendingCount =
    assignments.filter(
      (assignment) =>

        getAssignmentStatus(
          assignment
        ) === "pending"

    ).length;


  const submittedCount =
    assignments.filter(
      (assignment) =>

        getAssignmentStatus(
          assignment
        ) === "submitted"

    ).length;


  const gradedCount =
    assignments.filter(
      (assignment) =>

        getAssignmentStatus(
          assignment
        ) === "graded"

    ).length;


  const completedCount =
    submittedCount +
    gradedCount;


  const completionRate =
    totalAssignments > 0

      ? Math.round(
          (
            completedCount /
            totalAssignments
          ) * 100
        )

      : 0;


  /* ========================================
     NEXT DEADLINE
  ======================================== */

  const nextDueAssignment =
    useMemo(() => {

      const pending =
        assignments
          .filter(
            (assignment) => {

              if (
                assignment.is_graded
              ) {

                return false;

              }


              if (
                assignment.is_submitted ||
                submittedAssignments.includes(
                  assignment.id
                )
              ) {

                return false;

              }


              return Boolean(
                assignment.due_date
              );

            }
          )
          .sort(
            (
              first,
              second
            ) =>

              new Date(
                first.due_date
              ) -
              new Date(
                second.due_date
              )
          );


      return pending[0] ||
        null;

    }, [
      assignments,
      submittedAssignments,
    ]);


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const filteredAssignments =
    useMemo(() => {

      return assignments.filter(
        (assignment) => {

          const search =
            searchTerm
              .trim()
              .toLowerCase();


          const matchesSearch =
            !search ||

            assignment.title
              ?.toLowerCase()
              .includes(search) ||

            assignment.description
              ?.toLowerCase()
              .includes(search) ||

            assignment.degree
              ?.toLowerCase()
              .includes(search);


          let status =
            "pending";


          if (
            assignment.is_graded
          ) {

            status =
              "graded";

          } else if (
            assignment.is_submitted ||
            submittedAssignments.includes(
              assignment.id
            )
          ) {

            status =
              "submitted";

          }


          const matchesStatus =
            statusFilter === "all" ||
            status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      assignments,
      searchTerm,
      statusFilter,
      submittedAssignments,
    ]);


  return (

    <div className="assignments-page">


      {/* ====================================
          COMMAND CENTER HEADER
      ==================================== */}

{/* ====================================
    ASSIGNMENT PLANNER HEADER
==================================== */}

<section className="assignment-planner-header">

  <div className="planner-main-card">

    <div className="planner-accent-line" />

    <div className="planner-decoration planner-decoration-one" />

    <div className="planner-decoration planner-decoration-two" />


    <div className="planner-heading">

      <div className="planner-icon">

        <ClipboardList
          size={22}
        />

      </div>


      <div>

        <div className="planner-eyebrow">

          <Sparkles size={12} />

          ASSIGNMENT WORKSPACE

        </div>


        <h1>
          Plan. Submit. Succeed.
        </h1>


        <p>

          Keep your coursework organized,
          focus on what is due next and track
          every submission from one place.

        </p>

      </div>

    </div>


    {/* WORKLOAD PROGRESS */}

    <div className="planner-progress-area">

      <div className="planner-progress-heading">

        <div>

          <span>
            COURSEWORK PROGRESS
          </span>

          <strong>

            {completedCount} of{" "}
            {totalAssignments} tasks completed

          </strong>

        </div>


        <strong className="planner-progress-percent">

          {completionRate}%

        </strong>

      </div>


      <div className="planner-progress-track">

        <div
          className="planner-progress-fill"
          style={{
            width:
              `${completionRate}%`,
          }}
        />

      </div>


      <div className="planner-status-row">

        <span className="planner-status-item pending">

          <Clock3 size={12} />

          {pendingCount} To Do

        </span>


        <span className="planner-status-item submitted">

          <Send size={12} />

          {submittedCount} Submitted

        </span>


        <span className="planner-status-item graded">

          <Award size={12} />

          {gradedCount} Graded

        </span>

      </div>

    </div>

  </div>


  {/* ====================================
      RIGHT SIDE CARDS
  ==================================== */}

  <div className="planner-side-column">


    {/* NEXT DEADLINE */}

    <div className="planner-deadline-card">

      <div className="planner-deadline-top">

        <div className="planner-deadline-icon">

          <TimerReset
            size={19}
          />

        </div>


        <span>
          NEXT DEADLINE
        </span>

      </div>


      <strong className="planner-deadline-date">

        {nextDueAssignment
          ? formatShortDate(
              nextDueAssignment
                .due_date
            )
          : "All clear"}

      </strong>


      <p>

        {nextDueAssignment
          ? nextDueAssignment.title
          : "You currently have no pending deadlines."}

      </p>


      {nextDueAssignment && (

        <div className="deadline-ready-badge">

          <Clock3 size={11} />

          Upcoming task

        </div>

      )}

    </div>


    {/* FOCUS CARD */}

    <div className="planner-focus-card">

      <div className="focus-icon">

        <Target
          size={18}
        />

      </div>


      <div>

        <span>
          CURRENT FOCUS
        </span>


        <strong>

          {pendingCount === 0
            ? "You're all caught up"
            : pendingCount === 1
              ? "1 task needs attention"
              : `${pendingCount} tasks need attention`}

        </strong>


        <p>

          {completionRate === 100
            ? "Great work — everything is completed."
            : "Complete your pending coursework to keep progressing."}

        </p>

      </div>

    </div>

  </div>

</section>


      {/* ====================================
          SUMMARY STRIP
      ==================================== */}

      <section className="assignments-summary">


        <SummaryCard
          icon={
            <ClipboardList
              size={20}
            />
          }
          number={
            totalAssignments
          }
          label="Total Tasks"
          detail="All coursework"
          className="summary-assignment-purple"
        />


        <SummaryCard
          icon={
            <Clock3
              size={20}
            />
          }
          number={
            pendingCount
          }
          label="To Do"
          detail="Waiting for submission"
          className="summary-assignment-orange"
        />


        <SummaryCard
          icon={
            <Send
              size={20}
            />
          }
          number={
            submittedCount
          }
          label="Submitted"
          detail="Sent for review"
          className="summary-assignment-blue"
        />


        <SummaryCard
          icon={
            <Award
              size={20}
            />
          }
          number={
            gradedCount
          }
          label="Graded"
          detail="Results available"
          className="summary-assignment-green"
        />

      </section>


      {/* ====================================
          CONTROL DECK
      ==================================== */}

      <section className="assignment-control-deck">


        <div className="control-deck-label">

          <div>

            <SlidersHorizontal
              size={18}
            />

          </div>


          <span>

            <strong>
              Task Finder
            </strong>

            Search & filter coursework

          </span>

        </div>


        <div className="assignments-search">

          <Search
            size={17}
          />


          <input
            type="text"
            placeholder="Search assignment, description or program..."
            value={
              searchTerm
            }
            onChange={
              (event) =>
                setSearchTerm(
                  event.target.value
                )
            }
          />

        </div>


        <select
          className="assignments-filter"
          value={
            statusFilter
          }
          onChange={
            (event) =>
              setStatusFilter(
                event.target.value
              )
          }
        >

          <option value="all">
            All Assignments
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="submitted">
            Submitted
          </option>

          <option value="graded">
            Graded
          </option>

        </select>

      </section>


      {/* ====================================
          LIST HEADING
      ==================================== */}

      {!loading && (

        <div className="assignment-list-heading">

          <div>

            <span>

              <Target
                size={13}
              />

              WORK QUEUE

            </span>


            <h2>
              Your Coursework
            </h2>

          </div>


          <strong>

            {filteredAssignments.length}{" "}

            {filteredAssignments.length === 1
              ? "task"
              : "tasks"}

          </strong>

        </div>

      )}


      {/* ====================================
          ASSIGNMENT LIST
      ==================================== */}

      <section className="assignments-list">


        {loading ? (

          <div className="assignments-empty">

            <div className="assignment-loader" />


            <h3>
              Preparing your coursework...
            </h3>


            <p>
              Loading assignments and
              submission information.
            </p>

          </div>


        ) : filteredAssignments.length ===
          0 ? (

          <div className="assignments-empty">

            <div className="assignments-empty-icon">

              <Inbox
                size={27}
              />

            </div>


            <h3>
              Nothing in this view
            </h3>


            <p>

              You're all caught up or
              there are no assignments
              matching this filter.

            </p>

          </div>


        ) : (

          filteredAssignments.map(
            (
              assignment,
              index
            ) => {

              const status =
                getAssignmentStatus(
                  assignment
                );


              const dueState =
                getDueState(
                  assignment
                );


              const selectedFile =
                selectedFiles[
                  assignment.id
                ];


              const briefUrl =
                assignment.file_path

                  ? `${API_BASE_URL}/${assignment.file_path.replace(
                      /\\/g,
                      "/"
                    )}`

                  : null;


              const taskNumber =
                String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                );


              return (

                <article
                  className={
                    `assignment-card
                     assignment-card-${status}
                     assignment-due-${dueState}`
                  }
                  key={
                    assignment.id
                  }
                >


                  {/* STATUS RAIL */}

                  <div className="assignment-status-rail" />


                  {/* TASK NUMBER */}

                  <div className="assignment-ticket-number">

                    <span>
                      TASK
                    </span>

                    <strong>
                      {taskNumber}
                    </strong>

                  </div>


                  {/* ==================================
                      MAIN
                  ================================== */}

                  <div className="assignment-main">


                    <div className="assignment-title-row">


                      <div className="assignment-card-icon">

                        <ClipboardList
                          size={19}
                        />

                      </div>


                      <div className="assignment-title-content">


                        <div className="assignment-title-top">

                          <h3>

                            {assignment.title}

                          </h3>


                          <span
                            className={
                              `assignment-status assignment-status-${status}`
                            }
                          >

                            {status ===
                              "graded" && (

                              <CircleCheckBig
                                size={11}
                              />

                            )}


                            {status ===
                              "submitted" && (

                              <Send
                                size={11}
                              />

                            )}


                            {status ===
                              "pending" && (

                              <Clock3
                                size={11}
                              />

                            )}


                            {status === "graded"

                              ? "Graded"

                              : status ===
                                  "submitted"

                                ? "Submitted"

                                : "Pending"}

                          </span>

                        </div>


                        <p className="assignment-description">

                          {assignment.description ||
                            "No assignment description has been added."}

                        </p>

                      </div>

                    </div>


                    {/* META */}

                    <div className="assignment-meta">


                      <span
                        className={
                          `assignment-meta-item
                           assignment-meta-due
                           due-${dueState}`
                        }
                      >

                        {dueState ===
                          "overdue" ? (

                          <AlertTriangle
                            size={12}
                          />

                        ) : (

                          <CalendarDays
                            size={12}
                          />

                        )}


                        {dueState ===
                        "overdue"
                          ? "Overdue: "
                          : "Due: "}


                        {formatDueDate(
                          assignment.due_date
                        )}

                      </span>


                      {assignment.degree && (

                        <span className="assignment-meta-item">

                          <GraduationCap
                            size={12}
                          />

                          {assignment.degree}

                        </span>

                      )}


                      {assignment.batch && (

                        <span className="assignment-meta-item">

                          Batch{" "}

                          {assignment.batch}

                        </span>

                      )}

                    </div>

                  </div>


                  {/* ==================================
                      ACTION WORKSPACE
                  ================================== */}

                  <div className="assignment-actions">


                    <div className="assignment-action-heading">

                      <div>

                        <span>
                          SUBMISSION
                        </span>

                        <strong>

                          {status === "graded"

                            ? "Completed"

                            : status ===
                                "submitted"

                              ? "Submitted work"

                              : "Upload your work"}

                        </strong>

                      </div>


                      <Paperclip
                        size={16}
                      />

                    </div>


                    {briefUrl && (

                      <a
                        href={briefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="assignment-brief-button"
                      >

                        <FileText
                          size={14}
                        />

                        Open Assignment Brief

                        <ArrowUpRight
                          size={13}
                        />

                      </a>

                    )}


                    {status === "graded" ? (


                      <div className="assignment-graded-box">

                        <div className="graded-check">

                          <Award
                            size={19}
                          />

                        </div>


                        <div>

                          <strong>
                            Graded & Locked
                          </strong>


                          <span>

                            Your result and
                            lecturer feedback
                            are available on
                            the Grades page.

                          </span>

                        </div>

                      </div>


                    ) : (

                      <>


                        <div
                          className={
                            selectedFile
                              ? "assignment-upload-box has-file"
                              : "assignment-upload-box"
                          }
                        >

                          <label
                            className="assignment-file-label"
                            htmlFor={
                              `assignment-file-${assignment.id}`
                            }
                          >

                            <div className="upload-icon-circle">

                              <UploadCloud
                                size={18}
                              />

                            </div>


                            <div>

                              <strong>

                                {selectedFile
                                  ? "File ready"
                                  : "Choose submission file"}

                              </strong>


                              <span>

                                {selectedFile
                                  ? "Click to choose another file"
                                  : "Select a file from your device"}

                              </span>

                            </div>

                          </label>


                          <input
                            id={
                              `assignment-file-${assignment.id}`
                            }
                            className="assignment-file-input"
                            type="file"
                            onChange={
                              (event) =>

                                handleFileChange(
                                  assignment.id,
                                  event
                                    .target
                                    .files[0]
                                )
                            }
                          />


                          {selectedFile && (

                            <div className="assignment-selected-file">

                              <Paperclip
                                size={12}
                              />

                              <span>

                                {selectedFile.name}

                              </span>

                            </div>

                          )}

                        </div>


                        <button
                          className={
                            `assignment-submit-button ${
                              status ===
                              "submitted"

                                ? "assignment-resubmit-button"

                                : ""
                            }`
                          }
                          onClick={() =>

                            handleSubmit(
                              assignment.id
                            )
                          }
                        >

                          {status ===
                          "submitted" ? (

                            <>

                              <RefreshCw
                                size={14}
                              />

                              Resubmit Work

                            </>

                          ) : (

                            <>

                              <UploadCloud
                                size={14}
                              />

                              Upload & Submit

                            </>

                          )}

                        </button>

                      </>

                    )}

                  </div>

                </article>

              );

            }
          )

        )}

      </section>

    </div>

  );

}


/* ========================================
   SUMMARY CARD
======================================== */

function SummaryCard({
  icon,
  number,
  label,
  detail,
  className,
}) {

  return (

    <div
      className={
        `assignment-summary-card ${className}`
      }
    >

      <div className="summary-card-line" />


      <div className="assignment-summary-icon">

        {icon}

      </div>


      <div>

        <strong>
          {number}
        </strong>

        <span>
          {label}
        </span>

        <small>
          {detail}
        </small>

      </div>

    </div>

  );

}


export default Assignments;