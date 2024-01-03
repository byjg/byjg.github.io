# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/uri;
  byjg/swagger-test;
  byjg/migration-cli;
  byjg/mail-wrapper;
  byjg/shortid;
  byjg/migration;
  byjg/convert;
  byjg/webrequest;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
```
## Documentation
{% include list.liquid %}
