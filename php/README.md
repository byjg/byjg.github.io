# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/anydataset-text;
  byjg/migration-cli;
  byjg/fonemabr;
  byjg/redis-queue-client;
  byjg/shortid;
  byjg/config;
  byjg/anydataset-db;
  byjg/mailwrapper;
  byjg/rabbitmq-client;
  byjg/anydataset-xml;
  byjg/swagger-test;
  byjg/anydataset-json;
  byjg/restserver;
  byjg/migration;
  byjg/anydataset-array;
  byjg/convert;
  byjg/message-queue-client;
  byjg/singleton-pattern;
  byjg/cache-engine;
  byjg/webrequest;
  byjg/jwt-wrapper;
  byjg/anydataset;
  byjg/uri;
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
  byjg/mailwrapper --> byjg/convert;
  byjg/mailwrapper --> byjg/webrequest;
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
