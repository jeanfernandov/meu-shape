# Meu Shape — projeto para gerar APK Android

Este projeto empacota o app web Meu Shape em um aplicativo Android usando Capacitor. O calendário, as marcações de exercícios, os registros de cargas/repetições, o peso e o histórico continuam no app. Os dados são guardados localmente no armazenamento do WebView do aplicativo; não há conta nem sincronização automática na nuvem.

## Opção recomendada: gerar o APK pelo GitHub Actions (sem instalar Android Studio no computador)

1. Extraia este ZIP.
2. Crie um repositório no GitHub chamado `meu-shape`.
3. Envie **todos os arquivos e pastas** deste projeto para a raiz do repositório, incluindo a pasta oculta `.github/workflows`.
4. Abra a aba **Actions** no GitHub e, se solicitado, habilite workflows.
5. Selecione **Build Meu Shape APK** e clique em **Run workflow**. Também pode ser iniciado automaticamente ao enviar alterações para a branch `main`.
6. Aguarde o workflow ficar verde. Abra a execução concluída, vá até **Artifacts** e baixe `meu-shape-apk-debug`.
7. Extraia o ZIP baixado. Dentro estará `app-debug.apk`.

O GitHub Actions compila um **APK debug** para teste/instalação pessoal. Não é um APK assinado para publicar na Play Store.

## Instalar no celular Android

1. Transfira `app-debug.apk` para o celular (USB, Drive ou outro método confiável).
2. Abra o APK no gerenciador de arquivos.
3. Se o Android pedir, permita **Instalar apps desconhecidos** para o aplicativo usado para abrir o arquivo.
4. Confirme a instalação e abra **Meu Shape**.

Instale APKs somente de uma origem que você controla. Se uma versão anterior com assinatura diferente estiver instalada, pode ser necessário desinstalá-la antes; isso apaga os dados locais do app. Faça backup antes de substituir versões sempre que possível.

## Gerar localmente com Android Studio (alternativa)

Pré-requisitos: Node.js 20 ou superior, Android Studio atualizado e SDK Android instalado; Java 21 é recomendado para este fluxo.

No terminal, dentro da pasta extraída:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio, aguarde a sincronização do Gradle. Para criar o APK de teste, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**. O APK debug normalmente aparece em `android/app/build/outputs/apk/debug/app-debug.apk`.

Se o diretório `android/` já tiver sido criado antes, não execute `npx cap add android` novamente; use `npm run android:sync` e abra o projeto existente.

## Calendário, marcações e histórico

- O calendário usa datas reais e a programação semanal configurada no app.
- É possível marcar exercícios, registrar cargas/repetições, finalizar treinos, registrar peso e consultar o histórico.
- O armazenamento é local no aparelho. Desinstalar o app, limpar os dados do aplicativo ou trocar de aparelho pode apagar os registros. Use a exportação de backup JSON na seção **Histórico** regularmente e guarde o arquivo fora do celular.
- Não existe sincronização entre aparelhos.

## Identidade e publicação

O identificador Android é `com.meushape.app`. Para publicar na Play Store, será necessário gerar um **Android App Bundle (AAB)** assinado com uma chave de lançamento e seguir os requisitos atuais do Google Play. Não compartilhe a chave privada nem a senha dela.
