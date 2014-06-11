var FlatJS = FlatJS || {};

/**
 * Codez go here.
 *
 * @module ModuleRunner
 */
FlatJS.ModuleRunner = (function() {

  /**
   * Function to be treated as prototype class, returned at bottom of closure.
   *
   * @method
   * @private
   * @param  {Object} opts Extendable options
   */
  function moduleRunner(opts) {
    opts = opts || {};

    var context = opts.context || window,
        node    = opts.node    || document,
        init    = opts.init !== undefined ? opts.init : true,
        attr    = opts.attr    || 'data-js-module',
        findFn  = opts.findFn  || function(fn){fn()},
        callFn  = opts.callFn  || false;

    var getAllElementsWithAttribute = FlatJS.Helpers.getAllElementsWithAttribute;

    /**
     * Inits the module runner on all children nodes - exposed as public so devs can run
     * the loader on <divs> after ajax calls, JS manipulation, etc.
     *
     * @param  {Object} _node DOM node to be inspected
     * @public
     * @method
     */
    this.init = function(_node) {
      _node = _node || node;
      var elems      = getAllElementsWithAttribute(attr, _node),
          elemLength = elems.length;

      for (var i = 0; i < elemLength; i++) {
        this.moduleInit(elems[i]);
      }
    }

    /**
     * Recursive search through an object - or window by default -
     * looking for a function which matches the string being sought
     * after. Accounts for object depth w/ string splitting by period,
     * type checking, array splicing, and recursion.
     *
     * @param  {Object} objNode         DOM object to attach method to after execution
     * @param  {String / Array} c       Starts as a string, but can be an array representing the object being sought.
     * @param  {Object} parent          The current namespace / context functions are being sought within.
     * @param  {String} origName        Stores the name as it comes in for pointer purposes.
     * @return {Object}                 Oughta return an object w/ the result of the executed method.
     */
    function findAndCallModuleByString(objNode, c, parent, origName) {
      origName = origName || c;

      if (c.indexOf('.') !== -1) {
        c = c.split('.');
      }

      if (typeof c === 'string' && typeof parent[c] === 'function') {
        return runMethodOnObj(parent[c], objNode, origName);
      } else if (typeof c !== 'object') {
        return false;
      }

      var obj    = parent[c[0]];
      var fn     = obj[c[1]];

      if (typeof obj === 'object' && typeof fn === 'function') {
        return runMethodOnObj(fn, objNode, origName);
      } else if (typeof fn === 'object' && c[2]) {
        c.splice(0, 1);
        return findAndCallModuleByString(objNode, c, obj, origName);
      }
    }

    /**
     * Private method takes a function, executes it using
     * the new keyword (assuming the function is a prototype),
     * and attaches the result to the supplied node's object as
     * an array. Behavoir of how function is called can be extended
     * by using the options (see above, callFn).
     *
     * @param  {Function} fn      Function to be called
     * @param  {Object}   objNode DOM element to place return of function within
     * @return {Object}           Should return whatever that function returns; assuming it's an object.
     * @return {String}   name    String used to identify function w/ namespaces
     */
    function runMethodOnObj(fn, objNode, name) {
      if (!objNode.jsModules) {
        objNode.jsModules = {};
      }

      if (typeof callFn === 'function') {
        var obj = callFn(fn, objNode);
      } else {
        var obj = new fn(objNode);
      }

      objNode.jsModules[name] = obj;
      return obj;
    }

    /**
     * Looks at a single node, checks it for any attached JS modules, and
     * runs them as needed. Exposed publically for use after Ajax requests etc.
     *
     * @public
     * @param  {Object} objNode DOM Object to be inspected.
     */
    this.moduleInit = function(objNode) {
      var controllers = objNode.getAttribute(attr);

      if (typeof controllers !== 'string') {
        return;
      }
      controllers  = controllers.split(' ');
      var conCount = controllers.length;
      for (var i=0; i<conCount; i++) {
        (function() {
          var c = controllers[i];
          var camel = c.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() }).replace(/\s+/g, '');

          findFn(function() {
            findAndCallModuleByString(objNode, camel, context);
          }, objNode, c);
        }())
      }
    }

    if (init) {
      this.init();
    }
  }

  return moduleRunner;

}());
