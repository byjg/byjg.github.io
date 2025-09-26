---
slug: simple-principles-avoid-complexity
title: Princípios Simples Para Não Complicar o Complexo
authors: [byjg]
tags: [software-engineering, clean-code, simplicity, best-practices, programming, developer-mindset]
description: >
   Lições aprendidas ao longo de anos construindo sistemas complexos: se está difícil, provavelmente está errado.
   Mantenha simples, não se repita, entenda suas ferramentas e teste sem medo.
   Princípios que parecem triviais, mas evitam muita dor de cabeça no futuro.
image: ./simple-principles-avoid-complexity.png
---

# Conceitos Simples Para Não Complicar o Complexo

Quando a gente fala de sistemas complexos, a tentação de criar soluções ainda mais complexas é enorme. Já vi isso se 
repetir muitas vezes: começa com um problema simples, e em pouco tempo você tem um Frankenstein de código cheio de puxadinhos. 
Por isso eu gosto de pregar alguns princípios que parecem óbvios, mas que a maioria esquece.

<!-- truncate --> 

## Elime tudo o que é desnecessário - EASY 

EASY é um mantra que carrego comigo. Código tem que ser EASY. EASY é um jogo de palavras em ingles que eu criei e que significa FACIL e também a sigla
de Eliminate all Stupidy Yields. Se está difícil, está errado. Se você está quebrando a cabeça horas e horas para fazer algo funcionar,
provavelmente o problema não é a sua persistência, é a sua abordagem.
Complexidade excessiva não é sinônimo de genialidade, é só desperdício de energia. Quando percebo que entrei nesse ciclo,
eu paro. Literalmente. Fecho a IDE, vou descansar, e no dia seguinte volto zerado. Muitas vezes com `git checkout -- .` 
e uma tela em branco. E não tenho vergonha de dizer: foi assim que encontrei algumas das minhas melhores soluções.

## KISS – Keep It Stupidly Simple

KISS significa "mantenha isso estupidamente simples". Existe uma beleza em soluções simples que só quem já lutou contra a complexidade 
consegue enxergar. O pipe no Linux é uma dessas obras de arte: a saída de um comando vira a entrada de outro. 
Nada mais elegante. O mesmo vale para uma hash function que resolve problemas enormes em O(1).
Então, não se engane: mais linhas de código não significam mais robustez. Muitas vezes, é só sinal de que você não quis 
simplificar.

## DRY – Don’t Repeat Yourself

Aqui não tem meio termo. "não repita você mesmo". Código duplicado é uma dívida que cobra juros altos. Se você copia e cola, 
está plantando uma bomba-relógio para a manutenção futura.
E não é só uma questão técnica, é uma questão de postura: você está dizendo para si mesmo que prefere o atalho ao invés de 
encarar a arquitetura de frente. O preço vem depois, e geralmente é você mesmo que paga.

## Pra sorrir, tem que fazer sorrir

Essa frase do filme Tropa de Elite pode soar estranha aqui, mas faz todo sentido. Quer que o banco de dados te dê respostas 
rápidas? Então aprenda a fazer ele sorrir também. Conheça os índices, entenda como os dados são armazenados, 
como as queries são otimizadas.
O ponto é simples: se você não entende a ferramenta que usa, não adianta esperar que ela resolva seus problemas. É como 
colocar um novato para pilotar um avião: não vai acabar bem.

## Testes, testes, testes

Se tem algo que separa programadores medianos de programadores confiáveis é o hábito de testar. Não estou falando de 
“rodar em staging” ou “mandar pra produção e ver se funciona”. Estou falando de criar testes que garantam a saúde do seu código.
Ter bons testes é dormir tranquilo. É poder refatorar sem medo. Eu já fiz mudanças gigantes em código legado com confiança 
total porque sabia que a bateria de testes estava lá para me proteger. E vou te dizer: não existe liberdade maior para um 
programador do que essa.

## Fechando a conta

No fundo, nada disso é revolucionário. São princípios simples, quase banais. Mas se você os ignora, é questão de tempo 
até cair no buraco da complexidade desnecessária.
Escrever sistemas complexos não é sobre mostrar que você sabe complicar. É sobre ter disciplina para simplificar, 
clareza para enxergar o essencial e coragem para recomeçar quando o caminho está errado.
