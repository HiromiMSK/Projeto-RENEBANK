// --- SISTEMA DE VOZ MELHORADO ---
let modoVoz = false;
let vozesDisponiveis = [];

// Carrega as vozes assim que o navegador permitir
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        vozesDisponiveis = window.speechSynthesis.getVoices();
    };
}

function falar(texto) {
    if (!modoVoz || !texto) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = 'pt-BR';
        utter.rate = 1.1;

        if (vozesDisponiveis.length === 0) {
            vozesDisponiveis = window.speechSynthesis.getVoices();
        }

        const vozBR = vozesDisponiveis.find(voz =>
            (voz.name.includes('Google') || voz.name.includes('Microsoft')) && voz.lang.includes('pt-BR')
        ) || vozesDisponiveis.find(voz => voz.lang.includes('pt-BR'));

        if (vozBR) utter.voice = vozBR;

        window.speechSynthesis.speak(utter);
    } else {
        console.error("Browser não suporta voz.");
    }
}

// --- ESTADO GERAL ---
let mostrarValores = true;
let saldoCaixinha = 0.00;
let saldoContaCorrente = 0;
let dividaAtual = 0.00; // NOVO: Variável para controlar a dívida

// --- DADOS INICIAIS ---
const empresasBoleto = ["Companhia de Luz", "Águas do Estado", "Internet Fibra Max"];
const transacoes = [{
    id: 1,
    descricao: "Gasto Lazer",
    valor: -31.00,
    data: "Agora",
    origemServico: "Lazer",
    categoria: "Lazer"
}, {
    id: 2,
    descricao: "Uber Eats",
    valor: -65.50,
    data: "Hoje",
    origemServico: "Delivery",
    categoria: "Alimentação"
}, {
    id: 6,
    descricao: "Recebimento",
    valor: 3500.00,
    data: "Este mês",
    origemServico: "Salário",
    categoria: "Receita"
}];
const investimentos = [{
    ticker: "LCK:T1",
    nome: "T1 Esports",
    valor: 1250.40,
    variacao: 15.2
}, {
    ticker: "CBLOL:PNG",
    nome: "paiN Gaming",
    valor: 850.20,
    variacao: 5.4
}, {
    ticker: "CBLOL:FUR",
    nome: "Furia",
    valor: 420.00,
    variacao: -1.2
}];

function formatarValor(v) {
    return v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// --- SISTEMA DE ABAS E NAVEGAÇÃO ---
function ativarTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add("active");

    const sec = document.getElementById(tabId);
    if (sec) sec.classList.add("active");
    else if (tabId === 'emprestimos') {
        document.getElementById("emprestimos").classList.add("active");
    }
}

// 1. Menu Inferior
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        ativarTab(btn.getAttribute("data-tab"));
        falar("Aba " + btn.textContent + " selecionada");
    });
});

// 2. Botões do Topo
document.getElementById("btn-pix-header").addEventListener("click", () => {
    ativarTab("pix");
    falar("Acessando área Pix");
});

document.getElementById("btn-receber-header").addEventListener("click", () => {
    simularRecebimento();
});

document.getElementById("btn-boleto-header").addEventListener("click", () => {
    ativarTab("pagar");
    falar("Acessando pagamentos de boleto");
});

document.getElementById("btn-emprestimo-header").addEventListener("click", () => {
    ativarTab("emprestimos");
    falar("Acessando simulador de empréstimos");
});

// 3. Cartão
document.getElementById("btn-cartao-header").addEventListener("click", () => {
    document.getElementById("overlay-cartao").classList.add("active");
    falar("Visualizando cartão virtual.");
});
document.getElementById("btn-voltar-cartao").addEventListener("click", () => {
    document.getElementById("overlay-cartao").classList.remove("active");
    falar("Fechando cartão virtual.");
});

