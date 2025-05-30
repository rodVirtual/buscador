function buscaBinaria(vetor, palavra) {
    let esquerda = 0;
    let direita = vetor.length - 1;
    while (esquerda <= direita) {
        let meio = Math.floor((esquerda + direita) / 2);
        let dados = vetor[meio].split(";"); // Dividir a string pelos ";"
        let chave = dados[0]; // Primeiro item da string

        if (chave === palavra) {
            return meio; // Retorna o índice da palavra encontrada
        } else if (chave < palavra) {
            esquerda = meio + 1; // Ajusta a busca para a metade direita
        } else {
            direita = meio - 1; // Ajusta a busca para a metade esquerda
        }
    }

    return -1; // Retorna -1 se a palavra não for encontrada
}

function buscaPalavras(vetor, entrada) {
    let palavras = entrada.split(" "); // Separar a entrada em palavras
    let indicesEncontrados = [];

    for (let palavra of palavras) {
        let indice = buscaBinaria(vetor, palavra); // Buscar a palavra no vetor
        if (indice !== -1) {
            indicesEncontrados.push(indice); // Adicionar índice apenas se encontrado
        }
    }

    return indicesEncontrados;
}

function coletarItem(vetorBusca, locaisPalavras, indiceItem) {
    let resultados = [];
    for (let indice of locaisPalavras) {
        let dados = vetorBusca[indice].split(";"); // Explodir novamente a string
        if (indiceItem < dados.length) {
            resultados.push(dados[indiceItem]); // Coletar a informação do índice parametrizado
        } else {
            resultados.push(null); // Caso o índice seja inválido, adiciona null
        }
    }

    return resultados;
}

function separarStrings(arrayDeStrings, separador) {
    return arrayDeStrings.map(str => str.split(separador)); // Divide cada string pelo separador
}

function coletarArrays(vetorBusca, locaisArrays, indiceArrays) {
    // Usa coletarItem para obter os dados do índice especificado
    let dadosExtraidos = coletarItem(vetorBusca, locaisArrays, indiceArrays);

    // Explode as strings usando transformarEmArray para obter um array de arrays
    return separarStrings(dadosExtraidos, ",");
}

function rankear(arr) {
    let n = arr.length;

    // Criar arrays auxiliares para manter os valores e seus índices originais
    let indices = Array.from(Array(n).keys());
    let sortedArr = [...arr];

    // Aplicar QuickSort iterativo
    quickSortIterativo(sortedArr, indices);

    // Retornar os índices ordenados
    return indices;
}

