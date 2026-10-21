import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Bell,
  Sparkles,
  Inbox,
  ClipboardCheck,
  GraduationCap,
  CalendarClock,
  CheckCheck,
  SlidersHorizontal,
} from "lucide-react";

import "../styles/lecturerNotifications.css";

import API_BASE_URL from "../config/api";


function LecturerNotifications() {

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================
     FILTERS
  ======================================== */

  const filters = [
    {
      key: "all",
      label: "All Activity",
      icon: Inbox,
    },
    {
      key: "submission",
      label: "Submissions",
      icon: ClipboardCheck,
    },
    {
      key: "grading",
      label: "Grading",
      icon: GraduationCap,
    },
    {
      key: "academic",
      label: "Academic",
      icon: CalendarClock,
    },
  ];


  /* ========================================
     LOAD LECTURER NOTIFICATIONS
  ======================================== */

  const fetchNotifications =
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
            `${API_BASE_URL}/lecturer/notifications`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        setNotifications(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );


      } catch (error) {

        console.error(
          "Failed to load lecturer notifications:",
          error
        );


        setError(
          error.response?.data?.error ||
          "Failed to load notifications."
        );


      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    fetchNotifications();

  }, []);


  /* ========================================
     MARK ONE AS READ
  ======================================== */

  const markAsRead =
    async (notificationId) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await axios.put(
          `${API_BASE_URL}/lecturer/notifications/${notificationId}/read`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      is_read: true,
                    }
                  : notification
            )
        );


      } catch (error) {

        console.error(
          "Failed to mark notification as read:",
          error
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
          `${API_BASE_URL}/lecturer/notifications/read-all`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                is_read: true,
              })
            )
        );


      } catch (error) {

        console.error(
          "Failed to mark all notifications as read:",
          error
        );

      }

    };


  /* ========================================
     FILTERED NOTIFICATIONS
  ======================================== */

  const filteredNotifications =
    useMemo(() => {

      if (
        activeFilter === "all"
      ) {

        return notifications;

      }


      return notifications.filter(
        (notification) =>
          notification.type ===
          activeFilter
      );


    }, [
      activeFilter,
      notifications,
    ]);


  /* ========================================
     COUNTS
  ======================================== */

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.is_read ===
        false
    ).length;


  const submissionCount =
    notifications.filter(
      (notification) =>
        notification.type ===
        "submission"
    ).length;


  const gradingCount =
    notifications.filter(
      (notification) =>
        notification.type ===
        "grading"
    ).length;


  /* ========================================
     FORMAT DATE
  ======================================== */

  const formatDate =
    (dateValue) => {

      if (!dateValue) {
        return "";
      }


      return new Date(
        dateValue
      ).toLocaleString();

    };


  return (

    <div className="lecturer-notifications-page">


      {/* ====================================
          HERO
      ==================================== */}

      <section className="ln-hero">


        <div className="ln-hero-content">


          <div className="ln-hero-icon">

            <Bell size={25} />

          </div>


          <div>

            <div className="ln-eyebrow">

              <Sparkles size={12} />

              LECTURER ACTIVITY CENTER

            </div>


            <h1>
              Stay in the loop.
            </h1>


            <p>
              Track student submissions,
              grading activity and important
              academic updates from one place.
            </p>

          </div>


        </div>


        <div className="ln-hero-status">


          <div className="ln-status-icon">

            <CheckCheck size={20} />

          </div>


          <div>

            <span>
              UNREAD ACTIVITY
            </span>

            <strong>
              {unreadCount}
            </strong>

            <small>
              notifications waiting
            </small>

          </div>


        </div>


      </section>


      {/* ====================================
          ACTIVITY OVERVIEW
      ==================================== */}

      <section className="ln-overview">


        <div className="ln-overview-item">


          <div className="ln-overview-icon ln-overview-blue">

            <Inbox size={19} />

          </div>


          <div>

            <span>
              TOTAL
            </span>

            <strong>
              {notifications.length}
            </strong>

            <small>
              notifications
            </small>

          </div>


        </div>


        <div className="ln-overview-divider" />


        <div className="ln-overview-item">


          <div className="ln-overview-icon ln-overview-purple">

            <ClipboardCheck size={19} />

          </div>


          <div>

            <span>
              SUBMISSIONS
            </span>

            <strong>
              {submissionCount}
            </strong>

            <small>
              student activity
            </small>

          </div>


        </div>


        <div className="ln-overview-divider" />


        <div className="ln-overview-item">


          <div className="ln-overview-icon ln-overview-green">

            <GraduationCap size={19} />

          </div>


          <div>

            <span>
              GRADING
            </span>

            <strong>
              {gradingCount}
            </strong>

            <small>
              grading updates
            </small>

          </div>


        </div>


      </section>


      {/* ====================================
          NOTIFICATION WORKSPACE
      ==================================== */}

      <section className="ln-workspace">


        <div className="ln-workspace-header">


          <div>

            <span>
              ACTIVITY INBOX
            </span>

            <h2>
              Your Notifications
            </h2>

            <p>
              Review the latest activity
              related to your lecturer account.
            </p>

          </div>


          <div className="ln-workspace-badge">

            <Bell size={14} />

            Lecturer Portal

          </div>


        </div>


        {/* ==================================
            FILTER BAR
        ================================== */}

        <div className="ln-filter-bar">


          <div className="ln-filter-title">

            <SlidersHorizontal
              size={15}
            />

            Filter activity

          </div>


          <div className="ln-filter-tabs">


            {filters.map(
              (filter) => {

                const Icon =
                  filter.icon;


                return (

                  <button
                    key={filter.key}
                    type="button"
                    className={
                      activeFilter ===
                      filter.key
                        ? "ln-filter-button ln-filter-button-active"
                        : "ln-filter-button"
                    }
                    onClick={() =>
                      setActiveFilter(
                        filter.key
                      )
                    }
                  >

                    <Icon size={14} />

                    {filter.label}

                  </button>

                );

              }
            )}


            {unreadCount > 0 && (

              <button
                type="button"
                className="ln-filter-button"
                onClick={
                  markAllAsRead
                }
              >

                <CheckCheck
                  size={14}
                />

                Mark all read

              </button>

            )}


          </div>


        </div>


        {/* ==================================
            CONTENT
        ================================== */}

        <div className="ln-content">


          {loading ? (

            <div className="ln-empty">

              <h2>
                Loading notifications...
              </h2>

            </div>

          ) : error ? (

            <div className="ln-empty">

              <h2>
                Unable to load notifications
              </h2>

              <p>
                {error}
              </p>

            </div>

          ) : filteredNotifications.length ===
          0 ? (

            <div className="ln-empty">


              <div className="ln-empty-visual">


                <div className="ln-empty-circle ln-empty-circle-one" />

                <div className="ln-empty-circle ln-empty-circle-two" />


                <div className="ln-empty-icon">

                  <Bell size={28} />

                </div>


                <div className="ln-empty-check">

                  <CheckCheck
                    size={14}
                  />

                </div>


              </div>


              <span className="ln-empty-eyebrow">

                ALL CAUGHT UP

              </span>


              <h2>
                Your notification inbox
                is clear
              </h2>


              <p>
                New student submissions,
                grading reminders and
                academic updates will appear
                here when they become
                available.
              </p>


            </div>

          ) : (

            <div className="ln-notification-list">


              {filteredNotifications.map(
                (notification) => (

                  <div
                    key={
                      notification.id
                    }
                    className={
                      notification.is_read
                        ? "ln-notification-card"
                        : "ln-notification-card ln-notification-unread"
                    }
                  >


                    <div className="ln-notification-card-icon">

                      {notification.type ===
                      "submission" ? (

                        <ClipboardCheck
                          size={19}
                        />

                      ) : notification.type ===
                        "grading" ? (

                        <GraduationCap
                          size={19}
                        />

                      ) : (

                        <CalendarClock
                          size={19}
                        />

                      )}

                    </div>


                    <div className="ln-notification-card-content">

                      <div>

                        <strong>
                          {
                            notification.title
                          }
                        </strong>


                        {!notification.is_read && (

                          <span>
                            NEW
                          </span>

                        )}

                      </div>


                      <p>
                        {
                          notification.message
                        }
                      </p>


                      <small>
                        {
                          formatDate(
                            notification.created_at
                          )
                        }
                      </small>

                    </div>


                    {!notification.is_read && (

                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >

                        <CheckCheck
                          size={14}
                        />

                        Mark read

                      </button>

                    )}


                  </div>

                )
              )}


            </div>

          )}


        </div>


      </section>


    </div>

  );

}


export default LecturerNotifications;