// --- LOGOUT LOGIC ---
function fazerLogout() {
    document.getElementById('app-main').classList.add('d-none');
    document.getElementById('screen-login').classList.remove('d-none');
    document.getElementById('input-senha').value = "";
    falar("Saindo do ReneBank. Até logo.");
}

// --- PRIVACIDADE E UI ---
const btnEyeHeader = document.getElementById("btn-eye-header");
const btnEyeExtrato = document.getElementById("btn-eye-extrato");

function alternarPrivacidade() {
    mostrarValores = !mostrarValores;
    const icone = mostrarValores ? "👁️" : "🙈";
    btnEyeHeader.querySelector('span').textContent = icone;
    btnEyeExtrato.querySelector('span').textContent = icone;

    atualizarExtrato();
    renderizarInvestimentos();
    atualizarCaixinhaUI();
    atualizarSimulacaoEmprestimo();
    atualizarDividaUI(); // Atualiza a dívida também
    falar(mostrarValores ? "Valores visíveis" : "Valores ocultos");
}
btnEyeHeader.addEventListener("click", alternarPrivacidade);
btnEyeExtrato.addEventListener("click", alternarPrivacidade);

// --- LÓGICA DE DÍVIDA (NOVO) ---
function atualizarDividaUI() {
    const el = document.getElementById("valor-divida");
    if (el) {
        el.textContent = mostrarValores ? formatarValor(dividaAtual) : "••••";
    }
}

function pagarDivida() {
    if (dividaAtual <= 0) {
        falar("Você não possui dívidas pendentes.");
        return alert("Você não tem dívidas para pagar! 🎉");
    }

    const valorPagar = parseFloat(prompt(`Sua dívida é ${formatarValor(dividaAtual)}. Quanto deseja pagar?`));

    if (isNaN(valorPagar) || valorPagar <= 0) {
        return alert("Valor inválido.");
    }

    if (valorPagar > saldoContaCorrente) {
        falar("Saldo insuficiente na conta corrente.");
        return alert("Saldo insuficiente.");
    }

    let valorRealPago = valorPagar;
    if (valorPagar > dividaAtual) {
        valorRealPago = dividaAtual; // Não paga mais do que deve
    }

    if (confirm(`Confirmar pagamento de ${formatarValor(valorRealPago)} para abater a dívida?`)) {
        // Debita da conta
        transacoes.unshift({
            id: Date.now(),
            descricao: "Pagamento de Dívida",
            valor: -valorRealPago,
            data: "Agora",
            origemServico: "Amortização",
            categoria: "Empréstimos"
        });

        // Abate da dívida
        dividaAtual -= valorRealPago;
        if (dividaAtual < 0) dividaAtual = 0;

        falar(`Pagamento de ${formatarValor(valorRealPago)} realizado.`);
        alert("Pagamento realizado com sucesso!");

        atualizarExtrato();
        atualizarDividaUI();
    }
}

// --- LÓGICA DE EMPRÉSTIMO ---
function atualizarSimulacaoEmprestimo() {
    const valor = parseFloat(document.getElementById("slider-emprestimo").value);
    const parcelas = parseInt(document.getElementById("select-parcelas").value);
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
    // Calcula dívida com 10% de juros base instantâneo
    const valorComJuros = valorSolicitado * 1.10;

    falar(`Contratando empréstimo de ${formatarValor(valorSolicitado)}`);

    if (confirm(`Contratar empréstimo de ${formatarValor(valorSolicitado)}?\nSua dívida total será de ${formatarValor(valorComJuros)}.`)) {
        // Deposita o dinheiro
        transacoes.unshift({
            id: Date.now(),
            descricao: "Empréstimo Contratado",
            valor: valorSolicitado,
            data: "Agora",
            origemServico: "ReneBank Crédito",
            categoria: "Empréstimos"
        });

        // Aumenta a dívida
        dividaAtual += valorComJuros;

        falar("Empréstimo aprovado com sucesso!");
        alert(`Aprovado!`);

        atualizarExtrato();
        atualizarDividaUI();
        ativarTab("dashboard");
    }
}

