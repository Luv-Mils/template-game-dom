import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameTheme } from '../../types';
import { GameShell, StatCard, ActionButton, GameOverModal, ProgressBar } from '../../components';

interface Question {
  question: string;
  answers: string[];
  correct: number;
  category: string;
}

const QUESTIONS: Question[] = [
  { question: 'What planet is known as the Red Planet?', answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1, category: 'Science' },
  { question: 'Which element has the chemical symbol "O"?', answers: ['Gold', 'Silver', 'Oxygen', 'Iron'], correct: 2, category: 'Science' },
  { question: 'What year did World War II end?', answers: ['1943', '1944', '1945', '1946'], correct: 2, category: 'History' },
  { question: 'Who painted the Mona Lisa?', answers: ['Van Gogh', 'Da Vinci', 'Picasso', 'Monet'], correct: 1, category: 'Art' },
  { question: 'What is the largest ocean on Earth?', answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, category: 'Geography' },
  { question: 'What is the square root of 144?', answers: ['10', '11', '12', '14'], correct: 2, category: 'Math' },
  { question: 'Which country has the most people?', answers: ['USA', 'India', 'China', 'Indonesia'], correct: 1, category: 'Geography' },
  { question: 'What gas do plants absorb from the atmosphere?', answers: ['Oxygen', 'Nitrogen', 'CO2', 'Hydrogen'], correct: 2, category: 'Science' },
  { question: 'Who wrote "Romeo and Juliet"?', answers: ['Dickens', 'Shakespeare', 'Austen', 'Tolkien'], correct: 1, category: 'Literature' },
  { question: 'What is the boiling point of water in Celsius?', answers: ['90°', '95°', '100°', '110°'], correct: 2, category: 'Science' },
  { question: 'Which planet is closest to the Sun?', answers: ['Venus', 'Mercury', 'Earth', 'Mars'], correct: 1, category: 'Science' },
  { question: 'How many continents are there?', answers: ['5', '6', '7', '8'], correct: 2, category: 'Geography' },
  { question: 'What is the hardest natural substance?', answers: ['Gold', 'Iron', 'Diamond', 'Quartz'], correct: 2, category: 'Science' },
  { question: 'Who discovered gravity (legend)?', answers: ['Einstein', 'Newton', 'Galileo', 'Hawking'], correct: 1, category: 'Science' },
  { question: 'What is the capital of Japan?', answers: ['Beijing', 'Seoul', 'Tokyo', 'Osaka'], correct: 2, category: 'Geography' },
  { question: 'How many sides does a hexagon have?', answers: ['5', '6', '7', '8'], correct: 1, category: 'Math' },
  { question: 'What year did the Titanic sink?', answers: ['1910', '1911', '1912', '1913'], correct: 2, category: 'History' },
  { question: 'Which animal is the tallest?', answers: ['Elephant', 'Giraffe', 'Whale', 'Ostrich'], correct: 1, category: 'Nature' },
  { question: 'What is H2O commonly known as?', answers: ['Salt', 'Sugar', 'Water', 'Acid'], correct: 2, category: 'Science' },
  { question: 'Who was the first person on the Moon?', answers: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correct: 1, category: 'History' },
];

function shuffleQuestions(): Question[] {
  const arr = [...QUESTIONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TriviaQuizGame({ theme }: { theme: GameTheme }) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem('trivia_high') ?? '0'); } catch { return 0; }
  });
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startGame = useCallback(() => {
    setQuestions(shuffleQuestions().slice(0, 10));
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(15);
    setSelected(null);
    setShowResult(false);
    setGameState('playing');
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time's up — wrong answer
          setShowResult(true);
          setStreak(0);
          setTimeout(() => nextQuestion(), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, showResult, qIndex]);

  function handleAnswer(answerIdx: number) {
    if (showResult) return;
    clearInterval(timerRef.current);
    setSelected(answerIdx);
    setShowResult(true);

    const correct = answerIdx === questions[qIndex].correct;
    if (correct) {
      const bonus = Math.ceil(timeLeft * 10);
      const streakBonus = streak * 50;
      setScore(s => s + 100 + bonus + streakBonus);
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(b => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => nextQuestion(), 1500);
  }

  function nextQuestion() {
    if (qIndex >= questions.length - 1) {
      setGameState('result');
      setScore(s => {
        const hs = Math.max(s, Number(localStorage.getItem('trivia_high') ?? '0'));
        localStorage.setItem('trivia_high', String(hs));
        setHighScore(hs);
        return s;
      });
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
      setShowResult(false);
      setTimeLeft(15);
    }
  }

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Brain Blitz</h1>
          <p className="text-muted mb-6">10 questions. 15 seconds each. Build streaks for bonus points!</p>
          <ActionButton label="Start Quiz" onClick={startGame} variant="primary" size="lg" />
          {highScore > 0 && <p className="text-muted text-sm mt-4">Best: {highScore}</p>}
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameOverModal
          title={score > highScore * 0.8 ? 'Great Job!' : 'Quiz Complete'}
          icon={score > highScore * 0.8 ? '🏆' : '📊'}
          stats={[
            { label: 'Score', value: score },
            { label: 'Best Streak', value: bestStreak },
            { label: 'High Score', value: highScore },
          ]}
          actions={[
            { label: 'Play Again', onClick: startGame, primary: true },
          ]}
        />
      </div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted">Q{qIndex + 1}/{questions.length}</div>
          <div className="flex items-center gap-4">
            {streak > 1 && <span className="text-accent text-sm font-bold">🔥 {streak}x streak</span>}
            <span className="text-sm font-bold">⭐ {score}</span>
          </div>
        </div>

        {/* Timer */}
        <ProgressBar value={timeLeft} max={15} color={timeLeft <= 5 ? theme.colors.danger : theme.colors.primary} showValue={false} height={6} />

        {/* Category badge */}
        <div className="mt-4 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-surface-alt text-muted">{q.category}</span>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold mb-6 mt-2">{q.question}</h2>

        {/* Timer display */}
        <div className="text-center mb-4">
          <span className={`text-4xl font-bold ${timeLeft <= 5 ? 'text-danger animate-pulse' : 'text-primary'}`}>
            {timeLeft}
          </span>
        </div>

        {/* Answers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.answers.map((answer, i) => {
            let borderColor = 'border-border hover:border-primary/50';
            let bg = 'bg-surface';
            if (showResult) {
              if (i === q.correct) { borderColor = 'border-success'; bg = 'bg-success/10'; }
              else if (i === selected && i !== q.correct) { borderColor = 'border-danger'; bg = 'bg-danger/10'; }
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                className={`${bg} border-2 ${borderColor} rounded-xl p-4 text-left transition-all ${!showResult ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
              >
                <span className="font-semibold">{answer}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
