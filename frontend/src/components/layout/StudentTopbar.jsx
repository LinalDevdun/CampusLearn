import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LockKeyhole,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  ChartNoAxesCombined,
  GraduationCap,
  BrainCircuit,
  X,
} from "lucide-react";


/* ========================================
   STUDENT PORTAL SEARCH ITEMS
======================================== */

const studentSearchItems = [
  {
    title: "Dashboard",
    description: "Student learning overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: [
      "home",
      "overview",
      "dashboard",
      "student dashboard",
    ],
  },

  {
    title: "My Courses",
    description: "View your enrolled courses",
    path: "/my-courses",
    icon: BookOpen,
    keywords: [
      "courses",
      "modules",
      "subjects",
      "course",
      "learning materials",
    ],
  },

  {
    title: "Assignments",
    description: "View and submit coursework",
    path: "/assignments",
    icon: ClipboardList,
    keywords: [
      "assignment",
      "assignments",
      "coursework",
      "submit",
      "submission",
      "tasks",
    ],
  },

  {
    title: "Deadlines",
    description: "Check upcoming submission dates",
    path: "/deadlines",
    icon: CalendarDays,
    keywords: [
      "deadline",
      "deadlines",
      "due",
      "due date",
      "upcoming",
      "schedule",
    ],
  },

  {
    title: "Learning Progress",
    description: "Track coursework progress",
    path: "/progress",
    icon: ChartNoAxesCombined,
    keywords: [
      "progress",
      "learning progress",
      "completion",
      "performance",
    ],
  },

  {
    title: "Grades",
    description: "View marks and lecturer feedback",
    path: "/grades",
    icon: GraduationCap,
    keywords: [
      "grade",
      "grades",
      "marks",
      "results",
      "score",
      "feedback",
    ],
  },

  {
    title: "AI Study Tutor",
    description: "Get AI-powered study support",
    path: "/tutor",
    icon: BrainCircuit,
    keywords: [
      "ai",
      "tutor",
      "study tutor",
      "ai tutor",
      "help",
      "study",
      "assistant",
    ],
  },

  {
    title: "Notifications",
    description: "View academic updates",
    path: "/notifications",
    icon: Bell,
    keywords: [
      "notification",
      "notifications",
      "updates",
      "alerts",
      "messages",
    ],
  },

  {
    title: "My Profile",
    description: "View your student information",
    path: "/student/profile",
    icon: User,
    keywords: [
      "profile",
      "student profile",
      "account",
      "personal information",
    ],
  },

  {
    title: "Settings",
    description: "Manage account preferences",
    path: "/student/settings",
    icon: Settings,
    keywords: [
      "settings",
      "preferences",
      "notification settings",
      "account settings",
    ],
  },

  {
    title: "Change Password",
    description: "Update your account password",
    path: "/student/change-password",
    icon: LockKeyhole,
    keywords: [
      "password",
      "change password",
      "security",
      "account security",
    ],
  },
];


