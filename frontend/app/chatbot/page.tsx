"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);

    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I’m MediAssist AI. I can help you understand your medical reports and answer general health-related questions. How can I help you?",
      },
    ]);
  }, [router]);

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    const userMessage = message.trim();

    setMessage("");
    setError("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      /*
       * Chatbot API
       *
       * IMPORTANT:
       * The endpoint below assumes the backend chatbot
       * endpoint is /chatbot.
       */

      const response = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to get response from AI assistant.";

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      /*
       * We support a few common backend response formats.
       */

      const assistantMessage =
        data.response ||
        data.message ||
        data.answer ||
        data.reply ||
        "I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (err) {
      console.error(err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your request right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const goBack = () => {
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <main className="chatbot-page">

      {/* HEADER */}

      <header className="chatbot-header">

        <div className="chatbot-brand">

          <div className="chatbot-logo">
            🩺
          </div>

          <div>
            <h1>MediAssist AI</h1>

            <p>
              Intelligent Healthcare Assistant
            </p>
          </div>

        </div>

        <div className="header-actions">

          <button
            className="back-button"
            onClick={goBack}
          >
            ← Dashboard
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* CHAT AREA */}

      <section className="chat-container">

        <div className="chat-title">

          <div className="assistant-icon">
            🤖
          </div>

          <div>
            <h2>AI Health Assistant</h2>

            <p>
              Ask questions about your medical reports
              and health information.
            </p>
          </div>

        </div>


        {/* MESSAGES */}

        <div className="messages-container">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`message-row ${
                msg.role === "user"
                  ? "user-row"
                  : "assistant-row"
              }`}
            >

              <div
                className={`message-bubble ${
                  msg.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                <div className="message-label">

                  {msg.role === "user"
                    ? "You"
                    : "MediAssist AI"}

                </div>

                <div className="message-content">
                  {msg.content}
                </div>

              </div>

            </div>

          ))}


          {loading && (

            <div className="message-row assistant-row">

              <div className="message-bubble assistant-message">

                <div className="message-label">
                  MediAssist AI
                </div>

                <div className="typing">
                  Thinking...
                </div>

              </div>

            </div>

          )}

        </div>


        {/* ERROR */}

        {error && (

          <div className="chat-error">
            {error}
          </div>

        )}


        {/* INPUT */}

        <div className="chat-input-area">

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask something about your health or report..."
            rows={2}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="send-button"
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

        <p className="chat-disclaimer">
          MediAssist AI provides general information and
          should not replace professional medical advice.
        </p>

      </section>

    </main>
  );
}
