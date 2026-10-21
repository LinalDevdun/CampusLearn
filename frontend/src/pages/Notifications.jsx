import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Bell,
  Search,
  ClipboardList,
  GraduationCap,
  BookOpen,
  CalendarClock,
  Info,
  CircleCheck,
  Clock3,
  CheckCheck,
  MailOpen,
  Sparkles,
  Activity,
  Inbox,
  Zap,
} from "lucide-react";

import "../styles/notifications.css";

import API_BASE_URL from "../config/api";


function Notifications() {

  const [notifications, setNotifications] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================
     LOAD REAL NOTIFICATIONS
  ======================================== */

  useEffect(() => {

    const loadNotifications =
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


          const response =
            await axios.get(
              `${API_BASE_URL}/notifications`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const realNotifications =
            Array.isArray(
              response.data
            )
              ? response.data
              : [];


          setNotifications(
            realNotifications
          );


        } catch (loadError) {

          console.error(
            "Notification loading error:",
            loadError
          );


          setError(
            loadError.response?.data?.error ||
            "Failed to load notifications."
          );


        } finally {

          setLoading(false);

        }

      };


    loadNotifications();

  }, []);


  /* ========================================
     TYPE ICON
  ======================================== */

  const getTypeIcon = (type) => {

    switch (type) {

      case "assignment":
        return ClipboardList;

      case "grade":
        return GraduationCap;

      case "course":
        return BookOpen;

      case "deadline":
        return CalendarClock;

      default:
        return Info;

    }

  };


  /* ========================================
     TYPE LABEL
  ======================================== */

  const getTypeLabel = (type) => {

    switch (type) {

      case "assignment":
        return "Assignment";

      case "grade":
        return "Grade";

      case "course":
        return "Course";

      case "deadline":
        return "Deadline";

      default:
        return "Update";

    }

  };


  /* ========================================
     RELATIVE TIME
  ======================================== */

  const getRelativeTime = (
    createdAt
  ) => {

    if (!createdAt) {
      return "";
    }


    const created =
      new Date(
        createdAt
      );


    const now =
      new Date();


    const difference =
      now.getTime() -
      created.getTime();


    const minutes =
      Math.floor(
        difference /
        (1000 * 60)
      );


    if (minutes < 1) {

      return "Just now";

    }


    if (minutes < 60) {

      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (hours < 24) {

      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;

    }


    const days =
      Math.floor(
        hours / 24
      );


    if (days === 1) {

      return "Yesterday";

    }


    if (days < 7) {

      return `${days} days ago`;

    }


    return created.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  };


  /* ========================================
     MARK ONE AS READ
  ======================================== */

  const markAsRead =
    async (id) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await axios.put(
          `${API_BASE_URL}/notifications/${id}/read`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>

                notification.id === id

                  ? {
                      ...notification,
                      is_read: true,
                    }

                  : notification
            )
        );


      } catch (readError) {

        console.error(
          "Mark notification error:",
          readError
        );


        setError(
          readError.response?.data?.error ||
          "Failed to mark notification as read."
        );

      }

    };


  /* ========================================
     MARK ALL AS READ
  ======================================== */

  const markAllAsRead =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await axios.put(
          `${API_BASE_URL}/notifications/read-all`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                is_read: true,
              })
            )
        );


      } catch (readError) {

        console.error(
          "Mark all notifications error:",
          readError
        );


        setError(
          readError.response?.data?.error ||
          "Failed to mark all notifications as read."
        );

      }

    };


  /* ========================================
     COUNTS
  ======================================== */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  const readCount =
    notifications.length -
    unreadCount;


  const readPercentage =
    notifications.length > 0
      ? Math.round(
          (
            readCount /
            notifications.length
          ) *
          100
        )
      : 100;


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const filteredNotifications =
    useMemo(() => {

      return notifications.filter(
        (notification) => {

          const search =
            searchTerm
              .trim()
              .toLowerCase();


          const title =
            notification.title ||
            "";

          const message =
            notification.message ||
            "";

          const category =
            notification.category ||
            "";


          const matchesSearch =

            title
              .toLowerCase()
              .includes(search) ||

            message
              .toLowerCase()
              .includes(search) ||

            category
              .toLowerCase()
              .includes(search);


          let matchesFilter =
            true;


          if (
            filter === "unread"
          ) {

            matchesFilter =
              !notification.is_read;

          }


          if (
            filter === "read"
          ) {

            matchesFilter =
              notification.is_read;

          }


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      notifications,
      searchTerm,
      filter,
    ]);


  return (

    <div className="notifications-page">


      {/* ====================================
          CAMPUS PULSE
      ==================================== */}

      <section className="notification-pulse">


        <div className="notification-pulse-main">


          <div className="pulse-brand-row">


            <div className="pulse-brand-icon">

              <Bell
                size={24}
              />

            </div>


            <div>

              <div className="pulse-eyebrow">

                <Sparkles
                  size={12}
                />

                CAMPUS PULSE

              </div>


              <h1>
                Your Academic Inbox
              </h1>

            </div>

          </div>


          <p className="pulse-description">

            Keep track of assignments,
            grades, course updates and
            important reminders without
            missing what matters.

          </p>


          <div className="pulse-status-row">


            <div className="pulse-status-item">

              <Bell
                size={14}
              />

              <strong>
                {notifications.length}
              </strong>

              <span>
                Total
              </span>

            </div>


            <div className="pulse-status-item">

              <MailOpen
                size={14}
              />

              <strong>
                {unreadCount}
              </strong>

              <span>
                Unread
              </span>

            </div>


            <div className="pulse-status-item">

              <CircleCheck
                size={14}
              />

              <strong>
                {readCount}
              </strong>

              <span>
                Read
              </span>

            </div>

          </div>

        </div>


        {/* INBOX HEALTH */}

        <div className="inbox-health-card">


          <div className="health-card-top">


            <div>

              <span>
                INBOX STATUS
              </span>

              <h2>

                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} ${
                      unreadCount === 1
                        ? "update"
                        : "updates"
                    } waiting`}

              </h2>

            </div>


            <div className="health-bolt">

              <Zap
                size={17}
              />

            </div>

          </div>


          <div
            className="health-progress-ring"
            style={{
              "--health-progress":
                `${readPercentage * 3.6}deg`,
            }}
          >

            <div className="health-progress-inner">

              <strong>
                {readPercentage}%
              </strong>

              <span>
                REVIEWED
              </span>

            </div>

          </div>


          <p>

            {unreadCount === 0
              ? "Your academic activity inbox is clear."
              : "Review your unread academic updates when you have a moment."}

          </p>


          {unreadCount > 0 && (

            <button
              type="button"
              className="health-mark-all"
              onClick={
                markAllAsRead
              }
            >

              <CheckCheck
                size={14}
              />

              Mark everything as read

            </button>

          )}

        </div>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (

        <div className="notifications-error">

          {error}

        </div>

      )}


      {/* ====================================
          ACTIVITY NAVIGATOR
      ==================================== */}

      <section className="activity-navigator">


        <div className="activity-navigator-label">


          <div>

            <Activity
              size={18}
            />

          </div>


          <span>

            <strong>
              Activity Finder
            </strong>

            Search your academic updates

          </span>

        </div>


        <div className="notification-search">

          <Search
            size={17}
          />


          <input
            type="text"
            placeholder="Search notifications, grades or assignments..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          className="notification-filter"
          value={filter}
          onChange={(event) =>
            setFilter(
              event.target.value
            )
          }
        >

          <option value="all">
            All Activity
          </option>

          <option value="unread">
            Unread
          </option>

          <option value="read">
            Read
          </option>

        </select>

      </section>


      {/* ====================================
          FEED HEADING
      ==================================== */}

      <section className="activity-feed-heading">


        <div>

          <span>

            <Inbox
              size={13}
            />

            ACTIVITY STREAM

          </span>


          <h2>
            Latest Updates
          </h2>


          <p>

            Your academic notifications
            appear here as they happen.

          </p>

        </div>


        <div className="activity-feed-count">

          {filteredNotifications.length}{" "}

          {filteredNotifications.length === 1
            ? "update"
            : "updates"}

        </div>

      </section>


      {/* ====================================
          NOTIFICATION FEED
      ==================================== */}

      <section className="notifications-list">


        {loading ? (

          <div className="notifications-empty">


            <div className="notification-radar">

              <div className="radar-ring radar-ring-one" />

              <div className="radar-ring radar-ring-two" />


              <div className="notifications-empty-icon">

                <Bell
                  size={27}
                />

              </div>

            </div>


            <span>
              CAMPUS PULSE
            </span>


            <h3>
              Loading your updates...
            </h3>


            <p>

              Checking your academic
              activity feed.

            </p>

          </div>

        ) : filteredNotifications.length === 0 ? (

          <div className="notifications-empty">


            <div className="notification-radar">

              <div className="radar-ring radar-ring-one" />

              <div className="radar-ring radar-ring-two" />


              <div className="notifications-empty-icon">

                <Bell
                  size={27}
                />

              </div>

            </div>


            <span>
              INBOX CLEAR
            </span>


            <h3>

              {notifications.length === 0
                ? "Nothing needs your attention"
                : "No matching updates"}

            </h3>


            <p>

              {notifications.length === 0
                ? "When lecturers post grades, assignments or academic updates, they will appear here."
                : "Try another search term or change your activity filter."}

            </p>

          </div>

        ) : (

          filteredNotifications.map(
            (notification) => {

              const type =
                notification.type ||
                "system";


              const Icon =
                getTypeIcon(
                  type
                );


              const unread =
                !notification.is_read;


              return (

                <article
                  key={
                    notification.id
                  }
                  className={
                    `notification-item ${
                      unread
                        ? "notification-item-unread"
                        : ""
                    }`
                  }
                >


                  {/* TIMELINE */}

                  <div className="notification-timeline">


                    <div
                      className={
                        `notification-item-icon notification-type-${type}`
                      }
                    >

                      <Icon
                        size={19}
                      />

                    </div>


                    <div className="notification-line" />

                  </div>


                  {/* CONTENT */}

                  <div className="notification-item-content">


                    <div className="notification-card-top">


                      <div className="notification-category-row">


                        <span
                          className={
                            `notification-type-label notification-label-${type}`
                          }
                        >

                          {getTypeLabel(
                            type
                          )}

                        </span>


                        {unread && (

                          <span className="notification-new-label">

                            NEW

                          </span>

                        )}

                      </div>


                      <span className="notification-time">

                        <Clock3
                          size={11}
                        />

                        {getRelativeTime(
                          notification.created_at
                        )}

                      </span>

                    </div>


                    <div className="notification-title-row">

                      <h3>

                        {notification.title}

                      </h3>


                      {unread && (

                        <span className="notification-unread-dot" />

                      )}

                    </div>


                    <p className="notification-message">

                      {notification.message}

                    </p>


                    <div className="notification-meta">


                      {notification.category && (

                        <span>

                          <Sparkles
                            size={10}
                          />

                          {
                            notification.category
                          }

                        </span>

                      )}


                      <span>

                        {unread
                          ? "Needs review"
                          : "Reviewed"}

                      </span>

                    </div>

                  </div>


                  {/* ACTION */}

                  <div className="notification-item-action">


                    {unread ? (

                      <button
                        type="button"
                        className="notification-read-button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >

                        <CircleCheck
                          size={15}
                        />

                        Mark as read

                      </button>

                    ) : (

                      <div className="notification-read-state">

                        <CheckCheck
                          size={14}
                        />

                        Read

                      </div>

                    )}

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


export default Notifications;