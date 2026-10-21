const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const crypto = require("crypto");

/* =========================================
   POSTGRESQL CONNECTION
========================================= */

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});


pool.connect()
    .then(() =>
        console.log(
            '✅ Connected to PostgreSQL Database successfully!'
        )
    )
    .catch(err =>
        console.error(
            '❌ Database connection error',
            err.stack
        )
    );


/* =========================================
   FILE UPLOAD CONFIGURATION
========================================= */

const uploadDir =
    path.join(__dirname, 'uploads');


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                'uploads/'
            );

        },


        filename: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                Date.now() +
                '-' +
                file.originalname
            );

        }

    });


const upload =
    multer({
        storage: storage
    });

/* =========================================
   PROFILE IMAGE UPLOAD CONFIGURATION
========================================= */

const profileUpload =
    multer({

        storage: storage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter: (
            req,
            file,
            cb
        ) => {

            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];


            if (
                allowedTypes.includes(
                    file.mimetype
                )
            ) {

                cb(
                    null,
                    true
                );

            } else {

                cb(
                    new Error(
                        'Only JPG, JPEG, PNG and WEBP images are allowed.'
                    )
                );

            }

        }

    });

/* =========================================
   AUTHENTICATE TOKEN
========================================= */

/* =========================================
   AUTHENTICATE TOKEN
   + MAINTENANCE MODE CHECK
========================================= */

const authenticateToken = (
    req,
    res,
    next
) => {

    const authHeader =
        req.headers['authorization'];


    const token =
        authHeader &&
        authHeader.split(' ')[1];


    if (!token) {

        return res
            .status(401)
            .json({
                error:
                    'Access denied. Please log in.'
            });

    }


    jwt.verify(
        token,
        process.env.JWT_SECRET,
        async (err, user) => {

            if (err) {

                return res
                    .status(403)
                    .json({
                        error:
                            'Invalid or expired token.'
                    });

            }


            try {

                /* =================================
                   MAINTENANCE MODE

                   ADMIN is always allowed.
                ================================= */

                if (
                    user.role !==
                    'ADMIN'
                ) {

                    const settings =
                        await pool.query(
                            `
                            SELECT
                                maintenance_mode
                            FROM system_settings
                            ORDER BY id ASC
                            LIMIT 1
                            `
                        );


                    const maintenanceMode =
                        settings.rows.length >
                            0 &&
                        settings.rows[0]
                            .maintenance_mode ===
                            true;


                    if (
                        maintenanceMode
                    ) {

                        return res
                            .status(503)
                            .json({
                                error:
                                    'CampusLearn is currently under maintenance. Please try again later.',

                                maintenanceMode:
                                    true
                            });

                    }

                }


                req.user =
                    user;


                next();


            } catch (error) {

                console.error(
                    'Maintenance Check Error:',
                    error.message
                );


                return res
                    .status(500)
                    .json({
                        error:
                            'Server error while checking system availability.'
                    });

            }

        }
    );

};


/* =========================================
   AUTHORIZE ROLES
========================================= */

const authorizeRoles =
    (...allowedRoles) => {

        return (
            req,
            res,
            next
        ) => {

            if (
                !req.user ||
                !allowedRoles.includes(
                    req.user.role
                )
            ) {

                return res
                    .status(403)
                    .json({
                        error:
                            'Access denied. You do not have permission to view this.'
                    });

            }


            next();

        };

    };


/* =========================================
   HOME
========================================= */

app.get(
    '/',
    (req, res) => {

        res.send(
            'CampusLearn Backend is running!'
        );

    }
);






/* =========================================
   LOGIN
========================================= */

app.post(
    '/login',
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            /* =========================================
               REQUIRED FIELDS
            ========================================= */

            if (
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Email and password are required.'
                    });

            }


            /* =========================================
               FIND USER
            ========================================= */

            const cleanEmail =
                email
                    .trim()
                    .toLowerCase();


            const user =
                await pool.query(
                    `
                    SELECT *
                    FROM users
                    WHERE LOWER(email) =
                          LOWER($1)
                    `,
                    [
                        cleanEmail
                    ]
                );


            if (
                user.rows.length === 0
            ) {

                return res
                    .status(401)
                    .json({
                        error:
                            'Invalid email or password'
                    });

            }


            const currentUser =
                user.rows[0];


            /* =========================================
               CHECK IF ACCOUNT IS ACTIVE
            ========================================= */

            if (
                currentUser.is_active === false
            ) {

                return res
                    .status(403)
                    .json({
                        error:
                            'Your account has been disabled. Please contact an administrator.'
                    });

            }


            /* =========================================
               CHECK PASSWORD
            ========================================= */

            const validPassword =
                await bcrypt.compare(
                    password,
                    currentUser.password_hash
                );


            if (!validPassword) {

                return res
                    .status(401)
                    .json({
                        error:
                            'Invalid email or password'
                    });

            }


            /* =========================================
               MAINTENANCE MODE LOGIN CHECK
            ========================================= */

            if (
                currentUser.role !==
                'ADMIN'
            ) {

                const settings =
                    await pool.query(
                        `
                        SELECT
                            maintenance_mode
                        FROM system_settings
                        ORDER BY id ASC
                        LIMIT 1
                        `
                    );


                const maintenanceMode =
                    settings.rows.length >
                        0 &&
                    settings.rows[0]
                        .maintenance_mode ===
                        true;


                if (
                    maintenanceMode
                ) {

                    return res
                        .status(503)
                        .json({
                            error:
                                'CampusLearn is currently under maintenance. Please try again later.',

                            maintenanceMode:
                                true
                        });

                }

            }


            /* =========================================
               UPDATE LAST LOGIN
            ========================================= */

            await pool.query(
                `
                UPDATE users
                SET last_login =
                    CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [
                    currentUser.id
                ]
            );


            /* =========================================
               CREATE JWT TOKEN
            ========================================= */

            const token =
                jwt.sign(
                    {
                        user_id:
                            currentUser.id,

                        role:
                            currentUser.role
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: '1h'
                    }
                );


            /* =========================================
               LOGIN RESPONSE
            ========================================= */

            res.json({

                message:
                    'Login successful!',

                token,

                role:
                    currentUser.role,

                must_change_password:
                    currentUser
                        .must_change_password ===
                    true

            });


        } catch (err) {

            console.error(
                'Login Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);

/* =========================================
   GET CURRENT LOGGED-IN USER
========================================= */

app.get(
    '/me',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const user =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        degree,
                        batch,
                        student_number,
                        profile_image,
                        last_login,
                        is_active,
                        must_change_password
                    FROM users
                    WHERE id = $1
                    `,
                    [
                        userId
                    ]
                );


            if (
                user.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User not found'
                    });

            }


            res.json(
                user.rows[0]
            );


        } catch (err) {

            console.error(
                'Get User Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);

/* =========================================
   UPDATE STUDENT PROFILE IMAGE
========================================= */

app.put(
    '/me/profile-image',

    authenticateToken,

    authorizeRoles('STUDENT'),

    profileUpload.single(
        'profileImage'
    ),

    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const file =
                req.file;


            if (!file) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please select a profile picture.'
                    });

            }


            const profileImagePath =
                file.path
                    .replace(
                        /\\/g,
                        '/'
                    );


            const updatedUser =
                await pool.query(
                    `
                    UPDATE users

                    SET
                        profile_image = $1

                    WHERE id = $2

                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        degree,
                        batch,
                        student_number,
                        profile_image
                    `,
                    [
                        profileImagePath,
                        userId
                    ]
                );


            if (
                updatedUser.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Student not found.'
                    });

            }


            res.json({

                message:
                    'Profile picture updated successfully!',

                user:
                    updatedUser.rows[0]

            });


        } catch (error) {

            console.error(
                'Update Profile Image Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating profile picture.'
                });

        }

    }
);

/* =========================================
   SUBJECTS
========================================= */

app.post(
    '/subjects',
    authenticateToken,
    async (req, res) => {

        try {

            const {
                name,
                description
            } = req.body;


            const userId =
                req.user.user_id;


            const newSubject =
                await pool.query(
                    `
                    INSERT INTO subjects
                    (
                        user_id,
                        name,
                        description
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )
                    RETURNING *
                    `,
                    [
                        userId,
                        name,
                        description
                    ]
                );


            res.json({
                message:
                    'Subject created!',

                subject:
                    newSubject.rows[0]
            });


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


app.get(
    '/subjects',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const subjects =
                await pool.query(
                    `
                    SELECT *
                    FROM subjects
                    WHERE user_id = $1
                    `,
                    [
                        userId
                    ]
                );


            res.json(
                subjects.rows
            );


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


/* =========================================
   NOTES
========================================= */

app.post(
    '/notes',
    authenticateToken,
    async (req, res) => {

        try {

            const {
                subject_id,
                title,
                content
            } = req.body;


            const userId =
                req.user.user_id;


            const newNote =
                await pool.query(
                    `
                    INSERT INTO notes
                    (
                        user_id,
                        subject_id,
                        title,
                        content
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    RETURNING *
                    `,
                    [
                        userId,
                        subject_id,
                        title,
                        content
                    ]
                );


            res.json({
                message:
                    'Note created!',

                note:
                    newNote.rows[0]
            });


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


app.get(
    '/notes',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const notes =
                await pool.query(
                    `
                    SELECT *
                    FROM notes
                    WHERE user_id = $1
                    `,
                    [
                        userId
                    ]
                );


            res.json(
                notes.rows
            );


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


/* =========================================
   TASKS
========================================= */

app.post(
    '/tasks',
    authenticateToken,
    async (req, res) => {

        try {

            const {
                subject_id,
                title,
                description,
                due_date,
                priority
            } = req.body;


            const userId =
                req.user.user_id;


            const newTask =
                await pool.query(
                    `
                    INSERT INTO tasks
                    (
                        user_id,
                        subject_id,
                        title,
                        description,
                        due_date,
                        priority
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    )
                    RETURNING *
                    `,
                    [
                        userId,
                        subject_id,
                        title,
                        description,
                        due_date,
                        priority
                    ]
                );


            res.json({
                message:
                    'Task created!',

                task:
                    newTask.rows[0]
            });


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


app.get(
    '/tasks',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const tasks =
                await pool.query(
                    `
                    SELECT *
                    FROM tasks
                    WHERE user_id = $1
                    `,
                    [
                        userId
                    ]
                );


            res.json(
                tasks.rows
            );


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


/* =========================================
   COURSES
========================================= */

app.post(
    '/courses',
    authenticateToken,
    authorizeRoles(
        'LECTURER',
        'ADMIN'
    ),
    upload.single('file'),
    async (req, res) => {

        try {

            const {
                courseTitle,
                degree,
                batch,
                lecturerId
            } = req.body;


            /* =====================================
               VALIDATION
            ===================================== */

            if (
                !courseTitle ||
                !courseTitle.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Course title is required.'
                    });

            }


            if (
                !degree ||
                !degree.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Degree / program is required.'
                    });

            }


            if (
                !batch ||
                !batch.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Batch is required.'
                    });

            }


            /* =====================================
               OPTIONAL COURSE FILE
            ===================================== */

            const filePath =
                req.file
                    ? req.file.path
                    : null;


            /* =====================================
               DETERMINE LECTURER
            ===================================== */

            let finalLecturerId =
                null;


            /*
              Lecturer creates course:
              automatically assign themselves.
            */

            if (
                req.user.role ===
                'LECTURER'
            ) {

                finalLecturerId =
                    Number(
                        req.user.user_id
                    );

            }


            /*
              Admin creates course:
              use lecturer selected in frontend.
            */

            if (
                req.user.role ===
                'ADMIN'
            ) {

                finalLecturerId =
                    lecturerId
                        ? Number(
                            lecturerId
                          )
                        : null;

            }


            /* =====================================
               VALIDATE SELECTED LECTURER
            ===================================== */

            if (finalLecturerId) {

                if (
                    !Number.isInteger(
                        finalLecturerId
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            error:
                                'Invalid lecturer ID.'
                        });

                }


                const lecturerCheck =
                    await pool.query(
                        `
                        SELECT
                            id,
                            name,
                            email,
                            role,
                            is_active
                        FROM users
                        WHERE id = $1
                        `,
                        [
                            finalLecturerId
                        ]
                    );


                if (
                    lecturerCheck
                        .rows.length ===
                    0
                ) {

                    return res
                        .status(404)
                        .json({
                            error:
                                'Selected lecturer was not found.'
                        });

                }


                if (
                    lecturerCheck
                        .rows[0]
                        .role !==
                    'LECTURER'
                ) {

                    return res
                        .status(400)
                        .json({
                            error:
                                'Selected user is not a lecturer.'
                        });

                }


                if (
                    lecturerCheck
                        .rows[0]
                        .is_active ===
                    false
                ) {

                    return res
                        .status(400)
                        .json({
                            error:
                                'Selected lecturer account is disabled.'
                        });

                }

            }


            /* =====================================
               CREATE COURSE
            ===================================== */

            const newCourse =
                await pool.query(
                    `
                    INSERT INTO courses
                    (
                        title,
                        degree,
                        batch,
                        file_path,
                        lecturer_id
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
                    RETURNING *
                    `,
                    [
                        courseTitle.trim(),
                        degree.trim(),
                        batch.trim(),
                        filePath,
                        finalLecturerId
                    ]
                );


            res
                .status(201)
                .json({
                    message:
                        'Course created successfully!',

                    course:
                        newCourse.rows[0]
                });


        } catch (error) {

            console.error(
                'Create Course Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while creating course.'
                });

        }

    }
);


app.get(
    '/courses',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const userRole =
                req.user.role;


            if (
                userRole === 'ADMIN' ||
                userRole === 'LECTURER'
            ) {

                const courses =
                    await pool.query(
                        `
                        SELECT *
                        FROM courses
                        ORDER BY id ASC
                        `
                    );


                return res.json(
                    courses.rows
                );

            }


            const userResult =
                await pool.query(
                    `
                    SELECT
                        degree,
                        batch
                    FROM users
                    WHERE id = $1
                    `,
                    [
                        userId
                    ]
                );


            if (
                userResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User profile not found'
                    });

            }


            const {
                degree,
                batch
            } =
                userResult.rows[0];


            const courses =
                await pool.query(
                    `
                    SELECT *
                    FROM courses
                    WHERE degree = $1
                    AND batch = $2
                    ORDER BY id ASC
                    `,
                    [
                        degree,
                        batch
                    ]
                );


            res.json(
                courses.rows
            );


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


/* =========================================
   GET SINGLE COURSE - SECURE ACCESS
========================================= */

app.get(
    '/courses/:courseId',

    authenticateToken,

    async (req, res) => {

        try {

            const {
                courseId
            } = req.params;


            const userId =
                req.user.user_id;


            const userRole =
                req.user.role;


            /* =================================
               FIND COURSE
            ================================= */

            const courseResult =
                await pool.query(
                    `
                    SELECT *
                    FROM courses
                    WHERE id = $1
                    `,
                    [
                        courseId
                    ]
                );


            if (
                courseResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Course not found.'
                    });

            }


            const course =
                courseResult.rows[0];


            /* =================================
               ADMIN ACCESS
            ================================= */

            if (
                userRole === 'ADMIN'
            ) {

                return res.json(
                    course
                );

            }


            /* =================================
               LECTURER ACCESS
               Must own the course
            ================================= */

            if (
                userRole === 'LECTURER'
            ) {

                if (
                    Number(
                        course.lecturer_id
                    ) !==
                    Number(
                        userId
                    )
                ) {

                    return res
                        .status(403)
                        .json({
                            error:
                                'You do not have permission to access this course.'
                        });

                }


                return res.json(
                    course
                );

            }


            /* =================================
               STUDENT ACCESS
               Degree + Batch must match
            ================================= */

            if (
                userRole === 'STUDENT'
            ) {

                const studentResult =
                    await pool.query(
                        `
                        SELECT
                            degree,
                            batch

                        FROM users

                        WHERE
                            id = $1
                            AND role = 'STUDENT'
                        `,
                        [
                            userId
                        ]
                    );


                if (
                    studentResult.rows.length === 0
                ) {

                    return res
                        .status(404)
                        .json({
                            error:
                                'Student profile not found.'
                        });

                }


                const student =
                    studentResult.rows[0];


                if (
                    student.degree !==
                        course.degree ||

                    student.batch !==
                        course.batch
                ) {

                    return res
                        .status(403)
                        .json({
                            error:
                                'You are not enrolled in this course.'
                        });

                }


                return res.json(
                    course
                );

            }


            return res
                .status(403)
                .json({
                    error:
                        'Access denied.'
                });


        } catch (error) {

            console.error(
                'Get Course Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while loading course.'
                });

        }

    }
);


