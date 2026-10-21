import {
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
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Layers3,
  Sparkles,
  ExternalLink,
  CircleCheckBig,
} from "lucide-react";

import "../styles/courseDetails.css";


function Course() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();


  /* ========================================
     STATE
  ======================================== */

  const [course, setCourse] =
    useState(null);

  const [lessons, setLessons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================
     FETCH COURSE + LESSONS
  ======================================== */

  useEffect(() => {

    const fetchCourseData =
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


          const courseResponse =
            await axios.get(
              `http://localhost:5000/courses/${id}`,
              {
                headers,
              }
            );


          const lessonsResponse =
            await axios.get(
              `http://localhost:5000/courses/${id}/lessons`,
              {
                headers,
              }
            );


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


        } catch (err) {

          console.error(
            "Error fetching course data:",
            err
          );


          /*
            If token is invalid or expired,
            send the student to login.
          */

          if (
            err.response?.status ===
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


          /*
            403 means the student is logged
            in but does not belong to the
            required Degree + Batch.
          */

          if (
            err.response?.status ===
            403
          ) {

            setError(
              err.response?.data?.error ||
              "You are not enrolled in this course."
            );

            return;

          }


          setError(
            err.response?.data?.error ||
            "We couldn't load this course right now."
          );


        } finally {

          setLoading(false);

        }

      };


    fetchCourseData();


  }, [
    id,
    navigate,
  ]);


  /* ========================================
     MATERIAL URL HELPER
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
        `http://localhost:5000/${cleanPath}`
      );

    };


  /* ========================================
     MAIN COURSE MATERIAL
  ======================================== */

  const materialUrl =
    getMaterialUrl(
      course?.file_path
    );


  /* ========================================
     OPEN LESSON MATERIAL
  ======================================== */

  const openLessonMaterial =
    (lesson) => {

      const lessonMaterialUrl =
        getMaterialUrl(
          lesson.file_path
        );


      if (!lessonMaterialUrl) {

        alert(
          "No learning material is attached to this lesson."
        );

        return;

      }


      window.open(
        lessonMaterialUrl,
        "_blank",
        "noopener,noreferrer"
      );

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
              Loading course...
            </h3>


            <p>
              Please wait while we prepare
              your course content.
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
              "/my-courses"
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


  /* ========================================
     UI
  ======================================== */

  return (

    <div className="course-details-page">


      {/* ====================================
          BACK
      ==================================== */}

      <button
        className="course-back-button"
        onClick={() =>
          navigate(
            "/my-courses"
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

            Course

          </div>


          <h1>
            {course.title}
          </h1>


          <p className="course-hero-description">

            {course.description ||
              "Access your course lessons, learning resources and study materials from one place."}

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


          </div>


        </div>


        <div className="course-hero-icon">

          <GraduationCap
            size={50}
            strokeWidth={1.5}
          />

        </div>


      </section>


      {/* ====================================
          QUICK INFORMATION
      ==================================== */}

      <section className="course-information-grid">


        {/* LESSON COUNT */}

        <div className="course-info-card course-info-purple">


          <div className="course-info-icon">

            <Layers3 size={20} />

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


        {/* MAIN COURSE MATERIAL */}

        <div className="course-info-card course-info-blue">


          <div className="course-info-icon">

            <FileText size={20} />

          </div>


          <div>

            <strong>

              {materialUrl
                ? "Available"
                : "Not Added"}

            </strong>

            <span>
              Course Material
            </span>

          </div>


        </div>


        {/* STATUS */}

        <div className="course-info-card course-info-green">


          <div className="course-info-icon">

            <CircleCheckBig
              size={20}
            />

          </div>


          <div>

            <strong>
              Active
            </strong>

            <span>
              Course Status
            </span>

          </div>


        </div>


      </section>


      {/* ====================================
          CONTENT
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
                Explore the learning content
                and materials available for
                this course.
              </p>

            </div>


          </div>


          {lessons.length === 0 ? (

            <div className="course-empty-lessons">


              <div className="course-empty-icon">

                <BookOpen size={24} />

              </div>


              <h3>
                No lessons yet
              </h3>


              <p>
                Your lecturer hasn't added
                any lessons to this course yet.
              </p>


            </div>

          ) : (

            <div className="course-lessons-list">


              {lessons.map(
                (
                  lesson,
                  index
                ) => (

                  <article
                    className="course-lesson-card"
                    key={lesson.id}
                  >


                    {/* LESSON INFORMATION */}

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


                    {/* =================================
                        LESSON ACTIONS
                    ================================= */}

                    <div className="lesson-actions">


                      {/* LESSON PPTX / PDF / DOCX */}

                      {lesson.file_path && (

                        <button
                          type="button"
                          className="lesson-material-button"
                          onClick={() =>
                            openLessonMaterial(
                              lesson
                            )
                          }
                        >

                          <ExternalLink
                            size={14}
                          />

                          Open Lesson Material

                        </button>

                      )}


                      {/* AI TUTOR */}

                      <button
                        type="button"
                        className="lesson-ai-button"
                        onClick={() =>
                          navigate("/tutor")
                        }
                      >

                        <Sparkles
                          size={14}
                        />

                        Ask AI about this lesson

                      </button>


                    </div>


                  </article>

                )
              )}


            </div>

          )}


        </div>


        {/* ==================================
            RIGHT COLUMN
        ================================== */}

        <aside className="course-side-column">


          {/* =================================
              MAIN COURSE MATERIAL
          ================================= */}

          <div className="course-material-card">


            <div className="material-icon">

              <FileText size={23} />

            </div>


            <h3>
              Course Material
            </h3>


            <p>
              Open the main learning material
              uploaded for this course.
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


          {/* =================================
              AI CARD
          ================================= */}

          <div className="course-ai-card">


            <div className="course-ai-card-icon">

              <Sparkles size={22} />

            </div>


            <h3>
              AI Study Assistant
            </h3>


            <p>
              Need help understanding this
              module? Ask your AI tutor to
              explain difficult concepts.
            </p>


            <button
              className="course-ai-button"
              type="button"
              onClick={() =>
                navigate(
                  "/tutor"
                )
              }
            >

              Ask AI Tutor

              <ArrowRight size={14} />

            </button>


          </div>


        </aside>


      </section>


    </div>

  );

}


export default Course;