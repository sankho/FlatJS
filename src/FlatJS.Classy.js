// defines FlatJS just in case, opens an initial scope.
var FlatJS = FlatJS || {};
(function() {

  // Some private static variables. Two arrays are used to store all private functions + psuedo private variables used by FlatJS.Classy.prototype._ (see below). Initializing and fnTest imported from John Resig - see comments below.
  var fnStore  = [],
      varStore = [],
      initializing = false;
      fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  /**
   * # FlatJS.Classy
   *
   * Base Class definition used throughout FlatJS. Provides a OOP like class pattern based on John Resig's method.
   * See http://ejohn.org/blog/simple-javascript-inheritance.
   * Extended to provide ways to call private member functions to retain the value of "this" throughout
   * your code, as well as a psuedo-private variable storage to save member variables without making them
   * visible via a console.log or similiar method. See FlatJS.Classy.prototype._ below.
   *
   * @public
   */
  FlatJS.Classy = function () {

    /**
     * ## FlatJS.Classy.prototype._
     *
     * Privacy is keen
     *
     * @public
     * @function FlatJS.Classy#_
     * @param {Function|String} fn The function to be executed / variable name to be stored
     * @param {*} val Value of corresponding string in fn
     */
    this._ = function(fn, val) {
      if (typeof fn === 'function') {
        var self  = this,
            store = fnStore[self] = fnStore[self] || [];
        this.icnt = this.icnt || store.length + 1;
        store     = store[this.icnt] = store[this.icnt] || [];

        var finalVal = store[fn] = store[fn] || function() {
          store[fn][self.icnt] = this;
          return fn.apply(self, arguments);
        }
      } else {
        var finalVal = this._(handlePrivateVariableStorage)(fn, val);
      }

      return finalVal;
    }

  // end FlatJS.Classy scope
  }

  /**
   * ## FlatJS.Classy.extend
   *
   * Create a new Class that inherits from this class. Stolen from John Resig, see @link http://ejohn.org/blog/simple-javascript-inheritance/ for full comments on static Extend function.
   *
   * @public
   * @static
   * @function FlatJS.Classy.extend
   * @param  {Object||Function} prop Either an object or a static function which returns an object representing the public API of the new class to be created.
   * @return {Function} Returns the generated constructor.
   */
  FlatJS.Classy.extend = function(prop) {

    if (typeof prop === 'function') {
      prop = prop();
    }

    var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;

    for (var name in prop) {
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // creates a "class" to be returned
    function Class() {
      if (!initializing && this.init) {
        this.init.apply(this, arguments);
      }

      // Add any instantiated children to static objects array
      Class.fjsObjects.push(this);
    }

    // Copy static functions
    for (var name in this) {
      if (!Class[name]) {
        Class[name] = this[name];
      }
    }

    Class.prototype = prototype;

    Class.prototype.constructor = Class;

    Class.extend = arguments.callee;

    // Creates a static store for all created objects of Class, used whenever classes are instantiated (see two comments above)
    Class.fjsObjects = [];

    return Class;
  };

  /**
   * ### FlatJS.Classy.prototype._(handlePrivateVariableStorage) 
   *
   * Private function handles the psuedo private variable storage method. Use like so: this._('privateVar', "oh, hello"), get like so this._('privateVar').replace('hello', 'goodbye') => "oh, goodbye". Stores values in static storage using "this" as reference key.
   *
   * @private
   * @function FlatJS.Classy#handlePrivateVariableStorage
   * @param {String} key
   * @param val
   */
  function handlePrivateVariableStorage(key, val) {
    var store = varStore[this] = varStore[this] || [];
    store = store[key] = store[key] || [];
    this.varcnt = this.varcnt || store.length + 1;

    store[this.varcnt] = typeof val !== 'undefined' ? val : store[this.varcnt] || null;

    return store[this.varcnt];
  }

// end scope.
}());
