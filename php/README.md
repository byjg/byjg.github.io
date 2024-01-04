# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/anydataset-xml;
  byjg/anydataset-text;
  byjg/singleton-pattern;
  byjg/redis-queue-client;
  byjg/cache-engine;
  byjg/rabbitmq-client;
  byjg/shortid;
  byjg/anydataset-db;
  byjg/swagger-test;
  byjg/anydataset-json;
  byjg/migration-cli;
  byjg/jwt-wrapper;
  byjg/mail-wrapper;
  byjg/message-queue-client;
  byjg/anydataset-array;
  byjg/migration;
  byjg/convert;
  byjg/webrequest;
  byjg/anydataset;
  byjg/uri;
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
  byjg/redis-queue-client --> byjg/message-queue-client;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