/* =========================================
   GET COURSE LESSONS - SECURE ACCESS
========================================= */

app.get(
    '/courses/:courseId/lessons',

    authenticateToken,

    async (req, res) => {

        try {

            const {
                courseId
            } = req.params;


            const userId =
                req.user.user_id;


            const userRole =
                req.user.role;


            /* =================================
               FIND COURSE
            ================================= */

            const courseResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        degree,
                        batch,
                        lecturer_id

                    FROM courses

                    WHERE id = $1
                    `,
                    [
                        courseId
                    ]
                );


            if (
                courseResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Course not found.'
                    });

            }


            const course =
                courseResult.rows[0];


            /* =================================
               ACCESS CHECK
            ================================= */

            let hasAccess =
                false;


            /* ADMIN */

            if (
                userRole === 'ADMIN'
            ) {

                hasAccess =
                    true;

            }


            /* LECTURER */

            if (
                userRole === 'LECTURER' &&
                Number(
                    course.lecturer_id
                ) ===
                Number(
                    userId
                )
            ) {

                hasAccess =
                    true;

            }


            /* STUDENT */

            if (
                userRole === 'STUDENT'
            ) {

                const studentResult =
                    await pool.query(
                        `
                        SELECT
                            degree,
                            batch

                        FROM users

                        WHERE
                            id = $1
                            AND role = 'STUDENT'
                        `,
                        [
                            userId
                        ]
                    );


                if (
                    studentResult.rows.length > 0
                ) {

                    const student =
                        studentResult.rows[0];


                    if (
                        student.degree ===
                            course.degree &&

                        student.batch ===
                            course.batch
                    ) {

                        hasAccess =
                            true;

                    }

                }

            }


            /* =================================
               BLOCK UNAUTHORIZED USER
            ================================= */

            if (!hasAccess) {

                return res
                    .status(403)
                    .json({
                        error:
                            'You do not have permission to access these lessons.'
                    });

            }


            /* =================================
               LOAD LESSONS
            ================================= */

            const lessonsResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        course_id,
                        title,
                        content,
                        order_number,
                        file_path

                    FROM lessons

                    WHERE course_id = $1

                    ORDER BY
                        order_number ASC,
                        id ASC
                    `,
                    [
                        courseId
                    ]
                );


            res.json(
                lessonsResult.rows
            );


        } catch (error) {

            console.error(
                'Get Course Lessons Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while loading lessons.'
                });

        }

    }
);

/* =========================================
   ADD LESSON BY LECTURER
========================================= */

