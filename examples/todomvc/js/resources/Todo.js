// Create our resource by extending FlatJS.Resource with an empty object.
// we could pass an object with a publicAPI for member functions
// if needed, but we only need public static functions (below)
FlatTodo.Todo = FlatJS.Resource.extend({});

// A static method on the class, where "this" refers to FlatTodo.Todo.
// This method in particular cycles through all created children and removes
// them if they are completed. fjsObjects is a static array on every Resource
// containing each of the children.
FlatTodo.Todo.clearAllCompleted = function() {
  for (var i = 0; i < this.fjsObjects.length; i++) {
    if (this.fjsObjects[i].completed) {
      this.fjsObjects[i].remove();
    }
  }

  // uses the Dispatch module to show todo items have been updated 
  FlatJS.Dispatch.publish('todos-updated', [this.fjsObjects]);
};

// Public static method to ease creation of a new todo object.
// Also uses the dispatch module to publish that todos have been updated
FlatTodo.Todo.create = function(text, completed) {
  var todo = new FlatTodo.Todo({
    text:      text,
    completed: !!completed
  });

  FlatJS.Dispatch.publish('todos-updated', [this.fjsObjects])
  return todo;
};

