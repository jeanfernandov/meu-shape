# Meu Shape — PWA instalável

Aplicativo web progressivo (PWA) em português para calendário real, checklists de treino, registro de cargas/repetições, histórico, peso e metas nutricionais.

## O que está incluído
- Calendário mensal real, com seleção de datas e treinos programados conforme o dia da semana.
- Quatro fichas: Superior A, Inferior A, Superior B e Inferior B.
- Marcação de exercícios e registro opcional de carga/repetições.
- Conclusão e histórico de treinos por data.
- Registro de peso e histórico das últimas pesagens.
- Metas nutricionais de referência.
- Armazenamento local no navegador (`localStorage`).
- Service worker para abrir o app offline depois da primeira visita.
- Exportação e importação de backup JSON.

## Como publicar sem pagar (GitHub Pages)
Você precisa de uma conta GitHub. Faça isso uma vez:

1. Entre em https://github.com e crie um repositório novo chamado `meu-shape`.
2. Envie todos os arquivos e a pasta `icons` deste projeto para a raiz do repositório. Não envie apenas o ZIP: extraia-o primeiro.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/(root)`, depois clique em **Save**.
6. Aguarde a publicação e abra o endereço que o GitHub Pages mostrar, geralmente `https://SEU-USUARIO.github.io/meu-shape/`.

A publicação pode levar alguns minutos. O endereço deve usar HTTPS para que o service worker e a instalação PWA funcionem.

## Instalar no Android
1. Abra o endereço publicado no **Google Chrome** do celular.
2. Aguarde a página carregar uma vez com internet.
3. Abra o menu ⋮ do Chrome.
4. Escolha **Instalar app** ou **Adicionar à tela inicial** (o texto varia conforme a versão do Chrome).
5. Confirme. O ícone Meu Shape aparecerá na tela inicial e poderá abrir em janela própria.

Se a opção de instalar não aparecer, confira se o site abre por HTTPS, se o `manifest.webmanifest`, os dois ícones e `sw.js` estão publicados nos caminhos corretos. Como alternativa, use **Adicionar à tela inicial**.

## Como usar
- A aba **Calendário** permite selecionar uma data; a programação se baseia no dia da semana: segunda Superior A, terça Inferior A, quinta Superior B, sexta Inferior B; quarta, sábado e domingo são descanso.
- Na aba **Treinos**, escolha a ficha e marque os exercícios concluídos. Registre carga e repetições se quiser.
- Finalize apenas quando todos os exercícios estiverem marcados.
- Na aba **Nutrição**, registre o peso atual.
- Em **Histórico**, exporte um backup JSON regularmente.

## Privacidade e limitações
Os dados ficam no armazenamento local do navegador neste aparelho. Não existe conta nem sincronização na nuvem. Limpar os dados do site, usar outro navegador ou trocar de aparelho pode apagar/deixar os dados inacessíveis; exporte backups regularmente. Importar um backup substitui os dados atuais.
O app não envia os dados para nenhum servidor. O calendário é real e baseado em datas locais, mas a programação semanal é fixa e pode ser alterada no código `app.js`.
As calorias e macros são estimativas iniciais, não prescrição nutricional.

## Desenvolvimento local
PWA exige `localhost` ou HTTPS. Não abra simplesmente o `index.html` por `file://` se quiser testar instalação/offline. Você pode usar uma extensão de servidor local ou executar `python -m http.server 8000` na pasta do projeto e abrir `http://localhost:8000`.
