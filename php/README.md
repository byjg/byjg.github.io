# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/anydataset-array;
  byjg/anydataset-json;
  byjg/uri;
  byjg/swagger-test;
  byjg/migration-cli;
  byjg/shortid;
  byjg/mail-wrapper;
  byjg/anydataset;
  byjg/migration;
  byjg/convert;
  byjg/webrequest;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-array --> byjg/anydataset;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/anydataset-json --> byjg/anydataset;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
