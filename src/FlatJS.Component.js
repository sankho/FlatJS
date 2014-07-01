var FlatJS = FlatJS || {};

FlatJS.Component = FlatJS.Widget.extend(function() {

  var ATTR = {
    resource: 'fjs-resource',
    json:     'fjs-json',
    id:       'fjs-id',
    class:    'fjs-class',
    key:      'fjs-key',
    array:    'fjs-array',
    object:   'fjs-obj'
  },
  convertCamelCase = FlatJS.Helpers.convertDashedToCamelCase;

  var api = {

    fjsData: undefined,

    render: function() {
      this._(internalInitializer)();
      this._(findAndInitializeResources)();
      this._(assembleJSON)();
      this._(applyCSSChanges)();
      this._(bindNodes)();
      this._(syncBindedNodes)();
      this.initializer();
      this.renderUI();
      this.syncUI();
      this.bindUI();
    },

    findResourceFromNode: function(node) {
      if (node.hasAttribute && node.hasAttribute(ATTR.resource) && node.hasAttribute(ATTR.id)) {
        var model = findFn(node.getAttribute(ATTR.resource));
        return model.find(node.getAttribute(ATTR.id));
      } else if (node === document) {
        return false;
      } else {
        return this.findResourceFromNode(node.parentNode);
      }
    }
  }


  function findFn(string) {
    return FlatJS.Helpers.findFunctionByString(convertCamelCase(string));
  }

  function internalInitializer() {
    this.fjsData = this.fjsData || new FlatJS.Resource();
  }

  function applyCSSChanges() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.class, this.obj);

    for (var i = 0; i < nodes.length; i++) {
      this._(makeCSSChangeOnNode)(nodes[i]);
    }
  }

  function makeCSSChangeOnNode(node) {
    var obj   = this.findResourceFromNode(node),
        rules = JSON.parse(node.getAttribute(ATTR.class)),
        rules = rules[0].push ? rules : [rules];

    for (var i = 0; i < rules.length; i++) {
      var rule      = rules[i],
          prop      = rule[0],
          val       = rule[1],
          className = rule[2],
          secondary = rule[3],
          match     = obj[prop] == val;

      if (match) {
        if (node.className.indexOf(className) === -1) {
          node.className = node.className + ' ' + className + ' ';
        }
        node.className = node.className.replace(secondary, '');
      } else if (!match) {
        node.className = node.className.replace(className, '');
        node.className = node.className.replace(secondary, '');
        if (secondary && node.className.indexOf(secondary) === -1) {
          node.className = node.className + ' ' + secondary + ' ';
        }
      }
    }
  }

  function getValueFromNode(node) {
    var type = node.getAttribute('type');

    if (node.innerHTML) {
      return node.innerHTML;
    } else if (type == 'checkbox' || type == 'radio') {
      return node.checked ? node.value !== 'on' ? node.value : true : node.checked;
    } else if (node.value) {
      return node.value;
    }
  }

  function setValueOnNode(node, value) {
    var type = node.getAttribute('type');

    if (type == 'checkbox' || type == 'radio') {
      if (typeof value === 'boolean') {
        node.checked = value;
      } else if (typeof value === 'string') {
        node.checked = true;
        node.value   = value ? value : node.value;
      } else if (typeof value === 'object') {
        node.checked = value.selected;
        node.value   = value.value;
      }
    } else if (type == 'text') {
      node.value = value;
    } else if (typeof node.value !== 'undefined') {
      node.value = value;
    } else if (typeof node.innerHTML !== 'undefined') {
      node.innerHTML = value;
    }
  }

  function findAndInitializeResources() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.resource, this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i];

      this._(createModelObjectFromNode)(node);
    }
  }

  function createModelObjectFromNode(node) {
    var id        = node.getAttribute(ATTR.id),
        modelName = convertCamelCase(node.getAttribute(ATTR.resource)),
        model     = FlatJS.Helpers.findFunctionByString(
                      modelName,
                      window,
                      FlatJS.Resource.extend({})
                    ),
        obj       = false;

    obj = model.find(id) || new model({ id: id });

    obj.modelName  = obj.modelName  || modelName;
    obj._('fjsNodes').push(node);

    if (node.hasAttribute(ATTR.json)) {
      obj.extend(JSON.parse(node.getAttribute(ATTR.json)));
    }

    this._(stripDataFromNodeAndUpdateObject)(obj, node);

    return obj;
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute) {
        if (child.hasAttribute(ATTR.key)) {
          this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
        } else if (child.hasAttribute(ATTR.array)) {
          this._(checkArrayForModelRelations)(obj, child);
        }
      }

      if (child.childNodes && child.childNodes.length > 0) {
        if (child.hasAttribute && !child.hasAttribute(ATTR.resource)) {
          this._(stripDataFromNodeAndUpdateObject)(obj, child);
        }
      }
    }
  }

  function checkArrayForModelRelations(obj, node) {
    var children  = node.childNodes,
        key       = convertCamelCase(node.getAttribute(ATTR.array)),
        parentObj = obj[key] = obj[key] || [];

    for (var i = 0; i < children.length; i++) {
      var child     = children[i];

      if (child.hasAttribute && child.hasAttribute(ATTR.resource)) {
        var _obj = this._(createModelObjectFromNode)(child);
        if (parentObj.indexOf(_obj) == -1) {
          parentObj.push(_obj);
        }
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = convertCamelCase(node.getAttribute(ATTR.key)),
        val = this._(getValueFromNode)(node);

    obj[key] = val;
  }

  function syncNodeOnObjectChange(prop, oldVal, newVal, obj) {
    for (var i = 0; i < obj._('fjsNodes').length; i++) {
      var node = obj._('fjsNodes')[i];

      if (node && node.getAttribute(ATTR.key) && convertCamelCase(node.getAttribute(ATTR.key)) === prop) {
        this._(setValueOnNode)(node, newVal); 
      } else if (node && obj[prop].length && obj[prop].push && node.getAttribute(ATTR.array) && convertCamelCase(node.getAttribute(ATTR.array)) === prop) {
        this._(syncArrayOnObjectChange)(node, newVal, oldVal, obj);
      }
    }
  }

  function syncArrayOnObjectChange(node, newVal, oldVal, obj) {
    this._(renderJSONArrayOntoNode)(newVal, node);
    this._(bindNodes)(node);
    this._(applyCSSChanges)();
  }


  function renderJSONArrayOntoNode(arr, cnnr) {
    var children = cnnr.childNodes,
        tmpl     = false,
        nodes    = [];

    for (var i = 0; i < children.length && !tmpl; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        tmpl = child.cloneNode(true);
      }
    }

    cnnr.innerHTML = '';

    for (var j = 0; j < arr.length; j++) {
      var _tmpl = tmpl.cloneNode(true),
          node  = this._(renderFromJSON)(_tmpl, arr[j], true);
      if (arr[j].id) {
        node.setAttribute(ATTR.id, arr[j].id);
      }
      cnnr.appendChild(node);
    }
  }

  function renderFromJSON(node, parentObj, returnParent) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.hasAttribute) {
        this._(renderJSONOntoNode)(child, parentObj);
      }
    }

    if (returnParent) {
      return node;
    }
  }

  function renderJSONOntoNode(child, parentObj) {
    var key;

    if (child.hasAttribute(ATTR.key)) {
      key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.key));
      this._(setValueOnNode)(child, parentObj[key]);
      if (parentObj[key] == true && (child.getAttribute('type') === 'radio' || child.getAttribute('type') === 'checkbox')) {
        parentObj[key] = this._(getValueFromNode)(child);
      }
    } else if (child.hasAttribute(ATTR.object)) {
      key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.object));
      this._(renderFromJSON)(child, parentObj[key]);
    } else if (child.getAttribute(ATTR.resource)) {
      key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.resource));
      if (parentObj[key].id) {
        child.setAttribute(ATTR.id, parentObj[key].id);
      }
      this._(renderFromJSON)(child, parentObj[key]);
    } else if (child.hasAttribute(ATTR.array)) {
      var key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.array)),
          arr = parentObj[key];
      if (arr && child.childNodes) {
        this._(renderJSONArrayOntoNode)(arr, child);
      }
    } else if (child.childNodes && child.childNodes.length > 0) {
      this._(renderFromJSON)(child, parentObj);
    }
  }

  function syncBindedNodes() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.key, this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node && node.fjsObject) {
        key  = convertCamelCase(node.getAttribute(ATTR.key)),
        attr = node.fjsObject[key];
        if (attr) {
          this._(setValueOnNode)(node, attr);
        }
      }
    }
  }

  function bindNodes(obj) {
    obj = obj || this.obj;
    this._(bindNodesByType)(ATTR.key, obj);
    this._(bindNodesByType)(ATTR.array, obj);
  }

  function bindNodesByType(attr, obj) {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute(attr, obj);

    for (var i = 0; i < nodes.length; i++) {
      var node  = nodes[i];

      if (node && !node.fjsWatchSet) {
        node.fjsWatchSet = true;

        var key   = convertCamelCase(node.getAttribute(attr)),
            model = this.findResourceFromNode(node) || this.fjsData;

        if (model._('fjsNodes').indexOf(node) === -1) {
          model._('fjsNodes').push(node);
        }

        node.fjsObject = node.fjsObject || model;
        model.watch(key, this._(syncNodeOnObjectChange));
      }
    }
  }

  function assembleJSON(parentObj, children) {
    children        = children || this.obj.childNodes;
    parentObj       = parentObj || this.fjsData;

    var parentIsArray   = FlatJS.Helpers.isArray(parentObj);

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        var isModel = child.hasAttribute(ATTR.resource);
        if (child.hasAttribute(ATTR.key)) {
          var key = convertCamelCase(child.getAttribute(ATTR.key));
          if (child.getAttribute('type') === 'radio') {
            parentObj[key] = parentObj[key] || this._(getValueFromNode)(child);
          } else {
            parentObj[key] = this._(getValueFromNode)(child);
          }
        } else if (isModel || child.hasAttribute(ATTR.object)) {
          this._(constructJSONfromNode)(child, parentObj, isModel, parentIsArray);
        } else if (child.hasAttribute(ATTR.array)) {
          this._(constructJSONfromArray)(child, parentObj, parentIsArray);
        } else {
          this._(assembleJSONIfChildren)(child, parentObj);
        }
      }
    }
  }

  function constructJSONfromArray(cnnr, parentObj, parentIsArray) {
    var children  = cnnr.childNodes,
        stop      = false,
        key       = convertCamelCase(cnnr.getAttribute(ATTR.array));
        parentObj = parentObj[key] = [];

    for (var i = 0; i < children.length && !stop; i++) {
      var child = children[i];
      if (child && child.hasAttribute) {
        if (child.hasAttribute(ATTR.resource)) {
          stop = true;
          this._(assembleJSON)(parentObj, children);
        } else {
          var obj = {};
          parentObj.push(obj);
          this._(assembleJSON)(obj, child.childNodes);
        }
      }
    }
  }

  function constructJSONfromNode(child, parentObj, isModel, parentIsArray) {
    var isObj = child.hasAttribute(ATTR.object),
        key   = convertCamelCase(child.getAttribute(isObj ? ATTR.object : ATTR.array));
    if (isModel) {
      var modelClass = findFn(child.getAttribute(ATTR.resource)),
          obj        = modelClass ? modelClass.find(child.getAttribute(ATTR.id)) : false;
      if (obj && parentIsArray) {
        parentObj.push(obj);
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
