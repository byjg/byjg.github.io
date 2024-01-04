# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/message-queue-client;
  byjg/shortid;
  byjg/jwt-wrapper;
  byjg/swagger-test;
  byjg/anydataset-text;
  byjg/singleton-pattern;
  byjg/cache-engine;
  byjg/mail-wrapper;
  byjg/anydataset-json;
  byjg/migration-cli;
  byjg/anydataset-xml;
  byjg/anydataset-db;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/anydataset-array;
  byjg/uri;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-text --> byjg/anydataset;
  byjg/webrequest --> byjg/uri;
  byjg/anydataset-xml --> byjg/anydataset;
  byjg/anydataset-xml --> byjg/xmlutil;
  byjg/anydataset-array --> byjg/anydataset;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/message-queue-client --> byjg/uri;
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
