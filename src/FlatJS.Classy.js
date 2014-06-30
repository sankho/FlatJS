var FlatJS = FlatJS || {};

FlatJS.Classy = (function() {

  var fnStore  = [],
      varStore = [],
      initializing = false;
      fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  function handlePrivateVariableStorage(key, val) {
    var store = varStore[this] = varStore[this] || [];
    store = store[key] = store[key] || [];
    this.varcnt = this.varcnt || store.length + 1;

    store[this.varcnt] = typeof val !== 'undefined' ? val : store[this.varcnt] || null;

    return store[this.varcnt];
  }

  function isFunctionAnonymous(func) {
    var fName;
    var inFunc = func.toString();
    var rExp   = /^function ([^\s]+) \(\)/;
    if (fName = inFunc.match(rExp)) {
      fName = fName[1];
    }

    return fName === null;
  }

  function Classy() {

    /**
     * Privacy is keen
     *
     * @param {Function|String} fn The function to be executed / variable name to be stored
     * @param {*} val Value of corresponding string in fn
     */
    this._ = function(fn, val) {
      if (typeof fn === 'function') {
        // if (!isFunctionAnonymous(fn)) {
          var self  = this,
              store = fnStore[self] = fnStore[self] || [];
          this.icnt = this.icnt || store.length + 1;
          store     = store[this.icnt] = store[this.icnt] || [];

          var finalVal = store[fn] = store[fn] || function() {
            store[fn][self.icnt] = this;
            return fn.apply(self, arguments);
          }
        //   console.log('not anonymous!!');
        // } else {
        //   console.log('anonymous!!');
        //   var self = this;
        //   return function() {
        //     fn.apply(self, arguments);
        //   }
        // }
      } else {
        var finalVal = this._(handlePrivateVariableStorage)(fn, val);
      }

      return finalVal;
    },

    this.later = function(when, fn) {
      return setTimeout(this._(fn), when);
    }

    this.every = function(when, fn) {
      var rt  = setInterval(this._(fn), when),
          obj = {};

      obj.stop = function() {
        clearInterval(rt);
      }

      obj.start = this._(function() {
        return this.every(when, fn);
      });

      return obj;
    }

    this.rand = function(floor, ceil) {
      if (!ceil) {
        ceil = floor;
        floor = 0;
      }

      return Math.floor(Math.random() * (ceil - floor + 1)) + floor;
    }
  }

  // Create a new Class that inherits from this class
  Classy.extend = function(prop) {

    if (typeof prop === 'function') {
      prop = prop();
    }

    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if (!initializing && this.init) {
        this.init.apply(this, arguments);
      }

      // Add to objects array
      Class.fjsObjects.push(this);
    }

    // Copy static functions
    for (var name in this) {
      if (!Class[name]) {
        Class[name] = this[name];
      }
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    // Creates a static store for all created objects of Class
    Class.fjsObjects = [];

    return Class;
  };

  return Classy;

}());
