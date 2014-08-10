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
        this.$obj.on('keyup', '#todo-list li .edit', this._(hideTextInputOnEnter));
        this.$obj.on('blur', '#todo-list li .edit', this._(hideTextInput));
        this.$obj.on('dblclick', '#todo-list li', this._(setItemToEditing));
        this.$obj.on('click', '#clear-completed', this._(clearAllCompleted));

        this.fjsData.watch('toggleAll', this._(toggleAll));
        this.subscribe('todos-updated', this._(updateTodosList));
      }
    }

    function addNewTodoOnEnter(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);

      if (keycode == '13') {
        var val  = this.fjsData.newTodo,
            todo = FlatTodo.Todo.create(val);

        this.fjsData.push('todosList', todo);
        this.fjsData.set('newTodo', '');
      }
    }

    function destroyTodoItem(e) {
      var todo  = this.findResourceFromNode(e.currentTarget);
      todo.remove();
      this.publish('todos-updated', [this.fjsData.todosList])
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

    function clearAllCompleted(e) {
      FlatTodo.Todo.clearAllCompleted();
    }

    function toggleAll(prop, oldVal, newVal, obj) {
      $(FlatTodo.Todo.fjsObjects).each(function(i, obj) {
        obj.set('completed', newVal);
      });
    }

    function updateTodosList(todos) {
      this.$obj.find('#todo-count strong').text(todos.length);
    }

    return api;
  });

}(window));
