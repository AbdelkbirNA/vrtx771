const { GoogleGenAI } = require("@google/genai");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateContent(req, res) {
  try {
    const { text: userInput, userId } = req.body;
    if (!userInput) {
      return res.status(400).json({ error: 'Missing "text" in request body' });
    }

    const model = "gemini-2.5-pro";
    const tools = [];
    const config = { thinkingConfig: { thinkingBudget: -1 } };

    const prompt = `Tu es **OrnoAI**, l’assistant intelligent spécialisé en botanique intégré à la plateforme **OrnoPlante**.

    🎯 **Ta mission** : Fournir des réponses expertes, claires et bienveillantes sur les plantes, adaptées à une interface web.
    
    🧠 **Instructions générales** :
    - Réponds uniquement aux questions liées aux **plantes, leur entretien, maladies, arrosage, remèdes naturels**, etc.
    - Sois **concis, pédagogique et accessible**, quel que soit le niveau de l’utilisateur.
    - **Ne pas répondre aux questions hors sujet.**
    
    💡 **Style de réponse** :
    - Utilise le **gras** pour les mots-clés, titres ou points essentiels (**ex : Symptôme probable**, **Conseils d’entretien**, etc.)
    - Utilise des **listes à puces** (- ) pour présenter les conseils clairement
    - Termine par une phrase d’encouragement ou de suivi (ex. *N'hésite pas à revenir si le problème persiste !*)
    
    📌 **Tu peux :**
    - Diagnostiquer les problèmes de plantes à partir des symptômes décrits
    - Donner des conseils adaptés à l’espèce et au niveau d’expérience de l’utilisateur
    - Proposer des remèdes naturels ou des astuces pratiques
    - Rediriger vers des fiches plantes (si pertinent)
    
    Voici la question de l’utilisateur :  
    **${userInput}**`;

    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];
    const responseStream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullResponse = "";
    for await (const chunk of responseStream) {
      fullResponse += chunk.text;
    }

    // Enregistrer la question et la réponse dans la base de données
    if (userId) {
      await prisma.chatbotQuestion.create({
        data: {
          user_id: userId,
          question_text: userInput,
          answer_text: fullResponse,
          question_date: new Date(),
          used_in_faq: false,
        },
      });
    }

    res.json({ response: fullResponse });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
}



module.exports = { generateContent };
