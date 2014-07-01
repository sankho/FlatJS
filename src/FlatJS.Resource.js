FlatJS.Resource = (function() {


  var Resource = FlatJS.Classy.extend({

    init: function(initialObject) {
      this._('fjsNodes', []);

      if (!this.id || (initialObject && !initialObject.id)) {
        this.id = this._(createTemporaryIdForObject)();
      }

      this.extend(initialObject);
    },

    set: function(prop, val) {
      var oldVal  = this[prop];
      this[prop]  = val;

      if (this._('fjsCbs')) {
        var propCallbacks = this._('fjsCbs')[prop];

        for (var cba in propCallbacks) {
          var cbs = propCallbacks[cba];

          callAllFunctions(cbs, prop, oldVal, val, this);
        }

        if (this._('fjsCbs')['all']) {
          var cbs = this._('fjsCbs')['all'];
          callAllFunctions(cbs, prop, oldVal, val, this)
        }
      }
    },

    watch: function(prop, handler) {
      var callbacks            = this._('fjsCbs') || {};
      callbacks[prop]          = callbacks[prop] || {};
      callbacks[prop][handler] = callbacks[prop][handler] || [];

      callbacks[prop][handler].push(handler);
      this._('fjsCbs', callbacks);
    },

    unwatch: function(prop, handler) {
      var callbacks = this._('fjsCbs');

      if (callbacks && callbacks[prop]) {
        if (handler && callbacks[prop][handler]) {
          delete callbacks[prop][handler];
        } else if (!handler) {
          delete callbacks[prop];
        }
      }
    },

    extend: function(obj) {
      return Resource.objExtend(this, obj);
    },

    push: function(prop, val) {
      if (this[prop] && typeof this[prop].push === 'function' && typeof this[prop].slice === 'function') {
        var arr = this[prop].slice();
        arr.push(val);
        this.set(prop, arr);
      }
    },

    delete: function() {
      if (this._('fjsNodes')) {
        for (n in this._('fjsNodes')) {
          var node = this._('fjsNodes')[n];
          if (node && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      }
    }

  });

  function createTemporaryIdForObject() {
    var temp_id = Math.floor((Math.random() * 9999) + 1) * -1;

    if (this.constructor.find(temp_id)) {
      return this._(createTemporaryIdForObject)();
    } else {
      return temp_id;
    }
  }

  function callAllFunctions(cbs, prop, oldVal, val, obj) {
    for (var i = 0; i < cbs.length; i++) {
      var cb = cbs[i];

      if (typeof cb == 'function') {
        cb(prop, oldVal, val, obj);
      }
    }
  }

  Resource.objExtend = function(){
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

  Resource.find = function(id) {
    var obj;

    for (var i = 0; i < this.fjsObjects.length && !obj; i++) {
      var _obj = this.fjsObjects[i];

      if (_obj.id == id) {
        obj = _obj;
      }
    }

    return obj;
  }

  return Resource;

}());