app.post(
    '/lecturer/courses/:courseId/lessons',

    authenticateToken,

    authorizeRoles('LECTURER'),

    upload.single('file'),

    async (req, res) => {

        try {

            const {
                courseId
            } = req.params;


            const {
                title,
                content,
                orderNumber
            } = req.body;


            const lecturerId =
                req.user.user_id;


            const file =
                req.file;


            /* =================================
               VALIDATE TITLE
            ================================= */

            if (
                !title ||
                !title.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Lesson title is required.'
                    });

            }


            /* =================================
               REQUIRE LEARNING MATERIAL
            ================================= */

            if (!file) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please upload a lesson material file.'
                    });

            }


            /* =================================
               CHECK COURSE OWNERSHIP
            ================================= */

            const courseResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        title,
                        degree,
                        batch,
                        lecturer_id

                    FROM courses

                    WHERE
                        id = $1
                        AND lecturer_id = $2
                    `,
                    [
                        courseId,
                        lecturerId
                    ]
                );


            if (
                courseResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Course not found or you do not have permission to add lessons to it.'
                    });

            }


            /* =================================
               LESSON ORDER
            ================================= */

            let finalOrderNumber =
                Number(orderNumber);


            if (
                !Number.isInteger(
                    finalOrderNumber
                ) ||
                finalOrderNumber <= 0
            ) {

                const orderResult =
                    await pool.query(
                        `
                        SELECT
                            COALESCE(
                                MAX(order_number),
                                0
                            ) + 1
                            AS next_order

                        FROM lessons

                        WHERE course_id = $1
                        `,
                        [
                            courseId
                        ]
                    );


                finalOrderNumber =
                    Number(
                        orderResult.rows[0]
                            .next_order
                    );

            }


            /* =================================
               CREATE LESSON
            ================================= */

            const lessonResult =
                await pool.query(
                    `
                    INSERT INTO lessons
                    (
                        course_id,
                        title,
                        content,
                        order_number,
                        file_path
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )

                    RETURNING *
                    `,
                    [
                        courseId,
                        title.trim(),
                        content?.trim() || null,
                        finalOrderNumber,
                        file.path
                    ]
                );


            /* =================================
               SUCCESS
            ================================= */

            res
                .status(201)
                .json({

                    message:
                        'Lesson added successfully!',

                    lesson:
                        lessonResult.rows[0]

                });


        } catch (error) {

            console.error(
                'Add Lesson Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while adding lesson.'
                });

        }

    }
);

/* =========================================
   UPDATE LESSON BY LECTURER
========================================= */

app.put(
    '/lecturer/courses/:courseId/lessons/:lessonId',

    authenticateToken,

    authorizeRoles('LECTURER'),

    upload.single('file'),

    async (req, res) => {

        try {

            const {
                courseId,
                lessonId
            } = req.params;


            const {
                title,
                content,
                orderNumber
            } = req.body;


            const lecturerId =
                req.user.user_id;


            /* =================================
               VALIDATE TITLE
            ================================= */

            if (
                !title ||
                !title.trim()
            ) {

                /*
                  Multer has already saved the
                  newly uploaded file, so remove
                  it if validation fails.
                */

                if (
                    req.file &&
                    fs.existsSync(
                        req.file.path
                    )
                ) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res
                    .status(400)
                    .json({
                        error:
                            'Lesson title is required.'
                    });

            }


            /* =================================
               CHECK COURSE + LESSON OWNERSHIP

               This confirms:
               1. Course belongs to lecturer
               2. Lesson belongs to course
            ================================= */

            const lessonCheck =
                await pool.query(
                    `
                    SELECT
                        l.id,
                        l.course_id,
                        l.title,
                        l.content,
                        l.order_number,
                        l.file_path,
                        c.lecturer_id

                    FROM lessons l

                    JOIN courses c
                        ON c.id =
                           l.course_id

                    WHERE
                        l.id = $1
                        AND l.course_id = $2
                        AND c.lecturer_id = $3
                    `,
                    [
                        lessonId,
                        courseId,
                        lecturerId
                    ]
                );


            if (
                lessonCheck.rows.length ===
                0
            ) {

                /*
                  Remove newly uploaded file
                  because this lecturer is not
                  allowed to edit the lesson.
                */

                if (
                    req.file &&
                    fs.existsSync(
                        req.file.path
                    )
                ) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res
                    .status(404)
                    .json({
                        error:
                            'Lesson not found or you do not have permission to edit it.'
                    });

            }


            const existingLesson =
                lessonCheck.rows[0];


            /* =================================
               LESSON ORDER

               If no new order is provided,
               keep the existing order.
            ================================= */

            let finalOrderNumber =
                existingLesson.order_number;


            if (
                orderNumber !== undefined &&
                orderNumber !== null &&
                String(orderNumber).trim() !==
                    ''
            ) {

                const parsedOrder =
                    Number(orderNumber);


                if (
                    !Number.isInteger(
                        parsedOrder
                    ) ||
                    parsedOrder <= 0
                ) {

                    if (
                        req.file &&
                        fs.existsSync(
                            req.file.path
                        )
                    ) {

                        fs.unlinkSync(
                            req.file.path
                        );

                    }


                    return res
                        .status(400)
                        .json({
                            error:
                                'Lesson order must be a positive whole number.'
                        });

                }


                finalOrderNumber =
                    parsedOrder;

            }


            /* =================================
               MATERIAL FILE

               No new file:
               keep old material.

               New file:
               replace old material.
            ================================= */

            let finalFilePath =
                existingLesson.file_path;


            if (req.file) {

                finalFilePath =
                    req.file.path
                        .replace(
                            /\\/g,
                            '/'
                        );

            }


            /* =================================
               UPDATE LESSON
            ================================= */

            const updatedLesson =
                await pool.query(
                    `
                    UPDATE lessons

                    SET
                        title = $1,
                        content = $2,
                        order_number = $3,
                        file_path = $4

                    WHERE
                        id = $5
                        AND course_id = $6

                    RETURNING *
                    `,
                    [
                        title.trim(),

                        content?.trim() ||
                            null,

                        finalOrderNumber,

                        finalFilePath,

                        lessonId,

                        courseId
                    ]
                );


            /* =================================
               REMOVE OLD MATERIAL

               Only remove it after PostgreSQL
               successfully updates the lesson.
            ================================= */

            if (
                req.file &&
                existingLesson.file_path &&
                existingLesson.file_path !==
                    finalFilePath
            ) {

                try {

                    const oldFilePath =
                        path.isAbsolute(
                            existingLesson
                                .file_path
                        )
                            ? existingLesson
                                .file_path
                            : path.join(
                                __dirname,
                                existingLesson
                                    .file_path
                              );


                    if (
                        fs.existsSync(
                            oldFilePath
                        )
                    ) {

                        fs.unlinkSync(
                            oldFilePath
                        );

                    }

                } catch (
                    fileError
                ) {

                    console.error(
                        'Old lesson material cleanup warning:',
                        fileError.message
                    );

                }

            }


            /* =================================
               SUCCESS
            ================================= */

            res.json({

                message:
                    'Lesson updated successfully!',

                lesson:
                    updatedLesson.rows[0]

            });


        } catch (error) {

            /*
              If something failed after Multer
              uploaded a new replacement file,
              try to remove that unused file.
            */

            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch (
                    fileError
                ) {

                    console.error(
                        'Uploaded lesson file cleanup warning:',
                        fileError.message
                    );

                }

            }


            console.error(
                'Update Lesson Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating lesson.'
                });

        }

    }
);


/* =========================================
   DELETE LESSON BY LECTURER
========================================= */

app.delete(
    '/lecturer/courses/:courseId/lessons/:lessonId',

    authenticateToken,

    authorizeRoles('LECTURER'),

    async (req, res) => {

        try {

            const {
                courseId,
                lessonId
            } = req.params;


            const lecturerId =
                req.user.user_id;


            /* =================================
               CHECK COURSE + LESSON OWNERSHIP
            ================================= */

            const lessonCheck =
                await pool.query(
                    `
                    SELECT
                        l.id,
                        l.course_id,
                        l.title,
                        l.file_path,
                        c.lecturer_id

                    FROM lessons l

                    JOIN courses c
                        ON c.id =
                           l.course_id

                    WHERE
                        l.id = $1
                        AND l.course_id = $2
                        AND c.lecturer_id = $3
                    `,
                    [
                        lessonId,
                        courseId,
                        lecturerId
                    ]
                );


            if (
                lessonCheck.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Lesson not found or you do not have permission to delete it.'
                    });

            }


            const lesson =
                lessonCheck.rows[0];


            /* =================================
               DELETE LESSON FROM DATABASE
            ================================= */

            const deletedLesson =
                await pool.query(
                    `
                    DELETE FROM lessons

                    WHERE
                        id = $1
                        AND course_id = $2

                    RETURNING *
                    `,
                    [
                        lessonId,
                        courseId
                    ]
                );


            /* =================================
               DELETE LESSON MATERIAL FILE

               Database deletion happens first.
               A file cleanup problem should not
               restore the deleted lesson.
            ================================= */

            if (
                lesson.file_path
            ) {

                try {

                    const materialPath =
                        path.isAbsolute(
                            lesson.file_path
                        )
                            ? lesson.file_path
                            : path.join(
                                __dirname,
                                lesson.file_path
                              );


                    if (
                        fs.existsSync(
                            materialPath
                        )
                    ) {

                        fs.unlinkSync(
                            materialPath
                        );

                    }

                } catch (
                    fileError
                ) {

                    console.error(
                        'Lesson material cleanup warning:',
                        fileError.message
                    );

                }

            }


            /* =================================
               SUCCESS
            ================================= */

            res.json({

                message:
                    'Lesson deleted successfully!',

                lesson:
                    deletedLesson.rows[0]

            });


        } catch (error) {

            console.error(
                'Delete Lesson Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while deleting lesson.'
                });

        }

    }
);

/* =========================================
   UPDATE COURSE BY ADMIN
========================================= */

app.put(
    '/admin/courses/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    upload.single('file'),
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                courseTitle,
                degree,
                batch,
                lecturerId
            } = req.body;


            /* ==============================
               CHECK COURSE EXISTS
            ============================== */

            const existingCourse =
                await pool.query(
                    `
                    SELECT *
                    FROM courses
                    WHERE id = $1
                    `,
                    [
                        id
                    ]
                );


            if (
                existingCourse.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Course not found.'
                    });

            }


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !courseTitle ||
                !courseTitle.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Course title is required.'
                    });

            }


            if (
                !degree ||
                !degree.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Program is required.'
                    });

            }


            if (
                !batch ||
                !batch.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Batch is required.'
                    });

            }


            /* ==============================
               LECTURER
            ============================== */

            let finalLecturerId =
                lecturerId
                    ? Number(
                        lecturerId
                      )
                    : null;


            if (finalLecturerId) {

                const lecturerCheck =
                    await pool.query(
                        `
                        SELECT
                            id,
                            role,
                            is_active
                        FROM users
                        WHERE id = $1
                        `,
                        [
                            finalLecturerId
                        ]
                    );


                if (
                    lecturerCheck.rows.length ===
                    0
                ) {

                    return res
                        .status(404)
                        .json({
                            error:
                                'Selected lecturer was not found.'
                        });

                }


                if (
                    lecturerCheck.rows[0].role !==
                    'LECTURER'
                ) {

                    return res
                        .status(400)
                        .json({
                            error:
                                'Selected user is not a lecturer.'
                        });

                }


                if (
                    lecturerCheck.rows[0]
                        .is_active ===
                    false
                ) {

                    return res
                        .status(400)
                        .json({
                            error:
                                'Selected lecturer is disabled.'
                        });

                }

            }


            /* ==============================
               FILE

               If admin uploads a new file,
               replace old file path.

               Otherwise keep old file.
            ============================== */

            let finalFilePath =
                existingCourse
                    .rows[0]
                    .file_path;


            if (req.file) {

                finalFilePath =
                    req.file.path;

            }


            /* ==============================
               UPDATE COURSE
            ============================== */

            const updatedCourse =
                await pool.query(
                    `
                    UPDATE courses

                    SET
                        title = $1,
                        degree = $2,
                        batch = $3,
                        lecturer_id = $4,
                        file_path = $5

                    WHERE id = $6

                    RETURNING *
                    `,
                    [
                        courseTitle.trim(),
                        degree.trim(),
                        batch.trim(),
                        finalLecturerId,
                        finalFilePath,
                        id
                    ]
                );


            res.json({
                message:
                    'Course updated successfully!',

                course:
                    updatedCourse.rows[0]
            });


        } catch (error) {

            console.error(
                'Update Course Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating course.'
                });

        }

    }
);

/* =========================================
   DELETE COURSE BY ADMIN
========================================= */

/* =========================================
   DELETE COURSE BY ADMIN
========================================= */

app.delete(
    '/admin/courses/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        const client =
            await pool.connect();

        try {

            const {
                id
            } = req.params;


            /* ==============================
               START TRANSACTION
            ============================== */

            await client.query(
                'BEGIN'
            );


            /* ==============================
               CHECK COURSE EXISTS
            ============================== */

            const existingCourse =
                await client.query(
                    `
                    SELECT *
                    FROM courses
                    WHERE id = $1
                    `,
                    [
                        id
                    ]
                );


            if (
                existingCourse.rows.length ===
                0
            ) {

                await client.query(
                    'ROLLBACK'
                );


                return res
                    .status(404)
                    .json({
                        error:
                            'Course not found.'
                    });

            }


            const course =
                existingCourse.rows[0];


            /* ==============================
               DELETE COURSE LESSONS
            ============================== */

            await client.query(
                `
                DELETE FROM lessons
                WHERE course_id = $1
                `,
                [
                    id
                ]
            );


            /* ==============================
               DELETE COURSE
            ============================== */

            const deletedCourse =
                await client.query(
                    `
                    DELETE FROM courses
                    WHERE id = $1

                    RETURNING *
                    `,
                    [
                        id
                    ]
                );


            /* ==============================
               COMMIT
            ============================== */

            await client.query(
                'COMMIT'
            );


            /* ==============================
               DELETE MAIN COURSE FILE

               Do this AFTER database delete.
               A file problem should not stop
               PostgreSQL from deleting course.
            ============================== */

            if (
                course.file_path &&
                fs.existsSync(
                    course.file_path
                )
            ) {

                try {

                    fs.unlinkSync(
                        course.file_path
                    );

                } catch (fileError) {

                    console.error(
                        'Course file cleanup warning:',
                        fileError.message
                    );

                }

            }


            /* ==============================
               SUCCESS
            ============================== */

            res.json({

                message:
                    'Course deleted successfully!',

                course:
                    deletedCourse.rows[0]

            });


        } catch (error) {

            try {

                await client.query(
                    'ROLLBACK'
                );

            } catch (
                rollbackError
            ) {

                console.error(
                    'Rollback Error:',
                    rollbackError.message
                );

            }


            console.error(
                'Delete Course Error:',
                error.message
            );

            console.error(
                'PostgreSQL Error Code:',
                error.code
            );


            if (
                error.code ===
                '23503'
            ) {

                return res
                    .status(409)
                    .json({
                        error:
                            'This course has related records and cannot be deleted yet.'
                    });

            }


            res
                .status(500)
                .json({
                    error:
                        'Server error while deleting course.'
                });


        } finally {

            client.release();

        }

    }
);

/* =========================================
   ADMIN COURSE SUMMARY
========================================= */

app.get(
    '/admin/courses/summary',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const courses =
                await pool.query(
                    `
                    SELECT
                        c.id,
                        c.title,
                        c.degree,
                        c.batch,
                        c.file_path,
                        c.lecturer_id,


                        /* =====================
                           LECTURER NAME
                        ===================== */

                        COALESCE(
                            lecturer.name,
                            'Not assigned'
                        )
                        AS lecturer_name,


                        /* =====================
                           MATCHING STUDENTS
                        ===================== */

                        (
                            SELECT COUNT(*)

                            FROM users student

                            WHERE
                                student.role = 'STUDENT'

                                AND student.degree =
                                    c.degree

                                AND student.batch =
                                    c.batch
                        )::int
                        AS student_count,


                        /* =====================
                           LESSONS
                        ===================== */

                        (
                            SELECT COUNT(*)

                            FROM lessons l

                            WHERE
                                l.course_id =
                                    c.id
                        )::int
                        AS lesson_count,


                        /* =====================
                           TOTAL MATERIALS

                           Course file = 1
                           Each lesson = 1
                        ===================== */

                        (
                            (
                                CASE

                                    WHEN
                                        c.file_path
                                        IS NOT NULL

                                        AND
                                        c.file_path <> ''

                                    THEN 1

                                    ELSE 0

                                END
                            )

                            +

                            (
                                SELECT COUNT(*)

                                FROM lessons l

                                WHERE
                                    l.course_id =
                                        c.id
                            )
                        )::int
                        AS material_count


                    FROM courses c


                    LEFT JOIN users lecturer

                        ON lecturer.id =
                           c.lecturer_id


                    ORDER BY
                        c.id ASC
                    `
                );


            res.json(
                courses.rows
            );


        } catch (err) {

            console.error(
                'Admin Course Summary Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);


/* =========================================
   ASSIGNMENTS
========================================= */

app.post(
    '/assignments',
    authenticateToken,
    authorizeRoles(
        'LECTURER',
        'ADMIN'
    ),
    upload.single('file'),
    async (req, res) => {

        try {

        const {
            title,
            description,
            dueDate,
            degree,
            batch,
            courseId,
            maxMarks
} = req.body;


            const file =
                req.file;


            const lecturerId =
                req.user.user_id;


            if (!file) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please upload an assignment file (PDF, DOCX, etc.)'
                    });

            }


            const newAssignment =
                await pool.query(
                    `
                    INSERT INTO assignments
                    (
                        title,
                        description,
                        due_date,
                        degree,
                        batch,
                        file_path,
                        lecturer_id,
                        course_id,
                        max_marks
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9
                    )
                    RETURNING *
                    `,
                    [
                        title,
                        description,
                        dueDate,
                        degree,
                        batch,
                        file.path,
                        lecturerId,
                        courseId
                            ? Number(courseId)
                            : null,
                        maxMarks
                            ? Number(maxMarks)
                            : 100
                    ]
                );

                /* =========================================
                    NOTIFY MATCHING STUDENTS
                    ========================================= */

                    const notificationMessage =
                        `New assignment "${title}" has been published for ${degree}, Batch ${batch}.`;


                    await pool.query(
                        `
                        INSERT INTO notifications
                        (
                            user_id,
                            type,
                            title,
                            message,
                            category,
                            is_read
                        )

                        SELECT
                            id,
                            'assignment',
                            'New Assignment Available',
                            $1,
                            'Assignment',
                            FALSE

                        FROM users

                        WHERE
                            role = 'STUDENT'
                            AND degree = $2
                            AND batch = $3
                        `,
                        [
                            notificationMessage,
                            degree,
                            batch
                        ]
                    );


            res
                .status(201)
                .json({
                    message:
                        'Assignment successfully uploaded!',

                    assignment:
                        newAssignment.rows[0]
                });


        } catch (error) {

            console.error(
                'Database Upload Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error during assignment upload'
                });

        }

    }
);


app.get(
    '/assignments',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const userRole =
                req.user.role;


            if (
                userRole === 'ADMIN' ||
                userRole === 'LECTURER'
            ) {

                const assignments =
                    await pool.query(
                        `
                        SELECT
                            a.*,

                            (
                                SELECT COUNT(*)
                                FROM users u

                                WHERE
                                    u.role = 'STUDENT'
                                    AND u.degree = a.degree
                                    AND u.batch = a.batch
                                    AND u.is_active = TRUE
                            )::int AS student_count,

                            (
                                SELECT COUNT(*)
                                FROM submissions s

                                WHERE
                                    s.assignment_id = a.id
                            )::int AS submission_count

                        FROM assignments a

                        ORDER BY
                            a.due_date ASC
                        `
                    );


                return res.json(
                    assignments.rows
                );

            }


            const userResult =
                await pool.query(
                    `
                    SELECT
                        degree,
                        batch
                    FROM users
                    WHERE id = $1
                    `,
                    [
                        userId
                    ]
                );


            if (
                userResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User profile not found'
                    });

            }


            const {
                degree,
                batch
            } =
                userResult.rows[0];


            const assignments =
                await pool.query(
                    `
                    SELECT
                        a.*,

                        EXISTS (
                            SELECT 1
                            FROM submissions s
                            WHERE
                                s.assignment_id = a.id
                                AND s.student_id = $3
                        )
                        AS is_submitted,

                        EXISTS (
                            SELECT 1
                            FROM submissions s
                            WHERE
                                s.assignment_id = a.id
                                AND s.student_id = $3
                                AND s.grade IS NOT NULL
                        )
                        AS is_graded

                    FROM assignments a

                    WHERE
                        a.degree = $1
                        AND a.batch = $2

                    ORDER BY
                        a.due_date ASC
                    `,
                    [
                        degree,
                        batch,
                        userId
                    ]
                );


            res.json(
                assignments.rows
            );


        } catch (err) {

            console.error(
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


/* =========================================
   SUBMISSIONS
========================================= */

app.post(
    '/submissions',
    authenticateToken,
    upload.single('file'),
    async (req, res) => {

        try {

            const {
                assignmentId
            } = req.body;


            const file =
                req.file;


            const studentId =
                req.user.user_id;


            if (!file) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please attach a file to submit.'
                    });

            }


            const existing =
                await pool.query(
                    `
                    SELECT *
                    FROM submissions
                    WHERE
                        assignment_id = $1
                        AND student_id = $2
                    `,
                    [
                        assignmentId,
                        studentId
                    ]
                );


            if (
                existing.rows.length > 0
            ) {

                if (
                    existing.rows[0].grade
                ) {

                    return res
                        .status(403)
                        .json({
                            error:
                                'You cannot resubmit work that has already been graded.'
                        });

                }


                const updatedSubmission =
                    await pool.query(
                        `
                        UPDATE submissions

                        SET
                            file_path = $1,
                            submitted_at =
                                CURRENT_TIMESTAMP

                        WHERE id = $2

                        RETURNING *
                        `,
                        [
                            file.path,
                            existing.rows[0].id
                        ]
                    );


                return res
                    .status(200)
                    .json({
                        message:
                            'Assignment successfully updated and resubmitted! 🔄',

                        submission:
                            updatedSubmission
                                .rows[0]
                    });

            }


            const newSubmission =
                await pool.query(
                    `
                    INSERT INTO submissions
                    (
                        assignment_id,
                        student_id,
                        file_path
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )
                    RETURNING *
                    `,
                    [
                        assignmentId,
                        studentId,
                        file.path
                    ]
                );

            /* =========================================
                NOTIFY LECTURER ABOUT NEW SUBMISSION
                ========================================= */

                const submissionInfo =
                    await pool.query(
                        `
                        SELECT
                            a.lecturer_id,
                            a.title AS assignment_title,
                            u.name AS student_name

                        FROM assignments a

                        JOIN users u
                            ON u.id = $2

                        WHERE
                            a.id = $1
                            AND a.lecturer_id IS NOT NULL
                        `,
                        [
                            assignmentId,
                            studentId
                        ]
                    );


                if (
                    submissionInfo.rows.length > 0
                ) {

                    const info =
                        submissionInfo.rows[0];


                    const notificationMessage =
                        `${info.student_name} submitted "${info.assignment_title}".`;


                    await pool.query(
                        `
                        INSERT INTO notifications
                        (
                            user_id,
                            type,
                            title,
                            message,
                            category,
                            is_read
                        )

                        VALUES
                        (
                            $1,
                            'submission',
                            'New Student Submission',
                            $2,
                            'Submission',
                            FALSE
                        )
                        `,
                        [
                            info.lecturer_id,
                            notificationMessage
                        ]
                    );

                }


            return res
                .status(201)
                .json({
                    message:
                        'Assignment submitted successfully! 🎉',

                    submission:
                        newSubmission.rows[0]
                });


        } catch (error) {

            console.error(
                'Submission Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error during submission'
                });

        }

    }
);


app.get(
    '/submissions',
    authenticateToken,
    authorizeRoles(
        'LECTURER',
        'ADMIN'
    ),
    async (req, res) => {

        try {

            const submissions =
                await pool.query(
                    `
                    SELECT
                        s.id
                            AS submission_id,

                        s.file_path,

                        s.submitted_at,

                        s.grade,

                        s.feedback,

                        a.title
                            AS assignment_title,

                        u.name
                            AS student_name,

                        u.degree,

                        u.batch

                    FROM submissions s

                    JOIN assignments a
                        ON s.assignment_id =
                           a.id

                    JOIN users u
                        ON s.student_id =
                           u.id

                    ORDER BY
                        s.submitted_at DESC
                    `
                );


            res.json(
                submissions.rows
            );


        } catch (err) {

            console.error(
                'Fetch Submissions Error:',
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


app.put(
    '/submissions/:id/grade',

    authenticateToken,

    authorizeRoles(
        'LECTURER',
        'ADMIN'
    ),

    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                marks_awarded,
                feedback
            } = req.body;


            /* ==============================
               GET SUBMISSION DETAILS
            ============================== */

            const submissionResult =
                await pool.query(
                    `
                    SELECT
                        s.id,
                        s.assignment_id,
                        a.max_marks,
                        a.lecturer_id

                    FROM submissions s

                    JOIN assignments a
                        ON a.id =
                           s.assignment_id

                    WHERE s.id = $1
                    `,
                    [
                        id
                    ]
                );


            if (
                submissionResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Submission not found'
                    });

            }


            const submission =
                submissionResult.rows[0];


            /* ==============================
               CHECK LECTURER OWNERSHIP
            ============================== */

            if (
                req.user.role === 'LECTURER' &&
                Number(
                    submission.lecturer_id
                ) !==
                Number(
                    req.user.user_id
                )
            ) {

                return res
                    .status(403)
                    .json({
                        error:
                            'You cannot grade this submission.'
                    });

            }


            /* ==============================
               VALIDATE MARKS
            ============================== */

            const marks =
                Number(
                    marks_awarded
                );


            const maxMarks =
                Number(
                    submission.max_marks
                );


            if (
                marks_awarded === undefined ||
                marks_awarded === null ||
                marks_awarded === '' ||
                Number.isNaN(marks)
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please enter valid marks.'
                    });

            }


            if (
                marks < 0 ||
                marks > maxMarks
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            `Marks must be between 0 and ${maxMarks}.`
                    });

            }


            /* ==============================
               CALCULATE PERCENTAGE
            ============================== */

            const percentage =
                Math.round(
                    (
                        marks /
                        maxMarks
                    ) * 100
                );


            /* ==============================
               CALCULATE GRADE
            ============================== */

            let grade = 'F';


            if (
                percentage >= 80
            ) {

                grade = 'A';

            } else if (
                percentage >= 70
            ) {

                grade = 'B';

            } else if (
                percentage >= 60
            ) {

                grade = 'C';

            } else if (
                percentage >= 50
            ) {

                grade = 'D';

            }


            /* ==============================
               UPDATE SUBMISSION
            ============================== */

            const updatedSubmission =
                await pool.query(
                    `
                    UPDATE submissions

                    SET
                        marks_awarded = $1,
                        grade = $2,
                        feedback = $3

                    WHERE id = $4

                    RETURNING *
                    `,
                    [
                        marks,
                        grade,
                        feedback || '',
                        id
                    ]
                );


            if (
                updatedSubmission
                    .rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Submission not found'
                    });

            }

            /* =========================================
                NOTIFY STUDENT ABOUT GRADE
                ========================================= */

                const gradedSubmission =
                    updatedSubmission.rows[0];


                const assignmentResult =
                    await pool.query(
                        `
                        SELECT title
                        FROM assignments
                        WHERE id = $1
                        `,
                        [
                            gradedSubmission.assignment_id
                        ]
                    );


                const assignmentTitle =
                    assignmentResult.rows.length > 0
                        ? assignmentResult.rows[0].title
                        : 'your assignment';


                const gradeNotificationMessage =
                    `Your assignment "${assignmentTitle}" has been graded. Visit the Grades page to view your result.`;


                await pool.query(
                    `
                    INSERT INTO notifications
                    (
                        user_id,
                        type,
                        title,
                        message,
                        category,
                        is_read
                    )

                    SELECT
                        $1,
                        'grade',
                        'Assignment Graded',
                        $2,
                        'Grade',
                        FALSE

                    WHERE NOT EXISTS
                    (
                        SELECT 1

                        FROM notifications

                        WHERE
                            user_id = $1
                            AND type = 'grade'
                            AND message = $2
                    )
                    `,
                    [
                        gradedSubmission.student_id,
                        gradeNotificationMessage
                    ]
                );


            res.json({
                message:
                    'Grade and feedback saved successfully!',

                submission:
                    updatedSubmission
                        .rows[0]
            });


        } catch (err) {

            console.error(
                'Grading Error:',
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);


/* =========================================
   STUDENT GRADES
========================================= */

app.get(
    '/my-grades',
    authenticateToken,
    async (req, res) => {

        try {

            const studentId =
                req.user.user_id;


            const grades =
                await pool.query(
                    `
                    SELECT
                        s.id
                            AS submission_id,

                        s.submitted_at,

                        s.marks_awarded,

                        s.grade,

                        s.feedback,

                        a.title
                            AS assignment_title,

                        a.max_marks,

                        CASE

                            WHEN
                                s.marks_awarded
                                IS NOT NULL

                                AND
                                a.max_marks
                                IS NOT NULL

                                AND
                                a.max_marks > 0

                            THEN

                                ROUND(
                                    (
                                        s.marks_awarded::numeric
                                        /
                                        a.max_marks::numeric
                                    ) * 100,
                                    2
                                )

                            ELSE NULL

                        END
                            AS percentage

                    FROM submissions s

                    JOIN assignments a

                        ON s.assignment_id =
                           a.id

                    WHERE

                        s.student_id = $1

                        AND
                        s.grade IS NOT NULL

                    ORDER BY

                        s.submitted_at DESC
                    `,
                    [
                        studentId
                    ]
                );


            res.json(
                grades.rows
            );


        } catch (err) {

            console.error(
                'Fetch Grades Error:',
                err.message
            );


            res
                .status(500)
                .send(
                    'Server Error'
                );

        }

    }
);

/* =========================================
   STUDENT NOTIFICATIONS
========================================= */


/* =========================================
   GET MY NOTIFICATIONS
========================================= */

app.get(
    '/notifications',
    authenticateToken,
    authorizeRoles('STUDENT'),
    async (req, res) => {

        try {

            const studentId =
                req.user.user_id;


            const notifications =
                await pool.query(
                    `
                    SELECT
                        id,
                        type,
                        title,
                        message,
                        category,
                        is_read,
                        created_at

                    FROM notifications

                    WHERE user_id = $1

                    ORDER BY
                        created_at DESC
                    `,
                    [
                        studentId
                    ]
                );


            res.json(
                notifications.rows
            );


        } catch (err) {

            console.error(
                'Fetch Notifications Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while loading notifications'
                });

        }

    }
);


/* =========================================
   MARK ONE NOTIFICATION AS READ
========================================= */

app.put(
    '/notifications/:id/read',
    authenticateToken,
    authorizeRoles('STUDENT'),
    async (req, res) => {

        try {

            const studentId =
                req.user.user_id;

            const notificationId =
                req.params.id;


            const result =
                await pool.query(
                    `
                    UPDATE notifications

                    SET is_read = TRUE

                    WHERE
                        id = $1
                        AND user_id = $2

                    RETURNING *
                    `,
                    [
                        notificationId,
                        studentId
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Notification not found'
                    });

            }


            res.json({
                message:
                    'Notification marked as read',
                notification:
                    result.rows[0]
            });


        } catch (err) {

            console.error(
                'Mark Notification Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating notification'
                });

        }

    }
);


/* =========================================
   MARK ALL NOTIFICATIONS AS READ
========================================= */

app.put(
    '/notifications/read-all',
    authenticateToken,
    authorizeRoles('STUDENT'),
    async (req, res) => {

        try {

            const studentId =
                req.user.user_id;


            await pool.query(
                `
                UPDATE notifications

                SET is_read = TRUE

                WHERE
                    user_id = $1
                    AND is_read = FALSE
                `,
                [
                    studentId
                ]
            );


            res.json({
                message:
                    'All notifications marked as read'
            });


        } catch (err) {

            console.error(
                'Mark All Notifications Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating notifications'
                });

        }

    }
);

/* =========================================
   LECTURER NOTIFICATIONS
========================================= */


/* =========================================
   GET LECTURER NOTIFICATIONS
========================================= */

app.get(
    '/lecturer/notifications',
    authenticateToken,
    authorizeRoles('LECTURER'),
    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;


            const notifications =
                await pool.query(
                    `
                    SELECT
                        id,
                        type,
                        title,
                        message,
                        category,
                        is_read,
                        created_at

                    FROM notifications

                    WHERE user_id = $1

                    ORDER BY
                        created_at DESC
                    `,
                    [
                        lecturerId
                    ]
                );


            res.json(
                notifications.rows
            );


        } catch (error) {

            console.error(
                'Fetch Lecturer Notifications Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while loading lecturer notifications.'
                });

        }

    }
);


/* =========================================
   MARK ONE LECTURER NOTIFICATION AS READ
========================================= */

app.put(
    '/lecturer/notifications/:id/read',
    authenticateToken,
    authorizeRoles('LECTURER'),
    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;

            const notificationId =
                req.params.id;


            const result =
                await pool.query(
                    `
                    UPDATE notifications

                    SET is_read = TRUE

                    WHERE
                        id = $1
                        AND user_id = $2

                    RETURNING *
                    `,
                    [
                        notificationId,
                        lecturerId
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Notification not found.'
                    });

            }


            res.json({

                message:
                    'Notification marked as read.',

                notification:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Lecturer Notification Read Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating notification.'
                });

        }

    }
);


/* =========================================
   MARK ALL LECTURER NOTIFICATIONS AS READ
========================================= */

app.put(
    '/lecturer/notifications/read-all',
    authenticateToken,
    authorizeRoles('LECTURER'),
    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;


            await pool.query(
                `
                UPDATE notifications

                SET is_read = TRUE

                WHERE
                    user_id = $1
                    AND is_read = FALSE
                `,
                [
                    lecturerId
                ]
            );


            res.json({
                message:
                    'All lecturer notifications marked as read.'
            });


        } catch (error) {

            console.error(
                'Lecturer Mark All Notifications Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating notifications.'
                });

        }

    }
);

/* =========================================
   AI STUDY TUTOR
========================================= */

/* =========================================
   WAIT HELPER
========================================= */

const wait = (milliseconds) => {

    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

};


/* =========================================
   CHECK TEMPORARY GEMINI ERRORS
========================================= */

const isTemporaryGeminiError = (
    error
) => {

    const status =
        Number(
            error?.status ||
            error?.code ||
            error?.response?.status
        );


    return (
        status === 408 ||
        status === 429 ||
        (
            status >= 500 &&
            status <= 599
        )
    );

};


/* =========================================
   ASK MODEL WITH AUTOMATIC RETRY
========================================= */

const askGeminiWithRetry =
    async (
        ai,
        model,
        question,
        systemInstruction,
        maxAttempts = 3
    ) => {

        let lastError;


        for (
            let attempt = 1;
            attempt <= maxAttempts;
            attempt++
        ) {

            try {

                console.log(
                    `AI Tutor: using ${model}, attempt ${attempt}/${maxAttempts}`
                );


                const response =
                    await ai.models.generateContent({

                        model:
                            model,

                        contents:
                            question,

                        config: {

                            systemInstruction:
                                systemInstruction

                        }

                    });


                const answer =
                    response.text
                        ?.trim();


                if (!answer) {

                    throw new Error(
                        'Gemini returned an empty response.'
                    );

                }


                return answer;


            } catch (error) {

                lastError =
                    error;


                const status =
                    Number(
                        error?.status ||
                        error?.code ||
                        error?.response?.status
                    );


                console.error(
                    `Gemini ${model} error on attempt ${attempt}:`,
                    status || error.message
                );


                /*
                    Do not keep retrying
                    permanent errors such as
                    invalid authentication.
                */

                if (
                    !isTemporaryGeminiError(
                        error
                    )
                ) {

                    throw error;

                }


                /*
                    Last attempt:
                    stop retrying this model.
                */

                if (
                    attempt ===
                    maxAttempts
                ) {

                    break;

                }


                /*
                    Exponential backoff:

                    Attempt 1 -> about 1 sec
                    Attempt 2 -> about 2 sec

                    Small random jitter is
                    added as recommended for
                    retry systems.
                */

                const delay =
                    1000 *
                    Math.pow(
                        2,
                        attempt - 1
                    ) +
                    Math.floor(
                        Math.random() *
                        400
                    );


                console.log(
                    `Gemini busy. Retrying in ${delay}ms...`
                );


                await wait(
                    delay
                );

            }

        }


        throw lastError;

    };


/* =========================================
   TUTOR ENDPOINT
========================================= */

app.post(
    '/tutor',
    authenticateToken,
    async (req, res) => {

        try {

            const {
                question,
                context
            } =
                req.body;


            /* -------------------------------
               VALIDATE QUESTION
            ------------------------------- */

            if (
                !question ||
                !question.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please enter a question.'
                    });

            }


            /* -------------------------------
               CHECK API KEY
            ------------------------------- */

            if (
                !process.env
                    .GEMINI_API_KEY
            ) {

                console.error(
                    'GEMINI_API_KEY is missing.'
                );


                return res
                    .status(500)
                    .json({
                        error:
                            'AI service is not configured.'
                    });

            }


            /* -------------------------------
               GEMINI CLIENT
            ------------------------------- */

            const ai =
                new GoogleGenAI({

                    apiKey:
                        process.env
                            .GEMINI_API_KEY

                });


            /* -------------------------------
               STUDY TUTOR INSTRUCTIONS
            ------------------------------- */

/* -------------------------------
   ROLE-AWARE AI INSTRUCTIONS
------------------------------- */

const userRole =
    req.user.role;


const systemInstruction =
    userRole === 'LECTURER'

        ? `
