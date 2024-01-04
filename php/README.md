# PHP Components
## Class Dependency
```mermaid
graph LR;
  byjg/migration-cli;
  byjg/anydataset-text;
  byjg/swagger-test;
  byjg/cache-engine;
  byjg/anydataset-array;
  byjg/singleton-pattern;
  byjg/uri;
  byjg/shortid;
  byjg/anydataset-json;
  byjg/anydataset-xml;
  byjg/mail-wrapper;
  byjg/migration;
  byjg/anydataset;
  byjg/convert;
  byjg/webrequest;
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
