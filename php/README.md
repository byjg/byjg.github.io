# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/migration-cli;
  byjg/mail-wrapper;
  byjg/swagger-test;
  byjg/anydataset-array;
  byjg/anydataset-json;
  byjg/shortid;
  byjg/uri;
  byjg/anydataset-xml;
  byjg/migration;
  byjg/convert;
  byjg/webrequest;
  byjg/anydataset;
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
