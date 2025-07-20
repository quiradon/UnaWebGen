const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')
const {blog, TextAndImage, MarkdownContent} = require('../../components/blogpost')

function linkReplacer(string) {
    // transforme [link](url) em <a href="url">link</a>
    const regex = /\[(.*?)\]\((.*?)\)/gm
    return string.replace(regex, '<a href="$2">$1</a>')
}

const md = `
Este guia ensina a usar a notação de rolagem de dados para simular jogadas de RPG de forma rápida e eficiente. Pense nisso como uma "linguagem" para falar com o rolador de dados.

## **O Básico: A Fórmula da Rolagem**

A maioria das rolagens segue uma fórmula simples: QdL

* **Q:** A **Q**uantidade de dados que você quer rolar. Se omitido, o padrão é 1 (ex: d20 é o mesmo que 1d20).  
* **d:** Um separador literal que significa "dado".  
* **L:** O número de **L**ados que o dado tem (ex: 6, 10, 20).

**Exemplos Práticos:**

* d20: Rola 1 dado de 20 lados. Perfeito para um teste de ataque ou perícia.  
* 2d6: Rola 2 dados de 6 lados e soma os resultados. Comum para o dano de uma espada grande.  
* 8d10: Rola 8 dados de 10 lados e soma tudo. O dano de uma poderosa Bola de Fogo\!

### **Adicionando Matemática**

Você pode realizar operações matemáticas simples diretamente na sua rolagem.

- \+ (Adição)  
- \- (Subtração)  
- \* (Multiplicação)  
 \/ (Divisão)

**Exemplos Práticos:**

* d20+5: Rola um d20 e adiciona 5 ao resultado. Ótimo para um ataque com seu bônus de Força.  
* 2d6-1: Rola dois d6, soma-os e subtrai 1 do total.

## **Modificadores: Turbine Suas Rolagens**

Depois de dominar o básico, você pode turbinar suas rolagens com modificadores. Eles são comandos especiais que alteram os resultados e são adicionados ao final da fórmula.

### **Ponto de Comparação (\>, \<, \=)**

Muitos modificadores precisam de uma condição para funcionar, e para isso usamos operadores de comparação seguidos de um número. Pense nisso como uma regra (ex: 'maior que 7' ou 'igual a 1'). Você verá essa estrutura, chamada de 'ponto de comparação' ou {cp}, em comandos como re-rolagem (r\>7) ou contagem de sucessos (\>=8).

| Operador | Significado |
| :---- | :---- |
| \> | Maior que |
| \< | Menor que |
| \>= | Maior ou igual a |
| \<= | Menor ou igual a |
| \= | Igual a |
| \!= ou \<\> | Diferente de |

### **Filtrando Resultados: Manter e Descartar**

Útil para mecânicas de vantagem/desvantagem ou para criar personagens.

* **Manter (k ou kh / kl)**: Rola vários dados e **mantém** apenas os melhores ou piores.  
  * kh (Keep Highest): Mantém os **N** mais altos. k é um atalho para kh.  
  * kl (Keep Lowest): Mantém os **N** mais baixos.  
* **Descartar (d ou dh / dl)**: Rola vários dados e **descarta** os melhores ou piores.  
  * dl (Drop Lowest): Descarta os **N** mais baixos. d é um atalho para dl.  
  * dh (Drop Highest): Descarta os **N** mais altos.

**Exemplos Práticos:**

* 2d20kh1: Rola 2d20 e mantém o resultado mais alto (simula **Vantagem**).  
* 2d20kl1: Rola 2d20 e mantém o resultado mais baixo (simula **Desvantagem**).  
* 4d6dl1: Rola 4d6 e descarta o menor resultado. Um método clássico para gerar atributos de personagem.

### **Manipulando Dados: Explodir e Re-rolar**

Para adicionar um pouco de emoção e imprevisibilidade às rolagens.

* **Explosão (\!)**: Se um dado rolar o valor máximo, role-o novamente e adicione o novo resultado ao total. Isso pode acontecer várias vezes\!  
* **Re-rolagem (r)**: Se um dado rolar um valor indesejado (geralmente 1), role-o novamente até que um valor válido seja obtido. A versão ro re-rola apenas uma vez.

**Exemplos Práticos:**

* 3d6\!: Rola 3d6. Se algum dado der 6, role-o de novo e some, criando a chance de um dano massivo.  
* 2d10r\<3: Rola 2d10. Se qualquer um dos dados resultar em 1 ou 2, ele será rolado novamente até que o resultado seja 3 ou maior.

### **Contando Sucessos (Rolagem Alvo)**

Em vez de somar os dados, você pode contar quantos deles atingem um certo valor.

* **Sucesso (\>,\>=)**: Conta quantos dados são iguais ou superiores ao valor alvo.  
* **Falha (f)**: Subtrai do total de sucessos cada dado que atinge o valor de falha.

**Exemplos Práticos:**

* 5d10\>=8: Rola 5d10 e conta quantos resultados foram 8, 9 ou 10\. Ideal para sistemas como o Mundo das Trevas.  
* 10d6\>5f=1: Rola 10d6. Conta os resultados 6 como sucessos e subtrai 1 do total para cada resultado 1\.

## **Recursos Adicionais**

Ferramentas úteis para situações mais específicas.

### **Rolagens em Grupo {}**

Permite executar múltiplas rolagens de uma vez e somar seus totais. Basta separar as rolagens por vírgulas dentro de chaves.

**Exemplo:**

* {4d6+2, 1d8}: Rola 4d6+2, rola 1d8 e soma os dois totais em um grande resultado final.

### **Dados Especiais**

* **Dado Percentil (d%)**: Um atalho para d100, usado para rolar um número entre 1 e 100\.  
* **Dados Fudge/Fate (dF)**: Um dado de 6 lados que resulta em \+1, 0 ou \-1. Usado principalmente no sistema FATE.

**Exemplo:**

* 4dF: Rola 4 dados Fudge e soma os modificadores (+1, 0, \-1) para determinar o resultado de uma ação.

### **Organização e Estilo**

* **Ordenar (s, sa, sd)**: Mostra os resultados individuais dos dados em ordem crescente (s ou sa) ou decrescente (sd). Não altera a soma.  
* **Adicionar Comentários (\#)**: Adicione uma descrição à sua rolagem para se lembrar do que ela significa.

**Exemplo:**

* 8d6s \#Dano da Bola de Fogo: Rola 8d6, mostra os resultados em ordem crescente e adiciona a etiqueta "Dano da Bola de Fogo".

## **Referência Rápida de Modificadores**

| Notação | O que faz |
| :---- | :---- |
| **Matemática** | . |
| \+ \- \* / | Realiza operações matemáticas básicas. |
| **Manter/Descartar** | . |
| kh{N} ou k{N} | Mantém os **N** dados mais altos. |
| kl{N} | Mantém os **N** dados mais baixos. |
| dh{N} | Descarta os **N** dados mais altos. |
| dl{N} ou d{N} | Descarta os **N** dados mais baixos. |
| **Explosão/Re-rolagem** | . |
| \! | Rola novamente o dado de valor máximo e soma ao total. |
| r{cp} | Re-rola dados que atendem a uma condição (cp). |
| ro{cp} | Re-rola dados que atendem à condição, mas só uma vez. |
| **Sucesso/Falha** | . |
| {cp} | Conta quantos dados atendem à condição. |
| f{cp} | Define uma condição de falha que subtrai dos sucessos. |
| **Estilo** | . |
| s, sa | Ordena os resultados em ordem crescente. |
| sd | Ordena os resultados em ordem decrescente. |
| cs{cp} | Destaca visualmente um acerto crítico. |
| cf{cp} | Destaca visualmente uma falha crítica. |
| \# texto | Adiciona um comentário/descrição à rolagem. |


`

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