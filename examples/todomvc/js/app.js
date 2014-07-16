(function (window) {
  'use strict';

  FlatTodo.Todo = FlatJS.Resource.extend({})
  FlatTodo.Todo.clearAllCompleted = function() {
    for (var i = 0; i < this.fjsObjects.length; i++) {
      if (this.fjsObjects[i].completed) {
        this.fjsObjects[i].delete();
      }
    }
  }

  FlatTodo.TodoHandler = FlatJS.Component.extend(function() {
    var api = {
      initializer: function() {
        this.$obj = $(this.obj);
        this.$obj.find('#new-todo').focus();
      },

      bindUI: function() {
        this.$obj.on('click', '.destroy', this._(destroyTodoItem));
        this.$obj.on('keyup', '#new-todo', this._(addNewTodoOnEnter));
        this.$obj.on('keyup', '#todo-list li .edit', this._(hideTextInputOnEnter));
        this.$obj.on('blur', '#todo-list li .edit', this._(hideTextInput));
        this.$obj.on('dblclick', '#todo-list li', this._(setItemToEditing));
        this.$obj.on('click', '#clear-completed', this._(clearAllCompleted));
      }
    }

    function clearAllCompleted(e) {
      FlatTodo.Todo.clearAllCompleted();
    }

    function addNewTodoOnEnter(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);

      if (keycode == '13') {
        var val = this.fjsData.newTodo;

        var todo = new FlatTodo.Todo({
          text: val,
          completed: false
        });

        this.fjsData.set('newTodo', '');
        this.fjsData.push('todosList', todo);
      }
    }

    function destroyTodoItem(e) {
      var todo  = this.findResourceFromNode(e.currentTarget);
      todo.delete();
    }

    function hideTextInputOnEnter(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which)
      if (keycode == '13') {
        this._(hideTextInput)(e);
      }
    }

    function hideTextInput(e) {
      $(e.currentTarget).parent().removeClass('editing');
    }

    function setItemToEditing(e) {
      e.preventDefault();
      $(e.currentTarget).addClass('editing').find('input').focus();
    }

    return api;
  });

  FlatTodo.runner = new FlatJS.Runner({
    context: FlatTodo
  });

}(window));
