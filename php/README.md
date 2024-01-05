# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/restserver;
  byjg/redis-queue-client;
  byjg/crypto;
  byjg/anydataset-xml;
  byjg/anydataset-text;
  byjg/authuser;
  byjg/fonemabr;
  byjg/config;
  byjg/phpthread;
  byjg/mailwrapper;
  byjg/swagger-test;
  byjg/migration-cli;
  byjg/statemachine;
  byjg/rabbitmq-client;
  byjg/shortid;
  byjg/jinja-php;
  byjg/anydataset-json;
  byjg/singleton-pattern;
  byjg/micro-orm;
  byjg/jwt-wrapper;
  byjg/cache-engine;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/message-queue-client;
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
  byjg/phpthread --> byjg/cache-engine;
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
