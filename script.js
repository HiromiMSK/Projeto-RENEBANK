// ==========================================================
// CONFIGURAÇÃO INICIAL E DADOS GLOBAIS (STATE)
// ==========================================================
// Em uma aplicação real, estes dados viriam de um Banco de Dados (API).
// Aqui, usamos variáveis para simular a "memória" do banco.

let modoVoz = false; // Controle de acessibilidade
let vozesDisponiveis = [];
let mostrarValores = true; // Botão do "olhinho"
let temaEscuro = false;

// --- LÓGICA FINANCEIRA ---
let saldoCaixinha = 0.00;
let saldoContaCorrente = 0.00;
let dividaAtual = 0.00;
let renePontos = 0;

// Configurações do Cartão de Crédito
const LIMITE_MAXIMO_PERMITIDO = 1000.00;
let limiteUsuario = 1000.00;
let gastosCreditoTotal = 0.00;

const empresasBoleto = ["Companhia de Luz", "Águas do Estado", "Internet Fibra Max"];

// Arrays que funcionam como nosso "Banco de Dados" local
const transacoes = [
    { id: 1, descricao: "Gasto Lazer", valor: -31.00, data: "Agora", origemServico: "Lazer", categoria: "Lazer", tipo: 'debito' },
    { id: 2, descricao: "Uber Eats", valor: -65.50, data: "Hoje", origemServico: "Delivery", categoria: "Alimentação", tipo: 'credito' },
    { id: 6, descricao: "Recebimento", valor: 3500.00, data: "Este mês", origemServico: "Salário", categoria: "Receita", tipo: 'receita' }
];

const investimentos = [
    { ticker: "LCK:T1", nome: "T1 Esports", valor: 1250.40, variacao: 15.2 },
    { ticker: "CBLOL:PNG", nome: "paiN Gaming", valor: 850.20, variacao: 5.4 },
    { ticker: "CBLOL:FUR", nome: "Furia", valor: 420.00, variacao: -1.2 }
];

// ==========================================================
// ACESSIBILIDADE E VOZ (TEXT-TO-SPEECH)
// ==========================================================

// Carrega as vozes do sistema operacional
function carregarVozes() {
    vozesDisponiveis = window.speechSynthesis.getVoices();
}

// Inicializa o sistema de voz
if ('speechSynthesis' in window) {
    carregarVozes();
    window.speechSynthesis.onvoiceschanged = carregarVozes;
}

// Função que faz o navegador "falar" o texto passado
function falar(texto) {
    if (!modoVoz || !texto) return;

    if ('speechSynthesis' in window) {
        if (vozesDisponiveis.length === 0) carregarVozes();
        window.speechSynthesis.cancel(); // Para a fala anterior para não encavalar

        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = 'pt-BR';
        utter.rate = 1.1; // Velocidade da fala

        // Tenta encontrar uma voz PT-BR natural (ex: Google)
        const vozBR = vozesDisponiveis.find(voz => (voz.name.includes('Google') && voz.lang.includes('pt-BR'))) ||
            vozesDisponiveis.find(voz => voz.lang.includes('pt-BR'));

        if (vozBR) utter.voice = vozBR;
        window.speechSynthesis.speak(utter);
    }
}

// Listener do Botão de Acessibilidade
document.getElementById("btn-a11y").addEventListener("click", () => {
    modoVoz = !modoVoz;
    document.body.classList.toggle("acessibilidade-ativa"); // Ativa CSS de alto contraste no foco
    document.getElementById("btn-a11y").classList.toggle("ativo");

    if (modoVoz) {
        carregarVozes();
        falar("Modo de voz ativado. O sistema lerá as ações para você.");
    } else {
        window.speechSynthesis.cancel();
    }
});

// ==========================================================
// FUNÇÕES UTILITÁRIAS
// ==========================================================

