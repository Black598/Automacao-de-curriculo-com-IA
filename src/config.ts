import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    resumePdfPath: path.resolve(__dirname, '../Curriculo/Douglas Ferreira DEV.pdf'),
    resumeHtmlPath: path.resolve(__dirname, '../Curriculo/index.html'),
    searchTerms: [
        "Quality Engineer",
        "Desenvolvedor Junior",
        "QA Junior",
        "Software Engineer",
        "QA Automation",
        "Desenvolvedor Full Stack",
        "Desenvolvedor",
        "Engenheiro de Software",
        "Engenheiro de Software Junior",
        "Engenheiro de Software Full Stack",
        "Quality Assurance",
        "Analista de Qualidade",
        "Analista de Qualidade Junior",
        "Analista de Qualidade Full Stack",
        "Testador",
        "Testador Junior",
        "Testador Full Stack",
    ],
    jobLocation: ["Recife", "Brazil", "Remote"],
    headless: false, // para vermos o robô rodando
};
