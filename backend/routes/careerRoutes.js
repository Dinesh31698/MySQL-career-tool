const express = require("express");
const jwt = require("jsonwebtoken");
const {
  getQuestions,
  loginAdmin,
  addQuestion,
  submitResult,
  getResultAnalysis
} = require("../controllers/careerController");

const router = express.Router();

function verifyAdminToken(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return response.status(401).json({ message: "Authentication token is required." });
  }

  try {
    request.admin = jwt.verify(
      token,
      process.env.JWT_SECRET || "career_assessment_secret_key"
    );
    return next();
  } catch (_error) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
}

router.post("/login", loginAdmin);
router.get("/questions", getQuestions);
router.post("/questions", verifyAdminToken, addQuestion);
router.post("/results", submitResult);
router.get("/results/analysis", verifyAdminToken, getResultAnalysis);

module.exports = router;
