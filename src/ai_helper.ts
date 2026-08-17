import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Função auxiliar de retry com suporte a 429 (rate limit)
async function generateWithRetry(promptText: string, retries = 3): Promise<string> {
    // Cada modelo tem cota independente, então tentamos todos antes de desistir
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash"];

    for (let attempt = 0; attempt < retries; attempt++) {
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(promptText);
                return result.response.text().trim();
            } catch (error: any) {
                const status = error.status || 0;
                const message = error.message || '';

                if (status === 429 || message.includes('429')) {
                    // Extrair o retryDelay da mensagem de erro se disponível
                    const delayMatch = message.match(/retry in ([\d.]+)s/);
                    const waitMs = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) * 1000 + 2000 : 20000;
                    console.log(`[Cota atingida - ${modelName}] Limite diário do plano gratuito. Aguardando ${Math.round(waitMs/1000)}s antes de tentar outro modelo...`);
                    await new Promise(res => setTimeout(res, waitMs));
                } else if (status === 503 || message.includes('503')) {
                    console.log(`[Tentativa ${attempt + 1}] Modelo ${modelName} sobrecarregado (503). Tentando próximo...`);
                } else {
                    console.error(`Erro inesperado com ${modelName}:`, message.split('\n')[0]);
                    break; // Erro desconhecido, não adianta tentar de novo com esse modelo
                }
            }
        }
        if (attempt < retries - 1) {
            console.log(`Aguardando 10s antes da próxima tentativa...`);
            await new Promise(res => setTimeout(res, 10000));
        }
    }
    throw new Error("Todos os modelos Gemini falharam. Cota diária possivelmente esgotada.");
}

export async function answerQuestionBasedOnResume(resumeText: string, question: string, type: 'text' | 'radio'): Promise<string> {
    const promptText = `
    Você é um assistente que ajuda o candidato Douglas Ferreira a preencher formulários de emprego.
    Aqui está o conteúdo do currículo dele:
    ---
    ${resumeText}
    ---
    
    A pergunta do formulário é: "${question}"
    Tipo de resposta esperada: ${type === 'radio' ? 'Uma resposta curta como Sim ou Não, ou a opção que melhor se aplica.' : 'Um texto curto e direto (máximo 2 frases) respondendo a pergunta com base no currículo.'}
    
    Responda APENAS com o texto a ser preenchido no campo, sem explicações adicionais, sem aspas e sem markdown.
    `;

    try {
        return await generateWithRetry(promptText);
    } catch (error) {
        console.error("Erro ao chamar o Gemini:", error);
        return "";
    }
}

export async function summarizeJobDescription(descriptionText: string, resumeText: string): Promise<string> {
    const promptText = `
    Analise a descrição de vaga de emprego e o currículo do candidato abaixo.
    
    1. Primeiro, extraia de forma muito sucinta (em bullet points) as seguintes informações principais da vaga:
       - Faixa Salarial (se não houver, escreva "Não informado")
       - Modelo de trabalho (Remoto, Presencial ou Híbrido)
       - Principais Benefícios (listar os mais importantes)
       - Nível de senioridade esperado e principais requisitos (linguagens, frameworks, etc.)
       
    2. Em seguida, crie uma seção "Análise de Fit (Match):"
       - Dê uma nota de aderência de 0 a 10 entre o currículo e a vaga.
       - Explique brevemente (em 1 ou 2 frases) o porquê dessa nota, destacando o que o candidato tem que a vaga pede e o que falta.
    
    Descrição da vaga:
    ---
    ${descriptionText}
    ---
    
    Currículo do Candidato:
    ---
    ${resumeText}
    ---
    
    Por favor, retorne APENAS o resumo final formatado de forma limpa.
    `;

    try {
        return await generateWithRetry(promptText);
    } catch (error) {
        console.error("Erro ao gerar resumo da vaga com Gemini:", error);
        return "Erro ao analisar os detalhes da vaga.";
    }
}
