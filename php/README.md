# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/swagger-test;
  byjg/serializer;
  byjg/uri;
  byjg/migration-cli;
  byjg/shortid;
  byjg/xmlutil;
  byjg/mail-wrapper;
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
