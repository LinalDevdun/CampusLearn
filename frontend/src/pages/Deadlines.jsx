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
  CalendarDays,
  Clock3,
  Search,
  AlertTriangle,
  CalendarClock,
  CircleCheckBig,
  GraduationCap,
  ArrowRight,
  Inbox,
  Sparkles,
  TimerReset,
  CalendarRange,
  CheckCircle2,
} from "lucide-react";

import "../styles/deadlines.css";

import API_BASE_URL from "../config/api";


function Deadlines() {

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
    loading,
    setLoading,
  ] = useState(true);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState("all");


  /* ========================================
     FETCH ASSIGNMENTS
  ======================================== */

  useEffect(() => {

    const fetchDeadlines =
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
            "Error fetching deadlines:",
            error
          );


        } finally {

          setLoading(false);

        }

      };


    fetchDeadlines();

  }, [navigate]);


  /* ========================================
     DAYS LEFT
  ======================================== */

  const getDaysLeft = (
    dueDate
  ) => {

    if (!dueDate) {
      return null;
    }


    const today =
      new Date();


    const due =
      new Date(
        dueDate
      );


    today.setHours(
      0,
      0,
      0,
      0
    );


    due.setHours(
      0,
      0,
      0,
      0
    );


    const difference =
      due.getTime() -
      today.getTime();


    return Math.ceil(
      difference /
      (
        1000 *
        60 *
        60 *
        24
      )
    );

  };


  /* ========================================
     DEADLINE STATUS
  ======================================== */

  const getDeadlineStatus = (
    dueDate
  ) => {

    const days =
      getDaysLeft(
        dueDate
      );


    if (days === null) {
      return "upcoming";
    }


    if (days <= 2) {
      return "urgent";
    }


    if (days <= 7) {
      return "soon";
    }


    return "upcoming";

  };


  /* ========================================
     VALID DEADLINES
  ======================================== */

  const validDeadlines =
    assignments.filter(
      (assignment) =>
        assignment.due_date
    );


  /* ========================================
     COUNTS
  ======================================== */

  const urgentCount =
    validDeadlines.filter(
      (assignment) => {

        const completed =
          assignment.is_submitted ||
          assignment.is_graded;


        if (completed) {
          return false;
        }


        const days =
          getDaysLeft(
            assignment.due_date
          );


        return (
          days !== null &&
          days >= 0 &&
          days <= 2
        );

      }
    ).length;


  const thisWeekCount =
    validDeadlines.filter(
      (assignment) => {

        const completed =
          assignment.is_submitted ||
          assignment.is_graded;


        if (completed) {
          return false;
        }


        const days =
          getDaysLeft(
            assignment.due_date
          );


        return (
          days !== null &&
          days >= 0 &&
          days <= 7
        );

      }
    ).length;


  const upcomingCount =
    validDeadlines.filter(
      (assignment) => {

        const completed =
          assignment.is_submitted ||
          assignment.is_graded;


        if (completed) {
          return false;
        }


        const days =
          getDaysLeft(
            assignment.due_date
          );


        return (
          days !== null &&
          days >= 0
        );

      }
    ).length;


  const completedCount =
    assignments.filter(
      (assignment) =>
        assignment.is_submitted ||
        assignment.is_graded
    ).length;


  /* ========================================
     NEXT DEADLINE
  ======================================== */

  const nextDeadline =
    useMemo(() => {

      const upcoming =
        validDeadlines
          .filter(
            (assignment) => {

              const completed =
                assignment.is_submitted ||
                assignment.is_graded;


              const days =
                getDaysLeft(
                  assignment.due_date
                );


              return (
                !completed &&
                days !== null &&
                days >= 0
              );

            }
          )
          .sort(
            (a, b) =>
              new Date(
                a.due_date
              ) -
              new Date(
                b.due_date
              )
          );


      return upcoming[0] ||
        null;

    }, [assignments]);


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const filteredDeadlines =
    useMemo(() => {

      return validDeadlines
        .filter(
          (assignment) => {

            const search =
              searchTerm
                .toLowerCase();


            const matchesSearch =
              assignment.title
                ?.toLowerCase()
                .includes(
                  search
                ) ||

              assignment.description
                ?.toLowerCase()
                .includes(
                  search
                ) ||

              assignment.degree
                ?.toLowerCase()
                .includes(
                  search
                );


            const days =
              getDaysLeft(
                assignment.due_date
              );


            let matchesFilter =
              true;


            if (
              filter === "urgent"
            ) {

              matchesFilter =
                days !== null &&
                days >= 0 &&
                days <= 2;

            }


            if (
              filter === "week"
            ) {

              matchesFilter =
                days !== null &&
                days >= 0 &&
                days <= 7;

            }


            if (
              filter === "future"
            ) {

              matchesFilter =
                days !== null &&
                days > 7;

            }


            return (
              matchesSearch &&
              matchesFilter
            );

          }
        )

        .sort(
          (a, b) =>
            new Date(
              a.due_date
            ) -
            new Date(
              b.due_date
            )
        );

    }, [
      assignments,
      searchTerm,
      filter,
    ]);


  /* ========================================
     DATE HELPERS
  ======================================== */

  const getDay = (
    date
  ) =>

    new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
      }
    );


  const getMonth = (
    date
  ) =>

    new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
      }
    );


  const formatDate = (
    date
  ) =>

    new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );


  /* ========================================
     WEEK STRIP
  ======================================== */

  const weekDays =
    useMemo(() => {

      const today =
        new Date();


      today.setHours(
        0,
        0,
        0,
        0
      );


      return Array.from(
        {
          length: 7,
        },
        (_, index) => {

          const date =
            new Date(
              today
            );


          date.setDate(
            today.getDate() +
            index
          );


          return date;

        }
      );

    }, []);


  /* ========================================
     SAME DATE CHECK
  ======================================== */

  const isSameDay = (
    first,
    second
  ) => {

    return (
      first.getFullYear() ===
        second.getFullYear() &&

      first.getMonth() ===
        second.getMonth() &&

      first.getDate() ===
        second.getDate()
    );

  };


  return (

    <div className="deadlines-page">


      {/* ====================================
          DEADLINE RADAR HEADER
      ==================================== */}

      <section className="deadline-radar-header">


        {/* LEFT */}

        <div className="deadline-radar-main">


          <div className="radar-decoration radar-decoration-one" />

          <div className="radar-decoration radar-decoration-two" />


          <div className="radar-heading">


            <div className="radar-heading-icon">

              <CalendarRange
                size={22}
              />

            </div>


            <div>

              <div className="radar-eyebrow">

                <Sparkles
                  size={12}
                />

                ACADEMIC TIMELINE

              </div>


              <h1>
                Deadline Radar
              </h1>


              <p>

                See what's coming up,
                identify urgent coursework
                and stay ahead of every
                submission date.

              </p>

            </div>

          </div>


          {/* WEEK STRIP */}

          <div className="deadline-week-strip">

            {weekDays.map(
              (
                date,
                index
              ) => {

                const hasDeadline =
                  validDeadlines.some(
                    (assignment) =>
                      isSameDay(
                        new Date(
                          assignment.due_date
                        ),
                        date
                      )
                  );


                return (

                  <div
                    className={
                      `week-day-card ${
                        index === 0
                          ? "today"
                          : ""
                      } ${
                        hasDeadline
                          ? "has-deadline"
                          : ""
                      }`
                    }
                    key={
                      date.toISOString()
                    }
                  >

                    <span>

                      {date
                        .toLocaleDateString(
                          "en-US",
                          {
                            weekday:
                              "short",
                          }
                        )
                        .toUpperCase()}

                    </span>


                    <strong>

                      {date.getDate()}

                    </strong>


                    {hasDeadline && (

                      <div className="week-deadline-dot" />

                    )}

                  </div>

                );

              }
            )}

          </div>


          {/* RADAR FOOTER */}

          <div className="radar-footer">

            <span>

              <CalendarClock
                size={12}
              />

              {upcomingCount} upcoming

            </span>


            <span>

              <Clock3
                size={12}
              />

              {thisWeekCount} this week

            </span>


            <span>

              <AlertTriangle
                size={12}
              />

              {urgentCount} urgent

            </span>

          </div>

        </div>


        {/* ==================================
            NEXT PRIORITY
        ================================== */}

        <aside className="deadline-priority-card">


          <div className="priority-card-top">

            <div className="priority-icon">

              <TimerReset
                size={19}
              />

            </div>


            <span>
              NEXT PRIORITY
            </span>

          </div>


          {nextDeadline ? (

            <>

              <div className="priority-date">

                <strong>

                  {getDay(
                    nextDeadline
                      .due_date
                  )}

                </strong>


                <span>

                  {getMonth(
                    nextDeadline
                      .due_date
                  )}

                </span>

              </div>


              <h3>

                {nextDeadline.title}

              </h3>


              <p>

                {nextDeadline.description ||
                  "Complete this coursework before the upcoming deadline."}

              </p>


              <div className="priority-bottom">

                <span>

                  <Clock3
                    size={12}
                  />

                  {getDaysLeft(
                    nextDeadline.due_date
                  ) === 0

                    ? "Due today"

                    : getDaysLeft(
                        nextDeadline
                          .due_date
                      ) === 1

                      ? "1 day left"

                      : `${getDaysLeft(
                          nextDeadline
                            .due_date
                        )} days left`}

                </span>


                <button
                  onClick={() =>
                    navigate(
                      "/assignments"
                    )
                  }
                >

                  Open

                  <ArrowRight
                    size={12}
                  />

                </button>

              </div>

            </>

          ) : (

            <div className="priority-clear">

              <div>

                <CheckCircle2
                  size={27}
                />

              </div>


              <strong>
                All clear
              </strong>


              <p>

                You currently have no
                upcoming coursework
                deadlines.

              </p>

            </div>

          )}

        </aside>

      </section>


      {/* ====================================
          SUMMARY
      ==================================== */}

      <section className="deadlines-summary">


        <DeadlineSummary
          className="deadline-summary-purple"
          icon={
            <CalendarDays
              size={20}
            />
          }
          number={
            validDeadlines.length
          }
          label="Total Deadlines"
          detail="Coursework schedule"
        />


        <DeadlineSummary
          className="deadline-summary-red"
          icon={
            <AlertTriangle
              size={20}
            />
          }
          number={
            urgentCount
          }
          label="Urgent"
          detail="Due within 2 days"
        />


        <DeadlineSummary
          className="deadline-summary-orange"
          icon={
            <Clock3
              size={20}
            />
          }
          number={
            thisWeekCount
          }
          label="This Week"
          detail="Due within 7 days"
        />


        <DeadlineSummary
          className="deadline-summary-green"
          icon={
            <CircleCheckBig
              size={20}
            />
          }
          number={
            completedCount
          }
          label="Completed"
          detail="Submitted coursework"
        />

      </section>


      {/* ====================================
          FIND DEADLINE
      ==================================== */}

      <section className="deadline-control-bar">


        <div className="deadline-control-label">

          <div>

            <CalendarClock
              size={18}
            />

          </div>


          <span>

            <strong>
              Find a deadline
            </strong>

            Search your schedule

          </span>

        </div>


        <div className="deadlines-search">

          <Search
            size={17}
          />


          <input
            type="text"
            placeholder="Search deadline, assignment or degree..."
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
          className="deadlines-filter"
          value={
            filter
          }
          onChange={
            (event) =>
              setFilter(
                event.target.value
              )
          }
        >

          <option value="all">
            All Deadlines
          </option>

          <option value="urgent">
            Urgent
          </option>

          <option value="week">
            Due This Week
          </option>

          <option value="future">
            Later Deadlines
          </option>

        </select>

      </section>


      {/* ====================================
          TIMELINE HEADING
      ==================================== */}

      {!loading && (

        <div className="deadline-timeline-heading">

          <div>

            <span>

              <CalendarDays
                size={13}
              />

              DEADLINE TIMELINE

            </span>


            <h2>
              Coursework Schedule
            </h2>

          </div>


          <strong>

            {filteredDeadlines.length}{" "}

            {filteredDeadlines.length === 1
              ? "deadline"
              : "deadlines"}

          </strong>

        </div>

      )}


      {/* ====================================
          LIST
      ==================================== */}

      <section className="deadline-list">


        {loading ? (

          <div className="deadlines-empty">

            <div className="deadline-loader" />


            <h3>
              Building your timeline...
            </h3>


            <p>
              Loading your coursework
              deadlines.
            </p>

          </div>

        ) : filteredDeadlines.length ===
          0 ? (

          <div className="deadlines-empty">

            <div className="deadlines-empty-icon">

              <Inbox
                size={27}
              />

            </div>


            <h3>
              No deadlines found
            </h3>


            <p>

              There are currently no
              deadlines matching your
              search or selected filter.

            </p>

          </div>

        ) : (

          filteredDeadlines.map(
            (
              assignment,
              index
            ) => {

              const days =
                getDaysLeft(
                  assignment.due_date
                );


              const status =
                getDeadlineStatus(
                  assignment.due_date
                );


              const completed =
                assignment.is_submitted ||
                assignment.is_graded;


              let visualStatus =
                status;


              if (completed) {

                visualStatus =
                  "completed";

              } else if (
                days < 0
              ) {

                visualStatus =
                  "passed";

              }


              return (

                <article
                  className={
                    `deadline-card deadline-card-${visualStatus}`
                  }
                  key={
                    assignment.id
                  }
                >


                  {/* TIMELINE */}

                  <div className="deadline-timeline-node">

                    <div
                      className={
                        `timeline-dot timeline-dot-${visualStatus}`
                      }
                    />


                    {index <
                      filteredDeadlines.length -
                        1 && (

                      <div className="timeline-line" />

                    )}

                  </div>


                  {/* DATE */}

                  <div
                    className={
                      `deadline-date-box deadline-date-${visualStatus}`
                    }
                  >

                    <strong>

                      {getDay(
                        assignment.due_date
                      )}

                    </strong>


                    <span>

                      {getMonth(
                        assignment.due_date
                      )}

                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="deadline-details">


                    <div className="deadline-title-row">


                      <h3>
                        {assignment.title}
                      </h3>


                      <span
                        className={
                          `deadline-status deadline-status-${visualStatus}`
                        }
                      >

                        {assignment.is_graded

                          ? "Graded"

                          : assignment.is_submitted

                            ? "Submitted"

                            : days < 0

                              ? "Passed"

                              : status ===
                                  "urgent"

                                ? "Urgent"

                                : status ===
                                    "soon"

                                  ? "Due Soon"

                                  : "Upcoming"}

                      </span>

                    </div>


                    <p className="deadline-description">

                      {assignment.description ||
                        "Complete and submit this assignment before the due date."}

                    </p>


                    <div className="deadline-meta">


                      <span className="deadline-meta-item">

                        <CalendarDays
                          size={11}
                        />

                        {formatDate(
                          assignment.due_date
                        )}

                      </span>


                      {assignment.degree && (

                        <span className="deadline-meta-item">

                          <GraduationCap
                            size={11}
                          />

                          {assignment.degree}

                        </span>

                      )}


                      {assignment.batch && (

                        <span className="deadline-meta-item">

                          Batch{" "}

                          {assignment.batch}

                        </span>

                      )}

                    </div>

                  </div>


                  {/* ACTION */}

                  <div className="deadline-action">


                    <span
                      className={
                        `deadline-days-left deadline-days-${visualStatus}`
                      }
                    >

                      {completed

                        ? "Coursework completed"

                        : days < 0

                          ? "Deadline passed"

                          : days === 0

                            ? "Due today"

                            : days === 1

                              ? "1 day left"

                              : `${days} days left`}

                    </span>


                    <button
                      className="deadline-open-button"
                      onClick={() =>
                        navigate(
                          "/assignments"
                        )
                      }
                    >

                      View Assignment

                      <ArrowRight
                        size={14}
                      />

                    </button>

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
   SUMMARY COMPONENT
======================================== */

function DeadlineSummary({
  className,
  icon,
  number,
  label,
  detail,
}) {

  return (

    <div
      className={
        `deadline-summary-card ${className}`
      }
    >

      <div className="deadline-summary-line" />


      <div className="deadline-summary-icon">

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


export default Deadlines;