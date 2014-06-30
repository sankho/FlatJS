var FlatJS = FlatJS || {};

/**
 * Codez go here.
 *
 * @module ModuleRunner
 */
FlatJS.Runner = (function() {

  /**
   * Function to be treated as prototype class, returned at bottom of closure.
   *
   * @method
   * @private
   * @param  {Object} opts Extendable options
   */
  function runner(opts) {
    opts = opts || {};

    var context = opts.context || window,
        node    = opts.node    || document,
        init    = opts.init !== undefined ? opts.init : true,
        attr    = opts.attr    || 'fjs-component',
        objKey  = opts.objKey  || 'fjsComponents',
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
     * @param  {String} origName        Stores the name as it comes in for pointer purposes.
     * @param  {Object} parent          The current namespace / context functions are being sought within.
     * @return {Object}                 Oughta return an object w/ the result of the executed method.
     */
    function findAndCallModuleByString(objNode, origName, parent) {
      var fn = FlatJS.Helpers.findFunctionByString(origName, parent);
      return runMethodOnObj(fn, objNode, origName);
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
      if (!objNode[objKey]) {
        objNode[objKey] = {};
      }

      if (typeof callFn === 'function') {
        var obj = callFn(fn, objNode);
      } else {
        var obj = new fn(objNode);
      }

      objNode[objKey][name] = obj;
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
          var camel = FlatJS.Helpers.convertDashedToCamelCase(c);

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

  return runner;

}());
