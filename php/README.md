# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/anydataset;
  byjg/mail-wrapper;
  byjg/migration-cli;
  byjg/uri;
  byjg/swagger-test;
  byjg/shortid;
  byjg/serializer;
  byjg/xmlutil;
  byjg/convert;
  byjg/migration;
  byjg/webrequest;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
