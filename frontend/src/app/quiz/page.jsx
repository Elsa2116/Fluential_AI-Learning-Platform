"use client";

import { useState } from "react";
import QuizCard from "@/components/QuizCard";
import { calculateScore } from "@/features/quiz/quiz.engine";

const questions = [
  {
    id: 1,
    prompt: "Which framework is required for the backend in this task?",
    choices: ["Django", "Spring", "FastAPI", "Express"],
    answer: "FastAPI",
  },
  {
    id: 2,
    prompt: "What should AI provide in the platform?",
    choices: [
      "Only decoration",
      "Real learning value",
      "No features",
      "Random output",
    ],
    answer: "Real learning value",
  },
];

export default function QuizPage() {
  const [selected, setSelected] = useState({});
  const score = calculateScore(questions, selected);

  return (
    <section className="grid" style={{ gap: 16 }}>
      <h2>Quick Quiz</h2>
      {questions.map((question) => (
        <QuizCard
          key={question.id}
          question={question}
          selected={selected[question.id]}
          onSelect={(value) =>
            setSelected((prev) => ({
              ...prev,
              [question.id]: value,
            }))
          }
        />
      ))}
      <article className="card">
        <strong>
          Score: {score.correct}/{score.total}
        </strong>
      </article>
    </section>
  );
}
