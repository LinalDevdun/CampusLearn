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
  BookOpen,
  FileText,
  BrainCircuit,
  RotateCcw,
  GraduationCap,
  Target,
  Zap,
} from "lucide-react";

import "../styles/tutor.css";

import API_BASE_URL from "../config/api";


function Tutor() {

  const location =
    useLocation();


  /* ========================================
     LESSON CONTEXT
  ======================================== */

  const lessonContext =
    location.state?.lessonContext || "";

  const lessonTitle =
    location.state?.lessonTitle || "";


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
     SUGGESTED QUESTIONS
  ======================================== */

  const suggestions = [

    {
      icon: Lightbulb,
      label: "Explain",
      text:
        "Explain this concept in very simple words.",
    },

    {
      icon: FileText,
      label: "Summarize",
      text:
        "Summarize the important points for my exam.",
    },

    {
      icon: BrainCircuit,
      label: "Example",
      text:
        "Give me a simple example to understand this topic.",
    },

    {
      icon: BookOpen,
      label: "Practice",
      text:
        "Create 5 practice questions for me.",
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
                lessonContext,

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
          "Tutor API Error:",
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
            error.response?.data?.error ||
            "The AI tutor couldn't respond right now. Please try again.",

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

    <div className="tutor-page">


      {/* ====================================
          AI STUDIO HEADER
      ==================================== */}

      <section className="ai-studio-header">


        <div className="ai-studio-main">


          <div className="ai-studio-icon">

            <BrainCircuit
              size={25}
            />

          </div>


          <div>


            <div className="ai-studio-eyebrow">

              <Sparkles
                size={12}
              />

              CAMPUSLEARN INTELLIGENCE

            </div>


            <h1>
              AI Learning Studio
            </h1>


            <p>

              Learn through conversation.
              Ask questions, simplify difficult
              topics, revise smarter and turn
              confusing concepts into something
              you understand.

            </p>

          </div>

        </div>


        <div className="ai-studio-status">


          <div className="studio-pulse">

            <span />

          </div>


          <div>

            <small>
              AI STATUS
            </small>

            <strong>
              Ready to learn
            </strong>

          </div>

        </div>

      </section>


      {/* ====================================
          LESSON CONTEXT
      ==================================== */}

      {lessonTitle && (

        <section className="tutor-learning-context">


          <div className="learning-context-icon">

            <GraduationCap
              size={19}
            />

          </div>


          <div>

            <span>
              CURRENT LEARNING CONTEXT
            </span>

            <strong>
              {lessonTitle}
            </strong>

          </div>


          <div className="learning-context-badge">

            Context connected

          </div>

        </section>

      )}


      {/* ====================================
          WORKSPACE
      ==================================== */}

      <section className="tutor-workspace">


        {/* ==================================
            PROMPT LAB
        ================================== */}

        <aside className="tutor-side-panel">


          <div className="prompt-lab-heading">


            <div className="prompt-lab-icon">

              <Sparkles
                size={19}
              />

            </div>


            <div>

              <span>
                PROMPT LAB
              </span>

              <h2>
                Study shortcuts
              </h2>

            </div>

          </div>


          <p className="prompt-lab-copy">

            Start with one of these learning
            prompts or write your own question.

          </p>


          <div className="tutor-suggestions">

            {suggestions.map(
              (
                suggestion,
                index
              ) => {

                const Icon =
                  suggestion.icon;


                return (

                  <button
                    type="button"
                    className="tutor-suggestion"
                    key={index}
                    onClick={() =>
                      setQuestion(
                        suggestion.text
                      )
                    }
                  >


                    <div className="suggestion-icon">

                      <Icon
                        size={17}
                      />

                    </div>


                    <div>

                      <span className="suggestion-label">

                        {suggestion.label}

                      </span>


                      <strong>

                        {suggestion.text}

                      </strong>

                    </div>


                  </button>

                );

              }
            )}

          </div>


          {/* STUDY METHOD */}

          <div className="study-method-card">


            <div className="study-method-icon">

              <Target
                size={18}
              />

            </div>


            <div>

              <span>
                BETTER PROMPTS
              </span>

              <h3>
                Ask with context
              </h3>


              <p>

                Mention the topic, what you
                already understand and exactly
                where you feel confused.

              </p>

            </div>

          </div>


          <div className="ai-responsibility-note">

            <div>

              <Zap
                size={14}
              />

            </div>


            <p>

              AI can help you understand and
              practice, but important academic
              information should still be
              checked against your course
              materials.

            </p>

          </div>

        </aside>


        {/* ==================================
            CHAT STUDIO
        ================================== */}

        <div className="tutor-chat">


          {/* CHAT HEADER */}

          <div className="tutor-chat-header">


            <div className="tutor-chat-profile">


              <div className="tutor-chat-avatar">

                <Bot
                  size={21}
                />

              </div>


              <div>

                <div className="chat-profile-title">

                  <h3>
                    CampusLearn AI
                  </h3>


                  <div className="chat-online">

                    <span />

                    Online

                  </div>

                </div>


                <p>
                  Personal academic learning assistant
                </p>

              </div>

            </div>


            {messages.length > 0 && (

              <button
                type="button"
                className="tutor-clear-button"
                title="Clear conversation"
                onClick={clearChat}
              >

                <RotateCcw
                  size={15}
                />

                <span>
                  New chat
                </span>

              </button>

            )}

          </div>


          {/* =================================
              MESSAGES
          ================================= */}

          <div className="tutor-messages">


            {messages.length === 0 ? (

              <div className="tutor-empty">


                <div className="tutor-empty-visual">


                  <div className="empty-orbit orbit-one" />

                  <div className="empty-orbit orbit-two" />


                  <div className="tutor-empty-icon">

                    <Sparkles
                      size={31}
                    />

                  </div>

                </div>


                <span className="empty-eyebrow">

                  YOUR AI STUDY PARTNER

                </span>


                <h2>
                  What are we learning today?
                </h2>


                <p>

                  Ask me to break down a difficult
                  concept, summarize a topic,
                  create revision questions or
                  help you prepare for an exam.

                  {lessonTitle && (
                    <>
                      {" "}
                      I already have context from
                      your lesson{" "}
                      <strong>
                        {lessonTitle}
                      </strong>.
                    </>
                  )}

                </p>


                <div className="empty-capabilities">


                  <div>

                    <Lightbulb
                      size={14}
                    />

                    Explain

                  </div>


                  <div>

                    <FileText
                      size={14}
                    />

                    Summarize

                  </div>


                  <div>

                    <BrainCircuit
                      size={14}
                    />

                    Understand

                  </div>


                  <div>

                    <BookOpen
                      size={14}
                    />

                    Practice

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
                      key={
                        message.id
                      }
                      className={
                        `tutor-message ${
                          isUser
                            ? "tutor-message-user"
                            : "tutor-message-ai"
                        } ${
                          isError
                            ? "tutor-message-error"
                            : ""
                        }`
                      }
                    >


                      <div className="tutor-message-avatar">

                        {isUser ? (

                          <User
                            size={16}
                          />

                        ) : (

                          <Bot
                            size={16}
                          />

                        )}

                      </div>


                      <div className="tutor-message-content">


                        {!isUser &&
                          !isError && (

                          <div className="tutor-message-label">

                            <span />

                            CampusLearn AI

                          </div>

                        )}


                        {isUser ? (

                          <div className="tutor-message-body">

                            {message.content}

                          </div>

                        ) : (

                          <div className="tutor-message-body tutor-markdown">

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

              <div className="tutor-message tutor-message-ai">


                <div className="tutor-message-avatar">

                  <Bot
                    size={16}
                  />

                </div>


                <div className="tutor-message-content">


                  <div className="tutor-message-label">

                    <span />

                    CampusLearn AI

                  </div>


                  <div className="tutor-message-body tutor-thinking-body">


                    <div className="tutor-thinking">

                      <span />
                      <span />
                      <span />

                    </div>


                    <small>
                      Thinking about your question...
                    </small>

                  </div>

                </div>

              </div>

            )}


            <div
              ref={
                messagesEndRef
              }
            />

          </div>


          {/* =================================
              COMPOSER
          ================================= */}

          <form
            className="tutor-composer"
            onSubmit={handleAskAI}
          >


            <div className="composer-heading">

              <div>

                <span>
                  ASK CAMPUSLEARN AI
                </span>

                <strong>
                  Type your study question
                </strong>

              </div>


              <small>
                Enter ↵
              </small>

            </div>


            <div className="tutor-input-wrapper">


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
                  lessonTitle
                    ? `Ask something about ${lessonTitle}...`
                    : "Ask anything about your studies..."
                }
              />


              <button
                className="tutor-send-button"
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
                title="Send question"
              >

                <Send
                  size={18}
                />

              </button>

            </div>


            <div className="tutor-composer-footer">


              <span>

                Shift + Enter for new line

              </span>


              <p>

                AI answers may contain mistakes.
                Verify important academic details.

              </p>

            </div>

          </form>

        </div>

      </section>

    </div>

  );

}


export default Tutor;