You are CampusLearn AI, an AI Teaching Assistant
for university lecturers.

Your goal is to help lecturers prepare teaching
materials and manage academic work efficiently.

You can help with:

- explaining academic and technical concepts
- creating lesson plans
- generating assignment ideas
- creating assignment questions
- creating quiz and exam questions
- generating model answers
- creating marking criteria and rubrics
- suggesting classroom activities
- summarizing teaching topics
- generating discussion questions
- improving assignment instructions
- giving ideas for student exercises
- helping prepare lecture content

RESPONSE STYLE:

- Answer the lecturer's request directly.
- Use clear professional English.
- Keep answers concise but useful.
- Use proper Markdown formatting.
- Use headings when useful.
- Use bullet points for important information.
- Use numbered lists for steps.
- Use tables when they make information clearer.
- Use fenced code blocks only for actual code.
- Give practical teaching examples when useful.
- Avoid unnecessary long explanations.

IMPORTANT:

When creating assignments, quizzes, exams,
rubrics or teaching materials, organize the
content clearly so the lecturer can easily
reuse or edit it.

If the lecturer asks for questions, do not
automatically include answers unless they
request answers.

If marks are requested, make sure the total
marks are clear and consistent.

COURSE / CONTENT CONTEXT:

${context || 'No specific course or teaching context was provided.'}
        `.trim()

        : `
You are CampusLearn AI, a friendly and engaging
AI Study Tutor for university students.

Your goal is to make studying easy, clear and
interesting.

RESPONSE STYLE:

- Answer the question directly.
- Use simple beginner-friendly English.
- Keep normal answers concise but useful.
- Use proper Markdown formatting.
- Use clear headings with ## or ### when useful.
- Use **bold text** for important terms.
- Use bullet points for key facts.
- Use numbered lists for steps and processes.
- Use code blocks only when showing actual code.
- Leave comfortable spacing between sections.
- Avoid large walls of text.
- Give simple real-world examples.
- Explain difficult technical terms simply.

EMOJIS:

Use a few relevant emojis to make studying
more engaging.

Do not add an emoji to every sentence.

FOR EXPLANATIONS:

Explain the concept clearly, provide a simple
example when useful, highlight important points,
and finish with a short summary when appropriate.

FOR PROGRAMMING QUESTIONS:

- Explain what the code does.
- Use proper fenced code blocks.
- Explain important lines after the code.
- Keep examples clean and beginner-friendly.

FOR EXAM QUESTIONS:

Focus on:
- definitions
- important concepts
- short explanations
- memorable examples
- likely revision points

LESSON CONTEXT:

${context || 'No specific lesson context was provided.'}
        `.trim();


            /* -------------------------------
               PRIMARY + FALLBACK MODELS
            ------------------------------- */

            const models = [
            { name: "gemini-3.8-flash", attempts: 2 },
            { name: "gemini-3.7-flash", attempts: 2 },
            { name: "gemini-3.6-flash", attempts: 2 },
            { name: "gemini-3.5-flash", attempts: 2 },
            { name: "gemini-3.5-flash-lite", attempts: 2 },
            ];


            let answer =
                null;

            let lastError =
                null;


            /* -------------------------------
               TRY MODELS
            ------------------------------- */

            for (
                const model of models
            ) {

                try {

                    answer =
                        await askGeminiWithRetry(

                            ai,

                            model.name,

                            question.trim(),

                            systemInstruction,

                            model.attempts

                        );


                    if (answer) {

                        console.log(
                            `AI Tutor response generated with ${model.name}`
                        );

                        break;

                    }


                } catch (error) {

                    lastError =
                        error;


                    console.error(
                        `${model.name} failed:`,
                        error?.message ||
                        error
                    );


                    /*
                        Only move to another
                        model when this looks
                        like a temporary Gemini
                        service problem.
                    */

                    if (
                        !isTemporaryGeminiError(
                            error
                        )
                    ) {

                        throw error;

                    }


                    console.log(
                        `Switching from ${model.name} to fallback model...`
                    );

                }

            }


            /* -------------------------------
               BOTH MODELS FAILED
            ------------------------------- */

            if (!answer) {

                console.error(
                    'All Gemini models failed:',
                    lastError
                );


                return res
                    .status(503)
                    .json({
                        error:
                            'The AI service is temporarily busy. Please try again in a few seconds.'
                    });

            }


            /* -------------------------------
               SUCCESS
            ------------------------------- */

            res.json({
                answer:
                    answer
            });


        } catch (error) {

            console.error(
                'AI TUTOR FINAL ERROR:',
                error
            );


            const status =
                Number(
                    error?.status ||
                    error?.code ||
                    error?.response?.status
                );


            if (
                status === 401 ||
                status === 403
            ) {

                return res
                    .status(500)
                    .json({
                        error:
                            'The AI service authentication failed.'
                    });

            }


            if (
                isTemporaryGeminiError(
                    error
                )
            ) {

                return res
                    .status(503)
                    .json({
                        error:
                            'The AI service is temporarily busy. Please try again in a few seconds.'
                    });

            }


            res
                .status(500)
                .json({
                    error:
                        'The AI tutor could not respond. Please try again.'
                });

        }

    }
);




/* =========================================
   GET ALL USERS
========================================= */

app.get(
    '/admin/users',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const users =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        degree,
                        batch,
                        last_login,
                        is_active

                    FROM users

                    ORDER BY id ASC
                    `
                );


            res.json(
                users.rows
            );


        } catch (err) {

            console.error(
                'Fetch Admin Users Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);

/* =========================================
   ADMIN STUDENT ACADEMIC SUMMARY
========================================= */

app.get(
    '/admin/students/academic-summary',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const students =
                await pool.query(
                    `
                    WITH student_stats AS (

                        SELECT
                            u.id,
                            u.name,
                            u.email,
                            u.degree,
                            u.batch,
                            u.last_login,
                            u.is_active,


                            /* -------------------------
                               MATCHING COURSES
                            ------------------------- */

                            (
                                SELECT COUNT(*)

                                FROM courses c

                                WHERE
                                    c.degree = u.degree
                                    AND c.batch = u.batch
                            )::int
                            AS courses,


                            /* -------------------------
                               TOTAL ASSIGNMENTS
                            ------------------------- */

                            (
                                SELECT COUNT(*)

                                FROM assignments a

                                WHERE
                                    a.degree = u.degree
                                    AND a.batch = u.batch
                            )::int
                            AS total_assignments,


                            /* -------------------------
                               SUBMITTED ASSIGNMENTS
                            ------------------------- */

                            (
                                SELECT
                                    COUNT(
                                        DISTINCT s.assignment_id
                                    )

                                FROM submissions s

                                JOIN assignments a
                                    ON a.id =
                                       s.assignment_id

                                WHERE
                                    s.student_id = u.id

                                    AND a.degree =
                                        u.degree

                                    AND a.batch =
                                        u.batch
                            )::int
                            AS submitted_assignments,


                            /* -------------------------
                               GRADED ASSIGNMENTS
                            ------------------------- */

                            (
                                SELECT COUNT(*)

                                FROM submissions s

                                JOIN assignments a
                                    ON a.id =
                                       s.assignment_id

                                WHERE
                                    s.student_id = u.id

                                    AND s.grade
                                        IS NOT NULL

                                    AND a.degree =
                                        u.degree

                                    AND a.batch =
                                        u.batch
                            )::int
                            AS graded_assignments,


                            /* -------------------------
                               AVERAGE SCORE
                            ------------------------- */

                            COALESCE(
                                (
                                    SELECT
                                        ROUND(
                                            AVG(
                                                CASE

                                                    WHEN
                                                        s.marks_awarded IS NOT NULL
                                                        AND a.max_marks IS NOT NULL
                                                        AND a.max_marks > 0

                                                    THEN
                                                        (
                                                            s.marks_awarded::numeric
                                                            /
                                                            a.max_marks::numeric
                                                        ) * 100

                                                    ELSE NULL

                                                END
                                            ),
                                            2
                                        )

                                    FROM submissions s

                                    JOIN assignments a
                                        ON a.id =
                                        s.assignment_id

                                    WHERE
                                        s.student_id =
                                            u.id

                                        AND a.degree =
                                            u.degree

                                        AND a.batch =
                                            u.batch
                                ),

                                0
                            )::float
                            AS average_score


                        FROM users u

                        WHERE
                            u.role = 'STUDENT'
                    )


                    SELECT
                        *,

                        CASE

                            WHEN
                                total_assignments = 0

                            THEN 0

                            ELSE

                                ROUND(
                                    (
                                        submitted_assignments::numeric
                                        /
                                        total_assignments
                                    ) * 100
                                )::int

                        END
                        AS progress

                    FROM student_stats

                    ORDER BY id ASC
                    `
                );


            res.json(
                students.rows
            );


        } catch (err) {

            console.error(
                'Admin Student Academic Summary Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);

/* =========================================
   CREATE USER BY ADMIN
========================================= */

app.post(
    '/admin/users',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const {
                name,
                role,
                degree,
                batch
            } = req.body;


            /* ------------------------------
               REQUIRED FIELDS
            ------------------------------ */

            if (
                !name ||
                !role
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Name and role are required.'
                    });

            }


            /* ------------------------------
               VALID ROLE
            ------------------------------ */

            const cleanRole =
                role
                    .trim()
                    .toUpperCase();


            const allowedRoles = [
                'STUDENT',
                'LECTURER',
                'ADMIN'
            ];


            if (
                !allowedRoles.includes(
                    cleanRole
                )
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Invalid user role.'
                    });

            }


            /* ------------------------------
               STUDENT DETAILS REQUIRED
            ------------------------------ */

            if (
                cleanRole === 'STUDENT' &&
                (
                    !degree ||
                    !batch
                )
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Degree and batch are required for students.'
                    });

            }


            /* ------------------------------
               CREATE EMAIL USERNAME
            ------------------------------ */

            let emailName =
                name
                    .trim()
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        '.'
                    )
                    .replace(
                        /^\.+|\.+$/g,
                        ''
                    );


            if (!emailName) {

                emailName =
                    cleanRole === 'STUDENT'
                        ? 'student'
                        : cleanRole === 'LECTURER'
                        ? 'lecturer'
                        : 'admin';

            }


            /* ------------------------------
               STUDENT NUMBER
            ------------------------------ */

            let studentNumber = null;


            if (
                cleanRole === 'STUDENT'
            ) {

                const studentNumberResult =
                    await pool.query(
                        `
                        SELECT
                            nextval(
                                'student_number_seq'
                            )
                            AS student_number
                        `
                    );


                studentNumber =
                    Number(
                        studentNumberResult
                            .rows[0]
                            .student_number
                    );

            }


            /* ------------------------------
               GENERATE EMAIL
            ------------------------------ */

