
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, HeadshotAnalysis } from "../types";

// Define the expected JSON schema for the model output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        atsScore: { type: Type.NUMBER, description: "Score 0-100 based on parseability and keyword density" },
        keywordMatch: { type: Type.NUMBER, description: "Score 0-100 based on JD keyword presence" },
        skillsScore: { type: Type.NUMBER, description: "Score 0-100 on hard/soft skills coverage vs JD" },
        experienceScore: { type: Type.NUMBER, description: "Score 0-100 on relevance and depth of experience" },
        formatScore: { type: Type.NUMBER, description: "Score 0-100 on layout, bullet points, and readability" },
        overallScore: { type: Type.NUMBER, description: "Aggregate employability rating 0-100" },
      },
      required: ["atsScore", "keywordMatch", "skillsScore", "experienceScore", "formatScore", "overallScore"],
    },
    summary: { type: Type.STRING, description: "Executive summary of the CV quality" },
    jobTitleDetected: { type: Type.STRING, description: "The candidate's primary role detected from CV" },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of top 3-5 strengths",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of top 3-5 critical gaps or weaknesses",
    },
    keywords: {
      type: Type.OBJECT,
      properties: {
        present: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing: { type: Type.ARRAY, items: { type: Type.STRING } },
        score: { type: Type.NUMBER },
      },
      required: ["present", "missing", "score"],
    },
    sectionAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sectionName: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["good", "warning", "critical", "missing"] },
          feedback: { type: Type.STRING },
          suggestion: { type: Type.STRING },
        },
        required: ["sectionName", "status", "feedback", "suggestion"],
      },
    },
    rewrittenSummary: { type: Type.STRING, description: "An optimized professional summary suggestion" },
    marketFit: { type: Type.STRING, description: "The analyzed market context" },
    interviewQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 likely interview questions based on the gaps or specific JD requirements",
    },
    coverLetter: {
      type: Type.STRING,
      description: "A draft cover letter connecting the candidate's experience to the specific JD",
    },
    // New Ecosystem Features
    salaryEstimation: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.STRING, description: "Minimum estimated salary (e.g., '50,000 BDT', '$50k')" },
        max: { type: Type.STRING, description: "Maximum estimated salary" },
        currency: { type: Type.STRING, description: "Currency code (e.g. USD, BDT)" },
        explanation: { type: Type.STRING, description: "Reasoning based on experience and market" }
      },
      required: ["min", "max", "currency", "explanation"]
    },
    linkedinAudit: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "Optimized LinkedIn Headline with keywords" },
        aboutSummary: { type: Type.STRING, description: "A 'About' section for LinkedIn (1st person)" },
        missingSections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What is missing compared to a rockstar profile" },
        bannerSuggestion: { type: Type.STRING, description: "Idea for a background banner image" }
      },
      required: ["headline", "aboutSummary", "missingSections", "bannerSuggestion"]
    },
    learningPath: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          recommendation: { type: Type.STRING, description: "Specific topic or course name to search" },
          type: { type: Type.STRING, enum: ["Course", "Article", "Project"] }
        }
      },
      description: "Resources to learn missing skills"
    },
    projectIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "What to build and why it helps this CV" },
          techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tools/Languages to use" },
          difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] }
        }
      },
      description: "3 Project ideas to fill experience gaps"
    }
  },
  required: ["scores", "summary", "strengths", "weaknesses", "keywords", "sectionAnalysis", "marketFit", "interviewQuestions", "coverLetter", "salaryEstimation", "linkedinAudit", "learningPath", "projectIdeas", "jobTitleDetected"],
};

const headshotSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "0-100 score on professionalism" },
    professionalism: { type: Type.STRING, description: "Assessment of overall look" },
    lighting: { type: Type.STRING, description: "Feedback on lighting quality" },
    background: { type: Type.STRING, description: "Feedback on background distraction/color" },
    attire: { type: Type.STRING, description: "Feedback on clothing choice" },
    expression: { type: Type.STRING, description: "Feedback on facial expression" },
    tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable tips to improve" }
  },
  required: ["score", "professionalism", "lighting", "background", "attire", "expression", "tips"]
};

export const analyzeCV = async (
  cvText: string,
  jobDescription: string,
  targetMarket: string,
  fileData?: string,
  fileMimeType?: string
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construct the prompt parts
  const promptText = `
    Act as a Senior HR Consultant, Compensation Analyst, and Career Coach.
    Analyze the provided CV/Resume against the Job Description (JD) for the "${targetMarket}" market.
    
    **Core Analysis Strategy:**
    1. **Automated Content Analysis:** Benchmark role suitability, experience depth vs JD, and skills matrix.
    2. **Gap Identification:** Identify missing mandatory sections, weak action verbs, and generic statements.
    3. **ATS Optimization:** Check for keyword matches, formatting issues, and compliance.
    4. **Language Quality:** Evaluate grammar, tone, and clarity.
    
    **New Ecosystem Features:**
    5. **Salary Benchmarking:** Estimate a **Monthly** (if Bangladesh) or **Annual** (if Global) salary range for this profile in the "${targetMarket}" market.
       - **CRITICAL:** If the market is "Bangladesh", use **BDT** currency and monthly figures typical for Dhaka.
       - If "Global", use USD.
    6. **LinkedIn Audit:** Create an optimized Headline and About section for LinkedIn based on the CV.
    7. **Upskilling:** For every missing keyword/skill, suggest a specific learning resource/topic.
    8. **Project Portfolio Generator:** Based on the MISSING skills or experience gaps, suggest 3 practical, impressive projects the candidate can build and add to their CV to become hired.

    **Scoring Rubric (Strict):**
    - **ATS Score:** Parsing success, standard headers.
    - **Keyword Match:** % of hard/soft skills from JD found in CV.
    - **Skills Score:** Technical/Functional proficiency match.
    - **Experience Score:** Relevance of past roles to target JD.
    - **Format Score:** Readability, bullet point structure.
    - **Overall Score:** Weighted average.

    **Additional Outputs Required:**
    - **Interview Questions:** 5 tough, role-specific questions.
    - **Cover Letter:** Professional cover letter (max 250 words).
    
    **Input Data:**
    ${jobDescription ? `JOB DESCRIPTION:\n"${jobDescription}"` : "JOB DESCRIPTION: None provided (Analyze for general employability)"}
    
    CV Content is provided below.
  `;

  const parts: any[] = [{ text: promptText }];

  if (fileData && fileMimeType) {
    parts.push({
      inlineData: {
        mimeType: fileMimeType,
        data: fileData
      }
    });
  } else if (cvText) {
    parts.push({ text: `CV TEXT CONTENT:\n${cvText}` });
  } else {
    throw new Error("No CV content provided");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, 
        systemInstruction: "You are an expert CV & Career Architect. Provide critical, actionable, HR-grade feedback. Always estimate salary based on the specific market requested.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text) as AnalysisResult;
    parsed.timestamp = Date.now(); // Add timestamp for history
    return parsed;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const analyzeHeadshot = async (base64Image: string, mimeType: string): Promise<HeadshotAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this professional headshot/profile picture for LinkedIn or a CV.
    Evaluate based on:
    1. Professionalism (Is it suitable for corporate/professional use?)
    2. Lighting (Is the face clear, any shadows?)
    3. Background (Is it distracting?)
    4. Attire (Is it appropriate?)
    5. Expression (Is it approachable and confident?)
    
    Provide a score out of 100 and 3 specific tips to improve.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: headshotSchema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as HeadshotAnalysis;
};
