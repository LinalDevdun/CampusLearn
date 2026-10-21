import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import axios from "axios";

import {
  BookOpen,
  Search,
  Plus,
  Users,
  GraduationCap,
  CalendarDays,
  FileText,
  UploadCloud,
  Pencil,
  Eye,
  X,
  Sparkles,
  Layers3,
  LibraryBig,
  SlidersHorizontal,
  ArrowUpRight,
  FolderOpen,
  CircleCheck,
  ChevronRight,
} from "lucide-react";

import "../styles/lecturerCourses.css";


function LecturerCourses() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================
     REAL DATABASE DATA
  ======================================== */

  const [courses, setCourses] =
    useState([]);


  const [summary, setSummary] =
    useState({
      active_courses: 0,
      total_students: 0,
      learning_materials: 0,
    });


  const [loading, setLoading] =
    useState(true);


  const [errorMessage, setErrorMessage] =
    useState("");


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const [searchTerm, setSearchTerm] =
    useState("");


  const [batchFilter, setBatchFilter] =
    useState("All");


  /* ========================================
     CREATE COURSE MODAL
  ======================================== */

  const [createOpen, setCreateOpen] =
    useState(false);


  const [creating, setCreating] =
    useState(false);


  const [newCourse, setNewCourse] =
    useState({
      title: "",
      degree: "",
      batch: "",
      file: null,
    });


  /* ========================================
     OPEN CREATE MODAL FROM TOPBAR
  ======================================== */

  useEffect(() => {

    if (
      location.state?.openCreateCourse
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
     EDIT COURSE MODAL
  ======================================== */

  const [editOpen, setEditOpen] =
    useState(false);


  const [updating, setUpdating] =
    useState(false);


  const [editingCourse, setEditingCourse] =
    useState({
      id: null,
      title: "",
      degree: "",
      batch: "",
      file: null,
    });


  /* ========================================
     COURSE THEMES
  ======================================== */

  const themes = [

    "lecturer-course-blue",
    "lecturer-course-green",
    "lecturer-course-purple",
    "lecturer-course-orange",

  ];


  /* ========================================
     LOAD COURSES
  ======================================== */

  const fetchCourses =
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


        const response =
          await axios.get(
            "http://localhost:5000/lecturer/courses",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const databaseCourses =
          Array.isArray(
            response.data?.courses
          )
            ? response.data.courses
            : [];


        const formattedCourses =
          databaseCourses.map(
            (course, index) => ({

              ...course,

              students:
                Number(
                  course.student_count ||
                  0
                ),

              materials:
                Number(
                  course.material_count ||
                  0
                ),

              lessons:
                Number(
                  course.lesson_count ||
                  0
                ),

              status:
                "Active",

              theme:
                themes[
                  index %
                  themes.length
                ],

            })
          );


        setCourses(
          formattedCourses
        );


        setSummary({

          active_courses:
            Number(
              response.data?.summary
                ?.active_courses ||
              0
            ),

          total_students:
            Number(
              response.data?.summary
                ?.total_students ||
              0
            ),

          learning_materials:
            Number(
              response.data?.summary
                ?.learning_materials ||
              0
            ),

        });


      } catch (error) {

        console.error(
          "Failed to load lecturer courses:",
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
          "Failed to load courses."
        );


      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    fetchCourses();

  }, []);


  /* ========================================
     AVAILABLE BATCHES
  ======================================== */

  const availableBatches =
    useMemo(() => {

      return [

        ...new Set(

          courses
            .map(
              (course) =>
                course.batch
            )
            .filter(Boolean)

        ),

      ].sort();

    }, [courses]);


  /* ========================================
     FILTER COURSES
  ======================================== */

  const filteredCourses =
    useMemo(() => {

      return courses.filter(
        (course) => {

          const search =
            searchTerm
              .trim()
              .toLowerCase();


          const matchesSearch =

            !search ||

            course.title
              ?.toLowerCase()
              .includes(search) ||

            course.degree
              ?.toLowerCase()
              .includes(search);


          const matchesBatch =

            batchFilter === "All" ||

            course.batch ===
              batchFilter;


          return (
            matchesSearch &&
            matchesBatch
          );

        }
      );

    }, [
      courses,
      searchTerm,
      batchFilter,
    ]);


  /* ========================================
     CREATE COURSE
  ======================================== */

  const handleCreateCourse =
    async (event) => {

      event.preventDefault();


      if (
        !newCourse.title ||
        !newCourse.degree ||
        !newCourse.batch ||
        !newCourse.file
      ) {

        alert(
          "Please complete all fields and choose a course material file."
        );

        return;

      }


      try {

        setCreating(true);


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
          newCourse.title.trim()
        );


        formData.append(
          "degree",
          newCourse.degree
        );


        formData.append(
          "batch",
          newCourse.batch
        );


        formData.append(
          "file",
          newCourse.file
        );


        await axios.post(
          "http://localhost:5000/courses",
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


        setNewCourse({
          title: "",
          degree: "",
          batch: "",
          file: null,
        });


        setCreateOpen(false);


        await fetchCourses();


      } catch (error) {

        console.error(
          "Create Course Error:",
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


          alert(
            "Your login session has expired. Please log in again."
          );


          navigate("/login");

          return;

        }


        alert(
          error.response?.data
            ?.error ||
          error.response?.data
            ?.message ||
          "Failed to create course."
        );


      } finally {

        setCreating(false);

      }

    };


  /* ========================================
     OPEN COURSE
  ======================================== */

  const handleOpenCourse =
    (course) => {

      navigate(
        `/lecturer/course/${course.id}`
      );

    };


  /* ========================================
     OPEN COURSE MATERIAL
  ======================================== */

  const handleOpenMaterial =
    (course) => {

      if (!course.file_path) {

        alert(
          "No main course material is available for this course."
        );

        return;

      }


      const cleanPath =
        String(
          course.file_path
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
     OPEN EDIT MODAL
  ======================================== */

  const openEditModal =
    (course) => {

      setEditingCourse({
        id: course.id,
        title: course.title || "",
        degree: course.degree || "",
        batch: course.batch || "",
        file: null,
      });


      setEditOpen(true);

    };


  /* ========================================
     CLOSE EDIT MODAL
  ======================================== */

  const closeEditModal = () => {

    if (updating) {
      return;
    }


    setEditOpen(false);


    setEditingCourse({
      id: null,
      title: "",
      degree: "",
      batch: "",
      file: null,
    });

  };


  /* ========================================
     UPDATE COURSE
  ======================================== */

  const handleUpdateCourse =
    async (event) => {

      event.preventDefault();


      if (
        !editingCourse.id ||
        !editingCourse.title ||
        !editingCourse.degree ||
        !editingCourse.batch
      ) {

        alert(
          "Please complete all required fields."
        );

        return;

      }


      try {

        setUpdating(true);


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
          editingCourse.title.trim()
        );


        formData.append(
          "degree",
          editingCourse.degree
        );


        formData.append(
          "batch",
          editingCourse.batch
        );


        if (editingCourse.file) {

          formData.append(
            "file",
            editingCourse.file
          );

        }


        const response =
          await axios.put(
            `http://localhost:5000/lecturer/courses/${editingCourse.id}`,
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
          "Course updated successfully!"
        );


        setEditOpen(false);


        setEditingCourse({
          id: null,
          title: "",
          degree: "",
          batch: "",
          file: null,
        });


        await fetchCourses();


      } catch (error) {

        console.error(
          "Update Course Error:",
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


          alert(
            "Your login session has expired. Please log in again."
          );


          navigate("/login");

          return;

        }


        alert(
          error.response?.data
            ?.error ||
          error.response?.data
            ?.message ||
          "Failed to update course."
        );


      } finally {

        setUpdating(false);

      }

    };


  /* ========================================
     CLOSE CREATE MODAL
  ======================================== */

  const closeCreateModal = () => {

    if (creating) {
      return;
    }


    setCreateOpen(false);


    setNewCourse({
      title: "",
      degree: "",
      batch: "",
      file: null,
    });

  };


  /* ========================================
     UI
  ======================================== */

  return (

    <div className="lecturer-courses-page">


      {/* ====================================
          COURSE STUDIO HERO
      ==================================== */}

      <section className="lc-studio-hero">


        {/* LEFT */}

        <div className="lc-studio-intro">

          <div className="lc-studio-label">

            <Sparkles size={13} />

            COURSE STUDIO

          </div>


          <h1>

            Build your
            <br />

            <span>
              teaching space.
            </span>

          </h1>


          <p>

            Organize modules, learning
            resources and student groups
            from one structured workspace.

          </p>


          <button
            type="button"
            className="lc-studio-create"
            onClick={() =>
              setCreateOpen(true)
            }
          >

            <Plus size={16} />

            Create New Course

            <ArrowUpRight size={15} />

          </button>


          <div className="lc-studio-decoration lc-decoration-one" />

          <div className="lc-studio-decoration lc-decoration-two" />

        </div>


        {/* RIGHT */}

        <div className="lc-portfolio-panel">


          <div className="lc-portfolio-heading">

            <div className="lc-portfolio-icon">

              <LibraryBig size={22} />

            </div>


            <div>

              <span>
                TEACHING PORTFOLIO
              </span>

              <h2>
                Your Course Library
              </h2>

            </div>

          </div>


          <div className="lc-portfolio-metrics">


            <div className="lc-portfolio-metric">

              <div className="lc-metric-icon lc-metric-blue">

                <BookOpen size={18} />

              </div>


              <strong>

                {loading
                  ? "..."
                  : summary.active_courses}

              </strong>


              <span>
                Active Modules
              </span>

            </div>


            <div className="lc-portfolio-metric">

              <div className="lc-metric-icon lc-metric-purple">

                <Users size={18} />

              </div>


              <strong>

                {loading
                  ? "..."
                  : summary.total_students}

              </strong>


              <span>
                Students
              </span>

            </div>


            <div className="lc-portfolio-metric">

              <div className="lc-metric-icon lc-metric-green">

                <FileText size={18} />

              </div>


              <strong>

                {loading
                  ? "..."
                  : summary.learning_materials}

              </strong>


              <span>
                Resources
              </span>

            </div>

          </div>


          <div className="lc-portfolio-footer">

            <CircleCheck size={15} />

            <div>

              <strong>
                Teaching library ready
              </strong>

              <span>

                Manage course content and
                classroom resources below.

              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {errorMessage && (

        <div className="lc-error-message">

          {errorMessage}

        </div>

      )}


      {/* ====================================
          COURSE FINDER
      ==================================== */}

      <section className="lecturer-courses-toolbar">


        <div className="lc-finder-label">

          <div>

            <SlidersHorizontal
              size={18}
            />

          </div>


          <span>

            <strong>
              Course Finder
            </strong>

            Search your teaching library

          </span>

        </div>


        <div className="lecturer-course-search">

          <Search size={17} />


          <input
            type="text"
            placeholder="Search by course or degree..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          className="lecturer-course-filter"
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


          {availableBatches.map(
            (batch) => (

              <option
                value={batch}
                key={batch}
              >

                Batch {batch}

              </option>

            )
          )}

        </select>

      </section>


      {/* ====================================
          COLLECTION HEADER
      ==================================== */}

      <section className="lc-collection-heading">


        <div>

          <span className="lc-section-kicker">

            <FolderOpen size={13} />

            YOUR MODULES

          </span>


          <h2>
            Course Collection
          </h2>


          <p>

            Open a module to manage its
            content, students and resources.

          </p>

        </div>


        <div className="lc-results-count">

          {filteredCourses.length}

          <span>

            {filteredCourses.length === 1
              ? "result"
              : "results"}

          </span>

        </div>

      </section>


      {/* ====================================
          LOADING
      ==================================== */}

      {loading && (

        <div className="lc-loading-state">

          <div className="lc-loading-icon">

            <BookOpen size={22} />

          </div>

          <strong>
            Loading your courses...
          </strong>

          <span>
            Preparing your teaching library
          </span>

        </div>

      )}


      {/* ====================================
          EMPTY
      ==================================== */}

      {!loading &&
        filteredCourses.length === 0 && (

        <div className="lc-empty-state">

          <div className="lc-empty-icon">

            <BookOpen size={27} />

          </div>


          <h3>
            No courses found
          </h3>


          <p>

            Try another search term or
            select a different batch.

          </p>

        </div>

      )}


      {/* ====================================
          COURSE COLLECTION
      ==================================== */}

      {!loading && (

        <section className="lecturer-course-grid">

          {filteredCourses.map(
            (course, index) => (

              <article
                className="lecturer-management-course"
                key={course.id}
              >


                {/* TOP STRIPE */}

                <div
                  className={
                    `lecturer-management-cover ${course.theme}`
                  }
                >

                  <div className="lc-course-number">

                    MODULE{" "}

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>


                  <div className="lecturer-management-icon">

                    <BookOpen size={23} />

                  </div>


                  <div className="lc-cover-status">

                    <CircleCheck size={11} />

                    {course.status}

                  </div>

                </div>


                {/* BODY */}

                <div className="lecturer-management-body">


                  <div className="lc-course-program">

                    <GraduationCap
                      size={12}
                    />

                    {course.degree}

                  </div>


                  <h3>
                    {course.title}
                  </h3>


                  <p className="lc-course-description">

                    Teaching module for{" "}

                    {course.degree}

                    {course.batch &&
                      `, Batch ${course.batch}`}

                    .

                  </p>


                  {/* SNAPSHOT */}

                  <div className="lecturer-management-meta">


                    <div>

                      <Users size={15} />

                      <strong>
                        {course.students}
                      </strong>

                      <span>
                        Students
                      </span>

                    </div>


                    <div>

                      <FileText size={15} />

                      <strong>
                        {course.materials}
                      </strong>

                      <span>
                        Materials
                      </span>

                    </div>


                    <div>

                      <CalendarDays
                        size={15}
                      />

                      <strong>
                        {course.batch || "—"}
                      </strong>

                      <span>
                        Batch
                      </span>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="lecturer-course-actions">


                    <button
                      className="lecturer-course-open"
                      type="button"
                      onClick={() =>
                        handleOpenCourse(
                          course
                        )
                      }
                    >

                      Open Course

                      <ChevronRight
                        size={14}
                      />

                    </button>


                    <button
                      className="lecturer-course-secondary"
                      type="button"
                      title="Open course material"
                      onClick={() =>
                        handleOpenMaterial(
                          course
                        )
                      }
                    >

                      <UploadCloud
                        size={15}
                      />

                    </button>


                    <button
                      className="lecturer-course-secondary"
                      type="button"
                      title="Edit course"
                      onClick={() =>
                        openEditModal(
                          course
                        )
                      }
                    >

                      <Pencil
                        size={15}
                      />

                    </button>

                  </div>


                  {/* QUICK OPEN */}

                  <button
                    type="button"
                    className="lc-card-open-overlay"
                    onClick={() =>
                      handleOpenCourse(
                        course
                      )
                    }
                    aria-label={
                      `Open ${course.title}`
                    }
                  >

                    <Eye size={13} />

                    View Module

                  </button>

                </div>

              </article>

            )
          )}

        </section>

      )}


      {/* ====================================
          CREATE COURSE MODAL
      ==================================== */}

      {createOpen && (

        <div className="lecturer-modal-overlay">

          <div className="lecturer-course-modal">


            <div className="lecturer-modal-header">


              <div className="lecturer-modal-title-area">

                <div className="lecturer-modal-title-icon">

                  <Layers3 size={21} />

                </div>


                <div>

                  <span>
                    COURSE STUDIO
                  </span>

                  <h2>
                    Create New Course
                  </h2>

                  <p>

                    Add a new teaching module
                    and its first learning
                    resource.

                  </p>

                </div>

              </div>


              <button
                className="lecturer-modal-close"
                type="button"
                onClick={
                  closeCreateModal
                }
                disabled={
                  creating
                }
              >

                <X size={18} />

              </button>

            </div>


            <form
              className="lecturer-course-form"
              onSubmit={
                handleCreateCourse
              }
            >


              <div className="lecturer-form-group">

                <label>
                  Course Title
                </label>


                <input
                  type="text"
                  placeholder="Example: Cloud Computing"
                  value={
                    newCourse.title
                  }
                  onChange={(event) =>
                    setNewCourse({
                      ...newCourse,
                      title:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>


              <div className="lecturer-form-row">


                <div className="lecturer-form-group">

                  <label>
                    Degree
                  </label>


                  <select
                    value={
                      newCourse.degree
                    }
                    onChange={(event) =>
                      setNewCourse({
                        ...newCourse,
                        degree:
                          event.target.value,
                      })
                    }
                    required
                  >

                <option value="">
                  Select degree
                </option>

                <option value="BSc (Hons) Software Engineering">
                  BSc (Hons) Software Engineering
                </option>

                <option value="BSc (Hons) Computer Science">
                  BSc (Hons) Computer Science
                </option>

                <option value="BSc (Hons) Data Science">
                  BSc (Hons) Data Science
                </option>

                <option value="BSc (Hons) Computer Security">
                  BSc (Hons) Computer Security
                </option>

                <option value="BSc (Hons) Computer Networks">
                  BSc (Hons) Computer Networks
                </option>

                <option value="BSc (Hons) Artificial Intelligence">
                  BSc (Hons) Artificial Intelligence
                </option>

                <option value="BSc (Hons) Technology Management">
                  BSc (Hons) Technology Management
                </option>

                  </select>

                </div>


                <div className="lecturer-form-group">

                  <label>
                    Batch
                  </label>


                  <select
                    value={
                      newCourse.batch
                    }
                    onChange={(event) =>
                      setNewCourse({
                        ...newCourse,
                        batch:
                          event.target.value,
                      })
                    }
                    required
                  >

                    <option value="">
                      Select batch
                    </option>

                    <option value="24.1">
                      24.1
                    </option>

                    <option value="24.2">
                      24.2
                    </option>

                    <option value="25.1">
                      25.1
                    </option>

                    <option value="25.2">
                      25.2
                    </option>

                    <option value="26.1">
                      26.1
                    </option>

                    <option value="26.2">
                      26.2
                    </option>

                  </select>

                </div>

              </div>


              <div className="lecturer-form-group">

                <label>
                  Course Material
                </label>


                <input
                  type="file"
                  onChange={(event) =>
                    setNewCourse({
                      ...newCourse,

                      file:
                        event.target
                          .files?.[0] ||
                        null,
                    })
                  }
                  required
                />


                <small className="lecturer-form-help">

                  Upload the main course
                  material such as a PDF,
                  PowerPoint or document.

                </small>

              </div>


              <div className="lecturer-modal-actions">

                <button
                  type="button"
                  className="lecturer-cancel-button"
                  onClick={
                    closeCreateModal
                  }
                  disabled={
                    creating
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="lecturer-primary-button"
                  disabled={
                    creating
                  }
                >

                  <Plus size={15} />

                  {creating
                    ? "Creating..."
                    : "Create Course"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ====================================
          EDIT COURSE MODAL
      ==================================== */}

      {editOpen && (

        <div className="lecturer-modal-overlay">

          <div className="lecturer-course-modal">


            <div className="lecturer-modal-header">


              <div className="lecturer-modal-title-area">

                <div className="lecturer-modal-title-icon">

                  <Pencil size={20} />

                </div>


                <div>

                  <span>
                    MODULE SETTINGS
                  </span>

                  <h2>
                    Edit Course
                  </h2>

                  <p>

                    Update course information
                    or replace its learning
                    material.

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
                handleUpdateCourse
              }
            >


              <div className="lecturer-form-group">

                <label>
                  Course Title
                </label>


                <input
                  type="text"
                  value={
                    editingCourse.title
                  }
                  onChange={(event) =>
                    setEditingCourse({
                      ...editingCourse,

                      title:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>


              <div className="lecturer-form-row">


                <div className="lecturer-form-group">

                  <label>
                    Degree
                  </label>


                  <select
                    value={
                      editingCourse.degree
                    }
                    onChange={(event) =>
                      setEditingCourse({
                        ...editingCourse,

                        degree:
                          event.target.value,
                      })
                    }
                    required
                  >

                  <option value="">
                    Select degree
                  </option>

                  <option value="BSc (Hons) Software Engineering">
                    BSc (Hons) Software Engineering
                  </option>

                  <option value="BSc (Hons) Computer Science">
                    BSc (Hons) Computer Science
                  </option>

                  <option value="BSc (Hons) Data Science">
                    BSc (Hons) Data Science
                  </option>

                  <option value="BSc (Hons) Computer Security">
                    BSc (Hons) Computer Security
                  </option>

                  <option value="BSc (Hons) Computer Networks">
                    BSc (Hons) Computer Networks
                  </option>

                  <option value="BSc (Hons) Artificial Intelligence">
                    BSc (Hons) Artificial Intelligence
                  </option>

                  <option value="BSc (Hons) Technology Management">
                    BSc (Hons) Technology Management
                  </option>

                  </select>

                </div>


                <div className="lecturer-form-group">

                  <label>
                    Batch
                  </label>


                  <select
                    value={
                      editingCourse.batch
                    }
                    onChange={(event) =>
                      setEditingCourse({
                        ...editingCourse,

                        batch:
                          event.target.value,
                      })
                    }
                    required
                  >

                    <option value="">
                      Select batch
                    </option>

                    <option value="24.1">
                      24.1
                    </option>

                    <option value="24.2">
                      24.2
                    </option>

                    <option value="25.1">
                      25.1
                    </option>

                    <option value="25.2">
                      25.2
                    </option>

                    <option value="26.1">
                      26.1
                    </option>

                    <option value="26.2">
                      26.2
                    </option>

                  </select>

                </div>

              </div>


              <div className="lecturer-form-group">

                <label>
                  Replace Course Material
                </label>


                <input
                  type="file"
                  onChange={(event) =>
                    setEditingCourse({
                      ...editingCourse,

                      file:
                        event.target
                          .files?.[0] ||
                        null,
                    })
                  }
                />


                <small className="lecturer-form-help">

                  Optional — leave this
                  empty to keep the existing
                  course material.

                </small>

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

    </div>

  );

}


export default LecturerCourses;