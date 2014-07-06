/**
 * # FlatJS.Helpers
 *
 * Simple static object containing methods commonly used throughout FlatJS.
 *
 * @static
 * @type {Object}
 */
FlatJS.Helpers = {

  /**
   * ## FlatJS.Helpers.convertDashedToCamelCase
   *
   * Converts a string from having dashes between words to being camelCase.
   *
   * @static
   * @function FlatJS.Helpers.convertDashedToCamelCase
   * @param {String} string
   * @return {String}
   */
  convertDashedToCamelCase: function(string) {
    if (string) {
      string = string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() }).replace(/\s+/g, '');
    }

    return string;
  },

  /**
   * ## FlatJS.Helpers.isArray
   *
   * Returns true if the supplied variable is indeed an array.
   *
   * @static
   * @function FlatJS.Helpers.isArray
   * @param someVar
   * @return {Boolean}
   */
  isArray: function(someVar) {
    return Object.prototype.toString.call(someVar) === '[object Array]';
  },

  /**
   * ## FlatJS.Helpers.getAllElementsWithAttribute
   *
   * Takes a node as an argument, and looks through that node for all
   * children elements with the given attribute.
   *
   * @static
   * @function FlatJS.Helpers.getAllElementsWithAttribute
   * @param  {String} attribute DOM attribute to look for within nodes
   * @param  {Object} node      DOM Object to traverse through
   * @return {Array}            An array of all matching elements.
   */
  getAllElementsWithAttribute: function(attribute, node) {
    var matchingElements = [],
        allElements      = node.getElementsByTagName('*'),
        elemLength       = allElements.length;

    for (var i = 0; i < elemLength; i++) {
      if (allElements[i].getAttribute(attribute) !== null) {
        matchingElements.push(allElements[i]);
      }
    }

    if (node !== document && node.getAttribute && node.getAttribute(attribute) !== null) {
      matchingElements.push(node);
    }

    return matchingElements;
  },

  /**
   * ## FlatJS.Helpers.findFunctionByString
   *
   * Recursive search through an object - or window by default -
   * looking for a function which matches the string being sought
   * after. Accounts for object depth w/ string splitting by period,
   * type checking, array splicing, and recursion.
   *
   * @static
   * @param  {String / Array} c       Starts as a string, but can be an array representing the object being sought.
   * @param  {Object} parent          The current namespace / context functions are being sought within.
   * @return {Function / Boolean}     Oughta return the function it's finding or false
   */
  findFunctionByString: function(c, parent, defaultValue) {
    parent     = parent || window;

    if (c.indexOf && c.indexOf('.') !== -1) {
      c = c.split('.');
    }

    if (typeof c === 'string' && typeof parent[c] === 'function') {
      return parent[c];
    } else if (typeof c !== 'object') {
      return false;
    }

    var obj    = parent[c[0]] || {},
        fn     = obj[c[1]];

    if (typeof obj === 'object' && typeof fn === 'function') {
      return fn;
    } else if (typeof fn === 'object' && c[2]) {
      c.splice(0, 1);
      return this.findFunctionByString(c, obj, defaultValue);
    } else if (defaultValue && c[1]) {
      var obj = parent[c[0]] = parent[c[0]] || {};
      c.splice(0, 1);
      return this.findFunctionByString(c, obj, defaultValue);
    } else if (defaultValue) {
      parent[c[0]] = defaultValue;
      return parent[c[0]];
    }
  }

}
