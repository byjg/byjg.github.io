# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/phpthread;
  byjg/anydataset-json;
  byjg/redis-queue-client;
  byjg/anydataset-text;
  byjg/account-statements;
  byjg/rabbitmq-client;
  byjg/restserver;
  byjg/swagger-test;
  byjg/jwt-session;
  byjg/anydataset-xml;
  byjg/mail-wrapper;
  byjg/authuser;
  byjg/config;
  byjg/migration-cli;
  byjg/fonemabr;
  byjg/message-queue-client;
  byjg/singleton-pattern;
  byjg/webrequest;
  byjg/micro-orm;
  byjg/jwt-wrapper;
  byjg/cache-engine;
  byjg/migration;
  byjg/convert;
  byjg/anydataset-db;
  byjg/anydataset-array;
  byjg/uri;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/rabbitmq-client --> byjg/message-queue-client;
  byjg/anydataset-array --> byjg/anydataset;
  byjg/restserver --> byjg/serializer;
  byjg/restserver --> byjg/singleton-pattern;
  byjg/restserver --> byjg/cache-engine;
  byjg/restserver --> byjg/webrequest;
  byjg/restserver --> byjg/jwt-wrapper;
  byjg/redis-queue-client --> byjg/message-queue-client;
  byjg/anydataset-xml --> byjg/anydataset;
  byjg/anydataset-xml --> byjg/xmlutil;
  byjg/config --> byjg/cache-engine;
  byjg/account-statements --> byjg/micro-orm;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
  byjg/webrequest --> byjg/uri;
  byjg/micro-orm --> byjg/anydataset-db;
  byjg/phpthread --> byjg/cache-engine;
  byjg/anydataset-json --> byjg/anydataset;
  byjg/migration --> byjg/anydataset-db;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/anydataset-db --> byjg/anydataset-array;
  byjg/anydataset-db --> byjg/uri;
  byjg/swagger-test --> byjg/webrequest;
  byjg/jwt-session --> byjg/jwt-wrapper;
  byjg/authuser --> byjg/micro-orm;
  byjg/authuser --> byjg/cache-engine;
  byjg/authuser --> byjg/jwt-wrapper;
  byjg/fonemabr --> byjg/convert;
  byjg/anydataset-text --> byjg/anydataset;
  byjg/message-queue-client --> byjg/uri;
  byjg/migration-cli --> byjg/migration;
```
## Documentation
{% include list.liquid %}
