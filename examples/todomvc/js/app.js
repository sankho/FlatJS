(function (window) {
  'use strict';

  FlatTodo.TodoHandler = FlatJS.MV.extend(function() {
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
      var keycode = (e.keyCode ? e.keyCode : e.which),
          val     = this._('$newTodoInput').val();

      if (keycode == '13') {
        this._('$newTodoInput').val('');

        var todo = new FlatTodo.Todo({
          text: val,
          completed: true
        });

        // 6.) the below could be more automated / easier... as in only one command
        // this.JSON.set('todosList', this.JSON.todosList.push(todo)); <-- not bad, little ugly though
        // this.JSON.set('todosList', 'push', todo); <-- kind of like this one myself
        // either command should elimate the need for all the below bullshit; e.g. no re-rendering
        // so make sure .watch is set on all json-keys etc like models are. 2-way binding, I think.
        this.JSON.todosList.push(todo);
        this.renderFromJSON();
        this.render();
      }
    }

    return api;
  });

  // 7.) using callFn to define this.obj as a jQuery object was bad news because FlatJS.MV
  // is expecting this.obj to be a node. Need to a: think of better private namespace and
  // b: store the node within this namespace.
  FlatTodo.runner = new FlatJS.ModuleRunner({
    context: FlatTodo
  });

}(window));