function quickSortIterativo(arr, indices) {
    let stack = [];
    stack.push({ low: 0, high: arr.length - 1 });

    while (stack.length > 0) {
        let { low, high } = stack.pop();
        let pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (arr[j] >= pivot) { // Ordenação descendente
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        [indices[i + 1], indices[high]] = [indices[high], indices[i + 1]];

        let partitionIndex = i + 1;

        if (low < partitionIndex - 1) {
            stack.push({ low, high: partitionIndex - 1 });
        }
        if (partitionIndex + 1 < high) {
            stack.push({ low: partitionIndex + 1, high });
        }
    }
}

function organizaRanking(valores, rank) {
    let result = new Array(valores.length);

    for (let i = 0; i < valores.length; i++) {
        result[i] = valores[rank[i]]; // Organiza o vetor com base no ranking
    }

    return result;
}

function mergeSortedArrays(arr1, arr2, pontos1, pontos2) {
    let i = 0, j = 0;
    let result = [];
    let pontos = [];

    while (i < arr1.length && j < arr2.length) {
        if (Number(arr1[i]) < Number(arr2[j])) {
            result.push(arr1[i]);
            pontos.push(Number(pontos1[i]) + 0);
            i++;
        } else if (Number(arr1[i]) > Number(arr2[j])) {
            result.push(arr2[j]);
            pontos.push(Number(pontos2[j]) + 0);
            j++;
        } else {
            // Se os itens forem iguais, soma os pontos e adiciona apenas uma vez
            result.push(arr1[i]);
            pontos.push(Number(pontos1[i]) + Number(pontos2[j]));
            i++;
            j++;
        }
    }

    // Adiciona os itens restantes do primeiro array, se houver
    while (i < arr1.length) {
        result.push(arr1[i]);
        pontos.push(Number(pontos1[i]) + 0);
        i++;
    }

    // Adiciona os itens restantes do segundo array, se houver
    while (j < arr2.length) {
        result.push(arr2[j]);
        pontos.push(Number(pontos2[j]) + 0);
        j++;
    }

    return [result, pontos]; // Retorna os arrays mesclados
}

function mergeTotal(arraysSkus, arraysPontos) {
    let arr1 = arraysSkus[0];
    let pontos1 = arraysPontos[0];

    for (let i = 1; i < arraysSkus.length; i++) {
        [arr1, pontos1] = mergeSortedArrays(arr1, arraysSkus[i], pontos1, arraysPontos[i]);
    }

    return [arr1, pontos1];
}

function ordenarPorPontuacao(arraySkus, arrayPontos) {
    // Certifica que os pontos são tratados como números antes da ordenação
    let pontosNumericos = arrayPontos.map(Number);

    let numerosTeste = pontosNumericos;
    // Ordenação decrescente usando sort()
    let ordenadoSort = numerosTeste.slice().sort((a, b) => b - a);
    // Obtém o ranking dos pontos do maior para o menor
    let rankPontos = rankear(pontosNumericos);

    // Organiza Skus e pontos com base no ranking
    let skusOrganizado = organizaRanking(arraySkus, rankPontos);

    let pontosOrganizado = organizaRanking(pontosNumericos, rankPontos);

    return [skusOrganizado, pontosOrganizado];
}

function palavrasCoincidentes(busca, lista) {
    const indices = [];

    lista.forEach((item, index) => {
        if (busca.includes(item)) {
            indices.push(index);
        }
    });

    return indices;
}

function escolheTitulo(pesquisa, palavras, mapa, titulos, anos) {
    let ps = pesquisa.split(" "); // Palavras pesquisadas
    let pl = palavras.split(","); // Palavras presentes no SKU
    let mp = mapa.split(","); // Índices dos títulos
    let tt = titulos.split(","); // Índices das palavras nos títulos
    let an = anos.split(","); // Faixa de anos

    let encontradas = palavrasCoincidentes(ps, pl); // Identifica as palavras coincidentes
    let pontos = new Array(tt.length).fill(0); // Inicializa pontuações
    encontradas.forEach(palavra => {
        let lugarespalavra = mp[palavra].split(" "); // Locais das palavras coincidentes
        lugarespalavra.forEach(j => {
            pontos[j] += 1 + 1 / (tt[j].split(" ").length + 1); // Adiciona pontos aos títulos
        });
    });

    // Adicionando pontuação extra se um ano específico estiver na pesquisa
    // Encontrar o ano na entrada
    let ano = ps.find(p => {
        let num = Number(p);
        if (num >= 1900 && num <= 2024) return true; // Ano explícito
        if (num >= 1 && num <= 35) return num + 2000; // De 01 a 35 => Soma 2000
        if (num >= 36 && num <= 99) return num + 1900; // De 36 a 99 => Soma 1900
        return false;
    });

    // Se um ano válido foi encontrado, ajustar pontuação
    if (ano) {
        pontos.forEach((_, i) => {
            let faixa = an[i].split(" ");
            if (Number(ano) >= Number(faixa[0]) && Number(ano) <= Number(faixa[1])) {
                pontos[i] += 1;
            }
        });
    }

    let vencedor = pontos.indexOf(Math.max(...pontos)); // Encontra o título com maior pontuação
    let vencsep = tt[vencedor].split(" "); // Explode o título vencedor
    let escolhido = vencsep.map(i => pl[i]).join(" ") + ` ${an[vencedor].split(" ").join(" a ")}`;

    let pontosExtras = (pontos[vencedor] * 36) / (ps.length + 1); // Ajuste de pontuação global

    return [escolhido, pontosExtras];
}
function capitalizeText(text) {
    const exceptions = ["para", "a", "o", "e", "com", "sem", "da", "de", "do"];
    return text
        .toLowerCase()
        .split(" ")
        .map((word, index) => {
            return exceptions.includes(word) && index !== 0
                ? word
                : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}
function completaTitulos(result, vetorSKUs, buscaUsuario) {

    let titulosCompletos = [];
    let pontuacoesAtuais = [];
    let skus = []

    let limiteResultados = Math.min(100, result[0].length); // Limita a quantidade de resultados
    let pontosExtras = 0;
    for (let i = 0; i < limiteResultados; i++) {
        let resultadinho = vetorSKUs[result[0][i]].split(";")
        let peca = resultadinho[1]; // Segunda coluna do vetorSKUs
        let palavras = resultadinho[2] || ""; // Terceira coluna (quando existe)
        titulosCompletos[i] = peca;
        pontosExtras = 0;
        if (palavras !== "") {
            let mapa = resultadinho[3]; // Quarta coluna
            let titulos = resultadinho[4]; // Quinta coluna
            let anos = resultadinho[5]; // Sexta coluna
            pontosExtras = 0;
            [restoTitulo, pontosExtras] = escolheTitulo(buscaUsuario, palavras, mapa, titulos, anos);
            titulosCompletos[i] += " " + restoTitulo;
        }
        titulosCompletos[i] = capitalizeText(titulosCompletos[i].toLowerCase());
        skus[i] = resultadinho[0];
        pontuacoesAtuais[i] = result[1][i] + pontosExtras;
    }
    let novoRank = rankear(pontuacoesAtuais);

    titulosCompletos = organizaRanking(titulosCompletos, novoRank);
    skus = organizaRanking(skus, novoRank);
    return [skus, titulosCompletos];
}
function unirVetores(vetor1, vetor2) {
    return vetor1.map((item, index) => [item, vetor2[index]]);
}

function buscaInteligente(BuscaUsuario, vetorPalavras, vetorSKUs) {
    // Passo 1: Encontrar os índices das palavras na busca
    let locaisArrays = buscaPalavras(vetorPalavras, BuscaUsuario);

    // Passo 2: Extrair os códigos das palavras encontradas
    let arraysCodigos = coletarArrays(vetorPalavras, locaisArrays, 2);

    // Passo 3: Extrair as pontuações das palavras encontradas
    let arraysPontuacoes = coletarArrays(vetorPalavras, locaisArrays, 4);

    // Passo 4: Consolidar os dados mesclando códigos e pontuações
    let resultados = mergeTotal(arraysCodigos, arraysPontuacoes);

    // Passo 5: Ordenar por relevância
    let resultadosOrdenados = ordenarPorPontuacao(resultados[0], resultados[1]);
    // Passo 6: Completa os titulos com as aplicações
    let titulosProntos = completaTitulos(resultadosOrdenados, vetorSKUs, BuscaUsuario)

    return unirVetores(titulosProntos[0], titulosProntos[1])
}
