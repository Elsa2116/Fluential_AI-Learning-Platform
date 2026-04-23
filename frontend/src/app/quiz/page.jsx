"use client";

import { useEffect, useMemo, useState } from "react";
import QuizCard from "@/components/QuizCard";
import { generateQuiz } from "@/lib/api-client";

export default function QuizPage() {
  const [quizSource, setQuizSource] = useState(
    "Python basics, FastAPI fundamentals, and machine learning concepts.",
  );
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState("Generating your first quiz...");
  const [isGenerating, setIsGenerating] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const quizSize = questions.length;

  useEffect(() => {
    generateNextQuizSet({ resetScore: true });
  }, []);

  async function generateNextQuizSet({ resetScore = false } = {}) {
    setIsGenerating(true);
    setStatus("Generating quiz from AI...");

    try {
      const data = await generateQuiz(quizSource);
      const rawQuestions = Array.isArray(data) ? data : data?.questions || [];
      const normalized = rawQuestions.filter(
        (item) =>
          item &&
          typeof item.prompt === "string" &&
          Array.isArray(item.choices) &&
          typeof item.answer === "string",
      );

      if (!normalized.length) {
        setStatus("No quiz questions returned. Try a different topic.");
        return;
      }

      setQuestions(normalized);
      setCurrentIndex(0);
      setSelectedChoice("");
      setRevealed(false);
      if (resetScore) {
        setCorrectCount(0);
        setAnsweredCount(0);
      }
      setStatus("Quiz ready. Click an answer to check it.");
    } catch (error) {
      setStatus(error.message || "Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSelect(choice) {
    if (!currentQuestion || revealed || isGenerating) {
      return;
    }

    const isCorrect = choice === currentQuestion.answer;
    setSelectedChoice(choice);
    setRevealed(true);
    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setStatus("Correct. Click Next Question.");
    } else {
      setStatus(`Not correct. Right answer: ${currentQuestion.answer}`);
    }
  }

  async function handleNext() {
    if (!revealed) {
      return;
    }

    const isLast = currentIndex >= quizSize - 1;
    if (isLast) {
      setStatus("Quiz finished. Generating your next quiz...");
      await generateNextQuizSet();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedChoice("");
    setRevealed(false);
    setStatus("Next question loaded.");
  }

  const progressLabel = useMemo(() => {
    if (!quizSize) {
      return "Question 0/0";
    }

    return `Question ${currentIndex + 1}/${quizSize}`;
  }, [currentIndex, quizSize]);

  return (
    <section className="grid" style={{ gap: 16 }}>
      <div className="page-intro">
        <span className="page-kicker">Adaptive Checkpoint</span>
        <h2 style={{ margin: 0 }}>Quick Quiz</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Lightweight knowledge checks help the platform adapt content and track
          progress.
        </p>
      </div>

      <article className="card grid glass-panel" style={{ gap: 10 }}>
        <label>
          Quiz topic/content
          <textarea
            className="textarea"
            rows={3}
            value={quizSource}
            onChange={(event) => setQuizSource(event.target.value)}
            placeholder="Enter subject or lesson content for quiz generation"
          />
        </label>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => generateNextQuizSet({ resetScore: true })}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate New Quiz"}
        </button>
      </article>

      {currentQuestion ? (
        <QuizCard
          question={currentQuestion}
          selected={selectedChoice}
          onSelect={handleSelect}
          disabled={revealed || isGenerating}
          revealAnswer={revealed}
        />
      ) : (
        <article className="card">No quiz loaded yet.</article>
      )}

      <article className="card grid" style={{ gap: 10 }}>
        <strong>{progressLabel}</strong>
        <p className="muted" style={{ margin: 0 }}>
          {status}
        </p>
        <div className="actions">
          <button
            className="button"
            type="button"
            onClick={handleNext}
            disabled={!revealed || isGenerating}
          >
            {currentIndex >= quizSize - 1
              ? "Finish & Next Quiz"
              : "Next Question"}
          </button>
        </div>
      </article>

      <article className="card glass-panel">
        <strong style={{ fontSize: 18 }}>
          Score: {correctCount}/{answeredCount}
        </strong>
      </article>
    </section>
  );
}
