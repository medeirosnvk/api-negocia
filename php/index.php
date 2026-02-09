<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Negociação Amigável - Clara</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script>
        let dialogo = []; // { role: 'user'|'assistant'|'system', text: string, ts: ISOString }
    </script>
    <style>
        #chat-box {
            height: 400px;
            overflow-y: auto;
        }

        .bubble-user {
            background: #dcf8c6;
            align-self: flex-end;
        }

        .bubble-bot {
            background: #f0f0f0;
            align-self: flex-start;
        }
    </style>
</head>

<body class="bg-gray-100 h-screen flex items-center justify-center">

    <div class="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 p-4 text-white flex items-center">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">L</div>
            <div>
                <h1 class="font-bold">LucIA</h1>
                <p class="text-xs opacity-80">Assistente de Negociação</p>
            </div>
        </div>
        <button onclick="gerarRelatorio()"
            class="bg-green-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
            title="Abrir relatório do diálogo em uma nova aba">
            Relatório
        </button>
        <button onclick="limparConversa()" class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded" title="Limpar conversa">
            🗑️ Limpar memória
        </button>
        <!-- Chat Box -->
        <div id="chat-box" class="p-4 flex flex-col space-y-3 bg-gray-50">
            <div class="bubble-bot p-3 rounded-lg text-sm max-w-[80%]">
                Olá! Sou a LucIA. Vi que você possui uma pendência conosco e estou aqui para te ajudar a regularizar isso da melhor forma possível. Como você está hoje?
            </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t flex">
            <input type="text" id="user-input" placeholder="Digite sua mensagem..."
                class="flex-1 border rounded-l-lg p-2 outline-none focus:border-blue-500">
            <button onclick="enviar()" id="btn-enviar" class="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700">
                Enviar
            </button>
        </div>
    </div>

    <script>
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        const btnEnviar = document.getElementById('btn-enviar');

        async function enviar() {
            const msg = userInput.value.trim();
            if (!msg) return;

            // Adiciona mensagem do usuário na tela
            addBubble(msg, 'user');
            userInput.value = '';

            // Bloqueia input enquanto a IA pensa
            userInput.disabled = true;
            btnEnviar.innerText = '...';

            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        mensagem: msg
                    })
                });

                const data = await response.json();
                addBubble(data.resposta, 'bot');

                if (data.status === 'acordo_fechado') {
                    userInput.placeholder = "Acordo formalizado!";
                    userInput.disabled = true;
                    btnEnviar.style.display = 'none';
                }
            } catch (e) {
                addBubble("Ops, tive um probleminha. Pode repetir?", 'bot');
            } finally {
                if (userInput.placeholder !== "Acordo formalizado!") {
                    userInput.disabled = false;
                    btnEnviar.innerText = 'Enviar';
                    userInput.focus();
                }
            }
        }

        function addBubble(text, type, tsIso) {
            const ts = tsIso ? new Date(tsIso) : new Date();
            const iso = ts.toISOString();

            // salva no histórico local
            dialogo.push({
                role: type === 'user' ? 'user' : 'assistant',
                text,
                ts: iso
            });

            const div = document.createElement('div');
            div.className = `p-3 rounded-lg text-sm max-w-[80%] ${type === 'user' ? 'bubble-user' : 'bubble-bot'}`;

            const hora = ts.toLocaleString('pt-BR');
            div.innerHTML = `
                <div style="white-space: pre-wrap;">${escapeHtml(text)}</div>
                <div class="text-[10px] opacity-60 mt-1">${hora}</div>
            `;

            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        async function limparConversa() {
            if (!confirm('Deseja realmente limpar a conversa e começar do zero?')) return;

            // Limpa a sessão no servidor
            await fetch('limpar_sessao.php', {
                method: 'POST'
            });

            // Limpa a tela
            chatBox.innerHTML = '<div class="bubble-bot p-3 rounded-lg text-sm max-w-[80%]">Olá! Sou a LucIA. Vi que você possui uma pendência conosco e estou aqui para te ajudar a regularizar isso da melhor forma possível. Como você está hoje?</div>';

            // Reabilita o input caso estivesse bloqueado
            userInput.disabled = false;
            userInput.placeholder = "Digite sua mensagem...";
            btnEnviar.style.display = 'inline-block';
            btnEnviar.innerText = 'Enviar';
            userInput.focus();
            dialogo = [];
        }

        function escapeHtml(str) {
            return String(str)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');

        }

        function gerarRelatorio() {
            const w = window.open('', '_blank');
            if (!w) {
                alert('Seu navegador bloqueou a nova aba. Permita pop-ups para gerar o relatório.');
                return;
            }

            const linhas = dialogo.map(m => {
                const quando = new Date(m.ts).toLocaleString('pt-BR');
                const quem = m.role === 'user' ? 'Você' : (m.role === 'assistant' ? 'LucIA' : 'Sistema');
                return `
                    <div class="msg ${m.role}">
                        <div class="meta">
                        <span class="who">${escapeHtml(quem)}</span>
                        <span class="when">${escapeHtml(quando)}</span>
                        </div>
                        <div class="text">${escapeHtml(m.text).replaceAll('\n', '<br>')}</div>
                    </div>
                    `;
            }).join('\n');

            const geradoEm = new Date().toLocaleString('pt-BR');

            const html = `
                            <!doctype html>
                            <html lang="pt-br">
                            <head>
                            <meta charset="utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                            <title>Relatório do Diálogo - LucIA</title>
                            <style>
                                body { font-family: Arial, sans-serif; background:#f6f7fb; margin:0; padding:24px; }
                                .wrap { max-width: 900px; margin: 0 auto; }
                                h1 { margin: 0 0 6px 0; font-size: 18px; }
                                .sub { color:#555; margin: 0 0 18px 0; font-size: 12px; }
                                .msg { background:#fff; border:1px solid #e7e7e7; border-radius:10px; padding:12px 12px; margin: 10px 0; }
                                .msg.user { border-left: 4px solid #22c55e; }
                                .msg.assistant { border-left: 4px solid #3b82f6; }
                                .meta { display:flex; justify-content:space-between; gap:12px; color:#666; font-size: 12px; margin-bottom: 8px; }
                                .who { font-weight:700; color:#111; }
                                .text { color:#111; font-size: 14px; line-height: 1.45; white-space: normal; }
                                .actions { margin: 14px 0 0; display:flex; gap:8px; }
                                button { cursor:pointer; border:1px solid #ddd; background:#fff; padding:8px 10px; border-radius:8px; }
                                button:hover { background:#f2f2f2; }
                            </style>
                            </head>
                            <body>
                            <div class="wrap">
                                <h1>Relatório do Diálogo (LucIA)</h1>
                                <p class="sub">Gerado em: ${escapeHtml(geradoEm)}</p>

                                <div class="actions">
                                <button onclick="window.print()">Imprimir / Salvar em PDF</button>
                                <button onclick="navigator.clipboard.writeText(document.body.innerText)">Copiar texto</button>
                                </div>

                                ${linhas || '<div class="msg"><div class="text">Nenhuma mensagem registrada ainda.</div></div>'}
                            </div>
                            </body>
                            </html>`;

            w.document.open();
            w.document.write(html);
            w.document.close();
        }

        // Enviar com Enter
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviar();
        });
    </script>
</body>

</html>