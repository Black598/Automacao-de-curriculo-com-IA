# Como Utilizar o Seu Próprio Currículo

Este bot foi projetado para ser facilmente adaptável para que você possa utilizá-lo com o seu próprio currículo e informações pessoais. Siga os passos abaixo para configurar o bot para a sua busca de emprego.

## Passo 0: Instalação e Configuração

Antes de tudo, você precisa instalar as dependências do projeto e configurar sua chave de API para o Gemini.

1.  **Instale os `node_modules`:**
    Abra o terminal na raiz do projeto e execute o comando:
    ```bash
    npm install
    ```

2.  **Configure a Chave da API do Gemini:**
    - Crie um arquivo chamado `.env` na raiz do projeto.
    - Dentro dele, adicione a seguinte linha, substituindo `SUA_CHAVE_API_AQUI` pela sua chave real:
      ```
      GEMINI_API_KEY=SUA_CHAVE_API_AQUI
      ```
    - Você pode obter uma chave de API gratuita no Google AI Studio.
    
## Passo 1: Adicione Seu Currículo

O bot utiliza duas versões do seu currículo: uma em **HTML** para extrair o texto e outra em **PDF** que é enviada para as empresas.

1.  **Crie as versões HTML e PDF do seu currículo.**
    *   Você pode usar o Word ou o Google Docs e exportar seu documento para ambos os formatos.
    *   Certifique-se de que o nome dos arquivos seja simples (ex: `Meu_Curriculo.pdf` e `Meu_Curriculo.html`).
    *   Caso precise de um modelo, você pode usar este como base: Modelo de Currículo. Ele já está em um formato que facilita a exportação para HTML e PDF.
    *   **Para salvar como PDF a partir do HTML (recomendado se usar o modelo):** Abra o arquivo `.html` no seu navegador, pressione `Ctrl + P` (ou `Cmd + P` no Mac) para abrir a caixa de diálogo de impressão. Em "Destino", selecione "Salvar como PDF". Em "Mais configurações", desative a opção "Cabeçalhos e rodapés" e configure as "Margens" para "Nenhuma". Por fim, clique em "Salvar".

2.  **Coloque os arquivos na pasta `Curriculo`.**
    *   Substitua ou adicione seus arquivos na pasta `Curriculo/` na raiz do projeto.

## Passo 2: Atualize o Arquivo de Configuração

Agora, você precisa dizer ao bot onde encontrar seus novos arquivos de currículo.

1.  Abra o arquivo `src/config.ts`.

2.  Altere os valores das constantes `resumePdfPath` e `resumeHtmlPath` para corresponder aos nomes dos seus arquivos.

    ```typescript
    // d:\Garoto de Programa\Aplicação-de-curriculo-com-IA\src\config.ts
    
    export const config = {
        // ...
        resumePdfPath: path.resolve(__dirname, '../Curriculo/Seu_Nome_CV.pdf'),
        resumeHtmlPath: path.resolve(__dirname, '../Curriculo/Seu_Nome_CV.html'),
        // ...
    };
    ```

## Passo 3: Atualize Seus Dados Pessoais (MUITO IMPORTANTE!)

Para economizar chamadas à API da IA e agilizar o preenchimento, o bot utiliza um arquivo com dados estáticos para perguntas comuns (nome, email, telefone, etc.). É **essencial** que você atualize este arquivo com suas informações.

1.  Abra o arquivo `src/resume_data.ts`.

2.  Modifique o objeto `resumeData` com os seus dados.

    ```typescript
    // d:\Garoto de Programa\Aplicação-de-curriculo-com-IA\src\resume_data.ts

    export const resumeData = {
        name:           "Seu Nome Completo",
        firstName:      "Seu Primeiro Nome",
        lastName:       "Seu Sobrenome",
        email:          "seu.email@exemplo.com",
        phone:          "81999998888",
        phoneFormatted: "(81) 9 9999-8888",
        // ... continue preenchendo todos os outros campos
        linkedin:       "https://www.linkedin.com/in/seu-perfil",
        github:         "https://github.com/seu-usuario",
        yearsExperience: "5",
        // ... etc.
    };
    ```

## Passo 4 (Opcional): Ajuste os Termos de Busca

Você pode (e deve!) customizar os termos de busca para encontrar as vagas que mais se alinham ao seu perfil.

1.  No mesmo arquivo `src/config.ts`, edite as listas `searchTerms` e `jobLocation`.

    ```typescript
    // d:\Garoto de Programa\Aplicação-de-curriculo-com-IA\src\config.ts

    export const config = {
        // ...
        searchTerms: [
            "Sua Posição Desejada",
            "Desenvolvedor Backend Pleno",
            "Analista de Sistemas",
        ],
        jobLocation: ["Sua Cidade", "Remote"],
        // ...
    };
    ```

Pronto! Após seguir estes passos, o bot estará configurado para usar suas informações e buscar as vagas ideais para você. Boa sorte!
