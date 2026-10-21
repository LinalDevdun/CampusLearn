# 🎓 CampusLearn

CampusLearn is a full-stack Learning Management System (LMS) designed to provide a centralized academic platform for students, lecturers, and administrators.

The system combines traditional learning-management features with AI-powered academic assistance, allowing users to manage courses, lessons, assignments, submissions, grades, notifications, and academic activities through dedicated role-based portals.

---

## ✨ Features

### 👨‍🎓 Student Portal

- Secure student authentication
- Personalized dashboard
- View enrolled courses
- Access lessons and learning materials
- View assignments and deadlines
- Submit assignment files
- View grades and academic progress
- Receive notifications
- AI Study Tutor
- Student profile management
- Profile picture upload
- Account settings
- Change password

---

### 👨‍🏫 Lecturer Portal

- Lecturer dashboard
- Create and manage courses
- Degree and batch-based course targeting
- Add lessons and learning materials
- Edit and delete lessons
- Replace lesson materials
- Create assignments
- Degree and batch-based assignment targeting
- Edit assignments
- View student submissions
- Grade student work
- View students
- Lecturer notifications
- AI Teaching Assistant
- Lecturer profile and settings

---

### 🛡️ Administrator Portal

- Administrative dashboard
- User management
- Create Student, Lecturer, and Administrator accounts
- Automatic login credential generation
- Edit users
- Enable and disable accounts
- Delete users
- Manage student degree and batch information
- View students
- View courses
- Academic reports
- System notifications
- Administrator profile
- System settings

---

## 🔐 Security & Access Control

CampusLearn uses role-based access control with three main roles:

- STUDENT
- LECTURER
- ADMIN

Protected routes ensure that users can access only the pages and resources permitted for their role.

Student access to courses and assignments is also controlled using exact:

- Degree
- Batch

matching.

---

## 🎓 Supported Degree Programs

- BSc (Hons) Software Engineering
- BSc (Hons) Computer Science
- BSc (Hons) Data Science
- BSc (Hons) Computer Security
- BSc (Hons) Computer Networks
- BSc (Hons) Artificial Intelligence
- BSc (Hons) Technology Management

---

## 🗓️ Supported Batches

- 24.1
- 24.2
- 25.1
- 25.2
- 26.1
- 26.2

---

## 🤖 AI Features

CampusLearn includes AI-powered learning support.

### AI Study Tutor

Available to students for academic assistance and learning support.

### AI Teaching Assistant

Available to lecturers to support teaching-related activities.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- Google GenAI integration

### Database

- PostgreSQL

---

## 📁 Project Structure

```text
CampusLearn/
│
├── backend/
│   ├── uploads/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── pages/
│   │   └── styles/
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md
