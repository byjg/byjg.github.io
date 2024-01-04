# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/swagger-test;
  byjg/anydataset-json;
  byjg/shortid;
  byjg/mail-wrapper;
  byjg/anydataset-xml;
  byjg/anydataset-array;
  byjg/migration-cli;
  byjg/uri;
  byjg/anydataset-text;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-text --> byjg/anydataset;
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
