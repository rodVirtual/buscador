// Inicializando variáveis
let vetPalavras = [];
let vetSkus = [];
let debounceTimeout = null;
let intervaloAtualizacao = null;
let contadorAtualizacoes = 0;

// Função para buscar arquivos CSV
const fetchCSV = async (url) => {
    const response = await fetch(url);
    return response.text();
};

// Inicializando dados das palavras e SKUs
const initializeData = async () => {
    [vetPalavras, vetSkus] = await Promise.all([
        fetchCSV("https://raw.githubusercontent.com/rodVirtual/buscador/main/palavras.csv"),
        fetchCSV("https://raw.githubusercontent.com/rodVirtual/buscador/main/skus.csv")
    ]).then(results => results.map(csv => csv.split("\n")));
};

initializeData();

// Função para verificar existência da imagem
const verificarImagem = (url) => {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

// Função de busca inteligente com debounce
const realizarBusca = async (termo) => {
    const $suggestionsDiv = $(".searchSuggestions");

    if (!termo.trim()) {
        $suggestionsDiv.hide();
        return;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        const resultados = await buscaInteligente(termo, vetPalavras, vetSkus);
        const $fragment = $(document.createDocumentFragment());

        let k = 0;
        for (const [sku, titulo] of resultados) {
            if (k >= 15) break;

            const urlImagem = `https://www.virtualautopecas.com.br/image/cache/image/catalog/image_${sku}-0-44x44.png`;
            if (await verificarImagem(urlImagem)) {
                k++;
                const $link = $("<a>").addClass("suggestion-item").attr({
                    href: `https://www.virtualautopecas.com.br/index.php?route=product/product&product_id=${sku}&search=${titulo.replace(/\s/g, "+")}`,
                    target: "_blank"
                });

                const $img = $("<img>").attr("src", urlImagem);
                const $text = $("<span>").addClass("suggestion-text").text(titulo);

                $link.append($img, $text);
                $fragment.append($link);
            }
        }

        $suggestionsDiv.empty();
        if (k > 0) {
            $suggestionsDiv.append($fragment).show();

            const $showAll = $("<div>").addClass("show-all").text("Mostrar tudo").on("click", buscarTudo);
            $suggestionsDiv.append($showAll);
        } else {
            $suggestionsDiv.hide();
        }
    }, 250);
};

// Eventos ao campo de pesquisa
const $searchQuery = $("[name='searchQuery']");
if ($searchQuery.length) {
    $searchQuery.on("input", () => {
        contadorAtualizacoes = 0;
        clearInterval(intervaloAtualizacao);
        intervaloAtualizacao = setInterval(() => {
            if (contadorAtualizacoes < 1) {
                realizarBusca($searchQuery.val());
                contadorAtualizacoes++;
            } else {
                clearInterval(intervaloAtualizacao);
            }
        }, 2000);
    }).on("blur", () => {
        clearInterval(intervaloAtualizacao);
        contadorAtualizacoes = 0;
    }).on("keydown", (event) => {
        if (event.key === "Enter") buscarTudo();
    }).on("input", () => {
        debounce(() => realizarBusca($searchQuery.val()), 300);
    });
}

// Buscar todos os produtos
const buscarTudo = () => {
    const termo = $searchQuery.val().trim();
    if (!termo) return;
    window.location.href = `https://www.virtualautopecas.com.br/index.php?route=product/search&search=${encodeURIComponent(termo)}`;
};

// Função debounce refinada
const debounce = (func, delay) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
};

console.log("Script carregado com sucesso!");
