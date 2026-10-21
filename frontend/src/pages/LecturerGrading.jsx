import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  GraduationCap,
  Search,
  Clock3,
  CircleCheckBig,
  FileText,
  BookOpen,
  Award,
  MessageSquareText,
  Send,
  CheckCircle2,
  Eye,
  Sparkles,
  ClipboardCheck,
  Save,
  Target,
  ChevronRight,
  ExternalLink,
  Users,
  TrendingUp,
} from "lucide-react";

import "../styles/lecturerGrading.css";

import API_BASE_URL from "../config/api";


function LecturerGrading() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================
     STATE
  ======================================== */

  const [submissions, setSubmissions] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [publishing, setPublishing] =
    useState(false);


  /* ========================================
     INITIALS
  ======================================== */

  const getInitials = (name) => {

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


  /* ========================================
     FILE NAME
  ======================================== */

  const getFileName = (
    filePath
  ) => {

    if (!filePath) {
      return "Submission file";
    }


    return String(filePath)
      .replace(/\\/g, "/")
      .split("/")
      .pop();

  };


  /* ========================================
     FORMAT SUBMISSION
  ======================================== */

  const formatSubmission = (
    submission
  ) => {

    const draftKey =
      `lecturerGradingDraft_${submission.submission_id}`;


    let savedDraft = null;


    try {

      const draft =
        localStorage.getItem(
          draftKey
        );


      if (draft) {

        savedDraft =
          JSON.parse(draft);

      }

    } catch {

      savedDraft = null;

    }


    const isGraded =
      submission.grade !== null &&
      submission.grade !== undefined &&
      submission.grade !== "";


    return {

      id:
        submission.submission_id,

      student:
        submission.student_name ||
        "Student",

      studentId:
        submission.student_id,

      studentEmail:
        submission.student_email ||
        "",

      initials:
        getInitials(
          submission.student_name
        ),

      assignment:
        submission.assignment_title ||
        "Assignment",

      program:
        submission.degree ||
        "No degree",

      batch:
        submission.batch ||
        "No batch",

      fileName:
        getFileName(
          submission.file_path
        ),

      filePath:
        submission.file_path,

      maxMarks:
        Number(
          submission.max_marks ||
          100
        ),

      status:
        isGraded
          ? "Graded"
          : "To Grade",

      marks:
        isGraded
          ? (
              submission
                .marks_awarded ??
              ""
            )
          : (
              savedDraft?.marks ??
              submission
                .marks_awarded ??
              ""
            ),

      feedback:
        isGraded
          ? (
              submission.feedback ||
              ""
            )
          : (
              savedDraft?.feedback ??
              submission.feedback ??
              ""
            ),

      grade:
        submission.grade ||
        "",

      submittedAt:
        submission.submitted_at,

    };

  };


  /* ========================================
     LOAD REAL SUBMISSIONS
  ======================================== */

  const loadSubmissions =
    async (
      preferredSubmissionId = null
    ) => {

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
            `${API_BASE_URL}/lecturer/submissions`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const realData =
          Array.isArray(
            response.data?.submissions
          )
            ? response.data.submissions
            : [];


        const formatted =
          realData.map(
            formatSubmission
          );


        setSubmissions(
          formatted
        );


        /* ==================================
           SELECT CORRECT SUBMISSION
        ================================== */

        const requestedId =
          Number(
            preferredSubmissionId
          );


        const requestedExists =
          formatted.some(
            (submission) =>
              submission.id ===
              requestedId
          );


        if (
          requestedId &&
          requestedExists
        ) {

          setSelectedId(
            requestedId
          );

        } else {

          const firstPending =
            formatted.find(
              (submission) =>
                submission.status ===
                "To Grade"
            );


          setSelectedId(
            firstPending?.id ||
            formatted[0]?.id ||
            null
          );

        }


      } catch (loadError) {

        console.error(
          "Failed to load grading data:",
          loadError
        );


        if (
          loadError.response?.status ===
            401 ||
          loadError.response?.status ===
            403
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
          loadError.response?.data
            ?.error ||
          "Failed to load grading submissions."
        );


      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadSubmissions(
      location.state
        ?.submissionId ||
      null
    );

  }, []);


  /* ========================================
     CURRENT SUBMISSION
  ======================================== */

  const selectedSubmission =
    submissions.find(
      (submission) =>
        submission.id ===
        selectedId
    );


  /* ========================================
     FILTER QUEUE
  ======================================== */

  const filteredSubmissions =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return submissions.filter(
        (submission) => {

          const combined =
            `
              ${submission.student}
              ${submission.assignment}
              ${submission.program}
              ${submission.batch}
            `
              .toLowerCase();


          return combined.includes(
            search
          );

        }
      );

    }, [
      submissions,
      searchTerm,
    ]);


  /* ========================================
     COUNTS
  ======================================== */

  const toGradeCount =
    submissions.filter(
      (submission) =>
        submission.status ===
        "To Grade"
    ).length;


  const gradedCount =
    submissions.filter(
      (submission) =>
        submission.status ===
        "Graded"
    ).length;


  const totalSubmissions =
    submissions.length;


  const gradingProgress =
    totalSubmissions > 0

      ? Math.round(
          (
            gradedCount /
            totalSubmissions
          ) * 100
        )

      : 0;


  const uniqueStudents =
    new Set(
      submissions.map(
        (submission) =>
          submission.studentId
      )
    ).size;


  /* ========================================
     UPDATE MARKS / FEEDBACK
  ======================================== */

  const updateSelectedSubmission = (
    field,
    value
  ) => {

    setSubmissions(
      (previous) =>
        previous.map(
          (submission) =>
            submission.id ===
            selectedId
              ? {
                  ...submission,
                  [field]: value,
                }
              : submission
        )
    );

  };


  /* ========================================
     PERCENTAGE
  ======================================== */

  const percentage = (() => {

    if (
      !selectedSubmission ||
      selectedSubmission.marks === ""
    ) {

      return 0;

    }


    const marks =
      Number(
        selectedSubmission.marks
      );


    if (
      Number.isNaN(marks) ||
      selectedSubmission
        .maxMarks === 0
    ) {

      return 0;

    }


    return Math.round(
      (
        marks /
        selectedSubmission.maxMarks
      ) * 100
    );

  })();


  /* ========================================
     LETTER GRADE
  ======================================== */

  const getGrade = (
    percentageValue
  ) => {

    if (
      percentageValue >= 80
    ) {
      return "A";
    }


    if (
      percentageValue >= 70
    ) {
      return "B";
    }


    if (
      percentageValue >= 60
    ) {
      return "C";
    }


    if (
      percentageValue >= 50
    ) {
      return "D";
    }


    return "F";

  };


  const grade =
    selectedSubmission?.marks === ""
      ? "—"
      : getGrade(
          percentage
        );


  /* ========================================
     FILE URL
  ======================================== */

  const getFileUrl = (
    filePath
  ) => {

    if (!filePath) {
      return "";
    }


    const normalized =
      String(filePath)
        .replace(/\\/g, "/");


    const uploadsIndex =
      normalized
        .toLowerCase()
        .lastIndexOf(
          "/uploads/"
        );


    let relativePath;


    if (
      uploadsIndex !== -1
    ) {

      relativePath =
        normalized.slice(
          uploadsIndex + 1
        );

    } else if (
      normalized
        .toLowerCase()
        .startsWith(
          "uploads/"
        )
    ) {

      relativePath =
        normalized;

    } else {

      const fileName =
        normalized
          .split("/")
          .pop();


      relativePath =
        `uploads/${fileName}`;

    }


    return (
      `${API_BASE_URL}/${relativePath}`
    );

  };


  /* ========================================
     OPEN SUBMISSION FILE
  ======================================== */

  const handleOpenFile = () => {

    if (
      !selectedSubmission
        ?.filePath
    ) {

      alert(
        "No submission file is available."
      );

      return;

    }


    const fileUrl =
      getFileUrl(
        selectedSubmission
          .filePath
      );


    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );

  };


  /* ========================================
     SAVE DRAFT LOCALLY
  ======================================== */

  const handleSaveDraft = () => {

    if (!selectedSubmission) {
      return;
    }


    const draftKey =
      `lecturerGradingDraft_${selectedSubmission.id}`;


    localStorage.setItem(
      draftKey,
      JSON.stringify({

        marks:
          selectedSubmission.marks,

        feedback:
          selectedSubmission.feedback,

      })
    );


    alert(
      "Draft saved on this device."
    );

  };


  /* ========================================
     PUBLISH GRADE
  ======================================== */

  const handlePublishGrade =
    async () => {

      if (!selectedSubmission) {
        return;
      }


      const marks =
        Number(
          selectedSubmission.marks
        );


      if (
        selectedSubmission.marks ===
          "" ||
        Number.isNaN(marks)
      ) {

        alert(
          "Please enter the student's marks."
        );

        return;

      }


      if (
        marks < 0 ||
        marks >
          selectedSubmission
            .maxMarks
      ) {

        alert(
          `Marks must be between 0 and ${selectedSubmission.maxMarks}.`
        );

        return;

      }


      try {

        setPublishing(true);


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate("/login");

          return;

        }


        const response =
          await axios.put(
            `${API_BASE_URL}/submissions/${selectedSubmission.id}/grade`,
            {
              marks_awarded:
                marks,

              feedback:
                selectedSubmission
                  .feedback
                  .trim(),
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        localStorage.removeItem(
          `lecturerGradingDraft_${selectedSubmission.id}`
        );


        alert(
          response.data?.message ||
          "Grade published successfully! 🎓"
        );


        await loadSubmissions(
          selectedSubmission.id
        );


      } catch (publishError) {

        console.error(
          "Publish grade error:",
          publishError
        );


        if (
          publishError.response
            ?.status === 401 ||
          publishError.response
            ?.status === 403
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
          publishError.response
            ?.data?.error ||
          "Failed to publish grade."
        );


      } finally {

        setPublishing(false);

      }

    };


  return (

    <div className="lecturer-grading-page">


      {/* ====================================
          ASSESSMENT STUDIO HERO
      ==================================== */}

      <section className="lg-studio-hero">


        <div className="lg-studio-intro">


          <div className="lg-studio-icon">

            <GraduationCap
              size={24}
            />

          </div>


          <div>

            <span className="lg-kicker">

              <Sparkles size={12} />

              ASSESSMENT STUDIO

            </span>


            <h1>
              Grade with clarity.
            </h1>


            <p>

              Review student work, award
              marks and provide meaningful
              academic feedback from one
              focused marking workspace.

            </p>

          </div>

        </div>


        <div className="lg-studio-stats">


          <div>

            <span>
              WAITING
            </span>

            <strong>
              {loading
                ? "..."
                : toGradeCount}
            </strong>

            <small>
              Need attention
            </small>

          </div>


          <div>

            <span>
              REVIEWED
            </span>

            <strong>
              {loading
                ? "..."
                : gradedCount}
            </strong>

            <small>
              Grades published
            </small>

          </div>


          <div>

            <span>
              STUDENTS
            </span>

            <strong>
              {loading
                ? "..."
                : uniqueStudents}
            </strong>

            <small>
              In grading queue
            </small>

          </div>

        </div>


        <div className="lg-studio-progress">


          <div
            className="lg-progress-ring"
            style={{
              background:
                `conic-gradient(
                  #ffffff ${gradingProgress * 3.6}deg,
                  rgba(255,255,255,0.17) 0deg
                )`,
            }}
          >

            <div className="lg-progress-ring-inner">

              <strong>
                {gradingProgress}%
              </strong>

              <span>
                COMPLETE
              </span>

            </div>

          </div>


          <div className="lg-progress-copy">

            <span>
              MARKING PROGRESS
            </span>

            <strong>

              {gradingProgress === 100
                ? "All caught up"
                : "Keep the queue moving"}

            </strong>

            <p>

              {gradedCount} of{" "}
              {totalSubmissions} submissions
              graded.

            </p>

          </div>

        </div>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (

        <div className="lg-error-message">

          {error}

        </div>

      )}


      {/* ====================================
          MAIN STUDIO
      ==================================== */}

      <section className="lg-workspace">


        {/* ==================================
            LEFT: MARKING QUEUE
        ================================== */}

        <aside className="lg-queue">


          <div className="lg-queue-header">


            <div className="lg-queue-heading-icon">

              <ClipboardCheck
                size={18}
              />

            </div>


            <div>

              <span>
                MARKING INBOX
              </span>

              <h2>
                Grading Queue
              </h2>

              <p>

                Choose a submission
                to assess.

              </p>

            </div>


            <div className="lg-queue-count">

              {filteredSubmissions.length}

            </div>

          </div>


          <div className="lg-search">

            <Search size={16} />


            <input
              type="text"
              placeholder="Find student or assignment..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>


          <div className="lg-queue-list">


            {loading && (

              <div className="lg-queue-message">

                Loading submissions...

              </div>

            )}


            {!loading &&
              filteredSubmissions.map(
                (submission) => (

                  <button
                    type="button"
                    key={
                      submission.id
                    }
                    className={
                      `lg-queue-item ${
                        selectedId ===
                        submission.id
                          ? "lg-queue-item-active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setSelectedId(
                        submission.id
                      )
                    }
                  >


                    <div className="lg-queue-avatar">

                      {
                        submission
                          .initials
                      }

                    </div>


                    <div className="lg-queue-info">

                      <strong>

                        {
                          submission
                            .student
                        }

                      </strong>

                      <span>

                        {
                          submission
                            .assignment
                        }

                      </span>

                      <small>

                        {
                          submission
                            .program
                        }

                        {" • "}

                        {
                          submission
                            .batch
                        }

                      </small>

                    </div>


                    <div className="lg-queue-end">


                      <div
                        className={
                          submission.status ===
                          "Graded"
                            ? "lg-small-status lg-small-status-graded"
                            : "lg-small-status lg-small-status-pending"
                        }
                      >

                        {submission.status ===
                        "Graded" ? (

                          <CircleCheckBig
                            size={12}
                          />

                        ) : (

                          <Clock3
                            size={12}
                          />

                        )}

                      </div>


                      <ChevronRight
                        size={14}
                      />

                    </div>

                  </button>

                )
              )}


            {!loading &&
              filteredSubmissions.length ===
                0 && (

              <div className="lg-queue-empty">

                <Search size={22} />

                <strong>
                  Nothing found
                </strong>

                <span>

                  Try another student
                  or assignment.

                </span>

              </div>

            )}

          </div>

        </aside>


        {/* ==================================
            RIGHT: GRADING CANVAS
        ================================== */}

        {selectedSubmission ? (

          <div className="lg-grading-panel">


            {/* ==================================
                STUDENT STRIP
            ================================== */}

            <div className="lg-student-header">


              <div className="lg-student-profile">


                <div className="lg-large-avatar">

                  {
                    selectedSubmission
                      .initials
                  }

                </div>


                <div>

                  <span className="lg-student-label">
                    CURRENT ASSESSMENT
                  </span>

                  <h2>

                    {
                      selectedSubmission
                        .student
                    }

                  </h2>

                  <p>

                    Student ID{" "}

                    {
                      selectedSubmission
                        .studentId
                    }


                    {selectedSubmission
                      .studentEmail && (

                      <>

                        {" • "}

                        {
                          selectedSubmission
                            .studentEmail
                        }

                      </>

                    )}

                  </p>

                </div>

              </div>


              <span
                className={
                  selectedSubmission
                    .status ===
                  "Graded"
                    ? "lg-status lg-status-graded"
                    : "lg-status lg-status-pending"
                }
              >

                {selectedSubmission
                  .status ===
                "Graded" ? (

                  <CircleCheckBig
                    size={12}
                  />

                ) : (

                  <Clock3
                    size={12}
                  />

                )}


                {
                  selectedSubmission
                    .status
                }

              </span>

            </div>


            {/* ==================================
                ASSESSMENT INFO
            ================================== */}

            <div className="lg-info-grid">


              <div className="lg-info-card">

                <div className="lg-info-icon">

                  <BookOpen
                    size={18}
                  />

                </div>

                <div>

                  <span>
                    PROGRAM / BATCH
                  </span>

                  <strong>

                    {
                      selectedSubmission
                        .program
                    }

                    {" • "}

                    {
                      selectedSubmission
                        .batch
                    }

                  </strong>

                </div>

              </div>


              <div className="lg-info-card">

                <div className="lg-info-icon">

                  <FileText
                    size={18}
                  />

                </div>

                <div>

                  <span>
                    ASSIGNMENT
                  </span>

                  <strong>

                    {
                      selectedSubmission
                        .assignment
                    }

                  </strong>

                </div>

              </div>


              <div className="lg-info-card">

                <div className="lg-info-icon">

                  <Award
                    size={18}
                  />

                </div>

                <div>

                  <span>
                    MAXIMUM MARKS
                  </span>

                  <strong>

                    {
                      selectedSubmission
                        .maxMarks
                    }

                  </strong>

                </div>

              </div>

            </div>


            {/* ==================================
                SUBMISSION FILE
            ================================== */}

            <div className="lg-submission-file">


              <div className="lg-file-icon">

                <FileText
                  size={22}
                />

              </div>


              <div>

                <span>
                  STUDENT SUBMISSION
                </span>

                <strong>

                  {
                    selectedSubmission
                      .fileName
                  }

                </strong>

                <p>
                  Review the submitted file
                  before finalizing the result.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  handleOpenFile
                }
              >

                <Eye size={14} />

                Open File

                <ExternalLink
                  size={12}
                />

              </button>

            </div>


            {/* ==================================
                GRADING LAB
            ================================== */}

            <div className="lg-grading-lab">


              {/* LEFT */}

              <div className="lg-marking-area">


                <div className="lg-section-title">


                  <span>

                    <Target
                      size={12}
                    />

                    RESULT BUILDER

                  </span>


                  <h3>
                    Mark this submission
                  </h3>


                  <p>

                    Enter the awarded marks
                    and review the calculated
                    result before publishing.

                  </p>

                </div>


                <div className="lg-score-builder">


                  <div className="lg-form-group">

                    <label>
                      Marks Awarded
                    </label>


                    <div className="lg-mark-input">

                      <input
                        type="number"
                        min="0"
                        max={
                          selectedSubmission
                            .maxMarks
                        }
                        value={
                          selectedSubmission
                            .marks
                        }
                        onChange={(event) =>
                          updateSelectedSubmission(
                            "marks",
                            event.target
                              .value
                          )
                        }
                      />

                      <span>

                        /{" "}

                        {
                          selectedSubmission
                            .maxMarks
                        }

                      </span>

                    </div>

                  </div>


                  <div className="lg-score-guide">

                    <span>
                      SCORE PREVIEW
                    </span>

                    <p>

                      The percentage and
                      letter grade update
                      automatically.

                    </p>

                  </div>

                </div>


                {/* FEEDBACK */}

                <div className="lg-form-group lg-feedback-group">

                  <label>

                    <MessageSquareText
                      size={14}
                    />

                    Lecturer Feedback

                  </label>


                  <textarea
                    rows="7"
                    placeholder="Write constructive feedback for the student..."
                    value={
                      selectedSubmission
                        .feedback
                    }
                    onChange={(event) =>
                      updateSelectedSubmission(
                        "feedback",
                        event.target
                          .value
                      )
                    }
                  />

                  <span className="lg-feedback-hint">

                    Give clear, specific
                    feedback the student can
                    use to improve.

                  </span>

                </div>

              </div>


              {/* RIGHT RESULT CARD */}

              <aside className="lg-result-card">


                <div className="lg-result-card-top">

                  <span>
                    LIVE RESULT
                  </span>

                  <TrendingUp
                    size={16}
                  />

                </div>


                <div
                  className="lg-score-ring"
                  style={{
                    background:
                      `conic-gradient(
                        #4f63e7 ${Math.min(
                          percentage,
                          100
                        ) * 3.6}deg,
                        #e9edfa 0deg
                      )`,
                  }}
                >

                  <div className="lg-score-ring-inner">

                    <strong>
                      {percentage}%
                    </strong>

                    <span>
                      SCORE
                    </span>

                  </div>

                </div>


                <div className="lg-grade-display">

                  <span>
                    LETTER GRADE
                  </span>

                  <strong>
                    {grade}
                  </strong>

                </div>


                <div className="lg-result-status">

                  {selectedSubmission
                    .status ===
                  "Graded" ? (

                    <>

                      <CheckCircle2
                        size={15}
                      />

                      Published result

                    </>

                  ) : (

                    <>

                      <Clock3
                        size={15}
                      />

                      Draft result

                    </>

                  )}

                </div>


                <div className="lg-result-summary">

                  <div>

                    <span>
                      Marks
                    </span>

                    <strong>

                      {
                        selectedSubmission
                          .marks === ""
                          ? "—"
                          : selectedSubmission
                              .marks
                      }

                      {" / "}

                      {
                        selectedSubmission
                          .maxMarks
                      }

                    </strong>

                  </div>


                  <div>

                    <span>
                      Grade
                    </span>

                    <strong>
                      {grade}
                    </strong>

                  </div>

                </div>

              </aside>

            </div>


            {/* ==================================
                ACTION BAR
            ================================== */}

            <div className="lg-form-actions">


              <div className="lg-action-note">

                <GraduationCap
                  size={16}
                />

                <div>

                  <strong>
                    Ready to finalize?
                  </strong>

                  <span>

                    Save a draft or publish
                    the result to the student.

                  </span>

                </div>

              </div>


              <div className="lg-action-buttons">


                <button
                  type="button"
                  className="lg-save-draft"
                  onClick={
                    handleSaveDraft
                  }
                  disabled={
                    publishing
                  }
                >

                  <Save size={14} />

                  Save Draft

                </button>


                <button
                  type="button"
                  className="lg-publish-button"
                  onClick={
                    handlePublishGrade
                  }
                  disabled={
                    publishing
                  }
                >

                  {publishing ? (

                    <>
                      Publishing...
                    </>

                  ) : selectedSubmission
                      .status ===
                    "Graded" ? (

                    <>

                      <CheckCircle2
                        size={15}
                      />

                      Update Grade

                    </>

                  ) : (

                    <>

                      <Send
                        size={15}
                      />

                      Publish Grade

                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        ) : (

          <div className="lg-empty-workspace">


            <div className="lg-empty-workspace-icon">

              <GraduationCap
                size={29}
              />

            </div>


            <span>
              ASSESSMENT STUDIO
            </span>

            <h3>
              Select a submission
            </h3>

            <p>

              Choose a student submission
              from the grading queue to
              start reviewing and marking.

            </p>

          </div>

        )}

      </section>

    </div>

  );

}


export default LecturerGrading;