// Formata números para dinheiro (R$ 1.000,00)
function formatarValor(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Lógica do Dark Mode (Adiciona classe no body)
function alternarTema() {
    temaEscuro = !temaEscuro;
    const body = document.body;
    if (temaEscuro) {
        body.classList.add('dark-mode');
        falar("Tema escuro ativado.");
    } else {
        body.classList.remove('dark-mode');
        falar("Tema claro ativado.");
    }
}

// ==========================================================
// SISTEMA DE PONTOS (GAMIFICATION)
// ==========================================================

function atualizarPontosUI() {
    document.getElementById('display-pontos').textContent = renePontos;
    document.getElementById('loja-saldo-pontos').textContent = renePontos;
}

function adicionarPontos(qtd, motivo = "") {
    renePontos += qtd;
    atualizarPontosUI();
    // Dispara a notificação (Toast)
    const toast = document.getElementById('toast-notification');
    document.getElementById('toast-msg').textContent = `+${qtd} pontos! (${motivo})`;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
    falar(`Você ganhou ${qtd} Rene points.`);
}

// Controle da Loja (Overlay)
function abrirLoja() {
    document.getElementById("overlay-loja").classList.add("active");
    falar("Bem-vindo à loja de Rene Points.");
}

function fecharLoja() { document.getElementById("overlay-loja").classList.remove("active"); }

function comprarRecompensa(custo, nomeItem) {
    if (renePontos >= custo) {
        if (confirm(`Trocar ${custo} pontos por "${nomeItem}"?`)) {
            renePontos -= custo;
            atualizarPontosUI();
            alert(`Sucesso! Você resgatou: ${nomeItem}`);
        }
    } else {
        alert("Pontos insuficientes.");
    }
}

// ==========================================================
// NAVEGAÇÃO SPA (SINGLE PAGE APPLICATION)
// ==========================================================

// Função que troca as abas escondendo/mostrando DIVs
function ativarTab(tabId) {
    // 1. Remove a classe 'active' de todos os botões e seções
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

    // 2. Adiciona 'active' apenas no alvo clicado
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add("active");

    const sec = document.getElementById(tabId);
    if (sec) {
        sec.classList.add("active");
        falar("Navegando para " + tabId);
    }
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => { ativarTab(btn.getAttribute("data-tab")); });
});

// Atalhos do Header redirecionando para as abas
document.getElementById("btn-pix-header").addEventListener("click", () => ativarTab("pix"));
document.getElementById("btn-boleto-header").addEventListener("click", () => ativarTab("pagar"));
document.getElementById("btn-emprestimo-header").addEventListener("click", () => ativarTab("emprestimos"));
document.getElementById("btn-receber-header").addEventListener("click", simularRecebimento);

// ==========================================================
// LOGIN & SIMULAÇÃO DE FACEID
// ==========================================================

function iniciarFaceID() {
    const overlay = document.getElementById('screen-faceid');
    const status = document.getElementById('faceid-status');

    // Mostra o overlay
    overlay.classList.remove('d-none');
    status.textContent = "Escaneando rosto...";
    falar("Posicione o rosto para o Face ID.");

    // Simula tempo de processamento
    setTimeout(() => { status.textContent = "Analise Biométrica..."; }, 1500);

    // Sucesso
    setTimeout(() => {
        overlay.classList.add('faceid-success');
        status.textContent = "Identidade Confirmada!";
        status.style.color = "#00ff00";
        falar("Identidade confirmada.");
    }, 3000);

    // Fecha e entra
    setTimeout(() => {
        overlay.classList.add('d-none');
        overlay.classList.remove('faceid-success');
        status.style.color = "#fff";
        fazerLogin();
    }, 4000);
}

