# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/php-shortid;
  byjg/uri;
  byjg/swagger-test;
  byjg/mail-wrapper;
  byjg/migration-cli;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
```
## Documentation
{% include list.liquid %}
