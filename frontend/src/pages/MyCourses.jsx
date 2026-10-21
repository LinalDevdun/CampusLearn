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
  Search,
  GraduationCap,
  Layers3,
  ArrowRight,
  LibraryBig,
  CalendarDays,
  UserRound,
  FileText,
  Sparkles,
  SlidersHorizontal,
  FolderOpen,
  CheckCircle2,
  CircleDot,
} from "lucide-react";

import "../styles/myCourses.css";

import API_BASE_URL from "../config/api";


function MyCourses() {

  const navigate =
    useNavigate();


  /* ========================================
     STATE
  ======================================== */

  const [
    courses,
    setCourses,
  ] = useState([]);


  const [
    student,
    setStudent,
  ] = useState({
    name: "",
    degree: "",
    batch: "",
  });


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    selectedDegree,
    setSelectedDegree,
  ] = useState("All");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* ========================================
     FETCH REAL STUDENT COURSES
  ======================================== */

  useEffect(() => {

    const fetchCourses =
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
              `${API_BASE_URL}/student/dashboard`,
              {
                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },
              }
            );


          setStudent(
            response.data.student || {}
          );


          setCourses(
            response.data.courses || []
          );


        } catch (error) {

          console.error(
            "Error fetching student courses:",
            error
          );


          /* =================================
             LOGIN / TOKEN ERROR
          ================================= */

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

            localStorage.removeItem(
              "user"
            );

            navigate("/login");

            return;

          }


          /* =================================
             MAINTENANCE MODE
          ================================= */

          if (
            error.response?.status ===
            503
          ) {

            setError(
              error.response?.data
                ?.error ||
              "CampusLearn is currently under maintenance."
            );

            return;

          }


          setError(
            error.response?.data
              ?.error ||
            "Failed to load your courses."
          );


        } finally {

          setLoading(false);

        }

      };


    fetchCourses();

  }, [navigate]);


  /* ========================================
     AVAILABLE DEGREE FILTERS
  ======================================== */

  const degreeOptions =
    useMemo(() => {

      const degrees =
        courses
          .map(
            (course) =>
              course.degree
          )
          .filter(Boolean);


      return [
        "All",
        ...new Set(degrees),
      ];

    }, [courses]);


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const filteredCourses =
    useMemo(() => {

      const searchValue =
        searchTerm
          .trim()
          .toLowerCase();


      return courses.filter(
        (course) => {

          const matchesSearch =
            !searchValue ||

            course.title
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||

            course.degree
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||

            course.lecturer_name
              ?.toLowerCase()
              .includes(
                searchValue
              );


          const matchesDegree =
            selectedDegree ===
              "All" ||

            course.degree ===
              selectedDegree;


          return (
            matchesSearch &&
            matchesDegree
          );

        }
      );

    }, [
      courses,
      searchTerm,
      selectedDegree,
    ]);


  /* ========================================
     REAL LEARNING RESOURCE COUNT
  ======================================== */

  const learningResources =
    useMemo(() => {

      return courses.reduce(
        (
          total,
          course
        ) => {

          const mainMaterial =
            course.has_material
              ? 1
              : 0;


          const lessons =
            Number(
              course.lesson_count
            ) || 0;


          return (
            total +
            mainMaterial +
            lessons
          );

        },

        0
      );

    }, [courses]);


  /* ========================================
     CARD THEMES
  ======================================== */

  const courseThemes = [

    "course-theme-1",

    "course-theme-2",

    "course-theme-3",

    "course-theme-4",

    "course-theme-5",

    "course-theme-6",

  ];


  return (

    <div className="my-courses-page">


      {/* ====================================
          LIBRARY HEADER
      ==================================== */}

      <section className="courses-library-header">


        <div className="library-heading-area">

          <div className="library-eyebrow">

            <Sparkles size={13} />

            Academic Library

          </div>


          <h1>

            My Courses

          </h1>


          <p>

            Explore your enrolled modules,
            course resources and learning
            materials from one organized
            space.

          </p>


          <div className="library-quick-stats">

            <div>

              <strong>
                {courses.length}
              </strong>

              <span>
                Active modules
              </span>

            </div>


            <div className="quick-stat-divider" />


            <div>

              <strong>
                {learningResources}
              </strong>

              <span>
                Resources
              </span>

            </div>


            <div className="quick-stat-divider" />


            <div>

              <strong>
                {student.batch ||
                  "—"}
              </strong>

              <span>
                Batch
              </span>

            </div>

          </div>

        </div>


        {/* ACADEMIC PASSPORT */}

        <div className="academic-passport">

          <div className="passport-decoration passport-decoration-one" />

          <div className="passport-decoration passport-decoration-two" />


          <div className="passport-top">

            <div className="passport-icon">

              <GraduationCap
                size={22}
              />

            </div>


            <span>
              STUDENT PROGRAM
            </span>

          </div>


          <div className="passport-degree">

            {student.degree ||
              "Degree not assigned"}

          </div>


          <div className="passport-bottom">

            <div>

              <span>
                Academic Batch
              </span>

              <strong>

                {student.batch ||
                  "—"}

              </strong>

            </div>


            <div className="passport-course-count">

              <BookOpen size={15} />

              {courses.length}

            </div>

          </div>

        </div>

      </section>


      {/* ====================================
          SUMMARY STRIP
      ==================================== */}

      <section className="courses-summary">


        <div className="course-summary-card summary-purple">

          <div className="summary-accent" />

          <div className="course-summary-icon">

            <LibraryBig
              size={21}
            />

          </div>


          <div>

            <span className="summary-label">
              Course Library
            </span>

            <strong>
              {courses.length}
            </strong>

            <small>
              Enrolled courses
            </small>

          </div>

        </div>


        <div className="course-summary-card summary-blue">

          <div className="summary-accent" />

          <div className="course-summary-icon">

            <FileText
              size={21}
            />

          </div>


          <div>

            <span className="summary-label">
              Learning Content
            </span>

            <strong>
              {learningResources}
            </strong>

            <small>
              Available resources
            </small>

          </div>

        </div>


        <div className="course-summary-card summary-green">

          <div className="summary-accent" />

          <div className="course-summary-icon">

            <Layers3
              size={21}
            />

          </div>


          <div>

            <span className="summary-label">
              Current Intake
            </span>

            <strong>

              {student.batch ||
                "—"}

            </strong>

            <small>
              Academic batch
            </small>

          </div>

        </div>

      </section>


      {/* ====================================
          SEARCH + FILTER
      ==================================== */}

      <section className="course-discovery-bar">


        <div className="course-discovery-title">

          <div className="discovery-icon">

            <SlidersHorizontal
              size={18}
            />

          </div>


          <div>

            <strong>
              Find a module
            </strong>

            <span>
              Search your course library
            </span>

          </div>

        </div>


        <div className="course-search">

          <Search
            size={17}
          />


          <input
            type="text"
            placeholder="Search by course, lecturer or program..."
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


        <div className="filter-wrapper">

          <GraduationCap
            size={15}
          />


          <select
            className="course-filter"
            value={
              selectedDegree
            }
            onChange={
              (event) =>
                setSelectedDegree(
                  event.target.value
                )
            }
          >

            {degreeOptions.map(
              (degree) => (

                <option
                  value={degree}
                  key={degree}
                >

                  {degree === "All"
                    ? "All Programs"
                    : degree}

                </option>

              )
            )}

          </select>

        </div>

      </section>


      {/* ====================================
          RESULTS HEADER
      ==================================== */}

      {!loading &&
        !error && (

          <div className="course-results-heading">

            <div>

              <span className="results-kicker">

                <FolderOpen
                  size={13}
                />

                Your modules

              </span>


              <h2>

                Course Collection

              </h2>

            </div>


            <span className="results-count">

              {filteredCourses.length}{" "}

              {filteredCourses.length === 1
                ? "result"
                : "results"}

            </span>

          </div>

        )}


      {/* ====================================
          COURSE GRID
      ==================================== */}

      <section className="my-courses-grid">


        {/* LOADING */}

        {loading ? (

          <div className="courses-empty-state">

            <div className="courses-loading-ring" />


            <h3>
              Building your course library...
            </h3>


            <p>
              We're loading your enrolled
              modules and resources.
            </p>

          </div>


        ) : error ? (


          /* ERROR */

          <div className="courses-empty-state">

            <div className="courses-empty-icon error">

              <BookOpen
                size={26}
              />

            </div>


            <h3>
              Unable to load courses
            </h3>


            <p>
              {error}
            </p>

          </div>


        ) : filteredCourses.length ===
          0 ? (


          /* EMPTY */

          <div className="courses-empty-state">

            <div className="courses-empty-icon">

              <Search
                size={25}
              />

            </div>


            <h3>
              No courses found
            </h3>


            <p>

              {searchTerm ||
              selectedDegree !==
                "All"

                ? "Try changing your search or filter options."

                : student.degree ||
                  student.batch

                  ? `No courses are currently assigned to ${
                      student.degree ||
                      "your program"
                    }${
                      student.batch
                        ? `, Batch ${student.batch}`
                        : ""
                    }.`

                  : "Your degree and batch have not been assigned yet."}

            </p>

          </div>


        ) : (


          /* REAL COURSES */

          filteredCourses.map(
            (
              course,
              index
            ) => {

              const theme =
                courseThemes[
                  index %
                  courseThemes.length
                ];


              const lessonCount =
                Number(
                  course.lesson_count
                ) || 0;


              const moduleNumber =
                String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                );


              return (

                <article
                  className={
                    `my-course-card ${theme}`
                  }
                  key={
                    course.id
                  }
                >


                  {/* ==========================
                      COLOR RAIL
                  ========================== */}

                  <div className="course-color-rail" />


                  {/* ==========================
                      CARD HEADER
                  ========================== */}

                  <div className="course-card-top">

                    <div className="module-number">

                      MODULE

                      <strong>
                        {moduleNumber}
                      </strong>

                    </div>


                    <div className="my-course-icon">

                      <GraduationCap
                        size={23}
                        strokeWidth={1.8}
                      />

                    </div>

                  </div>


                  {/* ==========================
                      BODY
                  ========================== */}

                  <div className="my-course-body">


                    <div className="my-course-meta">

                      {course.degree && (

                        <span className="course-meta-badge">

                          <GraduationCap
                            size={10}
                          />

                          {
                            course.degree
                          }

                        </span>

                      )}


                      {course.batch && (

                        <span className="course-meta-badge">

                          <CalendarDays
                            size={10}
                          />

                          Batch{" "}

                          {
                            course.batch
                          }

                        </span>

                      )}

                    </div>


                    <h3>

                      {course.title}

                    </h3>


                    <div className="course-info-list">


                      <div className="course-info-row">

                        <div className="course-info-icon">

                          <UserRound
                            size={14}
                          />

                        </div>


                        <div>

                          <span>
                            Lecturer
                          </span>

                          <strong>

                            {course
                              .lecturer_name ||
                              "Not assigned"}

                          </strong>

                        </div>

                      </div>


                      <div className="course-info-row">

                        <div className="course-info-icon">

                          <BookOpen
                            size={14}
                          />

                        </div>


                        <div>

                          <span>
                            Course content
                          </span>

                          <strong>

                            {lessonCount}{" "}

                            {lessonCount ===
                            1
                              ? "lesson"
                              : "lessons"}

                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* MATERIAL STATUS */}

                    <div
                      className={
                        course.has_material
                          ? "material-status available"
                          : "material-status unavailable"
                      }
                    >

                      {course.has_material ? (

                        <CheckCircle2
                          size={14}
                        />

                      ) : (

                        <CircleDot
                          size={14}
                        />

                      )}


                      <div>

                        <strong>

                          {course.has_material
                            ? "Learning material ready"
                            : "Main material pending"}

                        </strong>


                        <span>

                          {course.has_material
                            ? "Resources are available inside this module."
                            : "Additional materials may be added later."}

                        </span>

                      </div>

                    </div>


                    {/* FOOTER */}

                    <div className="my-course-footer">

                      <span className="course-status">

                        <span className="course-status-dot" />

                        Active module

                      </span>


                      <button
                        className="open-course-button"
                        onClick={() =>
                          navigate(
                            `/course/${course.id}`
                          )
                        }
                      >

                        Open Course

                        <ArrowRight
                          size={14}
                        />

                      </button>

                    </div>

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


export default MyCourses;