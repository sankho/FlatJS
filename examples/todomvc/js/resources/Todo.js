(function (window) {
  'use strict';

  // we could pass an object with a publicAPI for each todo
  // if needed, but we only need public static functions (below)
  FlatTodo.Todo = FlatJS.Resource.extend({});

  FlatTodo.Todo.clearAllCompleted = function() {
    for (var i = 0; i < this.fjsObjects.length; i++) {
      if (this.fjsObjects[i].completed) {
        this.fjsObjects[i].remove();
      }
    }
  };

  FlatTodo.Todo.create = function(text, completed) {
    return new FlatTodo.Todo({
      text:      text,
      completed: !!completed
    });
  };

}(window));
