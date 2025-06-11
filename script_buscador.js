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
    const suggestionsDiv = document.querySelector(".searchSuggestions");

    if (!termo.trim()) {
        suggestionsDiv.style.display = "none";
        return;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        const resultados = await buscaInteligente(termo, vetPalavras, vetSkus);
        const fragment = document.createDocumentFragment();

        let k = 0;
        for (const [sku, titulo] of resultados) {
            if (k >= 15) break;

            const urlImagem = `https://www.virtualautopecas.com.br/image/cache/image/catalog/image_${sku}-0-44x44.png`;
            if (await verificarImagem(urlImagem)) {
                k++;
                const link = document.createElement("a");
                link.classList.add("suggestion-item");
                link.href = `https://www.virtualautopecas.com.br/index.php?route=product/product&product_id=${sku}&search=${titulo.replace(/\s/g, "+")}`;
                link.target = "_blank";

                const img = document.createElement("img");
                img.src = urlImagem;

                const text = document.createElement("span");
                text.classList.add("suggestion-text");
                text.textContent = titulo;

                link.append(img, text);
                fragment.appendChild(link);
            }
        }

        suggestionsDiv.innerHTML = "";
        if (k > 0) {
            suggestionsDiv.appendChild(fragment);
            suggestionsDiv.style.display = "block";

            const showAll = document.createElement("div");
            showAll.classList.add("show-all");
            showAll.textContent = "Mostrar tudo";
            showAll.onclick = buscarTudo;
            suggestionsDiv.appendChild(showAll);
        } else {
            suggestionsDiv.style.display = "none";
        }
    }, 250);
};

// Adicionando eventos ao campo de pesquisa
const searchQuery = document.querySelector("[name='searchQuery']");
if (searchQuery) {
    searchQuery.addEventListener("input", () => {
        contadorAtualizacoes = 0;
        clearInterval(intervaloAtualizacao);
        intervaloAtualizacao = setInterval(() => {
            if (contadorAtualizacoes < 1) {
                realizarBusca(searchQuery.value);
                contadorAtualizacoes++;
            } else {
                clearInterval(intervaloAtualizacao);
            }
        }, 2000);
    });

    searchQuery.addEventListener("blur", () => {
        clearInterval(intervaloAtualizacao);
        contadorAtualizacoes = 0;
    });

    searchQuery.addEventListener("keydown", (event) => {
        if (event.key === "Enter") buscarTudo();
    });

    searchQuery.addEventListener("input", () => {
        debounce(() => realizarBusca(searchQuery.value), 300);
    });
}

// Função para buscar todos os produtos
const buscarTudo = () => {
    const termo = searchQuery.value.trim();
    if (!termo) return;
    window.location.href = `https://www.virtualautopecas.com.br/index.php?route=product/search&search=${encodeURIComponent(termo)}`;
};

// Função debounce refinada
const debounce = (func, delay) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
};

console.log("Script carregado com sucesso!");
