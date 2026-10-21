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
  BookOpen,
  Search,
  Plus,
  GraduationCap,
  FileText,
  Users,
  X,
  Upload,
  Pencil,
  Trash2,
  Eye,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  CircleCheckBig,
  Layers3,
  UserRoundCog,
  Activity,
  Paperclip,
} from "lucide-react";

import "../styles/adminCourses.css";

import API_BASE_URL from "../config/api";


function AdminCourses() {

  const navigate =
    useNavigate();


  /* ========================================
     COURSES
  ======================================== */

  const [
    courses,
    setCourses,
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
     LECTURERS
  ======================================== */

  const [
    lecturers,
    setLecturers,
  ] = useState([]);


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    programFilter,
    setProgramFilter,
  ] = useState("ALL");


  /* ========================================
     VIEW COURSE
  ======================================== */

  const [
    selectedCourse,
    setSelectedCourse,
  ] = useState(null);


  const [
    courseLessons,
    setCourseLessons,
  ] = useState([]);


  const [
    lessonsLoading,
    setLessonsLoading,
  ] = useState(false);


  const [
    lessonsError,
    setLessonsError,
  ] = useState("");


  /* ========================================
     CREATE / EDIT COURSE
  ======================================== */

  const [
    courseModalOpen,
    setCourseModalOpen,
  ] = useState(false);


  const [
    editingCourse,
    setEditingCourse,
  ] = useState(null);


  const [
    savingCourse,
    setSavingCourse,
  ] = useState(false);


  const [
    formError,
    setFormError,
  ] = useState("");


  const [
    courseForm,
    setCourseForm,
  ] = useState({
    courseTitle: "",
    degree: "",
    batch: "",
    lecturerId: "",
    file: null,
  });


  /* ========================================
     DELETE
  ======================================== */

  const [
    deletingCourseId,
    setDeletingCourseId,
  ] = useState(null);


  /* ========================================
     AUTH ERROR
  ======================================== */

  const handleAuthError =
    useCallback(
      (error) => {

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "role"
          );

          navigate("/login");

          return true;

        }


        return false;

      },
      [navigate]
    );


  /* ========================================
     LOAD COURSES
  ======================================== */

  const loadCourses =
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
              `${API_BASE_URL}/admin/courses/summary`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const realCourses =
            response.data.map(
              (course) => ({

                id:
                  course.id,

                title:
                  course.title ||
                  "Untitled Course",

                program:
                  course.degree ||
                  "Not assigned",

                batch:
                  course.batch ||
                  "Not assigned",

                lecturerId:
                  course.lecturer_id ||
                  null,

                lecturer:
                  course.lecturer_name ||
                  "Not assigned",

                filePath:
                  course.file_path ||
                  null,

                students:
                  Number(
                    course.student_count
                  ) || 0,

                lessons:
                  Number(
                    course.lesson_count
                  ) || 0,

                materials:
                  Number(
                    course.material_count
                  ) || 0,

                status:
                  "Active",

              })
            );


          setCourses(
            realCourses
          );


        } catch (error) {

          console.error(
            "Load Courses Error:",
            error
          );


          if (
            handleAuthError(
              error
            )
          ) {

            return;

          }


          setError(
            error.response?.data
              ?.error ||
            "Failed to load courses."
          );


        } finally {

          setLoading(false);

        }

      },
      [
        navigate,
        handleAuthError,
      ]
    );


  /* ========================================
     LOAD LECTURERS
  ======================================== */

  const loadLecturers =
    useCallback(
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );


          if (!token) {
            return;
          }


          const response =
            await axios.get(
              `${API_BASE_URL}/admin/users`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const lecturerUsers =
            response.data.filter(
              (user) =>
                user.role ===
                  "LECTURER" &&
                user.is_active !==
                  false
            );


          setLecturers(
            lecturerUsers
          );


        } catch (error) {

          console.error(
            "Load Lecturers Error:",
            error
          );


          handleAuthError(
            error
          );

        }

      },
      [handleAuthError]
    );


  /* ========================================
     INITIAL LOAD
  ======================================== */

  useEffect(() => {

    loadCourses();

    loadLecturers();

  }, [
    loadCourses,
    loadLecturers,
  ]);


  /* ========================================
     CREATE COURSE
  ======================================== */

  const openCreateModal = () => {

    setEditingCourse(
      null
    );

    setFormError("");


    setCourseForm({
      courseTitle: "",
      degree: "",
      batch: "",
      lecturerId: "",
      file: null,
    });


    setCourseModalOpen(
      true
    );

  };


  /* ========================================
     EDIT COURSE
  ======================================== */

  const openEditModal =
    (course) => {

      setEditingCourse(
        course
      );

      setFormError("");


      setCourseForm({

        courseTitle:
          course.title,

        degree:
          course.program ===
          "Not assigned"
            ? ""
            : course.program,

        batch:
          course.batch ===
          "Not assigned"
            ? ""
            : course.batch,

        lecturerId:
          course.lecturerId
            ? String(
                course.lecturerId
              )
            : "",

        file:
          null,

      });


      setCourseModalOpen(
        true
      );

    };


  /* ========================================
     CLOSE COURSE FORM
  ======================================== */

  const closeCourseModal = () => {

    if (savingCourse) {
      return;
    }


    setCourseModalOpen(
      false
    );

    setEditingCourse(
      null
    );

    setFormError("");


    setCourseForm({
      courseTitle: "",
      degree: "",
      batch: "",
      lecturerId: "",
      file: null,
    });

  };


  /* ========================================
     CREATE / UPDATE COURSE
  ======================================== */

  const handleSaveCourse =
    async (event) => {

      event.preventDefault();


      if (
        !courseForm.courseTitle.trim()
      ) {

        setFormError(
          "Please enter a course title."
        );

        return;

      }


      if (
        !courseForm.degree.trim()
      ) {

        setFormError(
          "Please enter a program / degree."
        );

        return;

      }


      if (
        !courseForm.batch.trim()
      ) {

        setFormError(
          "Please enter a batch."
        );

        return;

      }


      try {

        setSavingCourse(true);

        setFormError("");


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
          "courseTitle",
          courseForm.courseTitle.trim()
        );


        formData.append(
          "degree",
          courseForm.degree.trim()
        );


        formData.append(
          "batch",
          courseForm.batch.trim()
        );


        formData.append(
          "lecturerId",
          courseForm.lecturerId
        );


        if (
          courseForm.file
        ) {

          formData.append(
            "file",
            courseForm.file
          );

        }


        /* EDIT */

        if (editingCourse) {

          await axios.put(
            `${API_BASE_URL}/admin/courses/${editingCourse.id}`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


          alert(
            "Course updated successfully!"
          );

        }


        /* CREATE */

        else {

          await axios.post(
            `${API_BASE_URL}/courses`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


          alert(
            "Course created successfully!"
          );

        }


        setCourseModalOpen(
          false
        );

        setEditingCourse(
          null
        );


        setCourseForm({
          courseTitle: "",
          degree: "",
          batch: "",
          lecturerId: "",
          file: null,
        });


        await loadCourses();


      } catch (error) {

        console.error(
          "Save Course Error:",
          error
        );


        if (
          handleAuthError(
            error
          )
        ) {

          return;

        }


        setFormError(
          error.response?.data
            ?.error ||
          "Failed to save course."
        );


      } finally {

        setSavingCourse(
          false
        );

      }

    };


  /* ========================================
     DELETE COURSE
  ======================================== */

  const deleteCourse =
    async (course) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${course.title}"?\n\nThis action cannot be undone.`
        );


      if (!confirmed) {
        return;
      }


      try {

        setDeletingCourseId(
          course.id
        );


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        await axios.delete(
          `${API_BASE_URL}/admin/courses/${course.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        alert(
          "Course deleted successfully!"
        );


        await loadCourses();


      } catch (error) {

        console.error(
          "Delete Course Error:",
          error
        );


        if (
          handleAuthError(
            error
          )
        ) {

          return;

        }


        alert(
          error.response?.data
            ?.error ||
          "Failed to delete course."
        );


      } finally {

        setDeletingCourseId(
          null
        );

      }

    };


  /* ========================================
     OPEN COURSE DETAILS
  ======================================== */

  const openCourseDetails =
    async (course) => {

      setSelectedCourse(
        course
      );

      setCourseLessons([]);

      setLessonsError("");

      setLessonsLoading(
        true
      );


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
            `${API_BASE_URL}/courses/${course.id}/lessons`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        setCourseLessons(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );


      } catch (error) {

        console.error(
          "Load Lessons Error:",
          error
        );


        if (
          handleAuthError(
            error
          )
        ) {

          return;

        }


        setLessonsError(
          error.response?.data
            ?.error ||
          "Failed to load lessons."
        );


      } finally {

        setLessonsLoading(
          false
        );

      }

    };


  /* ========================================
     CLOSE COURSE DETAILS
  ======================================== */

  const closeCourseDetails = () => {

    setSelectedCourse(
      null
    );

    setCourseLessons([]);

    setLessonsError("");

    setLessonsLoading(
      false
    );

  };


  /* ========================================
     ESC KEY
  ======================================== */

  useEffect(() => {

    const handleEscape =
      (event) => {

        if (
          event.key !==
          "Escape"
        ) {

          return;

        }


        if (selectedCourse) {

          closeCourseDetails();

        }


        if (
          courseModalOpen &&
          !savingCourse
        ) {

          setCourseModalOpen(
            false
          );

          setEditingCourse(
            null
          );

          setFormError("");

        }

      };


    window.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, [
    selectedCourse,
    courseModalOpen,
    savingCourse,
  ]);


  /* ========================================
     PROGRAM OPTIONS
  ======================================== */

  const programOptions =
    useMemo(() => {

      const programs =
        courses
          .map(
            (course) =>
              course.program
          )
          .filter(
            (program) =>
              program &&
              program !==
                "Not assigned"
          );


      return [
        ...new Set(programs),
      ].sort();

    }, [courses]);


  /* ========================================
     FILTER COURSES
  ======================================== */

  const filteredCourses =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return courses.filter(
        (course) => {

          const matchesSearch =

            course.title
              .toLowerCase()
              .includes(search) ||

            course.program
              .toLowerCase()
              .includes(search) ||

            course.batch
              .toLowerCase()
              .includes(search) ||

            course.lecturer
              .toLowerCase()
              .includes(search);


          const matchesProgram =
            programFilter ===
              "ALL" ||
            course.program ===
              programFilter;


          return (
            matchesSearch &&
            matchesProgram
          );

        }
      );

    }, [
      courses,
      searchTerm,
      programFilter,
    ]);


  /* ========================================
     SUMMARY
  ======================================== */

  const totalCourses =
    courses.length;


  const studyPrograms =
    new Set(
      courses
        .map(
          (course) =>
            course.program
        )
        .filter(
          (program) =>
            program &&
            program !==
              "Not assigned"
        )
    ).size;


  const batches =
    new Set(
      courses
        .map(
          (course) =>
            course.batch
        )
        .filter(
          (batch) =>
            batch &&
            batch !==
              "Not assigned"
        )
    ).size;


  const uploadedMaterials =
    courses.reduce(
      (total, course) =>
        total +
        course.materials,
      0
    );


  const totalEnrollments =
    courses.reduce(
      (total, course) =>
        total +
        course.students,
      0
    );


  const coursesWithLecturers =
    courses.filter(
      (course) =>
        course.lecturer !==
        "Not assigned"
    ).length;


  const lecturerCoverage =
    totalCourses > 0
      ? Math.round(
          (
            coursesWithLecturers /
            totalCourses
          ) * 100
        )
      : 0;


  const filtersActive =
    Boolean(
      searchTerm.trim()
    ) ||
    programFilter !== "ALL";


  const clearFilters = () => {

    setSearchTerm("");

    setProgramFilter(
      "ALL"
    );

  };


  return (

    <div className="admin-courses-page">


      {/* ====================================
          CATALOG HERO
      ==================================== */}

      <section className="ac-catalog-hero">


        <div className="ac-hero-copy">


          <div className="ac-eyebrow">

            <Sparkles size={12} />

            ACADEMIC CATALOG CONTROL

          </div>


          <h1>
            Courses
          </h1>


          <p>

            Organize modules, teaching
            assignments, student groups
            and learning resources across
            CampusLearn.

          </p>


          <div className="ac-hero-tags">


            <span>

              <BookOpen
                size={13}
              />

              {totalCourses} active courses

            </span>


            <span>

              <GraduationCap
                size={13}
              />

              {studyPrograms} programs

            </span>


            <span>

              <Users
                size={13}
              />

              {totalEnrollments} enrollments

            </span>


          </div>


        </div>


        {/* CATALOG CONTROL CARD */}

        <div className="ac-catalog-control">


          <div className="ac-control-top">


            <div>

              <span>
                CATALOG READINESS
              </span>

              <strong>
                {lecturerCoverage}%
              </strong>

              <small>
                lecturer coverage
              </small>

            </div>


            <div className="ac-control-icon">

              <Layers3 size={22} />

            </div>


          </div>


          <div className="ac-control-track">

            <div
              style={{
                width:
                  `${lecturerCoverage}%`,
              }}
            />

          </div>


          <div className="ac-control-meta">

            <span>
              {
                coursesWithLecturers
              } assigned
            </span>

            <span>
              {
                totalCourses -
                coursesWithLecturers
              } unassigned
            </span>

          </div>


          <button
            type="button"
            className="ac-hero-create"
            onClick={
              openCreateModal
            }
          >

            <Plus size={15} />

            Create New Course

          </button>


        </div>


      </section>


      {/* ====================================
          CATALOG OVERVIEW
      ==================================== */}

      <section className="ac-overview-strip">


        <OverviewItem
          icon={
            <BookOpen size={19} />
          }
          label="Active Courses"
          value={totalCourses}
          description="Current modules"
          className="ac-overview-teal"
        />


        <div className="ac-overview-divider" />


        <OverviewItem
          icon={
            <GraduationCap
              size={19}
            />
          }
          label="Study Programs"
          value={studyPrograms}
          description="Degree pathways"
          className="ac-overview-purple"
        />


        <div className="ac-overview-divider" />


        <OverviewItem
          icon={
            <Users size={19} />
          }
          label="Course Batches"
          value={batches}
          description="Active cohorts"
          className="ac-overview-blue"
        />


        <div className="ac-overview-divider" />


        <OverviewItem
          icon={
            <FileText size={19} />
          }
          label="Materials"
          value={uploadedMaterials}
          description="Learning resources"
          className="ac-overview-orange"
        />


      </section>


      {/* ====================================
          COURSE LIBRARY
      ==================================== */}

      <section className="ac-library">


        <div className="ac-library-header">


          <div>

            <span>
              COURSE PORTFOLIO
            </span>

            <h2>
              Academic Course Library
            </h2>

            <p>

              Browse, review and maintain
              every CampusLearn module.

            </p>

          </div>


          <div className="ac-results-count">

            <strong>
              {filteredCourses.length}
            </strong>

            <span>
              of {totalCourses} shown
            </span>

          </div>


        </div>


        {/* ==================================
            SEARCH + FILTER
        ================================== */}

        <div className="ac-toolbar">


          <div className="ac-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search course, program, batch or lecturer..."
              value={searchTerm}
              onChange={
                (event) =>
                  setSearchTerm(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="ac-filter-label">

            <SlidersHorizontal
              size={14}
            />

            Program

          </div>


          <div className="ac-toolbar-actions">


            <select
              value={programFilter}
              onChange={
                (event) =>
                  setProgramFilter(
                    event.target.value
                  )
              }
            >

              <option value="ALL">
                All Programs
              </option>


              {programOptions.map(
                (program) => (

                  <option
                    key={program}
                    value={program}
                  >

                    {program}

                  </option>

                )
              )}

            </select>


            {filtersActive && (

              <button
                type="button"
                className="ac-reset-button"
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
            CONTENT
        ================================== */}

        <div className="ac-library-content">


          {/* LOADING */}

          {loading && (

            <div className="ac-empty">

              <div className="ac-spinner" />

              <h3>
                Loading course catalog
              </h3>

              <p>
                Getting course information
                from PostgreSQL.
              </p>

            </div>

          )}


          {/* ERROR */}

          {!loading &&
            error && (

            <div className="ac-empty ac-error-state">

              <BookOpen size={28} />

              <h3>
                Unable to load courses
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* GRID */}

          {!loading &&
            !error &&
            filteredCourses.length >
              0 && (

            <section className="ac-grid">


              {filteredCourses.map(
                (course) => (

                  <article
                    className="ac-card"
                    key={course.id}
                  >


                    <div className="ac-card-accent" />


                    {/* CARD HEADER */}

                    <div className="ac-card-header">


                      <div className="ac-course-icon">

                        <BookOpen
                          size={21}
                        />

                      </div>


                      <span className="ac-active-badge">

                        <i />

                        {course.status}

                      </span>


                    </div>


                    {/* TITLE */}

                    <div className="ac-course-heading">

                      <span className="ac-course-code">

                        COURSE #
                        {String(
                          course.id
                        ).padStart(
                          2,
                          "0"
                        )}

                      </span>


                      <h3>
                        {course.title}
                      </h3>


                      <div className="ac-program">

                        <GraduationCap
                          size={13}
                        />

                        <span>
                          {course.program}
                        </span>

                      </div>

                    </div>


                    {/* METRICS */}

                    <div className="ac-card-metrics">


                      <CourseMetric
                        icon={
                          <Users
                            size={14}
                          />
                        }
                        value={
                          course.students
                        }
                        label="Students"
                      />


                      <CourseMetric
                        icon={
                          <FileText
                            size={14}
                          />
                        }
                        value={
                          course.materials
                        }
                        label="Materials"
                      />


                      <CourseMetric
                        icon={
                          <BookOpen
                            size={14}
                          />
                        }
                        value={
                          course.lessons
                        }
                        label="Lessons"
                      />


                    </div>


                    {/* LECTURER */}

                    <div className="ac-lecturer-block">


                      <div className="ac-lecturer-icon">

                        <UserRoundCog
                          size={15}
                        />

                      </div>


                      <div>

                        <span>
                          COURSE LECTURER
                        </span>

                        <strong>
                          {
                            course.lecturer
                          }
                        </strong>

                      </div>


                    </div>


                    {/* BATCH */}

                    <div className="ac-batch">

                      <Layers3
                        size={13}
                      />

                      {course.batch ===
                      "Not assigned"
                        ? "Batch not assigned"
                        : `Batch ${course.batch}`}

                    </div>


                    {/* ACTIONS */}

                    <div className="ac-actions">


                      <button
                        type="button"
                        className="ac-view-button"
                        onClick={() =>
                          openCourseDetails(
                            course
                          )
                        }
                      >

                        <Eye
                          size={14}
                        />

                        View Course

                      </button>


                      <button
                        type="button"
                        className="ac-edit-button"
                        onClick={() =>
                          openEditModal(
                            course
                          )
                        }
                        title="Edit Course"
                      >

                        <Pencil
                          size={14}
                        />

                      </button>


                      <button
                        type="button"
                        className="ac-delete-button"
                        onClick={() =>
                          deleteCourse(
                            course
                          )
                        }
                        disabled={
                          deletingCourseId ===
                          course.id
                        }
                        title="Delete Course"
                      >

                        <Trash2
                          size={14}
                        />

                      </button>


                    </div>


                  </article>

                )
              )}


            </section>

          )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredCourses.length ===
              0 && (

            <div className="ac-empty">


              <div className="ac-empty-icon">

                <Search
                  size={23}
                />

              </div>


              <h3>
                No matching courses
              </h3>


              <p>

                Try another search term
                or reset the program filter.

              </p>


              {filtersActive && (

                <button
                  type="button"
                  className="ac-empty-reset"
                  onClick={
                    clearFilters
                  }
                >

                  Reset Filters

                </button>

              )}


            </div>

          )}


        </div>


      </section>


      {/* ====================================
          CREATE / EDIT MODAL
      ==================================== */}

      {courseModalOpen && (

        <div
          className="ac-modal-overlay"
          onClick={
            closeCourseModal
          }
        >


          <div
            className="ac-modal"
            onClick={
              (event) =>
                event.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="ac-modal-header">


              <div className="ac-modal-title">


                <div className="ac-modal-title-icon">

                  {editingCourse ? (

                    <Pencil
                      size={19}
                    />

                  ) : (

                    <Plus
                      size={20}
                    />

                  )}

                </div>


                <div>

                  <span>
                    COURSE MANAGEMENT
                  </span>

                  <h2>

                    {editingCourse
                      ? "Edit Course"
                      : "Create Course"}

                  </h2>

                  <p>

                    {editingCourse
                      ? "Update course, lecturer and learning material information."
                      : "Add a new academic module to the CampusLearn catalog."}

                  </p>

                </div>


              </div>


              <button
                type="button"
                className="ac-modal-close"
                onClick={
                  closeCourseModal
                }
                disabled={
                  savingCourse
                }
              >

                <X size={18} />

              </button>


            </div>


            {/* FORM */}

            <form
              className="ac-form"
              onSubmit={
                handleSaveCourse
              }
            >


              {formError && (

                <div className="ac-form-error">

                  {formError}

                </div>

              )}


              <div className="ac-form-section-label">

                COURSE INFORMATION

              </div>


              {/* TITLE */}

              <div className="ac-form-group">

                <label>
                  Course Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Cloud Computing"
                  value={
                    courseForm
                      .courseTitle
                  }
                  onChange={
                    (event) =>
                      setCourseForm({
                        ...courseForm,

                        courseTitle:
                          event.target
                            .value,
                      })
                  }
                  required
                />

              </div>


              <div className="ac-form-row">


                {/* PROGRAM */}

                <div className="ac-form-group">

                  <label>
                    Program / Degree
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. BSc Computer Science"
                    value={
                      courseForm.degree
                    }
                    onChange={
                      (event) =>
                        setCourseForm({
                          ...courseForm,

                          degree:
                            event.target
                              .value,
                        })
                    }
                    required
                  />

                </div>


                {/* BATCH */}

                <div className="ac-form-group">

                  <label>
                    Batch
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 26.1"
                    value={
                      courseForm.batch
                    }
                    onChange={
                      (event) =>
                        setCourseForm({
                          ...courseForm,

                          batch:
                            event.target
                              .value,
                        })
                    }
                    required
                  />

                </div>


              </div>


              {/* LECTURER */}

              <div className="ac-form-group">

                <label>
                  Lecturer
                </label>

                <select
                  value={
                    courseForm
                      .lecturerId
                  }
                  onChange={
                    (event) =>
                      setCourseForm({
                        ...courseForm,

                        lecturerId:
                          event.target
                            .value,
                      })
                  }
                >

                  <option value="">
                    Not assigned
                  </option>


                  {lecturers.map(
                    (lecturer) => (

                      <option
                        key={
                          lecturer.id
                        }
                        value={
                          lecturer.id
                        }
                      >

                        {lecturer.name}
                        {" - "}
                        {lecturer.email}

                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="ac-form-section-label ac-material-label">

                LEARNING RESOURCE

              </div>


              {/* FILE */}

              <div className="ac-form-group">

                <label>

                  {editingCourse
                    ? "Replace Learning Material (Optional)"
                    : "Learning Material (Optional)"}

                </label>


                {editingCourse &&
                  editingCourse
                    .filePath && (

                  <div className="ac-existing-material">

                    <CircleCheckBig
                      size={15}
                    />

                    <div>

                      <strong>
                        Existing material saved
                      </strong>

                      <span>
                        Leave the file field empty
                        to keep the current material.
                      </span>

                    </div>

                  </div>

                )}


                <label className="ac-upload-zone">


                  <div className="ac-upload-icon">

                    <Upload size={21} />

                  </div>


                  <div>

                    <strong>

                      {courseForm.file
                        ? courseForm.file.name
                        : editingCourse
                          ? "Choose a replacement file"
                          : "Upload course material"}

                    </strong>

                    <span>

                      {courseForm.file
                        ? "New file selected"
                        : "Click here to choose a file from your computer"}

                    </span>

                  </div>


                  <input
                    type="file"
                    onChange={
                      (event) =>
                        setCourseForm({
                          ...courseForm,

                          file:
                            event.target
                              .files?.[0] ||
                            null,
                        })
                    }
                  />


                </label>


              </div>


              {/* BUTTONS */}

              <div className="ac-modal-actions">


                <button
                  type="button"
                  className="ac-cancel-button"
                  onClick={
                    closeCourseModal
                  }
                  disabled={
                    savingCourse
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="ac-save-button"
                  disabled={
                    savingCourse
                  }
                >

                  {editingCourse ? (
                    <Pencil
                      size={14}
                    />
                  ) : (
                    <Plus
                      size={15}
                    />
                  )}


                  {savingCourse
                    ? editingCourse
                      ? "Saving..."
                      : "Creating..."
                    : editingCourse
                      ? "Save Changes"
                      : "Create Course"}

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


      {/* ====================================
          VIEW COURSE MODAL
      ==================================== */}

      {selectedCourse && (

        <div
          className="ac-modal-overlay"
          onClick={
            closeCourseDetails
          }
        >


          <div
            className="ac-course-view-modal"
            onClick={
              (event) =>
                event.stopPropagation()
            }
          >


            {/* HERO */}

            <div className="ac-view-hero">


              <div className="ac-view-hero-icon">

                <BookOpen
                  size={24}
                />

              </div>


              <div className="ac-view-title">

                <span>
                  COURSE #
                  {String(
                    selectedCourse.id
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <h2>
                  {
                    selectedCourse
                      .title
                  }
                </h2>

                <p>

                  {
                    selectedCourse
                      .program
                  }

                  <i />

                  {
                    selectedCourse
                      .batch ===
                    "Not assigned"
                      ? "No batch"
                      : `Batch ${selectedCourse.batch}`
                  }

                </p>

              </div>


              <span className="ac-view-status">

                <CircleCheckBig
                  size={12}
                />

                Active

              </span>


              <button
                type="button"
                className="ac-view-close"
                onClick={
                  closeCourseDetails
                }
              >

                <X size={18} />

              </button>


            </div>


            <div className="ac-view-body">


              {/* COURSE SNAPSHOT */}

              <div className="ac-view-section-heading">

                <span>
                  COURSE SNAPSHOT
                </span>

                <h3>
                  Module Information
                </h3>

              </div>


              <div className="ac-view-details">


                <ViewDetail
                  icon={
                    <UserRoundCog
                      size={16}
                    />
                  }
                  label="Lecturer"
                  value={
                    selectedCourse
                      .lecturer
                  }
                />


                <ViewDetail
                  icon={
                    <Users
                      size={16}
                    />
                  }
                  label="Students"
                  value={
                    selectedCourse
                      .students
                  }
                />


                <ViewDetail
                  icon={
                    <BookOpen
                      size={16}
                    />
                  }
                  label="Lessons"
                  value={
                    selectedCourse
                      .lessons
                  }
                />


                <ViewDetail
                  icon={
                    <Paperclip
                      size={16}
                    />
                  }
                  label="Materials"
                  value={
                    selectedCourse
                      .materials
                  }
                />


              </div>


              {/* MAIN MATERIAL */}

              <div className="ac-material-status">


                <div className="ac-material-status-icon">

                  <FileText
                    size={17}
                  />

                </div>


                <div>

                  <span>
                    MAIN COURSE MATERIAL
                  </span>

                  <strong>

                    {selectedCourse.filePath
                      ? "Material uploaded"
                      : "No material uploaded"}

                  </strong>

                </div>


                <div
                  className={
                    selectedCourse
                      .filePath
                      ? "ac-material-dot ac-material-dot-active"
                      : "ac-material-dot"
                  }
                />

              </div>


              {/* LESSONS */}

              <div className="ac-view-section-heading ac-lessons-heading">

                <span>
                  LEARNING STRUCTURE
                </span>

                <h3>
                  Course Lessons
                </h3>

              </div>


              <div className="ac-lessons-area">


                {lessonsLoading && (

                  <div className="ac-lessons-state">

                    <div className="ac-spinner" />

                    <strong>
                      Loading lessons
                    </strong>

                  </div>

                )}


                {!lessonsLoading &&
                  lessonsError && (

                  <div className="ac-lessons-state ac-lessons-error">

                    <BookOpen
                      size={22}
                    />

                    <strong>
                      Unable to load lessons
                    </strong>

                    <span>
                      {lessonsError}
                    </span>

                  </div>

                )}


                {!lessonsLoading &&
                  !lessonsError &&
                  courseLessons.length ===
                    0 && (

                  <div className="ac-lessons-state">

                    <div className="ac-empty-icon">

                      <BookOpen
                        size={21}
                      />

                    </div>

                    <strong>
                      No lessons yet
                    </strong>

                    <span>
                      Lessons added to this
                      course will appear here.
                    </span>

                  </div>

                )}


                {!lessonsLoading &&
                  !lessonsError &&
                  courseLessons.length >
                    0 && (

                  <div className="ac-lessons-list">


                    {courseLessons.map(
                      (
                        lesson,
                        index
                      ) => (

                        <div
                          className="ac-lesson-item"
                          key={
                            lesson.id ||
                            index
                          }
                        >


                          <div className="ac-lesson-number">

                            {String(
                              lesson
                                .order_number ||
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}

                          </div>


                          <div>

                            <span>
                              LESSON
                            </span>

                            <strong>

                              {lesson.title ||
                                `Lesson ${
                                  index + 1
                                }`}

                            </strong>


                            {lesson.description && (

                              <p>
                                {
                                  lesson
                                    .description
                                }
                              </p>

                            )}


                          </div>


                        </div>

                      )
                    )}


                  </div>

                )}


              </div>


              <div className="ac-view-footer">


                <button
                  type="button"
                  onClick={
                    closeCourseDetails
                  }
                >

                  Close Course

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
        `ac-overview-item ${className}`
      }
    >

      <div className="ac-overview-icon">

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
   COURSE METRIC
======================================== */

function CourseMetric({
  icon,
  value,
  label,
}) {

  return (

    <div className="ac-metric">

      <div>
        {icon}
      </div>

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
   VIEW DETAIL
======================================== */

function ViewDetail({
  icon,
  label,
  value,
}) {

  return (

    <div className="ac-view-detail">

      <div className="ac-view-detail-icon">

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


export default AdminCourses;