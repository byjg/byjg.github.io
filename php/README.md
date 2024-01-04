# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/singleton-pattern;
  byjg/anydataset-text;
  byjg/anydataset-json;
  byjg/uri;
  byjg/anydataset-xml;
  byjg/mail-wrapper;
  byjg/swagger-test;
  byjg/migration-cli;
  byjg/shortid;
  byjg/anydataset-array;
  byjg/cache-engine;
  byjg/convert;
  byjg/webrequest;
  byjg/migration;
  byjg/anydataset;
  byjg/serializer;
  byjg/xmlutil;
  byjg/anydataset-text --> byjg/anydataset;
  byjg/anydataset-xml --> byjg/anydataset;
  byjg/anydataset-xml --> byjg/xmlutil;
  byjg/anydataset-array --> byjg/anydataset;
  byjg/mail-wrapper --> byjg/convert;
  byjg/mail-wrapper --> byjg/webrequest;
  byjg/anydataset-json --> byjg/anydataset;
  byjg/swagger-test --> byjg/webrequest;
  byjg/migration-cli --> byjg/migration;
  byjg/anydataset --> byjg/serializer;
  byjg/anydataset --> byjg/xmlutil;
```
## Documentation
{% include list.liquid %}
