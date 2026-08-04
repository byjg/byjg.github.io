---
title: "Desenvolvimento PHP Fácil com Docker e VSCode"
description: "Aprenda a configurar um ambiente completo de desenvolvimento PHP usando apenas Docker e VSCode. Nenhuma instalação local de PHP necessária"
authors: [byjg]
date: 2025-10-22
tags: [PHP, Docker, VSCode, Desenvolvimento, Xdebug]
---

# Desenvolvimento PHP Fácil com Docker e VSCode

Configurar um ambiente de desenvolvimento PHP pode ser desafiador, especialmente quando você precisa gerenciar múltiplas versões do PHP ou evitar poluir seu sistema com instalações locais. Neste guia, vou mostrar como criar um ambiente completo de desenvolvimento PHP usando apenas Docker e VSCode. Nenhuma instalação local de PHP necessária!

{/* truncate */} 

## O Que Você Vai Conseguir

Ao final deste tutorial, você terá:
- PHP rodando inteiramente em containers Docker
- Suporte completo de debugging com Xdebug no VSCode
- Capacidade de executar scripts PHP individuais
- Servidor de desenvolvimento PHP embutido
- Zero instalação de PHP no seu sistema host

## Pré-requisitos

- Docker instalado e rodando
- Visual Studio Code instalado
- Familiaridade básica com linha de comando

## Passo 1: Instalar PHP via Docker Wrapper

