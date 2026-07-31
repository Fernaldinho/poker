import { config } from '../config';
import { BadRequestError } from '../utils/AppError';

export interface PokerSuggestion {
  action: 'FOLD' | 'CALL' | 'RAISE';
  amount?: string;
  confidence: number;
  reason: string;
  table: {
    street: 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'UNKNOWN';
    pot?: string;
    heroCards?: string[];
    communityCards?: string[];
    opponents?: number;
    position?: string;
  };
}

export interface AnalyzeFrameInput {
  imageBase64: string;
  mimeType?: string;
  context?: {
    stakes?: string;
    buyIn?: number;
    heroCards?: string;
    notes?: string;
  };
}

const SYSTEM_PROMPT = `Você é um assistente de poker de elite (cash game no limit hold'em). Analise a imagem de uma mesa de poker online e responda APENAS com JSON válido, sem markdown, no formato:

{
  "table": {
    "street": "PREFLOP|FLOP|TURN|RIVER|UNKNOWN",
    "pot": "valor em $ se legível",
    "heroCards": ["ex: Ah", "Kd"] ou [] se não legíveis,
    "communityCards": ["9h","Qc","2s"] ou [],
    "opponents": numero de jogadores que receberam cartas, se legível,
    "position": "BTN|SB|BB|UTG|CO|MP|UNKNOWN"
  },
  "suggestion": {
    "action": "FOLD|CALL|RAISE",
    "amount": "valor sugerido de raise/call em $ se aplicável",
    "confidence": 0.0 a 1.0,
    "reason": "1-2 frases em português explicando o porquê"
  }
}

Se a mesa estiver vazia ou não for uma mesa de poker jogável (ex: lobby), responda com table.street = "UNKNOWN" e suggestion com action "CALL", confidence 0 e reason "Mesa não reconhecida".`;

/**
 * Serviço de IA: análise de frames de mesa de poker.
 * Usa a API gratuita do Google Gemini (AI Studio) com modelo multimodal.
 * Alternativa: OpenCode Zen (ZEN_API_KEY) com modelo configurável.
 */
export class AIService {
  async analyzeFrame(input: AnalyzeFrameInput): Promise<PokerSuggestion> {
    const hasGemini = Boolean(config.ai.geminiApiKey);
    const hasZen = Boolean(config.ai.zenApiKey);

    if (!hasGemini && !hasZen) {
      throw new BadRequestError(
        'IA não configurada: adicione GEMINI_API_KEY (grátis em aistudio.google.com) ou ZEN_API_KEY no backend/.env'
      );
    }

    const mime = input.mimeType ?? 'image/jpeg';

    if (hasGemini) {
      return this.analyzeWithGemini(input, mime);
    }
    return this.analyzeWithZen(input, mime);
  }

  private async analyzeWithGemini(
    input: AnalyzeFrameInput,
    mimeType: string
  ): Promise<PokerSuggestion> {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${config.ai.model}:generateContent?key=${config.ai.geminiApiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: input.imageBase64,
                },
              },
              {
                text: `Contexto extra (se vazio, ignore): stakes=${input.context?.stakes ?? ''}, heroCards=${input.context?.heroCards ?? ''}, notas=${input.context?.notes ?? ''}.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 400,
          responseMimeType: 'application/json',
        },
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new BadRequestError(`Gemini falhou (${res.status}): ${raw.slice(0, 300)}`);
    }

    const json = JSON.parse(raw) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new BadRequestError('Gemini não retornou análise');

    return this.parseSuggestion(text);
  }

  private async analyzeWithZen(
    input: AnalyzeFrameInput,
    mimeType: string
  ): Promise<PokerSuggestion> {
    const url = 'https://opencode.ai/zen/v1/chat/completions';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.zenApiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.zenApiKey.includes('ai/') ? config.ai.model : 'opencode/gemini-3.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${input.imageBase64}` },
              },
              {
                type: 'text',
                text: `Contexto extra: stakes=${input.context?.stakes ?? ''}, heroCards=${input.context?.heroCards ?? ''}.`,
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new BadRequestError(`Zen falhou (${res.status}): ${raw.slice(0, 300)}`);
    }

    const json = JSON.parse(raw) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new BadRequestError('Zen não retornou análise');

    return this.parseSuggestion(text);
  }

  private parseSuggestion(text: string): PokerSuggestion {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start >= 0 && end > start) {
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      } else {
        throw new BadRequestError('IA retornou resposta inválida');
      }
    }

    const p = parsed as {
      table?: Partial<PokerSuggestion['table']>;
      suggestion?: Partial<PokerSuggestion>;
    };

    return {
      table: {
        street: p.table?.street ?? 'UNKNOWN',
        pot: p.table?.pot,
        heroCards: p.table?.heroCards ?? [],
        communityCards: p.table?.communityCards ?? [],
        opponents: p.table?.opponents,
        position: p.table?.position ?? 'UNKNOWN',
      },
      action: p.suggestion?.action ?? 'CALL',
      amount: p.suggestion?.amount,
      confidence: Math.max(0, Math.min(1, Number(p.suggestion?.confidence ?? 0))),
      reason: p.suggestion?.reason ?? '',
    };
  }
}
