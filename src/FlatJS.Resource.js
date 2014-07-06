/**
 * # FlatJS.Resource
 *
 * FlatJS's take on client side "models." Basically a watchable object with getter and setter functions
 * that execute registered callbacks on changes. Used by FlatJS.Component to set up 2 way bindings.
 *
 * @public
 * @class
 */
FlatJS.Resource = FlatJS.Classy.extend(function() {

  // api is the public object returned representing the
  // public API of FlatJS.Resource
  var api = {

    /**
     * ## FlatJS.Resource.prototype.init
     *
     * Constructor function for FlatJS.Resource. Expects an initial object to be used and extended onto
     * the Resource definition. Also sets up some psuedo private variable for internal node binding &
     * callback saving.
     *
     * @constructor
     * @public
     * @this FlatJS.Resource
     * @param {Object} initialObject
     */
    init: function(initialObject) {
      this._('fjsNodes', []);
      this._('fjsCbs', {});

      if (!this.id || (initialObject && !initialObject.id)) {
        this.id = this._(createTemporaryIdForObject)();
      }

      this.extend(initialObject);
    },


    /**
     * ## FlatJS.Resource.prototype.get
     *
     * Acts as a getter / setter function for variables on the object. Used internally
     * by public fn set; if .get is used to set a variable, the callbacks will not execute.
     *
     * @public
     * @this FlatJS.Resource
     * @param {String} prop
     * @param setter
     */
    get: function(prop, setter) {
      prop    = prop.split('.');
      var obj = this;

      for (var i = 0; i < prop.length; i++) {
        if (setter !== undefined && i === (prop.length - 1)) {
          obj[prop[i]] = setter;
        }

        obj = obj[prop[i]];
      }

      return obj;
    },

    /**
     * ## FlatJS.Resource.prototype.set
     *
     * Setter function will set values onto the object & execute any callbacks
     * bound to the Resource instance from it's .watch function. Nested variables can be accessed
     * by formatting the string appropriately with periods.
     *
     * E.g. exampleResource.set('key.nested', { value: 'string' }); => exampleResource.key.nested = { value : 'string' }
     *
     * @public
     * @this FlatJS.Resource
     * @param {[type]} prop [description]
     * @param {[type]} val  [description]
     */
    set: function(prop, val) {
      var oldVal = this.get(prop);
      this.get(prop, val);

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

    /**
     * ## FlatJS.Resource.prototype.watch
     *
     * Set callbacks on the resource when keys change.
     *
     * @public
     * @this FlatJS.Resource
     * @param {String} prop      Property to watch
     * @param {Function} handler Callback function to execute on property change
     */
    watch: function(prop, handler) {
      var callbacks            = this._('fjsCbs');
      callbacks[prop]          = callbacks[prop] || {};
      callbacks[prop][handler] = callbacks[prop][handler] || [];

      callbacks[prop][handler].push(handler);
      this._('fjsCbs', callbacks);
    },

    /**
     * ## FlatJS.Resource.prototype.unwatch
     *
     * Removes callbacks from the resource when keys change. If no handler is passed,
     * all callbacks are removed.
     *
     * @public
     * @this FlatJS.Resource
     * @param {String} prop      Property to watch
     * @param {Function} handler Callback function to remove
     */
    unwatch: function(prop, handler) {
      var callbacks = this._('fjsCbs');

      if (callbacks && callbacks[prop]) {
        if (handler && callbacks[prop][handler]) {
          delete callbacks[prop][handler];
        } else if (!handler) {
          delete callbacks[prop];
        }
      } else {
        this._('fjsCbs', {});
      }
    },


    /**
     * ## FlatJS.Resource.prototype.extend
     *
     * Extends the object using static method on class.
     *
     * @public
     * @this FlatJS.Resource
     * @param {Object} obj
     */
    extend: function(obj) {
      return FlatJS.Resource.objExtend(this, obj);
    },

    /**
     * ## FlatJS.Resource.prototype.push
     *
     * Special setter function for pushing objects onto an array. Works like .set in terms
     * of interpreting the prop string passed.
     *
     * @public
     * @this FlatJS.Resource
     * @param {String} propString
     * @param val
     */
    push: function(propString, val) {
      var prop = this.get(propString);
      if (prop && typeof prop.push === 'function' && typeof prop.slice === 'function') {
        var arr = prop.slice();
        arr.push(val);
        this.set(propString, arr);
      }
    },

    /**
     * ## FlatJS.Resource.prototype.delete
     *
     * Deletes resource. Anyone listening to "fjsDelete" is executed at this point.
     * Need to rename.
     *
     * @public
     * @this FlatJS.Resource
     */
    delete: function() {
      for (n in this._('fjsNodes')) {
        var node = this._('fjsNodes')[n];
        if (node && node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }

      var index = this.constructor.fjsObjects.indexOf(this);
      this.constructor.fjsObjects.splice(index, 1);
      this.set('fjsDelete', true);
    }

    // end public api object
  };

  /**
   * ## FlatJS.Resource.prototype._(createTemporaryIdForObject)
   *
   * Creates a temporary ID for the object if none is provided.
   *
   * @public
   * @this FlatJS.Resource
   */
  function createTemporaryIdForObject() {
    var temp_id = Math.floor((Math.random() * 9999) + 1) * -1;

    if (this.constructor.find(temp_id)) {
      return this._(createTemporaryIdForObject)();
    } else {
      return temp_id;
    }
  }

  /**
   * ## FlatJS.Resource.prototype.callAllFunctions
   *
   * Calls all functions in the provided cbs array and alerts them
   * of the value change.
   *
   * @private
   * @static
   * @param {Array} cbs           Array of callbacks
   * @param {String} prop         Property being changed
   * @param oldVal                Previous value of property on object
   * @param val                   New value of property on object
   * @param {FlatJS.Resource} obj Object being changed
   */
  function callAllFunctions(cbs, prop, oldVal, val, obj) {
    for (var i = 0; i < cbs.length; i++) {
      var cb = cbs[i];

      if (typeof cb == 'function') {
        cb(prop, oldVal, val, obj);
      }
    }
  }

  // end of Classy extension, returns public api object and closes scope.
  return api;
});

/**
 * ## FlatJS.Resource.find
 *
 * Traverses through all created children of Resource and finds the
 * object matching the id value supplied.
 *
 * @public
 * @static
 * @param  {Number} id                 ID of resource object in question.
 * @return {FlatJS.Resource||Boolean}  Returns false if nothing is found, or the resource object if it is found
 */
FlatJS.Resource.find = function(id) {
  var obj;

  for (var i = 0; i < this.fjsObjects.length && !obj; i++) {
    var _obj = this.fjsObjects[i];

    if (_obj.id == id) {
      obj = _obj;
    }
  }

  return obj;
}

/**
 * ## FlatJS.Resource.objExtend
 *
 * Blatantly robbing the object extension function from jQuery. The below is a copy paste job.
 * Removed the inline comments for cleaner docs. See jQuery source for more.
 *
 * @public
 * @static
 */
FlatJS.Resource.objExtend = (function(){
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
    if ( !obj || _type(obj) !== "object" || obj.nodeType || _isWindow( obj ) ) {
      return false;
    }

    try {
      if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

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

    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[1] || {};
      i = 2;
    }

    if ( typeof target !== "object" && !_isFunction(target) ) {
      target = {};
    }

    if ( length === i ) {
      target = this;
      --i;
    }

    for ( ; i < length; i++ ) {
      if ( (options = arguments[ i ]) != null ) {
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];

          if ( target === copy ) {
            continue;
          }

          if ( deep && copy && ( _isPlainObject(copy) || (copyIsArray = _isArray(copy)) ) ) {
            if ( copyIsArray ) {
              copyIsArray = false;
              clone = src && _isArray(src) ? src : [];

            } else {
              clone = src && _isPlainObject(src) ? src : {};
            }

            target[ name ] = _extend( deep, clone, copy );

          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }
    return target;
  };

  return _extend;
}());
