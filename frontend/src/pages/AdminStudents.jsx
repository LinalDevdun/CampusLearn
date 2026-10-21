import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  GraduationCap,
  Users,
  Search,
  BookOpen,
  Eye,
  X,
  Mail,
  CircleCheckBig,
  UserX,
  ChartNoAxesCombined,
  Award,
  ClipboardList,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Activity,
  Clock3,
  Layers3,
} from "lucide-react";

import "../styles/adminStudents.css";

import API_BASE_URL from "../config/api";


/* =========================================
   GET INITIALS
========================================= */

const getInitials = (name) => {

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


/* =========================================
   FORMAT LAST LOGIN
========================================= */

const formatLastLogin = (date) => {

  if (!date) {
    return "Never";
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


function AdminStudents() {

  const navigate =
    useNavigate();


  /* ========================================
     STUDENTS
  ======================================== */

  const [
    students,
    setStudents,
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
     SEARCH + FILTER
  ======================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    batchFilter,
    setBatchFilter,
  ] = useState("ALL");


  /* ========================================
     SELECTED STUDENT
  ======================================== */

  const [
    selectedStudent,
    setSelectedStudent,
  ] = useState(null);


  /* ========================================
     LOAD REAL ACADEMIC DATA
  ======================================== */

  const loadStudents =
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


          const response =
            await axios.get(
              `${API_BASE_URL}/admin/students/academic-summary`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const realStudents =
            response.data.map(
              (student) => ({

                id:
                  student.id,

                studentId:
                  `STU${String(
                    student.id
                  ).padStart(
                    3,
                    "0"
                  )}`,

                name:
                  student.name ||
                  "Unnamed Student",

                initials:
                  getInitials(
                    student.name
                  ),

                email:
                  student.email ||
                  "No email",

                degree:
                  student.degree ||
                  "Not assigned",

                batch:
                  student.batch ||
                  "Not assigned",

                courses:
                  Number(
                    student.courses
                  ) || 0,

                totalAssignments:
                  Number(
                    student
                      .total_assignments
                  ) || 0,

                submittedAssignments:
                  Number(
                    student
                      .submitted_assignments
                  ) || 0,

                gradedAssignments:
                  Number(
                    student
                      .graded_assignments
                  ) || 0,

                progress:
                  Number(
                    student.progress
                  ) || 0,

                average:
                  Number(
                    student
                      .average_score
                  ) || 0,

                status:
                  student.is_active
                    ? "Active"
                    : "Disabled",

                isActive:
                  student.is_active,

                lastLogin:
                  formatLastLogin(
                    student.last_login
                  ),

              })
            );


          setStudents(
            realStudents
          );


        } catch (error) {

          console.error(
            "Failed to load student academic data:",
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
            "Failed to load students."
          );


        } finally {

          setLoading(false);

        }

      },
      [navigate]
    );


  useEffect(() => {

    loadStudents();

  }, [loadStudents]);


  /* ========================================
     BATCH OPTIONS
  ======================================== */

  const batchOptions =
    useMemo(() => {

      const batches =
        students
          .map(
            (student) =>
              student.batch
          )
          .filter(
            (batch) =>
              batch &&
              batch !==
                "Not assigned"
          );


      return [
        ...new Set(batches),
      ].sort();

    }, [students]);


  /* ========================================
     FILTER STUDENTS
  ======================================== */

  const filteredStudents =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return students.filter(
        (student) => {

          const matchesSearch =

            student.name
              .toLowerCase()
              .includes(search) ||

            student.email
              .toLowerCase()
              .includes(search) ||

            student.studentId
              .toLowerCase()
              .includes(search) ||

            student.degree
              .toLowerCase()
              .includes(search) ||

            student.batch
              .toLowerCase()
              .includes(search);


          const matchesBatch =
            batchFilter === "ALL" ||
            student.batch ===
              batchFilter;


          return (
            matchesSearch &&
            matchesBatch
          );

        }
      );

    }, [
      students,
      searchTerm,
      batchFilter,
    ]);


  /* ========================================
     SUMMARY VALUES
  ======================================== */

  const totalStudents =
    students.length;


  const studyPrograms =
    new Set(
      students
        .map(
          (student) =>
            student.degree
        )
        .filter(
          (degree) =>
            degree &&
            degree !==
              "Not assigned"
        )
    ).size;


  const averageProgress =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (
              total,
              student
            ) =>
              total +
              student.progress,
            0
          ) /
          totalStudents
        )
      : 0;


  /*
    Only students with at least one
    graded assignment are included.
  */

  const studentsWithGrades =
    students.filter(
      (student) =>
        student
          .gradedAssignments > 0
    );


  const averageScore =
    studentsWithGrades.length > 0
      ? Math.round(
          studentsWithGrades.reduce(
            (
              total,
              student
            ) =>
              total +
              student.average,
            0
          ) /
          studentsWithGrades.length
        )
      : 0;


  const activeStudents =
    students.filter(
      (student) =>
        student.status ===
        "Active"
    ).length;


  const filtersActive =
    Boolean(
      searchTerm.trim()
    ) ||
    batchFilter !== "ALL";


  const clearFilters = () => {

    setSearchTerm("");

    setBatchFilter("ALL");

  };


  return (

    <div className="admin-students-page">


      {/* ====================================
          STUDENT SUCCESS HERO
      ==================================== */}

      <section className="ast-success-hero">


        <div className="ast-hero-copy">


          <div className="ast-eyebrow">

            <Sparkles size={12} />

            STUDENT SUCCESS OBSERVATORY

          </div>


          <h1>
            Students
          </h1>


          <p>

            Follow enrollment,
            academic engagement and
            learning performance across
            the CampusLearn student
            community.

          </p>


          <div className="ast-hero-tags">


            <span>

              <GraduationCap
                size={13}
              />

              {totalStudents} learners

            </span>


            <span>

              <BookOpen
                size={13}
              />

              {studyPrograms} study programs

            </span>


            <span>

              <CircleCheckBig
                size={13}
              />

              {activeStudents} active

            </span>


          </div>


        </div>


        {/* ACADEMIC PULSE */}

        <div className="ast-pulse-card">


          <div className="ast-pulse-heading">

            <div>

              <span>
                ACADEMIC PULSE
              </span>

              <strong>
                Cohort Progress
              </strong>

            </div>


            <div className="ast-pulse-icon">

              <Activity size={19} />

            </div>


          </div>


          <div className="ast-pulse-main">


            <div
              className="ast-progress-ring"
              style={{
                "--ast-progress":
                  `${Math.min(
                    Math.max(
                      averageProgress,
                      0
                    ),
                    100
                  ) * 3.6}deg`,
              }}
            >

              <div>

                <strong>
                  {averageProgress}%
                </strong>

                <span>
                  AVG PROGRESS
                </span>

              </div>

            </div>


            <div className="ast-pulse-details">


              <div>

                <span>
                  Average Score
                </span>

                <strong>
                  {averageScore}%
                </strong>

              </div>


              <div>

                <span>
                  Students Graded
                </span>

                <strong>
                  {
                    studentsWithGrades
                      .length
                  }
                </strong>

              </div>


            </div>


          </div>


        </div>


      </section>


      {/* ====================================
          COHORT OVERVIEW
      ==================================== */}

      <section className="ast-overview-strip">


        <OverviewItem
          icon={
            <Users size={19} />
          }
          label="Total Students"
          value={totalStudents}
          description="Registered learners"
          className="ast-overview-teal"
        />


        <div className="ast-overview-divider" />


        <OverviewItem
          icon={
            <BookOpen size={19} />
          }
          label="Study Programs"
          value={studyPrograms}
          description="Academic programs"
          className="ast-overview-purple"
        />


        <div className="ast-overview-divider" />


        <OverviewItem
          icon={
            <ChartNoAxesCombined
              size={19}
            />
          }
          label="Avg. Progress"
          value={`${averageProgress}%`}
          description="Assignment progress"
          className="ast-overview-blue"
        />


        <div className="ast-overview-divider" />


        <OverviewItem
          icon={
            <Award size={19} />
          }
          label="Avg. Score"
          value={`${averageScore}%`}
          description="Graded students"
          className="ast-overview-orange"
        />


      </section>


      {/* ====================================
          STUDENT DIRECTORY
      ==================================== */}

      <section className="ast-directory">


        <div className="ast-directory-header">


          <div>

            <span>
              ACADEMIC DIRECTORY
            </span>

            <h2>
              Student Records
            </h2>

            <p>

              Search learners and review
              academic activity by batch.

            </p>

          </div>


          <div className="ast-result-counter">

            <strong>
              {
                filteredStudents.length
              }
            </strong>

            <span>
              of {totalStudents} shown
            </span>

          </div>


        </div>


        {/* ==================================
            TOOLBAR
        ================================== */}

        <div className="ast-toolbar">


          <div className="ast-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search name, ID, program, email or batch..."
              value={searchTerm}
              onChange={
                (event) =>
                  setSearchTerm(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="ast-filter-label">

            <SlidersHorizontal
              size={14}
            />

            Batch

          </div>


          <div className="ast-toolbar-actions">


            <select
              value={batchFilter}
              onChange={
                (event) =>
                  setBatchFilter(
                    event.target.value
                  )
              }
            >

              <option value="ALL">
                All Batches
              </option>


              {batchOptions.map(
                (batch) => (

                  <option
                    key={batch}
                    value={batch}
                  >

                    Batch {batch}

                  </option>

                )
              )}

            </select>


            {filtersActive && (

              <button
                type="button"
                className="ast-reset-button"
                onClick={
                  clearFilters
                }
              >

                <RefreshCw
                  size={13}
                />

                Reset

              </button>

            )}


          </div>


        </div>


        {/* ==================================
            TABLE
        ================================== */}

        <div className="ast-table-container">


          {/* LOADING */}

          {loading && (

            <div className="ast-empty-state">

              <div className="ast-spinner" />

              <h3>
                Loading student records
              </h3>

              <p>
                Getting academic information
                from PostgreSQL.
              </p>

            </div>

          )}


          {/* ERROR */}

          {!loading &&
            error && (

            <div className="ast-empty-state ast-error-state">

              <UserX size={28} />

              <h3>
                Unable to load students
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* TABLE */}

          {!loading &&
            !error && (

            <>


              {filteredStudents.length >
              0 ? (

                <table className="ast-table">


                  <thead>

                    <tr>

                      <th>
                        Student
                      </th>

                      <th>
                        Program
                      </th>

                      <th>
                        Batch
                      </th>

                      <th>
                        Courses
                      </th>

                      <th>
                        Progress
                      </th>

                      <th>
                        Average
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Profile
                      </th>

                    </tr>

                  </thead>


                  <tbody>


                    {filteredStudents.map(
                      (student) => (

                        <tr
                          key={student.id}
                        >


                          {/* STUDENT */}

                          <td>

                            <div className="ast-profile">


                              <div className="ast-avatar">

                                {
                                  student
                                    .initials
                                }

                              </div>


                              <div>

                                <strong>
                                  {
                                    student
                                      .name
                                  }
                                </strong>

                                <span>
                                  {
                                    student
                                      .studentId
                                  }
                                </span>

                              </div>


                            </div>

                          </td>


                          {/* PROGRAM */}

                          <td>

                            <span className="ast-program">

                              {
                                student.degree
                              }

                            </span>

                          </td>


                          {/* BATCH */}

                          <td>

                            <span className="ast-batch">

                              {
                                student.batch
                              }

                            </span>

                          </td>


                          {/* COURSES */}

                          <td>

                            <div className="ast-course-count">

                              <BookOpen
                                size={13}
                              />

                              {
                                student.courses
                              }

                            </div>

                          </td>


                          {/* PROGRESS */}

                          <td>

                            <div className="ast-progress-wrapper">


                              <div className="ast-progress-text">

                                <span>
                                  {
                                    student
                                      .progress
                                  }
                                  %
                                </span>

                              </div>


                              <div className="ast-progress-track">

                                <div
                                  className="ast-progress-bar"
                                  style={{
                                    width:
                                      `${Math.max(
                                        0,
                                        Math.min(
                                          student
                                            .progress,
                                          100
                                        )
                                      )}%`,
                                  }}
                                />

                              </div>


                            </div>

                          </td>


                          {/* AVERAGE */}

                          <td>

                            <strong className="ast-score">

                              {
                                student
                                  .gradedAssignments >
                                0
                                  ? `${Math.round(
                                      student.average
                                    )}%`
                                  : "—"
                              }

                            </strong>

                          </td>


                          {/* STATUS */}

                          <td>

                            {student.status ===
                            "Active" ? (

                              <span className="ast-status ast-status-active">

                                <i />

                                Active

                              </span>

                            ) : (

                              <span className="ast-status ast-status-disabled">

                                <i />

                                Disabled

                              </span>

                            )}

                          </td>


                          {/* ACTION */}

                          <td>

                            <button
                              type="button"
                              className="ast-view-button"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                            >

                              <Eye
                                size={14}
                              />

                              View

                            </button>

                          </td>


                        </tr>

                      )
                    )}


                  </tbody>


                </table>

              ) : (

                <div className="ast-empty-state">


                  <div className="ast-empty-icon">

                    <Search
                      size={23}
                    />

                  </div>


                  <h3>
                    No matching students
                  </h3>


                  <p>

                    Try another search
                    or reset your batch
                    filter.

                  </p>


                  {filtersActive && (

                    <button
                      type="button"
                      className="ast-empty-reset"
                      onClick={
                        clearFilters
                      }
                    >

                      Reset Filters

                    </button>

                  )}


                </div>

              )}


            </>

          )}


        </div>


      </section>


      {/* ====================================
          STUDENT DETAILS MODAL
      ==================================== */}

      {selectedStudent && (

        <div className="ast-modal-overlay">


          <div className="ast-modal">


            {/* MODAL HERO */}

            <div className="ast-modal-hero">


              <div className="ast-modal-avatar">

                {
                  selectedStudent
                    .initials
                }

              </div>


              <div className="ast-modal-person">

                <span>
                  STUDENT ACADEMIC PROFILE
                </span>

                <h2>
                  {
                    selectedStudent
                      .name
                  }
                </h2>

                <p>

                  {
                    selectedStudent
                      .studentId
                  }

                  <i />

                  {
                    selectedStudent
                      .degree
                  }

                </p>

              </div>


              <div
                className={
                  selectedStudent
                    .status ===
                  "Active"
                    ? "ast-modal-status ast-modal-status-active"
                    : "ast-modal-status ast-modal-status-disabled"
                }
              >

                {
                  selectedStudent
                    .status
                }

              </div>


              <button
                type="button"
                className="ast-modal-close"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
              >

                <X size={18} />

              </button>


            </div>


            <div className="ast-modal-body">


              {/* DETAILS */}

              <div className="ast-modal-section-title">

                <div>

                  <span>
                    STUDENT INFORMATION
                  </span>

                  <h3>
                    Academic Identity
                  </h3>

                </div>

              </div>


              <div className="ast-modal-grid">


                <StudentDetail
                  icon={
                    <Mail
                      size={16}
                    />
                  }
                  label="Email"
                  value={
                    selectedStudent
                      .email
                  }
                />


                <StudentDetail
                  icon={
                    <GraduationCap
                      size={16}
                    />
                  }
                  label="Program"
                  value={
                    selectedStudent
                      .degree
                  }
                />


                <StudentDetail
                  icon={
                    <Layers3
                      size={16}
                    />
                  }
                  label="Batch"
                  value={
                    selectedStudent
                      .batch
                  }
                />


                <StudentDetail
                  icon={
                    <BookOpen
                      size={16}
                    />
                  }
                  label="Courses"
                  value={
                    selectedStudent
                      .courses
                  }
                />


                <StudentDetail
                  icon={
                    <Clock3
                      size={16}
                    />
                  }
                  label="Last Login"
                  value={
                    selectedStudent
                      .lastLogin
                  }
                />


                <StudentDetail
                  icon={
                    <CircleCheckBig
                      size={16}
                    />
                  }
                  label="Account Status"
                  value={
                    selectedStudent
                      .status
                  }
                />


              </div>


              {/* ACADEMIC PERFORMANCE */}

              <div className="ast-modal-section-title ast-performance-heading">

                <div>

                  <span>
                    LEARNING SNAPSHOT
                  </span>

                  <h3>
                    Academic Performance
                  </h3>

                </div>

              </div>


              <div className="ast-modal-results">


                <ResultCard
                  icon={
                    <ChartNoAxesCombined
                      size={18}
                    />
                  }
                  label="Assignment Progress"
                  value={
                    `${selectedStudent.progress}%`
                  }
                  className="ast-result-progress"
                />


                <ResultCard
                  icon={
                    <Award
                      size={18}
                    />
                  }
                  label="Average Score"
                  value={
                    selectedStudent
                      .gradedAssignments >
                    0
                      ? `${Number(
                          selectedStudent
                            .average
                        ).toFixed(
                          1
                        )}%`
                      : "No grades yet"
                  }
                  className="ast-result-score"
                />


                <ResultCard
                  icon={
                    <ClipboardList
                      size={18}
                    />
                  }
                  label="Submitted"
                  value={
                    `${selectedStudent.submittedAssignments}/${selectedStudent.totalAssignments}`
                  }
                  className="ast-result-submitted"
                />


                <ResultCard
                  icon={
                    <CircleCheckBig
                      size={18}
                    />
                  }
                  label="Graded"
                  value={
                    `${selectedStudent.gradedAssignments}/${selectedStudent.submittedAssignments}`
                  }
                  className="ast-result-graded"
                />


              </div>


              {/* FOOTER */}

              <div className="ast-modal-footer">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedStudent(
                      null
                    )
                  }
                >

                  Close Profile

                </button>

              </div>


            </div>


          </div>


        </div>

      )}


    </div>

  );

}


/* ========================================
   OVERVIEW ITEM
======================================== */

function OverviewItem({
  icon,
  label,
  value,
  description,
  className,
}) {

  return (

    <div
      className={
        `ast-overview-item ${className}`
      }
    >

      <div className="ast-overview-icon">

        {icon}

      </div>


      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </div>

  );

}


/* ========================================
   STUDENT DETAIL
======================================== */

function StudentDetail({
  icon,
  label,
  value,
}) {

  return (

    <div className="ast-detail-card">

      <div className="ast-detail-icon">

        {icon}

      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );

}


/* ========================================
   RESULT CARD
======================================== */

function ResultCard({
  icon,
  label,
  value,
  className,
}) {

  return (

    <div
      className={
        `ast-result-card ${className}`
      }
    >

      <div className="ast-result-icon">

        {icon}

      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}


export default AdminStudents;