const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");

const seedQuestions = [
  {
    question: "What do you enjoy the most?",
    options: [
      { text: "Solving problems", careerTag: "Engineer" },
      { text: "Helping people", careerTag: "Teacher/Doctor" },
      { text: "Designing things", careerTag: "Designer" }
    ]
  },
  {
    question: "Which activity sounds most exciting?",
    options: [
      { text: "Building a smart app", careerTag: "Engineer" },
      { text: "Teaching a new skill", careerTag: "Teacher/Doctor" },
      { text: "Creating a beautiful poster", careerTag: "Designer" }
    ]
  },
  {
    question: "How do you usually solve a challenge?",
    options: [
      { text: "Break it down logically", careerTag: "Engineer" },
      { text: "Think about who needs help", careerTag: "Teacher/Doctor" },
      { text: "Look for a creative idea", careerTag: "Designer" }
    ]
  },
  {
    question: "What kind of work feels most rewarding?",
    options: [
      { text: "Fixing difficult issues", careerTag: "Engineer" },
      { text: "Making someone's life better", careerTag: "Teacher/Doctor" },
      { text: "Making something visually amazing", careerTag: "Designer" }
    ]
  },
  {
    question: "What role fits you best?",
    options: [
      { text: "A technical builder", careerTag: "Engineer" },
      { text: "A guide and caregiver", careerTag: "Teacher/Doctor" },
      { text: "A creative maker", careerTag: "Designer" }
    ]
  }
];

async function seedInitialData() {
  await ensureDefaultAdmin();
  await ensureDefaultQuestions();
}

async function ensureDefaultAdmin() {
  const db = getDB();
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM admins");

  if (rows[0].total > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);

  await db.query(
    `
      INSERT INTO admins (name, email, password_hash)
      VALUES (?, ?, ?)
    `,
    [
      process.env.ADMIN_NAME || "Career Admin",
      process.env.ADMIN_EMAIL || "admin@careercompass.com",
      passwordHash
    ]
  );
}

async function ensureDefaultQuestions() {
  const db = getDB();
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM questions");

  if (rows[0].total > 0) {
    return;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of seedQuestions) {
      const [questionResult] = await connection.query(
        "INSERT INTO questions (question_text) VALUES (?)",
        [item.question]
      );

      for (const [index, option] of item.options.entries()) {
        await connection.query(
          `
            INSERT INTO question_options (question_id, option_text, career_tag, sort_order)
            VALUES (?, ?, ?, ?)
          `,
          [questionResult.insertId, option.text, option.careerTag, index + 1]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getAllQuestions() {
  const db = getDB();

  const [rows] = await db.query(`
    SELECT
      q.id AS question_id,
      q.question_text,
      o.id AS option_id,
      o.option_text,
      o.career_tag
    FROM questions q
    JOIN question_options o ON o.question_id = q.id
    WHERE q.is_active = 1
    ORDER BY q.id ASC, o.sort_order ASC, o.id ASC
  `);

  const questionMap = new Map();

  rows.forEach((row) => {
    if (!questionMap.has(row.question_id)) {
      questionMap.set(row.question_id, {
        id: row.question_id,
        question: row.question_text,
        options: []
      });
    }

    questionMap.get(row.question_id).options.push({
      id: row.option_id,
      text: row.option_text,
      careerTag: row.career_tag
    });
  });

  return Array.from(questionMap.values());
}

async function findAdminByEmail(email) {
  const db = getDB();
  const [rows] = await db.query("SELECT * FROM admins WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function createQuestionWithOptions({ question, options }) {
  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [questionResult] = await connection.query(
      "INSERT INTO questions (question_text) VALUES (?)",
      [question]
    );

    for (const [index, option] of options.entries()) {
      await connection.query(
        `
          INSERT INTO question_options (question_id, option_text, career_tag, sort_order)
          VALUES (?, ?, ?, ?)
        `,
        [questionResult.insertId, option.text, option.careerTag, index + 1]
      );
    }

    await connection.commit();
    return questionResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function saveQuizResult({ answers, recommendedCareer, scoreBreakdown }) {
  const db = getDB();

  await db.query(
    `
      INSERT INTO quiz_results (recommended_career, answers_json, score_breakdown_json)
      VALUES (?, ?, ?)
    `,
    [recommendedCareer, JSON.stringify(answers), JSON.stringify(scoreBreakdown)]
  );
}

async function getResultAnalysis() {
  const db = getDB();

  const [rows] = await db.query(`
    SELECT recommended_career AS career, COUNT(*) AS total
    FROM quiz_results
    GROUP BY recommended_career
    ORDER BY total DESC, recommended_career ASC
  `);

  return rows.map((row) => ({
    career: row.career,
    total: Number(row.total)
  }));
}

module.exports = {
  seedInitialData,
  getAllQuestions,
  findAdminByEmail,
  createQuestionWithOptions,
  saveQuizResult,
  getResultAnalysis
};
