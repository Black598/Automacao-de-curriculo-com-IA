/**
 * Dados estáticos do currículo de Douglas Ferreira.
 * Usado para responder campos comuns do formulário sem gastar cota da API Gemini.
 */
export const resumeData = {
    name:           "Douglas Ferreira",
    firstName:      "Douglas",
    lastName:       "Ferreira",
    email:          "doug.oak598@gmail.com",
    phone:          "81986773152",
    phoneFormatted: "(81) 9 8677-3152",
    countryCode:    "+55",
    country:        "Brazil",
    city:           "Jaboatão dos Guararapes",
    state:          "Pernambuco",
    linkedin:       "https://www.linkedin.com/in/douglas-ferreira-dev",
    github:         "https://github.com/Black598",
    yearsExperience: "3",
    currentRole:    "Quality Engineering Analyst",
    currentCompany: "Accenture",
    education:      "Engenharia de Software - Universidade Estácio de Sá (2021-2025)",
    degree:         "Bachelor's Degree",
    languages:      "Português nativo, Inglês intermediário",
    englishLevel:   "Intermediate",
    salaryExpectation: "8000",
    availability:   "Imediata",
    noticePeriod:   "Imediato",
    remote:         "Sim",
    relocate:       "Não",
    authorized:     "Sim",
    sponsorship:    "Não",
    summary: "Desenvolvedor com foco em Quality Engineering e automação. Experiência em testes de performance (JMeter, K6), automação (Cypress), e desenvolvimento Web/Mobile com Node.js, TypeScript e Java.",
};

/**
 * Mapa de palavras-chave para campos do formulário.
 * Se a pergunta contiver alguma dessas palavras-chave, retorna o valor direto do currículo.
 */
const keywordMap: Array<{ keywords: string[]; value: string }> = [
    { keywords: ['first name', 'nome', 'primeiro nome'], value: resumeData.firstName },
    { keywords: ['last name', 'sobrenome', 'último nome'], value: resumeData.lastName },
    { keywords: ['full name', 'nome completo'], value: resumeData.name },
    { keywords: ['email', 'e-mail', 'email address', 'endereço de email'], value: resumeData.email },
    { keywords: ['phone', 'telefone', 'celular', 'mobile', 'número de telefone'], value: resumeData.phoneFormatted },
    { keywords: ['phone country code', 'código do país', 'country code'], value: `Brazil (+55)` },
    { keywords: ['city', 'cidade'], value: resumeData.city },
    { keywords: ['state', 'estado'], value: resumeData.state },
    { keywords: ['country', 'país'], value: resumeData.country },
    { keywords: ['linkedin', 'linkedin url', 'perfil linkedin'], value: resumeData.linkedin },
    { keywords: ['github', 'github url', 'perfil github'], value: resumeData.github },
    { keywords: ['years of experience', 'anos de experiência', 'anos de experiencia'], value: resumeData.yearsExperience },
    { keywords: ['current company', 'empresa atual', 'current employer'], value: resumeData.currentCompany },
    { keywords: ['current role', 'cargo atual', 'current title', 'current position'], value: resumeData.currentRole },
    { keywords: ['education', 'educação', 'degree', 'graduação', 'formação'], value: resumeData.education },
    { keywords: ['salary', 'salário', 'pretensão', 'expectation', 'remuneração'], value: resumeData.salaryExpectation },
    { keywords: ['notice period', 'aviso prévio', 'disponibilidade', 'availability'], value: resumeData.noticePeriod },
    { keywords: ['remote', 'remoto', 'trabalho remoto'], value: resumeData.remote },
    { keywords: ['relocate', 'relocação', 'mudar de cidade', 'disposto a relocar'], value: resumeData.relocate },
    { keywords: ['authorized to work', 'autorizado a trabalhar', 'work authorization', 'autorização de trabalho'], value: resumeData.authorized },
    { keywords: ['visa', 'sponsorship', 'patrocínio de visto'], value: resumeData.sponsorship },
    { keywords: ['cover letter', 'carta de apresentação'], value: resumeData.summary },
    { keywords: ['summary', 'resumo', 'sobre você', 'about you', 'about yourself'], value: resumeData.summary },
];

/**
 * Tenta responder a pergunta diretamente pelo currículo, sem chamar a API.
 * Retorna null se não souber responder.
 */
export function answerFromResume(question: string): string | null {
    const q = question.toLowerCase().trim();

    for (const entry of keywordMap) {
        if (entry.keywords.some(kw => q.includes(kw))) {
            return entry.value;
        }
    }

    return null; // Não sabe responder — deve chamar o Gemini
}
