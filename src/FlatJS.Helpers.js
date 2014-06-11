var FlatJS = FlatJS || {};

FlatJS.Helpers = (function() {

  var helpers = FlatJS.Classy.extend({
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
    }
  });

  return new helpers();

}());
