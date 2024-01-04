# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/singleton-pattern;
  byjg/shortid;
  byjg/mail-wrapper;
  byjg/anydataset-xml;
  byjg/anydataset-db;
  byjg/redis-queue-client;
  byjg/migration-cli;
  byjg/jwt-wrapper;
  byjg/anydataset-text;
  byjg/swagger-test;
  byjg/config;
  byjg/anydataset-json;
  byjg/rabbitmq-client;
  byjg/convert;
  byjg/anydataset-array;
  byjg/migration;
  byjg/webrequest;
  byjg/cache-engine;
  byjg/message-queue-client;
  byjg/anydataset;
  byjg/uri;
  byjg/serializer;
  byjg/xmlutil;
  byjg/config --> byjg/cache-engine;
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
