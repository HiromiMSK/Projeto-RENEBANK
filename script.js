// ==========================================================
// CONFIGURAÇÃO INICIAL E DADOS GLOBAIS
// ==========================================================

// Variáveis de controle do estado do aplicativo
let modoVoz = false; // Controla se a acessibilidade de voz está ativa
let vozesDisponiveis = []; // Lista de vozes do navegador
let mostrarValores = true; // Controla se o saldo aparece ou fica oculto (****)
let temaEscuro = false; // NOVO: Controla o Dark Mode

// Variáveis financeiras
let saldoCaixinha = 0.00;
let saldoContaCorrente = 0;
let dividaAtual = 0.00;
let renePontos = 0; // Armazena a pontuação do usuário

// Dados simulados (Mock Data) para preencher a tela
const empresasBoleto = ["Companhia de Luz", "Águas do Estado", "Internet Fibra Max"];
const transacoes = [
    { id: 1, descricao: "Gasto Lazer", valor: -31.00, data: "Agora", origemServico: "Lazer", categoria: "Lazer" },
    { id: 2, descricao: "Uber Eats", valor: -65.50, data: "Hoje", origemServico: "Delivery", categoria: "Alimentação" },
    { id: 6, descricao: "Recebimento", valor: 3500.00, data: "Este mês", origemServico: "Salário", categoria: "Receita" }
];
const investimentos = [
    { ticker: "LCK:T1", nome: "T1 Esports", valor: 1250.40, variacao: 15.2 },
    { ticker: "CBLOL:PNG", nome: "paiN Gaming", valor: 850.20, variacao: 5.4 },
    { ticker: "CBLOL:FUR", nome: "Furia", valor: 420.00, variacao: -1.2 }
];

// Carrega as vozes do sistema assim que disponíveis
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        vozesDisponiveis = window.speechSynthesis.getVoices();
    };
}

// ==========================================================
// FUNÇÕES UTILITÁRIAS
// ==========================================================

/**
 * Converte um número para formato de moeda brasileira (R$ 0,00)
 */
function formatarValor(v) {
    return v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/**
 * Função de Texto-para-Fala (Acessibilidade)
 * Lê o texto em voz alta se o modoVoz estiver ativo
 */
function falar(texto) {
    if (!modoVoz || !texto) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Para a fala anterior
        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = 'pt-BR';
        utter.rate = 1.1; // Velocidade um pouco mais rápida
        
        // Tenta encontrar uma voz do Google ou Microsoft em PT-BR
        if (vozesDisponiveis.length === 0) vozesDisponiveis = window.speechSynthesis.getVoices();
        const vozBR = vozesDisponiveis.find(voz => (voz.name.includes('Google') || voz.name.includes('Microsoft')) && voz.lang.includes('pt-BR')) || vozesDisponiveis.find(voz => voz.lang.includes('pt-BR'));
        if (vozBR) utter.voice = vozBR;
        
        window.speechSynthesis.speak(utter);
    }
}

// ==========================================================
// DARK MODE (NOVO)
// ==========================================================

function alternarTema() {
    temaEscuro = !temaEscuro;
    const body = document.body;
    
    // Adiciona ou remove a classe 'dark-mode' do body
    if (temaEscuro) {
        body.classList.add('dark-mode');
        falar("Tema escuro ativado.");
    } else {
        body.classList.remove('dark-mode');
        falar("Tema claro ativado.");
    }
}

// ==========================================================
// RENE POINTS (GAMIFICAÇÃO)
// ==========================================================

function atualizarPontosUI() {
    // Atualiza o número de pontos no header e na loja
    document.getElementById('display-pontos').textContent = renePontos;
    document.getElementById('loja-saldo-pontos').textContent = renePontos;
}

function adicionarPontos(qtd, motivo = "") {
    renePontos += qtd;
    atualizarPontosUI();
    
    // Mostra a notificação flutuante (Toast)
    const toast = document.getElementById('toast-notification');
    document.getElementById('toast-msg').textContent = `+${qtd} pontos! (${motivo})`;
    toast.classList.add('show');
    
    // Esconde a notificação após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
    
    falar(`Você ganhou ${qtd} Rene points.`);
}

