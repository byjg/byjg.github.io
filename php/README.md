# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/config;
  byjg/redis-queue-client;
  byjg/anydataset-text;
  byjg/shortid;
  byjg/swagger-test;
  byjg/rabbitmq-client;
  byjg/anydataset-json;
  byjg/authuser;
  byjg/fonemabr;
  byjg/anydataset-xml;
  byjg/restserver;
  byjg/migration-cli;
  byjg/mailwrapper;
  byjg/message-queue-client;
  byjg/micro-orm;
  byjg/singleton-pattern;
  byjg/cache-engine;
  byjg/jwt-wrapper;
  byjg/migration;
  byjg/convert;
  byjg/webrequest;
  byjg/anydataset-db;
  byjg/anydataset-array;
  byjg/uri;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/fonemabr --> byjg/convert;
  byjg/config --> byjg/cache-engine;
  byjg/anydataset-text --> byjg/anydataset;
  byjg/webrequest --> byjg/uri;
  byjg/rabbitmq-client --> byjg/message-queue-client;
  byjg/micro-orm --> byjg/anydataset-db;
  byjg/anydataset-xml --> byjg/anydataset;
  byjg/anydataset-xml --> byjg/xmlutil;
  byjg/anydataset-array --> byjg/anydataset;
  byjg/mailwrapper --> byjg/convert;
  byjg/mailwrapper --> byjg/webrequest;
  byjg/message-queue-client --> byjg/uri;
  byjg/anydataset-db --> byjg/anydataset-array;
  byjg/anydataset-db --> byjg/uri;
  byjg/anydataset-json --> byjg/anydataset;
  byjg/migration --> byjg/anydataset-db;
  byjg/swagger-test --> byjg/webrequest;
  byjg/redis-queue-client --> byjg/message-queue-client;
  byjg/restserver --> byjg/serializer;
  byjg/restserver --> byjg/singleton-pattern;
  byjg/restserver --> byjg/cache-engine;
  byjg/restserver --> byjg/webrequest;
  byjg/restserver --> byjg/jwt-wrapper;
  byjg/authuser --> byjg/micro-orm;
  byjg/authuser --> byjg/cache-engine;
  byjg/authuser --> byjg/jwt-wrapper;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
