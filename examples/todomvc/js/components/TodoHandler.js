(function (window) {
  'use strict';

  // declare our new component by extending the base class.
  // An object can be passed, of a function which returns an object.
  FlatTodo.TodoHandler = FlatJS.Component.extend(function() {
    
    // this object represents your class's public API. it must
    // be returned at the bottom of your function definition.
    var publicAPI = {

      // initializer is run whenever a Component is instantated using
      // the new operator. The component execution pattern is outlined 
      // in it's super class FlatJS.Widget
      initializer: function() {
        // adds a jQuery object for ease and focuses on our todo input.
        this.$obj = $(this.fjsRootNode);
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
      this.assembleFjsData();
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
      this.fjsData.set('todosList', this.fjsData.todosList);
    }

    function toggleAll(prop, oldVal, newVal, obj) {
      $(FlatTodo.Todo.fjsObjects).each(function(i, obj) {
        obj.set('completed', newVal);
      });
    }

    function updateTodosList(todos) {
      this.$obj.find('#todo-count strong').text(todos.length);
    }

    return publicAPI;
  });

}(window));
