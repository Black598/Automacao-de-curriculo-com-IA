// Cores ANSI para o terminal
export const colors = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',

    // Texto
    black:   '\x1b[30m',
    red:     '\x1b[31m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    blue:    '\x1b[34m',
    magenta: '\x1b[35m',
    cyan:    '\x1b[36m',
    white:   '\x1b[37m',

    // Background
    bgBlack:   '\x1b[40m',
    bgRed:     '\x1b[41m',
    bgGreen:   '\x1b[42m',
    bgYellow:  '\x1b[43m',
    bgBlue:    '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan:    '\x1b[46m',
    bgWhite:   '\x1b[47m',
};

export const c = {
    info:    (msg: string) => `${colors.cyan}${colors.bold}ℹ ${msg}${colors.reset}`,
    success: (msg: string) => `${colors.green}${colors.bold}✔ ${msg}${colors.reset}`,
    warn:    (msg: string) => `${colors.yellow}${colors.bold}⚠ ${msg}${colors.reset}`,
    error:   (msg: string) => `${colors.red}${colors.bold}✖ ${msg}${colors.reset}`,
    title:   (msg: string) => `${colors.magenta}${colors.bold}${msg}${colors.reset}`,
    label:   (msg: string) => `${colors.blue}${colors.bold}${msg}${colors.reset}`,
    value:   (msg: string) => `${colors.white}${msg}${colors.reset}`,
    dim:     (msg: string) => `${colors.dim}${msg}${colors.reset}`,
    skip:    (msg: string) => `${colors.yellow}⏭ ${msg}${colors.reset}`,
    apply:   (msg: string) => `${colors.green}🚀 ${msg}${colors.reset}`,
    ai:      (msg: string) => `${colors.magenta}🤖 ${msg}${colors.reset}`,
};

export function clearScreen() {
    process.stdout.write('\x1Bc');
}

export function printBanner() {
    clearScreen();
    console.log(`${colors.cyan}${colors.bold}`);
    console.log(`╔══════════════════════════════════════════════════════╗`);
    console.log(`║       🤖  AI Job Applier - Douglas Ferreira          ║`);
    console.log(`║         Powered by Playwright + Gemini AI            ║`);
    console.log(`╚══════════════════════════════════════════════════════╝`);
    console.log(`${colors.reset}`);
}

export function printJobHeader(index: number, total: number, term: string, location: string) {
    console.log(`${colors.blue}${colors.bold}─────────────────────────────────────────────────────${colors.reset}`);
    console.log(c.label(`Vaga [${index}/${total}]`) + ` ${c.dim(`Busca: "${term}" em ${location}`)}`);
    console.log(`${colors.blue}${colors.bold}─────────────────────────────────────────────────────${colors.reset}`);
}

export function printSummaryBox(summary: string) {
    console.log(`\n${colors.cyan}${colors.bold}╔══════════ RESUMO DA VAGA ══════════╗${colors.reset}`);
    summary.split('\n').forEach(line => {
        if (line.includes('Faixa Salarial') || line.includes('Modelo de trabalho')) {
            console.log(`${colors.cyan}║${colors.reset} ${colors.yellow}${line.trim()}${colors.reset}`);
        } else if (line.includes('Análise de Fit') || line.includes('nota')) {
            console.log(`${colors.cyan}║${colors.reset} ${colors.green}${colors.bold}${line.trim()}${colors.reset}`);
        } else {
            console.log(`${colors.cyan}║${colors.reset} ${line.trim()}`);
        }
    });
    console.log(`${colors.cyan}╚════════════════════════════════════╝${colors.reset}\n`);
}
