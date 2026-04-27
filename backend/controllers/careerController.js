const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const careerModel = require("../models/careerModel");

const careerProfiles = {
  Engineer: {
    heading: "Engineer",
    shortDescription:
      "You enjoy solving problems, thinking logically, and building practical solutions.",
    detail:
      "Your answers show a strong preference for analysis, structure, and creating working solutions. Careers like software engineering, data, product development, and technical problem-solving are strong matches for you."
  },
  "Teacher/Doctor": {
    heading: "Teacher/Doctor",
    shortDescription:
      "You are motivated by helping people, guiding others, and making a meaningful impact.",
    detail:
      "Your responses suggest empathy, patience, and service-driven thinking. Careers in education, healthcare, counseling, and people support roles may be the best fit for your personality."
  },
  Designer: {
    heading: "Designer",
    shortDescription:
      "You are drawn to creativity, aesthetics, and turning ideas into engaging experiences.",
    detail:
      "Your answers reflect visual thinking, creativity, and a love for shaping how things look and feel. Careers in UI/UX, graphic design, animation, branding, or product design may suit you very well."
  }
};

function mapAnswerToCareer(answer = {}) {
  const combinedValue = `${answer.careerTag || ""} ${answer.text || ""}`.trim().toLowerCase();

  if (combinedValue.includes("engineer") || combinedValue.includes("problem")) {
    return "Engineer";
  }

  if (
    combinedValue.includes("teacher") ||
    combinedValue.includes("doctor") ||
    combinedValue.includes("help")
  ) {
    return "Teacher/Doctor";
  }

  if (combinedValue.includes("designer") || combinedValue.includes("design")) {
    return "Designer";
  }

  return "Engineer";
}

function calculateCareerResult(answers = []) {
  const scores = {
    Engineer: 0,
    "Teacher/Doctor": 0,
    Designer: 0
  };

  answers.forEach((answer) => {
    const career = mapAnswerToCareer(answer);
    scores[career] += 1;
  });

  const winningCareer = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    career: winningCareer,
    scores,
    ...careerProfiles[winningCareer]
  };
}

async function getQuestions(_request, response) {
  try {
    const questions = await careerModel.getAllQuestions();
    return response.json(questions);
  } catch (_error) {
    return response.status(500).json({ message: "Unable to fetch questions." });
  }
}

async function loginAdmin(request, response) {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: "Email and password are required." });
  }

  try {
    const admin = await careerModel.findAdminByEmail(email);

    if (!admin) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      },
      process.env.JWT_SECRET || "career_assessment_secret_key",
      { expiresIn: "8h" }
    );

    return response.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      }
    });
  } catch (_error) {
    return response.status(500).json({ message: "Unable to login right now." });
  }
}

async function addQuestion(request, response) {
  const { question, options } = request.body;

  if (!question || !Array.isArray(options) || options.length < 3) {
    return response.status(400).json({
      message: "A question and at least three options are required."
    });
  }

  const hasInvalidOption = options.some((option) => !option.text || !option.careerTag);

  if (hasInvalidOption) {
    return response.status(400).json({
      message: "Each option must include text and a careerTag."
    });
  }

  try {
    await careerModel.createQuestionWithOptions({ question, options });
    return response.status(201).json({ message: "Question added successfully." });
  } catch (_error) {
    return response.status(500).json({ message: "Unable to add question." });
  }
}

async function submitResult(request, response) {
  const { answers } = request.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return response.status(400).json({ message: "Answers are required." });
  }

  try {
    // Recalculate on the server so stored analytics always stay consistent.
    const result = calculateCareerResult(answers);

    await careerModel.saveQuizResult({
      answers,
      recommendedCareer: result.career,
      scoreBreakdown: result.scores
    });

    return response.status(201).json({
      message: "Quiz result saved successfully.",
      result
    });
  } catch (_error) {
    return response.status(500).json({ message: "Unable to save quiz result." });
  }
}

async function getResultAnalysis(_request, response) {
  try {
    const analysis = await careerModel.getResultAnalysis();
    return response.json({ analysis });
  } catch (_error) {
    return response.status(500).json({ message: "Unable to load result analysis." });
  }
}

module.exports = {
  getQuestions,
  loginAdmin,
  addQuestion,
  submitResult,
  getResultAnalysis
};
