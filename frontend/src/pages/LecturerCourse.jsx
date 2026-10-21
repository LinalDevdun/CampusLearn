import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Layers3,
  ExternalLink,
  Users,
  CircleCheckBig,
  ClipboardList,
  Plus,
  X,
  UploadCloud,
  Pencil,
  Trash2,
} from "lucide-react";

import "../styles/courseDetails.css";

import API_BASE_URL from "../config/api";


function LecturerCourse() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();


  /* ========================================
     COURSE DATA
  ======================================== */

  const [course, setCourse] =
    useState(null);

  const [lessons, setLessons] =
    useState([]);

  const [studentCount, setStudentCount] =
    useState(0);

  const [materialCount, setMaterialCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================
     ADD LESSON
  ======================================== */

  const [
    addLessonOpen,
    setAddLessonOpen,
  ] = useState(false);

  const [
    addingLesson,
    setAddingLesson,
  ] = useState(false);

  const [
    lessonError,
    setLessonError,
  ] = useState("");

  const [
    lessonFile,
    setLessonFile,
  ] = useState(null);

  const [
    newLesson,
    setNewLesson,
  ] = useState({
    title: "",
    content: "",
    orderNumber: "",
  });


  /* ========================================
     EDIT LESSON
  ======================================== */

  const [
    editLessonOpen,
    setEditLessonOpen,
  ] = useState(false);

  const [
    editingLesson,
    setEditingLesson,
  ] = useState(null);

  const [
    editLessonFile,
    setEditLessonFile,
  ] = useState(null);

  const [
    updatingLesson,
    setUpdatingLesson,
  ] = useState(false);

  const [
    editLessonError,
    setEditLessonError,
  ] = useState("");

  const [
    editLesson,
    setEditLesson,
  ] = useState({
    title: "",
    content: "",
    orderNumber: "",
  });


  /* ========================================
     DELETE LESSON
  ======================================== */

  const [
    deleteLessonOpen,
    setDeleteLessonOpen,
  ] = useState(false);

  const [
    lessonToDelete,
    setLessonToDelete,
  ] = useState(null);

  const [
    deletingLesson,
    setDeletingLesson,
  ] = useState(false);


  /* ========================================
     FETCH COURSE DATA
  ======================================== */

  const fetchCourseData =
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


          const headers = {
            Authorization:
              `Bearer ${token}`,
          };


          const [
            courseResponse,
            lessonsResponse,
            lecturerCoursesResponse,
          ] =
            await Promise.all([

              axios.get(
                `${API_BASE_URL}/courses/${id}`,
                {
                  headers,
                }
              ),

              axios.get(
                `${API_BASE_URL}/courses/${id}/lessons`,
                {
                  headers,
                }
              ),

              axios.get(
                `${API_BASE_URL}/lecturer/courses`,
                {
                  headers,
                }
              ),

            ]);


          const lecturerCourses =
            Array.isArray(
              lecturerCoursesResponse
                .data?.courses
            )
              ? lecturerCoursesResponse
                  .data.courses
              : [];


          const lecturerCourse =
            lecturerCourses.find(
              (item) =>
                String(item.id) ===
                String(id)
            );


          if (!lecturerCourse) {

            setError(
              "This course is not assigned to your lecturer account."
            );

            setCourse(null);

            return;
          }


          setCourse(
            courseResponse.data
          );


          setLessons(
            Array.isArray(
              lessonsResponse.data
            )
              ? lessonsResponse.data
              : []
          );


          setStudentCount(
            Number(
              lecturerCourse
                .student_count ||
                0
            )
          );


          setMaterialCount(
            Number(
              lecturerCourse
                .material_count ||
                0
            )
          );


        } catch (error) {

          console.error(
            "Lecturer course error:",
            error
          );


          if (
            error.response?.status ===
            401
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
              "We couldn't load this course right now."
          );


        } finally {

          setLoading(false);
        }

      },

      [
        id,
        navigate,
      ]

    );


  useEffect(() => {

    fetchCourseData();

  }, [fetchCourseData]);


  /* ========================================
     MATERIAL URL
  ======================================== */

  const getMaterialUrl =
    (filePath) => {

      if (!filePath) {

        return null;
      }


      const cleanPath =
        String(filePath)
          .replace(
            /\\/g,
            "/"
          )
          .replace(
            /^.*?uploads\//,
            "uploads/"
          );


      return (
        `${API_BASE_URL}/${cleanPath}`
      );
    };


  const materialUrl =
    getMaterialUrl(
      course?.file_path
    );


  /* ========================================
     OPEN LESSON MATERIAL
  ======================================== */

  const openLessonMaterial =
    (lesson) => {

      const url =
        getMaterialUrl(
          lesson.file_path
        );


      if (!url) {

        alert(
          "No learning material is attached to this lesson."
        );

        return;
      }


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };


  /* ========================================
     CLOSE ADD LESSON MODAL
  ======================================== */

  const closeAddLessonModal =
    () => {

      if (addingLesson) {

        return;
      }


      setAddLessonOpen(
        false
      );

      setLessonError("");

      setLessonFile(null);

      setNewLesson({
        title: "",
        content: "",
        orderNumber: "",
      });
    };


  /* ========================================
     ADD LESSON
  ======================================== */

  const handleAddLesson =
    async (event) => {

      event.preventDefault();

      setLessonError("");


      if (
        !newLesson.title.trim()
      ) {

        setLessonError(
          "Please enter a lesson title."
        );

        return;
      }


      if (!lessonFile) {

        setLessonError(
          "Please select a learning material file."
        );

        return;
      }


      try {

        setAddingLesson(true);


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
          newLesson.title.trim()
        );


        formData.append(
          "content",
          newLesson.content.trim()
        );


        if (
          newLesson.orderNumber
        ) {

          formData.append(
            "orderNumber",
            newLesson.orderNumber
          );
        }


        formData.append(
          "file",
          lessonFile
        );


        const response =
          await axios.post(
            `${API_BASE_URL}/lecturer/courses/${id}/lessons`,
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
          "Lesson added successfully!"
        );


        setAddLessonOpen(
          false
        );

        setLessonError("");

        setLessonFile(null);

        setNewLesson({
          title: "",
          content: "",
          orderNumber: "",
        });


        await fetchCourseData();


      } catch (error) {

        console.error(
          "Add lesson error:",
          error
        );


        if (
          error.response?.status ===
          401
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


        setLessonError(
          error.response?.data
            ?.error ||
          "Failed to add lesson."
        );


      } finally {

        setAddingLesson(false);
      }
    };


  /* ========================================
     OPEN EDIT LESSON MODAL
  ======================================== */

  const openEditLessonModal =
    (lesson) => {

      setEditingLesson(
        lesson
      );


      setEditLesson({
        title:
          lesson.title || "",

        content:
          lesson.content || "",

        orderNumber:
          lesson.order_number ??
          "",
      });


      setEditLessonFile(
        null
      );

      setEditLessonError(
        ""
      );

      setEditLessonOpen(
        true
      );
    };


  /* ========================================
     CLOSE EDIT LESSON MODAL
  ======================================== */

  const closeEditLessonModal =
    () => {

      if (updatingLesson) {

        return;
      }


      setEditLessonOpen(
        false
      );

      setEditingLesson(
        null
      );

      setEditLessonFile(
        null
      );

      setEditLessonError(
        ""
      );

      setEditLesson({
        title: "",
        content: "",
        orderNumber: "",
      });
    };


  /* ========================================
     UPDATE LESSON
  ======================================== */

  const handleUpdateLesson =
    async (event) => {

      event.preventDefault();


      if (!editingLesson) {

        return;
      }


      setEditLessonError(
        ""
      );


      if (
        !editLesson.title.trim()
      ) {

        setEditLessonError(
          "Please enter a lesson title."
        );

        return;
      }


      try {

        setUpdatingLesson(
          true
        );


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
          editLesson.title.trim()
        );


        formData.append(
          "content",
          editLesson.content.trim()
        );


        if (
          editLesson.orderNumber !==
          ""
        ) {

          formData.append(
            "orderNumber",
            editLesson.orderNumber
          );
        }


        /*
          Selecting a new material
          is optional.

          If no new file is selected,
          the backend keeps the old one.
        */

        if (editLessonFile) {

          formData.append(
            "file",
            editLessonFile
          );
        }


        const response =
          await axios.put(
            `${API_BASE_URL}/lecturer/courses/${id}/lessons/${editingLesson.id}`,
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
          "Lesson updated successfully!"
        );


        setEditLessonOpen(
          false
        );

        setEditingLesson(
          null
        );

        setEditLessonFile(
          null
        );

        setEditLessonError(
          ""
        );


        await fetchCourseData();


      } catch (error) {

        console.error(
          "Update lesson error:",
          error
        );


        if (
          error.response?.status ===
          401
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


        setEditLessonError(
          error.response?.data
            ?.error ||
          "Failed to update lesson."
        );


      } finally {

        setUpdatingLesson(
          false
        );
      }
    };


  /* ========================================
     OPEN DELETE LESSON MODAL
  ======================================== */

  const openDeleteLessonModal =
    (lesson) => {

      setLessonToDelete(
        lesson
      );

      setDeleteLessonOpen(
        true
      );
    };


  /* ========================================
     CLOSE DELETE LESSON MODAL
  ======================================== */

  const closeDeleteLessonModal =
    () => {

      if (deletingLesson) {

        return;
      }


      setDeleteLessonOpen(
        false
      );

      setLessonToDelete(
        null
      );
    };


  /* ========================================
     DELETE LESSON
  ======================================== */

  const handleDeleteLesson =
    async () => {

      if (!lessonToDelete) {

        return;
      }


      try {

        setDeletingLesson(
          true
        );


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
            `${API_BASE_URL}/lecturer/courses/${id}/lessons/${lessonToDelete.id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        alert(
          response.data?.message ||
          "Lesson deleted successfully!"
        );


        setDeleteLessonOpen(
          false
        );

        setLessonToDelete(
          null
        );


        await fetchCourseData();


      } catch (error) {

        console.error(
          "Delete lesson error:",
          error
        );


        if (
          error.response?.status ===
          401
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


        alert(
          error.response?.data
            ?.error ||
          "Failed to delete lesson."
        );


      } finally {

        setDeletingLesson(
          false
        );
      }
    };


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="course-details-page">

        <div className="course-page-state">

          <div className="course-state-card">

            <div className="course-state-icon">

              <BookOpen size={27} />

            </div>

            <h3>
              Loading course
            </h3>

            <p>
              Please wait while we load
              your teaching module.
            </p>

          </div>

        </div>

      </div>

    );
  }


  /* ========================================
     ERROR
  ======================================== */

  if (
    error ||
    !course
  ) {

    return (

      <div className="course-details-page">

        <button
          className="course-back-button"
          onClick={() =>
            navigate(
              "/lecturer/courses"
            )
          }
        >

          <ArrowLeft size={15} />

          Back to My Courses

        </button>


        <div className="course-page-state">

          <div className="course-state-card">

            <div className="course-state-icon">

              <BookOpen size={27} />

            </div>

            <h3>
              Course unavailable
            </h3>

            <p>
              {error ||
                "This course could not be found."}
            </p>

          </div>

        </div>

      </div>

    );
  }


  return (

    <div className="course-details-page">


      {/* ====================================
          BACK
      ==================================== */}

      <button
        className="course-back-button"
        onClick={() =>
          navigate(
            "/lecturer/courses"
          )
        }
      >

        <ArrowLeft size={15} />

        Back to My Courses

      </button>


      {/* ====================================
          HERO
      ==================================== */}

      <section className="course-details-hero">


        <div className="course-hero-content">


          <div className="course-hero-label">

            <BookOpen size={13} />

            Teaching Course

          </div>


          <h1>
            {course.title}
          </h1>


          <p className="course-hero-description">

            Manage your course resources,
            lessons and student learning
            content from one place.

          </p>


          <div className="course-hero-meta">


            {course.degree && (

              <span className="course-hero-badge">

                <GraduationCap
                  size={13}
                />

                {course.degree}

              </span>

            )}


            {course.batch && (

              <span className="course-hero-badge">

                <CalendarDays
                  size={13}
                />

                Batch {course.batch}

              </span>

            )}


            <span className="course-hero-badge">

              <Layers3 size={13} />

              {lessons.length}{" "}

              {lessons.length === 1
                ? "Lesson"
                : "Lessons"}

            </span>


            <span className="course-hero-badge">

              <Users size={13} />

              {studentCount}{" "}

              {studentCount === 1
                ? "Student"
                : "Students"}

            </span>


          </div>


        </div>


        <div className="course-hero-icon">

          <GraduationCap
            size={46}
          />

        </div>


      </section>


      {/* ====================================
          QUICK INFORMATION
      ==================================== */}

      <section className="course-information-grid">


        <div className="course-info-card course-info-purple">

          <div className="course-info-icon">

            <Layers3 size={21} />

          </div>

          <div>

            <strong>
              {lessons.length}
            </strong>

            <span>
              Course Lessons
            </span>

          </div>

        </div>


        <div className="course-info-card course-info-blue">

          <div className="course-info-icon">

            <Users size={21} />

          </div>

          <div>

            <strong>
              {studentCount}
            </strong>

            <span>
              Enrolled Students
            </span>

          </div>

        </div>


        <div className="course-info-card course-info-green">

          <div className="course-info-icon">

            <FileText size={21} />

          </div>

          <div>

            <strong>
              {materialCount}
            </strong>

            <span>
              Learning Materials
            </span>

          </div>

        </div>


      </section>


      {/* ====================================
          MAIN CONTENT
      ==================================== */}

      <section className="course-content-grid">


        {/* ==================================
            LESSONS
        ================================== */}

        <div className="course-panel">


          <div className="course-panel-header">


            <div>

              <h2>
                Course Lessons
              </h2>

              <p>
                Review and manage the learning
                content currently available
                to your students.
              </p>

            </div>


            <button
              type="button"
              className="lecturer-add-lesson-button"
              onClick={() => {

                setLessonError("");

                setAddLessonOpen(
                  true
                );
              }}
            >

              <Plus size={15} />

              Add Lesson

            </button>


          </div>


          {lessons.length === 0 ? (

            <div className="course-empty-lessons">


              <div className="course-empty-icon">

                <BookOpen size={25} />

              </div>


              <h3>
                No lessons yet
              </h3>


              <p>
                Add the first lesson and
                learning material for this
                course.
              </p>


              <button
                type="button"
                className="lecturer-empty-add-button"
                onClick={() =>
                  setAddLessonOpen(
                    true
                  )
                }
              >

                <Plus size={15} />

                Add First Lesson

              </button>


            </div>

          ) : (

            <div className="course-lessons-list">


              {lessons.map(
                (
                  lesson,
                  index
                ) => {

                  return (

                    <article
                      className="course-lesson-card"
                      key={lesson.id}
                    >


                      <div className="lesson-card-top">


                        <div className="lesson-number">

                          {String(
                            lesson.order_number ??
                              index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </div>


                        <div className="lesson-details">

                          <h3>
                            {lesson.title}
                          </h3>

                          <p>
                            {lesson.content ||
                              "No lesson description has been added."}
                          </p>

                        </div>


                      </div>


                      <div className="lecturer-lesson-footer">


                        <span className="lecturer-lesson-material-status">

                          <FileText
                            size={13}
                          />

                          {lesson.file_path
                            ? "Learning material attached"
                            : "No material attached"}

                        </span>


                        <div className="lecturer-lesson-actions">


                          {lesson.file_path && (

                            <button
                              type="button"
                              className="lecturer-lesson-open-button"
                              onClick={() =>
                                openLessonMaterial(
                                  lesson
                                )
                              }
                            >

                              <ExternalLink
                                size={14}
                              />

                              Open Material

                            </button>

                          )}


                          <button
                            type="button"
                            className="lecturer-lesson-edit-button"
                            onClick={() =>
                              openEditLessonModal(
                                lesson
                              )
                            }
                          >

                            <Pencil
                              size={14}
                            />

                            Edit

                          </button>


                          <button
                            type="button"
                            className="lecturer-lesson-delete-button"
                            onClick={() =>
                              openDeleteLessonModal(
                                lesson
                              )
                            }
                          >

                            <Trash2
                              size={14}
                            />

                            Delete

                          </button>


                        </div>


                      </div>


                    </article>

                  );
                }
              )}


            </div>

          )}


        </div>


        {/* ==================================
            RIGHT COLUMN
        ================================== */}

        <aside className="course-side-column">


          {/* COURSE MATERIAL */}

          <div className="course-material-card">


            <div className="material-icon">

              <FileText size={23} />

            </div>


            <h3>
              Main Course Material
            </h3>


            <p>
              Open the main learning
              material currently uploaded
              for this course.
            </p>


            {materialUrl ? (

              <a
                href={materialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration:
                    "none",
                }}
              >

                <button
                  className="course-material-button"
                  type="button"
                >

                  <ExternalLink
                    size={14}
                  />

                  Open Course Material

                </button>

              </a>

            ) : (

              <div className="material-unavailable">

                No course material
                available yet.

              </div>

            )}


          </div>


          {/* TEACHING TOOLS */}

          <div className="course-ai-card">


            <div className="course-ai-card-icon">

              <ClipboardList
                size={22}
              />

            </div>


            <h3>
              Teaching Tools
            </h3>


            <p>
              Manage coursework,
              submissions and grading
              for your students.
            </p>


            <button
              className="course-ai-button"
              type="button"
              onClick={() =>
                navigate(
                  "/lecturer/assignments"
                )
              }
            >

              <CircleCheckBig
                size={14}
              />

              Manage Assignments

            </button>


          </div>


        </aside>


      </section>


      {/* ====================================
          ADD LESSON MODAL
      ==================================== */}

      {addLessonOpen && (

        <div className="lesson-modal-overlay">


          <div className="lesson-modal">


            {/* HEADER */}

            <div className="lesson-modal-header">


              <div className="lesson-modal-title-area">


                <div className="lesson-modal-icon">

                  <UploadCloud
                    size={21}
                  />

                </div>


                <div>

                  <span>
                    COURSE CONTENT
                  </span>

                  <h2>
                    Add New Lesson
                  </h2>

                  <p>
                    Upload learning material
                    for {course.title}.
                  </p>

                </div>


              </div>


              <button
                type="button"
                className="lesson-modal-close"
                onClick={
                  closeAddLessonModal
                }
                disabled={
                  addingLesson
                }
              >

                <X size={18} />

              </button>


            </div>


            {/* FORM */}

            <form
              className="lesson-form"
              onSubmit={
                handleAddLesson
              }
            >


              {lessonError && (

                <div className="lesson-form-error">

                  {lessonError}

                </div>

              )}


              {/* COURSE TARGET */}

              <div className="lesson-target-box">

                <GraduationCap
                  size={17}
                />

                <div>

                  <strong>
                    {course.degree}
                  </strong>

                  <span>
                    Batch {course.batch}
                  </span>

                </div>

              </div>


              {/* TITLE */}

              <div className="lesson-form-group">

                <label>
                  Lesson Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Week 01 - Introduction to Cloud"
                  value={
                    newLesson.title
                  }
                  onChange={(event) =>
                    setNewLesson({
                      ...newLesson,

                      title:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="lesson-form-group">

                <label>
                  Description
                </label>

                <textarea
                  rows="4"
                  placeholder="Briefly describe what students will learn in this lesson..."
                  value={
                    newLesson.content
                  }
                  onChange={(event) =>
                    setNewLesson({
                      ...newLesson,

                      content:
                        event.target.value,
                    })
                  }
                />

              </div>


              {/* ORDER */}

              <div className="lesson-form-group">

                <label>
                  Lesson Order
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Optional - automatically selects the next number"
                  value={
                    newLesson.orderNumber
                  }
                  onChange={(event) =>
                    setNewLesson({
                      ...newLesson,

                      orderNumber:
                        event.target.value,
                    })
                  }
                />

                <small>
                  Leave this empty if you
                  want CampusLearn to place
                  the lesson after the
                  existing lessons.
                </small>

              </div>


              {/* FILE */}

              <div className="lesson-upload-box">


                <UploadCloud
                  size={24}
                />


                <div>

                  <strong>
                    Learning Material
                  </strong>

                  <span>
                    Upload a PDF, PowerPoint,
                    Word document or text file.
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                    onChange={(event) =>
                      setLessonFile(
                        event.target
                          .files?.[0] ||
                        null
                      )
                    }
                    required
                  />

                </div>


              </div>


              {/* ACTIONS */}

              <div className="lesson-modal-actions">


                <button
                  type="button"
                  className="lesson-cancel-button"
                  onClick={
                    closeAddLessonModal
                  }
                  disabled={
                    addingLesson
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="lesson-save-button"
                  disabled={
                    addingLesson
                  }
                >

                  <Plus size={15} />

                  {addingLesson
                    ? "Adding Lesson..."
                    : "Add Lesson"}

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


      {/* ====================================
          EDIT LESSON MODAL
      ==================================== */}

      {editLessonOpen &&
        editingLesson && (

        <div className="lesson-modal-overlay">


          <div className="lesson-modal">


            {/* HEADER */}

            <div className="lesson-modal-header">


              <div className="lesson-modal-title-area">


                <div className="lesson-modal-icon">

                  <Pencil
                    size={20}
                  />

                </div>


                <div>

                  <span>
                    COURSE CONTENT
                  </span>

                  <h2>
                    Edit Lesson
                  </h2>

                  <p>
                    Update lesson information
                    or replace its learning
                    material.
                  </p>

                </div>


              </div>


              <button
                type="button"
                className="lesson-modal-close"
                onClick={
                  closeEditLessonModal
                }
                disabled={
                  updatingLesson
                }
              >

                <X size={18} />

              </button>


            </div>


            {/* FORM */}

            <form
              className="lesson-form"
              onSubmit={
                handleUpdateLesson
              }
            >


              {editLessonError && (

                <div className="lesson-form-error">

                  {editLessonError}

                </div>

              )}


              {/* COURSE TARGET */}

              <div className="lesson-target-box">

                <GraduationCap
                  size={17}
                />

                <div>

                  <strong>
                    {course.degree}
                  </strong>

                  <span>
                    Batch {course.batch}
                  </span>

                </div>

              </div>


              {/* TITLE */}

              <div className="lesson-form-group">

                <label>
                  Lesson Title
                </label>

                <input
                  type="text"
                  value={
                    editLesson.title
                  }
                  onChange={(event) =>
                    setEditLesson({
                      ...editLesson,

                      title:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="lesson-form-group">

                <label>
                  Description
                </label>

                <textarea
                  rows="4"
                  value={
                    editLesson.content
                  }
                  onChange={(event) =>
                    setEditLesson({
                      ...editLesson,

                      content:
                        event.target.value,
                    })
                  }
                />

              </div>


              {/* ORDER */}

              <div className="lesson-form-group">

                <label>
                  Lesson Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    editLesson.orderNumber
                  }
                  onChange={(event) =>
                    setEditLesson({
                      ...editLesson,

                      orderNumber:
                        event.target.value,
                    })
                  }
                />

              </div>


              {/* CURRENT MATERIAL */}

              {editingLesson.file_path && (

                <div className="lesson-current-material">

                  <FileText
                    size={17}
                  />

                  <div>

                    <strong>
                      Current Material
                    </strong>

                    <span>
                      The existing file will
                      remain unless you select
                      a replacement below.
                    </span>

                  </div>

                </div>

              )}


              {/* OPTIONAL REPLACEMENT */}

              <div className="lesson-upload-box">


                <UploadCloud
                  size={24}
                />


                <div>

                  <strong>
                    Replace Learning Material
                  </strong>

                  <span>
                    Optional — leave empty to
                    keep the current material.
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                    onChange={(event) =>
                      setEditLessonFile(
                        event.target
                          .files?.[0] ||
                        null
                      )
                    }
                  />

                </div>


              </div>


              {/* ACTIONS */}

              <div className="lesson-modal-actions">


                <button
                  type="button"
                  className="lesson-cancel-button"
                  onClick={
                    closeEditLessonModal
                  }
                  disabled={
                    updatingLesson
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="lesson-save-button"
                  disabled={
                    updatingLesson
                  }
                >

                  <Pencil
                    size={15}
                  />

                  {updatingLesson
                    ? "Saving..."
                    : "Save Changes"}

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


      {/* ====================================
          DELETE LESSON MODAL
      ==================================== */}

      {deleteLessonOpen &&
        lessonToDelete && (

        <div className="lesson-modal-overlay">


          <div className="delete-lesson-modal">


            <div className="delete-lesson-icon">

              <Trash2
                size={25}
              />

            </div>


            <h2>
              Delete Lesson?
            </h2>


            <p>

              Are you sure you want to
              delete{" "}

              <strong>
                "{lessonToDelete.title}"
              </strong>

              ?

            </p>


            <span className="delete-lesson-warning">

              This lesson and its uploaded
              learning material will be
              permanently removed.

            </span>


            <div className="delete-lesson-actions">


              <button
                type="button"
                className="delete-lesson-cancel"
                onClick={
                  closeDeleteLessonModal
                }
                disabled={
                  deletingLesson
                }
              >

                Cancel

              </button>


              <button
                type="button"
                className="delete-lesson-confirm"
                onClick={
                  handleDeleteLesson
                }
                disabled={
                  deletingLesson
                }
              >

                <Trash2
                  size={14}
                />

                {deletingLesson
                  ? "Deleting..."
                  : "Delete Lesson"}

              </button>


            </div>


          </div>


        </div>

      )}


    </div>

  );
}


export default LecturerCourse;