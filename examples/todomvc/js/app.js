(function (window) {
  'use strict';

  FlatTodo.TodoHandler = FlatJS.Component.extend(function() {
    var api = {
      initializer: function() {
        this._('$newTodoInput', $('#new-todo'));
        this._('$todoList', $('#todo-list'));
        this._('$newTodoInput').focus();
      },

      bindUI: function() {
        this._('$newTodoInput').on('keyup', this._(addNewTodoOnEnter));
        this._('$todoList').find('.destroy').on('click', this._(destroyTodoItem));
      }
    }

    function destroyTodoItem(e) {
      var todo  = this.findResourceFromNode(e.currentTarget);
      todo.delete();
    }

    function addNewTodoOnEnter(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);

      if (keycode == '13') {
        var val = this.fjsData.newTodo;
        this.fjsData.set('newTodo', '');

        var todo = new FlatTodo.Todo({
          text: val,
          completed: false
        });

        this.fjsData.push('todosList', todo);
      }
    }

    return api;
  });

  // 7.) using callFn to define this.obj as a jQuery object was bad news because FlatJS.MV
  // is expecting this.obj to be a node. Need to a: think of better private namespace and
  // b: store the node within this namespace.
  FlatTodo.runner = new FlatJS.Runner({
    context: FlatTodo
  });

}(window));
