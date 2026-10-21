import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import axios from "axios";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Sparkles,
  Bot,
  User,
  Send,
  Lightbulb,
  FileText,
  BrainCircuit,
  BookOpen,
  RotateCcw,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

import "../styles/lecturerTutor.css";

import API_BASE_URL from "../config/api";


function LecturerTutor() {

  const location =
    useLocation();


  /* ========================================
     OPTIONAL COURSE CONTEXT
  ======================================== */

  const courseContext =
    location.state?.courseContext ||
    location.state?.lessonContext ||
    "";


  const courseTitle =
    location.state?.courseTitle ||
    location.state?.lessonTitle ||
    "";


  /* ========================================
     STATE
  ======================================== */

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState([]);


  const messagesEndRef =
    useRef(null);


  /* ========================================
     AUTO SCROLL
  ======================================== */

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [
    messages,
    loading,
  ]);


  /* ========================================
     TEACHING PROMPTS
  ======================================== */

  const suggestions = [

    {
      icon: Lightbulb,
      category: "LESSON DESIGN",
      title: "Lesson Plan",
      text:
        "Create a lesson plan for a university lecture.",
    },

    {
      icon: ClipboardList,
      category: "ASSESSMENT",
      title: "Assignment Builder",
      text:
        "Create an assignment with clear instructions and marking criteria.",
    },

    {
      icon: BrainCircuit,
      category: "KNOWLEDGE CHECK",
      title: "Quiz Generator",
      text:
        "Generate 10 quiz questions for my students.",
    },

    {
      icon: FileText,
      category: "GRADING",
      title: "Rubric Creator",
      text:
        "Create a marking rubric for an academic assignment.",
    },

    {
      icon: BookOpen,
      category: "TEACHING SUPPORT",
      title: "Explain a Topic",
      text:
        "Explain a difficult topic in a way I can teach to students.",
    },

  ];


  /* ========================================
     SEND QUESTION
  ======================================== */

  const sendQuestion =
    async () => {

      const trimmedQuestion =
        question.trim();


      if (
        !trimmedQuestion ||
        loading
      ) {

        return;

      }


      const userMessage = {

        id:
          `${Date.now()}-user`,

        role:
          "user",

        content:
          trimmedQuestion,

      };


      setMessages(
        (previous) => [
          ...previous,
          userMessage,
        ]
      );


      setQuestion("");

      setLoading(true);


      try {

        const token =
          localStorage.getItem(
            "token"
          );


        const response =
          await axios.post(

            `${API_BASE_URL}/tutor`,

            {

              question:
                trimmedQuestion,

              context:
                courseContext,

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );


        const aiMessage = {

          id:
            `${Date.now()}-assistant`,

          role:
            "assistant",

          content:
            response.data.answer ||
            "I couldn't generate an answer.",

        };


        setMessages(
          (previous) => [
            ...previous,
            aiMessage,
          ]
        );


      } catch (error) {

        console.error(
          "Lecturer Tutor API Error:",
          error.response
            ? error.response.data
            : error.message
        );


        const errorMessage = {

          id:
            `${Date.now()}-error`,

          role:
            "error",

          content:
            error.response
              ?.data?.error ||
            "The AI teaching assistant couldn't respond right now. Please try again.",

        };


        setMessages(
          (previous) => [
            ...previous,
            errorMessage,
          ]
        );


      } finally {

        setLoading(false);

      }

    };


  /* ========================================
     FORM SUBMIT
  ======================================== */

  const handleAskAI =
    async (event) => {

      event.preventDefault();

      await sendQuestion();

    };


  /* ========================================
     ENTER TO SEND
  ======================================== */

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendQuestion();

      }

    };


  /* ========================================
     CLEAR CHAT
  ======================================== */

  const clearChat = () => {

    setMessages([]);

    setQuestion("");

  };


  return (

    <div className="lecturer-tutor-page">


      {/* ====================================
          AI HERO
      ==================================== */}

      <section className="lecturer-ai-hero">


        <div className="lecturer-ai-hero-content">


          <div className="lecturer-ai-hero-icon">

            <Sparkles size={25} />

          </div>


          <div className="lecturer-ai-hero-text">


            <div className="lecturer-ai-eyebrow">

              <Sparkles size={12} />

              CAMPUSLEARN AI · TEACHING STUDIO

            </div>


            <h1>

              Create smarter.
              <br />

              <span>
                Teach better.
              </span>

            </h1>


            <p>

              Your intelligent workspace for
              building lessons, assessments,
              quizzes, rubrics and clear academic
              explanations.

            </p>


            <div className="lecturer-ai-capabilities">

              <span>
                <Lightbulb size={12} />
                Lesson Planning
              </span>

              <span>
                <ClipboardList size={12} />
                Assessment Design
              </span>

              <span>
                <BrainCircuit size={12} />
                Quiz Generation
              </span>

            </div>


          </div>

        </div>


        {/* HERO STATUS */}

        <div className="lecturer-ai-hero-status">


          <div className="lecturer-ai-status-top">

            <div className="lecturer-ai-live-dot">

              <span />

            </div>


            <div>

              <small>
                AI STATUS
              </small>

              <strong>
                Ready to create
              </strong>

            </div>

          </div>


          <div className="lecturer-ai-status-line" />


          <div className="lecturer-ai-status-bottom">

            <div>

              <span>
                WORKSPACE
              </span>

              <strong>
                Teaching
              </strong>

            </div>


            <div>

              <span>
                MODE
              </span>

              <strong>
                Academic
              </strong>

            </div>

          </div>


        </div>


      </section>


      {/* ====================================
          COURSE CONTEXT
      ==================================== */}

      {courseTitle && (

        <section className="lecturer-ai-context">


          <div className="lecturer-ai-context-icon">

            <GraduationCap size={18} />

          </div>


          <div className="lecturer-ai-context-content">

            <span>
              ACTIVE COURSE CONTEXT
            </span>

            <strong>
              {courseTitle}
            </strong>

          </div>


          <div className="lecturer-ai-context-badge">

            AI will use this course context

          </div>

        </section>

      )}


      {/* ====================================
          AI WORKSPACE
      ==================================== */}

      <section className="lecturer-ai-workspace">


        {/* ==================================
            PROMPT TOOLKIT
        ================================== */}

        <aside className="lecturer-prompt-panel">


          <div className="lecturer-prompt-heading">


            <div className="lecturer-prompt-heading-icon">

              <Sparkles size={19} />

            </div>


            <div>

              <span>
                PROMPT TOOLKIT
              </span>

              <h2>
                Start creating
              </h2>

            </div>

          </div>


          <p className="lecturer-prompt-description">

            Choose a teaching task below or
            write your own instruction.

          </p>


          <div className="lecturer-prompt-list">


            {suggestions.map(
              (
                suggestion,
                index
              ) => {

                const Icon =
                  suggestion.icon;


                return (

                  <button
                    key={index}
                    type="button"
                    className="lecturer-prompt-card"
                    onClick={() =>
                      setQuestion(
                        suggestion.text
                      )
                    }
                  >


                    <div className="lecturer-prompt-card-icon">

                      <Icon size={17} />

                    </div>


                    <div className="lecturer-prompt-card-content">

                      <span>
                        {suggestion.category}
                      </span>

                      <strong>
                        {suggestion.title}
                      </strong>

                    </div>


                    <span className="lecturer-prompt-arrow">
                      +
                    </span>


                  </button>

                );

              }
            )}


          </div>


          {/* TIP */}

          <div className="lecturer-teaching-tip">


            <div>

              <Lightbulb size={17} />

            </div>


            <div>

              <span>
                BETTER PROMPTS
              </span>

              <strong>
                Add teaching context
              </strong>

              <p>

                Include the subject, student
                level, duration, learning
                outcomes and marks for more
                useful results.

              </p>

            </div>

          </div>


        </aside>


        {/* ==================================
            CHAT STUDIO
        ================================== */}

        <div className="lecturer-ai-chat">


          {/* CHAT HEADER */}

          <div className="lecturer-ai-chat-header">


            <div className="lecturer-ai-chat-profile">


              <div className="lecturer-ai-chat-avatar">

                <Bot size={21} />

              </div>


              <div>

                <div className="lecturer-ai-chat-title">

                  <h3>
                    Teaching Assistant
                  </h3>


                  <span className="lecturer-ai-online">

                    <i />

                    Online

                  </span>

                </div>


                <p>

                  AI support for your
                  teaching workflow

                </p>

              </div>

            </div>


            {messages.length > 0 && (

              <button
                type="button"
                className="lecturer-ai-clear"
                onClick={clearChat}
                title="Clear conversation"
              >

                <RotateCcw size={15} />

                <span>
                  Clear chat
                </span>

              </button>

            )}


          </div>


          {/* =================================
              MESSAGES
          ================================= */}

          <div className="lecturer-ai-messages">


            {messages.length === 0 ? (

              <div className="lecturer-ai-empty">


                <div className="lecturer-ai-empty-visual">


                  <div className="lecturer-ai-orbit lecturer-ai-orbit-one" />

                  <div className="lecturer-ai-orbit lecturer-ai-orbit-two" />


                  <div className="lecturer-ai-empty-icon">

                    <Sparkles size={30} />

                  </div>


                </div>


                <span className="lecturer-ai-empty-eyebrow">

                  YOUR AI TEACHING PARTNER

                </span>


                <h2>

                  What will we
                  <span> create today?</span>

                </h2>


                <p>

                  Turn an idea into structured
                  teaching material. Ask for a
                  lesson plan, assessment,
                  marking rubric, quiz or
                  explanation.

                  {courseTitle && (
                    <>
                      {" "}
                      I already have context
                      from{" "}
                      <strong>
                        {courseTitle}
                      </strong>.
                    </>
                  )}

                </p>


                <div className="lecturer-ai-empty-tools">


                  <div>
                    <BookOpen size={14} />
                    Lessons
                  </div>


                  <div>
                    <ClipboardList size={14} />
                    Assessments
                  </div>


                  <div>
                    <BrainCircuit size={14} />
                    Quizzes
                  </div>


                  <div>
                    <FileText size={14} />
                    Rubrics
                  </div>


                </div>


              </div>

            ) : (

              messages.map(
                (message) => {

                  const isUser =
                    message.role ===
                    "user";


                  const isError =
                    message.role ===
                    "error";


                  return (

                    <div
                      key={message.id}
                      className={
                        `lecturer-ai-message ${
                          isUser
                            ? "lecturer-ai-message-user"
                            : "lecturer-ai-message-bot"
                        } ${
                          isError
                            ? "lecturer-ai-message-error"
                            : ""
                        }`
                      }
                    >


                      <div className="lecturer-ai-message-avatar">

                        {isUser ? (

                          <User size={16} />

                        ) : (

                          <Bot size={16} />

                        )}

                      </div>


                      <div className="lecturer-ai-message-content">


                        {!isUser &&
                          !isError && (

                          <div className="lecturer-ai-message-label">

                            <span />

                            CampusLearn AI

                          </div>

                        )}


                        {isUser ? (

                          <div className="lecturer-ai-message-body">

                            {message.content}

                          </div>

                        ) : (

                          <div className="lecturer-ai-message-body lecturer-ai-markdown">

                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                            >

                              {message.content}

                            </ReactMarkdown>

                          </div>

                        )}


                      </div>


                    </div>

                  );

                }
              )

            )}


            {/* THINKING */}

            {loading && (

              <div className="lecturer-ai-message lecturer-ai-message-bot">


                <div className="lecturer-ai-message-avatar">

                  <Bot size={16} />

                </div>


                <div className="lecturer-ai-message-content">


                  <div className="lecturer-ai-message-label">

                    <span />

                    CampusLearn AI

                  </div>


                  <div className="lecturer-ai-message-body lecturer-ai-thinking-body">


                    <div className="lecturer-ai-thinking">

                      <span />
                      <span />
                      <span />

                    </div>


                    <small>

                      Building your teaching
                      content...

                    </small>


                  </div>


                </div>


              </div>

            )}


            <div
              ref={messagesEndRef}
            />


          </div>


          {/* =================================
              COMPOSER
          ================================= */}

          <form
            className="lecturer-ai-composer"
            onSubmit={handleAskAI}
          >


            <div className="lecturer-ai-composer-heading">


              <div>

                <span>
                  TEACHING PROMPT
                </span>

                <strong>

                  Tell CampusLearn AI
                  what you want to build

                </strong>

              </div>


              <small>
                Enter ↵ to send
              </small>


            </div>


            <div className="lecturer-ai-input-wrapper">


              <textarea
                rows="1"
                value={question}
                onChange={
                  (event) =>
                    setQuestion(
                      event.target.value
                    )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder={
                  courseTitle
                    ? `Ask something about teaching ${courseTitle}...`
                    : "Describe the teaching material you want to create..."
                }
              />


              <button
                className="lecturer-ai-send"
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
                title="Send question"
              >

                <Send size={18} />

              </button>


            </div>


            <div className="lecturer-ai-composer-footer">


              <span>

                Shift + Enter for a new line

              </span>


              <p>

                AI-generated academic content
                should be reviewed before
                sharing with students.

              </p>


            </div>


          </form>


        </div>


      </section>


    </div>

  );

}


export default LecturerTutor;