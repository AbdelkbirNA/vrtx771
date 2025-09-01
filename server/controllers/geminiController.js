const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateNewsletterContent(req, res) {
  try {
    const { topic, tone, language } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Missing "topic" in request body' });
    }

    const model = "gemini-1.5-flash";

    const prompt = `
    Tu es un expert en rédaction de newsletters.
    Ta mission est de générer un contenu de newsletter engageant et professionnel basé sur les instructions de l'utilisateur.

    **Sujet de la newsletter :** ${topic}
    **Ton de la rédaction :** ${tone || 'Neutre'}
    **Langue :** ${language || 'Français'}

    **Instructions :**
    - Rédige un contenu clair, concis et bien structuré.
    - Utilise le format HTML pour la mise en forme (titres, listes, gras, etc.).
    - Commence par un titre accrocheur (<h1>).
    - Structure le corps du texte avec des paragraphes (<p>) et des sous-titres (<h2>, <h3>).
    - Termine par un appel à l'action ou une conclusion pertinente.
    - N'ajoute pas de balises <html>, <head>, ou <body>. Génère uniquement le contenu interne de la newsletter.

    Génère le contenu de la newsletter maintenant.
    `;

    const contents = [{
        role: "user",
        parts: [{ text: prompt }],
    }];

    // Using the 'ornoplante' style, with a non-streaming method
    const result = await ai.models.generateContent({
        model: model,
        contents: contents,
    });

    const htmlContent = result.candidates[0].content.parts[0].text;
    const textContent = htmlContent.replace(/<[^>]*>/g, '');

    res.json({
      html: htmlContent,
      text: textContent
    });
  } catch (error) {
    console.error("Error generating newsletter content:", error);
    res.status(500).json({ error: "Failed to generate newsletter content" });
  }
}

module.exports = { generateNewsletterContent };