// Controle da Loja de Pontos
function abrirLoja() {
    document.getElementById("overlay-loja").classList.add("active");
    falar("Bem-vindo à loja de Rene Points.");
}
function fecharLoja() {
    document.getElementById("overlay-loja").classList.remove("active");
}
function comprarRecompensa(custo, nomeItem) {
    if (renePontos >= custo) {
        if(confirm(`Trocar ${custo} pontos por "${nomeItem}"?`)) {
            renePontos -= custo;
            atualizarPontosUI();
            alert(`Sucesso! Você resgatou: ${nomeItem}`);
            falar(`Resgate de ${nomeItem} realizado.`);
        }
    } else {
        alert("Pontos insuficientes para este item.");
        falar("Pontos insuficientes.");
    }
}

// ==========================================================
// NAVEGAÇÃO E ABAS
// ==========================================================

function ativarTab(tabId) {
    // Remove classe 'active' de todos os botões e seções
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    
    // Adiciona 'active' apenas no clicado
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add("active");
    
    const sec = document.getElementById(tabId);
    if (sec) sec.classList.add("active");
}

// Adiciona eventos de clique nos botões do menu inferior
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        ativarTab(btn.getAttribute("data-tab"));
        falar("Aba " + btn.textContent + " selecionada");
    });
});

// Eventos dos botões do topo (Atalhos)
document.getElementById("btn-pix-header").addEventListener("click", () => { ativarTab("pix"); falar("Área Pix"); });
document.getElementById("btn-boleto-header").addEventListener("click", () => { ativarTab("pagar"); falar("Pagamentos"); });
document.getElementById("btn-emprestimo-header").addEventListener("click", () => { ativarTab("emprestimos"); falar("Empréstimos"); });
document.getElementById("btn-receber-header").addEventListener("click", simularRecebimento);

// ==========================================================
// LÓGICA DE LOGIN E SEGURANÇA
// ==========================================================

// Simulação do FaceID com animações
function iniciarFaceID() {
    const overlay = document.getElementById('screen-faceid');
    const status = document.getElementById('faceid-status');
    
    overlay.classList.remove('d-none');
    status.textContent = "Escaneando rosto...";
    falar("Posicione o rosto.");
    
    // Delay simulado
    setTimeout(() => { status.textContent = "Analise Biométrica..."; }, 1500);

    // Sucesso
    setTimeout(() => {
        overlay.classList.add('faceid-success');
        status.textContent = "Identidade Confirmada!";
        status.style.color = "#00ff00";
        falar("Identidade confirmada.");
    }, 3000);

    // Entra no app
    setTimeout(() => {
        overlay.classList.add('d-none');
        overlay.classList.remove('faceid-success');
        status.style.color = "#fff";
        fazerLogin();
    }, 4000);
}

