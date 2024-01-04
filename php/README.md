# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/mail-wrapper;
  byjg/anydataset-xml;
  byjg/cache-engine;
  byjg/anydataset-array;
  byjg/anydataset-text;
  byjg/swagger-test;
  byjg/shortid;
  byjg/singleton-pattern;
  byjg/migration-cli;
  byjg/jwt-wrapper;
  byjg/anydataset-json;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/anydataset;
  byjg/uri;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-text --> byjg/anydataset;
  byjg/webrequest --> byjg/uri;
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
