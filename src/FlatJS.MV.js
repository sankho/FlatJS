var FlatJS = FlatJS || {};

FlatJS.MV = FlatJS.Widget.extend(function() {

  var api = {

    render: function() {
      this._(internalInitializer)();
      this.initializer();
      this._(findAndInitializeModels)();
      this._(assembleJSON)();
      this._(createTemplateFromMarkup)();
      //this.renderFromJSON();
      this.renderUI();
      this._(syncMVKeys)();
      this.syncUI();
      this._(bindMVKeys)();
      this.bindUI();
    },

    JSON: "",

    updateJSON: function(obj) {
      this.JSON = this.JSON.extend(obj);
      return this.JSON;
    },

    renderFromJSON: function(node, parentObj) {
      node         = node || this.tmpl;
      parentObj    = parentObj || this.JSON;
      var children = node.childNodes;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.hasAttribute) {
          if (child.hasAttribute('data-json-key')) {
            var key = child.getAttribute('data-json-key');
            child.innerHTML = parentObj[key];
          } else if (child.getAttribute('data-mv-key')) {
            var key = child.getAttribute('data-mv-key');
            child.innerHTML = parentObj[key];
          } else if (child.hasAttribute('data-json-obj')) {
            var key = child.getAttribute('data-json-obj');
            this.renderFromJSON(child, parentObj[key]);
          } else if (child.getAttribute('data-mv-model')) {
            var modelName = child.getAttribute('data-mv-model'),
                modelId = child.getAttribute('data-mv-id');
            this.renderFromJSON(child, FlatJS.Helpers.findFunctionByString(modelName, window).find(modelId));
          } else if (child.getAttribute('data-json-array')) {
    //            this.renderFromJSON(child);
          } else if (child.childNodes && child.childNodes.length > 0) {
            this.renderFromJSON(child, parentObj);
          }
        }
      }

      this.obj.innerHTML = this.tmpl.innerHTML;
    }
  }

  function internalInitializer() {
    this.JSON = this.JSON || new FlatJS.Object();
  }

  function createTemplateFromMarkup(tmplNode) {
    var tmpl     = tmplNode ? tmplNode : this.obj.cloneNode(true),
        children = tmpl.childNodes;

    if (!this.tmpl) {
      this.tmpl = tmpl;
    }

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        if (child.hasAttribute('data-mv-key') || child.hasAttribute('data-json-key')) {
          child.innerHTML = '';
        } else if (child.hasAttribute('data-mv-id')) {
          child.removeAttribute('data-mv-id');
        } else if (child.hasAttribute('data-json-array')) {
          this._(pruneArrayToOneElementForTemplate)(child);
        }
      }

      if (child.childNodes && child.childNodes.length > 0) {
        this._(createTemplateFromMarkup)(child);
      }
    }
  }

  function pruneArrayToOneElementForTemplate(child) {
    var children = child.childNodes,
        gotFirst = false;

    for (var i = 0; i < children.length; i++) {
      var _child = children[i];

      if (_child.hasAttribute && !gotFirst) {
        gotFirst = true;
      } else if (_child.hasAttribute) {
        _child.remove();
      }
    }
  }

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-model', this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i],
          modelName = node.getAttribute('data-mv-model'),
          model     = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Object.extend({}));

      this._(createModelObjectFromNode)(model, node, modelName);
    }
  }

  function createModelObjectFromNode(model, node, modelName) {
    var id     = node.getAttribute('data-mv-id'),
        obj    = false;

    obj = model.find(id) || new model({ id: id });

    obj.nodes     = obj.nodes || [];
    obj.modelName = obj.modelName || modelName;

    this._(stripDataFromNodeAndUpdateObject)(obj, node);
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute && child.hasAttribute('data-mv-key')) {
        this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
      }

      if (child.childNodes && child.childNodes.length > 0) {
        if (child.hasAttribute && !child.hasAttribute('data-mv-model')) {
          this._(stripDataFromNodeAndUpdateObject)(obj, child);
        }
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = node.getAttribute('data-mv-key'),
        val = node.innerHTML;

    node.object = obj;
    obj.nodes.push(node);
    obj[key] = val;
  }

  function syncMVKeyOnObjectChange(prop, oldVal, newVal, obj) {
    for (var i = 0; i < obj.nodes.length; i++) {
      var node = obj.nodes[i];

      if (node && node.getAttribute('data-mv-key') && node.getAttribute('data-mv-key') === prop) {
        node.innerHTML = newVal;
      }
    }
  }

  function syncMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-key', this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i],
          attr = node.object[node.getAttribute('data-mv-key')];
      if (attr) {
        node.innerHTML = attr;
      }
    }
  }

  function bindMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-key', this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (!node.object._('FJSwatchSet')) {
        node.object._('FJSwatchSet', true);
        node.object.watch(node.getAttribute('data-mv-key'), this._(syncMVKeyOnObjectChange));
      }
    }
  }

  function assembleJSON(parentObj, children) {
    var children  = children || this.obj.childNodes,
        parentObj = parentObj || this.JSON,
        isArray   = FlatJS.Helpers.isArray(parentObj);

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        var isModel = child.hasAttribute('data-mv-model');
        if (child.hasAttribute('data-json-key')) {
          var key = child.getAttribute('data-json-key');
          parentObj[key] = child.innerHTML;
        } else if (isModel || child.hasAttribute('data-json-obj') || child.hasAttribute('data-json-array')) {
          this._(constructJSONfromNode)(child, parentObj, isModel, isArray);
        } else {
          this._(assembleJSONIfChildren)(child, parentObj);
        }
      }
    }
  }

  function constructJSONfromNode(child, parentObj, isModel, isArray) {
    var isObj = child.hasAttribute('data-json-obj'),
        key   = child.getAttribute(isObj ? 'data-json-obj' : 'data-json-array')
    if (isModel) {
      var modelClass = FlatJS.Helpers.findFunctionByString(child.getAttribute('data-mv-model')),
          obj        = modelClass ? modelClass.find(child.getAttribute('data-mv-id')) : false;
      if (obj && isArray) {
        parentObj.push(obj)
      } else if (obj) {
        parentObj[key] = obj;
      }
    } else {
      this._(assembleJSONIfChildren)(child, parentObj, key, isObj);
    }
  }

  function assembleJSONIfChildren(child, parentObj, key, isObj) {
    if (child.childNodes && child.childNodes.length > 0) {
      if (key) {
        parentObj = parentObj[key] = isObj ? {} : [];
      }

      this._(assembleJSON)(parentObj, child.childNodes);
    }
  }

  return api;

});
