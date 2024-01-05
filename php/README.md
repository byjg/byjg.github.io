# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/config;
  byjg/rabbitmq-client;
  byjg/redis-queue-client;
  byjg/swagger-test;
  byjg/anydataset-text;
  byjg/restserver;
  byjg/mailwrapper;
  byjg/phpthread;
  byjg/authuser;
  byjg/shortid;
  byjg/fonemabr;
  byjg/anydataset-json;
  byjg/migration-cli;
  byjg/jinja-php;
  byjg/anydataset-xml;
  byjg/crypto;
  byjg/message-queue-client;
  byjg/singleton-pattern;
  byjg/webrequest;
  byjg/micro-orm;
  byjg/cache-engine;
  byjg/jwt-wrapper;
  byjg/convert;
  byjg/migration;
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