/* ------------------------------
   GENERATE EMAIL
------------------------------ */

let generatedEmail = '';


if (
    cleanRole === 'STUDENT'
) {

    generatedEmail =
        `${emailName}.${studentNumber}@students.campuslearn.edu`;

} else if (
    cleanRole === 'LECTURER'
) {

    generatedEmail =
        `${emailName}@campuslearn.edu`;

} else {

    /*
       Admin keeps a random unique number.
    */

    let emailExists = true;


    while (emailExists) {

        const randomNumber =
            crypto.randomInt(
                1000,
                10000
            );


        generatedEmail =
            `${emailName}.${randomNumber}@campuslearn.edu`;


        const emailCheck =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(email) =
                      LOWER($1)
                `,
                [
                    generatedEmail
                ]
            );


        emailExists =
            emailCheck.rows.length >
            0;

    }

}


            /* ------------------------------
               CHECK GENERATED EMAIL
            ------------------------------ */

            const generatedEmailCheck =
                await pool.query(
                    `
                    SELECT id
                    FROM users
                    WHERE LOWER(email) =
                          LOWER($1)
                    `,
                    [
                        generatedEmail
                    ]
                );


            if (
                generatedEmailCheck
                    .rows.length > 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Generated email already exists. Please try again.'
                    });

            }


            /* ------------------------------
               GENERATE TEMPORARY PASSWORD
            ------------------------------ */

            const temporaryPassword =
                `CL@${crypto
                    .randomBytes(6)
                    .toString('hex')}`;


            /* ------------------------------
               HASH PASSWORD
            ------------------------------ */

            const salt =
                await bcrypt.genSalt(10);


            const hashedPassword =
                await bcrypt.hash(
                    temporaryPassword,
                    salt
                );


            /* ------------------------------
               INSERT USER
            ------------------------------ */

            const newUser =
                await pool.query(
                    `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password_hash,
                        role,
                        degree,
                        batch,
                        student_number,
                        must_change_password
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        TRUE
                    )

                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        degree,
                        batch,
                        student_number,
                        last_login,
                        is_active,
                        must_change_password
                    `,
                    [
                        name.trim(),
                        generatedEmail,
                        hashedPassword,
                        cleanRole,

                        cleanRole === 'STUDENT'
                            ? degree.trim()
                            : null,

                        cleanRole === 'STUDENT'
                            ? batch.trim()
                            : null,

                        studentNumber
                    ]
                );


            /* ------------------------------
               SEND CREATED CREDENTIALS
            ------------------------------ */

            res
                .status(201)
                .json({

                    message:
                        'User created successfully!',

                    user:
                        newUser.rows[0],

                    credentials: {

                        email:
                            generatedEmail,

                        temporaryPassword:
                            temporaryPassword,

                        studentNumber:
                            studentNumber

                    }

                });


        } catch (err) {

            console.error(
                'Create Admin User Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);


/* =========================================
   UPDATE USER ROLE
========================================= */

/* =========================================
   UPDATE USER BY ADMIN
========================================= */

app.put(
    '/admin/users/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                name,
                email,
                role,
                degree,
                batch
            } = req.body;


            /* ------------------------------
               REQUIRED FIELDS
            ------------------------------ */

            if (
                !name ||
                !email ||
                !role
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Name, email and role are required.'
                    });

            }


            /* ------------------------------
               VALID ROLE
            ------------------------------ */

            const allowedRoles = [
                'STUDENT',
                'LECTURER',
                'ADMIN'
            ];


            if (
                !allowedRoles.includes(
                    role
                )
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Invalid user role.'
                    });

            }


            /* ------------------------------
               STUDENT VALIDATION
            ------------------------------ */

            if (
                role === 'STUDENT' &&
                (
                    !degree ||
                    !batch
                )
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Degree and batch are required for students.'
                    });

            }


            /* ------------------------------
               NORMALIZE EMAIL
            ------------------------------ */

            const cleanEmail =
                email
                    .trim()
                    .toLowerCase();


            /* ------------------------------
               CHECK DUPLICATE EMAIL
            ------------------------------ */

            const existingEmail =
                await pool.query(
                    `
                    SELECT id
                    FROM users

                    WHERE LOWER(email) =
                          LOWER($1)

                    AND id <> $2
                    `,
                    [
                        cleanEmail,
                        id
                    ]
                );


            if (
                existingEmail.rows.length > 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Another user already uses this email.'
                    });

            }


            /* ------------------------------
               UPDATE USER
            ------------------------------ */

            const updatedUser =
                await pool.query(
                    `
                    UPDATE users

                    SET
                        name = $1,
                        email = $2,
                        role = $3,
                        degree = $4,
                        batch = $5

                    WHERE id = $6

                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        degree,
                        batch,
                        last_login,
                        is_active
                    `,
                    [
                        name.trim(),
                        cleanEmail,
                        role,
                        degree || null,
                        batch || null,
                        id
                    ]
                );


            /* ------------------------------
               USER NOT FOUND
            ------------------------------ */

            if (
                updatedUser.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User not found.'
                    });

            }


            /* ------------------------------
               SUCCESS
            ------------------------------ */

            res.json({
                message:
                    'User updated successfully!',

                user:
                    updatedUser.rows[0]
            });


        } catch (err) {

            console.error(
                'Update Admin User Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);




/* =========================================
   ENABLE / DISABLE USER BY ADMIN
========================================= */

app.put(
    '/admin/users/:id/status',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                is_active
            } = req.body;


            /* ------------------------------
               VALIDATE STATUS VALUE
            ------------------------------ */

            if (
                typeof is_active !==
                'boolean'
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'is_active must be true or false.'
                    });

            }


            /* ------------------------------
               PREVENT SELF-DISABLE
            ------------------------------ */

            if (
                Number(id) ===
                    Number(
                        req.user.user_id
                    ) &&
                is_active === false
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'You cannot disable your own administrator account.'
                    });

            }


            /* ------------------------------
               UPDATE USER STATUS
            ------------------------------ */

            const updatedUser =
                await pool.query(
                    `
                    UPDATE users

                    SET is_active = $1

                    WHERE id = $2

                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        degree,
                        batch,
                        last_login,
                        is_active
                    `,
                    [
                        is_active,
                        id
                    ]
                );


            /* ------------------------------
               USER NOT FOUND
            ------------------------------ */

            if (
                updatedUser.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User not found.'
                    });

            }


            /* ------------------------------
               SUCCESS
            ------------------------------ */

            res.json({
                message:
                    is_active
                        ? 'User enabled successfully!'
                        : 'User disabled successfully!',

                user:
                    updatedUser.rows[0]
            });


        } catch (err) {

            console.error(
                'Update User Status Error:',
                err.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);

/* =========================================
   DELETE USER BY ADMIN
========================================= */

app.delete(
    '/admin/users/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            /* =================================
               PREVENT ADMIN DELETING THEMSELVES
            ================================= */

            if (
                Number(id) ===
                Number(req.user.user_id)
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'You cannot delete your own administrator account.'
                    });

            }


            /* =================================
               CHECK USER EXISTS
            ================================= */

            const existingUser =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        role
                    FROM users
                    WHERE id = $1
                    `,
                    [
                        id
                    ]
                );


            if (
                existingUser.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User not found.'
                    });

            }


            /* =================================
               DELETE USER
            ================================= */

            const deletedUser =
                await pool.query(
                    `
                    DELETE FROM users
                    WHERE id = $1

                    RETURNING
                        id,
                        name,
                        email,
                        role
                    `,
                    [
                        id
                    ]
                );


            res.json({
                message:
                    'User deleted successfully!',

                user:
                    deletedUser.rows[0]
            });


        } catch (err) {

            console.error(
                'Delete User Error:',
                err.message
            );


            /*
              PostgreSQL foreign-key error.

              This can happen if the user owns
              submissions, courses, assignments,
              notes, etc.
            */

            if (
                err.code === '23503'
            ) {

                return res
                    .status(409)
                    .json({
                        error:
                            'This user cannot be deleted because related records still exist.'
                    });

            }


            res
                .status(500)
                .json({
                    error:
                        'Server Error'
                });

        }

    }
);

/* =========================================
   ADMIN REPORTS & ANALYTICS
========================================= */

app.get(
    '/admin/reports/overview',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            /* =====================================
               RUN REPORT QUERIES
            ===================================== */

            const [
                userStatsResult,
                courseStatsResult,
                averageScoreResult,
                assignmentCompletionResult,
                fullCompletionResult,
                courseEnrollmentResult,
                recentActivityResult
            ] = await Promise.all([


                /* =================================
                   USER COUNTS
                ================================= */

                pool.query(
                    `
                    SELECT

                        COUNT(*)::int
                            AS total_users,

                        COUNT(*) FILTER (
                            WHERE role = 'STUDENT'
                        )::int
                            AS students,

                        COUNT(*) FILTER (
                            WHERE role = 'LECTURER'
                        )::int
                            AS lecturers,

                        COUNT(*) FILTER (
                            WHERE role = 'ADMIN'
                        )::int
                            AS administrators,

                        COUNT(*) FILTER (
                            WHERE COALESCE(
                                is_active,
                                TRUE
                            ) = TRUE
                        )::int
                            AS active_accounts

                    FROM users
                    `
                ),


                /* =================================
                   COURSE COUNT
                ================================= */

                pool.query(
                    `
                    SELECT
                        COUNT(*)::int
                            AS active_courses
                    FROM courses
                    `
                ),


                /* =================================
                   AVERAGE STUDENT SCORE
                ================================= */

                pool.query(
                    `
                    SELECT

                        COALESCE(
                            ROUND(
                                AVG(
                                    CASE

                                        WHEN
                                            s.marks_awarded IS NOT NULL
                                            AND a.max_marks IS NOT NULL
                                            AND a.max_marks > 0

                                        THEN
                                            (
                                                s.marks_awarded::numeric
                                                /
                                                a.max_marks::numeric
                                            ) * 100

                                        ELSE
                                            NULL

                                    END
                                ),
                                2
                            ),
                            0
                        )::float
                            AS average_score

                    FROM submissions s

                    JOIN assignments a
                        ON a.id =
                        s.assignment_id

                    WHERE
                        s.marks_awarded IS NOT NULL
                    `
                ),


                /* =================================
                   ASSIGNMENT COMPLETION

                   Expected:
                   Every active student matched
                   to every assignment for their
                   degree + batch.

                   Actual:
                   Their submitted assignments.
                ================================= */

                pool.query(
                    `
                    WITH expected AS (

                        SELECT
                            COUNT(*)::numeric
                                AS total_expected

                        FROM assignments a

                        JOIN users u
                            ON u.role =
                               'STUDENT'

                            AND u.degree =
                                a.degree

                            AND u.batch =
                                a.batch

                            AND COALESCE(
                                u.is_active,
                                TRUE
                            ) = TRUE

                    ),

                    actual AS (

                        SELECT

                            COUNT(
                                DISTINCT (
                                    s.assignment_id,
                                    s.student_id
                                )
                            )::numeric
                                AS total_submitted

                        FROM submissions s

                        JOIN assignments a
                            ON a.id =
                               s.assignment_id

                        JOIN users u
                            ON u.id =
                               s.student_id

                        WHERE
                            u.role =
                                'STUDENT'

                            AND u.degree =
                                a.degree

                            AND u.batch =
                                a.batch

                            AND COALESCE(
                                u.is_active,
                                TRUE
                            ) = TRUE

                    )

                    SELECT

                        CASE

                            WHEN
                                expected.total_expected =
                                0

                            THEN 0

                            ELSE

                                ROUND(
                                    (
                                        actual.total_submitted
                                        /
                                        expected.total_expected
                                    ) * 100
                                )::int

                        END
                            AS assignment_completion

                    FROM expected,
                         actual
                    `
                ),


                /* =================================
                   FULL ASSIGNMENT COMPLETION

                   Percentage of active students
                   who submitted every assignment
                   assigned to their degree/batch.
                ================================= */

                pool.query(
                    `
                    WITH student_stats AS (

                        SELECT

                            u.id,

                            (
                                SELECT
                                    COUNT(*)

                                FROM assignments a

                                WHERE
                                    a.degree =
                                        u.degree

                                    AND a.batch =
                                        u.batch
                            )::int
                                AS total_assignments,


                            (
                                SELECT
                                    COUNT(
                                        DISTINCT
                                        s.assignment_id
                                    )

                                FROM submissions s

                                JOIN assignments a
                                    ON a.id =
                                       s.assignment_id

                                WHERE
                                    s.student_id =
                                        u.id

                                    AND a.degree =
                                        u.degree

                                    AND a.batch =
                                        u.batch
                            )::int
                                AS submitted_assignments


                        FROM users u

                        WHERE
                            u.role =
                                'STUDENT'

                            AND COALESCE(
                                u.is_active,
                                TRUE
                            ) = TRUE

                    )


                    SELECT

                        CASE

                            WHEN
                                COUNT(*) FILTER (
                                    WHERE
                                        total_assignments >
                                        0
                                ) = 0

                            THEN 0

                            ELSE

                                ROUND(

                                    (
                                        COUNT(*) FILTER (
                                            WHERE
                                                total_assignments >
                                                0

                                                AND

                                                submitted_assignments >=
                                                total_assignments
                                        )::numeric

                                        /

                                        COUNT(*) FILTER (
                                            WHERE
                                                total_assignments >
                                                0
                                        )
                                    )

                                    * 100

                                )::int

                        END
                            AS full_completion

                    FROM student_stats
                    `
                ),


                /* =================================
                   COURSE ENROLLMENT

                   Student matching is based on
                   course degree + batch, matching
                   your existing application logic.
                ================================= */

                pool.query(
                    `
                    WITH course_counts AS (

                        SELECT

                            c.id,

                            c.title,

                            c.degree,

                            c.batch,

                            COUNT(
                                u.id
                            )::int
                                AS students


                        FROM courses c


                        LEFT JOIN users u

                            ON u.role =
                               'STUDENT'

                            AND u.degree =
                                c.degree

                            AND u.batch =
                                c.batch

                            AND COALESCE(
                                u.is_active,
                                TRUE
                            ) = TRUE


                        GROUP BY

                            c.id,
                            c.title,
                            c.degree,
                            c.batch

                    ),


                    maximum AS (

                        SELECT

                            GREATEST(
                                MAX(students),
                                1
                            )::numeric
                                AS max_students

                        FROM course_counts

                    )


                    SELECT

                        cc.id,

                        cc.title
                            AS name,

                        cc.degree,

                        cc.batch,

                        cc.students,

                        ROUND(
                            (
                                cc.students::numeric
                                /
                                maximum.max_students
                            ) * 100
                        )::int
                            AS percentage


                    FROM course_counts cc

                    CROSS JOIN maximum


                    ORDER BY

                        cc.students DESC,

                        cc.id ASC


                    LIMIT 8
                    `
                ),


                /* =================================
                   RECENT REAL ACTIVITY

                   Current database does not have
                   created_at for users/courses.

                   So use timestamps that really
                   exist:
                   - assignment submissions
                   - user logins
                ================================= */

                pool.query(
                    `
                    SELECT *

                    FROM (

                        SELECT

                            'SUBMISSION'
                                AS event_type,

                            'Assignment submitted'
                                AS title,

                            u.name
                            ||
                            ' submitted "'
                            ||
                            a.title
                            ||
                            '".'
                                AS description,

                            s.submitted_at
                                AS event_time


                        FROM submissions s

                        JOIN users u
                            ON u.id =
                               s.student_id

                        JOIN assignments a
                            ON a.id =
                               s.assignment_id


                        WHERE
                            s.submitted_at
                            IS NOT NULL



                        UNION ALL



                        SELECT

                            'LOGIN'
                                AS event_type,

                            'User login'
                                AS title,

                            u.name
                            ||
                            ' logged in to CampusLearn.'
                                AS description,

                            u.last_login
                                AS event_time


                        FROM users u

                        WHERE
                            u.last_login
                            IS NOT NULL

                    )
                    AS activity


                    ORDER BY
                        event_time DESC


                    LIMIT 8
                    `
                )

            ]);


            /* =====================================
               EXTRACT RESULTS
            ===================================== */

            const userStats =
                userStatsResult.rows[0];


            const courseStats =
                courseStatsResult.rows[0];


            const averageScore =
                Number(
                    averageScoreResult
                        .rows[0]
                        .average_score
                ) || 0;


            const assignmentCompletion =
                Number(
                    assignmentCompletionResult
                        .rows[0]
                        .assignment_completion
                ) || 0;


            const fullCompletion =
                Number(
                    fullCompletionResult
                        .rows[0]
                        .full_completion
                ) || 0;


            /* =====================================
               SEND REPORT DATA
            ===================================== */

            res.json({

                summary: {

                    total_users:
                        Number(
                            userStats.total_users
                        ) || 0,

                    students:
                        Number(
                            userStats.students
                        ) || 0,

                    lecturers:
                        Number(
                            userStats.lecturers
                        ) || 0,

                    administrators:
                        Number(
                            userStats.administrators
                        ) || 0,

                    active_accounts:
                        Number(
                            userStats.active_accounts
                        ) || 0,

                    active_courses:
                        Number(
                            courseStats.active_courses
                        ) || 0,

                    average_score:
                        averageScore

                },


                user_distribution: {

                    students:
                        Number(
                            userStats.students
                        ) || 0,

                    lecturers:
                        Number(
                            userStats.lecturers
                        ) || 0,

                    administrators:
                        Number(
                            userStats.administrators
                        ) || 0,

                    active_accounts:
                        Number(
                            userStats.active_accounts
                        ) || 0

                },


                academic_performance: {

                    average_score:
                        averageScore,

                    assignment_completion:
                        assignmentCompletion,

                    full_assignment_completion:
                        fullCompletion

                },


                course_enrollment:

                    courseEnrollmentResult
                        .rows
                        .map(
                            (course) => ({

                                id:
                                    course.id,

                                name:
                                    course.name,

                                degree:
                                    course.degree,

                                batch:
                                    course.batch,

                                students:
                                    Number(
                                        course.students
                                    ) || 0,

                                percentage:
                                    Number(
                                        course.percentage
                                    ) || 0

                            })
                        ),


                recent_activity:

                    recentActivityResult
                        .rows

            });


        } catch (error) {

            console.error(
                'Admin Reports Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while generating reports.'
                });

        }

    }
);

