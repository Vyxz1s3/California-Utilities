/**
 * Simple math-based CAPTCHA system for the verification flow.
 *
 * Questions are intentionally trivial — the goal is to prove the user is
 * human and paying attention, not to stump them.
 */

/** Pool of CAPTCHA questions. Each entry has a question string and the
 *  expected numeric answer (stored as a string for easy comparison). */
export const CAPTCHA_POOL = [
  { question: 'What is 5 + 3?',   answer: '8'  },
  { question: 'What is 9 - 4?',   answer: '5'  },
  { question: 'What is 3 × 4?',   answer: '12' },
  { question: 'What is 15 ÷ 3?',  answer: '5'  },
  { question: 'What is 7 + 6?',   answer: '13' },
  { question: 'What is 20 - 8?',  answer: '12' },
  { question: 'What is 4 × 5?',   answer: '20' },
  { question: 'What is 18 ÷ 2?',  answer: '9'  },
  { question: 'What is 11 + 7?',  answer: '18' },
  { question: 'What is 25 - 9?',  answer: '16' },
  { question: 'What is 6 × 3?',   answer: '18' },
  { question: 'What is 36 ÷ 4?',  answer: '9'  },
  { question: 'What is 8 + 14?',  answer: '22' },
  { question: 'What is 30 - 13?', answer: '17' },
  { question: 'What is 7 × 7?',   answer: '49' },
  { question: 'What is 100 ÷ 5?', answer: '20' },
  { question: 'What is 13 + 9?',  answer: '22' },
  { question: 'What is 50 - 27?', answer: '23' },
  { question: 'What is 9 × 6?',   answer: '54' },
  { question: 'What is 48 ÷ 6?',  answer: '8'  },
];

/**
 * Pick a random CAPTCHA question from the pool.
 * @returns {{ question: string, answer: string }}
 */
export function getRandomCaptcha() {
  return CAPTCHA_POOL[Math.floor(Math.random() * CAPTCHA_POOL.length)];
}

/**
 * Validate a user's answer against the expected answer.
 * Trims whitespace and is case-insensitive (though answers are numeric).
 *
 * @param {string} userAnswer   - The raw string the user typed.
 * @param {string} correctAnswer - The expected answer string.
 * @returns {boolean}
 */
export function validateCaptcha(userAnswer, correctAnswer) {
  return userAnswer.trim() === correctAnswer.trim();
}
