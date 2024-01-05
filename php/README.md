# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/anydataset-xml;
  byjg/rabbitmq-client;
  byjg/swagger-test;
  byjg/restserver;
  byjg/anydataset-json;
  byjg/shortid;
  byjg/redis-queue-client;
  byjg/config;
  byjg/migration-cli;
  byjg/mail-wrapper;
  byjg/anydataset-db;
  byjg/fonemabr;
  byjg/anydataset-text;
  byjg/singleton-pattern;
  byjg/jwt-wrapper;
  byjg/message-queue-client;
  byjg/cache-engine;
  byjg/migration;
  byjg/webrequest;
  byjg/anydataset-array;
  byjg/convert;
  byjg/uri;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/fonemabr --> byjg/convert;
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
  byjg/restserver --> byjg/serializer;
  byjg/restserver --> byjg/singleton-pattern;
  byjg/restserver --> byjg/cache-engine;
  byjg/restserver --> byjg/webrequest;
  byjg/restserver --> byjg/jwt-wrapper;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