/* =========================================
   ADMIN SYSTEM SETTINGS
========================================= */


/* =========================================
   GET SYSTEM SETTINGS
========================================= */

app.get(
    '/admin/settings',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        system_name,
                        contact_email,
                        current_semester,
                        academic_year,
                        email_notifications,
                        assignment_alerts,
                        maintenance_mode,
                        updated_at

                    FROM system_settings

                    ORDER BY id ASC

                    LIMIT 1
                    `
                );


            if (
                result.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'System settings were not found.'
                    });

            }


            res.json(
                result.rows[0]
            );


        } catch (error) {

            console.error(
                'Get System Settings Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while loading system settings.'
                });

        }

    }
);



/* =========================================
   UPDATE SYSTEM SETTINGS
========================================= */

app.put(
    '/admin/settings',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const {
                systemName,
                contactEmail,
                semester,
                academicYear,
                emailNotifications,
                assignmentAlerts,
                maintenanceMode
            } = req.body;


            /* =====================================
               VALIDATION
            ===================================== */

            if (
                !systemName ||
                !systemName.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'System name is required.'
                    });

            }


            if (
                !contactEmail ||
                !contactEmail.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Contact email is required.'
                    });

            }


            if (
                !semester ||
                !semester.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Current semester is required.'
                    });

            }


            if (
                !academicYear ||
                !String(
                    academicYear
                ).trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Academic year is required.'
                    });

            }


            /* =====================================
               FIND SETTINGS ROW
            ===================================== */

            const existingSettings =
                await pool.query(
                    `
                    SELECT id
                    FROM system_settings
                    ORDER BY id ASC
                    LIMIT 1
                    `
                );


            if (
                existingSettings.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'System settings were not found.'
                    });

            }


            const settingsId =
                existingSettings
                    .rows[0]
                    .id;


            /* =====================================
               UPDATE
            ===================================== */

            const updatedSettings =
                await pool.query(
                    `
                    UPDATE system_settings

                    SET
                        system_name = $1,
                        contact_email = $2,
                        current_semester = $3,
                        academic_year = $4,
                        email_notifications = $5,
                        assignment_alerts = $6,
                        maintenance_mode = $7,
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $8

                    RETURNING *
                    `,
                    [
                        systemName.trim(),

                        contactEmail.trim(),

                        semester.trim(),

                        String(
                            academicYear
                        ).trim(),

                        emailNotifications ===
                            true,

                        assignmentAlerts ===
                            true,

                        maintenanceMode ===
                            true,

                        settingsId
                    ]
                );


            res.json({
                message:
                    'System settings updated successfully!',

                settings:
                    updatedSettings.rows[0]
            });


        } catch (error) {

            console.error(
                'Update System Settings Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating system settings.'
                });

        }

    }
);

/* =========================================
   ADMIN CHANGE PASSWORD
========================================= */

app.put(
    '/admin/change-password',
    authenticateToken,
    authorizeRoles('ADMIN'),
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword
            } = req.body;


            const adminId =
                req.user.user_id;


            /* =====================================
               REQUIRED FIELDS
            ===================================== */

            if (
                !currentPassword ||
                !newPassword
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Current password and new password are required.'
                    });

            }


            /* =====================================
               NEW PASSWORD LENGTH
            ===================================== */

            if (
                newPassword.length < 6
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'New password must contain at least 6 characters.'
                    });

            }


            /* =====================================
               CURRENT AND NEW MUST DIFFER
            ===================================== */

            if (
                currentPassword ===
                newPassword
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'New password must be different from your current password.'
                    });

            }


            /* =====================================
               GET ADMIN
            ===================================== */

            const admin =
                await pool.query(
                    `
                    SELECT
                        id,
                        password_hash,
                        role
                    FROM users
                    WHERE id = $1
                    `,
                    [
                        adminId
                    ]
                );


            if (
                admin.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Administrator account not found.'
                    });

            }


            if (
                admin.rows[0].role !==
                'ADMIN'
            ) {

                return res
                    .status(403)
                    .json({
                        error:
                            'Access denied.'
                    });

            }


            /* =====================================
               CHECK CURRENT PASSWORD
            ===================================== */

            const validPassword =
                await bcrypt.compare(
                    currentPassword,
                    admin.rows[0]
                        .password_hash
                );


            if (!validPassword) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Current password is incorrect.'
                    });

            }


            /* =====================================
               HASH NEW PASSWORD
            ===================================== */

            const salt =
                await bcrypt.genSalt(
                    10
                );


            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    salt
                );


            /* =====================================
               UPDATE PASSWORD
            ===================================== */

            await pool.query(
                `
                UPDATE users

                SET
                    password_hash = $1

                WHERE id = $2
                `,
                [
                    hashedPassword,
                    adminId
                ]
            );


            /* =====================================
               SUCCESS
            ===================================== */

            res.json({
                message:
                    'Password changed successfully!'
            });


        } catch (error) {

            console.error(
                'Admin Change Password Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while changing password.'
                });

        }

    }
);

/* =========================================
   STUDENT DASHBOARD
========================================= */

app.get(
    '/student/dashboard',
    authenticateToken,
    authorizeRoles('STUDENT'),
    async (req, res) => {

        try {

            const studentId =
                req.user.user_id;


            /* =====================================
               STUDENT PROFILE
            ===================================== */

            const studentResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        degree,
                        batch

                    FROM users

                    WHERE
                        id = $1
                        AND role = 'STUDENT'
                    `,
                    [
                        studentId
                    ]
                );


            if (
                studentResult.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Student profile not found.'
                    });

            }


            const student =
                studentResult.rows[0];


            const {
                degree,
                batch
            } = student;


            /* =====================================
               COURSES
            ===================================== */

            const coursesResult =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.title,

                        c.degree,

                        c.batch,

                        c.file_path,

                        c.lecturer_id,

                        COALESCE(
                            lecturer.name,
                            'Not assigned'
                        )
                            AS lecturer_name,


                        (
                            SELECT COUNT(*)

                            FROM lessons l

                            WHERE
                                l.course_id =
                                c.id

                        )::int
                            AS lesson_count


                    FROM courses c


                    LEFT JOIN users lecturer

                        ON lecturer.id =
                           c.lecturer_id


                    WHERE
                        c.degree = $1
                        AND c.batch = $2


                    ORDER BY
                        c.id ASC
                    `,
                    [
                        degree,
                        batch
                    ]
                );


            /* =====================================
               ASSIGNMENTS
            ===================================== */

            const assignmentsResult =
                await pool.query(
                    `
                    SELECT

                        a.id,

                        a.title,

                        a.description,

                        a.due_date,

                        a.degree,

                        a.batch,

                        a.file_path,

                        COALESCE(
                            lecturer.name,
                            'Not assigned'
                        )
                            AS lecturer_name,


                        EXISTS (

                            SELECT 1

                            FROM submissions s

                            WHERE
                                s.assignment_id =
                                a.id

                                AND

                                s.student_id =
                                $3

                        )
                            AS is_submitted,


                        EXISTS (

                            SELECT 1

                            FROM submissions s

                            WHERE
                                s.assignment_id =
                                a.id

                                AND

                                s.student_id =
                                $3

                                AND

                                s.grade
                                IS NOT NULL

                        )
                            AS is_graded


                    FROM assignments a


                    LEFT JOIN users lecturer

                        ON lecturer.id =
                           a.lecturer_id


                    WHERE
                        a.degree = $1

                        AND

                        a.batch = $2


                    ORDER BY
                        a.due_date ASC
                    `,
                    [
                        degree,
                        batch,
                        studentId
                    ]
                );


            const assignments =
                assignmentsResult.rows;


            /* =====================================
               ASSIGNMENT COUNTS
            ===================================== */

            const totalAssignments =
                assignments.length;


            const submittedAssignments =
                assignments.filter(
                    (assignment) =>
                        assignment.is_submitted
                ).length;


            const pendingAssignments =
                assignments.filter(
                    (assignment) =>
                        !assignment.is_submitted
                ).length;


            /* =====================================
               DUE THIS WEEK

               Only count assignments that:
               - are not submitted
               - are due today or later
               - are due within next 7 days
            ===================================== */

            const now =
                new Date();


            const sevenDaysLater =
                new Date();


            sevenDaysLater.setDate(
                now.getDate() + 7
            );


            const dueThisWeek =
                assignments.filter(
                    (assignment) => {

                        if (
                            assignment.is_submitted ||
                            !assignment.due_date
                        ) {

                            return false;

                        }


                        const dueDate =
                            new Date(
                                assignment.due_date
                            );


                        return (
                            dueDate >= now &&
                            dueDate <=
                                sevenDaysLater
                        );

                    }
                ).length;


            /* =====================================
               OVERALL ASSIGNMENT PROGRESS
            ===================================== */

            const overallProgress =
                totalAssignments === 0

                    ? 0

                    : Math.round(

                        (
                            submittedAssignments /
                            totalAssignments
                        )

                        * 100

                    );


            /* =====================================
               AVERAGE NUMERIC SCORE
            ===================================== */

            /* =====================================
            AVERAGE SCORE

            Calculate percentage using the
            awarded marks and assignment max marks.
            ===================================== */

            const scoreResult =
                await pool.query(
                    `
                    SELECT

                        COALESCE(
                            ROUND(
                                AVG(
                                    CASE

                                        WHEN
                                            s.marks_awarded
                                            IS NOT NULL

                                            AND
                                            a.max_marks
                                            IS NOT NULL

                                            AND
                                            a.max_marks > 0

                                        THEN
                                            (
                                                s.marks_awarded::numeric
                                                /
                                                a.max_marks::numeric
                                            ) * 100

                                        ELSE
                                            NULL

                                    END
                                ),
                                2
                            ),
                            0
                        )::float
                        AS average_score

                    FROM submissions s

                    JOIN assignments a
                        ON a.id =
                        s.assignment_id

                    WHERE
                        s.student_id = $1

                        AND
                        a.degree = $2

                        AND
                        a.batch = $3

                        AND
                        s.grade IS NOT NULL
                    `,
                    [
                        studentId,
                        degree,
                        batch
                    ]
                );


            const averageScore =
                Number(
                    scoreResult.rows[0]
                        .average_score
                ) || 0;


            /* =====================================
               UPCOMING ASSIGNMENTS

               Show only unsubmitted assignments.
            ===================================== */

            const upcomingAssignments =
                assignments

                    .filter(
                        (assignment) =>
                            !assignment.is_submitted
                    )

                    .slice(
                        0,
                        4
                    );


            /* =====================================
               RESPONSE
            ===================================== */

            res.json({

                student: {

                    id:
                        student.id,

                    name:
                        student.name,

                    email:
                        student.email,

                    degree:
                        student.degree,

                    batch:
                        student.batch

                },


                stats: {

                    enrolled_courses:
                        coursesResult.rows
                            .length,

                    total_assignments:
                        totalAssignments,

                    pending_assignments:
                        pendingAssignments,

                    due_this_week:
                        dueThisWeek,

                    submitted_assignments:
                        submittedAssignments,

                    overall_progress:
                        overallProgress,

                    average_score:
                        averageScore

                },


                courses:

                    coursesResult.rows
                        .map(
                            (course) => ({

                                id:
                                    course.id,

                                title:
                                    course.title,

                                degree:
                                    course.degree,

                                batch:
                                    course.batch,

                                lecturer_id:
                                    course.lecturer_id,

                                lecturer_name:
                                    course.lecturer_name,

                                lesson_count:
                                    Number(
                                        course.lesson_count
                                    ) || 0,

                                has_material:
                                    Boolean(
                                        course.file_path
                                    )

                            })
                        ),


                upcoming_assignments:

                    upcomingAssignments

            });


        } catch (error) {

            console.error(
                'Student Dashboard Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while loading student dashboard.'
                });

        }

    }
);

/* =========================================
   LECTURER DASHBOARD
========================================= */

app.get(
    '/lecturer/dashboard',
    authenticateToken,
    authorizeRoles(
        'LECTURER',
        'ADMIN'
    ),
    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;


            /* =================================
               LECTURER COURSES
            ================================= */

            const coursesResult =
                await pool.query(
                    `
                    SELECT
                        c.id,
                        c.title,
                        c.degree,
                        c.batch,

                        (
                            SELECT COUNT(*)
                            FROM users u
                            WHERE
                                u.role = 'STUDENT'
                                AND u.degree = c.degree
                                AND u.batch = c.batch
                        )::int AS student_count

                    FROM courses c

                    WHERE
                        c.lecturer_id = $1

                    ORDER BY
                        c.id ASC
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               UNIQUE STUDENTS
               belonging to lecturer cohorts
            ================================= */

            const studentsResult =
                await pool.query(
                    `
                    WITH lecturer_students AS (

                        SELECT DISTINCT
                            u.id,
                            u.name,
                            u.email,
                            u.degree,
                            u.batch

                        FROM users u

                        WHERE
                            u.role = 'STUDENT'

                            AND EXISTS (

                                SELECT 1

                                FROM courses c

                                WHERE
                                    c.lecturer_id = $1
                                    AND c.degree = u.degree
                                    AND c.batch = u.batch
                            )
                    ),

                    student_progress AS (

                        SELECT
                            ls.*,

                            (
                                SELECT COUNT(*)

                                FROM assignments a

                                WHERE
                                    a.lecturer_id = $1
                                    AND a.degree = ls.degree
                                    AND a.batch = ls.batch
                            )::int
                            AS total_assignments,


                            (
                                SELECT
                                    COUNT(
                                        DISTINCT s.assignment_id
                                    )

                                FROM submissions s

                                JOIN assignments a
                                    ON a.id =
                                       s.assignment_id

                                WHERE
                                    s.student_id = ls.id
                                    AND a.lecturer_id = $1
                                    AND a.degree = ls.degree
                                    AND a.batch = ls.batch
                            )::int
                            AS submitted_assignments

                        FROM lecturer_students ls
                    )

                    SELECT
                        *,

                        CASE

                            WHEN
                                total_assignments = 0
                            THEN 0

                            ELSE
                                ROUND(
                                    (
                                        submitted_assignments::numeric
                                        /
                                        total_assignments
                                    ) * 100
                                )::int

                        END
                        AS progress

                    FROM student_progress

                    ORDER BY
                        id ASC
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               LECTURER SUBMISSIONS
            ================================= */

            const submissionsResult =
                await pool.query(
                    `
                    SELECT
                        s.id
                            AS submission_id,

                        s.student_id,
                        s.assignment_id,
                        s.file_path,
                        s.submitted_at,
                        s.grade,
                        s.feedback,

                        a.title
                            AS assignment_title,

                        a.degree,
                        a.batch,

                        u.name
                            AS student_name

                    FROM submissions s

                    JOIN assignments a
                        ON a.id =
                           s.assignment_id

                    JOIN users u
                        ON u.id =
                           s.student_id

                    WHERE
                        a.lecturer_id = $1

                    ORDER BY
                        s.submitted_at DESC
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               WEEKLY SUBMISSION ACTIVITY
            ================================= */

            const activityResult =
                await pool.query(
                    `
                    SELECT
                        EXTRACT(
                            ISODOW
                            FROM s.submitted_at
                        )::int
                        AS day_number,

                        COUNT(*)::int
                        AS submission_count

                    FROM submissions s

                    JOIN assignments a
                        ON a.id =
                           s.assignment_id

                    WHERE
                        a.lecturer_id = $1

                        AND s.submitted_at >=
                            date_trunc(
                                'week',
                                CURRENT_DATE
                            )

                        AND s.submitted_at <
                            date_trunc(
                                'week',
                                CURRENT_DATE
                            )
                            +
                            INTERVAL '7 days'

                    GROUP BY
                        day_number

                    ORDER BY
                        day_number
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               ASSIGNMENTS CREATED BY LECTURER
            ================================= */

            const assignmentCountResult =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::int
                        AS total_assignments

                    FROM assignments

                    WHERE
                        lecturer_id = $1
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               NUMERIC AVERAGE SCORE

               Some current grades are letters
               such as A/B, so only numeric
               grades are averaged.
            ================================= */

            const averageResult =
                await pool.query(
                    `
                    SELECT
                        ROUND(
                            AVG(
                                CASE

                                    WHEN
                                        s.marks_awarded IS NOT NULL
                                        AND a.max_marks IS NOT NULL
                                        AND a.max_marks > 0

                                    THEN
                                        (
                                            s.marks_awarded::numeric
                                            /
                                            a.max_marks::numeric
                                        ) * 100

                                    ELSE
                                        NULL

                                END
                            ),
                            1
                        )
                        AS average_score

                    FROM submissions s

                    JOIN assignments a
                        ON a.id =
                        s.assignment_id

                    WHERE
                        a.lecturer_id = $1
                        AND s.marks_awarded IS NOT NULL
                    `,
                    [
                        lecturerId
                    ]
                );

                /* =================================
   ACADEMIC REMINDERS

   These are returned only when the
   lecturer has Academic Reminders ON.
================================= */

const remindersResult =
    await pool.query(
        `
        SELECT
            a.id,
            a.title,
            a.due_date,
            a.course_id,
            a.degree,
            a.batch,

            COALESCE(
                c.title,
                CONCAT(
                    a.degree,
                    ' - Batch ',
                    a.batch
                )
            )
            AS course_title,

            (
                SELECT COUNT(*)
                FROM submissions pending
                WHERE
                    pending.assignment_id =
                        a.id

                    AND (
                        pending.grade IS NULL
                        OR pending.grade = ''
                    )
            )::int
            AS waiting_to_grade,

            (
                a.due_date::date -
                CURRENT_DATE
            )::int
            AS days_until_due,

            CASE

                WHEN
                    a.due_date::date <
                    CURRENT_DATE
                THEN 'overdue'

                WHEN
                    a.due_date::date =
                    CURRENT_DATE
                THEN 'due_today'

                WHEN
                    a.due_date::date <=
                    CURRENT_DATE +
                    INTERVAL '7 days'
                THEN 'due_soon'

                ELSE 'grading'

            END
            AS reminder_type

        FROM assignments a

        LEFT JOIN courses c
            ON c.id =
               a.course_id

        WHERE
            a.lecturer_id = $1

            AND COALESCE(
                (
                    SELECT
                        academic_reminders

                    FROM user_settings

                    WHERE user_id = $1
                ),
                TRUE
            ) = TRUE

            AND (
                a.due_date::date
                    BETWEEN
                        CURRENT_DATE -
                        INTERVAL '7 days'
                    AND
                        CURRENT_DATE +
                        INTERVAL '7 days'

                OR EXISTS (
                    SELECT 1
                    FROM submissions pending

                    WHERE
                        pending.assignment_id =
                            a.id

                        AND (
                            pending.grade IS NULL
                            OR pending.grade = ''
                        )
                )
            )

                ORDER BY
                    CASE

                        WHEN
                            a.due_date::date <
                            CURRENT_DATE
                        THEN 1

                        WHEN
                            a.due_date::date =
                            CURRENT_DATE
                        THEN 2

                        WHEN
                            a.due_date::date <=
                            CURRENT_DATE +
                            INTERVAL '7 days'
                        THEN 3

                        ELSE 4

                    END,

                    a.due_date ASC

                LIMIT 6
                `,
                [
                    lecturerId
                ]
            );


            const submissions =
                submissionsResult.rows;


            const waitingToGrade =
                submissions.filter(
                    (submission) =>
                        submission.grade === null ||
                        submission.grade === ""
                ).length;


            const gradedSubmissions =
                submissions.filter(
                    (submission) =>
                        submission.grade !== null &&
                        submission.grade !== ""
                ).length;


            const averageScore =
                averageResult.rows[0]
                    .average_score === null

                    ? null

                    : Number(
                        averageResult.rows[0]
                            .average_score
                    );


            /* =================================
               RESPONSE
            ================================= */

            res.json({

                stats: {

                    active_courses:
                        coursesResult.rows.length,

                    total_students:
                        studentsResult.rows.length,

                    total_submissions:
                        submissions.length,

                    waiting_to_grade:
                        waitingToGrade,

                    total_assignments:
                        assignmentCountResult
                            .rows[0]
                            .total_assignments,

                    graded_submissions:
                        gradedSubmissions,

                    average_score:
                        averageScore
                },


                courses:
                    coursesResult.rows,


                students:
                    studentsResult.rows,


                recent_submissions:
                    submissions.slice(
                        0,
                        5
                    ),


                activity:
                    activityResult.rows,

                reminders:
                    remindersResult.rows

            });


        } catch (error) {

            console.error(
                'Lecturer Dashboard Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to load lecturer dashboard.'
                });

        }

    }
);

/* =========================================
   LECTURER COURSES
========================================= */

app.get(
    '/lecturer/courses',
    authenticateToken,
    authorizeRoles(
        'LECTURER',
        'ADMIN'
    ),
    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;


            /* =================================
               COURSES OWNED BY THIS LECTURER
            ================================= */

            const coursesResult =
                await pool.query(
                    `
                    SELECT

                        c.id,
                        c.title,
                        c.degree,
                        c.batch,
                        c.file_path,
                        c.lecturer_id,


                        /* =====================
                           MATCHING STUDENTS
                        ===================== */

                        (
                            SELECT
                                COUNT(*)

                            FROM users student

                            WHERE
                                student.role = 'STUDENT'

                                AND student.degree =
                                    c.degree

                                AND student.batch =
                                    c.batch
                        )::int
                        AS student_count,


                        /* =====================
                           LESSON COUNT
                        ===================== */

                        (
                            SELECT
                                COUNT(*)

                            FROM lessons l

                            WHERE
                                l.course_id =
                                    c.id
                        )::int
                        AS lesson_count,


                        /* =====================
                           MATERIAL COUNT

                           Main course file = 1
                           Each lesson = 1
                        ===================== */

                        (
                            (
                                CASE

                                    WHEN
                                        c.file_path
                                        IS NOT NULL

                                        AND
                                        c.file_path <> ''

                                    THEN 1

                                    ELSE 0

                                END
                            )

                            +

                            (
                                SELECT
                                    COUNT(*)

                                FROM lessons l

                                WHERE
                                    l.course_id =
                                        c.id
                            )

                        )::int
                        AS material_count


                    FROM courses c

                    WHERE
                        c.lecturer_id = $1

                    ORDER BY
                        c.id ASC
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               UNIQUE STUDENT COUNT

               Do not simply add course student
               counts because the same student
               can belong to several courses.
            ================================= */

            const studentsResult =
                await pool.query(
                    `
                    SELECT
                        COUNT(
                            DISTINCT student.id
                        )::int
                        AS total_students

                    FROM users student

                    WHERE
                        student.role = 'STUDENT'

                        AND EXISTS (

                            SELECT 1

                            FROM courses c

                            WHERE
                                c.lecturer_id = $1

                                AND c.degree =
                                    student.degree

                                AND c.batch =
                                    student.batch
                        )
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               TOTAL MATERIALS
            ================================= */

            const materialResult =
                await pool.query(
                    `
                    SELECT

                        COALESCE(
                            SUM(

                                (
                                    CASE

                                        WHEN
                                            c.file_path
                                            IS NOT NULL

                                            AND
                                            c.file_path <> ''

                                        THEN 1

                                        ELSE 0

                                    END
                                )

                                +

                                (
                                    SELECT
                                        COUNT(*)

                                    FROM lessons l

                                    WHERE
                                        l.course_id =
                                            c.id
                                )

                            ),
                            0
                        )::int
                        AS total_materials

                    FROM courses c

                    WHERE
                        c.lecturer_id = $1
                    `,
                    [
                        lecturerId
                    ]
                );


            /* =================================
               RESPONSE
            ================================= */

            res.json({

                summary: {

                    active_courses:
                        coursesResult
                            .rows
                            .length,

                    total_students:
                        studentsResult
                            .rows[0]
                            .total_students,

                    learning_materials:
                        materialResult
                            .rows[0]
                            .total_materials

                },


                courses:
                    coursesResult.rows

            });


        } catch (error) {

            console.error(
                'Lecturer Courses Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to load lecturer courses.'
                });

        }

    }
);

/* =========================================
   UPDATE COURSE BY LECTURER
========================================= */

app.put(
    '/lecturer/courses/:id',
    authenticateToken,
    authorizeRoles('LECTURER'),
    upload.single('file'),
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                courseTitle,
                degree,
                batch
            } = req.body;

            const lecturerId =
                req.user.user_id;


            /* ==============================
               CHECK COURSE
            ============================== */

            const existingCourse =
                await pool.query(
                    `
                    SELECT *
                    FROM courses
                    WHERE id = $1
                    AND lecturer_id = $2
                    `,
                    [
                        id,
                        lecturerId
                    ]
                );


            if (
                existingCourse.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Course not found or you do not have permission to edit it.'
                    });

            }


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !courseTitle ||
                !courseTitle.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Course title is required.'
                    });

            }


            if (
                !degree ||
                !degree.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Degree is required.'
                    });

            }


            if (
                !batch ||
                !batch.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Batch is required.'
                    });

            }


            /* ==============================
               MATERIAL
            ============================== */

            let finalFilePath =
                existingCourse
                    .rows[0]
                    .file_path;


            if (req.file) {

                finalFilePath =
                    req.file.path;

            }


            /* ==============================
               UPDATE
            ============================== */

            const updatedCourse =
                await pool.query(
                    `
                    UPDATE courses

                    SET
                        title = $1,
                        degree = $2,
                        batch = $3,
                        file_path = $4

                    WHERE id = $5
                    AND lecturer_id = $6

                    RETURNING *
                    `,
                    [
                        courseTitle.trim(),
                        degree.trim(),
                        batch.trim(),
                        finalFilePath,
                        id,
                        lecturerId
                    ]
                );


            res.json({
                message:
                    'Course updated successfully! 🎉',

                course:
                    updatedCourse.rows[0]
            });


        } catch (error) {

            console.error(
                'Lecturer Update Course Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating course.'
                });

        }

    }
);

/* =========================================
   LECTURER SUBMISSIONS
========================================= */

app.get(
    '/lecturer/submissions',
    authenticateToken,
    authorizeRoles('LECTURER'),
    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;


            const result =
                await pool.query(
                    `
            SELECT
                s.id AS submission_id,
                s.assignment_id,
                s.student_id,
                s.file_path,
                s.submitted_at,
                s.marks_awarded,
                s.grade,
                s.feedback,

                a.title AS assignment_title,
                a.degree,
                a.batch,
                a.due_date,
                a.max_marks,

                u.name AS student_name,
                u.email AS student_email,

                CASE
                    WHEN s.grade IS NULL
                    THEN 'To Grade'
                    ELSE 'Graded'
                END AS status

            FROM submissions s

            JOIN assignments a
                ON a.id = s.assignment_id

            JOIN users u
                ON u.id = s.student_id

            WHERE
                a.lecturer_id = $1

            ORDER BY
                s.submitted_at DESC
                    `,
                    [
                        lecturerId
                    ]
                );


            const submissions =
                result.rows;


            const totalSubmissions =
                submissions.length;


            const toGrade =
                submissions.filter(
                    (submission) =>
                        submission.grade === null
                ).length;


            const graded =
                submissions.filter(
                    (submission) =>
                        submission.grade !== null
                ).length;


            const uniqueStudents =
                new Set(
                    submissions.map(
                        (submission) =>
                            submission.student_id
                    )
                ).size;


            res.json({

                submissions,

                summary: {
                    total_submissions:
                        totalSubmissions,

                    to_grade:
                        toGrade,

                    graded,

                    students:
                        uniqueStudents
                }

            });


        } catch (error) {

            console.error(
                'Lecturer Submissions Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to load lecturer submissions.'
                });

        }

    }
);

/* =========================================
   LECTURER STUDENTS
========================================= */

app.get(
    '/lecturer/students',

    authenticateToken,

    authorizeRoles('LECTURER'),

    async (req, res) => {

        try {

            const lecturerId =
                req.user.user_id;


            const result =
                await pool.query(
                    `
                    WITH lecturer_courses AS (

                        SELECT
                            id,
                            title,
                            degree,
                            batch

                        FROM courses

                        WHERE lecturer_id = $1
                    ),

                    lecturer_students AS (

                        SELECT DISTINCT
                            u.id,
                            u.name,
                            u.email,
                            u.degree,
                            u.batch,
                            u.is_active

                        FROM users u

                        WHERE
                            u.role = 'STUDENT'

                            AND EXISTS (

                                SELECT 1

                                FROM lecturer_courses c

                                WHERE
                                    c.degree = u.degree
                                    AND c.batch = u.batch
                            )
                    ),

                    course_info AS (

                        SELECT
                            ls.id AS student_id,

                            COUNT(
                                DISTINCT c.id
                            )::int AS course_count,

                            STRING_AGG(
                                DISTINCT c.title,
                                ', '
                                ORDER BY c.title
                            ) AS courses

                        FROM lecturer_students ls

                        JOIN lecturer_courses c
                            ON c.degree = ls.degree
                            AND c.batch = ls.batch

                        GROUP BY
                            ls.id
                    ),

                    student_stats AS (

                        SELECT
                            ls.id AS student_id,

                            COUNT(
                                DISTINCT a.id
                            )::int
                            AS total_assignments,

                            COUNT(
                                DISTINCT s.id
                            )::int
                            AS submissions,

                            COUNT(
                                DISTINCT s.id
                            )
                            FILTER (
                                WHERE s.grade IS NOT NULL
                            )::int
                            AS graded,

                            ROUND(
                                AVG(
                                    CASE

                                        WHEN
                                            s.marks_awarded
                                                IS NOT NULL
                                            AND
                                            a.max_marks > 0

                                        THEN
                                            (
                                                s.marks_awarded
                                                /
                                                a.max_marks
                                            ) * 100

                                        ELSE NULL

                                    END
                                ),
                                0
                            )
                            AS average_score

                        FROM lecturer_students ls

                        LEFT JOIN assignments a
                            ON a.lecturer_id = $1
                            AND a.degree = ls.degree
                            AND a.batch = ls.batch

                        LEFT JOIN submissions s
                            ON s.assignment_id = a.id
                            AND s.student_id = ls.id

                        GROUP BY
                            ls.id
                    )

                    SELECT
                        ls.id,
                        ls.name,
                        ls.email,
                        ls.degree,
                        ls.batch,
                        ls.is_active,

                        ci.course_count,
                        ci.courses,

                        ss.total_assignments,
                        ss.submissions,
                        ss.graded,
                        ss.average_score,

                        CASE

                            WHEN
                                ss.total_assignments > 0

                            THEN
                                ROUND(
                                    (
                                        ss.submissions::numeric
                                        /
                                        ss.total_assignments
                                    ) * 100
                                )

                            ELSE 0

                        END AS progress

                    FROM lecturer_students ls

                    LEFT JOIN course_info ci
                        ON ci.student_id = ls.id

                    LEFT JOIN student_stats ss
                        ON ss.student_id = ls.id

                    ORDER BY
                        ls.name ASC
                    `,
                    [
                        lecturerId
                    ]
                );


            const students =
                result.rows;


            const totalStudents =
                students.length;


            const activeStudents =
                students.filter(
                    (student) =>
                        student.is_active !== false
                ).length;


            const averageProgress =
                students.length > 0
                    ? Math.round(
                        students.reduce(
                            (total, student) =>
                                total +
                                Number(
                                    student.progress || 0
                                ),
                            0
                        ) /
                        students.length
                    )
                    : 0;


            const studentsWithScores =
                students.filter(
                    (student) =>
                        student.average_score !== null &&
                        student.average_score !== undefined
                );


            const averageScore =
                studentsWithScores.length > 0
                    ? Math.round(
                        studentsWithScores.reduce(
                            (total, student) =>
                                total +
                                Number(
                                    student.average_score
                                ),
                            0
                        ) /
                        studentsWithScores.length
                    )
                    : null;


            res.json({

                students,

                summary: {

                    total_students:
                        totalStudents,

                    active_students:
                        activeStudents,

                    average_progress:
                        averageProgress,

                    average_score:
                        averageScore
                }

            });


        } catch (error) {

            console.error(
                'Lecturer Students Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to load lecturer students.'
                });

        }

    }
);

/* =========================================
   CHANGE LOGGED-IN USER PASSWORD
========================================= */

app.put(
    '/change-password',

    authenticateToken,

    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const {
                currentPassword,
                newPassword
            } = req.body;


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !currentPassword ||
                !newPassword
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Current password and new password are required.'
                    });

            }


            if (
                newPassword.length < 6
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'New password must contain at least 6 characters.'
                    });

            }


            if (
                currentPassword ===
                newPassword
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'New password must be different from the current password.'
                    });

            }


            /* ==============================
               GET USER PASSWORD
            ============================== */

            const userResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        password_hash

                    FROM users

                    WHERE id = $1
                    `,
                    [
                        userId
                    ]
                );


            if (
                userResult.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'User not found.'
                    });

            }


            /* ==============================
               CHECK CURRENT PASSWORD
            ============================== */

            const passwordMatches =
                await bcrypt.compare(
                    currentPassword,
                    userResult.rows[0]
                        .password_hash
                );


            if (!passwordMatches) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Current password is incorrect.'
                    });

            }


            /* ==============================
               HASH NEW PASSWORD
            ============================== */

            const salt =
                await bcrypt.genSalt(10);


            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    salt
                );


            /* ==============================
               UPDATE PASSWORD
            ============================== */

            await pool.query(
                `
                UPDATE users

                SET
                    password_hash = $1,
                    must_change_password = FALSE

                WHERE id = $2
                `,
                [
                    hashedPassword,
                    userId
                ]
            );


            res.json({
                message:
                    'Password changed successfully!'
            });


        } catch (error) {

            console.error(
                'Change Password Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to change password.'
                });

        }

    }
);