// --- GASTOS MENSAIS ---
function atualizarGastosMensais(totalGastos) {
    const limite = 2000;
    const porcentagem = Math.min((totalGastos / limite) * 100, 100);
    const barra = document.getElementById("barra-gastos");
    const label = document.getElementById("label-gastos-mes");
    if (mostrarValores) {
        label.textContent = formatarValor(totalGastos);
        label.classList.remove("valor-oculto");
        barra.style.width = porcentagem + "%";
    } else {
        label.textContent = "••••";
        label.classList.add("valor-oculto");
        barra.style.width = "0%";
    }
    barra.className = "progress-fill";
    if (porcentagem > 50) barra.classList.add("warning");
    if (porcentagem > 85) barra.classList.add("danger");
}

// --- SISTEMA BANCARIO ---
function atualizarExtrato() {
    const lista = document.getElementById("lista-transacoes");
    lista.innerHTML = "";
    let saldo = 0;
    let totalGastos = 0;
    let totalReceitas = 0;
    const resumo = {};

    transacoes.forEach(t => {
        saldo += t.valor;
        if (t.valor < 0) totalGastos += Math.abs(t.valor);
        else totalReceitas += t.valor;
        if (!resumo[t.categoria]) resumo[t.categoria] = 0;
        resumo[t.categoria] += Math.abs(t.valor);

        const card = document.createElement("div");
        card.className = "transacao-card";
        const left = document.createElement("div");
        left.className = "transacao-left";
        const icon = document.createElement("div");
        icon.className = "transacao-icon";
        icon.textContent = t.valor < 0 ? "💸" : "💰";
        const info = document.createElement("div");
        info.className = "transacao-info";
        const desc = document.createElement("span");
        desc.className = "transacao-descricao";
        desc.textContent = t.descricao;
        const meta = document.createElement("span");
        meta.className = "transacao-meta";
        meta.textContent = `${t.data} · ${t.origemServico}`;
        info.appendChild(desc);
        info.appendChild(meta);
        left.appendChild(icon);
        left.appendChild(info);
        const right = document.createElement("div");
        right.style.display = "flex";
        right.style.flexDirection = "column";
        right.style.alignItems = "flex-end";
        const valor = document.createElement("div");
        valor.className = "transacao-valor " + (t.valor < 0 ? "debito" : "credito");
        if (mostrarValores) {
            valor.textContent = (t.valor < 0 ? "- " : "+ ") + formatarValor(Math.abs(t.valor));
            valor.classList.remove("valor-oculto");
        } else {
            valor.textContent = "••••";
            valor.classList.add("valor-oculto");
        }
        const cat = document.createElement("span");
        cat.className = "categoria-pill";
        cat.textContent = t.categoria;
        right.appendChild(valor);
        right.appendChild(cat);
        card.appendChild(left);
        card.appendChild(right);
        lista.appendChild(card);
    });
    saldoContaCorrente = saldo;

    const elSaldo = document.getElementById("saldo-valor");
    const elGasto = document.getElementById("gasto-mes");
    const elRecebido = document.getElementById("recebido-mes");
    if (mostrarValores) {
        elSaldo.textContent = formatarValor(saldo);
        elSaldo.classList.remove("valor-oculto");
        elGasto.textContent = formatarValor(totalGastos);
        elRecebido.textContent = formatarValor(totalReceitas);
    } else {
        elSaldo.textContent = "••••";
        elSaldo.classList.add("valor-oculto");
        elGasto.textContent = "••••";
        elRecebido.textContent = "••••";
    }
    const resumoDiv = document.getElementById("resumo-categorias");
    resumoDiv.innerHTML = "";
    Object.keys(resumo).forEach(cat => {
        if (cat === "Receita" || cat === "Empréstimos") return;
        const box = document.createElement("div");
        box.className = "resumo-item";
        const label = document.createElement("div");
        label.className = "resumo-label";
        label.textContent = cat;
        const valor = document.createElement("div");
        valor.className = "resumo-valor";
        valor.textContent = mostrarValores ? formatarValor(resumo[cat]) : "••••";
        box.appendChild(label);
        box.appendChild(valor);
        resumoDiv.appendChild(box);
    });
    atualizarGastosMensais(totalGastos);
}

