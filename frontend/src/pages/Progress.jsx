import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  TrendingUp,
  BookOpen,
  Clock3,
  Award,
  Target,
  BrainCircuit,
  Database,
  Code2,
  Globe2,
  Trophy,
  Sparkles,
  CheckCircle2,
  Layers3,
} from "lucide-react";

import "../styles/progress.css";

import API_BASE_URL from "../config/api";


function Progress() {

  const [
    courses,
    setCourses,
  ] = useState([]);


  const [
    assignments,
    setAssignments,
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
     LOAD REAL STUDENT DATA
  ======================================== */

  useEffect(() => {

    const loadProgressData =
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
            coursesResponse,
            assignmentsResponse,
          ] =
            await Promise.all([

              axios.get(
                `${API_BASE_URL}/courses`,
                config
              ),

              axios.get(
                `${API_BASE_URL}/assignments`,
                config
              ),

            ]);


          const realCourses =
            Array.isArray(
              coursesResponse.data
            )
              ? coursesResponse.data
              : [];


          const realAssignments =
            Array.isArray(
              assignmentsResponse.data
            )
              ? assignmentsResponse.data
              : [];


          /*
            Load real lesson availability.

            There is currently no student
            lesson-completion table, so this
            page does not invent lesson
            completion percentages.
          */

          const coursesWithLessons =
            await Promise.all(

              realCourses.map(
                async (course) => {

                  try {

                    const response =
                      await axios.get(
                        `${API_BASE_URL}/courses/${course.id}/lessons`,
                        config
                      );


                    const lessons =
                      Array.isArray(
                        response.data
                      )
                        ? response.data
                        : [];


                    return {

                      ...course,

                      lessonCount:
                        lessons.length,

                    };


                  } catch (lessonError) {

                    console.error(
                      `Error loading lessons for course ${course.id}:`,
                      lessonError
                    );


                    return {

                      ...course,

                      lessonCount: 0,

                    };

                  }

                }
              )

            );


          setCourses(
            coursesWithLessons
          );


          setAssignments(
            realAssignments
          );


        } catch (loadError) {

          console.error(
            "Error loading progress data:",
            loadError
          );


          setError(
            loadError.response?.data?.error ||
            "Failed to load learning progress."
          );


        } finally {

          setLoading(false);

        }

      };


    loadProgressData();

  }, []);


  /* ========================================
     REAL PROGRESS VALUES
  ======================================== */

  const completedTasks =
    useMemo(

      () =>

        assignments.filter(
          (assignment) =>
            assignment.is_submitted ||
            assignment.is_graded
        ).length,

      [assignments]

    );


  const overallProgress =
    useMemo(

      () =>

        assignments.length > 0

          ? Math.round(
              (
                completedTasks /
                assignments.length
              ) * 100
            )

          : 0,

      [
        assignments.length,
        completedTasks,
      ]

    );


  const activeCourses =
    courses.length;


  const pendingTasks =
    Math.max(
      assignments.length -
      completedTasks,
      0
    );


  /* ========================================
     COURSE ICON
  ======================================== */

  const getCourseIcon = (
    title = ""
  ) => {

    const name =
      title.toLowerCase();


    if (
      name.includes("ai") ||
      name.includes("artificial") ||
      name.includes("machine")
    ) {

      return BrainCircuit;

    }


    if (
      name.includes("database")
    ) {

      return Database;

    }


    if (
      name.includes("software") ||
      name.includes("programming")
    ) {

      return Code2;

    }


    if (
      name.includes("web") ||
      name.includes("internet") ||
      name.includes("iot")
    ) {

      return Globe2;

    }


    return BookOpen;

  };


  /* ========================================
     PROGRESS MESSAGE
  ======================================== */

  const progressMessage =

    overallProgress === 100

      ? "Excellent! You've submitted all currently assigned coursework."

      : overallProgress >= 70

        ? "You're making strong progress. Keep the momentum going."

        : overallProgress >= 40

          ? "You're building steady progress across your coursework."

          : assignments.length === 0

            ? "Your progress will appear once coursework is published."

            : "Complete your pending coursework to move further along your learning journey.";


  const progressBadge =

    overallProgress >= 100

      ? "Complete"

      : overallProgress >= 70

        ? "On Track"

        : overallProgress >= 40

          ? "In Progress"

          : "Getting Started";


  /* ========================================
     CURRENT STAGE
  ======================================== */

  const stages = [

    {
      title: "Started",
      threshold: 0,
    },

    {
      title: "Building",
      threshold: 25,
    },

    {
      title: "On Track",
      threshold: 60,
    },

    {
      title: "Complete",
      threshold: 100,
    },

  ];


  return (

    <div className="progress-page">


      {/* ====================================
          LEARNING JOURNEY
      ==================================== */}

      <section className="journey-board">


        <div className="journey-main">


          <div className="journey-heading">

            <div className="journey-title-icon">

              <TrendingUp
                size={22}
              />

            </div>


            <div>

              <div className="journey-eyebrow">

                <Sparkles
                  size={12}
                />

                YOUR LEARNING JOURNEY

              </div>


              <h1>
                Learning Progress
              </h1>


              <p>

                See how your coursework is
                moving forward and understand
                where you are in your academic
                journey.

              </p>

            </div>

          </div>


          {/* JOURNEY PATH */}

          <div className="journey-path">


            <div className="journey-path-line">

              <div
                className="journey-path-fill"
                style={{
                  width:
                    `${overallProgress}%`,
                }}
              />

            </div>


            <div className="journey-stages">

              {stages.map(
                (
                  stage,
                  index
                ) => {

                  const reached =
                    overallProgress >=
                    stage.threshold;


                  const active =
                    index ===
                    stages.reduce(
                      (
                        selected,
                        current,
                        currentIndex
                      ) =>

                        overallProgress >=
                        current.threshold

                          ? currentIndex

                          : selected,

                      0
                    );


                  return (

                    <div
                      className={
                        `journey-stage ${
                          reached
                            ? "reached"
                            : ""
                        } ${
                          active
                            ? "active"
                            : ""
                        }`
                      }
                      key={
                        stage.title
                      }
                    >

                      <div className="journey-stage-dot">

                        {reached &&
                        stage.threshold !==
                          0 ? (

                          <CheckCircle2
                            size={13}
                          />

                        ) : (

                          <span>
                            {index + 1}
                          </span>

                        )}

                      </div>


                      <span>

                        {stage.title}

                      </span>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </div>


        {/* ==================================
            SCORE CARD
        ================================== */}

        <aside className="journey-score-card">


          <div className="journey-score-label">

            <Target
              size={14}
            />

            OVERALL COMPLETION

          </div>


          <div
            className="journey-score-ring"
            style={{
              background:
                `conic-gradient(
                  #ffffff 0deg ${overallProgress * 3.6}deg,
                  rgba(255,255,255,0.18) ${overallProgress * 3.6}deg 360deg
                )`,
            }}
          >

            <div className="journey-score-inner">

              <strong>

                {loading
                  ? "..."
                  : `${overallProgress}%`}

              </strong>

              <span>
                COMPLETE
              </span>

            </div>

          </div>


          <strong className="journey-score-status">

            {progressBadge}

          </strong>


          <p>

            {loading
              ? "Loading your progress..."
              : progressMessage}

          </p>

        </aside>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (

        <div className="progress-error">

          {error}

        </div>

      )}


      {/* ====================================
          PROGRESS SNAPSHOT
      ==================================== */}

      <section className="progress-snapshot">


        <SnapshotCard
          className="snapshot-purple"
          icon={
            <Target size={20} />
          }
          eyebrow="OVERALL"
          value={
            loading
              ? "..."
              : `${overallProgress}%`
          }
          label="Coursework Progress"
        />


        <SnapshotCard
          className="snapshot-blue"
          icon={
            <BookOpen size={20} />
          }
          eyebrow="LEARNING"
          value={
            loading
              ? "..."
              : activeCourses
          }
          label="Active Courses"
        />


        <SnapshotCard
          className="snapshot-orange"
          icon={
            <Award size={20} />
          }
          eyebrow="COMPLETED"
          value={
            loading
              ? "..."
              : completedTasks
          }
          label="Tasks Completed"
        />


        <SnapshotCard
          className="snapshot-green"
          icon={
            <Layers3 size={20} />
          }
          eyebrow="REMAINING"
          value={
            loading
              ? "..."
              : pendingTasks
          }
          label="Pending Tasks"
        />

      </section>


      {/* ====================================
          INSIGHT GRID
      ==================================== */}

      <section className="progress-insight-grid">


        {/* COURSEWORK INSIGHT */}

        <div className="progress-insight-card coursework-insight">


          <div className="insight-card-header">

            <div>

              <span>
                COURSEWORK PULSE
              </span>

              <h2>
                Your progress at a glance
              </h2>

            </div>


            <div className="insight-header-icon">

              <TrendingUp
                size={19}
              />

            </div>

          </div>


          <div className="coursework-pulse-body">


            <div className="pulse-number">

              <strong>

                {loading
                  ? "..."
                  : completedTasks}

              </strong>


              <span>

                of {assignments.length}
                {" "}tasks completed

              </span>

            </div>


            <div className="pulse-progress-track">

              <div
                className="pulse-progress-fill"
                style={{
                  width:
                    `${overallProgress}%`,
                }}
              />

            </div>


            <div className="pulse-stats">

              <div>

                <span>
                  Completed
                </span>

                <strong>
                  {completedTasks}
                </strong>

              </div>


              <div>

                <span>
                  Pending
                </span>

                <strong>
                  {pendingTasks}
                </strong>

              </div>


              <div>

                <span>
                  Completion
                </span>

                <strong>
                  {overallProgress}%
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* STUDY TRACKING */}

        <div className="progress-insight-card tracking-insight">


          <div className="tracking-icon">

            <Clock3
              size={23}
            />

          </div>


          <span className="tracking-label">

            STUDY ACTIVITY

          </span>


          <h2>
            Tracking coming later
          </h2>


          <p>

            CampusLearn does not yet record
            study-session time, so we won't
            display made-up activity data.

          </p>


          <div className="tracking-status">

            <span />

            Not enabled yet

          </div>

        </div>

      </section>


      {/* ====================================
          COURSE JOURNEY
      ==================================== */}

      <section className="course-journey-section">


        <div className="course-journey-heading">


          <div>

            <span>

              <BookOpen
                size={13}
              />

              COURSE JOURNEY

            </span>


            <h2>
              Your Learning Spaces
            </h2>


            <p>

              Real course and lesson
              availability from your enrolled
              modules.

            </p>

          </div>


          <div className="course-count-pill">

            {courses.length}{" "}

            {courses.length === 1
              ? "course"
              : "courses"}

          </div>

        </div>


        <div className="course-progress-list">


          {loading ? (

            <div className="progress-empty">

              Loading courses...

            </div>

          ) : courses.length === 0 ? (

            <div className="progress-empty">

              No courses are currently
              assigned to your degree and
              batch.

            </div>

          ) : (

            courses.map(
              (
                course,
                index
              ) => {

                const Icon =
                  getCourseIcon(
                    course.title
                  );


                const theme =
                  [
                    "violet",
                    "blue",
                    "green",
                    "orange",
                  ][
                    index % 4
                  ];


                return (

                  <article
                    className={
                      `course-progress-card course-progress-${theme}`
                    }
                    key={
                      course.id
                    }
                  >


                    <div className="course-progress-accent" />


                    <div className="course-progress-top">


                      <div className="course-progress-icon">

                        <Icon
                          size={20}
                        />

                      </div>


                      <div className="course-progress-info">

                        <span className="course-progress-label">

                          MODULE{" "}
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </span>


                        <h3>

                          {course.title}

                        </h3>


                        <p>

                          {course.lessonCount}{" "}

                          {course.lessonCount ===
                          1
                            ? "lesson"
                            : "lessons"}{" "}

                          available

                        </p>

                      </div>


                      <span className="course-progress-state">

                        Not tracked

                      </span>

                    </div>


                    <div className="course-progress-track-large">

                      <div
                        className="course-progress-fill-large"
                        style={{
                          width: "0%",
                        }}
                      />

                    </div>


                    <div className="course-progress-bottom">

                      <span>

                        Batch{" "}

                        {course.batch ||
                          "Not assigned"}

                      </span>


                      <span>

                        Lesson completion
                        tracking not enabled

                      </span>

                    </div>

                  </article>

                );

              }
            )

          )}

        </div>

      </section>


      {/* ====================================
          MOTIVATION
      ==================================== */}

      <section className="progress-achievement">


        <div className="achievement-orb achievement-orb-one" />

        <div className="achievement-orb achievement-orb-two" />


        <div className="progress-achievement-content">


          <div className="progress-achievement-icon">

            <Trophy
              size={24}
            />

          </div>


          <div>

            <span className="achievement-eyebrow">

              YOUR MOMENTUM

            </span>


            <h3>

              {overallProgress === 100

                ? "All caught up!"

                : overallProgress >= 70

                  ? "You're almost there!"

                  : "Keep progressing!"}

            </h3>


            <p>

              {assignments.length === 0

                ? "Your learning progress will update when assignments are published."

                : `You've completed ${completedTasks} of ${assignments.length} current coursework tasks (${overallProgress}%).`}

            </p>

          </div>

        </div>


        <div className="achievement-score">

          <strong>
            {overallProgress}%
          </strong>

          <span>
            CURRENT PROGRESS
          </span>

        </div>

      </section>

    </div>

  );

}


/* ========================================
   SNAPSHOT CARD
======================================== */

function SnapshotCard({
  className,
  icon,
  eyebrow,
  value,
  label,
}) {

  return (

    <div
      className={
        `progress-snapshot-card ${className}`
      }
    >

      <div className="snapshot-accent" />


      <div className="snapshot-icon">

        {icon}

      </div>


      <div>

        <span className="snapshot-eyebrow">

          {eyebrow}

        </span>


        <strong>
          {value}
        </strong>


        <small>
          {label}
        </small>

      </div>

    </div>

  );

}


export default Progress;