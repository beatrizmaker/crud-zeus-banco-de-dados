// ========================================
// CONEXÃO COM SUPABASE
// ========================================

const SUPABASE_URL = "https://vmdedlogemssejkjsygm.supabase.co";
const SUPABASE_KEY = "sb_publishable_kQr5zYJ8TBLgTJhceKJdZA_FCxvyWmf";

const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
    
// ========================================
// ESCOLHA DA COR DA COBRINHA
// ========================================

const botoesCor = document.querySelectorAll(".cor");

let corSelecionada =
    localStorage.getItem("corCobra") ||
    (botoesCor.length > 0 ? botoesCor[0].dataset.cor : "pink");

// Mostrar a cor selecionada

botoesCor.forEach(function(botao) {

    if (botao.dataset.cor === corSelecionada) {
        botao.classList.add("selecionada");
    }

    botao.addEventListener("click", function() {

        corSelecionada = botao.dataset.cor;

        localStorage.setItem("corCobra", corSelecionada);

        botoesCor.forEach(function(outroBotao) {
            outroBotao.classList.remove("selecionada");
        });

        botao.classList.add("selecionada");

    });

});


// ========================================
// CADASTRO DO JOGADOR
// ========================================

const botaoIniciar = document.getElementById("iniciar");

if (botaoIniciar) {

    botaoIniciar.addEventListener("click", function(event) {

        const campoNome = document.getElementById("nomeJogador");
        const nome = campoNome.value.trim();

        if (nome === "") {

            event.preventDefault();

            alert("Digite seu nome antes de jogar!");

            return;

        }

        localStorage.setItem("jogadorAtual", nome);

    });

}


// ========================================
// JOGO DA COBRINHA
// ========================================

const canvas = document.getElementById("canvas");

