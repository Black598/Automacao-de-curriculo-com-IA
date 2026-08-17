import fs from 'fs';

export function getResumeText(htmlPath: string): string {
    try {
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        // Extrair apenas o texto, removendo tags HTML
        const textContent = htmlContent
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return textContent;
    } catch (error) {
        console.error("Erro ao ler o currículo:", error);
        return "";
    }
}
