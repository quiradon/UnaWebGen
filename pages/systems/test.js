const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')
const {blog, TextAndImage, MarkdownContent} = require('../../components/blogpost')

function linkReplacer(string) {
    // transforme [link](url) em <a href="url">link</a>
    const regex = /\[(.*?)\]\((.*?)\)/gm
    return string.replace(regex, '<a href="$2">$1</a>')
}

const md = `# Guia Simplificado de Rolagem de Dados e Funções

Este guia explica como usar a notação do RPG Dice Roller para simular rolagens de dados em jogos de RPG. A notação é uma forma de dizer ao sistema quais dados rolar e como modificar os resultados.

## **1\. Como Rolar Dados Básicos**

Para rolar dados, você precisa dizer quantos dados e de que tipo.

### **Quantidade de Dados**

Você pode rolar de 1 a 999 dados de uma vez.

* **Exemplos Válidos:**  
  * d8 (rola 1 dado de 8 lados)  
    * *Exemplo Prático:* Você está a atacar com uma adaga. O mestre pede uma rolagem de d8 para o dano.  
  * 1d10 (rola 1 dado de 10 lados)  
    * *Exemplo Prático:* Você está a tentar um teste de perícia. O mestre pede uma rolagem de 1d10 para determinar o sucesso.  
  * 999d6 (rola 999 dados de 6 lados)  
    * *Exemplo Prático:* Um exército de goblins atira milhares de flechas. O mestre decide simular isso com 999d6 para um dano massivo.  
  * 20d4 \+ 999d10 (rola diferentes tipos de dados e soma os resultados)  
    * *Exemplo Prático:* Um feitiço complexo causa dano de diferentes elementos. O mestre pede 20d4 para o dano de fogo e 999d10 para o dano de energia.  
* **Exemplos Inválidos:**  
  * 0d10 (não pode rolar 0 dados)  
  * 1000d6 (excede o limite de 999 dados)  
  * \-1d20 (não pode rolar um número negativo de dados)

### **Tipos de Dados Padrão (d{n})**

Um dado padrão tem um número positivo de lados (ex: d6, d20). Você pode rolar dados com quase qualquer número de lados.

* **Sintaxe:** d{n}, onde {n} é o número de lados.  
* **Exemplos:**  
  * d6: Rola um dado de 6 lados.  
    * *Exemplo Prático:* Você está a rolar o dano de uma espada curta.  
  * 4d10: Rola quatro dados de 10 lados e soma os resultados.  
    * *Exemplo Prático:* Um poderoso feitiço de bola de fogo causa 4d10 de dano flamejante.

### **Dados Percentil (d%)**

Usado para rolar um número entre 1 e 100\. É um atalho para d100.

* **Exemplo:** 4d%: Rola quatro dados percentil e soma os resultados. É o mesmo que 4d100.  
  * *Exemplo Prático:* Você está a determinar a chance de um evento raro acontecer, onde cada d% representa uma tentativa.

### **Dados Fudge/Fate (dF)**

Estes são dados de 6 lados com faces de menos (-), mais (+) e em branco, que valem \-1, \+1 e 0\.

* **Sintaxe:** dF ou dF.2 (padrão, cada face tem 1/3 de chance).  
* **Variante:** dF.1 (4 faces em branco, 1 \+, 1 \-).  
* **Exemplos:**  
  * dF: Rola um dado Fudge padrão.  
    * *Exemplo Prático:* Você está a fazer um teste de persuasão em Fate, onde o resultado pode ser um sucesso, um fracasso ou um resultado neutro.  
  * 4dF: Rola quatro dados Fudge padrão e soma os resultados.  
    * *Exemplo Prático:* Seu personagem tem uma habilidade que permite rolar 4dF para um teste de agilidade.

## **2\. Modificadores de Rolagem**

Modificadores são "flags" que mudam o resultado ou a forma como os dados são apresentados. Você pode combinar vários modificadores.

### **Ordem dos Modificadores**

Os modificadores são sempre executados numa ordem específica, não importa como você os escreva. Por exemplo, 4d6\!d1 e 4d6d1\! fazem a mesma coisa.

### **Limite de Iterações**

Para evitar problemas, modificadores como "Explosão" ou "Re-rolagem" são limitados a 1000 repetições por rolagem de dado.

### **Ponto de Comparação ({cp})**

Muitos modificadores usam um "Ponto de Comparação" para decidir quando agir. É um operador seguido por um número (ex: \=8).

| Operador | Significado | Exemplo de Uso |
| :---- | :---- | :---- |
| \= | Igual a | d6=3 |
| \!= | Não igual a | d6\!=3 |
| \<\> | Não igual a (alternativo, para evitar composição indesejada com explosão) | d6\<\>3 |
| \< | Menor que | d6\<3 |
| \> | Maior que | d6\>3 |
| \<= | Menor ou igual a | d6\<=3 |
| \>= | Maior ou igual a | d6\>=3 |

**Importante:** Use \<\> para "não igual" com modificadores de explosão (\!). Por exemplo, 2d6\!\<\>4 explode se não for 4\. 2d6\!\!=4 seria diferente.

### **Modificadores Comuns**

| Modificador | Notação | Descrição | Exemplo |
| :---- | :---- | :---- | :---- |
| **Mínimo** | min{n} | Trata rolagens abaixo de n como n. | 4d6min3 (1s e 2s viram 3s) |
| **Máximo** | max{n} | Trata rolagens acima de n como n. | 4d6max3 (4s, 5s e 6s viram 3s) |
| **Explosão** | \!, \!{cp} | Re-rola e adiciona rolagens que atingem o ponto de comparação (padrão: máximo). | 4d10\! (rola novamente se der 10\) |
| **Composição** | \!\!, \!\!{cp} | Igual à explosão, mas combina as rolagens explodidas em um único valor. | 4d10\!\! (se explodir, soma tudo) |
| **Penetração** | \!p, \!\!p, \!p{cp}, \!\!p{cp} | Re-rola o máximo, adiciona o resultado \-1. Pode ser composto. | 2d6\!p (se der 6, re-rola e subtrai 1 do novo resultado) |
| **Re-rolagem** | r, ro, r{cp}, ro{cp} | Re-rola o mínimo (geralmente 1\) até que seja maior. ro re-rola apenas uma vez. | d6r (re-rola 1s até não ser 1\) |
| **Único** | u, uo, u{cp}, uo{cp} | Re-rola valores duplicados até serem únicos. uo re-rola apenas uma vez. | 2d10u (re-rola se os dois dados forem iguais) |
| **Manter** | k{n}, kh{n}, kl{n} | Rola dados e mantém os n resultados mais altos (kh) ou mais baixos (kl). k sozinho mantém os mais altos. | 4d10kh2 (mantém os 2 maiores de 4 d10) |
| **Descartar** | d{n}, dh{n}, dl{n} | Rola dados e descarta os n resultados mais altos (dh) ou mais baixos (dl). d sozinho descarta os mais baixos. | 4d10dl2 (descarta os 2 menores de 4 d10) |
| **Sucesso Alvo** | {cp} | Conta quantos dados atendem a uma condição (ex: 5d10\>=8 conta quantos dados de 10 lados deram 8 ou mais). | 5d10\>=8 |
| **Falha Alvo** | f{cp} | Subtrai 1 do total de sucessos para cada falha. Deve seguir um Sucesso Alvo. | 4d6\>4f\<3 (sucessos \>4, falhas \<3) |
| **Sucesso Crítico** | cs, cs{cp} | **Estético:** Destaca rolagens de sucesso crítico (padrão: máximo). | 2d20cs (destaca 20s em d20) |
| **Falha Crítica** | cf, cf{cp} | **Estético:** Destaca rolagens de falha crítica (padrão: mínimo). | 2d20cf (destaca 1s em d20) |
| **Ordenação** | s, sa, sd | Ordena os resultados dos dados. s ou sa para ascendente, sd para descendente. | 4d6s (ordena os resultados) |

## **3\. Rolagens em Grupo**

Permitem rolar várias expressões de dados e somar os resultados. Modificadores podem ser aplicados ao grupo todo.

### **Sintaxe e Uso**

Use chaves {} para agrupar rolagens, separadas por vírgulas.

* **Exemplos:**  
  * {4d6, 2d10, d4}: Soma os resultados de cada sub-rolagem.  
  * {3d8\*2, 20/2d10}: Permite cálculos dentro das sub-rolagens.

### **Modificadores com Grupos**

Alguns modificadores funcionam de forma diferente com grupos:

* **Manter (k{n}):** Se houver várias sub-rolagens, aplica-se aos *totais das sub-rolagens*, mantendo os mais altos/baixos.  
* **Descartar (d{n}):** Se houver várias sub-rolagens, aplica-se aos *totais das sub-rolagens*, descartando os mais altos/baixos.  
* **Sucesso Alvo ({cp}):** Conta quantos *totais de sub-rolagens* atendem à condição.  
* **Falha Alvo (f{cp}):** Subtrai sucessos com base nos *totais de sub-rolagens* que são falhas.  
* **Ordenação (s):** Ordena os resultados dos dados *e* os totais das sub-rolagens.

## **4\. Descrições de Rolagem**

A documentação não detalha esta parte.

## **5\. Matemática**

Você pode usar operações matemáticas básicas como adição (+), subtração (-), multiplicação (\*), divisão (/) e expoentes (^) com dados ou números.

* **Exemplos:**  
  * 2d8+4  
  * 1d6\*5

## **Conclusão**

O RPG Dice Roller é uma ferramenta poderosa para rolar dados, combinando a notação padrão com recursos avançados. Ele é feito para ser estável e flexível, permitindo simulações de dados complexas e precisas para suas sessões de RPG.`

function page(idioma, rota) {
    const t = idioma
    const sistema = t.posts.sistemas[0]
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.system.default.title.replaceAll("%system%",sistema.card.title)}`,t.system.default.desc.replaceAll("%system%",sistema.card.title),sistema.bg)}
<body>
    ${nav(t, rota)}

    ${blog(t.system.default.title.replaceAll("%system%",sistema.card.title),sistema.tags,sistema.bg,`    
    ${MarkdownContent(md)}
    ${TextAndImage(t.footer.legal,linkReplacer(sistema.legal),sistema.icon,t.system.default.title.replaceAll("%system%",sistema.card.title))}


    `)}

    ${footer(t,rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}