if (canvas) {

    const ctx = canvas.getContext("2d");

    const tamanho = 20;
    const intervaloMovimento = 120;

    let corCobra = localStorage.getItem("corCobra") || "pink";

    let cobra = [
        {
            x: 300,
            y: 300
        }
    ];

    let cobraAnterior = cobra.map(function(parte) {
        return { x: parte.x, y: parte.y };
    });

    let direcaoX = 0;
    let direcaoY = 0;

    let jogoComecou = false;
    let jogoAtivo = true;

    let pontuacao = 0;

    let ultimoMovimento = 0;

    const elementoPontuacao =
        document.getElementById("pontuacaoTela");

    let morango = {
        x: 100,
        y: 100
    };


    // ========================================
    // CONTROLES DO JOGO
    // ========================================

    document.addEventListener("keydown", function(event) {

        let tecla = event.key.toLowerCase();

        if (["w", "a", "s", "d"].includes(tecla)) {
            event.preventDefault();
        }

        if (!jogoAtivo) {
            return;
        }

        if (tecla === "w" && direcaoY === 0) {

            direcaoX = 0;
            direcaoY = -tamanho;

            jogoComecou = true;

        }

        else if (tecla === "s" && direcaoY === 0) {

            direcaoX = 0;
            direcaoY = tamanho;

            jogoComecou = true;

        }

        else if (tecla === "a" && direcaoX === 0) {

            direcaoX = -tamanho;
            direcaoY = 0;

            jogoComecou = true;

        }

        else if (tecla === "d" && direcaoX === 0) {

            direcaoX = tamanho;
            direcaoY = 0;

            jogoComecou = true;

        }

    });


    // ========================================
    // DESENHAR OS OLHINHOS
    // ========================================

    function desenharOlhos(cabeca) {

        let olho1;
        let olho2;

        // Olhos acompanham a direção da cabeça

        if (direcaoX > 0 || (direcaoX === 0 && direcaoY === 0)) {

            olho1 = { x: cabeca.x + 14, y: cabeca.y + 6 };
            olho2 = { x: cabeca.x + 14, y: cabeca.y + 14 };

        }

        else if (direcaoX < 0) {

            olho1 = { x: cabeca.x + 6, y: cabeca.y + 6 };
            olho2 = { x: cabeca.x + 6, y: cabeca.y + 14 };

        }

        else if (direcaoY < 0) {

            olho1 = { x: cabeca.x + 6, y: cabeca.y + 6 };
            olho2 = { x: cabeca.x + 14, y: cabeca.y + 6 };

        }

        else {

            olho1 = { x: cabeca.x + 6, y: cabeca.y + 14 };
            olho2 = { x: cabeca.x + 14, y: cabeca.y + 14 };

        }

        // Parte branca dos olhos

        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(olho1.x, olho1.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(olho2.x, olho2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas

        let deslocamentoX = direcaoX === 0 ? 0 : Math.sign(direcaoX);
        let deslocamentoY = direcaoY === 0 ? 0 : Math.sign(direcaoY);

        if (direcaoX === 0 && direcaoY === 0) {
            deslocamentoX = 1;
        }

        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.arc(
            olho1.x + deslocamentoX,
            olho1.y + deslocamentoY,
            1.5,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
            olho2.x + deslocamentoX,
            olho2.y + deslocamentoY,
            1.5,
            0,
            Math.PI * 2
        );
        ctx.fill();

    }


    // ========================================
    // DESENHAR A COBRINHA COM MOVIMENTO SUAVE
    // ========================================

    function desenharCobra(progresso) {

        ctx.fillStyle = corCobra;

        cobra.forEach(function(parte, indice) {

            const anterior =
                cobraAnterior[indice] ||
                cobraAnterior[cobraAnterior.length - 1] ||
                parte;

            const x = anterior.x + (parte.x - anterior.x) * progresso;
            const y = anterior.y + (parte.y - anterior.y) * progresso;

            ctx.beginPath();

            ctx.roundRect(
                x + 2,
                y + 2,
                tamanho - 4,
                tamanho - 4,
                6
            );

            ctx.fill();

        });

        // Desenhar os olhos somente na cabeça

        const anterior = cobraAnterior[0] || cobra[0];

        const cabecaAtual = {
            x: anterior.x + (cobra[0].x - anterior.x) * progresso,
            y: anterior.y + (cobra[0].y - anterior.y) * progresso
        };

        desenharOlhos(cabecaAtual);

    }


    // ========================================
    // DESENHAR O MORANGO
    // ========================================

    function desenharMorango() {

        ctx.font = "20px Arial";

        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.fillText(
            "🍓",
            morango.x,
            morango.y
        );

    }


    // ========================================
    // DESENHAR TUDO NA TELA
    // ========================================

    function desenhar(progresso) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        desenharMorango();

        desenharCobra(progresso);

    }


    // ========================================
    // ATUALIZAR O JOGO
    // ========================================

    function atualizar(tempoAtual) {

        if (!jogoAtivo || !jogoComecou) {
            return;
        }

        if (ultimoMovimento === 0) {
            ultimoMovimento = tempoAtual;
            return;
        }

        if (tempoAtual - ultimoMovimento < intervaloMovimento) {
            return;
        }

        // Guardar a posição anterior da cobrinha

        cobraAnterior = cobra.map(function(parte) {
            return { x: parte.x, y: parte.y };
        });

        const novaCabeca = {

            x: cobra[0].x + direcaoX,

            y: cobra[0].y + direcaoY

        };


        // VERIFICAR COLISÃO COM AS PAREDES

        if (
            novaCabeca.x < 0 ||
            novaCabeca.x >= canvas.width ||
            novaCabeca.y < 0 ||
            novaCabeca.y >= canvas.height
        ) {

            gameOver();

            return;

        }


        // VERIFICAR SE COMEU O MORANGO

        const comeuMorango =
            novaCabeca.x === morango.x &&
            novaCabeca.y === morango.y;


        // VERIFICAR COLISÃO COM O PRÓPRIO CORPO

        const corpoVerificado = comeuMorango
            ? cobra
            : cobra.slice(0, -1);

        for (let i = 0; i < corpoVerificado.length; i++) {

            if (
                novaCabeca.x === corpoVerificado[i].x &&
                novaCabeca.y === corpoVerificado[i].y
            ) {

                gameOver();

                return;

            }

        }


        // MOVER A COBRINHA

        cobra.unshift(novaCabeca);


        // VERIFICAR SE COMEU O MORANGO

        if (comeuMorango) {

            pontuacao++;

            if (elementoPontuacao) {

                elementoPontuacao.textContent =
                    "Pontuação: " + pontuacao;

            }

            gerarMorango();

        }

        else {

            cobra.pop();

        }

        ultimoMovimento = tempoAtual;

    }


    // ========================================
    // GERAR NOVO MORANGO
    // ========================================

    function gerarMorango() {

        let posicaoValida = false;

        while (!posicaoValida) {

            morango.x =
                Math.floor(
                    Math.random() * (canvas.width / tamanho)
                ) * tamanho;

            morango.y =
                Math.floor(
                    Math.random() * (canvas.height / tamanho)
                ) * tamanho;

            posicaoValida = true;

            for (let i = 0; i < cobra.length; i++) {

                if (
                    morango.x === cobra[i].x &&
                    morango.y === cobra[i].y
                ) {

                    posicaoValida = false;

                    break;

                }

            }

        }

    }


    // ========================================
    // LER O RANKING SALVO
    // ========================================

async function obterRanking() {

    const { data, error } = await supabaseClient
        .from("ranking")
        .select("nome, pontuacao")
        .order("pontuacao", { ascending: false })
        .limit(1000);

    if (error) {
        console.error("Erro ao buscar ranking:", error);
        return [];
    }

    // Manter somente a melhor pontuação de cada jogador

    const melhores = new Map();

    data.forEach(function(jogador) {

        const chave = jogador.nome.trim().toLowerCase();

        if (
            !melhores.has(chave) ||
            jogador.pontuacao > melhores.get(chave).pontos
        ) {

            melhores.set(chave, {
                nome: jogador.nome,
                pontos: jogador.pontuacao
            });

        }

    });

    return [...melhores.values()]
        .sort(function(a, b) {
            return b.pontos - a.pontos;
        })
        .slice(0, 5);

}


    // ========================================
    // MOSTRAR RANKING NA TELA DE FIM DE JOGO
    // ========================================

    async function mostrarRanking() {

    const lista = document.getElementById("rankingFimLista");

    if (!lista) return;

    lista.innerHTML = "<li>Carregando ranking...</li>";

    const ranking = await obterRanking();

    lista.innerHTML = "";

    if (ranking.length === 0) {

        const item = document.createElement("li");
        item.textContent = "Ainda não há pontuações.";

        lista.appendChild(item);
        return;

    }

    ranking.forEach(function(jogador, indice) {

        const item = document.createElement("li");

        item.textContent =
            (indice + 1) + "º lugar - " +
            jogador.nome + " - " +
            jogador.pontos + " pontos";

        lista.appendChild(item);

    });

}
    // ========================================
    // FIM DE JOGO E SALVAMENTO DA PONTUAÇÃO
    // ========================================

    async function gameOver() {

    if (!jogoAtivo) return;

    jogoAtivo = false;

    const nomeJogador =
        localStorage.getItem("jogadorAtual") || "Jogador";

    try {

        const { error } = await supabaseClient
            .from("ranking")
            .insert([
                {
                    nome: nomeJogador,
                    pontuacao: pontuacao
                }
            ]);

        if (error) throw error;

    }

    catch (erro) {

        console.error("Erro ao salvar pontuação:", erro);

        alert("Não foi possível salvar sua pontuação no ranking.");

    }

    const pontuacaoFinal =
        document.getElementById("pontuacaoFinal");

    if (pontuacaoFinal) {

        pontuacaoFinal.textContent =
            "Sua pontuação: " + pontuacao;

    }

    await mostrarRanking();

    const telaGameOver =
        document.getElementById("gameOver");

    if (telaGameOver) {
        telaGameOver.style.display = "block";
    }

}


    // ========================================
    // BOTÃO REINICIAR
    // ========================================

    const botaoReiniciar =
        document.getElementById("reiniciar");

    if (botaoReiniciar) {

        botaoReiniciar.addEventListener("click", function() {

            location.reload();

        });

    }


    // ========================================
    // ANIMAÇÃO PRINCIPAL
    // ========================================

    function animar(tempoAtual) {

        atualizar(tempoAtual);

        let progresso = 1;

        if (jogoComecou && ultimoMovimento !== 0) {

            progresso = Math.min(
                (tempoAtual - ultimoMovimento) / intervaloMovimento,
                1
            );

        }

        desenhar(progresso);

        requestAnimationFrame(animar);

    }

    requestAnimationFrame(animar);

}


// ========================================
// EXIBIR RANKING EM UMA PÁGINA SEPARADA
// ========================================

const listaRanking = document.getElementById("rankingLista");

if (listaRanking) {

    let ranking = [];

    try {

        ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    }

    catch (erro) {

        ranking = [];

    }

    const mensagemVazia =
        document.getElementById("semResultados");

    if (ranking.length === 0) {

        if (mensagemVazia) {
            mensagemVazia.style.display = "block";
        }

    }

    else {

        ranking.sort(function(a, b) {

            return b.pontos - a.pontos;

        });

        ranking.forEach(function(jogador, indice) {

            const item = document.createElement("li");

            item.textContent =
                (indice + 1) + "º lugar - " +
                jogador.nome + " - " +
                jogador.pontos + " pontos";

            listaRanking.appendChild(item);

        });

    }

}