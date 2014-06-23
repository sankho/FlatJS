(function (window) {
  'use strict';

  FlatTodo.TodoHandler = FlatJS.MV.extend(function() {
    var api = {
      initializer: function() {
        this._('$newTodoInput', $('#new-todo'));
        this._('$todoList', $('#todo-list'));
      },

      bindUI: function() {
        this._('$newTodoInput').on('keyup', this._(addNewTodoOnEnter));
        this._('$todoList').find('.destroy').on('click', this._(destroyTodoItem));
      },

      renderUI: function() {
        this._('$todoList').find('li').each(function(i, obj) {
          var todoObj = obj.object,
              $obj    = $(obj);

          // inputs having objects for values fucks up the model object
          todoObj.completed.selected == true ? $obj.addClass('completed') : $obj.removeClass('completed');

          $obj.find('.toggle').attr('checked', todoObj.completed);
        });
      }
    }

    function destroyTodoItem(e) {
      var $btn  = $(e.currentTarget),
          $todo = $btn.parent().parent(),
          id    = $todo.attr('data-mv-id'),
          todo  = FlatTodo.Todo.find(id);

      todo.delete();
    }

    function addNewTodoOnEnter(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which),
          val     = this._('$newTodoInput').val();

      if (keycode == '13') {
        this._('$newTodoInput').val('');

        var todo = new FlatTodo.Todo({
          // IDs should be auto generated
          id: FlatTodo.Todo.objects.length+1,
          text: val,
          completed: {
            value: "on",
            selected: false
          }
        });


        // IDs need to be written into new nodes on
        // re-rendering

        // the below could be more automated / easier
        this.JSON.todosList.push(todo);
        this.renderFromJSON();
        this.initializer();
        this.renderUI();
        this.bindUI();
      }
    }

    return api;
  });

  FlatTodo.runner = new FlatJS.ModuleRunner({
    context: FlatTodo
  });

}(window));
