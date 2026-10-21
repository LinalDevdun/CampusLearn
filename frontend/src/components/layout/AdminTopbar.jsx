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
  Settings,
  LogOut,
  ShieldCheck,
  KeyRound,
  UserRound,
  GraduationCap,
  Users,
  BookOpen,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";


import "../../styles/adminTopbar.css";

import API_BASE_URL from "../../config/api";



function AdminTopbar() {

  const navigate =
    useNavigate();


  const profileRef =
    useRef(null);


  const createRef =
    useRef(null);


  const searchRef =
    useRef(null);



  /* ========================================
     ADMIN DATA
  ======================================== */

  const [
    admin,
    setAdmin,
  ] = useState({

    name: "Admin User",

    email: "",

    role: "ADMIN",

  });



  /* ========================================
     PROFILE DROPDOWN
  ======================================== */

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);



  /* ========================================
     ADD NEW DROPDOWN
  ======================================== */

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);



  /* ========================================
     GLOBAL SEARCH
  ======================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);


  const [
    searchUsers,
    setSearchUsers,
  ] = useState([]);


  const [
    searchCourses,
    setSearchCourses,
  ] = useState([]);


  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);



  /* ========================================
     SEARCHABLE ADMIN PAGES
  ======================================== */

  const adminSearchPages = [

    {
      title: "Dashboard",

      description:
        "Admin overview and platform statistics",

      path:
        "/admin-dashboard",

      keywords:
        "dashboard home overview statistics",

      icon:
        LayoutDashboard,
    },


    {
      title:
        "User Management",

      description:
        "Manage student, lecturer and administrator accounts",

      path:
        "/admin-users",

      keywords:
        "users accounts student lecturer admin administrator",

      icon:
        Users,
    },


    {
      title:
        "Students",

      description:
        "View student academic information",

      path:
        "/admin/students",

      keywords:
        "students learners academic degree batch",

      icon:
        GraduationCap,
    },


    {
      title:
        "Courses",

      description:
        "Manage CampusLearn courses",

      path:
        "/admin/courses",

      keywords:
        "courses modules subjects degree batch",

      icon:
        BookOpen,
    },


    {
      title:
        "Reports",

      description:
        "Platform reports and analytics",

      path:
        "/admin/reports",

      keywords:
        "reports analytics statistics performance",

      icon:
        BarChart3,
    },


    {
      title:
        "Notifications",

      description:
        "Admin notification center",

      path:
        "/admin/notifications",

      keywords:
        "notifications alerts activity",

      icon:
        Bell,
    },


    {
      title:
        "Settings",

      description:
        "System settings and preferences",

      path:
        "/admin/settings",

      keywords:
        "settings configuration preferences password",

      icon:
        Settings,
    },


    {
      title:
        "Profile",

      description:
        "Administrator profile",

      path:
        "/admin/profile",

      keywords:
        "profile administrator account",

      icon:
        UserRound,
    },

  ];



  /* ========================================
     GET LOGGED-IN ADMIN
  ======================================== */

  useEffect(() => {

    const fetchAdmin =
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


          const response =
            await axios.get(

              `${API_BASE_URL}/me`,

              {
                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },
              }

            );


          setAdmin(
            response.data
          );


        } catch (error) {

          console.error(
            "Failed to load admin profile:",
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


    fetchAdmin();

  }, [navigate]);



  /* ========================================
     CLOSE DROPDOWNS
  ======================================== */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(false);

        }


        if (
          createRef.current &&
          !createRef.current.contains(
            event.target
          )
        ) {

          setCreateOpen(false);

        }


        if (
          searchRef.current &&
          !searchRef.current.contains(
            event.target
          )
        ) {

          setSearchOpen(false);

        }

      };


    const handleEscape =
      (event) => {

        if (
          event.key ===
            "Escape"
        ) {

          setProfileOpen(false);

          setCreateOpen(false);

          setSearchOpen(false);

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    document.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );


      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, []);



  /* ========================================
     INITIALS
  ======================================== */

  const getInitials =
    (name) => {

      if (!name) {

        return "AD";

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
      admin.name
    );



  /* ========================================
     LOAD GLOBAL SEARCH DATA
  ======================================== */

  const loadSearchData =
    async () => {

      if (searchLoading) {

        return;

      }


      try {

        setSearchLoading(
          true
        );


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


        const config = {

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        };


        const [
          usersResponse,
          coursesResponse,
        ] =
          await Promise.all([

            axios.get(
              `${API_BASE_URL}/admin/users`,
              config
            ),

            axios.get(
              `${API_BASE_URL}/admin/courses/summary`,
              config
            ),

          ]);


        setSearchUsers(

          Array.isArray(
            usersResponse.data
          )
            ? usersResponse.data
            : []

        );


        setSearchCourses(

          Array.isArray(
            coursesResponse.data
          )
            ? coursesResponse.data
            : []

        );


      } catch (error) {

        console.error(
          "Admin search data error:",
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


      } finally {

        setSearchLoading(
          false
        );

      }

    };



  /* ========================================
     SEARCH FILTERING
  ======================================== */

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();



  const pageSearchResults =
    adminSearchPages
      .filter(
        (page) => {

          if (
            !normalizedSearch
          ) {

            return true;

          }


          return (

            page.title
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            page.description
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            page.keywords
              .toLowerCase()
              .includes(
                normalizedSearch
              )

          );

        }
      )
      .slice(
        0,
        normalizedSearch
          ? 6
          : 8
      );



  const userSearchResults =
    normalizedSearch

      ? searchUsers
          .filter(
            (user) => {

              const name =
                (
                  user.name ||
                  ""
                )
                  .toLowerCase();


              const email =
                (
                  user.email ||
                  ""
                )
                  .toLowerCase();


              const role =
                (
                  user.role ||
                  ""
                )
                  .toLowerCase();


              return (

                name.includes(
                  normalizedSearch
                ) ||

                email.includes(
                  normalizedSearch
                ) ||

                role.includes(
                  normalizedSearch
                )

              );

            }
          )
          .slice(
            0,
            5
          )

      : [];



  const courseSearchResults =
    normalizedSearch

      ? searchCourses
          .filter(
            (course) => {

              const title =
                (
                  course.title ||
                  ""
                )
                  .toLowerCase();


              const degree =
                (
                  course.degree ||
                  ""
                )
                  .toLowerCase();


              const batch =
                (
                  course.batch ||
                  ""
                )
                  .toLowerCase();


              return (

                title.includes(
                  normalizedSearch
                ) ||

                degree.includes(
                  normalizedSearch
                ) ||

                batch.includes(
                  normalizedSearch
                )

              );

            }
          )
          .slice(
            0,
            5
          )

      : [];



  const hasSearchResults =

    pageSearchResults.length > 0 ||

    userSearchResults.length > 0 ||

    courseSearchResults.length > 0;



  /* ========================================
     SEARCH NAVIGATION
  ======================================== */

  const closeSearch = () => {

    setSearchOpen(
      false
    );


    setSearchTerm(
      ""
    );

  };


  const goToSearchResult =
    (path) => {

      closeSearch();


      setCreateOpen(
        false
      );


      setProfileOpen(
        false
      );


      navigate(
        path
      );

    };



  const handleSearchKeyDown =
    (event) => {

      if (
        event.key ===
          "Escape"
      ) {

        setSearchOpen(
          false
        );

        return;

      }


      if (
        event.key !==
          "Enter"
      ) {

        return;

      }


      event.preventDefault();


      if (
        pageSearchResults.length >
          0
      ) {

        goToSearchResult(

          pageSearchResults[0]
            .path

        );

        return;

      }


      if (
        userSearchResults.length >
          0
      ) {

        const user =
          userSearchResults[0];


        if (
          user.role ===
            "STUDENT"
        ) {

          goToSearchResult(
            "/admin/students"
          );

        } else {

          goToSearchResult(
            "/admin-users"
          );

        }

        return;

      }


      if (
        courseSearchResults.length >
          0
      ) {

        goToSearchResult(
          "/admin/courses"
        );

      }

    };



  /* ========================================
     SYSTEM SETTINGS
  ======================================== */

  const openSettings = () => {

    setProfileOpen(
      false
    );


    setCreateOpen(
      false
    );


    setSearchOpen(
      false
    );


    navigate(
      "/admin/settings"
    );

  };



  /* ========================================
     CHANGE PASSWORD
  ======================================== */

  const openChangePassword = () => {

    setProfileOpen(
      false
    );


    setCreateOpen(
      false
    );


    setSearchOpen(
      false
    );


    navigate(
      "/admin/settings"
    );


    /*
      Admin password management already
      exists inside the Admin Settings page.

      After navigation, scroll to the
      password vault section.
    */

    setTimeout(() => {

      const passwordSection =
        document.querySelector(
          ".aset-password-vault"
        );


      if (passwordSection) {

        passwordSection
          .scrollIntoView({

            behavior:
              "smooth",

            block:
              "start",

          });

      }

    }, 250);

  };



  /* ========================================
     CREATE USER FROM TOPBAR
  ======================================== */

  const openCreateUser =
    (role) => {

      setCreateOpen(
        false
      );


      setProfileOpen(
        false
      );


      setSearchOpen(
        false
      );


      navigate(

        "/admin-users",

        {

          state: {

            openCreateUser:
              true,

            role,

          },

        }

      );

    };



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


    localStorage.removeItem(
      "user"
    );


    setProfileOpen(
      false
    );


    setCreateOpen(
      false
    );


    setSearchOpen(
      false
    );


    navigate(
      "/login"
    );

  };



  return (

    <header className="admin-topbar">


      {/* ====================================
          GLOBAL SEARCH
      ==================================== */}

      <div
        className="admin-search"
        ref={searchRef}
      >

        <Search
          size={18}
        />


        <input
          type="text"
          placeholder="Search pages, users, courses..."
          value={searchTerm}

          onChange={
            (event) => {

              setSearchTerm(
                event.target.value
              );


              setSearchOpen(
                true
              );

            }
          }

          onFocus={() => {

            setSearchOpen(
              true
            );


            setCreateOpen(
              false
            );


            setProfileOpen(
              false
            );


            loadSearchData();

          }}

          onKeyDown={
            handleSearchKeyDown
          }
        />


        {searchOpen && (

          <div className="admin-search-dropdown">


            {/* =================================
                QUICK NAVIGATION
            ================================= */}

            {!normalizedSearch && (

              <div className="admin-search-section">


                <div className="admin-search-section-title">

                  Quick Navigation

                </div>


                {
                  pageSearchResults.map(
                    (page) => {

                      const PageIcon =
                        page.icon;


                      return (

                        <button
                          type="button"
                          className="admin-search-result"
                          key={
                            page.path
                          }
                          onClick={() =>
                            goToSearchResult(
                              page.path
                            )
                          }
                        >

                          <div className="admin-search-result-icon">

                            <PageIcon
                              size={17}
                            />

                          </div>


                          <div className="admin-search-result-text">

                            <strong>

                              {
                                page.title
                              }

                            </strong>


                            <span>

                              {
                                page.description
                              }

                            </span>

                          </div>

                        </button>

                      );

                    }
                  )
                }

              </div>

            )}



            {/* =================================
                SEARCH RESULTS
            ================================= */}

            {normalizedSearch && (

              <>


                {/* PAGES */}

                {
                  pageSearchResults.length >
                    0 && (

                    <div className="admin-search-section">


                      <div className="admin-search-section-title">

                        Pages

                      </div>


                      {
                        pageSearchResults.map(
                          (page) => {

                            const PageIcon =
                              page.icon;


                            return (

                              <button
                                type="button"
                                className="admin-search-result"
                                key={
                                  page.path
                                }
                                onClick={() =>
                                  goToSearchResult(
                                    page.path
                                  )
                                }
                              >

                                <div className="admin-search-result-icon">

                                  <PageIcon
                                    size={17}
                                  />

                                </div>


                                <div className="admin-search-result-text">

                                  <strong>

                                    {
                                      page.title
                                    }

                                  </strong>


                                  <span>

                                    {
                                      page.description
                                    }

                                  </span>

                                </div>

                              </button>

                            );

                          }
                        )
                      }

                    </div>

                  )
                }



                {/* USERS */}

                {
                  userSearchResults.length >
                    0 && (

                    <div className="admin-search-section">


                      <div className="admin-search-section-title">

                        Users

                      </div>


                      {
                        userSearchResults.map(
                          (user) => (

                            <button
                              type="button"
                              className="admin-search-result"
                              key={
                                `user-${user.id}`
                              }

                              onClick={() => {

                                if (
                                  user.role ===
                                    "STUDENT"
                                ) {

                                  goToSearchResult(
                                    "/admin/students"
                                  );

                                } else {

                                  goToSearchResult(
                                    "/admin-users"
                                  );

                                }

                              }}
                            >

                              <div className="admin-search-result-icon admin-search-user-icon">

                                <UserRound
                                  size={17}
                                />

                              </div>


                              <div className="admin-search-result-text">

                                <strong>

                                  {
                                    user.name ||
                                    "Unknown User"
                                  }

                                </strong>


                                <span>

                                  {
                                    user.email ||
                                    "No email"
                                  }

                                  {" • "}

                                  {
                                    user.role ||
                                    "USER"
                                  }

                                </span>

                              </div>

                            </button>

                          )
                        )
                      }

                    </div>

                  )
                }



                {/* COURSES */}

                {
                  courseSearchResults.length >
                    0 && (

                    <div className="admin-search-section">


                      <div className="admin-search-section-title">

                        Courses

                      </div>


                      {
                        courseSearchResults.map(
                          (course) => (

                            <button
                              type="button"
                              className="admin-search-result"
                              key={
                                `course-${course.id}`
                              }
                              onClick={() =>
                                goToSearchResult(
                                  "/admin/courses"
                                )
                              }
                            >

                              <div className="admin-search-result-icon admin-search-course-icon">

                                <BookOpen
                                  size={17}
                                />

                              </div>


                              <div className="admin-search-result-text">

                                <strong>

                                  {
                                    course.title ||
                                    "Untitled Course"
                                  }

                                </strong>


                                <span>

                                  {
                                    course.degree ||
                                    "No degree"
                                  }


                                  {
                                    course.batch

                                      ? ` • ${course.batch}`

                                      : ""
                                  }

                                </span>

                              </div>

                            </button>

                          )
                        )
                      }

                    </div>

                  )
                }



                {/* LOADING */}

                {searchLoading && (

                  <div className="admin-search-loading">

                    Searching CampusLearn...

                  </div>

                )}



                {/* NO RESULTS */}

                {
                  !searchLoading &&
                  !hasSearchResults && (

                    <div className="admin-search-empty">

                      <Search
                        size={22}
                      />


                      <strong>

                        No results found

                      </strong>


                      <span>

                        Try another user,
                        course or page.

                      </span>

                    </div>

                  )
                }

              </>

            )}

          </div>

        )}

      </div>



      {/* ====================================
          RIGHT SIDE
      ==================================== */}

      <div className="admin-topbar-actions">


        {/* ====================================
            ADD NEW
        ==================================== */}

        <div
          className="admin-create-wrapper"
          ref={createRef}
        >

          <button
            type="button"

            className={
              createOpen
                ? "admin-create-button admin-create-button-open"
                : "admin-create-button"
            }

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

            aria-expanded={
              createOpen
            }
          >

            <Plus
              size={16}
            />

            Add New


            <ChevronDown
              size={14}

              className={
                createOpen
                  ? "admin-create-chevron admin-create-chevron-open"
                  : "admin-create-chevron"
              }
            />

          </button>



          {createOpen && (

            <div className="admin-create-dropdown">


              {/* STUDENT */}

              <button
                type="button"

                onClick={() =>
                  openCreateUser(
                    "STUDENT"
                  )
                }
              >

                <div className="admin-create-option-icon admin-create-student">

                  <GraduationCap
                    size={18}
                  />

                </div>


                <div className="admin-create-option-text">

                  <strong>

                    Add Student

                  </strong>


                  <span>

                    Create a new learner account

                  </span>

                </div>

              </button>



              {/* LECTURER */}

              <button
                type="button"

                onClick={() =>
                  openCreateUser(
                    "LECTURER"
                  )
                }
              >

                <div className="admin-create-option-icon admin-create-lecturer">

                  <Users
                    size={18}
                  />

                </div>


                <div className="admin-create-option-text">

                  <strong>

                    Add Lecturer

                  </strong>


                  <span>

                    Create a teaching account

                  </span>

                </div>

              </button>



              {/* ADMIN */}

              <button
                type="button"

                onClick={() =>
                  openCreateUser(
                    "ADMIN"
                  )
                }
              >

                <div className="admin-create-option-icon admin-create-admin">

                  <ShieldCheck
                    size={18}
                  />

                </div>


                <div className="admin-create-option-text">

                  <strong>

                    Add Administrator

                  </strong>


                  <span>

                    Create an admin account

                  </span>

                </div>

              </button>

            </div>

          )}

        </div>



        {/* ====================================
            NOTIFICATIONS
        ==================================== */}

        <button
          type="button"
          className="admin-notification-button"

          onClick={() =>
            navigate(
              "/admin/notifications"
            )
          }
        >

          <Bell
            size={19}
          />


          <span>

            5

          </span>

        </button>



        {/* ====================================
            PROFILE
        ==================================== */}

        <div
          className="admin-profile-wrapper"
          ref={profileRef}
        >


          <button
            type="button"

            className={
              profileOpen
                ? "admin-profile admin-profile-open"
                : "admin-profile"
            }

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

            aria-expanded={
              profileOpen
            }
          >


            <div className="admin-top-avatar">

              {initials}

            </div>


            <div className="admin-profile-details">

              <strong>

                {admin.name}

              </strong>


              <span>

                Administrator

              </span>

            </div>


            <ChevronDown
              size={16}

              className={
                profileOpen
                  ? "admin-profile-chevron admin-profile-chevron-open"
                  : "admin-profile-chevron"
              }
            />

          </button>



          {/* ==================================
              PROFILE DROPDOWN
          ================================== */}

          {profileOpen && (

            <div className="admin-profile-dropdown">


              {/* ACCOUNT AREA */}

              <div className="admin-dropdown-header">


                <div className="admin-dropdown-avatar">

                  {initials}

                </div>


                <div className="admin-dropdown-user">

                  <strong>

                    {admin.name}

                  </strong>


                  <span>

                    {
                      admin.email ||
                      "Administrator"
                    }

                  </span>


                  <div className="admin-dropdown-role">

                    <ShieldCheck
                      size={11}
                    />

                    Administrator

                  </div>

                </div>

              </div>



              {/* ACCOUNT MENU */}

              <div className="admin-dropdown-menu">


                {/* PROFILE */}

                <button
                  type="button"

                  onClick={() => {

                    setProfileOpen(
                      false
                    );


                    navigate(
                      "/admin/profile"
                    );

                  }}
                >

                  <div className="admin-dropdown-menu-icon">

                    <UserRound
                      size={16}
                    />

                  </div>


                  <div className="admin-dropdown-menu-text">

                    <strong>

                      Your Profile

                    </strong>


                    <span>

                      View administrator account

                    </span>

                  </div>


                  <ChevronDown
                    size={13}
                    className="admin-dropdown-arrow"
                  />

                </button>



                {/* SYSTEM SETTINGS */}

                <button
                  type="button"

                  onClick={
                    openSettings
                  }
                >

                  <div className="admin-dropdown-menu-icon">

                    <Settings
                      size={16}
                    />

                  </div>


                  <div className="admin-dropdown-menu-text">

                    <strong>

                      System Settings

                    </strong>


                    <span>

                      Preferences & system controls

                    </span>

                  </div>


                  <ChevronDown
                    size={13}
                    className="admin-dropdown-arrow"
                  />

                </button>



                {/* CHANGE PASSWORD */}

                <button
                  type="button"

                  onClick={
                    openChangePassword
                  }
                >

                  <div className="admin-dropdown-menu-icon admin-dropdown-password-icon">

                    <KeyRound
                      size={16}
                    />

                  </div>


                  <div className="admin-dropdown-menu-text">

                    <strong>

                      Change Password

                    </strong>


                    <span>

                      Update account security

                    </span>

                  </div>


                  <ChevronDown
                    size={13}
                    className="admin-dropdown-arrow"
                  />

                </button>

              </div>



              {/* LOGOUT */}

              <div className="admin-dropdown-footer">

                <button
                  type="button"

                  onClick={
                    handleLogout
                  }
                >

                  <div className="admin-dropdown-logout-icon">

                    <LogOut
                      size={15}
                    />

                  </div>


                  <div>

                    <strong>

                      Log out

                    </strong>


                    <span>

                      Sign out of CampusLearn

                    </span>

                  </div>

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>

  );

}


export default AdminTopbar;