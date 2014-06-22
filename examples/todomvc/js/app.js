(function (window) {
  'use strict';

  FlatTodo.TodoHandler = FlatJS.MV.extend(function() {
    return {
      initializer: function() {
        this._('newTodoInput', document.getElementById('new-todo'));
      }
    }
  })

  FlatTodo.runner = new FlatJS.ModuleRunner({
    context: FlatTodo
  });

}(window));
