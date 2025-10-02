import fetch from "node-fetch";

export async function scoreWithGemini(questions, answers) {
  try {
    const apiKey = process.env.GEMINI_API_KEY||'AIzaSyCxoURFNdlPb4QIA_Q_9lvSpTvUbZodMIE';
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return 0;
    }

    // Max scores per type
    const typeMaxScore = { easy: 20, medium: 30, hard: 40 };
    const includedTypes = new Set();

    // Build prompt
    let prompt = `Evaluate the candidate's answers strictly. You are a strict interviewer. Score each answer carefully:

- Score 0 to max (easy 20, medium 30, hard 40) based on correctness and completeness.
- Do NOT give full marks for one-line answers unless fully correct.
`;


    answers.forEach(ans => {
      const q = questions.find(q => q.questionText === ans.question);
      if (q) {
        prompt += `Question: ${ans.question}\nAnswer: ${ans.answer}\nType: ${q.type}\n`;
        if (!includedTypes.has(q.type)) {
          prompt += `Maximum score for this type: ${typeMaxScore[q.type]}\n`;
          includedTypes.add(q.type);
        }
        prompt += "\n";
      }
    });

    prompt += `Return ONLY numeric scores for each question in JSON format like:
{"React": 20, "Axios": 30}\nDo not include any text explanation or Markdown formatting.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    // console.log("Full Gemini response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API error:", data.error.message);
      return 0;
    }

    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    // console.log("Raw text from Gemini:", rawText);

    // Remove Markdown code fences if any
    rawText = rawText.replace(/```json|```/g, "").trim();

    // Parse JSON safely
    let scores = {};
    try {
      scores = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse Gemini output as JSON:", err);
      return 0;
    }

    // Calculate total score
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    return totalScore;

  } catch (err) {
    console.error("Error in scoreWithGemini:", err);
    return 0;
  }
}

export async function generateQuestionsWithGemini(roles, numberOfQuestions = 6) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

  const easyCount = Math.min(2, Math.floor(numberOfQuestions / 3) || 1);
  const mediumCount = Math.min(2, Math.floor(numberOfQuestions / 3) || 1);
  const hardCount = numberOfQuestions - easyCount - mediumCount;

  const prompt = `
You are an expert technical interviewer.
Generate a JSON array of exactly ${numberOfQuestions} unique interview questions for the following roles: ${roles.join(", ")}.
- The first ${easyCount} should be "easy" type, the next ${mediumCount} "medium", and the rest "hard".
- Each question should be relevant to the roles, clear, and not repeated.
- Return ONLY a JSON array, each item: { "questionText": "...", "type": "easy|medium|hard" }
- Do NOT include any explanation, markdown, or extra text. Only output the JSON array.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error("Gemini API error: " + data.error.message);
  }

  let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  rawText = rawText.replace(/```json|```/g, "").trim();

  let questions = [];
  try {
    questions = JSON.parse(rawText);
  } catch (err) {
    console.error("Gemini output (raw):", rawText);
    throw new Error("Failed to parse Gemini output as JSON: " + err.message);
  }

  return questions
    .filter(
      (q) =>
        q.questionText &&
        ["easy", "medium", "hard"].includes(q.type)
    )
    .slice(0, numberOfQuestions);
}

// // Example usage
// (async () => {
//   const questions = [
//     { questionText: "What is React", type: "easy" },
//     { questionText: "What is Axios", type: "medium" }
//   ];

//   const answers = [
//     { question: "What is React", answer: "It is a backend Library" },
//     { question: "What is Axios", answer: "it is library used for handling urls" }
//   ];

//   const totalScore = await scoreWithGemini(questions, answers);
//   console.log("Total Score:", totalScore);

//   const generatedQuestions = await generateQuestionsWithGemini(["Frontend", "Backend"], 6);
//   console.log("Generated Questions:", JSON.stringify(generatedQuestions, null, 2));
// })();
