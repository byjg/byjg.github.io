## Como eu consigo manter 30+ opensource ?

Para manter 30+ projetos opensource eu tenho que vestir muitos chapeus. Eu tenho que desenvolver, testar, criar o pipeline de CI/CD, quality gate e por ai vai. Numa empresa formal com 30 micro servicos temos em média 2-4 DevOps, 3-5 PO/PM e 50-100 desenvolvedores. E faco isso praticamente sozinho. Vamos entender um pouco de como é o meu processo.

##  O que eu mantenho?

Um ecossistema de componentes em PHP e um conjunto de imagens Docker.  Como é possível manter isso?

## Criando um ambiente de Developer Experience

A primeira etapa foi criar um ambiente de Developer Experience para os projetos. O primeiro ponto foi identificar o que era comum em todos os projetos e então automatizar. A grande maioria dos projetos, por exemplo, usa o mesmo pipeline. Mas o que atrapalhava mais o ambiente. Em cada máquina que eu trabalhava eu tinha que configurar um monte de coisas e sempre esquecia.

Dessa forma eu criei uma imagem de PHP que pudesse ser padronizada com tudo o que precisava e resolver todos os problemas mais comuns que tinha. Imagem docker PHP para CLI, FPM, FPM com Nginx, exemplo de Docker Compose para usar isso e por ai vai. Com isso eu resolvia o CI/CD e imagens de producão.

Mas o ambiente de desenvolvimento ainda estava complicado. Isso por que eu precisava rodar diferentes versões do PHP na mesma máquina. Tem alguns projetos que já fazem isso, mas eles tem que instalar na máquina e acabava ficando complicado de manter. Cmoo eu já tinha o docker com a imagem, por que não criar o meu ambiente com o DOCKER? Assim, padronizei que o ambiente de desenvolvimento seria LINUX e comecei a testar várias ferramentas e projetos enquando desenvolvia. Acabei criando um outro projeto opensource chamado "https://shellscript.download". Com isso meu ambiente seria configurado simplesmente com `load.sh php-docker -- 8.4

## Proximo Passo: Automacão e Padronizacão de Processos

Ter mais de 30 projetos é complicado em diversos níveis. Cada projeto é como um micro-servico. Tem sua própria documentacão, tem suas particularidades, tem diversos formas de usar, tem que definir a sua arquitetura, como se conecta, estudar sobre o a particularidade.

Separar em projetos diferentes é bom, por que conseguimos isolar, abstrair as funcionalidades e focar e ser o melhor naquilo. E isso é o que vem acontecendo. Desde 2013, eu veio atualizando e melhorando constante cada projeto.

Com isso, é condicão imperativa que todos os projetos tenham testes e estes testes cubram uma porcão significativa do código. Alem é claro de ele estar integrado ao ambiente de CI/CD

Contudo, ter o projetos separados tem uma dificuldade para centralizar a documentacão. Senão ficam pecas soltas que não são conectadas. E como criar a documentacão local e centralizar SEM TER QUE FICAR mantendo em dois lugares?

Automacão! O GitHub Pages e uma mão na roda para publicar a documentacão. Eu poderia criar um GitHub Pages para cada projeto, como eu fiz inicialmente, mas ficava muito dificil de padronizar. Então criei um projeto central de GitHub pages byjg.github.io que,  quando um PR é mergeado, ele se usa um pipeline compartilhado para copiar a documentacão e organizar no espaco correto da minha documentacão em Docusaurus. E então isso triga um build no Cloudflare Pages e publica no dominio https://opensource.byjg.com.

Tive algumas decisões de arquitetura para reduzir custos (ou seja pagar nada) e ao mesmo maximizar os meus resultados.

No final do dia: Foco num projeto, deixo ele o melhor que posso, consigo ter contribuidores individuais para cada projeto, e ao merge toda a mágica da automacão acontece.


## Lembrar de como usar?

Consegui desenvolver os componentes. Os componentes são independentes. Eles podem ser usados sozinhos e em qualquer framework já que seguem os padrões definidos pelo PHP como o PSR, usam o gerenamento de pacotes Composer e assim sucessivamente. Além disso, individualmente eles tem roteiro de uso, exemplos e testes.

Só que eu os desenvolvi para serem usados em conjunto no meu próprio ecossistema. Então depois de várias versões criei o PHP Rest Reference Architecture. Essa arquitetura de referencia usa os compontes mais importante e tem um projeto que eu consigo criar do zero e ter funcionando em questão de minutos um projeto com CI/CD, configuracão OpenAPi para os endpoints Rest, Autorizacão e Autenticacõa de Endpoints, migracão de banco de dados, Injecão de dependencia, docker, etc

E o melhor, toda a base que eu usei para desnevolver eu uso aqui, então já foi testada e pronta para usar. E também integrei ele no shellscript.download. Então é só `load.sh php-rest-api -- <folder> --namespace=<name> --name=<name/name> --install-examples=n` Com isso crio o projeto com todas as features acima.


## Preparar para Producao

Tenho a imagem docker em PHP que roda no desenvolvimento, CI/CD e também é usada para construir as imagens docker. Essas imagens vão para o Container Registry e com isso eu consigo promover as imagens para os ambientes dev, Staging e producão.

Eu também criei um mecanismo para rodar o HAProxy como meu ingress usando a versão comunity, Se chama Easy HAProxy e na pratica, consegue ler os labels dos servicos docker e se auto configurar SEM downtime e sem eu sequer como o arquivo é gerado. O melhor, já tem a protecão SSL, utiliza todos as melhores referencias que poderia num arquivo HAProxy e sem ter nenhum bug de configuracão.


## E agora Inteligencia Artifical!

A Inteligencia artificial tem sido o meu estágio de Writing , Front/Design e Desenvolvimento. Com isso eu consegui aumentar bastante a produtividade principalmente nos pontos que eu precisaria de mais atencão.

São alguns itens:

Documentar: Eu criei um prompt e prompts de follow up que resolvem 95% das minhas dores de documentacão. Isso inclui, definir padrões, focar em alguns pontos e evitar que problemas de formatacão possam quebrar, por exemplo, o Docusaurus.

Design e Frontend: O meu forte é backend. Consigo focar e ser bem rapido desenvolvendo, seja infra, codigo ou o quer que seja. Mas FrontEnd eu consigo andar, mas uma tela parece uma eternidade para finalizar. Com a IA, eu consigo dizer o que quero e a AI faz para mim a tela que vai conectar no meu Backend. Muito rapido.

Estagiario de Desenvolvimento: A IA é o meu estagiário muito esperto, atento aos detalhes mas que as vezes se perde. Então eu estou aprendendo a "conversar" com o prompt. Optei pelo Claude Code como o meu estagiário principal, e uso o Chat GPT para ideias ou segunda opnião. Eventualmete uso o Junie do PHPStorm. Uma IDE boa ajuda muito, muito o desenvolvimento. Quando eu solicito algo normalmente eu nunca deixa no modo que ele faz tudo sozinho. Eu vou acompanhando e "autorizando" ele a continuar. No meio do caminho vou direcionando ele para um caminho ou outro.  As vezes peco um plano antes de comecar tudo.



## O que eu tenho?

Infrastrutura:
- Imagens Docker
- Load Balance
- Imagem Builder para usar em CI/CD

Automacão
* CI/CD padronizado
* Reaproveitamento de Pipelines
* Ansible e terraform para configurar os ambientes
* Sripts Python para configurar o GitHub

## Conclusão