function fazerLogin() {
    document.getElementById('screen-login').classList.add('d-none');
    document.getElementById('screen-loading').classList.remove('d-none');

    // Simula carregamento de dados do servidor
    setTimeout(() => {
        document.getElementById('screen-loading').classList.add('d-none');
        document.getElementById('app-main').classList.remove('d-none');

        // Inicializa todos os dados na tela
        gerarDadosCartao();
        atualizarExtrato();
        renderizarInvestimentos();
        atualizarCaixinhaUI();
        atualizarSimulacaoEmprestimo();
        atualizarDividaUI();
        atualizarPontosUI();

        falar("Bem vindo ao Rene Bank, Hiro.");
    }, 2000);
}

function fazerLogout() {
    document.getElementById('app-main').classList.add('d-none');
    document.getElementById('screen-login').classList.remove('d-none');
    document.getElementById('input-senha').value = "";
    falar("Logout realizado.");
}

// ==========================================================
// CORE: LÓGICA FINANCEIRA & ATUALIZAÇÃO DE UI
// ==========================================================

// Função do "Olhinho" (Privacidade)
function alternarPrivacidade() {
    mostrarValores = !mostrarValores;
    const icone = mostrarValores ? "👁️" : "🙈";
    document.getElementById("btn-eye-header").querySelector('span').textContent = icone;
    document.getElementById("btn-eye-extrato").querySelector('span').textContent = icone;

    // Recalcula tudo para aplicar ou remover a máscara "••••"
    atualizarExtrato();
    renderizarInvestimentos();
    atualizarCaixinhaUI();
    atualizarDividaUI(); // Faltava essa função, mas a lógica é a mesma
    falar(mostrarValores ? "Valores visíveis" : "Valores ocultos");
}
document.getElementById("btn-eye-header").addEventListener("click", alternarPrivacidade);
document.getElementById("btn-eye-extrato").addEventListener("click", alternarPrivacidade);

// Função auxiliar para atualizar UI da Dívida (estava faltando no código original)
function atualizarDividaUI() {
    document.getElementById("valor-divida").textContent = mostrarValores ? formatarValor(dividaAtual) : "••••";
}