Vamos usar o [shellscript.download](https://shellscript.download), uma coleção de scripts prontos para uso que facilitam a instalação.

Primeiro, instale o Loader:

```bash
/bin/bash -c "$(curl -fsSL https://shellscript.download/install/loader)"
```

E então execute este único comando para instalar o PHP 8.4 via Docker:

```bash
load.sh php-docker -- 8.4
```

Isso cria um script wrapper em `~/.shellscript/bin/php8.4` que executa o PHP dentro de um container Docker. 
A beleza desta abordagem é que o PHP roda em completo isolamento. 
Seu sistema host permanece limpo!

O script também adiciona `~/.shellscript/bin` ao seu PATH, então você pode:
- Chamar `php8.4` diretamente de qualquer lugar no seu terminal
- Usar `php` como um alias (automaticamente aponta para sua versão padrão do PHP)

Teste:

```bash
php8.4 --version
php --version  # Usa o alias
```

:::tip Dica
Você pode instalar múltiplas versões do PHP lado a lado:
```bash
load.sh php-docker -- 8.3
load.sh php-docker -- 8.2
```
:::

## Passo 2: Instalar Extensões do VSCode

Você precisa de duas extensões para desenvolvimento PHP com debugging:

1. **PHP Debug** por Xdebug
    - ID da Extensão: `xdebug.php-debug`
    - Fornece integração com Xdebug para debugging de código PHP

2. **PHP Intelephense** (recomendado) ou **PHP IntelliSense**
    - ID da Extensão: `bmewburn.vscode-intelephense-client`
    - Fornece inteligência de código, autocompletar e mais

Instale-as via VSCode:
1. Pressione `Ctrl+Shift+X` (ou `Cmd+Shift+X` no Mac) para abrir Extensões
2. Busque por "PHP Debug" e instale
3. Busque por "PHP Intelephense" e instale

:::tip Dica
Existe uma outra extensão que contém todos os pacotes que precisa. Ele tem um período trial que você pode usar
se quiser.

O ID da extensão é `devsense.phptools-vscode`
:::

## Passo 3: Configurar as Definições do VSCode

Abra suas configurações do VSCode (`.vscode/settings.json` no seu projeto ou configurações globais) e adicione:

```jsonc
{
    "php.executables": {
        "8.4": "/home/SEU_USUARIO/.shellscript/bin/php8.4"
    },
    "php.version": "8.4",
    "php.debug.port": [9003]
}
```

:::caution Importante
Substitua `/home/SEU_USUARIO/` pelo caminho real do seu diretório home. Você pode descobrir executando `echo ~` no seu terminal.

Se você instalou uma versão diferente do PHP, atualize tanto a chave (`"8.4"`) quanto o caminho adequadamente:
```jsonc
"php.executables": {
    "8.3": "/home/SEU_USUARIO/.shellscript/bin/php8.3"
},
"php.version": "8.3",
```
:::

## Passo 4: Configurar as Configurações de Launch

Crie ou atualize `.vscode/launch.json` na raiz do seu projeto:

```jsonc
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            }
        },
        {
            "name": "PHP Debug Current Script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            },
            "runtimeArgs": [
                "-dxdebug.start_with_request=yes"
            ],
            "env": {
                "XDEBUG_MODE": "debug,develop",
                "XDEBUG_CONFIG": "client_port=9003"
            }
        },
        {
            "name": "PHP Run Open Script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "noDebug": true,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            }
        },
        {
            "name": "PHP Built-in Server",
            "type": "php",
            "request": "launch",
            "runtimeArgs": [
                "-S",
                "localhost:8080",
                "-t",
                "/workdir"
            ],
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            },
            "noDebug": false,
            "serverReadyAction": {
                "pattern": "Development Server \\(http://localhost:([0-9]+)\\) started",
                "uriFormat": "http://localhost:%s",
                "action": "openExternally"
            }
        },
        {
            "name": "PHP Built-in Server (no debug)",
            "type": "php",
            "request": "launch",
            "runtimeArgs": [
                "-S",
                "localhost:8080",
                "-t",
                "/workdir"
            ],
            "noDebug": true,
            "serverReadyAction": {
                "action": "openExternally"
            }
        },
        {
            "name": "PHPUnit All Tests",
            "type": "php",
            "request": "launch",
            "program": "${workspaceFolder}/vendor/bin/phpunit",
            "cwd": "${workspaceFolder}",
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            },
            "env": {
                "XDEBUG_MODE": "debug,develop",
                "XDEBUG_CONFIG": "client_port=9003"
            }
        },
        {
            "name": "PHPUnit Current File",
            "type": "php",
            "request": "launch",
            "program": "${workspaceFolder}/vendor/bin/phpunit",
            "args": [
                "${file}"
            ],
            "cwd": "${workspaceFolder}",
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            },
            "env": {
                "XDEBUG_MODE": "debug,develop",
                "XDEBUG_CONFIG": "client_port=9003"
            }
        },
        {
            "name": "PHPUnit All Tests (no debug)",
            "type": "php",
            "request": "launch",
            "program": "${workspaceFolder}/vendor/bin/phpunit",
            "cwd": "${workspaceFolder}",
            "noDebug": true,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            }
        },
        {
            "name": "PHPUnit Current File (no debug)",
            "type": "php",
            "request": "launch",
            "program": "${workspaceFolder}/vendor/bin/phpunit",
            "args": [
                "${file}"
            ],
            "cwd": "${workspaceFolder}",
            "noDebug": true,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            }
        }
    ]
}
```

## Passo 5: Testar Sua Configuração

Crie um arquivo de teste simples `test.php`:

```php
<?php

function greet($name) {
    $greeting = "Olá, $name!";
    return $greeting;
}

function calculate($a, $b) {
    $sum = $a + $b;
    $product = $a * $b;
    return [
        'sum' => $sum,
        'product' => $product,
        'average' => $sum / 2
    ];
}

echo "=== Testando Configuração PHP ===\n\n";

$name = "Desenvolvedor";
echo greet($name) . "\n\n";

$result = calculate(10, 5);
echo "Cálculos para 10 e 5:\n";
echo "Soma: {$result['sum']}\n";
echo "Produto: {$result['product']}\n";
echo "Média: {$result['average']}\n\n";

echo "Versão do PHP: " . phpversion() . "\n";
echo "Xdebug carregado: " . (extension_loaded('xdebug') ? 'Sim' : 'Não') . "\n";
```

## Usando Sua Nova Configuração

### Executando um Script Sem Debugging

1. Abra `test.php`
2. Pressione `F5` ou clique no botão Run
3. Selecione **"PHP Run Open Script"**
4. Veja a saída no Debug Console

### Fazendo Debug de um Script

1. Defina um breakpoint clicando à esquerda do número da linha (tente na linha com `$greeting = ...`)
2. Pressione `F5`
3. Selecione **"PHP Debug Current Script"**
4. A execução pausará no seu breakpoint
5. Inspecione variáveis, avance no código passo a passo, etc.

### Executando o Servidor Embutido

1. Crie um arquivo `index.php` na raiz do seu projeto
2. Pressione `F5`
3. Selecione **"PHP Built-in Server"** ou **"PHP Built-in Server (no debug)"**
4. Seu navegador abrirá automaticamente em `http://localhost:8080`
5. Defina breakpoints nos seus arquivos PHP e atualize a página para fazer debug

## Como Funciona

A mágica acontece no script wrapper criado pelo shellscript.download. Ele:

1. Converte caminhos de arquivo absolutos para caminhos relativos
2. Monta seu diretório de projeto como `/workdir` no container Docker
3. Executa o PHP dentro do container com Xdebug configurado
4. Usa `--network host` para que o Xdebug possa se conectar de volta ao VSCode

Tudo isso acontece de forma transparente. Você apenas escreve código PHP e faz debug como se o PHP estivesse instalado localmente!

## Benefícios Desta Abordagem

✅ **Sistema Limpo**: Nenhuma instalação de PHP poluindo seu sistema  
✅ **Múltiplas Versões**: Execute diferentes versões do PHP para diferentes projetos  
✅ **Ambiente Consistente**: Mesmo ambiente PHP em diferentes máquinas  
✅ **Debug Completo**: Suporte completo ao Xdebug com breakpoints, inspeção de variáveis, etc.  
✅ **Atualizações Fáceis**: Atualize o PHP apenas mudando o script wrapper  
✅ **Dependências Isoladas**: Cada container é isolado com suas próprias extensões

## Solução de Problemas

### "Could not connect to debugging client"

Certifique-se de que o VSCode está escutando o Xdebug. Você deve ver "Listening to Xdebug on port 0.0.0.0:9003" no Debug Console quando iniciar o debugging.

### "Address already in use" ao iniciar o servidor

O servidor ainda está rodando de uma execução anterior. Pare-o clicando no ícone de lixeira no terminal onde ele está rodando, ou pressione `Ctrl+C`.

### Problemas de caminho

Certifique-se de que seu `pathMappings` mapeia corretamente `/workdir` para a pasta do seu workspace. Isso diz ao Xdebug como traduzir caminhos do container para seus caminhos locais.

## Conclusão

Com esta configuração, você tem um ambiente profissional de desenvolvimento PHP que é:
- Fácil de configurar (apenas alguns minutos!)
- Fácil de manter
- Portável entre máquinas
- Completamente isolado do seu sistema host

Sem mais conflitos de dependências, sem mais problemas de "funciona na minha máquina", e sem mais instalações complexas de PHP. Apenas puro desenvolvimento PHP containerizado e eficiente!

Bom código! 🚀