// --- CAIXINHA & INVEST ---
function atualizarCaixinhaUI() {
    document.getElementById("valor-caixinha").textContent = mostrarValores ? formatarValor(saldoCaixinha) : "••••";
}

function operarCaixinha(tipo) {
    const input = document.getElementById("input-caixinha");
    const valor = parseFloat(input.value);
    if (!valor || valor <= 0) {
        falar("Valor inválido");
        alert("Valor inválido.");
        return;
    }
    if (tipo === 'depositar') {
        if (valor > saldoContaCorrente) {
            falar("Saldo insuficiente na conta");
            alert("Saldo insuficiente.");
            return;
        }
        transacoes.unshift({
            id: Date.now(),
            descricao: "Guardado na Caixinha",
            valor: -valor,
            data: "Agora",
            origemServico: "Investimento",
            categoria: "Caixinha"
        });
        saldoCaixinha += valor;
        falar(`Guardado ${formatarValor(valor)} na caixinha.`);
    } else if (tipo === 'resgatar') {
        if (valor > saldoCaixinha) {
            falar("Saldo insuficiente na caixinha");
            alert("Saldo insuficiente na caixinha.");
            return;
        }
        saldoCaixinha -= valor;
        transacoes.unshift({
            id: Date.now(),
            descricao: "Resgate da Caixinha",
            valor: valor,
            data: "Agora",
            origemServico: "Investimento",
            categoria: "Caixinha"
        });
        falar(`Resgatado ${formatarValor(valor)} da caixinha.`);
    }
    input.value = "";
    atualizarExtrato();
    atualizarCaixinhaUI();
}

function simularRendimentoCaixinha() {
    if (saldoCaixinha <= 0) {
        falar("Caixinha vazia, nada para render.");
        return;
    }
    const rendimento = saldoCaixinha * 0.01;
    saldoCaixinha += rendimento;
    atualizarCaixinhaUI();
    falar(`Rendimento de ${formatarValor(rendimento)} aplicado.`);
}

function renderizarInvestimentos() {
    const divLista = document.getElementById("lista-investimentos");
    divLista.innerHTML = "";
    investimentos.forEach(item => {
        const card = document.createElement("div");
        card.className = "invest-card";
        const tickerSigla = item.ticker.split(":")[1] || "???";
        const header = document.createElement("div");
        header.className = "invest-header";
        const icon = document.createElement("div");
        icon.className = "transacao-icon invest-icon";
        icon.textContent = tickerSigla;
        const ticker = document.createElement("span");
        ticker.className = "invest-ticker";
        ticker.textContent = item.ticker;
        header.appendChild(icon);
        header.appendChild(ticker);
        const body = document.createElement("div");
        const nome = document.createElement("div");
        nome.className = "invest-name";
        nome.textContent = item.nome;
        const valorEl = document.createElement("div");
        valorEl.className = "transacao-valor";
        valorEl.style.fontSize = "14px";
        valorEl.style.marginTop = "4px";
        valorEl.textContent = mostrarValores ? formatarValor(item.valor) : "••••";
        const varEl = document.createElement("div");
        const symbol = item.variacao >= 0 ? "▲" : "▼";
        const cssClass = item.variacao >= 0 ? "up" : "down";
        varEl.className = "variacao " + cssClass;
        varEl.textContent = `${symbol} ${Math.abs(item.variacao)}%`;
        body.appendChild(nome);
        body.appendChild(valorEl);
        if (mostrarValores) body.appendChild(varEl);
        card.appendChild(header);
        card.appendChild(body);
        divLista.appendChild(card);
    });
}

