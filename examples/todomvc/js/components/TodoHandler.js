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

    // all event bindings & internal app subscriptions (using a pubsub model)
    // should be placed in this function which runs after intializer() above
    // when the Component is initialized.
    bindUI: function() {
      // this._ wrapper is inherited from FlatJS.Classy, it wraps a function and returns
      // a function where "this" will always be the instance of the class. As long as
      // anonymous functions aren't used, "this" stays consistent throughout your file.
      this.$obj.on('click', '.destroy', this._(destroyTodoItem));
      this.$obj.on('keyup', '#new-todo', this._(addNewTodoOnEnter));
      this.$obj.on('keyup', '#todo-list li .edit', this._(hideTextInputOnEnter));
      this.$obj.on('blur', '#todo-list li .edit', this._(hideTextInput));
      this.$obj.on('dblclick', '#todo-list li', this._(setItemToEditing));
      this.$obj.on('click', '#clear-completed', this._(clearAllCompleted));

      // the component's data model, fjsData, is an instance of FlatJS.Resource
      // all it's elements are watchable, so this is how we "watch" to see if 
      // the user toggled a checkbox. Just another way to do things.
      this.fjsData.watch('toggleAll', this._(toggleAll));

      // subscribes to FlatJS's pubsub system (see FlatJS.Dispatch)
      // using "this.subscribe" ensures that if the component is destroyed 
      // by this.destroy(), subscriptions are destroyed with that component.
      // Global subcribe & publish methods can be accessed to the same pool
      // via FlatJS.Dispatch (see /js/resources/todo.js for an example)
      this.subscribe('todos-updated', this._(updateTodosCount));
    }
  }

  // private member function, used as an event callback for keyup events
  // on the new todo input. If the key pressed is "enter" or "13", a new todo
  // is created using the value of the input
  function addNewTodoOnEnter(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);

    if (keycode == '13') {
      // notice we're referencing "this," because the callback is wrapped in this._
      // from within the public this.bindUI function.
      var val  = this.fjsData.newTodo,
          // and we create the new todo using a static class helper
          // method we've defined in js/resources/todo.js
          todo = FlatTodo.Todo.create(val);

      // fjsData & all FlatJS.Resources have "push" methods to push objects onto
      // arrays and then simpler "set" methods to simply set values. Both trigger
      // callbacks if any are set.
      this.fjsData.push('todosList', todo);
      this.fjsData.set('newTodo', '');
    }
  }

  // destroys the todo item in question. an event callback for clicks of .destroy
  function destroyTodoItem(e) {
    // note this.findResourceFromNode - it takes the node that triggered the event,
    // and recursively searches within the markup for it's parent resource. Specifically,
    // it's looking for a parent node with the attributes fjs-resource & fjs-id to identify
    // and load a single fjs resource.
    var todo  = this.findResourceFromNode(e.currentTarget);
    
    // FlatJS.Resource.prototype.remove removes the item & any bound nodes from markup.
    todo.remove();
    // Since we changed the markup, we need to reload our component's model (this.fjsData)
    // by calling this.assembleFjsData()
    this.assembleFjsData();
    this.publish('todos-updated', [this.fjsData.todosList]);
  }

  // if any "input.edit" nodes trigger a keyup, this watches it and hides the text input
  // if the keypress is enter. No need to update the text value via JS as two way bindings
  // does this for us - bot the input.edit and the label have fjs-key="text" set to them.
  function hideTextInputOnEnter(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which)
    if (keycode == '13') {
      this._(hideTextInput)(e);
    }
  }

  // Used to hide the text input.edit node within each item if the user clicks off of it or
  // if enter is pressed (see above)
  function hideTextInput(e) {
    $(e.currentTarget).parent().removeClass('editing');
  }

  // Triggered by double clicking a todo item. Swaps the editing class to on on the <li>
  // and then focuses on the input
  function setItemToEditing(e) {
    e.preventDefault();
    $(e.currentTarget).addClass('editing').find('input').focus();
  }

  // Uses a custom static method written on FlatTodo.Todo which removes all completed
  // and also publishes 'todos-updated' 
  function clearAllCompleted(e) {
    FlatTodo.Todo.clearAllCompleted();
  }

  // toggles all todo items to "on" - probably should be a static method on FlatTodo.Todo.
  function toggleAll(prop, oldVal, newVal, obj) {
    // notice that we're looking over something called "fjsObjects" on the FlatTodo.Todo resource
    // statically - "fjsObjects" is a static array avialable on anything which is an extension of
    // FlatJS.Classy (most things with FlatJS), and contains all created children of a given
    // class.
    $(FlatTodo.Todo.fjsObjects).each(function(i, obj) {
      obj.set('completed', newVal);
    });
  }

  // A subscription to the FlatJS.Dispatch 'todos-updated' call which updates how many
  // todos are left.
  function updateTodosCount(todos) {
    this.$obj.find('#todo-count strong').text(todos.length);
  }

  // return the publicAPI defined object above
  return publicAPI;
});
