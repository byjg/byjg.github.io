# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/migration-cli;
  byjg/anydataset-xml;
  byjg/jwt-wrapper;
  byjg/cache-engine;
  byjg/anydataset-text;
  byjg/anydataset-db;
  byjg/mail-wrapper;
  byjg/shortid;
  byjg/anydataset-json;
  byjg/singleton-pattern;
  byjg/swagger-test;
  byjg/migration;
  byjg/anydataset-array;
  byjg/convert;
  byjg/webrequest;
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
  byjg/anydataset-db --> byjg/anydataset-array;
  byjg/anydataset-db --> byjg/uri;
  byjg/anydataset-json --> byjg/anydataset;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
