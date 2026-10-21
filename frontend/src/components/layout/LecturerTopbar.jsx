import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Bell,
  Search,
  ChevronDown,
  Plus,
  User,
  Settings,
  LockKeyhole,
  LogOut,
  BookOpen,
  ClipboardPlus,
  LayoutDashboard,
  FileCheck2,
  GraduationCap,
  Users,
  Sparkles,
  BellRing,
  ArrowUpRight,
} from "lucide-react";

import "../../styles/lecturerTopbarSearch.css";

import API_BASE_URL from "../../config/api";


/* ========================================
   PROFILE IMAGE URL
======================================== */

const getProfileImageUrl = (
  profileImage
) => {

  if (!profileImage) {
    return "";
  }


  if (
    profileImage.startsWith(
      "http://"
    ) ||
    profileImage.startsWith(
      "https://"
    ) ||
    profileImage.startsWith(
      "data:"
    ) ||
    profileImage.startsWith(
      "blob:"
    )
  ) {

    return profileImage;

  }


  const cleanPath =
    profileImage
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");


  return `${API_BASE_URL}/${cleanPath}`;

};


function LecturerTopbar() {

  const navigate =
    useNavigate();


  const profileRef =
    useRef(null);

  const searchRef =
    useRef(null);


  /* ========================================
     STATE
  ======================================== */

  const [lecturer, setLecturer] =
    useState({
      name: "Lecturer User",
      email: "",
      role: "LECTURER",
      profile_image: "",
    });


  const [
    notificationCount,
    setNotificationCount,
  ] = useState(0);


  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);


  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);


  /* ========================================
     SEARCH STATE
  ======================================== */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);


  /* ========================================
     LECTURER SEARCH ITEMS
  ======================================== */

  const lecturerSearchItems = [

    {
      title: "Dashboard",
      description:
        "Teaching overview and lecturer workspace",
      keywords:
        "dashboard home overview teaching workspace",
      path:
        "/lecturer-dashboard",
      icon:
        LayoutDashboard,
    },

    {
      title: "My Courses",
      description:
        "View and manage your assigned courses",
      keywords:
        "course courses modules subjects classes teaching",
      path:
        "/lecturer/courses",
      icon:
        BookOpen,
    },

    {
      title: "Assignments",
      description:
        "Create and manage academic assignments",
      keywords:
        "assignment assignments coursework assessment create",
      path:
        "/lecturer/assignments",
      icon:
        ClipboardPlus,
    },

    {
      title: "Submissions",
      description:
        "Review student coursework submissions",
      keywords:
        "submission submissions coursework student review files",
      path:
        "/lecturer/submissions",
      icon:
        FileCheck2,
    },

    {
      title: "Grading",
      description:
        "Grade submissions and provide feedback",
      keywords:
        "grading grade marks score feedback results assessment",
      path:
        "/lecturer/grading",
      icon:
        GraduationCap,
    },

    {
      title: "Students",
      description:
        "View students across your courses",
      keywords:
        "student students learners class roster degree batch",
      path:
        "/lecturer/students",
      icon:
        Users,
    },

    {
      title: "AI Teaching Assistant",
      description:
        "Create lessons, quizzes, rubrics and teaching content",
      keywords:
        "ai teaching assistant tutor artificial intelligence lesson quiz rubric",
      path:
        "/lecturer/tutor",
      icon:
        Sparkles,
    },

    {
      title: "Notifications",
      description:
        "View lecturer alerts and academic activity",
      keywords:
        "notification notifications bell alerts activity reminders",
      path:
        "/lecturer/notifications",
      icon:
        BellRing,
    },

    {
      title: "My Profile",
      description:
        "View your lecturer account information",
      keywords:
        "profile account lecturer personal information email",
      path:
        "/lecturer/profile",
      icon:
        User,
    },

    {
      title: "Settings",
      description:
        "Manage notification and lecturer preferences",
      keywords:
        "settings preferences notifications email alerts reminders",
      path:
        "/lecturer/settings",
      icon:
        Settings,
    },

    {
      title: "Change Password",
      description:
        "Update your CampusLearn account password",
      keywords:
        "password security secure account change password",
      path:
        "/lecturer/change-password",
      icon:
        LockKeyhole,
    },

  ];


  /* ========================================
     SEARCH RESULTS
  ======================================== */

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();


  const filteredSearchItems =
    normalizedSearch
      ? lecturerSearchItems.filter(
          (item) => {

            return (

              item.title
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||

              item.description
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||

              item.keywords
                .toLowerCase()
                .includes(
                  normalizedSearch
                )

            );

          }
        )
      : [];


  /* ========================================
     OPEN SEARCH RESULT
  ======================================== */

  const openSearchResult =
    (item) => {

      navigate(
        item.path
      );


      setSearchQuery("");

      setSearchOpen(false);

      setProfileOpen(false);

      setCreateOpen(false);

    };


  /* ========================================
     SEARCH KEYBOARD
  ======================================== */

  const handleSearchKeyDown =
    (event) => {

      if (
        event.key === "Escape"
      ) {

        setSearchOpen(false);

        return;

      }


      if (
        event.key === "Enter" &&
        filteredSearchItems.length > 0
      ) {

        event.preventDefault();

        openSearchResult(
          filteredSearchItems[0]
        );

      }

    };


  /* ========================================
     LOAD TOPBAR DATA
  ======================================== */

  useEffect(() => {

    const loadTopbarData =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );


          if (!token) {

            navigate(
              "/login"
            );

            return;

          }


          const headers = {

            Authorization:
              `Bearer ${token}`,

          };


          /* =================================
             PROFILE
          ================================= */

          const profileResponse =
            await axios.get(
              `${API_BASE_URL}/me`,
              {
                headers,
              }
            );


          setLecturer(
            profileResponse.data
          );


          /* =================================
             LECTURER SETTINGS
          ================================= */

          const settingsResponse =
            await axios.get(
              `${API_BASE_URL}/user/settings`,
              {
                headers,
              }
            );


          /*
            Keep the existing settings
            request and behaviour.
          */

          const submissionAlertsEnabled =
            settingsResponse.data
              ?.submission_alerts !== false;


          void submissionAlertsEnabled;


          /* =================================
             LECTURER NOTIFICATIONS
          ================================= */

          const notificationsResponse =
            await axios.get(
              `${API_BASE_URL}/lecturer/notifications`,
              {
                headers,
              }
            );


          const lecturerNotifications =
            Array.isArray(
              notificationsResponse.data
            )
              ? notificationsResponse.data
              : [];


          const unreadCount =
            lecturerNotifications.filter(
              (notification) =>
                notification.is_read === false
            ).length;


          setNotificationCount(
            unreadCount
          );


        } catch (error) {

          console.error(
            "Failed to load lecturer topbar:",
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


            navigate(
              "/login"
            );

          }

        }

      };


    loadTopbarData();

  }, [navigate]);


  /* ========================================
     LIVE PROFILE IMAGE UPDATE
  ======================================== */

  useEffect(() => {

    const handleProfileImageUpdate =
      (event) => {

        const updatedProfileImage =
          typeof event.detail ===
          "string"
            ? event.detail
            : event.detail
                ?.profile_image;


        if (
          updatedProfileImage ===
          undefined
        ) {

          return;

        }


        setLecturer(
          (previousLecturer) => ({

            ...previousLecturer,

            profile_image:
              updatedProfileImage,

          })
        );

      };


    window.addEventListener(
      "lecturer-profile-image-updated",
      handleProfileImageUpdate
    );


    return () => {

      window.removeEventListener(
        "lecturer-profile-image-updated",
        handleProfileImageUpdate
      );

    };

  }, []);


  /* ========================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ======================================== */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {


        /* PROFILE */

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(
            false
          );

        }


        /* SEARCH */

        if (
          searchRef.current &&
          !searchRef.current.contains(
            event.target
          )
        ) {

          setSearchOpen(
            false
          );

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  /* ========================================
     INITIALS
  ======================================== */

  const getInitials =
    (name) => {

      if (!name) {

        return "LE";

      }


      return name

        .split(" ")

        .filter(Boolean)

        .map(
          (word) =>
            word.charAt(0)
        )

        .join("")

        .slice(0, 2)

        .toUpperCase();

    };


  const initials =
    getInitials(
      lecturer.name
    );


  /* ========================================
     PROFILE IMAGE
  ======================================== */

  const profileImageUrl =
    getProfileImageUrl(
      lecturer.profile_image
    );


  /* ========================================
     LOGOUT
  ======================================== */

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );


    navigate(
      "/login"
    );

  };


  /* ========================================
     UI
  ======================================== */

  return (

    <header
      className="lecturer-topbar"
    >


      {/* =================================
          SEARCH
      ================================= */}

      <div
        className="lecturer-search-wrapper"
        ref={searchRef}
      >


        <div
          className={
            searchOpen
              ? "lecturer-search lecturer-search-active"
              : "lecturer-search"
          }
        >


          <Search
            size={18}
          />


          <input
            type="text"
            value={searchQuery}
            placeholder="Search pages, teaching tools and settings..."
            onChange={(event) => {

              const value =
                event.target.value;


              setSearchQuery(
                value
              );


              setSearchOpen(
                Boolean(
                  value.trim()
                )
              );


              setProfileOpen(
                false
              );

              setCreateOpen(
                false
              );

            }}
            onFocus={() => {

              if (
                searchQuery.trim()
              ) {

                setSearchOpen(
                  true
                );

              }

            }}
            onKeyDown={
              handleSearchKeyDown
            }
          />


        </div>


        {/* SEARCH DROPDOWN */}

        {searchOpen &&
          searchQuery.trim() && (

          <div className="lecturer-search-dropdown">


            <div className="lecturer-search-dropdown-header">


              <span>
                SEARCH RESULTS
              </span>


              <strong>

                {
                  filteredSearchItems
                    .length
                }{" "}

                {
                  filteredSearchItems
                    .length === 1
                    ? "result"
                    : "results"
                }

              </strong>


            </div>


            {filteredSearchItems.length >
            0 ? (

              <div className="lecturer-search-results">


                {filteredSearchItems.map(
                  (item) => {

                    const Icon =
                      item.icon;


                    return (

                      <button
                        key={item.path}
                        type="button"
                        className="lecturer-search-result"
                        onClick={() =>
                          openSearchResult(
                            item
                          )
                        }
                      >


                        <div className="lecturer-search-result-icon">

                          <Icon
                            size={16}
                          />

                        </div>


                        <div className="lecturer-search-result-content">

                          <strong>
                            {item.title}
                          </strong>

                          <span>
                            {
                              item.description
                            }
                          </span>

                        </div>


                        <div className="lecturer-search-result-open">

                          <span>
                            Open
                          </span>

                          <ArrowUpRight
                            size={12}
                          />

                        </div>


                      </button>

                    );

                  }
                )}


              </div>

            ) : (

              <div className="lecturer-search-empty">


                <div className="lecturer-search-empty-icon">

                  <Search
                    size={19}
                  />

                </div>


                <strong>
                  No results found
                </strong>


                <span>
                  Try searching for courses,
                  grading, students,
                  notifications or settings.
                </span>


              </div>

            )}


            {filteredSearchItems.length >
              0 && (

              <div className="lecturer-search-hint">

                <span>
                  Press Enter to open the
                  first result
                </span>

                <span>
                  Esc to close
                </span>

              </div>

            )}


          </div>

        )}


      </div>


      {/* =================================
          RIGHT SIDE
      ================================= */}

      <div
        className="lecturer-topbar-actions"
      >


        {/* =================================
            CREATE
        ================================= */}

        <div
          className="lecturer-create-wrapper"
        >


          <button
            className="lecturer-create-button"
            type="button"
            onClick={() => {

              setCreateOpen(
                (previous) =>
                  !previous
              );


              setProfileOpen(
                false
              );


              setSearchOpen(
                false
              );

            }}
          >

            <Plus
              size={16}
            />

            Create

          </button>


          {createOpen && (

            <div
              className="lecturer-create-dropdown"
            >


              {/* CREATE COURSE */}

              <button
                type="button"
                onClick={() => {

                  setCreateOpen(
                    false
                  );


                  navigate(
                    "/lecturer/courses",
                    {
                      state: {
                        openCreateCourse:
                          true,
                      },
                    }
                  );

                }}
              >

                <div
                  className="lecturer-create-dropdown-icon"
                >

                  <BookOpen
                    size={17}
                  />

                </div>


                <div>

                  <strong>
                    Create Course
                  </strong>

                  <span>
                    Add a new teaching course
                  </span>

                </div>

              </button>


              {/* CREATE ASSIGNMENT */}

              <button
                type="button"
                onClick={() => {

                  setCreateOpen(
                    false
                  );


                  navigate(
                    "/lecturer/assignments",
                    {
                      state: {
                        openCreateAssignment:
                          true,
                      },
                    }
                  );

                }}
              >

                <div
                  className="lecturer-create-dropdown-icon"
                >

                  <ClipboardPlus
                    size={17}
                  />

                </div>


                <div>

                  <strong>
                    Create Assignment
                  </strong>

                  <span>
                    Publish new coursework
                  </span>

                </div>

              </button>


            </div>

          )}


        </div>


        {/* =================================
            NOTIFICATIONS
        ================================= */}

        <button
          className="lecturer-notification-button"
          type="button"
          onClick={() => {

            setSearchOpen(
              false
            );

            setProfileOpen(
              false
            );

            setCreateOpen(
              false
            );


            navigate(
              "/lecturer/notifications"
            );

          }}
          title="Notifications"
        >

          <Bell
            size={19}
          />


          {notificationCount > 0 && (

            <span>
              {notificationCount}
            </span>

          )}

        </button>


        {/* =================================
            PROFILE
        ================================= */}

        <div
          className="lecturer-profile-wrapper"
          ref={profileRef}
        >


          <button
            className="lecturer-profile"
            type="button"
            onClick={() => {

              setProfileOpen(
                (previous) =>
                  !previous
              );


              setCreateOpen(
                false
              );


              setSearchOpen(
                false
              );

            }}
          >


            {/* TOPBAR AVATAR */}

            <div
              className="lecturer-top-avatar"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >

              <span>
                {initials}
              </span>


              {profileImageUrl && (

                <img
                  src={
                    profileImageUrl
                  }
                  alt={`${lecturer.name || "Lecturer"} profile`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(event) => {

                    event.currentTarget.style.display =
                      "none";

                  }}
                />

              )}

            </div>


            <div
              className="lecturer-profile-details"
            >

              <strong>
                {lecturer.name}
              </strong>

              <span>
                Lecturer
              </span>

            </div>


            <ChevronDown
              size={16}
              className={
                profileOpen
                  ? "lecturer-profile-arrow lecturer-profile-arrow-open"
                  : "lecturer-profile-arrow"
              }
            />


          </button>


          {/* =================================
              PROFILE DROPDOWN
          ================================= */}

          {profileOpen && (

            <div
              className="lecturer-profile-dropdown"
            >


              {/* HEADER */}

              <div
                className="lecturer-dropdown-header"
              >


                {/* DROPDOWN AVATAR */}

                <div
                  className="lecturer-dropdown-avatar"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >

                  <span>
                    {initials}
                  </span>


                  {profileImageUrl && (

                    <img
                      src={
                        profileImageUrl
                      }
                      alt={`${lecturer.name || "Lecturer"} profile`}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(event) => {

                        event.currentTarget.style.display =
                          "none";

                      }}
                    />

                  )}

                </div>


                <div>

                  <strong>
                    {lecturer.name}
                  </strong>

                  <span>
                    {lecturer.email}
                  </span>

                </div>


              </div>


              {/* MENU */}

              <div
                className="lecturer-dropdown-menu"
              >


                {/* MY PROFILE */}

                <button
                  type="button"
                  onClick={() => {

                    setProfileOpen(
                      false
                    );


                    navigate(
                      "/lecturer/profile"
                    );

                  }}
                >

                  <User
                    size={16}
                  />

                  My Profile

                </button>


                {/* SETTINGS */}

                <button
                  type="button"
                  onClick={() => {

                    setProfileOpen(
                      false
                    );


                    navigate(
                      "/lecturer/settings"
                    );

                  }}
                >

                  <Settings
                    size={16}
                  />

                  Settings

                </button>


                {/* CHANGE PASSWORD */}

                <button
                  type="button"
                  onClick={() => {

                    setProfileOpen(
                      false
                    );


                    navigate(
                      "/lecturer/change-password"
                    );

                  }}
                >

                  <LockKeyhole
                    size={16}
                  />

                  Change Password

                </button>


              </div>


              {/* LOGOUT */}

              <div
                className="lecturer-dropdown-footer"
              >

                <button
                  type="button"
                  className="lecturer-dropdown-logout"
                  onClick={
                    handleLogout
                  }
                >

                  <LogOut
                    size={16}
                  />

                  Log out

                </button>

              </div>


            </div>

          )}


        </div>


      </div>


    </header>

  );

}


export default LecturerTopbar;