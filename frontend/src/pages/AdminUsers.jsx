import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import axios from "axios";

import {
  Users,
  GraduationCap,
  ShieldCheck,
  Search,
  UserPlus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  X,
  Mail,
  Copy,
  CheckCircle2,
  KeyRound,
  Activity,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  CircleCheckBig,
} from "lucide-react";

import "../styles/adminUsers.css";

import API_BASE_URL from "../config/api";


/* =========================================
   STANDARD DEGREE + BATCH OPTIONS
========================================= */

const DEGREE_OPTIONS = [
  "BSc (Hons) Software Engineering",
  "BSc (Hons) Computer Science",
  "BSc (Hons) Data Science",
  "BSc (Hons) Computer Security",
  "BSc (Hons) Computer Networks",
  "BSc (Hons) Artificial Intelligence",
  "BSc (Hons) Technology Management",
];


const BATCH_OPTIONS = [
  "24.1",
  "24.2",
  "25.1",
  "25.2",
  "26.1",
  "26.2",
];


/* =========================================
   CREATE USER INITIALS
========================================= */

const getInitials = (name) => {

  if (!name) {
    return "U";
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


/* =========================================
   FORMAT LAST LOGIN
========================================= */

const formatLastLogin = (date) => {

  if (!date) {
    return "Never";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

};


function AdminUsers() {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  /* ========================================
     REAL DATABASE USERS
  ======================================== */

  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);


  /* ========================================
     SEARCH + FILTERS
  ======================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    roleFilter,
    setRoleFilter,
  ] = useState("ALL");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");


  /* ========================================
     ADD / EDIT MODAL
  ======================================== */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    editingUser,
    setEditingUser,
  ] = useState(null);


  const [
    formData,
    setFormData,
  ] = useState({

    name: "",
    email: "",
    role: "STUDENT",
    degree: "",
    batch: "",

  });


  /* ========================================
     CREATED ACCOUNT CREDENTIALS
  ======================================== */

  const [
    createdCredentials,
    setCreatedCredentials,
  ] = useState(null);


  const [
    copiedField,
    setCopiedField,
  ] = useState("");


  /* ========================================
     LOAD USERS FROM POSTGRESQL
  ======================================== */

  const loadUsers =
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


          const response =
            await axios.get(
              `${API_BASE_URL}/admin/users`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const databaseUsers =
            response.data.map(
              (user) => ({

                ...user,

                initials:
                  getInitials(
                    user.name
                  ),

                status:
                  user.is_active
                    ? "Active"
                    : "Disabled",

                lastLogin:
                  formatLastLogin(
                    user.last_login
                  ),

              })
            );


          setUsers(
            databaseUsers
          );


        } catch (error) {

          console.error(
            "Failed to load users:",
            error
          );


          if (
            error.response?.status === 401 ||
            error.response?.status === 403
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
            error.response?.data?.error ||
            "Failed to load users."
          );


        } finally {

          setLoading(false);

        }

      },
      [navigate]
    );


  useEffect(() => {

    loadUsers();

  }, [loadUsers]);


  /* ========================================
     USER COUNTS
  ======================================== */

  const totalUsers =
    users.length;


  const studentCount =
    users.filter(
      (user) =>
        user.role === "STUDENT"
    ).length;


  const lecturerCount =
    users.filter(
      (user) =>
        user.role === "LECTURER"
    ).length;


  const adminCount =
    users.filter(
      (user) =>
        user.role === "ADMIN"
    ).length;


  const activeCount =
    users.filter(
      (user) =>
        user.status === "Active"
    ).length;


  const disabledCount =
    totalUsers - activeCount;


  const activeRate =
    totalUsers > 0
      ? Math.round(
          (
            activeCount /
            totalUsers
          ) * 100
        )
      : 0;


  /* ========================================
     FILTER USERS
  ======================================== */

  const filteredUsers =
    useMemo(() => {

      return users.filter(
        (user) => {

          const search =
            searchTerm
              .toLowerCase()
              .trim();


          const userName =
            (
              user.name || ""
            ).toLowerCase();


          const userEmail =
            (
              user.email || ""
            ).toLowerCase();


          const matchesSearch =
            userName.includes(
              search
            ) ||
            userEmail.includes(
              search
            );


          const matchesRole =
            roleFilter === "ALL" ||
            user.role ===
              roleFilter;


          const matchesStatus =
            statusFilter === "ALL" ||
            user.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );

        }
      );

    }, [
      users,
      searchTerm,
      roleFilter,
      statusFilter,
    ]);


  const filtersActive =
    Boolean(
      searchTerm.trim()
    ) ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL";


  const clearFilters = () => {

    setSearchTerm("");

    setRoleFilter("ALL");

    setStatusFilter("ALL");

  };


  /* ========================================
     OPEN ADD MODAL
  ======================================== */

  const openAddModal =
    (selectedRole = "STUDENT") => {

      const allowedRoles = [
        "STUDENT",
        "LECTURER",
        "ADMIN",
      ];


      const role =
        allowedRoles.includes(
          selectedRole
        )
          ? selectedRole
          : "STUDENT";


      setEditingUser(null);


      setFormData({

        name: "",

        email: "",

        role,

        degree: "",

        batch: "",

      });


      setModalOpen(true);

    };


  /* ========================================
     OPEN CREATE MODAL FROM TOPBAR
  ======================================== */

  useEffect(() => {

    if (
      !location.state
        ?.openCreateUser
    ) {

      return;

    }


    const requestedRole =
      location.state.role;


    const allowedRoles = [
      "STUDENT",
      "LECTURER",
      "ADMIN",
    ];


    const role =
      allowedRoles.includes(
        requestedRole
      )
        ? requestedRole
        : "STUDENT";


    setEditingUser(null);


    setFormData({

      name: "",

      email: "",

      role,

      degree: "",

      batch: "",

    });


    setModalOpen(true);


    /*
      Clear navigation state so
      refreshing the page doesn't
      reopen the modal.
    */

    navigate(
      location.pathname,
      {
        replace: true,
        state: null,
      }
    );

  }, [
    location.pathname,
    location.state,
    navigate,
  ]);


  /* ========================================
     OPEN EDIT MODAL
  ======================================== */

  const openEditModal =
    (user) => {

      setEditingUser(
        user
      );


      setFormData({

        name:
          user.name || "",

        email:
          user.email || "",

        role:
          user.role || "STUDENT",

        degree:
          user.degree || "",

        batch:
          user.batch || "",

      });


      setModalOpen(true);

    };


  /* ========================================
     COPY TO CLIPBOARD
  ======================================== */

  const copyToClipboard =
    async (
      text,
      field
    ) => {

      try {

        await navigator
          .clipboard
          .writeText(
            text
          );


        setCopiedField(
          field
        );


        setTimeout(() => {

          setCopiedField("");

        }, 1800);


      } catch (error) {

        console.error(
          "Clipboard copy failed:",
          error
        );


        const textarea =
          document.createElement(
            "textarea"
          );


        textarea.value =
          text;


        textarea.style.position =
          "fixed";

        textarea.style.opacity =
          "0";


        document.body.appendChild(
          textarea
        );


        textarea.focus();

        textarea.select();


        document.execCommand(
          "copy"
        );


        document.body.removeChild(
          textarea
        );


        setCopiedField(
          field
        );


        setTimeout(() => {

          setCopiedField("");

        }, 1800);

      }

    };


  /* ========================================
     COPY ALL CREDENTIALS
  ======================================== */

  const copyAllCredentials =
    () => {

      if (
        !createdCredentials
      ) {

        return;

      }


      const studentNumberLine =
        createdCredentials.role ===
          "STUDENT" &&
        createdCredentials.studentNumber
          ? `Student Number: ${createdCredentials.studentNumber}\n`
          : "";


      const credentialText =
        `CampusLearn AI Login Credentials

Name: ${createdCredentials.name}
Role: ${createdCredentials.role}
${studentNumberLine}Email:
${createdCredentials.email}

Temporary Password:
${createdCredentials.temporaryPassword}`;


      copyToClipboard(
        credentialText,
        "all"
      );

    };


  /* ========================================
     CLOSE CREDENTIAL MODAL
  ======================================== */

  const closeCredentialModal =
    () => {

      setCreatedCredentials(
        null
      );

      setCopiedField("");

    };


  /* ========================================
     CREATE / UPDATE USER
  ======================================== */

  const handleSaveUser =
    async (event) => {

      event.preventDefault();


      if (
        !formData.name.trim() ||
        !formData.role
      ) {

        alert(
          "Please enter the user's name and role."
        );

        return;

      }


      if (
        editingUser &&
        !formData.email.trim()
      ) {

        alert(
          "Please enter the user's email address."
        );

        return;

      }


      if (
        formData.role ===
          "STUDENT" &&
        (
          !formData.degree.trim() ||
          !formData.batch.trim()
        )
      ) {

        alert(
          "Please select the student's degree and batch."
        );

        return;

      }


      try {

        setSaving(true);


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        /* ==================================
           EDIT EXISTING USER
        ================================== */

        if (editingUser) {

          await axios.put(
            `${API_BASE_URL}/admin/users/${editingUser.id}`,

            {

              name:
                formData.name.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              role:
                formData.role,

              degree:
                formData.role ===
                  "STUDENT"
                  ? formData.degree
                      .trim()
                  : null,

              batch:
                formData.role ===
                  "STUDENT"
                  ? formData.batch
                      .trim()
                  : null,

            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


          await loadUsers();


          setModalOpen(
            false
          );

          setEditingUser(
            null
          );


          alert(
            "User updated successfully!"
          );

          return;

        }


        /* ==================================
           CREATE NEW USER
        ================================== */

        const response =
          await axios.post(
            `${API_BASE_URL}/admin/users`,

            {

              name:
                formData.name.trim(),

              role:
                formData.role,

              degree:
                formData.role ===
                  "STUDENT"
                  ? formData.degree
                      .trim()
                  : null,

              batch:
                formData.role ===
                  "STUDENT"
                  ? formData.batch
                      .trim()
                  : null,

            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const generatedEmail =
          response.data
            ?.credentials
            ?.email;


        const temporaryPassword =
          response.data
            ?.credentials
            ?.temporaryPassword;


        await loadUsers();


        setModalOpen(
          false
        );

        setEditingUser(
          null
        );


        if (
          generatedEmail &&
          temporaryPassword
        ) {

          setCreatedCredentials({

            name:
              response.data
                ?.user?.name ||
              formData.name.trim(),

            role:
              response.data
                ?.user?.role ||
              formData.role,

            studentNumber:
              response.data
                ?.credentials
                ?.studentNumber ??
              response.data
                ?.user
                ?.student_number ??
              null,

            email:
              generatedEmail,

            temporaryPassword:
              temporaryPassword,

          });


        } else {

          alert(
            "User created successfully!"
          );

        }


      } catch (error) {

        console.error(
          "Save user error:",
          error
        );


        if (
          error.response?.status === 401 ||
          error.response?.status === 403
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
          error.response?.data?.error ||
          "Failed to save user."
        );


      } finally {

        setSaving(false);

      }

    };


  /* ========================================
     ENABLE / DISABLE
  ======================================== */

  const toggleUserStatus =
    async (userId) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        const selectedUser =
          users.find(
            (user) =>
              user.id === userId
          );


        if (!selectedUser) {

          return;

        }


        const newStatus =
          selectedUser.status !==
          "Active";


        const actionName =
          newStatus
            ? "enable"
            : "disable";


        const confirmed =
          window.confirm(
            `Are you sure you want to ${actionName} ${selectedUser.name}?`
          );


        if (!confirmed) {

          return;

        }


        await axios.put(
          `${API_BASE_URL}/admin/users/${userId}/status`,

          {
            is_active:
              newStatus,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        await loadUsers();


        alert(
          newStatus
            ? "User enabled successfully!"
            : "User disabled successfully!"
        );


      } catch (error) {

        console.error(
          "Update user status error:",
          error
        );


        if (
          error.response?.status === 401 ||
          error.response?.status === 403
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
          error.response?.data?.error ||
          "Failed to update user status."
        );

      }

    };


  /* ========================================
     DELETE USER
  ======================================== */

  const deleteUser =
    async (userId) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        const selectedUser =
          users.find(
            (user) =>
              user.id === userId
          );


        if (!selectedUser) {

          return;

        }


        const confirmed =
          window.confirm(
            `Are you sure you want to permanently delete ${selectedUser.name}?`
          );


        if (!confirmed) {

          return;

        }


        await axios.delete(
          `${API_BASE_URL}/admin/users/${userId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        await loadUsers();


        alert(
          "User deleted successfully!"
        );


      } catch (error) {

        console.error(
          "Delete user error:",
          error
        );


        if (
          error.response?.status === 401 ||
          error.response?.status === 403
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
          error.response?.data?.error ||
          "Failed to delete user."
        );

      }

    };


  return (

    <div className="admin-users-page">


      {/* ====================================
          IDENTITY DIRECTORY HERO
      ==================================== */}

      <section className="au-directory-hero">


        <div className="au-directory-copy">


          <div className="au-directory-eyebrow">

            <Sparkles size={12} />

            IDENTITY & ACCESS DIRECTORY

          </div>


          <h1>
            User Management
          </h1>


          <p>

            Manage every CampusLearn
            account, role and access state
            from one secure administration
            workspace.

          </p>


          <div className="au-directory-meta">


            <span>

              <CircleCheckBig
                size={13}
              />

              {activeCount} active accounts

            </span>


            <span>

              <ShieldCheck
                size={13}
              />

              {adminCount} administrators

            </span>


          </div>


        </div>


        <div className="au-directory-command">


          <div className="au-command-top">


            <div>

              <span>
                ACCOUNT DIRECTORY
              </span>

              <strong>
                {totalUsers}
              </strong>

              <small>
                total accounts
              </small>

            </div>


            <div className="au-command-icon">

              <Users size={23} />

            </div>


          </div>


          <div className="au-command-track">

            <div
              style={{
                width:
                  `${activeRate}%`,
              }}
            />

          </div>


          <div className="au-command-bottom">

            <span>
              {activeRate}% active
            </span>

            <span>
              {disabledCount} disabled
            </span>

          </div>


          <button
            type="button"
            className="au-hero-add"
            onClick={
              openAddModal
            }
          >

            <UserPlus size={16} />

            Add New User

          </button>


        </div>


      </section>


      {/* ====================================
          ROLE OVERVIEW
      ==================================== */}

      <section className="au-role-overview">


        <RoleOverview
          icon={
            <GraduationCap
              size={19}
            />
          }
          label="Students"
          value={studentCount}
          description="Learner accounts"
          className="au-overview-student"
        />


        <div className="au-overview-divider" />


        <RoleOverview
          icon={
            <Users
              size={19}
            />
          }
          label="Lecturers"
          value={lecturerCount}
          description="Teaching accounts"
          className="au-overview-lecturer"
        />


        <div className="au-overview-divider" />


        <RoleOverview
          icon={
            <ShieldCheck
              size={19}
            />
          }
          label="Administrators"
          value={adminCount}
          description="System accounts"
          className="au-overview-admin"
        />


        <div className="au-overview-divider" />


        <RoleOverview
          icon={
            <Activity
              size={19}
            />
          }
          label="Active Rate"
          value={`${activeRate}%`}
          description="Accounts enabled"
          className="au-overview-active"
        />


      </section>


      {/* ====================================
          DIRECTORY
      ==================================== */}

      <section className="au-directory-panel">


        <div className="au-directory-panel-header">


          <div>

            <span>
              USER DIRECTORY
            </span>

            <h2>
              CampusLearn Accounts
            </h2>

            <p>

              Search, filter and manage
              registered platform users.

            </p>

          </div>


          <div className="au-results-count">

            <strong>
              {filteredUsers.length}
            </strong>

            <span>
              of {totalUsers} shown
            </span>

          </div>


        </div>


        {/* ==================================
            SEARCH + FILTER
        ================================== */}

        <div className="au-toolbar">


          <div className="au-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={
                (event) =>
                  setSearchTerm(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="au-filter-label">

            <SlidersHorizontal
              size={14}
            />

            Filters

          </div>


          <div className="au-filters">


            <select
              value={roleFilter}
              onChange={
                (event) =>
                  setRoleFilter(
                    event.target.value
                  )
              }
            >

              <option value="ALL">
                All Roles
              </option>

              <option value="STUDENT">
                Students
              </option>

              <option value="LECTURER">
                Lecturers
              </option>

              <option value="ADMIN">
                Administrators
              </option>

            </select>


            <select
              value={statusFilter}
              onChange={
                (event) =>
                  setStatusFilter(
                    event.target.value
                  )
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Disabled">
                Disabled
              </option>

            </select>


            {filtersActive && (

              <button
                type="button"
                className="au-clear-filters"
                onClick={
                  clearFilters
                }
              >

                <RefreshCw
                  size={13}
                />

                Reset

              </button>

            )}


          </div>


        </div>


        {/* ==================================
            USER TABLE
        ================================== */}

        <div className="au-table-container">


          {loading && (

            <div className="au-empty">

              <div className="au-loading-spinner" />

              <h3>
                Loading directory...
              </h3>

              <p>
                Getting account information
                from PostgreSQL.
              </p>

            </div>

          )}


          {!loading &&
            error && (

            <div className="au-empty au-error-state">

              <Users size={29} />

              <h3>
                Unable to load users
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}


          {!loading &&
            !error && (

            <>


              {filteredUsers.length >
              0 ? (

                <table className="au-table">


                  <thead>

                    <tr>

                      <th>
                        Account
                      </th>

                      <th>
                        Role
                      </th>

                      <th>
                        Last Login
                      </th>

                      <th>
                        Access
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>


                    {filteredUsers.map(
                      (user) => (

                        <tr
                          key={user.id}
                        >


                          {/* USER */}

                          <td>

                            <div className="au-user-profile">


                              <div className="au-avatar">

                                {
                                  user.initials
                                }

                              </div>


                              <div className="au-user-text">

                                <strong>
                                  {user.name}
                                </strong>

                                <span>

                                  <Mail
                                    size={10}
                                  />

                                  {user.email}

                                </span>

                              </div>


                            </div>

                          </td>


                          {/* ROLE */}

                          <td>

                            <span
                              className={
                                `au-role au-role-${user.role.toLowerCase()}`
                              }
                            >

                              {user.role}

                            </span>

                          </td>


                          {/* LOGIN */}

                          <td>

                            <span className="au-last-login">

                              {
                                user.lastLogin
                              }

                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                user.status ===
                                "Active"
                                  ? "au-status au-status-active"
                                  : "au-status au-status-disabled"
                              }
                            >

                              <i />

                              {user.status}

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="au-actions">


                              <button
                                type="button"
                                className="au-action-button au-edit"
                                onClick={() =>
                                  openEditModal(
                                    user
                                  )
                                }
                                title="Edit user"
                              >

                                <Pencil
                                  size={14}
                                />

                              </button>


                              <button
                                type="button"
                                className="au-action-button au-toggle"
                                onClick={() =>
                                  toggleUserStatus(
                                    user.id
                                  )
                                }
                                title={
                                  user.status ===
                                  "Active"
                                    ? "Disable user"
                                    : "Enable user"
                                }
                              >

                                {user.status ===
                                "Active" ? (

                                  <UserX
                                    size={14}
                                  />

                                ) : (

                                  <UserCheck
                                    size={14}
                                  />

                                )}

                              </button>


                              <button
                                type="button"
                                className="au-action-button au-delete"
                                onClick={() =>
                                  deleteUser(
                                    user.id
                                  )
                                }
                                title="Delete user"
                              >

                                <Trash2
                                  size={14}
                                />

                              </button>


                            </div>

                          </td>


                        </tr>

                      )
                    )}


                  </tbody>


                </table>

              ) : (

                <div className="au-empty">


                  <div className="au-empty-icon">

                    <Search
                      size={23}
                    />

                  </div>


                  <h3>
                    No matching accounts
                  </h3>


                  <p>
                    Try another search term
                    or reset your filters.
                  </p>


                  {filtersActive && (

                    <button
                      type="button"
                      className="au-empty-reset"
                      onClick={
                        clearFilters
                      }
                    >

                      Reset Filters

                    </button>

                  )}


                </div>

              )}


            </>

          )}


        </div>


      </section>


      {/* ====================================
          ADD / EDIT USER MODAL
      ==================================== */}

      {modalOpen && (

        <div className="au-modal-overlay">


          <div className="au-modal">


            <div className="au-modal-header">


              <div className="au-modal-title-area">


                <div className="au-modal-title-icon">

                  {editingUser ? (

                    <Pencil
                      size={20}
                    />

                  ) : (

                    <UserPlus
                      size={20}
                    />

                  )}

                </div>


                <div>

                  <span>
                    ACCOUNT MANAGEMENT
                  </span>

                  <h2>

                    {editingUser
                      ? "Edit User"
                      : "Create New User"}

                  </h2>

                  <p>

                    {editingUser
                      ? "Update this CampusLearn account information."
                      : "Create an account and CampusLearn will generate the login credentials automatically."}

                  </p>

                </div>


              </div>


              <button
                type="button"
                className="au-modal-close"
                onClick={() =>
                  setModalOpen(
                    false
                  )
                }
              >

                <X size={18} />

              </button>


            </div>


            <form
              className="au-form"
              onSubmit={
                handleSaveUser
              }
            >


              {/* FULL NAME */}

              <div className="au-form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter full name"
                  value={
                    formData.name
                  }
                  onChange={
                    (event) =>
                      setFormData({
                        ...formData,

                        name:
                          event.target
                            .value,
                      })
                  }
                  required
                />

              </div>


              {/* EMAIL */}

              {editingUser && (

                <div className="au-form-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={
                      formData.email
                    }
                    onChange={
                      (event) =>
                        setFormData({
                          ...formData,

                          email:
                            event.target
                              .value,
                        })
                    }
                    required
                  />

                </div>

              )}


              {/* ROLE */}

              <div className="au-form-group">

                <label>
                  User Role
                </label>

                <select
                  value={
                    formData.role
                  }
                  onChange={
                    (event) =>
                      setFormData({
                        ...formData,

                        role:
                          event.target
                            .value,

                        degree:
                          event.target.value ===
                          "STUDENT"
                            ? formData.degree
                            : "",

                        batch:
                          event.target.value ===
                          "STUDENT"
                            ? formData.batch
                            : "",
                      })
                  }
                >

                  <option value="STUDENT">
                    Student
                  </option>

                  <option value="LECTURER">
                    Lecturer
                  </option>

                  <option value="ADMIN">
                    Administrator
                  </option>

                </select>

              </div>


              {/* ====================================
                  STUDENT DETAILS
              ==================================== */}

              {formData.role ===
                "STUDENT" && (

                <div className="au-student-fields">


                  {/* DEGREE */}

                  <div className="au-form-group">

                    <label>
                      Degree
                    </label>


                    <select
                      value={
                        formData.degree
                      }
                      onChange={(event) =>
                        setFormData({
                          ...formData,

                          degree:
                            event.target.value,
                        })
                      }
                      required
                    >

                      <option value="">
                        Select degree
                      </option>


                      {DEGREE_OPTIONS.map(
                        (degree) => (

                          <option
                            key={degree}
                            value={degree}
                          >

                            {degree}

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* BATCH */}

                  <div className="au-form-group">

                    <label>
                      Batch
                    </label>


                    <select
                      value={
                        formData.batch
                      }
                      onChange={(event) =>
                        setFormData({
                          ...formData,

                          batch:
                            event.target.value,
                        })
                      }
                      required
                    >

                      <option value="">
                        Select batch
                      </option>


                      {BATCH_OPTIONS.map(
                        (batch) => (

                          <option
                            key={batch}
                            value={batch}
                          >

                            {batch}

                          </option>

                        )
                      )}

                    </select>

                  </div>


                </div>

              )}


              {!editingUser && (

                <div className="au-generation-note">

                  <KeyRound
                    size={17}
                  />

                  <div>

                    <strong>
                      Automatic credentials
                    </strong>

                    <span>

                      Email and temporary
                      password will be
                      generated after the
                      account is created.

                    </span>

                  </div>

                </div>

              )}


              <div className="au-modal-actions">


                <button
                  type="button"
                  className="au-cancel-button"
                  onClick={() =>
                    setModalOpen(
                      false
                    )
                  }
                  disabled={saving}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="au-save-button"
                  disabled={saving}
                >

                  {editingUser ? (

                    <Pencil
                      size={15}
                    />

                  ) : (

                    <UserPlus
                      size={15}
                    />

                  )}


                  {saving
                    ? editingUser
                      ? "Saving..."
                      : "Creating..."
                    : editingUser
                      ? "Save Changes"
                      : "Create User"}

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


      {/* ====================================
          CREATED CREDENTIALS MODAL
      ==================================== */}

      {createdCredentials && (

        <div className="au-modal-overlay au-credentials-overlay">


          <div className="au-credentials-modal">


            <div className="au-credentials-hero">


              <div className="au-credentials-success">

                <CheckCircle2
                  size={25}
                />

              </div>


              <div>

                <span>
                  ACCOUNT PROVISIONED
                </span>

                <h2>
                  Account Created
                </h2>

                <p>
                  Save these login
                  credentials before closing.
                </p>

              </div>


              <button
                type="button"
                className="au-credentials-close"
                onClick={
                  closeCredentialModal
                }
              >

                <X size={18} />

              </button>


            </div>


            <div className="au-credentials-body">


              <div className="au-created-user-card">


                <div className="au-created-avatar">

                  {getInitials(
                    createdCredentials.name
                  )}

                </div>


                <div>

                  <span>
                    NEW CAMPUSLEARN ACCOUNT
                  </span>

                  <strong>
                    {
                      createdCredentials.name
                    }
                  </strong>

                  <small>
                    {
                      createdCredentials.role
                    }
                  </small>

                </div>


                {createdCredentials.role ===
                  "STUDENT" &&
                  createdCredentials
                    .studentNumber && (

                  <div className="au-student-number">

                    <span>
                      STUDENT NO.
                    </span>

                    <strong>
                      {
                        createdCredentials
                          .studentNumber
                      }
                    </strong>

                  </div>

                )}


              </div>


              {/* EMAIL */}

              <CredentialField
                label="Generated Email Address"
                value={
                  createdCredentials.email
                }
                copied={
                  copiedField === "email"
                }
                onCopy={() =>
                  copyToClipboard(
                    createdCredentials.email,
                    "email"
                  )
                }
                icon={
                  <Mail size={16} />
                }
              />


              {/* PASSWORD */}

              <CredentialField
                label="Temporary Password"
                value={
                  createdCredentials
                    .temporaryPassword
                }
                copied={
                  copiedField ===
                  "password"
                }
                onCopy={() =>
                  copyToClipboard(
                    createdCredentials
                      .temporaryPassword,
                    "password"
                  )
                }
                icon={
                  <KeyRound
                    size={16}
                  />
                }
                monospace
              />


              <div className="au-credential-warning">

                <ShieldCheck
                  size={17}
                />

                <p>

                  Save or send these
                  credentials before closing.
                  The temporary password will
                  not be shown again from this
                  screen.

                </p>

              </div>


              <div className="au-modal-actions">


                <button
                  type="button"
                  className="au-cancel-button"
                  onClick={
                    closeCredentialModal
                  }
                >

                  Close

                </button>


                <button
                  type="button"
                  className="au-save-button"
                  onClick={
                    copyAllCredentials
                  }
                >

                  {copiedField === "all" ? (

                    <>

                      <CheckCircle2
                        size={16}
                      />

                      Copied All

                    </>

                  ) : (

                    <>

                      <Copy
                        size={16}
                      />

                      Copy All Credentials

                    </>

                  )}

                </button>


              </div>


            </div>


          </div>


        </div>

      )}


    </div>

  );

}


/* ========================================
   ROLE OVERVIEW
======================================== */

function RoleOverview({
  icon,
  label,
  value,
  description,
  className,
}) {

  return (

    <div
      className={
        `au-overview-item ${className}`
      }
    >


      <div className="au-overview-icon">

        {icon}

      </div>


      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>


    </div>

  );

}


/* ========================================
   CREDENTIAL FIELD
======================================== */

function CredentialField({
  label,
  value,
  copied,
  onCopy,
  icon,
  monospace = false,
}) {

  return (

    <div className="au-credential-field">


      <label>
        {label}
      </label>


      <div className="au-credential-value-row">


        <div
          className={
            monospace
              ? "au-credential-value au-credential-monospace"
              : "au-credential-value"
          }
        >

          <span className="au-credential-value-icon">

            {icon}

          </span>

          <span>
            {value}
          </span>

        </div>


        <button
          type="button"
          className={
            copied
              ? "au-copy-button au-copy-button-success"
              : "au-copy-button"
          }
          onClick={onCopy}
        >

          {copied ? (

            <>

              <CheckCircle2
                size={14}
              />

              Copied

            </>

          ) : (

            <>

              <Copy size={14} />

              Copy

            </>

          )}

        </button>


      </div>


    </div>

  );

}


export default AdminUsers;