(function (window) {
  'use strict';

  FlatTodo.TodoHandler = FlatJS.Component.extend(function() {
    var api = {
      initializer: function() {
        this.$obj = $(this.obj);
        this.$obj.find('#new-todo').focus();
      },

      bindUI: function() {
        this.$obj.on('click', '.destroy', this._(destroyTodoItem));
        this.$obj.on('keyup', '#new-todo', this._(addNewTodoOnEnter));
      }
    }

    function destroyTodoItem(e) {
      var todo  = this.findResourceFromNode(e.currentTarget);
      todo.delete();
    }

    function addNewTodoOnEnter(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);

      if (keycode == '13') {
        // the below should work when two way binding is set up
        //var val = this.fjsData.newTodo;
        
        var val = e.currentTarget.value;
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
