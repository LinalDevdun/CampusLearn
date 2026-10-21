import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Users,
  Search,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Mail,
  Eye,
  X,
  ClipboardList,
  Award,
  CircleCheckBig,
  UserRound,
  ChevronRight,
  BarChart3,
} from "lucide-react";

import "../styles/lecturerStudents.css";

import API_BASE_URL from "../config/api";


function LecturerStudents() {

  const navigate = useNavigate();


  /* ========================================
     STATE
  ======================================== */

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [batchFilter, setBatchFilter] =
    useState("All");

  const [selectedStudent, setSelectedStudent] =
    useState(null);


  /* ========================================
     LOAD REAL STUDENTS
  ======================================== */

  useEffect(() => {

    const loadStudents = async () => {

      try {

        setLoading(true);
        setError("");


        const token =
          localStorage.getItem("token");


        if (!token) {

          navigate("/login");

          return;

        }


        const response =
          await axios.get(
            `${API_BASE_URL}/lecturer/students`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const realStudents =
          Array.isArray(
            response.data?.students
          )
            ? response.data.students
            : [];


        const formattedStudents =
          realStudents.map(
            (student) => ({

              id:
                student.id,

              name:
                student.name ||
                "Student",

              studentId:
                `Student ID ${student.id}`,

              initials:
                getInitials(
                  student.name
                ),

              email:
                student.email ||
                "No email",

              degree:
                student.degree ||
                "No degree",

              batch:
                student.batch ||
                "No batch",

              course:
                student.courses ||
                "No courses",

              courseCount:
                Number(
                  student.course_count ||
                  0
                ),

              progress:
                Number(
                  student.progress ||
                  0
                ),

              submissions:
                Number(
                  student.submissions ||
                  0
                ),

              graded:
                Number(
                  student.graded ||
                  0
                ),

              average:
                student.average_score !== null &&
                student.average_score !== undefined
                  ? Number(
                      student.average_score
                    )
                  : null,

              status:
                student.is_active === false
                  ? "Inactive"
                  : "Active",

            })
          );


        setStudents(
          formattedStudents
        );


      } catch (loadError) {

        console.error(
          "Failed to load lecturer students:",
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
          "Failed to load students."
        );


      } finally {

        setLoading(false);

      }

    };


    loadStudents();

  }, [navigate]);


  /* ========================================
     INITIALS
  ======================================== */

  function getInitials(name) {

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

  }


  /* ========================================
     BATCH OPTIONS
  ======================================== */

  const batchOptions =
    useMemo(() => {

      return [
        ...new Set(
          students
            .map(
              (student) =>
                student.batch
            )
            .filter(
              (batch) =>
                batch &&
                batch !== "No batch"
            )
        ),
      ].sort();

    }, [students]);


  /* ========================================
     FILTER STUDENTS
  ======================================== */

  const filteredStudents =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return students.filter(
        (student) => {

          const matchesSearch =

            student.name
              .toLowerCase()
              .includes(search) ||

            student.studentId
              .toLowerCase()
              .includes(search) ||

            student.course
              .toLowerCase()
              .includes(search) ||

            student.degree
              .toLowerCase()
              .includes(search) ||

            student.email
              .toLowerCase()
              .includes(search);


          const matchesBatch =

            batchFilter === "All" ||

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


  const activeStudents =
    students.filter(
      (student) =>
        student.status === "Active"
    ).length;


  const averageProgress =

    students.length > 0

      ? Math.round(
          students.reduce(
            (total, student) =>
              total +
              student.progress,
            0
          ) /
          students.length
        )

      : 0;


  const studentsWithScores =
    students.filter(
      (student) =>
        student.average !== null
    );


  const averagePerformance =

    studentsWithScores.length > 0

      ? Math.round(
          studentsWithScores.reduce(
            (total, student) =>
              total +
              student.average,
            0
          ) /
          studentsWithScores.length
        )

      : null;


  return (

    <div className="lecturer-students-page">


      {/* ====================================
          HEADER / ROSTER INTRO
      ==================================== */}

      <section className="lst-roster-header">


        <div className="lst-roster-heading">


          <div className="lst-roster-icon">

            <Users size={22} />

          </div>


          <div>

            <span className="lst-eyebrow">
              STUDENT ROSTER
            </span>


            <h1>
              Your Students
            </h1>


            <p>

              View your teaching groups,
              monitor learning progress and
              quickly check student performance.

            </p>

          </div>

        </div>


        <div className="lst-roster-total">

          <span>
            TOTAL ROSTER
          </span>

          <strong>
            {loading
              ? "..."
              : totalStudents}
          </strong>

          <small>

            {totalStudents === 1
              ? "student"
              : "students"}

          </small>

        </div>

      </section>


      {/* ====================================
          CLASS OVERVIEW
      ==================================== */}

      <section className="lst-overview-strip">


        <div className="lst-overview-label">

          <BarChart3 size={17} />

          <div>

            <strong>
              Class Overview
            </strong>

            <span>
              Current student activity
            </span>

          </div>

        </div>


        <div className="lst-overview-stat">

          <span>
            ACTIVE
          </span>

          <strong>
            {loading
              ? "..."
              : activeStudents}
          </strong>

          <small>
            students
          </small>

        </div>


        <div className="lst-overview-divider" />


        <div className="lst-overview-stat">

          <span>
            AVG. PROGRESS
          </span>

          <strong>

            {loading
              ? "..."
              : `${averageProgress}%`}

          </strong>

          <small>
            coursework
          </small>

        </div>


        <div className="lst-overview-divider" />


        <div className="lst-overview-stat">

          <span>
            AVG. SCORE
          </span>

          <strong>

            {loading
              ? "..."
              : averagePerformance !== null
                ? `${averagePerformance}%`
                : "—"}

          </strong>

          <small>
            graded work
          </small>

        </div>

      </section>


      {/* ====================================
          SEARCH / FILTER
      ==================================== */}

      <section className="lst-toolbar">


        <div className="lst-toolbar-info">

          <div className="lst-toolbar-icon">

            <Search size={16} />

          </div>


          <div>

            <strong>
              Find a student
            </strong>

            <span>
              Search your teaching roster
            </span>

          </div>

        </div>


        <div className="lst-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search name, email, course..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          className="lst-filter"
          value={batchFilter}
          onChange={(event) =>
            setBatchFilter(
              event.target.value
            )
          }
        >

          <option value="All">
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

      </section>


      {/* ====================================
          SECTION TITLE
      ==================================== */}

      {!loading && !error && (

        <div className="lst-section-heading">

          <div>

            <span>
              CLASS DIRECTORY
            </span>

            <h2>
              Student Profiles
            </h2>

          </div>


          <small>

            {filteredStudents.length}{" "}

            {filteredStudents.length === 1
              ? "result"
              : "results"}

          </small>

        </div>

      )}


      {/* ====================================
          LOADING
      ==================================== */}

      {loading && (

        <div className="lst-empty">

          <Users size={28} />

          <h3>
            Loading students...
          </h3>

          <p>

            Please wait while student
            information is loaded.

          </p>

        </div>

      )}


      {/* ====================================
          ERROR
      ==================================== */}

      {!loading && error && (

        <div className="lst-empty">

          <Users size={28} />

          <h3>
            Unable to load students
          </h3>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ====================================
          STUDENT GRID
      ==================================== */}

      {!loading &&
        !error &&
        filteredStudents.length > 0 && (

        <section className="lst-grid">


          {filteredStudents.map(
            (student) => (

              <article
                className="lst-student-card"
                key={student.id}
              >


                {/* TOP */}

                <div className="lst-card-top">


                  <div className="lst-avatar">

                    {student.initials}

                  </div>


                  <span
                    className={
                      student.status ===
                      "Active"
                        ? "lst-status lst-status-active"
                        : "lst-status lst-status-inactive"
                    }
                  >

                    <span
                      className="lst-status-dot"
                    />

                    {student.status}

                  </span>

                </div>


                {/* NAME */}

                <div className="lst-card-identity">

                  <h3>
                    {student.name}
                  </h3>

                  <p>
                    {student.studentId}
                  </p>

                </div>


                {/* ACADEMIC INFO */}

                <div className="lst-academic-info">


                  <div>

                    <GraduationCap
                      size={14}
                    />

                    <span>
                      {student.degree}
                    </span>

                  </div>


                  <div>

                    <Users size={14} />

                    <span>
                      Batch {student.batch}
                    </span>

                  </div>


                  <div>

                    <BookOpen
                      size={14}
                    />

                    <span>
                      {student.course}
                    </span>

                  </div>

                </div>


                {/* PROGRESS */}

                <div className="lst-progress">


                  <div className="lst-progress-info">

                    <span>
                      Learning progress
                    </span>

                    <strong>
                      {student.progress}%
                    </strong>

                  </div>


                  <div className="lst-progress-track">

                    <div
                      className="lst-progress-fill"
                      style={{
                        width:
                          `${student.progress}%`,
                      }}
                    />

                  </div>

                </div>


                {/* PERFORMANCE */}

                <div className="lst-performance">


                  <div>

                    <strong>
                      {student.submissions}
                    </strong>

                    <span>
                      Submitted
                    </span>

                  </div>


                  <div>

                    <strong>
                      {student.graded}
                    </strong>

                    <span>
                      Graded
                    </span>

                  </div>


                  <div>

                    <strong>

                      {student.average !== null
                        ? `${student.average}%`
                        : "—"}

                    </strong>

                    <span>
                      Average
                    </span>

                  </div>

                </div>


                {/* ACTION */}

                <button
                  type="button"
                  className="lst-view-button"
                  onClick={() =>
                    setSelectedStudent(
                      student
                    )
                  }
                >

                  <Eye size={14} />

                  View Profile

                  <ChevronRight
                    size={14}
                  />

                </button>

              </article>

            )
          )}

        </section>

      )}


      {/* ====================================
          EMPTY SEARCH RESULT
      ==================================== */}

      {!loading &&
        !error &&
        filteredStudents.length === 0 && (

        <div className="lst-empty">

          <Search size={28} />

          <h3>
            No students found
          </h3>

          <p>

            Try changing your search
            or batch filter.

          </p>

        </div>

      )}


      {/* ====================================
          STUDENT DETAILS MODAL
      ==================================== */}

      {selectedStudent && (

        <div className="lst-modal-overlay">


          <div className="lst-modal">


            {/* ==================================
                MODAL TOPBAR
            ================================== */}

            <div className="lst-modal-header">


              <div>

                <span>
                  STUDENT PROFILE
                </span>

                <h2>
                  Academic Overview
                </h2>

                <p>

                  Student account,
                  coursework and performance.

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
              >

                <X size={18} />

              </button>

            </div>


            {/* ==================================
                PROFILE BANNER
            ================================== */}

            <div className="lst-modal-profile">


              <div className="lst-modal-avatar">

                {
                  selectedStudent.initials
                }

              </div>


              <div className="lst-modal-profile-text">

                <span>
                  STUDENT
                </span>

                <h3>

                  {
                    selectedStudent.name
                  }

                </h3>

                <p>

                  {
                    selectedStudent.studentId
                  }

                </p>

              </div>


              <div
                className={
                  selectedStudent.status ===
                  "Active"
                    ? "lst-modal-status lst-modal-status-active"
                    : "lst-modal-status lst-modal-status-inactive"
                }
              >

                <CircleCheckBig
                  size={13}
                />

                {
                  selectedStudent.status
                }

              </div>

            </div>


            {/* ==================================
                INFO
            ================================== */}

            <div className="lst-modal-info-grid">


              <div className="lst-info-card">

                <div className="lst-info-icon">

                  <Mail size={17} />

                </div>

                <div>

                  <span>
                    Email
                  </span>

                  <strong>

                    {
                      selectedStudent.email
                    }

                  </strong>

                </div>

              </div>


              <div className="lst-info-card">

                <div className="lst-info-icon">

                  <GraduationCap
                    size={17}
                  />

                </div>

                <div>

                  <span>
                    Degree
                  </span>

                  <strong>

                    {
                      selectedStudent.degree
                    }

                  </strong>

                </div>

              </div>


              <div className="lst-info-card">

                <div className="lst-info-icon">

                  <BookOpen
                    size={17}
                  />

                </div>

                <div>

                  <span>
                    Courses
                  </span>

                  <strong>

                    {
                      selectedStudent.course
                    }

                  </strong>

                </div>

              </div>


              <div className="lst-info-card">

                <div className="lst-info-icon">

                  <Users size={17} />

                </div>

                <div>

                  <span>
                    Batch
                  </span>

                  <strong>

                    {
                      selectedStudent.batch
                    }

                  </strong>

                </div>

              </div>

            </div>


            {/* ==================================
                PROGRESS
            ================================== */}

            <div className="lst-modal-progress">


              <div className="lst-modal-progress-icon">

                <TrendingUp
                  size={19}
                />

              </div>


              <div className="lst-modal-progress-body">


                <div className="lst-modal-progress-header">

                  <div>

                    <span>
                      LEARNING PROGRESS
                    </span>

                    <h3>
                      Coursework completion
                    </h3>

                  </div>


                  <strong>

                    {
                      selectedStudent.progress
                    }%

                  </strong>

                </div>


                <div className="lst-modal-progress-track">

                  <div
                    style={{
                      width:
                        `${selectedStudent.progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>


            {/* ==================================
                ACADEMIC STATS
            ================================== */}

            <div className="lst-modal-stats">


              <div>

                <ClipboardList
                  size={18}
                />

                <span>
                  SUBMISSIONS
                </span>

                <strong>

                  {
                    selectedStudent.submissions
                  }

                </strong>

              </div>


              <div>

                <CircleCheckBig
                  size={18}
                />

                <span>
                  GRADED
                </span>

                <strong>

                  {
                    selectedStudent.graded
                  }

                </strong>

              </div>


              <div>

                <Award size={18} />

                <span>
                  AVG. SCORE
                </span>

                <strong>

                  {selectedStudent.average !== null
                    ? `${selectedStudent.average}%`
                    : "—"}

                </strong>

              </div>

            </div>


            {/* ==================================
                FOOTER
            ================================== */}

            <div className="lst-modal-footer">


              <div>

                <UserRound size={16} />

                <span>

                  Academic information
                  for this student.

                </span>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default LecturerStudents;