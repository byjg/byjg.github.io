# Error Handler

RestServer uses by default the project `flip/whoops` to handle all the errors. 

It will intercept any exception and return a formatted error message according to the 
OutputProcessor defined in the route.

## How it works

1. Each route has an OutputProcessor that will handle the output of the route. (See [OutputProcessor](outprocessor))
2. Initialize the HttpRequestHandler (it will handle the request and call the route)
3. Once an exception is thrown, the OutputProcessor will call the ErrorHandler 
to handle the exception and return a detailed message (debug, dev, etc) or a simple one suitable
for production.

## Disabling the Error Handler

You can disable the error handler completely and handle the exceptions by yourself.

```php
<?php
use ByJG\RestServer\HttpRequestHandler;

$server = new HttpRequestHandler();
$server->withErrorHandlerDisabled(); // Disable the error handler completely
try {
    $server->handle($routeList);
} catch (\Exception $ex) {
    // Handle the exception
}
```

## Enabling the Detailed Error Handler

You can enable the detailed error handler. It will return a detailed message with the exception message,
stack trace, etc.

```php
<?php
use ByJG\RestServer\HttpRequestHandler;

$server = new HttpRequestHandler();
$server->withDetailedErrorHandler(); // Enable the detailed error handler, for debug purposes
$server->handle($routeList);
```

## Enabling The Twirp Error Handler

If you are implementing a callback or API that connects to a service handler
then you might need return the errors as the twirp service expects. 

To do that change the OutputProcessor to `JsonTwirpOutputProcessor`.

See how to change the OutputProcessor [here](outprocessor).