function fazerLogin() {
    // Esconde login, mostra loading
    document.getElementById('screen-login').classList.add('d-none');
    document.getElementById('screen-loading').classList.remove('d-none');
    
    // Após 2s, mostra o app principal
    setTimeout(() => {
        document.getElementById('screen-loading').classList.add('d-none');
        document.getElementById('app-main').classList.remove('d-none');
        
        // Inicializa dados
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
    falar("Saindo do ReneBank.");
}

// ==========================================================
// FUNCIONALIDADES DO APP
// ==========================================================

// Alternar visualização de valores (Olho)
function alternarPrivacidade() {
    mostrarValores = !mostrarValores;
    const btnEyeHeader = document.getElementById("btn-eye-header");
    const btnEyeExtrato = document.getElementById("btn-eye-extrato");
    
    const icone = mostrarValores ? "👁️" : "🙈";
    btnEyeHeader.querySelector('span').textContent = icone;
    btnEyeExtrato.querySelector('span').textContent = icone;
    
    // Atualiza todas as UIs que mostram dinheiro
    atualizarExtrato();
    renderizarInvestimentos();
    atualizarCaixinhaUI();
    atualizarSimulacaoEmprestimo();
    atualizarDividaUI();
    
    falar(mostrarValores ? "Valores visíveis" : "Valores ocultos");
}
document.getElementById("btn-eye-header").addEventListener("click", alternarPrivacidade);
document.getElementById("btn-eye-extrato").addEventListener("click", alternarPrivacidade);

// --- DÍVIDAS ---
function atualizarDividaUI() {
    const el = document.getElementById("valor-divida");
    if (el) el.textContent = mostrarValores ? formatarValor(dividaAtual) : "••••";
}

function pagarDivida() {
    if (dividaAtual <= 0) return alert("Você não tem dívidas para pagar! 🎉");
    const valorPagar = parseFloat(prompt(`Sua dívida é ${formatarValor(dividaAtual)}. Quanto deseja pagar?`));
    
    if (isNaN(valorPagar) || valorPagar <= 0) return alert("Valor inválido.");
    if (valorPagar > saldoContaCorrente) return alert("Saldo insuficiente.");

    // Evita pagar mais do que deve
    let valorRealPago = (valorPagar > dividaAtual) ? dividaAtual : valorPagar;
    
    if (confirm(`Confirmar pagamento de ${formatarValor(valorRealPago)}?`)) {
        transacoes.unshift({
            id: Date.now(),
            descricao: "Pagamento de Dívida",
            valor: -valorRealPago,
            data: "Agora",
            origemServico: "Amortização",
            categoria: "Empréstimos"
        });
        dividaAtual -= valorRealPago;
        if (dividaAtual < 0) dividaAtual = 0;
        
        alert("Pagamento realizado!");
        adicionarPontos(30, "Pagamento em dia"); // Ganha pontos
        atualizarExtrato();
        atualizarDividaUI();
    }
}

// --- EMPRÉSTIMO ---
function atualizarSimulacaoEmprestimo() {
    const valor = parseFloat(document.getElementById("slider-emprestimo").value);
    const parcelas = parseInt(document.getElementById("select-parcelas").value);
    
    // Cálculo simples de juros baseados no número de parcelas
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
    const valorComJuros = valorSolicitado * 1.10; // Juros fixo de contratação

    if (confirm(`Contratar empréstimo de ${formatarValor(valorSolicitado)}?\nSua dívida total será de ${formatarValor(valorComJuros)}.`)) {
        transacoes.unshift({
            id: Date.now(),
            descricao: "Empréstimo Contratado",
            valor: valorSolicitado,
            data: "Agora",
            origemServico: "ReneBank Crédito",
            categoria: "Empréstimos"
        });
        dividaAtual += valorComJuros;
        adicionarPontos(50, "Contratação Crédito");
        alert(`Aprovado! +50 Pontos`);
        atualizarExtrato();
        atualizarDividaUI();
        ativarTab("dashboard");
    }
}

// --- EXTRATO E GRÁFICOS ---
function atualizarExtrato() {
    const lista = document.getElementById("lista-transacoes");
    lista.innerHTML = "";
    let saldo = 0;
    let totalGastos = 0;
    let totalReceitas = 0;
    const resumo = {};

    // Recalcula todo o saldo baseado no histórico
    transacoes.forEach(t => {
        saldo += t.valor;
        if (t.valor < 0) totalGastos += Math.abs(t.valor);
        else totalReceitas += t.valor;
        
        // Agrupa por categoria para o gráfico
        if (!resumo[t.categoria]) resumo[t.categoria] = 0;
        resumo[t.categoria] += Math.abs(t.valor);

        // Cria o elemento HTML da transação
        const card = document.createElement("div");
        card.className = "transacao-card";
        
        // Formatação HTML do card de transação
        card.innerHTML = `
            <div class="transacao-left">
                <div class="transacao-icon">${t.valor < 0 ? "💸" : "💰"}</div>
                <div class="transacao-info">
                    <span class="transacao-descricao">${t.descricao}</span>
                    <span class="transacao-meta">${t.data} · ${t.origemServico}</span>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <div class="transacao-valor ${t.valor < 0 ? "debito" : "credito"} ${!mostrarValores ? "valor-oculto" : ""}">
                    ${mostrarValores ? (t.valor < 0 ? "- " : "+ ") + formatarValor(Math.abs(t.valor)) : "••••"}
                </div>
                <span class="categoria-pill">${t.categoria}</span>
            </div>
        `;
        lista.appendChild(card);
    });
    
    saldoContaCorrente = saldo;
    
    // Atualiza cabeçalho
    document.getElementById("saldo-valor").textContent = mostrarValores ? formatarValor(saldo) : "••••";
    document.getElementById("gasto-mes").textContent = mostrarValores ? formatarValor(totalGastos) : "••••";
    document.getElementById("recebido-mes").textContent = mostrarValores ? formatarValor(totalReceitas) : "••••";

    // Atualiza Resumo por Categorias (Gráfico de texto)
    const resumoDiv = document.getElementById("resumo-categorias");
    resumoDiv.innerHTML = "";
    Object.keys(resumo).forEach(cat => {
        if (cat === "Receita" || cat === "Empréstimos") return;
        const box = document.createElement("div");
        box.className = "resumo-item";
        box.innerHTML = `<div class="resumo-label">${cat}</div><div class="resumo-valor">${mostrarValores ? formatarValor(resumo[cat]) : "••••"}</div>`;
        resumoDiv.appendChild(box);
    });

    // Atualiza barra de progresso de gastos
    const limite = 2000;
    const porcentagem = Math.min((totalGastos / limite) * 100, 100);
    const barra = document.getElementById("barra-gastos");
    barra.style.width = mostrarValores ? porcentagem + "%" : "0%";
    
    if (porcentagem > 50) barra.className = "progress-fill warning";
    if (porcentagem > 85) barra.className = "progress-fill danger";
    else if (porcentagem <= 50) barra.className = "progress-fill";
    
    document.getElementById("label-gastos-mes").textContent = mostrarValores ? formatarValor(totalGastos) : "••••";
}

// --- PIX & BOLETO ---
function simularRecebimento() {
    const valor = +(Math.random() * 1950 + 50).toFixed(2);
    transacoes.unshift({
        id: Date.now(),
        descricao: "Transferência Recebida",
        valor: valor,
        data: "Agora",
        origemServico: "TED/PIX",
        categoria: "Receita"
    });
    falar(`Você recebeu ${Math.floor(valor)} reais.`);
    alert(`🤑 Oba! Você recebeu ${formatarValor(valor)}`);
    atualizarExtrato();
    ativarTab("extrato");
}

function simularPix() {
    const val = parseFloat(document.getElementById("valor-pix").value || "0");
    if (val > saldoContaCorrente) return alert("Saldo insuficiente");
    transacoes.unshift({
        id: Date.now(),
        descricao: "PIX Enviado",
        valor: -val,
        data: "Agora",
        origemServico: "PIX",
        categoria: "Transferência"
    });
    document.getElementById("retorno-pix").style.display = 'block';
    document.getElementById("retorno-pix").textContent = "Sucesso! PIX enviado.";
    adicionarPontos(10, "Pix Realizado");
    atualizarExtrato();
}

let boletoPendente = null;
function buscarBoleto() {
    const codigo = document.getElementById("input-boleto").value;
    if (codigo.length < 5) return alert("Código inválido");
    const nome = empresasBoleto[Math.floor(Math.random() * empresasBoleto.length)];
    const valor = parseFloat((Math.random() * 400 + 50).toFixed(2));
    boletoPendente = { nome, valor };
    document.getElementById("boleto-nome").textContent = nome;
    document.getElementById("boleto-valor").textContent = formatarValor(valor);
    document.getElementById("area-boleto-confirmacao").classList.remove("d-none");
}

function pagarBoleto() {
    if (!boletoPendente) return;
    if (boletoPendente.valor > saldoContaCorrente) return alert("Saldo insuficiente");
    transacoes.unshift({
        id: Date.now(),
        descricao: `Pgto ${boletoPendente.nome}`,
        valor: -boletoPendente.valor,
        data: "Agora",
        origemServico: "Boleto",
        categoria: "Contas"
    });
    alert("Pago!");
    adicionarPontos(20, "Conta Paga");
    boletoPendente = null;
    document.getElementById("area-boleto-confirmacao").classList.add("d-none");
    atualizarExtrato();
    ativarTab("extrato");
}

// --- INVESTIMENTOS ---
function atualizarCaixinhaUI() {
    document.getElementById("valor-caixinha").textContent = mostrarValores ? formatarValor(saldoCaixinha) : "••••";
}

function operarCaixinha(tipo) {
    const input = document.getElementById("input-caixinha");
    const valor = parseFloat(input.value);
    if (!valor || valor <= 0) return alert("Valor inválido.");
    
    if (tipo === 'depositar') {
        if (valor > saldoContaCorrente) return alert("Saldo insuficiente.");
        transacoes.unshift({
            id: Date.now(),
            descricao: "Guardado na Caixinha",
            valor: -valor,
            data: "Agora",
            origemServico: "Investimento",
            categoria: "Caixinha"
        });
        saldoCaixinha += valor;
        adicionarPontos(5, "Investimento");
    } else {
        if (valor > saldoCaixinha) return alert("Saldo insuficiente na caixinha.");
        saldoCaixinha -= valor;
        transacoes.unshift({
            id: Date.now(),
            descricao: "Resgate da Caixinha",
            valor: valor,
            data: "Agora",
            origemServico: "Investimento",
            categoria: "Caixinha"
        });
    }
    input.value = "";
    atualizarExtrato();
    atualizarCaixinhaUI();
}

function simularRendimentoCaixinha() {
    if (saldoCaixinha <= 0) return;
    const rendimento = saldoCaixinha * 0.01;
    saldoCaixinha += rendimento;
    atualizarCaixinhaUI();
    adicionarPontos(2, "Rendimento");
    falar(`Rendimento aplicado.`);
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
// CHATBOT E CARTÃO
// ==========================================================

function toggleChat() {
    const s = document.getElementById("screen-chat");
    s.classList.toggle("active");
    if (s.classList.contains("active")) {
        setTimeout(() => document.getElementById("chat-input").focus(), 300);
        falar("Chat aberto.");
    }
}

function enviarMensagem() {
    const inp = document.getElementById("chat-input");
    const txt = inp.value;
    if (!txt) return;

    // Adiciona mensagem do usuário
    const chatArea = document.getElementById("chat-messages");
    const uDiv = document.createElement("div");
    uDiv.className = "msg-bubble msg-user";
    uDiv.textContent = txt;
    chatArea.appendChild(uDiv);
    inp.value = "";

    // Resposta da IA (Simulada)
    setTimeout(() => {
        const bDiv = document.createElement("div");
        bDiv.className = "msg-bubble msg-bot";
        let resp = "Desculpe, não entendi.";
        let acaoBotao = null;
        const t = txt.toLowerCase();

        if (t.includes("saldo")) {
            resp = `Seu saldo atual é ${formatarValor(saldoContaCorrente)}.`;
        } else if (t.includes("pix")) {
            resp = "Use o atalho abaixo para Pix:";
            acaoBotao = { label: "⚡ Ir para Pix", destino: "pix" };
        } else if (t.includes("pontos") || t.includes("loja")) {
             resp = `Você tem ${renePontos} pontos. Quer ir para a loja?`;
             acaoBotao = { label: "🎁 Abrir Loja", acaoCustom: 'loja' };
        } else if (t.includes("pagar") || t.includes("boleto")) {
            resp = "Para pagar contas, acesse aqui:";
            acaoBotao = { label: "📄 Pagar Boleto", destino: "pagar" };
        } else if (t.includes("invest")) {
            resp = "Vamos fazer seu dinheiro render.";
            acaoBotao = { label: "📈 Ver Investimentos", destino: "investimentos" };
        } else if (t.includes("cartao")) {
            resp = "Veja seu cartão aqui:";
            acaoBotao = { label: "💳 Ver Cartão", acaoCustom: 'cartao' };
        }

        bDiv.textContent = resp;
        
        // Cria botão de ação dentro do chat
        if (acaoBotao) {
            const btn = document.createElement("button");
            btn.className = "chat-action-btn";
            btn.textContent = acaoBotao.label;
            btn.onclick = () => {
                if (acaoBotao.acaoCustom === 'cartao') {
                    document.getElementById("overlay-cartao").classList.add("active");
                } else if (acaoBotao.acaoCustom === 'loja') {
                    abrirLoja();
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

// Cartão Virtual
function gerarDadosCartao() {
    document.getElementById("cvv-dinamico").textContent = Math.floor(100 + Math.random() * 900);
    let numero = "5500 ";
    for (let i = 0; i < 3; i++) numero += Math.floor(1000 + Math.random() * 9000) + " ";
    document.getElementById("numero-cartao").textContent = numero.trim();
}
document.getElementById("btn-atualizar-cartao").addEventListener("click", () => {
    gerarDadosCartao();
    falar("Novo cartão virtual gerado.");
});

document.getElementById("btn-cartao-header").addEventListener("click", () => {
    document.getElementById("overlay-cartao").classList.add("active");
    falar("Visualizando cartão virtual.");
});
document.getElementById("btn-voltar-cartao").addEventListener("click", () => {
    document.getElementById("overlay-cartao").classList.remove("active");
});

// Acessibilidade Botão
document.getElementById("btn-a11y").addEventListener("click", () => {
    modoVoz = !modoVoz;
    document.body.classList.toggle("acessibilidade-ativa");
    document.getElementById("btn-a11y").classList.toggle("ativo");
    if (modoVoz) falar("Modo de voz ativado.");
    else window.speechSynthesis.cancel();
});

// Scroll Horizontal (Drag com Mouse)
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
