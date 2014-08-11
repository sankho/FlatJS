(function (window) {
  'use strict';

  // will search the DOM for any nodes with the attr fjs-component
  // and run the function supplied in the value, with reference to
  // a given context, the window object by default
  FlatTodo.runner = new FlatJS.Runner({
    // these are commented out default values that can be extended.
    // context: window,
    // attr:    'fjs-component',
    // callFn:  function(fn, node) {
    //   return new fn(node);
    // }
  });

}(window));
