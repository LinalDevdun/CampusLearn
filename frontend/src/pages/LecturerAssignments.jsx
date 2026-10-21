import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ClipboardList,
  Search,
  Plus,
  Clock3,
  FileCheck2,
  CalendarDays,
  BookOpen,
  Users,
  Eye,
  Pencil,
  MoreVertical,
  X,
  FileText,
  Award,
  Sparkles,
  Send,
  Inbox,
  Layers3,
  SlidersHorizontal,
  ArrowUpRight,
  CircleCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import "../styles/lecturerAssignments.css";


const DEGREE_OPTIONS = [
  "BSc (Hons) Software Engineering",
  "BSc (Hons) Computer Science",
  "BSc (Hons) Data Science",
  "BSc (Hons) Computer Security",
  "BSc (Hons) Computer Networks",
  "BSc (Hons) Artificial Intelligence",
  "BSc (Hons) Technology Management",
];


const BATCH_OPTIONS = [
  "24.1",
  "24.2",
  "25.1",
  "25.2",
  "26.1",
  "26.2",
];


function LecturerAssignments() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================
     DATA
  ======================================== */

  const [assignments, setAssignments] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [assignmentFile, setAssignmentFile] =
    useState(null);


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  /* ========================================
     CREATE
  ======================================== */

  const [createOpen, setCreateOpen] =
    useState(false);

  const [
    newAssignment,
    setNewAssignment,
  ] = useState({
    title: "",
    degree: "",
    batch: "",
    dueDate: "",
    marks: "",
    description: "",
  });


  /* ========================================
     VIEW
  ======================================== */

  const [viewOpen, setViewOpen] =
    useState(false);

  const [
    selectedAssignment,
    setSelectedAssignment,
  ] =
    useState(null);


  /* ========================================
     EDIT
  ======================================== */

  const [editOpen, setEditOpen] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [editFile, setEditFile] =
    useState(null);

  const [
    editingAssignment,
    setEditingAssignment,
  ] =
    useState({
      id: null,
      title: "",
      degree: "",
      batch: "",
      dueDate: "",
      marks: "",
      description: "",
      filePath: "",
      submissions: 0,
    });


  /* ========================================
     MORE MENU
  ======================================== */

  const [openMenuId, setOpenMenuId] =
    useState(null);


  /* ========================================
     OPEN CREATE FROM TOPBAR
  ======================================== */

  useEffect(() => {

    if (
      location.state?.openCreateAssignment
    ) {

      setCreateOpen(true);

      navigate(
        location.pathname,
        {
          replace: true,
          state: null,
        }
      );

    }

  }, [
    location.state,
    location.pathname,
    navigate,
  ]);


  /* ========================================
     LOAD REAL LECTURER DATA
  ======================================== */

  const loadLecturerData =
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


        const config = {

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        };


        const [
          meResponse,
          coursesResponse,
          assignmentsResponse,
        ] =
          await Promise.all([

            axios.get(
              "http://localhost:5000/me",
              config
            ),

            axios.get(
              "http://localhost:5000/courses",
              config
            ),

            axios.get(
              "http://localhost:5000/assignments",
              config
            ),

          ]);


        const lecturer =
          meResponse.data;


        const lecturerCourses =
          (
            Array.isArray(
              coursesResponse.data
            )
              ? coursesResponse.data
              : []
          ).filter(
            (course) =>
              Number(
                course.lecturer_id
              ) ===
              Number(
                lecturer.id
              )
          );


        setCourses(
          lecturerCourses
        );


        const lecturerAssignments =
          (
            Array.isArray(
              assignmentsResponse.data
            )
              ? assignmentsResponse.data
              : []
          )

            .filter(
              (assignment) =>
                Number(
                  assignment.lecturer_id
                ) ===
                Number(
                  lecturer.id
                )
            )

            .map(
              (assignment) => {

                const matchingCourse =
                  lecturerCourses.find(
                    (course) =>
                      Number(
                        course.id
                      ) ===
                      Number(
                        assignment.course_id
                      )
                  );


                return {

                  id:
                    assignment.id,

                  title:
                    assignment.title,

                  courseId:
                    assignment.course_id,

                  course:
                    matchingCourse?.title ||
                    `${assignment.degree} - Batch ${assignment.batch}`,

                  degree:
                    assignment.degree,

                  batch:
                    assignment.batch,

                  description:
                    assignment.description ||
                    "",

                  dueDate:
                    assignment.due_date,

                  submissions:
                    Number(
                      assignment.submission_count ||
                      0
                    ),

                  students:
                    Number(
                      assignment.student_count ||
                      0
                    ),

                  marks:
                    Number(
                      assignment.max_marks ||
                      assignment.marks ||
                      100
                    ),

                  status:
                    assignment.status ||
                    "Published",

                  filePath:
                    assignment.file_path,

                };

              }

            );


        setAssignments(
          lecturerAssignments
        );


      } catch (error) {

        console.error(
          "Lecturer assignments error:",
          error
        );


        setError(
          error.response?.data?.error ||
          "Failed to load lecturer assignments."
        );


      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadLecturerData();

  }, []);


  /* ========================================
     FILTER
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
              .toLowerCase()
              .includes(search) ||

            assignment.course
              .toLowerCase()
              .includes(search);


          const matchesStatus =

            statusFilter === "All" ||

            assignment.status ===
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
    ]);


  /* ========================================
     COUNTS
  ======================================== */

  const publishedCount =
    assignments.filter(
      (assignment) =>
        assignment.status ===
        "Published"
    ).length;


  const draftCount =
    assignments.filter(
      (assignment) =>
        assignment.status ===
        "Draft"
    ).length;


  const submissionCount =
    assignments.reduce(
      (total, assignment) =>
        total +
        assignment.submissions,
      0
    );


  const totalSubmissionSlots =
    assignments.reduce(
      (total, assignment) =>
        total +
        assignment.students,
      0
    );


  const submissionRate =
    totalSubmissionSlots > 0

      ? Math.round(
          (
            submissionCount /
            totalSubmissionSlots
          ) * 100
        )

      : 0;


  /* ========================================
     NEXT UPCOMING ASSIGNMENT
  ======================================== */

  const nextDueAssignment =
    useMemo(() => {

      const now =
        new Date();


      const futureAssignments =
        assignments

          .filter(
            (assignment) => {

              if (
                !assignment.dueDate
              ) {

                return false;

              }


              const date =
                new Date(
                  assignment.dueDate
                );


              return (
                !Number.isNaN(
                  date.getTime()
                ) &&
                date >= now
              );

            }

          )

          .sort(
            (a, b) =>
              new Date(
                a.dueDate
              ) -
              new Date(
                b.dueDate
              )
          );


      return (
        futureAssignments[0] ||
        null
      );

    }, [assignments]);


  /* ========================================
     CREATE ASSIGNMENT
  ======================================== */

  const handleCreateAssignment =
    async (event) => {

      event.preventDefault();


      try {

        setError("");


        if (
          !newAssignment.title.trim() ||
          !newAssignment.degree ||
          !newAssignment.batch ||
          !newAssignment.dueDate
        ) {

          setError(
            "Please select a course, batch, due date and enter an assignment title."
          );

          return;

        }


        if (!assignmentFile) {

          setError(
            "Please select an assignment brief file."
          );

          return;

        }


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


        const formData =
          new FormData();


        formData.append(
          "title",
          newAssignment.title.trim()
        );


        formData.append(
          "description",
          newAssignment.description.trim()
        );


        formData.append(
          "dueDate",
          newAssignment.dueDate
        );


        formData.append(
          "degree",
          newAssignment.degree
        );


        formData.append(
          "batch",
          newAssignment.batch
        );


        formData.append(
          "maxMarks",
          newAssignment.marks ||
          100
        );


        formData.append(
          "file",
          assignmentFile
        );


        await axios.post(
          "http://localhost:5000/assignments",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNewAssignment({
          title: "",
          degree: "",
          batch: "",
          dueDate: "",
          marks: "",
          description: "",
        });


        setAssignmentFile(
          null
        );


        setCreateOpen(
          false
        );


        await loadLecturerData();


        alert(
          "Assignment published successfully!"
        );


      } catch (error) {

        console.error(
          "Create assignment error:",
          error
        );


        setError(
          error.response?.data?.error ||
          "Failed to create assignment."
        );

      }

    };


  /* ========================================
     DATE HELPERS
  ======================================== */

  const formatDate =
    (date) => {

      if (!date) {

        return "No date";

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


  const getDateParts =
    (date) => {

      if (!date) {

        return {
          day: "--",
          month: "---",
        };

      }


      const parsed =
        new Date(date);


      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {

        return {
          day: "--",
          month: "---",
        };

      }


      return {

        day:
          parsed.toLocaleDateString(
            "en-US",
            {
              day: "2-digit",
            }
          ),

        month:
          parsed.toLocaleDateString(
            "en-US",
            {
              month: "short",
            }
          ),

      };

    };


  /* ========================================
     VIEW ASSIGNMENT
  ======================================== */

  const openViewModal =
    (assignment) => {

      setSelectedAssignment(
        assignment
      );

      setViewOpen(true);

    };


  const closeViewModal =
    () => {

      setViewOpen(false);

      setSelectedAssignment(
        null
      );

    };


  /* ========================================
     OPEN ASSIGNMENT FILE
  ======================================== */

  const openAssignmentFile =
    () => {

      if (
        !selectedAssignment?.filePath
      ) {

        alert(
          "No assignment brief is available."
        );

        return;

      }


      const cleanPath =
        String(
          selectedAssignment.filePath
        )

          .replace(
            /\\/g,
            "/"
          )

          .replace(
            /^.*?uploads\//,
            "uploads/"
          );


      window.open(
        `http://localhost:5000/${cleanPath}`,
        "_blank"
      );

    };


  /* ========================================
     EDIT ASSIGNMENT
  ======================================== */

  const openEditModal =
    (assignment) => {

      setError("");

      setEditFile(null);


      setEditingAssignment({

        id:
          assignment.id,

        title:
          assignment.title ||
          "",

        degree:
          assignment.degree ||
          "",

        batch:
          assignment.batch ||
          "",

        dueDate:
          assignment.dueDate
            ? String(
                assignment.dueDate
              ).slice(
                0,
                10
              )
            : "",

        marks:
          assignment.marks ||
          100,

        description:
          assignment.description ||
          "",

        filePath:
          assignment.filePath ||
          "",

        submissions:
          Number(
            assignment.submissions ||
            0
          ),

      });


      setEditOpen(true);

    };


  const closeEditModal =
    () => {

      if (updating) {

        return;

      }


      setEditOpen(false);

      setEditFile(null);


      setEditingAssignment({

        id: null,

        title: "",

        degree: "",

        batch: "",

        dueDate: "",

        marks: "",

        description: "",

        filePath: "",

        submissions: 0,

      });

    };


  /* ========================================
     UPDATE ASSIGNMENT
  ======================================== */

  const handleUpdateAssignment =
    async (event) => {

      event.preventDefault();


      try {

        setUpdating(true);

        setError("");


        if (
          !editingAssignment.title.trim() ||
          !editingAssignment.degree ||
          !editingAssignment.batch ||
          !editingAssignment.dueDate ||
          !editingAssignment.marks
        ) {

          setError(
            "Please complete all required fields."
          );

          return;

        }


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        const formData =
          new FormData();


        formData.append(
          "title",
          editingAssignment.title.trim()
        );


        formData.append(
          "description",
          editingAssignment.description.trim()
        );


        formData.append(
          "dueDate",
          editingAssignment.dueDate
        );


        formData.append(
          "degree",
          editingAssignment.degree
        );


        formData.append(
          "batch",
          editingAssignment.batch
        );


        formData.append(
          "maxMarks",
          editingAssignment.marks
        );


        if (editFile) {

          formData.append(
            "file",
            editFile
          );

        }


        const response =
          await axios.put(
            `http://localhost:5000/lecturer/assignments/${editingAssignment.id}`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        alert(
          response.data?.message ||
          "Assignment updated successfully!"
        );


        setEditOpen(false);

        setEditFile(null);


        setEditingAssignment({
          id: null,
          title: "",
          degree: "",
          batch: "",
          dueDate: "",
          marks: "",
          description: "",
          filePath: "",
          submissions: 0,
        });


        await loadLecturerData();


      } catch (error) {

        console.error(
          "Update assignment error:",
          error
        );


        setError(
          error.response?.data?.error ||
          "Failed to update assignment."
        );


      } finally {

        setUpdating(false);

      }

    };


  /* ========================================
     DELETE ASSIGNMENT
  ======================================== */

  const handleDeleteAssignment =
    async (assignment) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${assignment.title}"?`
        );


      if (!confirmed) {

        return;

      }


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
          await axios.delete(
            `http://localhost:5000/lecturer/assignments/${assignment.id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        alert(
          response.data?.message ||
          "Assignment deleted successfully!"
        );


        setOpenMenuId(
          null
        );


        await loadLecturerData();


      } catch (error) {

        console.error(
          "Delete assignment error:",
          error
        );


        alert(
          error.response?.data?.error ||
          "Failed to delete assignment."
        );

      }

    };


  return (

    <div className="lecturer-assignments-page">


      {/* ====================================
          ASSESSMENT WORKSPACE
      ==================================== */}

      <section className="la-workspace">


        {/* LEFT */}

        <div className="la-workspace-main">


          <div className="la-workspace-heading">


            <div className="la-heading-icon">

              <ClipboardList
                size={22}
              />

            </div>


            <div>

              <span className="la-kicker">

                <Sparkles
                  size={12}
                />

                ASSESSMENT WORKSPACE

              </span>


              <h1>
                Create. Publish. Track.
              </h1>


              <p>

                Plan coursework, publish
                assignment briefs and follow
                student submission activity
                from one focused teaching
                space.

              </p>

            </div>


          </div>


          <button
            type="button"
            className="la-create-button"
            onClick={() =>
              setCreateOpen(true)
            }
          >

            <Plus size={16} />

            Create Assignment

            <ArrowUpRight
              size={15}
            />

          </button>


          {/* WORKFLOW */}

          <div className="la-workflow">


            <div className="la-workflow-item">

              <div className="la-workflow-icon la-workflow-total">

                <Layers3 size={17} />

              </div>

              <div>

                <span>
                  Created
                </span>

                <strong>
                  {assignments.length}
                </strong>

              </div>

            </div>


            <div className="la-workflow-line" />


            <div className="la-workflow-item">

              <div className="la-workflow-icon la-workflow-published">

                <Send size={17} />

              </div>

              <div>

                <span>
                  Published
                </span>

                <strong>
                  {publishedCount}
                </strong>

              </div>

            </div>


            <div className="la-workflow-line" />


            <div className="la-workflow-item">

              <div className="la-workflow-icon la-workflow-draft">

                <Clock3 size={17} />

              </div>

              <div>

                <span>
                  Drafts
                </span>

                <strong>
                  {draftCount}
                </strong>

              </div>

            </div>


            <div className="la-workflow-line" />


            <div className="la-workflow-item">

              <div className="la-workflow-icon la-workflow-received">

                <Inbox size={17} />

              </div>

              <div>

                <span>
                  Received
                </span>

                <strong>
                  {submissionCount}
                </strong>

              </div>

            </div>


          </div>


        </div>


        {/* RIGHT */}

        <aside className="la-pulse-card">


          <div className="la-pulse-top">


            <div className="la-pulse-icon">

              <TrendingUp
                size={20}
              />

            </div>


            <span>
              SUBMISSION PULSE
            </span>


          </div>


          <div
            className="la-pulse-ring"
            style={{
              background:
                `conic-gradient(
                  #ffffff ${submissionRate * 3.6}deg,
                  rgba(255,255,255,0.18) 0deg
                )`,
            }}
          >

            <div className="la-pulse-ring-inner">

              <strong>
                {submissionRate}%
              </strong>

              <span>
                RECEIVED
              </span>

            </div>

          </div>


          <div className="la-pulse-copy">

            <strong>
              Submission progress
            </strong>

            <span>

              {submissionCount} of{" "}
              {totalSubmissionSlots} possible
              submissions received.

            </span>

          </div>


          <div className="la-next-deadline">


            <span>
              NEXT DEADLINE
            </span>


            {nextDueAssignment ? (

              <>

                <strong>

                  {
                    getDateParts(
                      nextDueAssignment.dueDate
                    ).day
                  }{" "}

                  {
                    getDateParts(
                      nextDueAssignment.dueDate
                    ).month
                  }

                </strong>


                <p>

                  {
                    nextDueAssignment.title
                  }

                </p>

              </>

            ) : (

              <>

                <strong>
                  —
                </strong>

                <p>
                  No upcoming deadline
                </p>

              </>

            )}


          </div>


        </aside>


      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error &&
        !createOpen &&
        !editOpen && (

        <div className="la-page-error">

          {error}

        </div>

      )}


      {/* ====================================
          ASSIGNMENT FINDER
      ==================================== */}

      <section className="la-toolbar">


        <div className="la-toolbar-label">

          <div>

            <SlidersHorizontal
              size={18}
            />

          </div>

          <span>

            <strong>
              Assignment Finder
            </strong>

            Search and filter coursework

          </span>

        </div>


        <div className="la-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search assignment or course..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          className="la-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="All">
            All Assignments
          </option>

          <option value="Published">
            Published
          </option>

          <option value="Draft">
            Drafts
          </option>

        </select>


      </section>


      {/* ====================================
          LIST HEADING
      ==================================== */}

      <section className="la-list-heading">


        <div>

          <span>

            <ClipboardList
              size={13}
            />

            ASSESSMENT LIBRARY

          </span>


          <h2>
            Your Coursework
          </h2>


          <p>

            Review assignment briefs,
            deadlines and submission
            progress.

          </p>

        </div>


        <div className="la-result-count">

          {filteredAssignments.length}

          <span>

            {filteredAssignments.length === 1
              ? "assignment"
              : "assignments"}

          </span>

        </div>


      </section>


      {/* ====================================
          LOADING
      ==================================== */}

      {loading && (

        <div className="la-state-box">


          <div className="la-state-icon">

            <ClipboardList
              size={23}
            />

          </div>


          <strong>
            Loading assignments...
          </strong>


          <span>
            Preparing your assessment workspace
          </span>


        </div>

      )}


      {/* ====================================
          EMPTY
      ==================================== */}

      {!loading &&
        filteredAssignments.length ===
          0 && (

        <div className="la-state-box">


          <div className="la-state-icon">

            <Search size={23} />

          </div>


          <strong>
            No assignments found
          </strong>


          <span>

            Try another search term or
            status filter.

          </span>


        </div>

      )}


      {/* ====================================
          ASSIGNMENT LIST
      ==================================== */}

      {!loading && (

        <section className="la-list">


          {filteredAssignments.map(
            (assignment) => {


              const dateParts =
                getDateParts(
                  assignment.dueDate
                );


              const progress =
                assignment.students > 0

                  ? Math.round(
                      (
                        assignment.submissions /
                        assignment.students
                      ) * 100
                    )

                  : 0;


              return (

                <article
                  className="la-assignment-card"
                  key={assignment.id}
                >


                  {/* DATE */}

                  <div className="la-date-column">

                    <span>
                      DUE
                    </span>

                    <strong>
                      {dateParts.day}
                    </strong>

                    <small>
                      {dateParts.month}
                    </small>

                  </div>


                  {/* MAIN */}

                  <div className="la-assignment-content">


                    <div className="la-title-row">


                      <div>

                        <div className="la-course-name">

                          <BookOpen
                            size={12}
                          />

                          {assignment.course}

                        </div>


                        <h3>
                          {assignment.title}
                        </h3>

                      </div>


                      <span
                        className={
                          assignment.status ===
                          "Published"

                            ? "la-status la-status-published"

                            : "la-status la-status-draft"
                        }
                      >

                        {assignment.status}

                      </span>


                    </div>


                    {assignment.description && (

                      <p className="la-description">

                        {assignment.description}

                      </p>

                    )}


                    <div className="la-meta">


                      <span>

                        <CalendarDays
                          size={13}
                        />

                        {formatDate(
                          assignment.dueDate
                        )}

                      </span>


                      <span>

                        <Award size={13} />

                        {assignment.marks} Marks

                      </span>


                      <span>

                        <Users size={13} />

                        {assignment.students} Students

                      </span>


                    </div>


                    <div className="la-submission-progress">


                      <div className="la-progress-info">

                        <span>
                          Submission progress
                        </span>

                        <strong>

                          {
                            assignment.submissions
                          }

                          /

                          {
                            assignment.students
                          }

                          <b>
                            {progress}%
                          </b>

                        </strong>

                      </div>


                      <div className="la-progress-track">

                        <div
                          className="la-progress-fill"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>


                    </div>


                  </div>


                  {/* SIDE */}

                  <div className="la-card-side">


                    <div className="la-card-progress-number">

                      <strong>
                        {progress}%
                      </strong>

                      <span>
                        SUBMITTED
                      </span>

                    </div>


                    <div className="la-actions">


                      <button
                        className="la-review-button"
                        type="button"
                        onClick={() =>
                          openViewModal(
                            assignment
                          )
                        }
                      >

                        <Eye size={14} />

                        View Brief

                        <ChevronRight
                          size={13}
                        />

                      </button>


                      <button
                        className="la-icon-button"
                        type="button"
                        title="Edit assignment"
                        onClick={() =>
                          openEditModal(
                            assignment
                          )
                        }
                      >

                        <Pencil
                          size={14}
                        />

                      </button>


                      <div className="la-more-wrapper">


                        <button
                          className="la-icon-button"
                          type="button"
                          title="More options"
                          onClick={() =>
                            setOpenMenuId(

                              openMenuId ===
                              assignment.id

                                ? null

                                : assignment.id

                            )
                          }
                        >

                          <MoreVertical
                            size={15}
                          />

                        </button>


                        {openMenuId ===
                          assignment.id && (

                          <div className="la-more-menu">

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteAssignment(
                                  assignment
                                )
                              }
                            >

                              Delete Assignment

                            </button>

                          </div>

                        )}


                      </div>


                    </div>


                  </div>


                </article>

              );

            }

          )}


        </section>

      )}


      {/* ====================================
          VIEW MODAL
      ==================================== */}

      {viewOpen &&
        selectedAssignment && (

        <div className="lecturer-modal-overlay">


          <div className="la-modal">


            <div className="lecturer-modal-header">


              <div className="la-modal-title">


                <div className="la-modal-title-icon">

                  <Eye size={20} />

                </div>


                <div>

                  <span>
                    ASSIGNMENT BRIEF
                  </span>

                  <h2>
                    Assignment Details
                  </h2>

                  <p>

                    Review the published
                    coursework information.

                  </p>

                </div>


              </div>


              <button
                className="lecturer-modal-close"
                type="button"
                onClick={
                  closeViewModal
                }
              >

                <X size={18} />

              </button>


            </div>


            <div className="la-view-details">


              <div className="la-view-title">


                <div className="la-assignment-icon">

                  <ClipboardList
                    size={22}
                  />

                </div>


                <div>

                  <h3>

                    {
                      selectedAssignment.title
                    }

                  </h3>


                  <span>

                    {
                      selectedAssignment.course
                    }

                  </span>

                </div>


              </div>


              <div className="la-view-grid">


                <div>

                  <span>
                    Due Date
                  </span>

                  <strong>

                    {formatDate(
                      selectedAssignment.dueDate
                    )}

                  </strong>

                </div>


                <div>

                  <span>
                    Maximum Marks
                  </span>

                  <strong>

                    {
                      selectedAssignment.marks
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Degree
                  </span>

                  <strong>

                    {
                      selectedAssignment.degree ||
                      "Not available"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Batch
                  </span>

                  <strong>

                    {
                      selectedAssignment.batch ||
                      "Not available"
                    }

                  </strong>

                </div>


              </div>


              <div className="la-view-section">

                <span>
                  Assignment Instructions
                </span>

                <p>

                  {
                    selectedAssignment.description ||
                    "No additional instructions were provided."
                  }

                </p>

              </div>


              <div className="la-view-section">

                <span>
                  Assignment Brief
                </span>


                {selectedAssignment.filePath ? (

                  <button
                    type="button"
                    className="la-view-file-button"
                    onClick={
                      openAssignmentFile
                    }
                  >

                    <FileText
                      size={16}
                    />

                    Open Assignment Brief

                    <ArrowUpRight
                      size={14}
                    />

                  </button>

                ) : (

                  <p>
                    No assignment brief available.
                  </p>

                )}


              </div>


              <div className="lecturer-modal-actions">

                <button
                  type="button"
                  className="lecturer-cancel-button"
                  onClick={
                    closeViewModal
                  }
                >

                  Close

                </button>

              </div>


            </div>


          </div>


        </div>

      )}


      {/* ====================================
          EDIT MODAL
      ==================================== */}

      {editOpen && (

        <div className="lecturer-modal-overlay">


          <div className="la-modal">


            <div className="lecturer-modal-header">


              <div className="la-modal-title">


                <div className="la-modal-title-icon">

                  <Pencil size={19} />

                </div>


                <div>

                  <span>
                    ASSESSMENT SETTINGS
                  </span>

                  <h2>
                    Edit Assignment
                  </h2>

                  <p>

                    Update the assignment
                    details and brief.

                  </p>

                </div>


              </div>


              <button
                className="lecturer-modal-close"
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={
                  updating
                }
              >

                <X size={18} />

              </button>


            </div>


            <form
              className="lecturer-course-form"
              onSubmit={
                handleUpdateAssignment
              }
            >


              {error && (

                <div className="la-form-error">

                  {error}

                </div>

              )}


              <div className="lecturer-form-group">

                <label>
                  Assignment Title
                </label>

                <input
                  type="text"
                  value={
                    editingAssignment.title
                  }
                  onChange={(event) =>
                    setEditingAssignment({
                      ...editingAssignment,

                      title:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>


              {/* COURSE + BATCH */}

              <div className="lecturer-form-row">


                <div className="lecturer-form-group">

                  <label>
                    Course
                  </label>

                  <select
                    value={
                      editingAssignment.degree
                    }
                    onChange={(event) =>
                      setEditingAssignment({
                        ...editingAssignment,

                        degree:
                          event.target.value,
                      })
                    }
                    disabled={
                      editingAssignment.submissions >
                      0
                    }
                    required
                  >

                    <option value="">
                      Select course
                    </option>


                    {DEGREE_OPTIONS.map(
                      (degree) => (

                        <option
                          key={degree}
                          value={degree}
                        >

                          {degree}

                        </option>

                      )
                    )}


                  </select>

                </div>


                <div className="lecturer-form-group">

                  <label>
                    Batch
                  </label>

                  <select
                    value={
                      editingAssignment.batch
                    }
                    onChange={(event) =>
                      setEditingAssignment({
                        ...editingAssignment,

                        batch:
                          event.target.value,
                      })
                    }
                    disabled={
                      editingAssignment.submissions >
                      0
                    }
                    required
                  >

                    <option value="">
                      Select batch
                    </option>


                    {BATCH_OPTIONS.map(
                      (batch) => (

                        <option
                          key={batch}
                          value={batch}
                        >

                          {batch}

                        </option>

                      )
                    )}


                  </select>

                </div>


              </div>


              {editingAssignment.submissions >
                0 && (

                <div
                  style={{
                    marginTop: "-4px",
                    marginBottom: "16px",
                    padding: "10px 12px",
                    borderRadius: "9px",
                    background: "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    color: "#c2410c",
                    fontSize: "12px",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >

                  Degree and Batch cannot be
                  changed because students have
                  already submitted work for this
                  assignment.

                </div>

              )}


              <div className="lecturer-form-row">


                <div className="lecturer-form-group">

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={
                      editingAssignment.dueDate
                    }
                    onChange={(event) =>
                      setEditingAssignment({
                        ...editingAssignment,

                        dueDate:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>


                <div className="lecturer-form-group">

                  <label>
                    Maximum Marks
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      editingAssignment.marks
                    }
                    onChange={(event) =>
                      setEditingAssignment({
                        ...editingAssignment,

                        marks:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>


              </div>


              <div className="lecturer-form-group">

                <label>
                  Assignment Instructions
                </label>

                <textarea
                  rows="4"
                  value={
                    editingAssignment.description
                  }
                  onChange={(event) =>
                    setEditingAssignment({
                      ...editingAssignment,

                      description:
                        event.target.value,
                    })
                  }
                />

              </div>


              <div className="la-upload-placeholder">

                <FileText size={20} />


                <div>

                  <strong>
                    Replace Assignment Brief
                  </strong>

                  <span>

                    Optional — leave empty
                    to keep the current file.

                  </span>


                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(event) =>
                      setEditFile(
                        event.target.files?.[0] ||
                        null
                      )
                    }
                  />

                </div>


              </div>


              <div className="lecturer-modal-actions">


                <button
                  type="button"
                  className="lecturer-cancel-button"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    updating
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="lecturer-primary-button"
                  disabled={
                    updating
                  }
                >

                  <Pencil size={15} />

                  {updating
                    ? "Saving..."
                    : "Save Changes"}

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


      {/* ====================================
          CREATE MODAL
      ==================================== */}

      {createOpen && (

        <div className="lecturer-modal-overlay">


          <div className="la-modal">


            <div className="lecturer-modal-header">


              <div className="la-modal-title">


                <div className="la-modal-title-icon">

                  <Plus size={20} />

                </div>


                <div>

                  <span>
                    NEW ASSESSMENT
                  </span>

                  <h2>
                    Create Assignment
                  </h2>

                  <p>

                    Publish new coursework
                    for your students.

                  </p>

                </div>


              </div>


              <button
                className="lecturer-modal-close"
                type="button"
                onClick={() => {

                  setCreateOpen(false);

                  setError("");

                }}
              >

                <X size={18} />

              </button>


            </div>


            <form
              className="lecturer-course-form"
              onSubmit={
                handleCreateAssignment
              }
            >


              {error && (

                <div className="la-form-error">

                  {error}

                </div>

              )}


              <div className="lecturer-form-group">

                <label>
                  Assignment Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Cloud Architecture Report"
                  value={
                    newAssignment.title
                  }
                  onChange={(event) =>
                    setNewAssignment({
                      ...newAssignment,

                      title:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>


              {/* COURSE + BATCH */}

              <div className="lecturer-form-row">


                <div className="lecturer-form-group">

                  <label>
                    Course
                  </label>

                  <select
                    value={
                      newAssignment.degree
                    }
                    onChange={(event) =>
                      setNewAssignment({
                        ...newAssignment,

                        degree:
                          event.target.value,
                      })
                    }
                    required
                  >

                    <option value="">
                      Select course
                    </option>


                    {DEGREE_OPTIONS.map(
                      (degree) => (

                        <option
                          key={degree}
                          value={degree}
                        >

                          {degree}

                        </option>

                      )
                    )}


                  </select>

                </div>


                <div className="lecturer-form-group">

                  <label>
                    Batch
                  </label>

                  <select
                    value={
                      newAssignment.batch
                    }
                    onChange={(event) =>
                      setNewAssignment({
                        ...newAssignment,

                        batch:
                          event.target.value,
                      })
                    }
                    required
                  >

                    <option value="">
                      Select batch
                    </option>


                    {BATCH_OPTIONS.map(
                      (batch) => (

                        <option
                          key={batch}
                          value={batch}
                        >

                          {batch}

                        </option>

                      )
                    )}


                  </select>

                </div>


              </div>


              {/* DATE + MARKS */}

              <div className="lecturer-form-row">


                <div className="lecturer-form-group">

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={
                      newAssignment.dueDate
                    }
                    onChange={(event) =>
                      setNewAssignment({
                        ...newAssignment,

                        dueDate:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>


                <div className="lecturer-form-group">

                  <label>
                    Maximum Marks
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={
                      newAssignment.marks
                    }
                    onChange={(event) =>
                      setNewAssignment({
                        ...newAssignment,

                        marks:
                          event.target.value,
                      })
                    }
                  />

                </div>


              </div>


              <div className="lecturer-form-group">

                <label>
                  Assignment Instructions
                </label>

                <textarea
                  rows="4"
                  placeholder="Describe the assignment requirements..."
                  value={
                    newAssignment.description
                  }
                  onChange={(event) =>
                    setNewAssignment({
                      ...newAssignment,

                      description:
                        event.target.value,
                    })
                  }
                />

              </div>


              <div className="la-upload-placeholder">

                <FileText size={20} />


                <div>

                  <strong>
                    Assignment Brief
                  </strong>

                  <span>

                    Upload the instructions,
                    question paper or brief.

                  </span>


                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(event) =>
                      setAssignmentFile(
                        event.target.files?.[0] ||
                        null
                      )
                    }
                    required
                  />

                </div>


              </div>


              <div className="lecturer-modal-actions">


                <button
                  type="button"
                  className="lecturer-cancel-button"
                  onClick={() => {

                    setCreateOpen(false);

                    setError("");

                  }}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="lecturer-primary-button"
                >

                  <Plus size={15} />

                  Publish Assignment

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


    </div>

  );

}


export default LecturerAssignments;