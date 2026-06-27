import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


export async function aiPersonalizedMatch(currentUser, users) {
  const prompt = `
You are a skill matching AI.

Current User:
Offers: ${currentUser.offers.join(", ")}
Needs: ${currentUser.needs.join(", ")}

Users:
${users
  .map(
    (u) => `
UserId: "${u.id}"
Offers: ${u.offers.join(", ")}
Needs: ${u.needs.join(", ")}
`
  )
  .join("\n")}

Return JSON only:
[{"userId":"id","match":90,"reason":"short reason"}]
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      res?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err){
  // console.log("===== GEMINI ERROR =====");
  // console.log(err);
  // console.log("===== END ERROR =====");    
    return [];
  }
}