// --- ENGINE PRINCIPAL: EXTRATO ---
// Esta função percorre o array 'transacoes' e calcula tudo dinamicamente
function atualizarExtrato() {
    const lista = document.getElementById("lista-transacoes");
    lista.innerHTML = ""; // Limpa a lista atual

    let tempSaldoCC = 0;
    let tempGastoCredito = 0;
    let totalReceitas = 0;
    let totalGastosGerais = 0;
    const resumo = {}; // Objeto para agrupar categorias

    transacoes.forEach(t => {
        const valorAbs = Math.abs(t.valor);

        // Lógica de Separação: O que é crédito não sai da conta corrente
        if (t.tipo === 'credito') {
            tempGastoCredito += valorAbs;
        } else {
            tempSaldoCC += t.valor;
        }

        if (t.valor < 0) totalGastosGerais += valorAbs;
        else totalReceitas += t.valor;

        // Agrupamento por Categoria para a IA
        if (!resumo[t.categoria]) resumo[t.categoria] = 0;
        resumo[t.categoria] += valorAbs;

        // Renderização do HTML de cada item da lista
        const card = document.createElement("div");
        card.className = "transacao-card";

        let classeValor = "credito";
        let sinal = "+ ";
        if (t.valor < 0) {
            classeValor = "debito";
            sinal = "- ";
            if (t.tipo === 'credito') classeValor = "debito"; // Crédito também é vermelho visualmente
        }

        const tagCredito = t.tipo === 'credito' ? '<span style="font-size:9px; background:#e0e7ff; color:#3730a3; padding:2px 4px; border-radius:4px; margin-right:4px;">CRÉDITO</span>' : '';

        card.innerHTML = `
            <div class="transacao-left">
                <div class="transacao-icon">${t.valor < 0 ? "💸" : "💰"}</div>
                <div class="transacao-info">
                    <span class="transacao-descricao">${t.descricao}</span>
                    <span class="transacao-meta">${t.data} · ${t.origemServico}</span>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <div class="transacao-valor ${classeValor} ${!mostrarValores ? "valor-oculto" : ""}">
                    ${mostrarValores ? sinal + formatarValor(valorAbs) : "••••"}
                </div>
                <div style="margin-top:2px;">
                    ${tagCredito}
                    <span class="categoria-pill">${t.categoria}</span>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });

    // Atualiza Estado Global das variáveis
    saldoContaCorrente = tempSaldoCC;
    gastosCreditoTotal = tempGastoCredito;

    // Atualiza UI Header (Números grandes)
    document.getElementById("saldo-valor").textContent = mostrarValores ? formatarValor(saldoContaCorrente) : "••••";
    document.getElementById("gasto-mes").textContent = mostrarValores ? formatarValor(totalGastosGerais) : "••••";
    document.getElementById("recebido-mes").textContent = mostrarValores ? formatarValor(totalReceitas) : "••••";

    // Atualiza Barra de Limite do Cartão (Visual)
    const porcentagem = Math.min((gastosCreditoTotal / limiteUsuario) * 100, 100);
    const barra = document.getElementById("barra-gastos");
    barra.style.width = mostrarValores ? porcentagem + "%" : "0%";

    // Muda cor da barra se estiver estourando o limite
    if (porcentagem > 90) barra.className = "progress-fill danger";
    else if (porcentagem > 60) barra.className = "progress-fill warning";
    else barra.className = "progress-fill";

    document.getElementById("label-gastos-mes").textContent = mostrarValores ? formatarValor(gastosCreditoTotal) : "••••";
    document.querySelector('.gastos-info span:last-child').textContent = `de ${formatarValor(limiteUsuario)} (Limite)`;

    // Renderiza o Resumo de Categorias (IA)
    const resumoDiv = document.getElementById("resumo-categorias");
    resumoDiv.innerHTML = "";
    Object.keys(resumo).forEach(cat => {
        if (cat === "Receita" || cat === "Empréstimos") return; // Filtra categorias internas
        const box = document.createElement("div");
        box.className = "resumo-item";
        box.innerHTML = `<div class="resumo-label">${cat}</div><div class="resumo-valor">${mostrarValores ? formatarValor(resumo[cat]) : "••••"}</div>`;
        resumoDiv.appendChild(box);
    });
}

function ajustarLimite(novoValor) {
    novoValor = parseFloat(novoValor);
    if (novoValor > LIMITE_MAXIMO_PERMITIDO) {
        novoValor = LIMITE_MAXIMO_PERMITIDO;
        document.getElementById("slider-limite").value = LIMITE_MAXIMO_PERMITIDO;
    }
    limiteUsuario = novoValor;
    document.getElementById("display-limite-usuario").textContent = formatarValor(limiteUsuario);
    atualizarExtrato(); // Recalcula a barra de progresso
}

// --- FUNÇÕES DE SIMULAÇÃO (COMPRA, PIX, BOLETO) ---

function simularCompraCredito() {
    const disponivelNoCredito = limiteUsuario - gastosCreditoTotal;
    const valorCompra = parseFloat((Math.random() * 180 + 20).toFixed(2)); // Valor aleatório entre 20 e 200

    if (valorCompra > disponivelNoCredito) return alert("Limite insuficiente!");

    if (confirm(`Simular compra no CRÉDITO de ${formatarValor(valorCompra)}?`)) {
        // Adiciona ao início do array (unshift)
        transacoes.unshift({
            id: Date.now(),
            descricao: "Compra Loja Física",
            valor: -valorCompra,
            data: "Agora",
            origemServico: "Maquininha",
            categoria: "Compras",
            tipo: 'credito'
        });
        adicionarPontos(10, "Uso Crédito");
        atualizarExtrato();
        alert("Compra Aprovada! ✅");
        falar("Compra no crédito realizada.");
    }
}

function simularRecebimento() {
    const valor = +(Math.random() * 1950 + 50).toFixed(2);
    transacoes.unshift({
        id: Date.now(),
        descricao: "Transferência Recebida",
        valor: valor,
        data: "Agora",
        origemServico: "TED/PIX",
        categoria: "Receita",
        tipo: 'receita'
    });
    alert(`🤑 Recebido ${formatarValor(valor)}`);
    falar(`Você recebeu ${Math.floor(valor)} reais.`);
    atualizarExtrato();
}

function simularPix() {
    const val = parseFloat(document.getElementById("valor-pix").value || "0");
    if (val > saldoContaCorrente) return alert("Saldo insuficiente!");

    transacoes.unshift({
        id: Date.now(),
        descricao: "PIX Enviado",
        valor: -val,
        data: "Agora",
        origemServico: "PIX",
        categoria: "Transferência",
        tipo: 'debito'
    });
    document.getElementById("retorno-pix").style.display = 'block';
    document.getElementById("retorno-pix").textContent = "Sucesso! PIX enviado.";
    adicionarPontos(10, "Pix Realizado");
    atualizarExtrato();
    falar("Pix enviado com sucesso.");
}

let boletoPendente = null;

function buscarBoleto() {
    const codigo = document.getElementById("input-boleto").value;
    if (codigo.length < 5) return alert("Código inválido");

    // Simula busca no servidor
    const nome = empresasBoleto[Math.floor(Math.random() * empresasBoleto.length)];
    const valor = parseFloat((Math.random() * 400 + 50).toFixed(2));

    boletoPendente = { nome, valor };
    document.getElementById("boleto-nome").textContent = nome;
    document.getElementById("boleto-valor").textContent = formatarValor(valor);
    document.getElementById("area-boleto-confirmacao").classList.remove("d-none"); // Mostra área de confirmação
    falar("Boleto encontrado de " + nome);
}

function pagarBoleto() {
    if (!boletoPendente) return;
    if (boletoPendente.valor > saldoContaCorrente) return alert("Saldo insuficiente!");

    transacoes.unshift({
        id: Date.now(),
        descricao: `Pgto ${boletoPendente.nome}`,
        valor: -boletoPendente.valor,
        data: "Agora",
        origemServico: "Boleto",
        categoria: "Contas",
        tipo: 'debito'
    });
    alert("Pago!");
    adicionarPontos(20, "Conta Paga");
    boletoPendente = null;
    document.getElementById("area-boleto-confirmacao").classList.add("d-none");
    atualizarExtrato();
    falar("Pagamento confirmado.");
}

function pagarDivida() {
    if (dividaAtual <= 0) return alert("Sem dívidas!");
    const valorPagar = parseFloat(prompt(`Sua dívida é ${formatarValor(dividaAtual)}. Pagar quanto?`));
    if (isNaN(valorPagar) || valorPagar <= 0) return;
    if (valorPagar > saldoContaCorrente) return alert("Saldo insuficiente.");

    transacoes.unshift({
        id: Date.now(),
        descricao: "Pagamento de Dívida",
        valor: -valorPagar,
        data: "Agora",
        origemServico: "Amortização",
        categoria: "Empréstimos",
        tipo: 'debito'
    });
    dividaAtual -= valorPagar;
    if (dividaAtual < 0) dividaAtual = 0;
    alert("Pagamento realizado!");
    atualizarExtrato();
    atualizarDividaUI();
}

// ==========================================================
// SIMULADORES E CAIXINHA (INVESTIMENTOS)
// ==========================================================

function atualizarSimulacaoEmprestimo() {
    const valor = parseFloat(document.getElementById("slider-emprestimo").value);
    const parcelas = parseInt(document.getElementById("select-parcelas").value);

    // Lógica simples de juros
    let juros = 0;
    if (parcelas === 3) juros = 0.02;
    if (parcelas === 6) juros = 0.05;
    if (parcelas === 12) juros = 0.10;

    const total = valor * (1 + juros);
    const valorParcela = total / parcelas;

    document.getElementById("display-valor-emprestimo").textContent = formatarValor(valor);
    document.getElementById("display-parcela").textContent = formatarValor(valorParcela);
}

function contratarEmprestimo() {
    const valorSolicitado = parseFloat(document.getElementById("slider-emprestimo").value);
    const valorComJuros = valorSolicitado * 1.10; // Juros fixos de simulação
    if (confirm(`Contratar ${formatarValor(valorSolicitado)}?`)) {
        transacoes.unshift({
            id: Date.now(),
            descricao: "Empréstimo Contratado",
            valor: valorSolicitado,
            data: "Agora",
            origemServico: "ReneBank Crédito",
            categoria: "Empréstimos",
            tipo: 'receita'
        });
        dividaAtual += valorComJuros;
        adicionarPontos(50, "Contratação Crédito");
        atualizarExtrato();
        atualizarDividaUI();
        ativarTab("dashboard");
    }
}

function atualizarCaixinhaUI() {
    document.getElementById("valor-caixinha").textContent = mostrarValores ? formatarValor(saldoCaixinha) : "••••";
}

function operarCaixinha(tipo) {
    const input = document.getElementById("input-caixinha");
    const valor = parseFloat(input.value);
    if (!valor || valor <= 0) return alert("Valor inválido.");

    if (tipo === 'depositar') {
        if (valor > saldoContaCorrente) return alert("Saldo insuficiente.");
        // Debita da conta corrente e joga pra caixinha
        transacoes.unshift({
            id: Date.now(),
            descricao: "Guardado na Caixinha",
            valor: -valor,
            data: "Agora",
            origemServico: "Investimento",
            categoria: "Caixinha",
            tipo: 'debito'
        });
        saldoCaixinha += valor;
        adicionarPontos(5, "Investimento");
    } else {
        if (valor > saldoCaixinha) return alert("Saldo insuficiente na caixinha.");
        saldoCaixinha -= valor;
        // Credita na conta corrente
        transacoes.unshift({
            id: Date.now(),
            descricao: "Resgate da Caixinha",
            valor: valor,
            data: "Agora",
            origemServico: "Investimento",
            categoria: "Caixinha",
            tipo: 'receita'
        });
    }
    input.value = "";
    atualizarExtrato();
    atualizarCaixinhaUI();
    falar("Operação na caixinha realizada.");
}

function simularRendimentoCaixinha() {
    if (saldoCaixinha <= 0) return;
    const rendimento = saldoCaixinha * 0.01; // 1%
    saldoCaixinha += rendimento;
    atualizarCaixinhaUI();
    adicionarPontos(2, "Rendimento");
    falar("Sua caixinha rendeu!");
}

function renderizarInvestimentos() {
    const divLista = document.getElementById("lista-investimentos");
    divLista.innerHTML = "";
    investimentos.forEach(item => {
                const card = document.createElement("div");
                card.className = "invest-card";
                const tickerSigla = item.ticker.split(":")[1] || "???";
                const symbol = item.variacao >= 0 ? "▲" : "▼";
                const cssClass = item.variacao >= 0 ? "up" : "down";

                card.innerHTML = `
            <div class="invest-header">
                <div class="transacao-icon invest-icon">${tickerSigla}</div>
                <span class="invest-ticker">${item.ticker}</span>
            </div>
            <div>
                <div class="invest-name">${item.nome}</div>
                <div class="transacao-valor" style="font-size:14px; margin-top:4px;">${mostrarValores ? formatarValor(item.valor) : "••••"}</div>
                ${mostrarValores ? `<div class="variacao ${cssClass}">${symbol} ${Math.abs(item.variacao)}%</div>` : ''}
            </div>
        `;
        divLista.appendChild(card);
    });
}

// ==========================================================
// CHATBOT E INTERAÇÕES COM BOTÕES NO CHAT
// ==========================================================

function toggleChat() {
    const chatScreen = document.getElementById("screen-chat");
    chatScreen.classList.toggle("active");
    if(chatScreen.classList.contains("active")) {
        setTimeout(() => document.getElementById("chat-input").focus(), 300);
        falar("Chat aberto.");
    }
}

function enviarMensagem() {
    const inp = document.getElementById("chat-input");
    const txt = inp.value.trim();
    if (!txt) return;

    // Adiciona msg do usuário
    const chatArea = document.getElementById("chat-messages");
    const uDiv = document.createElement("div");
    uDiv.className = "msg-bubble msg-user";
    uDiv.textContent = txt;
    chatArea.appendChild(uDiv);
    inp.value = "";
    chatArea.scrollTop = chatArea.scrollHeight;

    // Resposta do Robô
    setTimeout(() => {
        const bDiv = document.createElement("div");
        bDiv.className = "msg-bubble msg-bot";
        
        let resp = "Desculpe, não entendi.";
        let acaoBotao = null;
        const t = txt.toLowerCase();

        // Lógica de Palavras-Chave (Simples NLP)
        if (t.includes("saldo")) {
            resp = `Seu saldo líquido é ${formatarValor(saldoContaCorrente)}.`;
        } else if (t.includes("pix")) {
            resp = "Aqui está o atalho para PIX:";
            acaoBotao = { label: "⚡ Ir para Pix", destino: "pix" };
        } else if (t.includes("pagar") || t.includes("boleto")) {
            resp = "Vamos pagar essa conta:";
            acaoBotao = { label: "📄 Pagar Boleto", destino: "pagar" };
        } else if (t.includes("invest") || t.includes("caixinha")) {
            resp = "Veja seus investimentos:";
            acaoBotao = { label: "📈 Ver Caixinha", destino: "investimentos" };
        } else if (t.includes("emprestimo")) {
            resp = "Simule seu crédito aqui:";
            acaoBotao = { label: "💰 Simular", destino: "emprestimos" };
        } else if (t.includes("limite") || t.includes("cartao")) {
            resp = `Seu limite total é ${formatarValor(limiteUsuario)}.`;
            acaoBotao = { label: "💳 Ver Cartão", acaoCustom: 'cartao' };
        }

        bDiv.textContent = resp;
        
        // Criação dinâmica de botões dentro do chat
        if (acaoBotao) {
            const btn = document.createElement("button");
            btn.className = "chat-action-btn";
            btn.textContent = acaoBotao.label;
            btn.onclick = () => {
                if (acaoBotao.acaoCustom === 'cartao') {
                    document.getElementById("overlay-cartao").classList.add("active");
                } else {
                    ativarTab(acaoBotao.destino);
                }
                document.getElementById("screen-chat").classList.remove("active");
            };
            bDiv.appendChild(btn);
        }

        chatArea.appendChild(bDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
        falar(resp);
    }, 600);
}

// Eventos Cartão (Gerador aleatório de números para simulação)
function gerarDadosCartao() {
    const elCvv = document.getElementById("cvv-dinamico");
    const elNum = document.getElementById("numero-cartao");
    if(elCvv && elNum) {
        elCvv.textContent = Math.floor(100 + Math.random() * 900);
        let numero = "5500 ";
        for (let i = 0; i < 3; i++) numero += Math.floor(1000 + Math.random() * 9000) + " ";
        elNum.textContent = numero.trim();
    }
}
document.getElementById("btn-atualizar-cartao").addEventListener("click", gerarDadosCartao);
document.getElementById("btn-voltar-cartao").addEventListener("click", () => document.getElementById("overlay-cartao").classList.remove("active"));
document.getElementById("btn-cartao-header").addEventListener("click", () => document.getElementById("overlay-cartao").classList.add("active"));

// Lógica de "Drag to Scroll" (Arrastar com o mouse para rolar listas horizontais)
const draggables = document.querySelectorAll('.horizontal-scroll, .tabs, .actions-row');
draggables.forEach(slider => {
    let isDown = false;
    let startX, scrollLeft;
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
});
