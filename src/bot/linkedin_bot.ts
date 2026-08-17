import { chromium } from 'playwright';
import { config } from '../config';
import { getResumeText } from '../resume_parser';
import { answerQuestionBasedOnResume, summarizeJobDescription } from '../ai_helper';
import { answerFromResume } from '../resume_data';
import { c, clearScreen, printBanner, printJobHeader, printSummaryBox } from '../terminal';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';

const SESSION_FILE = path.resolve(__dirname, '../../session.json');

// Interface readline única e persistente para evitar leitura de buffer sobrando
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, ans => {
        resolve(ans.trim());
    }));
}

async function run() {
    printBanner();

    console.log(c.info('Carregando currículo...'));
    const resumeText = getResumeText(config.resumeHtmlPath);
    if (!resumeText) {
        console.error(c.error('Não foi possível carregar o currículo. Abortando.'));
        return;
    }
    console.log(c.success('Currículo carregado com sucesso!'));

    const browser = await chromium.launch({ headless: config.headless });
    const context = fs.existsSync(SESSION_FILE)
        ? await browser.newContext({ storageState: SESSION_FILE })
        : await browser.newContext();

    const page = await context.newPage();

    console.log(c.info('Acessando LinkedIn...'));
    await page.goto('https://www.linkedin.com/login');

    if (page.url().includes('login')) {
        console.log(c.warn('Por favor, faça login no navegador que foi aberto.'));
        console.log(c.warn('Você tem 60 segundos para logar manualmente...'));
        await page.waitForURL('https://www.linkedin.com/feed/', { timeout: 60000 });
        await context.storageState({ path: SESSION_FILE });
        console.log(c.success('Sessão salva com sucesso!'));
    }

    const locations = Array.isArray(config.jobLocation) ? config.jobLocation : [config.jobLocation];
    let jobCounter = 0;
    let appliedCount = 0;
    let skippedCount = 0;

    for (const location of locations) {
        for (const term of config.searchTerms) {
            console.log(`\n${c.info(`Pesquisando vagas para: "${term}" em ${location}`)}`);
            const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(term)}&location=${encodeURIComponent(location)}&f_AL=true`;
            try {
                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
            } catch (e) {
                console.log(c.warn('A página de busca demorou para carregar, prosseguindo...'));
            }
            await page.waitForTimeout(3000);

            const jobs = await page.locator('.job-card-container').all();
            console.log(c.success(`${jobs.length} vagas de "Candidatura Simplificada" encontradas!`));

            for (let i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                await job.click();
                await page.waitForTimeout(3000);

                const applyButton = page.locator('.jobs-apply-button--top-card button').first();
                if (await applyButton.isVisible()) {
                    jobCounter++;
                    clearScreen();
                    printJobHeader(i + 1, jobs.length, term, location);

                    console.log(c.ai('Consultando o Gemini para analisar a vaga...'));
                    const jobDetailsLocator = page.locator('#job-details');
                    await page.waitForTimeout(1000);

                    let descriptionText = "Descrição não encontrada.";
                    try {
                        descriptionText = await jobDetailsLocator.innerText();
                    } catch (e) {
                        console.log(c.warn('Não foi possível ler a descrição.'));
                    }

                    const summary = await summarizeJobDescription(descriptionText, resumeText);
                    printSummaryBox(summary);

                    const applyAnswer = await askQuestion(c.label('Você quer aplicar para essa vaga? (s/n): '));

                    if (applyAnswer.toLowerCase() !== 's') {
                        skippedCount++;
                        console.log(c.skip('Vaga pulada.'));
                        await page.waitForTimeout(1000);
                        continue;
                    }

                    appliedCount++;
                    console.log(c.apply('Iniciando candidatura...'));
                    await applyButton.click();
                    await page.waitForTimeout(2000);

                    // Loop pelas páginas do formulário Easy Apply
                    let formPageCount = 0;
                    const MAX_PAGES = 10;

                    while (formPageCount < MAX_PAGES) {
                        formPageCount++;
                        await page.waitForTimeout(1500);

                        // Escopa tudo DENTRO do modal do Easy Apply
                        const modal = page.locator('.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"]').first();

                        // Preenche todos os inputs de texto visíveis e habilitados (dentro do modal)
                        const inputs = await modal.locator(
                            'input[type="text"]:not([disabled]):not([aria-hidden="true"]), ' +
                            'input[type="number"]:not([disabled]):not([aria-hidden="true"]), ' +
                            'input[type="email"]:not([disabled]):not([aria-hidden="true"]), ' +
                            'input[type="tel"]:not([disabled]):not([aria-hidden="true"]), ' +
                            'textarea:not([disabled]):not([aria-hidden="true"])'
                        ).all();
                        for (const input of inputs) {
                            const currentValue = await input.inputValue().catch(() => '');
                            if (currentValue.trim() !== '') continue; // já preenchido, não sobrescreve

                            const labelEl = await input.evaluate((el) => {
                                const id = el.getAttribute('id');
                                const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                                return label?.textContent?.trim() || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '';
                            });
                            if (!labelEl) continue;

                            // 1) Tenta responder direto do currículo (sem gastar cota)
                            let answer = answerFromResume(labelEl);
                            if (answer) {
                                console.log(c.info(`Campo: "${labelEl}" → ${c.dim('(currículo direto)')} "${answer}"`))
                            } else {
                                // 2) Só chama o Gemini se não souber responder diretamente
                                console.log(c.ai(`Gemini respondendo: "${labelEl}"...`));
                                answer = await answerQuestionBasedOnResume(resumeText, labelEl, 'text');
                                console.log(c.ai(`Resposta: "${answer}"`))
                            }
                            await input.fill(answer);
                            await page.waitForTimeout(500);
                        }

                        // Selects (dropdowns) — também dentro do modal
                        const selects = await modal.locator('select:not([disabled])').all();
                        for (const select of selects) {
                            const options = await select.locator('option').allTextContents();
                            const labelEl = await select.evaluate((el) => {
                                const id = el.getAttribute('id');
                                const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                                return label?.textContent?.trim() || el.getAttribute('aria-label') || '';
                            });
                            if (!labelEl || options.length <= 1) continue;

                            const question = `${labelEl}. Opções: ${options.filter(o => o.trim()).join(', ')}`;
                            console.log(c.info(`Dropdown: "${labelEl}"`))

                            // Tenta primeiro no currículo, depois no Gemini
                            let dropAnswer = answerFromResume(labelEl);
                            if (!dropAnswer) {
                                console.log(c.ai(`Gemini escolhendo opção para: "${labelEl}"...`));
                                dropAnswer = await answerQuestionBasedOnResume(resumeText, question, 'radio');
                            }
                            console.log(c.ai(`Opção escolhida: "${dropAnswer}"`));

                            const bestOption = options.find(o => o.toLowerCase().includes(dropAnswer!.toLowerCase())) || options[1];
                            await select.selectOption({ label: bestOption }).catch(() => {});
                            await page.waitForTimeout(500);
                        }

                        // Verifica se há botão de Submit (enviar) ou Next (próximo)
                        // O LinkedIn usa data-attributes e aria-labels variados
                        const submitBtn = modal.locator([
                            'button[aria-label="Enviar candidatura"]',
                            'button[aria-label="Submit application"]',
                            'button[aria-label="Submit"]',
                        ].join(', ')).first();

                        const nextBtn = modal.locator([
                            'button[aria-label="Continuar para a próxima etapa"]',
                            'button[aria-label="Continue to next step"]',
                            'button[aria-label="Review your application"]',
                            'button[aria-label="Revisar candidatura"]',
                            'button[data-easy-apply-next-button]',
                        ].join(', ')).first();

                        // Fallback: botão primário genérico dentro do modal (último botão de ação)
                        const genericPrimaryBtn = modal.locator('footer button.artdeco-button--primary').last();

                        if (await submitBtn.isVisible()) {
                            console.log(c.success('\n✅ Formulário completo! Pronto para enviar.'));
                            const confirm = await askQuestion(c.label('Confirmar ENVIO da candidatura? (s/n): '));
                            if (confirm.toLowerCase() === 's') {
                                await submitBtn.click();
                                console.log(c.apply('🎉 Candidatura ENVIADA com sucesso!'));
                            } else {
                                // Fecha sem enviar
                                const closeBtn2 = page.locator('button[aria-label="Dismiss"], button[aria-label="Descartar"], button[aria-label="Fechar"]').first();
                                await closeBtn2.click().catch(() => {});
                                const discardBtn2 = page.locator('button[data-control-name="discard_application_confirm_btn"]');
                                if (await discardBtn2.isVisible()) await discardBtn2.click();
                                console.log(c.skip('Candidatura cancelada na etapa final.'));
                                appliedCount--; // não contabiliza
                            }
                            break;
                        } else if (await nextBtn.isVisible()) {
                            console.log(c.info('Avançando para a próxima etapa...'));
                            await nextBtn.click();
                        } else if (await genericPrimaryBtn.isVisible()) {
                            // Fallback: clica no botão primário do footer (pode ser Próximo ou Revisar)
                            const btnText = await genericPrimaryBtn.textContent() || '';
                            console.log(c.info(`Clicando botão: "${btnText.trim()}"...`));
                            await genericPrimaryBtn.click();
                        } else {
                            console.log(c.warn('Nenhum botão de avançar/enviar encontrado. Encerrando este formulário.'));
                            const closeBtn3 = page.locator('button[aria-label="Dismiss"], button[aria-label="Descartar"], button[aria-label="Fechar"]').first();
                            await closeBtn3.click().catch(() => {});
                            const discardBtn3 = page.locator('button[data-control-name="discard_application_confirm_btn"]');
                            if (await discardBtn3.isVisible()) await discardBtn3.click();
                            appliedCount--;
                            break;
                        }
                    }

                    console.log(c.success('Aguardando próxima vaga...'));
                    await page.waitForTimeout(2000);
                }
            }
        }
    }

    clearScreen();
    printBanner();
    console.log(`${c.success('Processo finalizado!')}\n`);
    console.log(`  ${c.label('Total de vagas analisadas:')} ${jobCounter}`);
    console.log(`  ${c.success('Candidaturas enviadas:    ')} ${appliedCount}`);
    console.log(`  ${c.skip('Vagas puladas:            ')} ${skippedCount}`);
    console.log('');
    rl.close();
    await browser.close();
}

run().catch(console.error);
