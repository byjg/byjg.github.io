# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/uri;
  byjg/mail-wrapper;
  byjg/anydataset-array;
  byjg/anydataset-json;
  byjg/migration-cli;
  byjg/anydataset-xml;
  byjg/shortid;
  byjg/swagger-test;
  byjg/convert;
  byjg/migration;
  byjg/anydataset;
  byjg/webrequest;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-xml --> byjg/anydataset;
  byjg/anydataset-xml --> byjg/xmlutil;
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