/* =========================================
   GET LOGGED-IN USER SETTINGS
========================================= */

app.get(
    '/user/settings',

    authenticateToken,

    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            /*
              Create default settings
              automatically if this user
              does not have a row yet.
            */

            await pool.query(
                `
                INSERT INTO user_settings (
                    user_id,
                    email_notifications,
                    submission_alerts,
                    academic_reminders
                )

                VALUES (
                    $1,
                    TRUE,
                    TRUE,
                    TRUE
                )

                ON CONFLICT (user_id)
                DO NOTHING
                `,
                [
                    userId
                ]
            );


            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        user_id,
                        email_notifications,
                        submission_alerts,
                        academic_reminders,
                        updated_at

                    FROM user_settings

                    WHERE user_id = $1
                    `,
                    [
                        userId
                    ]
                );


            res.json(
                result.rows[0]
            );


        } catch (error) {

            console.error(
                'Get User Settings Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to load settings.'
                });

        }

    }
);


/* =========================================
   UPDATE LOGGED-IN USER SETTINGS
========================================= */

app.put(
    '/user/settings',

    authenticateToken,

    async (req, res) => {

        try {

            const userId =
                req.user.user_id;


            const {
                email_notifications,
                submission_alerts,
                academic_reminders
            } = req.body;


            const result =
                await pool.query(
                    `
                    INSERT INTO user_settings (
                        user_id,
                        email_notifications,
                        submission_alerts,
                        academic_reminders,
                        updated_at
                    )

                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        CURRENT_TIMESTAMP
                    )

                    ON CONFLICT (user_id)

                    DO UPDATE SET
                        email_notifications =
                            EXCLUDED.email_notifications,

                        submission_alerts =
                            EXCLUDED.submission_alerts,

                        academic_reminders =
                            EXCLUDED.academic_reminders,

                        updated_at =
                            CURRENT_TIMESTAMP

                    RETURNING
                        id,
                        user_id,
                        email_notifications,
                        submission_alerts,
                        academic_reminders,
                        updated_at
                    `,
                    [
                        userId,

                        Boolean(
                            email_notifications
                        ),

                        Boolean(
                            submission_alerts
                        ),

                        Boolean(
                            academic_reminders
                        )
                    ]
                );


            res.json({
                message:
                    'Settings saved successfully!',

                settings:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                'Update User Settings Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Failed to save settings.'
                });

        }

    }
);

/* =========================================
   UPDATE ASSIGNMENT BY LECTURER
========================================= */

app.put(
    '/lecturer/assignments/:id',

    authenticateToken,

    authorizeRoles('LECTURER'),

    upload.single('file'),

    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                title,
                description,
                dueDate,
                degree,
                batch,
                maxMarks
            } = req.body;


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !title ||
                !title.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Assignment title is required.'
                    });

            }


            if (
                !degree ||
                !degree.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Degree / program is required.'
                    });

            }


            if (
                !batch ||
                !batch.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Batch is required.'
                    });

            }


            if (!dueDate) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Due date is required.'
                    });

            }


            const numericMaxMarks =
                Number(maxMarks);


            if (
                !Number.isFinite(
                    numericMaxMarks
                ) ||
                numericMaxMarks <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Maximum marks must be greater than 0.'
                    });

            }


            /* ==============================
               CHECK ASSIGNMENT OWNERSHIP
            ============================== */

            const existingAssignment =
                await pool.query(
                    `
                    SELECT *
                    FROM assignments

                    WHERE
                        id = $1
                        AND lecturer_id = $2
                    `,
                    [
                        id,
                        req.user.user_id
                    ]
                );


            if (
                existingAssignment
                    .rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Assignment not found or you do not have permission to edit it.'
                    });

            }


            const oldAssignment =
                existingAssignment
                    .rows[0];


            /* ==============================
               CHECK STUDENT SUBMISSIONS
            ============================== */

            const submissionCheck =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::int
                            AS submission_count

                    FROM submissions

                    WHERE assignment_id = $1
                    `,
                    [
                        id
                    ]
                );


            const submissionCount =
                submissionCheck
                    .rows[0]
                    .submission_count;


            /* ==============================
               PROTECT TARGET AFTER
               STUDENT SUBMISSIONS

               Lecturer may still change:
               - title
               - instructions
               - due date
               - max marks
               - assignment file

               But Degree / Batch cannot be
               changed once submissions exist.
            ============================== */

            const degreeChanged =
                oldAssignment.degree !==
                degree.trim();


            const batchChanged =
                oldAssignment.batch !==
                batch.trim();


            if (
                submissionCount > 0 &&
                (
                    degreeChanged ||
                    batchChanged
                )
            ) {

                /*
                  Multer may already have saved
                  a replacement file.

                  Remove it because this update
                  is being rejected.
                */

                if (
                    req.file &&
                    fs.existsSync(
                        req.file.path
                    )
                ) {

                    try {

                        fs.unlinkSync(
                            req.file.path
                        );

                    } catch (
                        fileError
                    ) {

                        console.error(
                            'Rejected assignment file cleanup warning:',
                            fileError.message
                        );

                    }

                }


                return res
                    .status(409)
                    .json({
                        error:
                            'Degree or batch cannot be changed because students have already submitted work for this assignment.'
                    });

            }


            /* ==============================
               PROTECT EXISTING GRADES
            ============================== */

            const awardedMarksResult =
                await pool.query(
                    `
                    SELECT
                        MAX(marks_awarded)
                            AS highest_marks

                    FROM submissions

                    WHERE assignment_id = $1
                    `,
                    [
                        id
                    ]
                );


            const highestMarks =
                Number(
                    awardedMarksResult
                        .rows[0]
                        ?.highest_marks || 0
                );


            if (
                numericMaxMarks <
                highestMarks
            ) {

                if (
                    req.file &&
                    fs.existsSync(
                        req.file.path
                    )
                ) {

                    try {

                        fs.unlinkSync(
                            req.file.path
                        );

                    } catch (
                        fileError
                    ) {

                        console.error(
                            'Rejected assignment file cleanup warning:',
                            fileError.message
                        );

                    }

                }


                return res
                    .status(400)
                    .json({
                        error:
                            `Maximum marks cannot be lower than an existing student mark of ${highestMarks}.`
                    });

            }


            /* ==============================
               OPTIONAL NEW FILE
            ============================== */

            let finalFilePath =
                oldAssignment
                    .file_path;


            if (req.file) {

                finalFilePath =
                    req.file.path
                        .replace(
                            /\\/g,
                            '/'
                        );

            }


            /* ==============================
               UPDATE ASSIGNMENT

               course_id becomes NULL because
               assignments are now targeted
               directly by Degree + Batch.
            ============================== */

            const updatedAssignment =
                await pool.query(
                    `
                    UPDATE assignments

                    SET
                        title = $1,
                        description = $2,
                        due_date = $3,
                        degree = $4,
                        batch = $5,
                        course_id = NULL,
                        max_marks = $6,
                        file_path = $7

                    WHERE
                        id = $8
                        AND lecturer_id = $9

                    RETURNING *
                    `,
                    [
                        title.trim(),

                        description?.trim() ||
                            '',

                        dueDate,

                        degree.trim(),

                        batch.trim(),

                        numericMaxMarks,

                        finalFilePath,

                        id,

                        req.user.user_id
                    ]
                );


            /* ==============================
               DELETE OLD ASSIGNMENT FILE
               AFTER SUCCESSFUL REPLACEMENT
            ============================== */

            if (
                req.file &&
                oldAssignment.file_path &&
                oldAssignment.file_path !==
                    finalFilePath
            ) {

                try {

                    const oldFilePath =
                        path.isAbsolute(
                            oldAssignment
                                .file_path
                        )
                            ? oldAssignment
                                .file_path
                            : path.join(
                                __dirname,
                                oldAssignment
                                    .file_path
                              );


                    if (
                        fs.existsSync(
                            oldFilePath
                        )
                    ) {

                        fs.unlinkSync(
                            oldFilePath
                        );

                    }

                } catch (
                    fileError
                ) {

                    console.error(
                        'Old assignment file cleanup warning:',
                        fileError.message
                    );

                }

            }


            /* ==============================
               SUCCESS
            ============================== */

            res.json({

                message:
                    'Assignment updated successfully!',

                assignment:
                    updatedAssignment
                        .rows[0]

            });


        } catch (error) {

            /*
              Remove a newly uploaded file
              if the database update failed.
            */

            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch (
                    fileError
                ) {

                    console.error(
                        'Assignment upload cleanup warning:',
                        fileError.message
                    );

                }

            }


            console.error(
                'Update Assignment Error:',
                error
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while updating assignment.'
                });

        }

    }
);

