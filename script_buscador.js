let vetPalavras = [];
let vetSkus = [];
let debounceTimeout;

async function fetchCSV(url) {
    const response = await fetch(url);
    return response.text();
}

async function initializeData() {
    const palavrasCSV = await fetchCSV("https://raw.githubusercontent.com/rodVirtual/buscador/main/palavras.csv");
    const skusCSV = await fetchCSV("https://raw.githubusercontent.com/rodVirtual/buscador/main/skus.csv");

    vetPalavras = palavrasCSV.split("\n");
    vetSkus = skusCSV.split("\n");
}

initializeData();

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

let tempoEspera;

let intervaloAtualizacao;
let contadorAtualizacoes = 0;

async function realizarBusca(termo) {
    const suggestionsDiv = document.getElementById("suggestions");

    if (!termo.trim()) {
        suggestionsDiv.style.display = "none";
        return;
    }

    clearTimeout(tempoEspera);
    tempoEspera = setTimeout(async () => {
        const resultados = await buscaInteligente(termo, vetPalavras, vetSkus);
        suggestionsDiv.innerHTML = ""; // Limpa a lista antes de adicionar novos resultados

        let k = 0;

        for (const [sku, titulo] of resultados) {
            if (k >= 15) break; // Mantém apenas 20 itens visíveis

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
                suggestionsDiv.appendChild(link);
            }
        }

        if (k > 0) {
            suggestionsDiv.style.display = "block";

            const showAll = document.createElement("div");
            showAll.classList.add("show-all");
            showAll.textContent = "Mostrar tudo";
            showAll.onclick = () => buscarTudo();
            suggestionsDiv.appendChild(showAll);
        } else {
            suggestionsDiv.style.display = "none";
        }
    }, 300);
}

// 🔹 Inicia atualização automática após término da digitação (máx. 3 vezes)
document.getElementById("searchBox").addEventListener("input", () => {
    contadorAtualizacoes = 0; // Reset ao digitar
    clearInterval(intervaloAtualizacao);
    intervaloAtualizacao = setInterval(() => {
        if (contadorAtualizacoes < 1) {
            realizarBusca(document.getElementById("searchBox").value);
            contadorAtualizacoes++;
        } else {
            clearInterval(intervaloAtualizacao); // Para após 3 execuções
        }
    }, 2000);
});

// 🔹 Para atualização quando o usuário sai do campo de entrada
document.getElementById("searchBox").addEventListener("blur", () => {
    clearInterval(intervaloAtualizacao);
    contadorAtualizacoes = 0; // Reseta ao perder o foco
});



function buscarTudo() {
    const termo = document.getElementById("searchBox").value;
    if (!termo.trim()) return;

    const palavrasBusca = termo.split(" ").join("%20");
    window.location.href = `https://www.virtualautopecas.com.br/index.php?route=product/search&search=${palavrasBusca}`;
}

function debounce(func, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
}

document.getElementById("searchBox").addEventListener("input", function () {
    const termo = this.value;
    debounce(() => realizarBusca(termo), 300);
});
