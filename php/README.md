# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/swagger-test;
  byjg/mail-wrapper;
  byjg/shortid;
  byjg/uri;
  byjg/migration-cli;
  byjg/anydataset-array;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-array --> byjg/anydataset;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
