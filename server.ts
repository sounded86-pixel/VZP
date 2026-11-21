import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GenAI with process.env.GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Robust content generation helper with retries and model fallback
async function generateContentWithRetryAndFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  if (!ai) {
    throw new Error("Ключ GEMINI_API_KEY не настроен.");
  }

  const modelsToTry = [
    params.preferredModel || "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 3;
    let delay = 1000;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`Attempting generateContent using model: ${model} (attempt ${attempt}/${attempts})`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errorMsg = String(error?.message || "");
        const isTransient = errorMsg.includes("503") || 
                            errorMsg.includes("temporary") || 
                            errorMsg.includes("demand") ||
                            errorMsg.includes("UNAVAILABLE") ||
                            errorMsg.includes("RESOURCE_EXHAUSTED");
        
        if (isTransient && attempt < attempts) {
          console.log(`[AI Retry Log] Model ${model} returned transient code (attempt ${attempt}/${attempts}). Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          console.warn(`[AI Warning] Model ${model} attempt ${attempt}/${attempts} was not successful:`, errorMsg);
          break;
        }
      }
    }
  }

  throw lastError || new Error("Не удалось получить ответ от ИИ после нескольких попыток.");
}

// DeepSeek AI helper endpoint (Добрые новости)
app.post("/api/deepseek/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ 
        error: "Ключ GEMINI_API_KEY не настроен. Настройте его во вкладке Settings > Secrets." 
      });
    }

    const { messages, systemInstruction, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Передан неверный массив сообщений." });
    }

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.text || "" }]
    }));

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are the 'Добрые новости' V3 AI, a helpful, polite, and intelligent rural assistant. Always respond in Russian.",
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }
    });

    return res.json({
      text: response.text || "Извините, не удалось получить ответ от ИИ."
    });
  } catch (error: any) {
    console.error("DeepSeek proxy error:", error);
    return res.status(500).json({ 
      error: error?.message || "Произошла ошибка при обращении к ИИ." 
    });
  }
});

// Ad Optimizer Endpoint
app.post("/api/deepseek/optimize-ad", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ 
        error: "Ключ GEMINI_API_KEY не настроен." 
      });
    }

    const { title, description, category, targetAudience } = req.body;

    const prompt = `Оптимизируй объявление для публикации в деревенской ленте "Устьяны". Сделай его привлекательным, структурированным и грамотным.
Заголовок: ${title || ""}
Категория: ${category || ""}
Описание: ${description || ""}
Целевая аудитория: ${targetAudience || "Жители Устьянского района"}

Пожалуйста, верни результат в формате JSON со следующими полями:
{
  "optimizedTitle": "новый привлекательный заголовок",
  "optimizedDescription": "красиво отформатированное описание с эмодзи и разбивкой на абзацы",
  "tips": ["совет 1", "совет 2"]
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the 'Добрые новости' V3 rural marketing expert. You optimize classified ads and help villagers write compelling posts. Always respond in JSON format. Always write in Russian.",
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    return res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Ad optimizer error:", error);
    return res.status(500).json({ error: error?.message || "Не удалось оптимизировать объявление." });
  }
});

// Help request generator
app.post("/api/deepseek/help-advisor", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Ключ GEMINI_API_KEY не настроен." });
    }

    const { issue } = req.body;

    const prompt = `Пользователь описывает свою проблему: "${issue}"
Дай краткие полезные советы (3-4 пункта), как решить эту проблему в деревне, и предложи оптимальный текст запроса о помощи для публикации на платформе взаимопомощи "Устьяны".
Верни ответ в формате JSON:
{
  "tips": "краткие советы по решению проблемы",
  "suggestedPostTitle": "Заголовок запроса о помощи",
  "suggestedPostDescription": "Рекомендуемый текст объявления о помощи"
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the 'Добрые новости' V3 helper, a supportive and helpful neighbor. You provide local village advice. Return response in JSON. Always write in Russian.",
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    return res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Help advisor error:", error);
    return res.status(500).json({ error: error?.message || "Не удалось сгенерировать рекомендации." });
  }
});

// Vite middleware for development and server listen wrapped in async startServer to avoid top-level await
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
