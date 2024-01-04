# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/mail-wrapper;
  byjg/cache-engine;
  byjg/swagger-test;
  byjg/rabbitmq-client;
  byjg/jwt-wrapper;
  byjg/migration-cli;
  byjg/singleton-pattern;
  byjg/anydataset-xml;
  byjg/anydataset-text;
  byjg/anydataset-db;
  byjg/shortid;
  byjg/anydataset-json;
  byjg/convert;
  byjg/webrequest;
  byjg/message-queue-client;
  byjg/migration;
  byjg/anydataset-array;
  byjg/uri;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-text --> byjg/anydataset;
  byjg/webrequest --> byjg/uri;
  byjg/rabbitmq-client --> byjg/message-queue-client;
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
