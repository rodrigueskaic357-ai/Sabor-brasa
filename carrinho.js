
const CHAVE_CARRINHO = "saborBrasaCarrinho";
const CHAVE_ULTIMO_PEDIDO = "ultimoPedido";

// Buscar produtos salvos
function pegarCarrinho() {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

// Salvar produtos
function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarContador();
}

// Converter preço para número
function converterPreco(preco) {
    return Number(
        preco.replace("R$", "")
             .replace(/\./g, "")
             .replace(",", ".")
             .trim()
    );
}

// Formatar preço
function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Adicionar produto
function adicionarProduto(produto) {
    const carrinho = pegarCarrinho();

    const existente = carrinho.find(
        item => item.codigo === produto.codigo
    );

    if (existente) {
        existente.quantidade++;
    } else {
        produto.quantidade = 1;
        carrinho.push(produto);
    }

    salvarCarrinho(carrinho);

    alert(produto.nome + " foi adicionado ao carrinho!");
}

// Preparar os botões do cardápio
function prepararCardapio() {
    const botoes = document.querySelectorAll(".btn-pedido");

    botoes.forEach(botao => {
        botao.addEventListener("click", function(event) {
            event.preventDefault();

            const cartao = this.closest(".cartao-produto");

            if (!cartao) return;

            const nome = cartao.querySelector("h3").textContent.trim();

            const codigo = cartao.querySelector(".sku")
                .textContent.replace("Código:", "").trim();

            const precoTexto = cartao.querySelector(".preco").textContent.trim();

            const preco = converterPreco(precoTexto);

            const produto = {
                codigo: codigo,
                nome: nome,
                preco: preco
            };

            adicionarProduto(produto);
        });
    });
}

// Atualizar contador do cabeçalho
function atualizarContador() {
    const contador = document.getElementById("contadorCarrinho");

    if (!contador) return;

    const carrinho = pegarCarrinho();

    const quantidade = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    contador.textContent = quantidade;
}

// Mostrar produtos no carrinho
function mostrarCarrinho() {
    const lista = document.getElementById("itensCarrinho");

    if (!lista) return;

    const carrinho = pegarCarrinho();

    lista.innerHTML = "";

    if (carrinho.length === 0) {
        lista.innerHTML = `
            <div class="carrinho-vazio">
                <h3>Seu carrinho está vazio!</h3>
                <p>Escolha seus produtos no cardápio.</p>
                <a href="cardapio.html" class="btn-voltar">
                    Ir para o Cardápio
                </a>
            </div>
        `;

        atualizarTotais(0);
        return;
    }

    let subtotal = 0;

    carrinho.forEach((produto, indice) => {
        const totalProduto = produto.preco * produto.quantidade;

        subtotal += totalProduto;

        const item = document.createElement("div");
        item.className = "item-carrinho";

        const informacoes = document.createElement("div");

        const titulo = document.createElement("h3");
        titulo.textContent = produto.nome;

        const codigo = document.createElement("p");
        codigo.textContent = "Código: " + produto.codigo;

        const preco = document.createElement("p");
        preco.textContent = formatarPreco(produto.preco);

        const total = document.createElement("p");
        total.textContent = "Total: " + formatarPreco(totalProduto);

        informacoes.append(titulo, codigo, preco, total);

        const controles = document.createElement("div");
        controles.className = "controles-quantidade";

        const diminuir = document.createElement("button");
        diminuir.textContent = "-";
        diminuir.type = "button";
        diminuir.addEventListener("click", () => {
            alterarQuantidade(indice, -1);
        });

        const quantidade = document.createElement("span");
        quantidade.textContent = produto.quantidade;

        const aumentar = document.createElement("button");
        aumentar.textContent = "+";
        aumentar.type = "button";
        aumentar.addEventListener("click", () => {
            alterarQuantidade(indice, 1);
        });

        const remover = document.createElement("button");
        remover.textContent = "Remover";
        remover.type = "button";
        remover.className = "btn-remover";
        remover.addEventListener("click", () => {
            removerProduto(indice);
        });

        controles.append(
            diminuir,
            quantidade,
            aumentar,
            remover
        );

        item.append(informacoes, controles);
        lista.appendChild(item);
    });

    atualizarTotais(subtotal);
}

// Atualizar valores
function atualizarTotais(subtotal) {
    const campoSubtotal = document.getElementById("subtotalCarrinho");
    const campoTotal = document.getElementById("totalCarrinho");

    if (campoSubtotal) {
        campoSubtotal.textContent = formatarPreco(subtotal);
    }

    if (campoTotal) {
        campoTotal.textContent = formatarPreco(subtotal);
    }
}

// Alterar quantidade
function alterarQuantidade(indice, valor) {
    const carrinho = pegarCarrinho();

    if (!carrinho[indice]) return;

    carrinho[indice].quantidade += valor;

    if (carrinho[indice].quantidade <= 0) {
        carrinho.splice(indice, 1);
    }

    salvarCarrinho(carrinho);
    mostrarCarrinho();
}

// Remover produto
function removerProduto(indice) {
    const carrinho = pegarCarrinho();

    carrinho.splice(indice, 1);

    salvarCarrinho(carrinho);
    mostrarCarrinho();
}

// Finalizar pedido e abrir confirmação
function finalizarPedido(event) {
    event.preventDefault();

    const carrinho = pegarCarrinho();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const nome = document.getElementById("nomeCliente").value.trim();
    const endereco = document.getElementById("enderecoCliente").value.trim();
    const pagamento = document.getElementById("pagamentoCliente").value;

    if (!nome || !endereco || !pagamento) {
        alert("Preencha todos os campos!");
        return;
    }

    // Calcular valor total
    let total = 0;

    carrinho.forEach(produto => {
        total += produto.preco * produto.quantidade;
    });

    // Gerar número do pedido
    const numeroPedido = Date.now().toString().slice(-6);

    // Criar dados do pedido
    const pedidoFinalizado = {
        numero: numeroPedido,
        nome: nome,
        endereco: endereco,
        pagamento: pagamento,
        produtos: carrinho,
        total: total
    };

    // Salvar pedido no navegador
    localStorage.setItem(
        CHAVE_ULTIMO_PEDIDO,
        JSON.stringify(pedidoFinalizado)
    );

    // Limpar carrinho
    localStorage.removeItem(CHAVE_CARRINHO);

    atualizarContador();

    // Redirecionar para confirmação
    window.location.href = "confirmacao.html";
}

// Iniciar
document.addEventListener("DOMContentLoaded", function() {
    prepararCardapio();
    atualizarContador();
    mostrarCarrinho();

    const formulario = document.getElementById("formFinalizar");

    if (formulario) {
        formulario.addEventListener("submit", finalizarPedido);
    }
});