// --- SIMULADORES ---
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
    if (val > saldoContaCorrente) {
        falar("Saldo insuficiente");
        return alert("Saldo insuficiente");
    }
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
    falar("Pix enviado com sucesso!");
    atualizarExtrato();
}
let boletoPendente = null;

function buscarBoleto() {
    const codigo = document.getElementById("input-boleto").value;
    if (codigo.length < 5) {
        falar("Código de barras inválido");
        return alert("Código inválido");
    }
    const nome = empresasBoleto[Math.floor(Math.random() * empresasBoleto.length)];
    const valor = parseFloat((Math.random() * 400 + 50).toFixed(2));
    boletoPendente = {
        nome,
        valor
    };
    document.getElementById("boleto-nome").textContent = nome;
    document.getElementById("boleto-valor").textContent = formatarValor(valor);
    document.getElementById("area-boleto-confirmacao").classList.remove("d-none");
    falar(`Boleto de ${nome} no valor de ${formatarValor(valor)} encontrado.`);
}

function pagarBoleto() {
    if (!boletoPendente) return;
    if (boletoPendente.valor > saldoContaCorrente) {
        falar("Saldo insuficiente para pagar este boleto");
        return alert("Saldo insuficiente");
    }
    transacoes.unshift({
        id: Date.now(),
        descricao: `Pgto ${boletoPendente.nome}`,
        valor: -boletoPendente.valor,
        data: "Agora",
        origemServico: "Boleto",
        categoria: "Contas"
    });
    falar("Boleto pago!");
    alert("Pago!");
    boletoPendente = null;
    document.getElementById("area-boleto-confirmacao").classList.add("d-none");
    atualizarExtrato();
    ativarTab("extrato");
}

// --- LOGIN ---
function fazerLogin() {
    document.getElementById('screen-login').classList.add('d-none');
    document.getElementById('screen-loading').classList.remove('d-none');
    setTimeout(() => {
        document.getElementById('screen-loading').classList.add('d-none');
        document.getElementById('app-main').classList.remove('d-none');

        gerarDadosCartao();
        atualizarExtrato();
        renderizarInvestimentos();
        atualizarCaixinhaUI();
        atualizarSimulacaoEmprestimo();
        atualizarDividaUI(); // Inicia mostrando a dívida

        falar("Bem vindo ao Rene Bank, Hiro. Estamos na tela inicial.");

    }, 2000);
}

// --- CARTAO ---
function gerarDadosCartao() {
    document.getElementById("cvv-dinamico").textContent = Math.floor(100 + Math.random() * 900);
    let numero = "5500 ";
    for (let i = 0; i < 3; i++) {
        numero += Math.floor(1000 + Math.random() * 9000) + " ";
    }
    document.getElementById("numero-cartao").textContent = numero.trim();
}
document.getElementById("btn-atualizar-cartao").addEventListener("click", () => {
    gerarDadosCartao();
    falar("Novo cartão virtual gerado.");
});

// --- CHATBOT INTELIGENTE ---
function toggleChat() {
    const s = document.getElementById("screen-chat");
    s.classList.toggle("active");
    if (s.classList.contains("active")) {
        falar("Chat aberto. Pode me pedir para ir ao Pix ou ver Investimentos.");
        setTimeout(() => document.getElementById("chat-input").focus(), 300);
    } else {
        falar("Chat fechado.");
    }
}

