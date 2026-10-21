import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


/* =========================================
   PUBLIC PAGES
========================================= */

import Splash from "./pages/Splash";
import Login from "./pages/Login.jsx";
import SetNewPassword from "./pages/SetNewPassword.jsx";


/* =========================================
   STUDENT PAGES
========================================= */

import Dashboard from "./pages/Dashboard";
import Course from "./pages/Course";
import Tutor from "./pages/Tutor";
import Progress from "./pages/Progress";
import Deadlines from "./pages/Deadlines";
import Assignments from "./pages/Assignments";
import Notifications from "./pages/Notifications";
import Grades from "./pages/Grades";
import MyCourses from "./pages/MyCourses";
import StudentProfile from "./pages/StudentProfile";
import StudentSettings from "./pages/StudentSettings";
import StudentChangePassword from "./pages/StudentChangePassword";


/* =========================================
   LECTURER PAGES
========================================= */

import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerCourses from "./pages/LecturerCourses";
import LecturerAssignments from "./pages/LecturerAssignments";
import LecturerSubmissions from "./pages/LecturerSubmissions";
import LecturerGrading from "./pages/LecturerGrading";
import LecturerStudents from "./pages/LecturerStudents";
import LecturerCourse from "./pages/LecturerCourse";
import LecturerProfile from "./pages/LecturerProfile";
import LecturerChangePassword from "./pages/LecturerChangePassword";
import LecturerSettings from "./pages/LecturerSettings";
import LecturerTutor from "./pages/LecturerTutor";
import LecturerNotifications from "./pages/LecturerNotifications";


/* =========================================
   ADMIN PAGES
========================================= */

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminStudents from "./pages/AdminStudents";
import AdminCourses from "./pages/AdminCourses";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";
import AdminNotifications from "./pages/AdminNotifications";


/* =========================================
   PROTECTION + LAYOUTS
========================================= */

import ProtectedRoute from "./components/ProtectedRoute";

import StudentLayout from "./components/layout/StudentLayout";
import LecturerLayout from "./components/layout/LecturerLayout";
import AdminLayout from "./components/layout/AdminLayout";


/* =========================================
   SHARED COURSE PAGE

   Read the role when this route renders
   instead of storing the role once at the
   top of App.
========================================= */

function SharedCoursePage() {

  const role =
    localStorage.getItem(
      "role"
    );


  if (
    role === "STUDENT"
  ) {

    return (

      <StudentLayout>

        <Course />

      </StudentLayout>

    );

  }


  /*
    Preserve the current behavior for
    Lecturer and Admin accounts.

    They can access the shared Course page
    without the Student layout.
  */

  return <Course />;

}


function App() {

  return (

    <Router>


      <Routes>


        {/* ========================================
            PUBLIC ROUTES
        ======================================== */}

        <Route
          path="/"
          element={
            <Splash />
          }
        />


        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/set-new-password"
          element={
            <SetNewPassword />
          }
        />


        {/* ========================================
            STUDENT ROUTES
        ======================================== */}

        <Route
          path="/dashboard"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Dashboard />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/my-courses"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <MyCourses />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/progress"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Progress />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/assignments"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Assignments />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/deadlines"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Deadlines />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/notifications"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Notifications />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            STUDENT GRADES

            Duplicate /grades route removed.
        ======================================== */}

        <Route
          path="/grades"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Grades />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            STUDENT PROFILE
        ======================================== */}

        <Route
          path="/student/profile"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <StudentProfile />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            STUDENT SETTINGS
        ======================================== */}

        <Route
          path="/student/settings"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <StudentSettings />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            STUDENT CHANGE PASSWORD
        ======================================== */}

        <Route
          path="/student/change-password"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <StudentChangePassword />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            STUDENT AI STUDY TUTOR
        ======================================== */}

        <Route
          path="/tutor"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
              ]}
            >

              <StudentLayout>

                <Tutor />

              </StudentLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            LECTURER ROUTES
        ======================================== */}

        <Route
          path="/lecturer-dashboard"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerDashboard />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/courses"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerCourses />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/course/:id"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerCourse />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/assignments"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerAssignments />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/submissions"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerSubmissions />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/notifications"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerNotifications />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/grading"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerGrading />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/students"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerStudents />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/profile"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerProfile />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/change-password"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerChangePassword />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/settings"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerSettings />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/lecturer/tutor"
          element={

            <ProtectedRoute
              allowedRoles={[
                "LECTURER",
              ]}
            >

              <LecturerLayout>

                <LecturerTutor />

              </LecturerLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            ADMIN ROUTES
        ======================================== */}

        <Route
          path="/admin-dashboard"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminDashboard />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin-users"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminUsers />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/students"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminStudents />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/courses"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminCourses />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/reports"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminReports />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/settings"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminSettings />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/profile"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminProfile />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/notifications"
          element={

            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            >

              <AdminLayout>

                <AdminNotifications />

              </AdminLayout>

            </ProtectedRoute>

          }
        />


        {/* ========================================
            SHARED COURSE ROUTE
        ======================================== */}

        <Route
          path="/course/:id"
          element={

            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
                "LECTURER",
                "ADMIN",
              ]}
            >

              <SharedCoursePage />

            </ProtectedRoute>

          }
        />


      </Routes>


    </Router>

  );

}


export default App;