/* =========================================
   DELETE ASSIGNMENT BY LECTURER
========================================= */

app.delete(
    '/lecturer/assignments/:id',

    authenticateToken,

    authorizeRoles('LECTURER'),

    async (req, res) => {

        try {

            const { id } =
                req.params;


            /* ==============================
               CHECK ASSIGNMENT OWNERSHIP
            ============================== */

            const assignmentResult =
                await pool.query(
                    `
                    SELECT *
                    FROM assignments

                    WHERE
                        id = $1
                        AND lecturer_id = $2
                    `,
                    [
                        id,
                        req.user.user_id
                    ]
                );


            if (
                assignmentResult.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Assignment not found or you do not have permission to delete it.'
                    });

            }


            const assignment =
                assignmentResult.rows[0];


            /* ==============================
               CHECK FOR STUDENT SUBMISSIONS
            ============================== */

            const submissions =
                await pool.query(
                    `
                    SELECT COUNT(*)::int
                        AS submission_count

                    FROM submissions

                    WHERE assignment_id = $1
                    `,
                    [id]
                );


            const submissionCount =
                submissions.rows[0]
                    .submission_count;


            if (
                submissionCount > 0
            ) {

                return res
                    .status(409)
                    .json({
                        error:
                            'This assignment cannot be deleted because students have already submitted work.'
                    });

            }


            /* ==============================
               DELETE ASSIGNMENT
            ============================== */

            await pool.query(
                `
                DELETE FROM assignments
                WHERE id = $1
                `,
                [id]
            );


            /* ==============================
               DELETE FILE
            ============================== */

            if (
                assignment.file_path &&
                fs.existsSync(
                    assignment.file_path
                )
            ) {

                try {

                    fs.unlinkSync(
                        assignment.file_path
                    );

                } catch (fileError) {

                    console.error(
                        'Assignment file cleanup warning:',
                        fileError.message
                    );

                }

            }


            res.json({
                message:
                    'Assignment deleted successfully!'
            });


        } catch (error) {

            console.error(
                'Delete Assignment Error:',
                error.message
            );


            res
                .status(500)
                .json({
                    error:
                        'Server error while deleting assignment.'
                });

        }

    }
);

/* =========================================
   SERVER START
========================================= */

const PORT =
    process.env.PORT ||
    5000;


app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Server is running on http://localhost:${PORT}`
        );

    }
);