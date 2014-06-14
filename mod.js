// 'use strict'; // Explicitly do not use strict mode
// We do not have foreknowledge of others' extensions,
// and cannot assume that they 'use strict';

(function(angular) {
  angular.module('ngLocale').
    config(function($provide) {
      $provide.value('services', []);
      // A provider is used to track services,
      // as this is available in all config blocks
      var $$elevenProvider = $provide.provider('$$eleven', {
        services: [],
        // This is not meant as a service, so we leave $get empty
        $get: function() {}
      });

      // $provide cannot be decorated conventionally:
      //   (only those providers named {service}Provider may be decorated);
      //   hence, $provide is a misnomer
      var origProvide = $provide,
        origProvider = origProvide.provider,
        origFactory = origProvide.factory,
        origService = origProvide.service;

      // Stick each service in a list on registration. This ensures uniqueness.
      // This list is consumed by .module('ngEleven').config
      origProvide.provider = function provider(serviceName) {
        if (typeof serviceName === 'string') {
          $$elevenProvider.services.push(serviceName);
        } else if (typeof serviceName === 'object') {
          // Angular internals are all loaded in objects
          for (var name in serviceName) {
            $$elevenProvider.services.push(name);
          }
        }
        return origProvider.apply(this, arguments);
      };
      origProvide.service = function(serviceName) {
        $$elevenProvider.services.push(serviceName);
        return origService.apply(this, arguments);
      };
      origProvide.factory = function(serviceName) {
        $$elevenProvider.services.push(serviceName);
        return origFactory.apply(this, arguments);
      };
    })
  ;

  angular.module('ngEleven', []).
    // These should be set in your app to control debugging.
    constant('eleven', true).    // Debug homespun services
    constant('eleven_', false).  // Debug         -services
    constant('eleven$', false).  // Debug         &services
    constant('eleven$$', false). // Debug        &&services (requires eleven&)

    config(function($provide, $$elevenProvider,
                    eleven, eleven_, eleven$, eleven$$) {

      if (eleven) {
        // Decorate our services, conditionally.
        angular.forEach($$elevenProvider.services, function(serviceName) {
          // This can be improved with RegExp
          if (serviceName[0] === '$') {
            if ((!eleven$$ && (serviceName.slice(0,2) === '$$')) ||
                (!eleven$ && (serviceName[0] === '$')) ||
                serviceName === '$document' ||
                serviceName === '$window' ||
                serviceName === '$log') {
              return;
            } else {
              $provide.decorator(serviceName, function($delegate, $log) {
                var logger = function(key) {
                  var args = Array.prototype.slice.call(arguments, 1);
                  // This format is still up for discussion
                  // Eventually, it will log to a sidebar, outside of the console
                  $log.log('%c' + serviceName + '%c.%c' + key +
                           '%c invoked with arguments:',
                           'color: teal;',    // serviceName in teal
                           'color: black;',
                           'color: blue;',    // method in blue
                           'color: black;');
                  $log.log('\t', args);
                  return $delegate[key].apply($delegate, args);
                };

                if (typeof $delegate === 'object') {
                  angular.forEach($delegate, function(val, key) {
                    window.service = $delegate;
                    logger[key] = (typeof val === 'function') ?
                      logger.bind($delegate, key) :
                      $delegate[key];
                  });

                  return logger;
                } else {
                  return $delegate;
                }
              });
            }
          } else {
            if (!eleven_ && (serviceName[0] === '-')) {
              return;
            } else {
              $provide.decorator(serviceName, function($delegate, $log) {
                var logger = function(key) {
                  var args = Array.prototype.slice.call(arguments, 1);
                  // This format is still up for discussion
                  // Eventually, it will log to a sidebar, outside of the console
                  $log.log('%c' + serviceName + '%c.%c' + key +
                           '%c invoked with arguments:',
                           'color: teal;',    // serviceName in teal
                           'color: black;',
                           'color: blue;',    // method in blue
                           'color: black;');
                  $log.log('\t', args);
                  return $delegate[key].apply($delegate, args);
                };

                if (typeof $delegate === 'object') {
                  angular.forEach($delegate, function(val, key) {
                    logger[key] = (typeof val === 'function') ?
                      logger.bind($delegate, key) :
                      $delegate[key];
                  });

                  return logger;
                } else {
                  return $delegate;
                }
              });
            }
          }
        });
      }
    })
  ;
}(angular) );
