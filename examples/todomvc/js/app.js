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

          // 1.) classes should be conditionally added via markup if possible...
          // data-mv-class="['keyValue', 'expectedValue', 'trueClass', 'falseClass']"
          //
          // 2.) inputs having objects for values fucks up the model object - figure out
          // something better. either no objects, or everything has to have objects for values :\
          todoObj.completed.selected == true ? $obj.addClass('completed') : $obj.removeClass('completed');

          // 3.) this is where the whole objects with "checked" or "selected" values is needed / wanted
          // data-mv-select="['keyValue', 'expectedValue']"
          $obj.find('.toggle').attr('checked', todoObj.completed);
        });
      }
    }

    function destroyTodoItem(e) {
      // 4.) this should be this.findModelFromNode(e.currentTarget).delete(); - one / two liner
      // consider term for model... resource? domResource?
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
          // 5.) Temporary IDs need to be written into new nodes on creating
          id: FlatTodo.Todo.objects.length+1,
          text: val,
          completed: {
            value: "on",
            selected: false
          }
        });

        // 6.) the below could be more automated / easier... as in only one command
        // this.JSON.set('todosList', this.JSON.todosList.push(todo)); <-- not bad, little ugly though
        // this.JSON.set('todosList', 'push', todo); <-- kind of like this one myself
        // either command should elimate the need for all the below bullshit
        this.JSON.todosList.push(todo);
        this.renderFromJSON();
        this.initializer();
        this.renderUI();
        this.bindUI();
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
