---
title: "Entendendo o Sistema de Versionamento dos Componentes PHP ByJG"
description: "Um guia completo para entender como os componentes PHP ByJG são versionados e como usá-los efetivamente em seus projetos"
authors: [byjg]
date: 2025-11-22
tags: [php, versionamento, composer, boas-praticas, ecossistema]
image: ./frontpage.png
---

# Entendendo o Sistema de Versionamento dos Componentes PHP ByJG

![Entendendo o Sistema de Versionamento dos Componentes PHP ByJG](./frontpage.png)

Gerenciar dependências entre múltiplos componentes PHP costumava ser um pesadelo.
Quando você tem um ecossistema de mais de 30 pacotes interconectados, manter o controle de qual versão funciona com qual versão do PHP — e quais versões são compatíveis entre si — pode rapidamente se tornar algo incontrolável.

Foi por isso que redesenhei completamente a estratégia de versionamento para todos os componentes PHP ByJG.
Este post explica a evolução do sistema de versionamento, como ele funciona hoje e como você pode usá-lo efetivamente em seus projetos.

<!-- truncate -->

## O Problema: Antes do PHP 7.4

Antes do PHP 7.4, cada componente do ecossistema ByJG tinha **seu próprio esquema de versionamento independente**.

Isso criava diversos desafios:

- **Inferno de Dependências**: Era extremamente difícil identificar quais versões de diferentes componentes eram compatíveis entre si
- **Confusão de Versões PHP**: Não havia uma maneira clara de saber quais versões do PHP uma versão específica de componente suportava
- **Pesadelo de Manutenção**: Gerenciar patches e atualizações entre componentes com números de versão diferentes era complexo e propenso a erros
- **Experiência Ruim para o Desenvolvedor**: Usuários tinham que pesquisar manualmente matrizes de compatibilidade antes de instalar componentes

Por exemplo, você poderia ter:
- `byjg/anydataset` na versão 3.2.1
- `byjg/serializer` na versão 2.5.0
- `byjg/migration` na versão 4.1.2

E tentar descobrir quais versões funcionavam juntas — e com qual versão do PHP — exigia vasculhar documentação ou tentativa e erro.

---

## A Solução: Versionamento Padronizado

A partir do **PHP 7.4**, introduzi um **sistema de versionamento padronizado** em todos os componentes ByJG.

O princípio chave é simples:

> **A versão principal do componente indica quais versões do PHP ele suporta.**

Isso cria um padrão claro e previsível que torna o gerenciamento de dependências significativamente mais fácil.

### Matriz de Versão para Suporte PHP

| Versão do Componente | Versões PHP Suportadas | Status                          |
|----------------------|------------------------|---------------------------------|
| **4.9.x**            | PHP 7.4, 8.0, 8.1, 8.2 | Apenas manutenção (patches)     |
| **5.0.x**            | PHP 8.1, 8.2, 8.3      | Apenas manutenção (patches)     |
| **6.0.x**            | PHP 8.3, 8.4, 8.5      | Desenvolvimento ativo           |

Isso significa:

- Se você está rodando **PHP 8.4**, deve usar a versão **6.0** dos componentes ByJG
- Se ainda está no **PHP 8.2**, pode usar a versão **4.9** ou **5.0**
- Se precisa suportar **PHP 7.4**, a versão **4.9** é sua única opção

### Benefícios Dessa Abordagem

1. **Clareza Instantânea**: Apenas olhando o número da versão, você sabe quais versões do PHP são suportadas
2. **Dependências Consistentes**: Todos os componentes com a mesma versão principal são projetados para trabalhar juntos
3. **Upgrades Simplificados**: Ao atualizar o PHP, você atualiza todos os componentes para a versão correspondente
4. **Melhor Manutenção**: Separação clara entre linhas de versão torna o patch de versões específicas algo direto

---

## Workflow de Desenvolvimento e Estratégia de Branches

Entender como releases e patches funcionam é crucial tanto para contribuidores quanto para usuários do ecossistema.

### A Estratégia da Branch Principal

O workflow de desenvolvimento segue um padrão direto:

```
branch main/master
    ↓
Sempre contém a versão mais recente (atualmente 6.0.x)
    ↓
Releases são tagueados diretamente dessa branch
```

**Pontos-Chave**:

- A branch `main` (ou `master`) **sempre** contém a versão mais recente do componente
- Todo desenvolvimento de novas funcionalidades acontece na branch main
- Quando um release está pronto, é tagueado diretamente da main (ex: `v6.0.0`, `v6.0.1`, etc.)
- Isso garante que a branch main está sempre estável e pronta para release

### Branches Específicas de Versão para Patches

Quando um bug é descoberto em uma versão antiga que ainda precisa de suporte, usamos **branches específicas de versão**:

```
Branch 4.9  →  Para patches da versão 4.9.x (PHP 7.4-8.2)
Branch 5.0  →  Para patches da versão 5.0.x (PHP 8.1-8.3)
Branch 6.0  →  Para patches da versão 6.0.x (PHP 8.3-8.5)
```

**Exemplo de Workflow**:

1. Um bug crítico é encontrado na versão 5.0.x
2. Crie uma branch de correção a partir da branch `5.0`
3. Aplique a correção e faça merge de volta para a branch `5.0`
4. Tagueie um novo patch release (ex: `v5.0.8`)
5. Se aplicável, porte a correção para versões mais novas (`6.0` ou `main`)

Essa abordagem garante:
- **Versões antigas permanecem estáveis** e podem receber correções críticas
- **Sem interferência** com o desenvolvimento ativo na branch main
- **Separação clara** entre manutenção e novas funcionalidades

---

## Melhores Práticas: Usando Componentes em Seu Projeto

### Recomendação #1: Use a Mesma Versão em Todos os Componentes

Para garantir máxima compatibilidade e evitar conflitos de dependência, **sempre use componentes da mesma versão principal**.

**Má Prática** ❌:
```json
{
    "require": {
        "byjg/anydataset": "^5.0",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^4.9"
    }
}
```

**Boa Prática** ✅:
```json
{
    "require": {
        "byjg/anydataset": "^6.0",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^6.0"
    }
}
```

### Recomendação #2: Use o Operador Circunflexo (^)

O **operador circunflexo** (`^`) é a maneira recomendada de especificar restrições de versão:

```json
{
    "require": {
        "byjg/anydataset": "^6.0"
    }
}
```

**O que `^6.0` significa**:

- Permite qualquer versão `>= 6.0.0` e `< 7.0.0`
- Você receberá **atualizações de patch** (6.0.1, 6.0.2, etc.) automaticamente
- Você receberá **atualizações menores** (6.1.0, 6.2.0, etc.) automaticamente
- Você **não** será automaticamente atualizado para a versão 7.0.0, que seria uma mudança com quebra de compatibilidade

Isso lhe dá o melhor equilíbrio de:
- **Estabilidade**: Sem mudanças com quebra de compatibilidade de upgrades de versão principal
- **Segurança**: Atualizações automáticas de patch para correções de bugs
- **Funcionalidades**: Acesso a novas funcionalidades de versões menores sem intervenção manual

---

## Testando Versões de Desenvolvimento

Às vezes você precisa testar funcionalidades não lançadas ou ajudar com o desenvolvimento. Existem duas abordagens:

### Opção 1: Definir Estabilidade Mínima (Todo o Projeto)

Essa abordagem diz ao Composer para permitir versões de desenvolvimento para **todos** os pacotes:

```json
{
    "require": {
        "byjg/anydataset": "^6.0",
        "byjg/serializer": "^6.0"
    },
    "minimum-stability": "dev",
    "prefer-stable": false
}
```

**Como funciona**:

- `"minimum-stability": "dev"` permite ao Composer instalar versões dev
- `"prefer-stable": false"` diz ao Composer para preferir versões de desenvolvimento sobre estáveis quando disponíveis
- A restrição `^6.0` agora vai corresponder a branches `6.0.x-dev`

**Quando usar**:
- Quando você está ativamente desenvolvendo ou testando múltiplos componentes
- Quando você quer testar o estado mais recente de todo o ecossistema

**Cuidado**: Isso afeta **todas** as dependências, não apenas componentes ByJG. Use com cuidado em ambientes de produção.

### Opção 2: Fixar Componentes Específicos em Versões Dev

Essa abordagem é mais direcionada e afeta apenas pacotes específicos:

```json
{
    "require": {
        "byjg/anydataset": "6.0.x-dev",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^6.0"
    }
}
```

**Como funciona**:

- `"6.0.x-dev"` explicitamente solicita a versão de desenvolvimento da branch `6.0`
- Outros pacotes continuam usando versões estáveis
- Você pode misturar: testar a versão dev de um componente enquanto mantém outros estáveis

**Quando usar**:
- Quando testando uma funcionalidade ou correção de bug específica em um único componente
- Quando contribuindo para um componente específico
- Quando você precisa de mais controle sobre quais pacotes usam versões dev

### Comandos de Update do Composer

Após alterar as restrições de versão:

```bash
# Atualizar todos os pacotes
composer update

# Atualizar apenas pacotes específicos
composer update byjg/anydataset

# Atualizar todos os pacotes byjg
composer update byjg/*
```

---

## Estratégia de Migração Entre Versões

Quando é hora de atualizar para uma nova versão do PHP (e consequentemente uma nova versão de componente), siga esta abordagem:

### Passo 1: Verifique Sua Versão Atual do PHP

```bash
php -v
```

### Passo 2: Atualize Seu composer.json

Altere todas as versões de componentes ByJG para corresponder à sua versão alvo do PHP:

```json
{
    "require": {
        "php": "^8.4",
        "byjg/anydataset": "^6.0",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^6.0",
        "byjg/rest": "^6.0"
    }
}
```

### Passo 3: Execute Composer Update

```bash
composer update
```

### Passo 4: Teste Sua Aplicação

Execute sua suite de testes para capturar quaisquer mudanças com quebra de compatibilidade:

```bash
./vendor/bin/phpunit
```

### Passo 5: Revise os Changelogs

Verifique os changelogs de cada componente para mudanças com quebra de compatibilidade:

```
https://opensource.byjg.com/docs/php/[nome-do-componente]/
```

---

## Ciclo de Vida de Suporte de Versões

Entender o ciclo de vida de suporte ajuda você a planejar upgrades:

| Versão | Data de Release | Desenvolvimento Ativo | Patches de Segurança | Fim de Vida |
|--------|-----------------|----------------------|----------------------|-------------|
| 4.9.x  | 2020            | ❌ Encerrado          | ✅ Não                | 2023        |
| 5.0.x  | 2022            | ❌ Encerrado          | ✅ Não                | 2025        |
| 6.0.x  | 2025            | ✅ Ativo              | ✅ Sim                | TBD         |

**Desenvolvimento Ativo**: Novas funcionalidades, melhorias e otimizações
**Patches de Segurança**: Apenas correções de bugs críticos e atualizações de segurança

---

## Exemplo do Mundo Real

Vamos supor que você está construindo uma nova aplicação de API REST:

### Sua Versão do PHP
```bash
$ php -v
PHP 8.4.1
```

### Seu composer.json
```json
{
    "name": "minhaempresa/api",
    "require": {
        "php": "^8.4",
        "byjg/rest": "^6.0",
        "byjg/anydataset": "^6.0",
        "byjg/migration": "^6.0",
        "byjg/jwt-session": "^6.0",
        "byjg/authuser": "^6.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0"
    }
}
```

### Instalar Dependências
```bash
composer install
```

**Resultado**: Composer instala as versões 6.0.x mais recentes de todos os componentes, garantindo:
- ✅ Compatibilidade total com PHP 8.4
- ✅ Todos os componentes funcionam juntos perfeitamente
- ✅ Atualizações automáticas para patches e versões menores
- ✅ Ecossistema estável e testado

---

## Conclusão

O sistema de versionamento padronizado para componentes PHP ByJG transforma o gerenciamento de dependências de um quebra-cabeça complexo em um processo direto.

**Principais Conclusões**:

1. **Versão do componente = compatibilidade de versão PHP** — Versão 6.0 = PHP 8.3/8.4/8.5
2. **Sempre use a mesma versão principal** em todos os componentes ByJG
3. **Use o operador circunflexo** (`^6.0`) para estabilidade e atualizações ótimas
4. **Branch main = versão mais recente**, branches de versão para patches
5. **Duas maneiras de testar versões dev**: configurações de estabilidade para todo o projeto ou fixação por pacote

Seguindo essas diretrizes, você terá uma configuração de dependências sustentável e previsível que escala com sua aplicação.

Quer explorar todo o ecossistema?
👉 Visite [https://opensource.byjg.com](https://opensource.byjg.com)

Precisa verificar quais componentes estão disponíveis?
👉 Navegue pelo [catálogo de componentes](https://opensource.byjg.com/docs/php/)