function StudentTopbar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================
     REFS
  ======================================== */

  const searchWrapperRef =
    useRef(null);

  const profileWrapperRef =
    useRef(null);


  /* ========================================
     SEARCH STATE
  ======================================== */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [searchOpen, setSearchOpen] =
    useState(false);


  /* ========================================
     PROFILE STATE
  ======================================== */

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [student, setStudent] =
    useState({
      name: "Student User",
      email: "",
      role: "STUDENT",
      degree: "",
      batch: "",
      profile_image: "",
    });


  /* ========================================
     HANDLE INVALID TOKEN
  ======================================== */

  const handleInvalidToken = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/login");
  };


  /* ========================================
     GET LOGGED-IN STUDENT
  ======================================== */

  useEffect(() => {

    const fetchStudent =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );


          if (!token) {

            handleInvalidToken();

            return;
          }


          const response =
            await axios.get(
              "http://localhost:5000/me",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          setStudent(
            response.data
          );

        } catch (error) {

          console.error(
            "Failed to load student profile:",
            error
          );


          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {

            handleInvalidToken();
          }
        }
      };


    fetchStudent();

  }, [navigate]);


  /* ========================================
     LIVE PROFILE IMAGE UPDATE
  ======================================== */

  useEffect(() => {

    const handleProfileImageUpdated =
      (event) => {

        setStudent(
          (previousStudent) => ({
            ...previousStudent,

            profile_image:
              event.detail?.profileImage ??
              previousStudent.profile_image,
          })
        );
      };


    window.addEventListener(
      "student-profile-image-updated",
      handleProfileImageUpdated
    );


    return () => {

      window.removeEventListener(
        "student-profile-image-updated",
        handleProfileImageUpdated
      );
    };

  }, []);


  /* ========================================
     GET REAL UNREAD NOTIFICATION COUNT
  ======================================== */

  useEffect(() => {

    const fetchUnreadNotifications =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );


          if (!token) {

            handleInvalidToken();

            return;
          }


          const response =
            await axios.get(
              "http://localhost:5000/notifications",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const notifications =
            Array.isArray(
              response.data
            )
              ? response.data
              : [];


          const unread =
            notifications.filter(
              (notification) =>
                !notification.is_read
            ).length;


          setUnreadCount(
            unread
          );

        } catch (error) {

          console.error(
            "Failed to load notification count:",
            error
          );


          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {

            handleInvalidToken();
          }
        }
      };


    fetchUnreadNotifications();


    const handleWindowFocus =
      () => {

        fetchUnreadNotifications();
      };


    window.addEventListener(
      "focus",
      handleWindowFocus
    );


    return () => {

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };

  }, [
    navigate,
    location.pathname,
  ]);


  /* ========================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ======================================== */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          searchWrapperRef.current &&
          !searchWrapperRef.current.contains(
            event.target
          )
        ) {

          setSearchOpen(false);
        }


        if (
          profileWrapperRef.current &&
          !profileWrapperRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(false);
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
     SEARCH RESULTS
  ======================================== */

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();


  const searchResults =
    normalizedSearch
      ? studentSearchItems.filter(
          (item) => {

            const searchableText = [
              item.title,
              item.description,
              ...item.keywords,
            ]
              .join(" ")
              .toLowerCase();


            return searchableText.includes(
              normalizedSearch
            );
          }
        )
      : [];


  /* ========================================
     OPEN SEARCH RESULT
  ======================================== */

  const openSearchResult =
    (item) => {

      setSearchTerm("");

      setSearchOpen(false);


      if (
        location.pathname ===
        item.path
      ) {

        return;
      }


      navigate(
        item.path
      );
    };


  /* ========================================
     SEARCH KEYBOARD CONTROL
  ======================================== */

  const handleSearchKeyDown =
    (event) => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();


        if (
          searchResults.length > 0
        ) {

          openSearchResult(
            searchResults[0]
          );
        }
      }


      if (
        event.key === "Escape"
      ) {

        setSearchOpen(false);

        setSearchTerm("");
      }
    };


  /* ========================================
     CLEAR SEARCH
  ======================================== */

  const clearSearch = () => {

    setSearchTerm("");

    setSearchOpen(false);
  };


  /* ========================================
     CREATE INITIALS
  ======================================== */

  const getInitials =
    (name) => {

      if (!name) {

        return "ST";
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
      student.name
    );


  /* ========================================
     PROFILE IMAGE URL
  ======================================== */

  const getProfileImageUrl =
    (profileImage) => {

      if (!profileImage) {

        return "";
      }


      if (
        /^https?:\/\//i.test(
          String(profileImage)
        )
      ) {

        return String(
          profileImage
        );
      }


      const cleanPath =
        String(profileImage)
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


  const profileImageUrl =
    getProfileImageUrl(
      student.profile_image
    );


  /* ========================================
     PROFILE NAVIGATION
  ======================================== */

  const goToProfile =
    () => {

      setProfileOpen(false);

      navigate(
        "/student/profile"
      );
    };


  const goToSettings =
    () => {

      setProfileOpen(false);

      navigate(
        "/student/settings"
      );
    };


  const goToChangePassword =
    () => {

      setProfileOpen(false);

      navigate(
        "/student/change-password"
      );
    };


  /* ========================================
     LOGOUT
  ======================================== */

  const handleLogout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "role"
      );

      setProfileOpen(false);

      navigate("/login");
    };


  return (

    <>

      {/* ====================================
          EXTRA STYLES
      ==================================== */}

      <style>{`

        .topbar-avatar,
        .dropdown-avatar {
          overflow: hidden;
        }


        .student-layout-profile-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          border-radius: inherit;
        }


        .topbar-search-wrapper {
          position: relative;

          width: 100%;
          max-width: 470px;

          z-index: 1000;
        }


        .topbar-search-wrapper
        .topbar-search {
          width: 100%;
          max-width: none;
        }


        .topbar-search-wrapper
        .topbar-search input {
          padding-right: 42px;
        }


        .student-search-clear {
          position: absolute;

          right: 13px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 26px;
          height: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #98a2b3;
          background: transparent;

          border: none;

          border-radius: 7px;

          cursor: pointer;
        }


        .student-search-clear:hover {
          color: #6557ed;

          background: #f1efff;
        }


        .student-search-results {
          position: absolute;

          left: 0;

          top:
            calc(100% + 10px);

          width: 100%;

          overflow: hidden;

          padding: 8px;

          background:
            rgba(
              255,
              255,
              255,
              0.98
            );

          border:
            1px solid #e5e7ef;

          border-radius: 15px;

          box-shadow:
            0 18px 45px
            rgba(
              32,
              37,
              68,
              0.14
            );

          backdrop-filter:
            blur(18px);
        }


        .student-search-results-header {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          padding:
            7px 9px 8px;

          color: #98a2b3;

          font-size: 9px;
          font-weight: 700;
        }


        .student-search-result {
          width: 100%;

          display: grid;

          grid-template-columns:
            39px
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 10px;

          padding: 10px;

          color: inherit;

          background:
            transparent;

          border: none;

          border-radius: 11px;

          text-align: left;

          cursor: pointer;

          transition:
            background
            0.16s ease,
            transform
            0.16s ease;
        }


        .student-search-result:hover {
          background: #f6f4ff;

          transform:
            translateX(2px);
        }


        .student-search-result-icon {
          width: 39px;
          height: 39px;

          display: flex;

          align-items: center;

          justify-content:
            center;

          color: #6557ed;

          background: #efedff;

          border-radius: 10px;
        }


        .student-search-result-text {
          min-width: 0;
        }


        .student-search-result-text strong {
          display: block;

          margin-bottom: 2px;

          color: #182230;

          font-size: 10px;

          font-weight: 750;
        }


        .student-search-result-text span {
          display: block;

          overflow: hidden;

          color: #8d97a8;

          font-size: 8px;

          white-space: nowrap;

          text-overflow:
            ellipsis;
        }


        .student-search-enter {
          padding: 4px 6px;

          color: #8d96a6;

          background: #f4f5f8;

          border-radius: 6px;

          font-size: 7px;

          font-weight: 700;
        }


        .student-search-empty {
          padding: 24px 15px;

          text-align: center;
        }


        .student-search-empty-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;

          justify-content:
            center;

          margin:
            0 auto 9px;

          color: #6557ed;

          background: #efedff;

          border-radius: 12px;
        }


        .student-search-empty strong {
          display: block;

          color: #344054;

          font-size: 10px;
        }


        .student-search-empty span {
          display: block;

          margin-top: 4px;

          color: #98a2b3;

          font-size: 8px;
        }


        @media (
          max-width: 760px
        ) {

          .topbar-search-wrapper {
            max-width: none;
          }

        }

      `}</style>


      <header className="student-topbar">


        {/* ====================================
            SEARCH
        ==================================== */}

        <div
          className="topbar-search-wrapper"
          ref={
            searchWrapperRef
          }
        >

          <div className="topbar-search">

            <Search
              size={18}
              className="topbar-search-icon"
            />


            <input
              type="text"
              value={
                searchTerm
              }
              placeholder="Search pages, courses, assignments..."
              onFocus={() =>
                setSearchOpen(
                  true
                )
              }
              onChange={(event) => {

                setSearchTerm(
                  event.target.value
                );

                setSearchOpen(
                  true
                );
              }}
              onKeyDown={
                handleSearchKeyDown
              }
            />


            {searchTerm && (

              <button
                type="button"
                className="student-search-clear"
                onClick={
                  clearSearch
                }
                title="Clear search"
              >

                <X size={15} />

              </button>

            )}

          </div>


          {/* SEARCH RESULTS */}

          {searchOpen &&
            searchTerm.trim() && (

            <div className="student-search-results">


              {searchResults.length > 0 ? (

                <>

                  <div className="student-search-results-header">

                    <span>
                      Search results
                    </span>

                    <span>
                      {
                        searchResults.length
                      }
                    </span>

                  </div>


                  {searchResults
                    .slice(
                      0,
                      7
                    )
                    .map(
                      (item) => {

                        const Icon =
                          item.icon;


                        return (

                          <button
                            type="button"
                            key={
                              item.path
                            }
                            className="student-search-result"
                            onClick={() =>
                              openSearchResult(
                                item
                              )
                            }
                          >

                            <div className="student-search-result-icon">

                              <Icon
                                size={17}
                              />

                            </div>


                            <div className="student-search-result-text">

                              <strong>

                                {
                                  item.title
                                }

                              </strong>


                              <span>

                                {
                                  item.description
                                }

                              </span>

                            </div>


                            <span className="student-search-enter">

                              Open

                            </span>

                          </button>

                        );
                      }
                    )}

                </>

              ) : (

                <div className="student-search-empty">


                  <div className="student-search-empty-icon">

                    <Search
                      size={19}
                    />

                  </div>


                  <strong>

                    No page found

                  </strong>


                  <span>

                    Try searching for
                    courses, assignments,
                    grades or AI Tutor.

                  </span>

                </div>

              )}

            </div>

          )}

        </div>


        {/* ====================================
            RIGHT SIDE
        ==================================== */}

        <div className="topbar-actions">


          {/* NOTIFICATION */}

          <button
            type="button"
            className="topbar-icon-button"
            onClick={() =>
              navigate(
                "/notifications"
              )
            }
            title="Notifications"
          >

            <Bell size={20} />


            {unreadCount > 0 && (

              <span className="notification-dot">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </button>


          {/* ==================================
              PROFILE
          ================================== */}

          <div
            className="topbar-profile-wrapper"
            ref={
              profileWrapperRef
            }
          >

            <button
              type="button"
              className="topbar-profile"
              onClick={() => {

                setProfileOpen(
                  (previous) =>
                    !previous
                );

                setSearchOpen(
                  false
                );
              }}
            >


              {/* AVATAR */}

              <div className="topbar-avatar">

                {profileImageUrl ? (

                  <img
                    src={
                      profileImageUrl
                    }
                    alt={
                      `${
                        student.name ||
                        "Student"
                      } profile`
                    }
                    className="student-layout-profile-image"
                  />

                ) : (

                  initials

                )}

              </div>


              {/* NAME */}

              <div className="topbar-profile-text">

                <strong>
                  {student.name}
                </strong>

                <span>
                  Student
                </span>

              </div>


              <ChevronDown
                size={17}
                className={
                  profileOpen
                    ? "profile-arrow profile-arrow-open"
                    : "profile-arrow"
                }
              />

            </button>


            {/* ==================================
                PROFILE DROPDOWN
            ================================== */}

            {profileOpen && (

              <div className="profile-dropdown">


                {/* HEADER */}

                <div className="profile-dropdown-header">


                  <div className="dropdown-avatar">

                    {profileImageUrl ? (

                      <img
                        src={
                          profileImageUrl
                        }
                        alt={
                          `${
                            student.name ||
                            "Student"
                          } profile`
                        }
                        className="student-layout-profile-image"
                      />

                    ) : (

                      initials

                    )}

                  </div>


                  <div>

                    <strong>

                      {student.name}

                    </strong>


                    <span>

                      {student.email}

                    </span>

                  </div>


                </div>


                {/* MENU */}

                <div className="profile-dropdown-menu">

                  <button
                    type="button"
                    onClick={
                      goToProfile
                    }
                  >

                    <User size={17} />

                    My Profile

                  </button>


                  <button
                    type="button"
                    onClick={
                      goToSettings
                    }
                  >

                    <Settings
                      size={17}
                    />

                    Settings

                  </button>


                  <button
                    type="button"
                    onClick={
                      goToChangePassword
                    }
                  >

                    <LockKeyhole
                      size={17}
                    />

                    Change Password

                  </button>

                </div>


                {/* LOGOUT */}

                <div className="profile-dropdown-footer">

                  <button
                    type="button"
                    className="dropdown-logout"
                    onClick={
                      handleLogout
                    }
                  >

                    <LogOut
                      size={17}
                    />

                    Log out

                  </button>

                </div>


              </div>

            )}

          </div>

        </div>

      </header>

    </>

  );
}


export default StudentTopbar;