import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract arXiv ID from URL or text
function extractArxivId(input: string): string | null {
  const match = input.match(/(?:arxiv\.org\/(?:abs|pdf|html)\/|arxiv:)?([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?|[a-z\-]+(?:\.[A-Z]{2})?\/[0-9]{7})/i);
  return match ? match[1] : null;
}

// Helper to fetch arXiv paper metadata via public Atom API
async function fetchArxivMetadata(arxivId: string) {
  try {
    const cleanId = arxivId.replace(/v\d+$/, '');
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${cleanId}`;
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    const xml = await response.text();

    const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
    const summaryMatch = xml.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = xml.match(/<entry>[\s\S]*?<published>([\s\S]*?)<\/published>/);
    
    // Extract authors
    const authors: string[] = [];
    const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(xml)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    if (titleMatch && summaryMatch) {
      return {
        arxivId,
        title: titleMatch[1].replace(/\n/g, ' ').trim(),
        abstract: summaryMatch[1].replace(/\n/g, ' ').trim(),
        authors: authors.slice(0, 6),
        published: publishedMatch ? publishedMatch[1].trim() : '',
        url: `https://arxiv.org/abs/${cleanId}`,
        pdfUrl: `https://arxiv.org/pdf/${cleanId}.pdf`,
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching arXiv metadata:', err);
    return null;
  }
}

// Clean and parse JSON from model output
function parseJsonFromModelOutput(text: string) {
  try {
    // 1. Check for markdown json block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }
    // 2. Find first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON directly, falling back:', err);
    return null;
  }
}

// Main paper analysis endpoint
app.post('/api/analyze-paper', async (req, res) => {
  try {
    const { url, query, pastedText, studentLevel } = req.body;

    if (!url && !query && !pastedText) {
      return res.status(400).json({ error: 'Please provide a paper URL, title/query, or pasted abstract/text.' });
    }

    let paperContext = '';
    let paperMeta: any = {
      title: query || 'Academic Paper',
      url: url || '',
      authors: [],
      published: '',
    };

    // Check if input is arXiv
    const arxivId = extractArxivId(url || query || '');
    if (arxivId) {
      const arxivData = await fetchArxivMetadata(arxivId);
      if (arxivData) {
        paperMeta = {
          ...paperMeta,
          ...arxivData,
        };
        paperContext += `Title: ${arxivData.title}\nAuthors: ${arxivData.authors.join(', ')}\nPublished: ${arxivData.published}\narXiv ID: ${arxivData.arxivId}\nAbstract: ${arxivData.abstract}\n`;
      }
    }

    if (pastedText) {
      paperContext += `\nProvided Paper Excerpt / Abstract:\n${pastedText}\n`;
    }

    const systemInstruction = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
You must always prioritize token efficiency. Ensure your total analysis and tool execution stays well under 25,000 tokens.
If a paper is too long to ingest entirely, look up summaries, abstracts, and open-source implementations (e.g. GitHub) of the paper's title to gather context efficiently.

When a user provides a research paper URL or topic, execute these steps:

1. CORE CONCEPT EXTRACTION:
Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper. Do not use Markdown code blocks inside the Mermaid string itself, output it as a clear text segment labeled [FLOWCHART].
Make sure the Mermaid flowchart is strictly valid syntax:
- Start with graph TD
- Avoid unsupported characters or unescaped quotes in node labels. Use node IDs with brackets e.g. A["Input Tokens"] --> B["Embedding Layer"]
- Group subgraphs cleanly if applicable (e.g. subgraph Encoder, subgraph Decoder, or subgraph Backbone)
- Connect every step from input data to output prediction/loss/embeddings

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project. For each idea provide:
- The exact extension (e.g. “Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment”).
- The targeted performance metric (e.g. latency reduction, accuracy trade-off).
- The recommended tech stack (e.g. PyTorch, ONNX Runtime).

You must return your response as a valid JSON object matching this schema:
{
  "paper": {
    "title": "string",
    "authors": ["string"],
    "year": "string",
    "venueOrOrg": "string",
    "primaryDomain": "string (e.g., Computer Vision, NLP / LLMs, Systems & Efficiency, Reinforcement Learning)",
    "summaryTagline": "string (1 punchy line)"
  },
  "coreConcept": {
    "wordCount": 230,
    "problemStatement": "string (clear explanation of the bottleneck or challenge)",
    "primaryMethodology": "string (plain accessible explanation of the architecture/method)",
    "mathematicalBreakthroughs": "string (key formulas, theorems, loss functions, or algorithmic breakthroughs made accessible)",
    "fullSummary": "string (the complete coherent <300 words summary blending problem, methodology, and breakthroughs)"
  },
  "architecturalFlowchart": {
    "mermaidCode": "graph TD\\n  ...clean valid Mermaid flowchart without markdown ticks...",
    "dataInputs": ["string"],
    "components": [
      { "name": "string", "role": "string" }
    ],
    "modelLayers": ["string"],
    "dataOutputs": ["string"]
  },
  "internshipOpportunities": [
    {
      "id": 1,
      "title": "string (catchy project title)",
      "extension": "string (The exact extension, e.g. 'Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment')",
      "targetMetric": "string (The targeted performance metric, e.g. '35% latency reduction on Raspberry Pi 5 with <1.2% perplexity degradation')",
      "techStack": ["PyTorch", "ONNX Runtime", "Triton"],
      "difficulty": "Intermediate 3rd Year" | "Advanced 3rd Year" | "Capstone Ready",
      "whyImpressive": "string (why a FAANG/AI startup recruiter will notice this)",
      "resumeBullet": "string (STAR bullet ready for CV: e.g. 'Engineered [X] using [Y], achieving [Z]...')",
      "weeklyMilestones": [
        "Week 1: Set up baseline and benchmark original repo",
        "Week 2: Implement architectural extension",
        "Week 3: Run ablation study and measure targeted metric",
        "Week 4: Package demo, publish GitHub repo and benchmark report"
      ],
      "recommendedStarterRepo": "string (e.g. huggingface/transformers or official repo)"
    }
  ],
  "rawOutput": "string (The exact text output formatted with: \\n1. CORE CONCEPT EXTRACTION:\\n...\\n\\n2. ARCHITECTURAL FLOWCHART (Mermaid.js):\\n[FLOWCHART]\\ngraph TD\\n...\\n\\n3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:\\n...)"
}`;

    const userPrompt = `Research Paper Input:
URL: ${url || 'N/A'}
Query / Title: ${query || 'N/A'}
Target Student Audience: 3rd-year CS student looking for high-impact resume & internship projects.

${paperContext ? `Extracted Context:\n${paperContext}` : 'Please research this paper using search grounding to extract its exact architecture and methodology.'}

Ensure you fulfill all 3 required steps with absolute technical precision and maintain strict token efficiency.`;

    // Call Gemini 3.8 Flash with googleSearch tool enabled
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Low temperature for factual precision & valid mermaid syntax
      },
    });

    const responseText = response.text || '';
    const parsedData = parseJsonFromModelOutput(responseText);

    const tokenUsage = response.usageMetadata || {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
      totalTokenCount: 0,
    };

    // Fallback if parsing failed
    if (!parsedData) {
      // Build a fallback structure
      return res.json({
        success: true,
        data: {
          paper: paperMeta,
          rawOutput: responseText,
          coreConcept: {
            wordCount: 250,
            problemStatement: 'See raw output',
            primaryMethodology: 'See raw output',
            mathematicalBreakthroughs: 'See raw output',
            fullSummary: responseText.slice(0, 1000),
          },
          architecturalFlowchart: {
            mermaidCode: 'graph TD\n  A[Data Input] --> B[Model Backbone]\n  B --> C[Prediction Output]',
            components: [],
          },
          internshipOpportunities: [],
          tokenMetrics: {
            promptTokens: tokenUsage.promptTokenCount || 0,
            candidatesTokens: tokenUsage.candidatesTokenCount || 0,
            totalTokens: tokenUsage.totalTokenCount || 0,
            tokenBudget: 25000,
            tokenBudgetPercent: Number((((tokenUsage.totalTokenCount || 0) / 25000) * 100).toFixed(1)),
          },
        },
      });
    }

    // Merge paper metadata if available
    if (paperMeta.title && (!parsedData.paper.title || parsedData.paper.title === 'Academic Paper')) {
      parsedData.paper.title = paperMeta.title;
    }
    if (paperMeta.authors?.length && (!parsedData.paper.authors || parsedData.paper.authors.length === 0)) {
      parsedData.paper.authors = paperMeta.authors;
    }
    if (paperMeta.url) {
      parsedData.paper.url = paperMeta.url;
    }
    if (paperMeta.pdfUrl) {
      parsedData.paper.pdfUrl = paperMeta.pdfUrl;
    }

    // Clean up mermaidCode if wrapped in markdown
    if (parsedData.architecturalFlowchart?.mermaidCode) {
      let code = parsedData.architecturalFlowchart.mermaidCode;
      code = code.replace(/^```(?:mermaid)?/m, '').replace(/```$/m, '').trim();
      parsedData.architecturalFlowchart.mermaidCode = code;
    }

    // Ensure rawOutput is clean
    if (!parsedData.rawOutput) {
      parsedData.rawOutput = `1. CORE CONCEPT EXTRACTION:\n${parsedData.coreConcept?.fullSummary || ''}\n\n2. ARCHITECTURAL FLOWCHART (Mermaid.js):\n[FLOWCHART]\n${parsedData.architecturalFlowchart?.mermaidCode || ''}\n\n3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:\n${parsedData.internshipOpportunities?.map((opp: any, idx: number) => `${idx + 1}. ${opp.title}\n- Extension: ${opp.extension}\n- Target Metric: ${opp.targetMetric}\n- Tech Stack: ${opp.techStack?.join(', ')}`).join('\n\n')}`;
    }

    return res.json({
      success: true,
      data: {
        ...parsedData,
        tokenMetrics: {
          promptTokens: tokenUsage.promptTokenCount || 0,
          candidatesTokens: tokenUsage.candidatesTokenCount || 0,
          totalTokens: tokenUsage.totalTokenCount || 0,
          tokenBudget: 25000,
          tokenBudgetPercent: Number((((tokenUsage.totalTokenCount || 0) / 25000) * 100).toFixed(1)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze research paper. Please verify the URL or try another paper.',
    });
  }
});

// Follow-up Student Advisor Chat endpoint
app.post('/api/chat-paper', async (req, res) => {
  try {
    const { paperContext, message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemInstruction = `You are a supportive, high-caliber Computer Science Research Mentor and TA assisting a 3rd-year CS student.
You have analyzed this academic paper:
Title: ${paperContext?.title || 'Academic Paper'}
Summary: ${paperContext?.summary || 'N/A'}
Architecture: ${paperContext?.mermaidCode || 'N/A'}

Help the student understand implementation details, mathematical equations, loss functions, PyTorch coding strategies, benchmark datasets, and internship project ideas.
Keep explanations intuitive, code-oriented (PyTorch/Python), concrete, and encouraging.
Prioritize token efficiency.`;

    const contents = [
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      reply: response.text,
      tokenUsage: response.usageMetadata,
    });
  } catch (error: any) {
    console.error('Error in chat-paper:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat message.' });
  }
});

// Mount Vite middleware in development
if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve('dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
});
