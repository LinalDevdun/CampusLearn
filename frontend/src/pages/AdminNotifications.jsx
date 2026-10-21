import {
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Search,
  CheckCheck,
  ShieldCheck,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

import "../styles/AdminNotifications.css";


function AdminNotifications() {

  /* ========================================
     TEMPORARY NOTIFICATION DATA

     We will replace this with backend data
     in the next step.
  ======================================== */

  const [
    notifications,
    setNotifications,
  ] = useState([
    {
      id: 1,
      type: "user",
      title: "New Student Account",
      message:
        "A new student account has been created and added to CampusLearn.",
      category: "User Management",
      time: "10 minutes ago",
      is_read: false,
    },

    {
      id: 2,
      type: "course",
      title: "New Course Created",
      message:
        "A new course has been added to the learning platform.",
      category: "Courses",
      time: "35 minutes ago",
      is_read: false,
    },

    {
      id: 3,
      type: "assignment",
      title: "Assignment Published",
      message:
        "A lecturer has published a new assignment for students.",
      category: "Academic",
      time: "1 hour ago",
      is_read: false,
    },

    {
      id: 4,
      type: "system",
      title: "System Running Normally",
      message:
        "All core CampusLearn services are currently operational.",
      category: "System",
      time: "2 hours ago",
      is_read: false,
    },

    {
      id: 5,
      type: "warning",
      title: "Administrative Review",
      message:
        "There are recent platform activities that may require administrator review.",
      category: "System Alert",
      time: "3 hours ago",
      is_read: false,
    },
  ]);


  /* ========================================
     SEARCH + FILTER
  ======================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState("all");


  /* ========================================
     COUNTS
  ======================================== */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  const readCount =
    notifications.filter(
      (notification) =>
        notification.is_read
    ).length;


  /* ========================================
     FILTERED NOTIFICATIONS
  ======================================== */

  const filteredNotifications =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return notifications.filter(
        (notification) => {

          const matchesSearch =
            notification.title
              .toLowerCase()
              .includes(search) ||

            notification.message
              .toLowerCase()
              .includes(search) ||

            notification.category
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


  /* ========================================
     MARK ONE AS READ
  ======================================== */

  const markAsRead =
    (notificationId) => {

      setNotifications(
        (previous) =>
          previous.map(
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

    };


  /* ========================================
     MARK ALL AS READ
  ======================================== */

  const markAllAsRead =
    () => {

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

    };


  /* ========================================
     NOTIFICATION ICON
  ======================================== */

  const getNotificationIcon =
    (type) => {

      switch (type) {

        case "user":
          return (
            <UserPlus size={19} />
          );

        case "course":
          return (
            <BookOpen size={19} />
          );

        case "assignment":
          return (
            <ClipboardCheck
              size={19}
            />
          );

        case "warning":
          return (
            <AlertTriangle
              size={19}
            />
          );

        case "system":
          return (
            <ShieldCheck
              size={19}
            />
          );

        default:
          return (
            <Info size={19} />
          );

      }

    };


  return (

    <div className="admin-notifications-page">


      {/* ====================================
          HEADER
      ==================================== */}

      <section className="admin-notifications-header">

        <div>

          <div className="admin-notifications-eyebrow">

            <Bell size={14} />

            ADMIN ACTIVITY CENTER

          </div>


          <h1>
            Notifications
          </h1>


          <p>
            Monitor important account,
            academic and platform activity
            across CampusLearn.
          </p>

        </div>


        <div className="admin-notifications-header-actions">

          <div className="admin-unread-badge">

            <Bell size={16} />

            {unreadCount} Unread

          </div>


          {unreadCount > 0 && (

            <button
              type="button"
              className="admin-mark-all-button"
              onClick={
                markAllAsRead
              }
            >

              <CheckCheck
                size={16}
              />

              Mark all as read

            </button>

          )}

        </div>

      </section>



      {/* ====================================
          SUMMARY CARDS
      ==================================== */}

      <section className="admin-notification-summary">


        <div className="admin-notification-summary-card">

          <div className="admin-summary-icon admin-summary-teal">

            <Bell size={21} />

          </div>


          <div>

            <span>
              Total Notifications
            </span>

            <strong>
              {notifications.length}
            </strong>

          </div>

        </div>



        <div className="admin-notification-summary-card">

          <div className="admin-summary-icon admin-summary-orange">

            <Info size={21} />

          </div>


          <div>

            <span>
              Unread
            </span>

            <strong>
              {unreadCount}
            </strong>

          </div>

        </div>



        <div className="admin-notification-summary-card">

          <div className="admin-summary-icon admin-summary-green">

            <CheckCircle2
              size={21}
            />

          </div>


          <div>

            <span>
              Read
            </span>

            <strong>
              {readCount}
            </strong>

          </div>

        </div>


      </section>



      {/* ====================================
          CONTENT
      ==================================== */}

      <section className="admin-notification-panel">


        {/* TOP */}

        <div className="admin-notification-panel-top">


          <div>

            <h2>
              Recent Activity
            </h2>

            <p>
              Latest administrative and
              platform notifications.
            </p>

          </div>



          <div className="admin-notification-controls">


            {/* SEARCH */}

            <div className="admin-notification-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search notifications..."
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


            {/* FILTER */}

            <div className="admin-notification-filters">

              <button
                type="button"
                className={
                  filter === "all"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </button>


              <button
                type="button"
                className={
                  filter === "unread"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("unread")
                }
              >
                Unread
              </button>


              <button
                type="button"
                className={
                  filter === "read"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("read")
                }
              >
                Read
              </button>

            </div>

          </div>

        </div>



        {/* ====================================
            NOTIFICATION LIST
        ==================================== */}

        <div className="admin-notification-list">


          {filteredNotifications.length >
          0 ? (

            filteredNotifications.map(
              (notification) => (

                <div
                  key={
                    notification.id
                  }
                  className={
                    notification.is_read
                      ? "admin-notification-item"
                      : "admin-notification-item admin-notification-unread"
                  }
                >


                  <div
                    className={`admin-notification-type-icon ${notification.type}`}
                  >

                    {getNotificationIcon(
                      notification.type
                    )}

                  </div>



                  <div className="admin-notification-content">

                    <div className="admin-notification-title-row">

                      <div>

                        <h3>
                          {
                            notification.title
                          }
                        </h3>

                        <span className="admin-notification-category">

                          {
                            notification.category
                          }

                        </span>

                      </div>


                      <span className="admin-notification-time">

                        {
                          notification.time
                        }

                      </span>

                    </div>



                    <p>
                      {
                        notification.message
                      }
                    </p>



                    {!notification.is_read && (

                      <button
                        type="button"
                        className="admin-notification-read-button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >

                        <CheckCheck
                          size={14}
                        />

                        Mark as read

                      </button>

                    )}

                  </div>



                  {!notification.is_read && (

                    <div className="admin-unread-dot" />

                  )}


                </div>

              )
            )

          ) : (

            <div className="admin-notifications-empty">

              <div>

                <Bell size={28} />

              </div>


              <h3>
                No notifications found
              </h3>


              <p>
                There are no notifications
                matching your current search
                or filter.
              </p>

            </div>

          )}


        </div>

      </section>

    </div>

  );

}


export default AdminNotifications;