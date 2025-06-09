// Verificação de existência das variáveis antes de criá-las
if (typeof vetPalavras === "undefined") {
    var vetPalavras = [];
}
if (typeof vetSkus === "undefined") {
    var vetSkus = [];
}
if (typeof debounceTimeout === "undefined") {
    var debounceTimeout = null;
}
if (typeof tempoEspera === "undefined") {
    var tempoEspera = null;
}
if (typeof intervaloAtualizacao === "undefined") {
    var intervaloAtualizacao = null;
}
if (typeof contadorAtualizacoes === "undefined") {
    var contadorAtualizacoes = 0;
}

// Função para buscar arquivos CSV
async function fetchCSV(url) {
    const response = await fetch(url);
    return response.text();
}

// Inicializa dados das palavras e SKUs
async function initializeData() {
    const palavrasCSV = await fetchCSV("https://raw.githubusercontent.com/rodVirtual/buscador/main/palavras.csv");
    const skusCSV = await fetchCSV("https://raw.githubusercontent.com/rodVirtual/buscador/main/skus.csv");

    vetPalavras = palavrasCSV.split("\n");
    vetSkus = skusCSV.split("\n");
}

initializeData();

// Função para verificar se a imagem existe
function verificarImagem(url) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = function () {
            resolve(true);
        };

        img.onerror = function () {
            resolve(false);
        };

        img.src = url;
    });
}

// Função de busca inteligente com debounce
async function realizarBusca(termo) {
    const suggestionsDiv = document.getElementById("suggestions");

    if (!termo.trim()) {
        suggestionsDiv.style.display = "none";
        return;
    }

    clearTimeout(tempoEspera);
    tempoEspera = setTimeout(async () => {
        const resultados = await buscaInteligente(termo, vetPalavras, vetSkus);
        const fragment = document.createDocumentFragment();

        let k = 0;

        for (const [sku, titulo] of resultados) {
            if (k >= 15) break;

            const url_imagem = `https://www.virtualautopecas.com.br/image/cache/image/catalog/image_${sku}-0-44x44.png`;
            const existe = await verificarImagem(url_imagem);

            if (existe) {
                k++;
                const link = document.createElement("a");
                link.classList.add("suggestion-item");
                link.href = `https://www.virtualautopecas.com.br/index.php?route=product/product&product_id=${sku}&search=${titulo.split(" ").join("+")}`;
                link.target = "_blank";

                const img = document.createElement("img");
                img.src = existe ? url_imagem : "https://via.placeholder.com/44";

                const text = document.createElement("span");
                text.classList.add("suggestion-text");
                text.textContent = titulo;

                link.appendChild(img);
                link.appendChild(text);
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
            showAll.onclick = () => buscarTudo();
            suggestionsDiv.appendChild(showAll);
        } else {
            suggestionsDiv.style.display = "none";
        }
    }, 250);
}

// Evento para iniciar atualização automática ao digitar
document.getElementById("searchBox").addEventListener("input", () => {
    contadorAtualizacoes = 0;
    clearInterval(intervaloAtualizacao);
    intervaloAtualizacao = setInterval(() => {
        if (contadorAtualizacoes < 1) {
            realizarBusca(document.getElementById("searchBox").value);
            contadorAtualizacoes++;
        } else {
            clearInterval(intervaloAtualizacao);
        }
    }, 2000);
});

// Para atualização quando o usuário sai do campo
document.getElementById("searchBox").addEventListener("blur", () => {
    clearInterval(intervaloAtualizacao);
    contadorAtualizacoes = 0;
});

// Função para buscar todos os produtos
function buscarTudo() {
    const termo = document.getElementById("searchBox").value;
    if (!termo.trim()) return;

    const palavrasBusca = termo.split(" ").join("%20");
    window.location.href = `https://www.virtualautopecas.com.br/index.php?route=product/search&search=${palavrasBusca}`;
}

// Função debounce para evitar execuções excessivas
function debounce(func, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
}

document.getElementById("searchBox").addEventListener("input", function () {
    const termo = this.value;
    debounce(() => realizarBusca(termo), 300);
});

document.getElementById("searchBox").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        buscarTudo();
    }
});
