var FlatJS = FlatJS || {};

FlatJS.Helpers = (function() {

  var helpers = FlatJS.Classy.extend({

    isArray: function(someVar) {
      return Object.prototype.toString.call(someVar) === '[object Array]';
    },

    /**
     * Takes a node as an argument, and looks through that node for all
     * children elements with the given attribute.
     *
     * @param  {String} attribute DOM attribute to look for within nodes
     * @param  {Object} _node     DOM Object to traverse through
     * @method
     * @public
     * @static
     * @return {Array}            An array of all matching elements.
     */
    getAllElementsWithAttribute: function(attribute, _node) {
      _node = _node || node;
      var matchingElements = [],
          allElements      = _node.getElementsByTagName('*'),
          elemLength       = allElements.length;

      for (var i = 0; i < elemLength; i++) {
        if (allElements[i].getAttribute(attribute) !== null) {
          matchingElements.push(allElements[i]);
        }
      }

      if (_node !== document && _node.getAttribute && _node.getAttribute(attribute) !== null) {
        matchingElements.push(_node);
      }

      return matchingElements;
    },

    /**
     * Recursive search through an object - or window by default -
     * looking for a function which matches the string being sought
     * after. Accounts for object depth w/ string splitting by period,
     * type checking, array splicing, and recursion.
     *
     * @param  {String / Array} c       Starts as a string, but can be an array representing the object being sought.
     * @param  {Object} parent          The current namespace / context functions are being sought within.
     * @return {Function / Boolean}     Oughta return the function it's finding or false
     */
    findFunctionByString: function(c, parent, defaultValue) {
      parent     = parent || window;

      if (c.indexOf('.') !== -1) {
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
  });

  return new helpers();

}());