function enviarMensagem() {
    const inp = document.getElementById("chat-input");
    const txt = inp.value;
    if (!txt) return;

    // 1. Cria mensagem do usuário
    const chatArea = document.getElementById("chat-messages");
    const uDiv = document.createElement("div");
    uDiv.className = "msg-bubble msg-user";
    uDiv.textContent = txt;
    chatArea.appendChild(uDiv);

    inp.value = ""; // Limpa input

    // 2. Processa resposta da IA
    setTimeout(() => {
        const bDiv = document.createElement("div");
        bDiv.className = "msg-bubble msg-bot";

        let resp = "Desculpe, não entendi.";
        let acaoBotao = null; // Objeto para guardar a ação

        const t = txt.toLowerCase();

        if (t.includes("saldo") || t.includes("dinheiro")) {
            resp = `Seu saldo atual é ${formatarValor(saldoContaCorrente)}.`;

        } else if (t.includes("pix") || t.includes("transferir")) {
            resp = "Quer fazer um Pix? Use o atalho abaixo:";
            acaoBotao = { label: "⚡ Ir para área Pix", destino: "pix" };

        } else if (t.includes("pagar") || t.includes("boleto") || t.includes("conta")) {
            resp = "Para pagar contas, acesse a área de pagamentos.";
            acaoBotao = { label: "📄 Pagar Boleto", destino: "pagar" };

        } else if (t.includes("invest") || t.includes("render") || t.includes("caixinha")) {
            resp = "Ótima ideia! Vamos fazer seu dinheiro render.";
            acaoBotao = { label: "📈 Ver Investimentos", destino: "investimentos" };

        } else if (t.includes("extrato") || t.includes("gastei") || t.includes("saida")) {
            resp = "Vejas suas últimas movimentações aqui:";
            acaoBotao = { label: "📜 Abrir Extrato", destino: "extrato" };

        } else if (t.includes("emprestimo") || t.includes("credito") || t.includes("divida")) {
            resp = "Precisa de crédito ou pagar dívida? Veja aqui:";
            acaoBotao = { label: "💰 Empréstimos/Dívidas", destino: "emprestimos" };

        } else if (t.includes("cartao") || t.includes("numero")) {
            resp = "Cuidado com seus dados! Veja seu cartão aqui:";
            acaoBotao = { label: "💳 Ver Cartão Virtual", acaoCustom: true };

        } else if (t.includes("oi") || t.includes("ola")) {
            resp = "Olá, Hiro! Digite 'Pix', 'Extrato' ou 'Investir' para eu te levar lá.";
        }

        bDiv.textContent = resp;

        // 3. Se houver uma ação, cria o botão dentro do balão
        if (acaoBotao) {
            const btn = document.createElement("button");
            btn.className = "chat-action-btn";
            btn.textContent = acaoBotao.label;

            btn.onclick = () => {
                // AQUI ESTA A CORREÇÃO DE FECHAR O CHAT:
                if (acaoBotao.acaoCustom) {
                    document.getElementById("overlay-cartao").classList.add("active");
                    falar("Abrindo cartão virtual.");
                } else {
                    ativarTab(acaoBotao.destino);
                    falar(`Navegando para ${acaoBotao.label}`);
                    // Remove a classe .active do chat manualmente
                    document.getElementById("screen-chat").classList.remove("active");
                }
            };
            bDiv.appendChild(btn);
        }

        chatArea.appendChild(bDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
        falar(resp + (acaoBotao ? " Toque no botão para ir." : ""));

    }, 600);
}

// --- ACESSIBILIDADE ---
const btnA11y = document.getElementById("btn-a11y");
btnA11y.addEventListener("click", () => {
    modoVoz = !modoVoz;
    document.body.classList.toggle("acessibilidade-ativa");
    btnA11y.classList.toggle("ativo");

    if (modoVoz) {
        falar("Modo de voz ativado. O Rene Bank está pronto.");
    } else {
        window.speechSynthesis.cancel();
    }
});

window.addEventListener('beforeunload', () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
});

// Scroll Horizontal (Mouse Drag)
const draggables = document.querySelectorAll('.horizontal-scroll, .tabs, .actions-row');
draggables.forEach(slider => {
    let isDown = false;
    let startX;
    let scrollLeft;
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
});
