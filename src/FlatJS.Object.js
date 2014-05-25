FlatJS.Object = (function() {
  

  var FJSObject = FlatJS.Classy.extend({

    init: function(initialObject) {
      this._('initialObject', initialObject);

      this._(setupWatchFunctionality)();

      this = FJSObject.extend({}, this, initialObject);
    }

  });

  var FJSObject.extend = function(){
    "use strict";

    var _class2type = {};

    var _type = function( obj ) {
      return obj == null ?
        String( obj ) :
        _class2type[ toString.call(obj) ] || "object";
    };

    var _isWindow = function( obj ) {
      return obj != null && obj == obj.window;
    };

    var _isFunction = function(target){
      return toString.call(target) === "[object Function]";
    };

    var _isArray =  Array.isArray || function( obj ) {
        return _type(obj) === "array";
    };

    var _isPlainObject = function( obj ) {
      // Must be an Object.
      // Because of IE, we also have to check the presence of the constructor property.
      // Make sure that DOM nodes and window objects don't pass through, as well
      if ( !obj || _type(obj) !== "object" || obj.nodeType || _isWindow( obj ) ) {
        return false;
      }

      try {
        // Not own constructor property must be Object
        if ( obj.constructor &&
          !hasOwn.call(obj, "constructor") &&
          !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
          return false;
        }
      } catch ( e ) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
      }

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.

      var key;
      for ( key in obj ) {}

      return key === undefined || hasOwn.call( obj, key );
    };

    var _extend = function() {
      var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

      // Handle a deep copy situation
      if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if ( typeof target !== "object" && !_isFunction(target) ) {
        target = {};
      }

      if ( length === i ) {
        target = this;
        --i;
      }

      for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
          // Extend the base object
          for ( name in options ) {
            src = target[ name ];
            copy = options[ name ];

            // Prevent never-ending loop
            if ( target === copy ) {
              continue;
            }

            // Recurse if we're merging plain objects or arrays
            if ( deep && copy && ( _isPlainObject(copy) || (copyIsArray = _isArray(copy)) ) ) {
              if ( copyIsArray ) {
                copyIsArray = false;
                clone = src && _isArray(src) ? src : [];

              } else {
                clone = src && _isPlainObject(src) ? src : {};
              }

              // Never move original objects, clone them
              target[ name ] = _extend( deep, clone, copy );

            // Don't bring in undefined values
            } else if ( copy !== undefined ) {
              target[ name ] = copy;
            }
          }
        }
      }
      // Return the modified object
      return target;
    };

    // return {
    //   class2type: _class2type,
    //   type: _type,
    //   isWindow: _isWindow,
    //   isFunction: _isFunction,
    //   isArray: _isArray,
    //   isPlainObject: _isPlainObject,
    //   extend: _extend
    // }
    
    return _extend;
  }();

  /*
   * object.watch polyfill
   *
   * 2012-04-03
   *
   * By Eli Grey, http://eligrey.com
   * Public Domain.
   * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
   */
  function setupWatchFunctionality() {
    if (!Object.prototype.watch) {
      Object.defineProperty(Object.prototype, "watch", {
          enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop, handler) {
          var
            oldval = this[prop]
          , newval = oldval
          , getter = function () {
            return newval;
          }
          , setter = function (val) {
            oldval = newval;
            return newval = handler.call(this, prop, oldval, val);
          }
          ;
          
          if (delete this[prop]) { // can't watch constants
            Object.defineProperty(this, prop, {
                get: getter
              , set: setter
              , enumerable: true
              , configurable: true
            });
          }
        }
      });
    }
     
    // object.unwatch
    if (!Object.prototype.unwatch) {
      Object.defineProperty(Object.prototype, "unwatch", {
          enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop) {
          var val = this[prop];
          delete this[prop]; // remove accessors
          this[prop] = val;
        }
      });
    }
  }

  return FJSObject;

}());