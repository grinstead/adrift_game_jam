var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.getGlobal = function(passedInThis) {
  var possibleGlobals = ["object" == typeof globalThis && globalThis, passedInThis, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, ];
  for (var i = 0; i < possibleGlobals.length; ++i) {
    var maybeGlobal = possibleGlobals[i];
    if (maybeGlobal && maybeGlobal["Math"] == Math) {
      return maybeGlobal;
    }
  }
  return {valueOf:function() {
    throw new Error("Cannot find global object");
  }}.valueOf();
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.checkEs6ConformanceViaProxy = function() {
  try {
    var proxied = {};
    var proxy = Object.create(new $jscomp.global["Proxy"](proxied, {"get":function(target, key, receiver) {
      return target == proxied && key == "q" && receiver == proxy;
    }}));
    return proxy["q"] === true;
  } catch (err) {
    return false;
  }
};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = false;
$jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
$jscomp.arrayIteratorImpl = function(array) {
  var index = 0;
  return function() {
    if (index < array.length) {
      return {done:false, value:array[index++], };
    } else {
      return {done:true};
    }
  };
};
$jscomp.arrayIterator = function(array) {
  return {next:$jscomp.arrayIteratorImpl(array)};
};
$jscomp.ASSUME_ES5 = false;
$jscomp.ASSUME_NO_NATIVE_MAP = false;
$jscomp.ASSUME_NO_NATIVE_SET = false;
$jscomp.SIMPLE_FROUND_POLYFILL = false;
$jscomp.ISOLATE_POLYFILLS = false;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == "function" ? Object.defineProperty : function(target, property, descriptor) {
  if (target == Array.prototype || target == Object.prototype) {
    return target;
  }
  target[property] = descriptor.value;
  return target;
};
$jscomp.IS_SYMBOL_NATIVE = typeof Symbol === "function" && typeof Symbol("x") === "symbol";
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function(target, key) {
  var polyfilledKey = $jscomp.propertyToPolyfillSymbol[key];
  if (polyfilledKey == null) {
    return target[key];
  }
  var polyfill = target[polyfilledKey];
  return polyfill !== undefined ? polyfill : target[key];
};
$jscomp.polyfill = function(target, polyfill, fromLang, toLang) {
  if (!polyfill) {
    return;
  }
  if ($jscomp.ISOLATE_POLYFILLS) {
    $jscomp.polyfillIsolated(target, polyfill, fromLang, toLang);
  } else {
    $jscomp.polyfillUnisolated(target, polyfill, fromLang, toLang);
  }
};
$jscomp.polyfillUnisolated = function(target, polyfill, fromLang, toLang) {
  var obj = $jscomp.global;
  var split = target.split(".");
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in obj)) {
      return;
    }
    obj = obj[key];
  }
  var property = split[split.length - 1];
  var orig = obj[property];
  var impl = polyfill(orig);
  if (impl == orig || impl == null) {
    return;
  }
  $jscomp.defineProperty(obj, property, {configurable:true, writable:true, value:impl});
};
$jscomp.polyfillIsolated = function(target, polyfill, fromLang, toLang) {
  var split = target.split(".");
  var isNativeClass = split.length === 1;
  var root = split[0];
  var obj;
  if (!isNativeClass && root in $jscomp.polyfills) {
    obj = $jscomp.polyfills;
  } else {
    obj = $jscomp.global;
  }
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in obj)) {
      return;
    }
    obj = obj[key];
  }
  var property = split[split.length - 1];
  var nativeImpl = $jscomp.IS_SYMBOL_NATIVE && fromLang === "es6" ? obj[property] : null;
  var impl = polyfill(nativeImpl);
  if (impl == null) {
    return;
  }
  if (isNativeClass) {
    $jscomp.defineProperty($jscomp.polyfills, property, {configurable:true, writable:true, value:impl});
  } else {
    if (impl !== nativeImpl) {
      $jscomp.propertyToPolyfillSymbol[property] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global["Symbol"](property) : $jscomp.POLYFILL_PREFIX + property;
      property = $jscomp.propertyToPolyfillSymbol[property];
      $jscomp.defineProperty(obj, property, {configurable:true, writable:true, value:impl});
    }
  }
};
$jscomp.initSymbol = function() {
};
$jscomp.polyfill("Symbol", function(orig) {
  if (orig) {
    return orig;
  }
  var SymbolClass = function(id, opt_description) {
    this.$jscomp$symbol$id_ = id;
    this.description;
    $jscomp.defineProperty(this, "description", {configurable:true, writable:true, value:opt_description});
  };
  SymbolClass.prototype.toString = function() {
    return this.$jscomp$symbol$id_;
  };
  var SYMBOL_PREFIX = "jscomp_symbol_";
  var counter = 0;
  var symbolPolyfill = function(opt_description) {
    if (this instanceof symbolPolyfill) {
      throw new TypeError("Symbol is not a constructor");
    }
    return new SymbolClass(SYMBOL_PREFIX + (opt_description || "") + "_" + counter++, opt_description);
  };
  return symbolPolyfill;
}, "es6", "es3");
$jscomp.initSymbolIterator = function() {
};
$jscomp.polyfill("Symbol.iterator", function(orig) {
  if (orig) {
    return orig;
  }
  var symbolIterator = Symbol("Symbol.iterator");
  var arrayLikes = ["Array", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
  for (var i = 0; i < arrayLikes.length; i++) {
    var ArrayLikeCtor = $jscomp.global[arrayLikes[i]];
    if (typeof ArrayLikeCtor === "function" && typeof ArrayLikeCtor.prototype[symbolIterator] != "function") {
      $jscomp.defineProperty(ArrayLikeCtor.prototype, symbolIterator, {configurable:true, writable:true, value:function() {
        return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
      }});
    }
  }
  return symbolIterator;
}, "es6", "es3");
$jscomp.initSymbolAsyncIterator = function() {
};
$jscomp.polyfill("Symbol.asyncIterator", function(orig) {
  if (orig) {
    return orig;
  }
  return Symbol("Symbol.asyncIterator");
}, "es9", "es3");
$jscomp.iteratorPrototype = function(next) {
  var iterator = {next:next};
  iterator[Symbol.iterator] = function() {
    return this;
  };
  return iterator;
};
$jscomp.makeIterator = function(iterable) {
  var iteratorFunction = typeof Symbol != "undefined" && Symbol.iterator && iterable[Symbol.iterator];
  return iteratorFunction ? iteratorFunction.call(iterable) : $jscomp.arrayIterator(iterable);
};
$jscomp.owns = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
$jscomp.polyfill("WeakMap", function(NativeWeakMap) {
  function isConformant() {
    if (!NativeWeakMap || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var map = new NativeWeakMap([[x, 2], [y, 3]]);
      if (map.get(x) != 2 || map.get(y) != 3) {
        return false;
      }
      map["delete"](x);
      map.set(y, 4);
      return !map.has(x) && map.get(y) == 4;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakMap && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakMap;
    }
  } else {
    if (isConformant()) {
      return NativeWeakMap;
    }
  }
  var prop = "$jscomp_hidden_" + Math.random();
  function WeakMapMembership() {
  }
  function isValidKey(key) {
    var type = typeof key;
    return type === "object" && key !== null || type === "function";
  }
  function insert(target) {
    if (!$jscomp.owns(target, prop)) {
      var obj = new WeakMapMembership;
      $jscomp.defineProperty(target, prop, {value:obj});
    }
  }
  function patch(name) {
    if ($jscomp.ISOLATE_POLYFILLS) {
      return;
    }
    var prev = Object[name];
    if (prev) {
      Object[name] = function(target) {
        if (target instanceof WeakMapMembership) {
          return target;
        } else {
          if (Object.isExtensible(target)) {
            insert(target);
          }
          return prev(target);
        }
      };
    }
  }
  patch("freeze");
  patch("preventExtensions");
  patch("seal");
  var index = 0;
  var PolyfillWeakMap = function(opt_iterable) {
    this.id_ = (index += Math.random() + 1).toString();
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillWeakMap.prototype.set = function(key, value) {
    if (!isValidKey(key)) {
      throw new Error("Invalid WeakMap key");
    }
    insert(key);
    if (!$jscomp.owns(key, prop)) {
      throw new Error("WeakMap key fail: " + key);
    }
    key[prop][this.id_] = value;
    return this;
  };
  PolyfillWeakMap.prototype.get = function(key) {
    return isValidKey(key) && $jscomp.owns(key, prop) ? key[prop][this.id_] : undefined;
  };
  PolyfillWeakMap.prototype.has = function(key) {
    return isValidKey(key) && $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_);
  };
  PolyfillWeakMap.prototype["delete"] = function(key) {
    if (!isValidKey(key) || !$jscomp.owns(key, prop) || !$jscomp.owns(key[prop], this.id_)) {
      return false;
    }
    return delete key[prop][this.id_];
  };
  return PolyfillWeakMap;
}, "es6", "es3");
$jscomp.MapEntry = function() {
  this.previous;
  this.next;
  this.head;
  this.key;
  this.value;
};
$jscomp.polyfill("Map", function(NativeMap) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_MAP || !NativeMap || typeof NativeMap != "function" || !NativeMap.prototype.entries || typeof Object.seal != "function") {
      return false;
    }
    try {
      NativeMap = NativeMap;
      var key = Object.seal({x:4});
      var map = new NativeMap($jscomp.makeIterator([[key, "s"]]));
      if (map.get(key) != "s" || map.size != 1 || map.get({x:4}) || map.set({x:4}, "t") != map || map.size != 2) {
        return false;
      }
      var iter = map.entries();
      var item = iter.next();
      if (item.done || item.value[0] != key || item.value[1] != "s") {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0].x != 4 || item.value[1] != "t" || !iter.next().done) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeMap && $jscomp.ES6_CONFORMANCE) {
      return NativeMap;
    }
  } else {
    if (isConformant()) {
      return NativeMap;
    }
  }
  var idMap = new WeakMap;
  var PolyfillMap = function(opt_iterable) {
    this.data_ = {};
    this.head_ = createHead();
    this.size = 0;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillMap.prototype.set = function(key, value) {
    key = key === 0 ? 0 : key;
    var r = maybeGetEntry(this, key);
    if (!r.list) {
      r.list = this.data_[r.id] = [];
    }
    if (!r.entry) {
      r.entry = {next:this.head_, previous:this.head_.previous, head:this.head_, key:key, value:value, };
      r.list.push(r.entry);
      this.head_.previous.next = r.entry;
      this.head_.previous = r.entry;
      this.size++;
    } else {
      r.entry.value = value;
    }
    return this;
  };
  PolyfillMap.prototype["delete"] = function(key) {
    var r = maybeGetEntry(this, key);
    if (r.entry && r.list) {
      r.list.splice(r.index, 1);
      if (!r.list.length) {
        delete this.data_[r.id];
      }
      r.entry.previous.next = r.entry.next;
      r.entry.next.previous = r.entry.previous;
      r.entry.head = null;
      this.size--;
      return true;
    }
    return false;
  };
  PolyfillMap.prototype.clear = function() {
    this.data_ = {};
    this.head_ = this.head_.previous = createHead();
    this.size = 0;
  };
  PolyfillMap.prototype.has = function(key) {
    return !!maybeGetEntry(this, key).entry;
  };
  PolyfillMap.prototype.get = function(key) {
    var entry = maybeGetEntry(this, key).entry;
    return entry && entry.value;
  };
  PolyfillMap.prototype.entries = function() {
    return makeIterator(this, function(entry) {
      return [entry.key, entry.value];
    });
  };
  PolyfillMap.prototype.keys = function() {
    return makeIterator(this, function(entry) {
      return entry.key;
    });
  };
  PolyfillMap.prototype.values = function() {
    return makeIterator(this, function(entry) {
      return entry.value;
    });
  };
  PolyfillMap.prototype.forEach = function(callback, opt_thisArg) {
    var iter = this.entries();
    var item;
    while (!(item = iter.next()).done) {
      var entry = item.value;
      callback.call(opt_thisArg, entry[1], entry[0], this);
    }
  };
  PolyfillMap.prototype[Symbol.iterator] = PolyfillMap.prototype.entries;
  var maybeGetEntry = function(map, key) {
    var id = getId(key);
    var list = map.data_[id];
    if (list && $jscomp.owns(map.data_, id)) {
      for (var index = 0; index < list.length; index++) {
        var entry = list[index];
        if (key !== key && entry.key !== entry.key || key === entry.key) {
          return {id:id, list:list, index:index, entry:entry};
        }
      }
    }
    return {id:id, list:list, index:-1, entry:undefined};
  };
  var makeIterator = function(map, func) {
    var entry = map.head_;
    return $jscomp.iteratorPrototype(function() {
      if (entry) {
        while (entry.head != map.head_) {
          entry = entry.previous;
        }
        while (entry.next != entry.head) {
          entry = entry.next;
          return {done:false, value:func(entry)};
        }
        entry = null;
      }
      return {done:true, value:void 0};
    });
  };
  var createHead = function() {
    var head = {};
    head.previous = head.next = head.head = head;
    return head;
  };
  var mapIndex = 0;
  var getId = function(obj) {
    var type = obj && typeof obj;
    if (type == "object" || type == "function") {
      obj = obj;
      if (!idMap.has(obj)) {
        var id = "" + ++mapIndex;
        idMap.set(obj, id);
        return id;
      }
      return idMap.get(obj);
    }
    return "p_" + obj;
  };
  return PolyfillMap;
}, "es6", "es3");
$jscomp.polyfill("Set", function(NativeSet) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_SET || !NativeSet || typeof NativeSet != "function" || !NativeSet.prototype.entries || typeof Object.seal != "function") {
      return false;
    }
    try {
      NativeSet = NativeSet;
      var value = Object.seal({x:4});
      var set = new NativeSet($jscomp.makeIterator([value]));
      if (!set.has(value) || set.size != 1 || set.add(value) != set || set.size != 1 || set.add({x:4}) != set || set.size != 2) {
        return false;
      }
      var iter = set.entries();
      var item = iter.next();
      if (item.done || item.value[0] != value || item.value[1] != value) {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0] == value || item.value[0].x != 4 || item.value[1] != item.value[0]) {
        return false;
      }
      return iter.next().done;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeSet && $jscomp.ES6_CONFORMANCE) {
      return NativeSet;
    }
  } else {
    if (isConformant()) {
      return NativeSet;
    }
  }
  var PolyfillSet = function(opt_iterable) {
    this.map_ = new Map;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
    this.size = this.map_.size;
  };
  PolyfillSet.prototype.add = function(value) {
    value = value === 0 ? 0 : value;
    this.map_.set(value, value);
    this.size = this.map_.size;
    return this;
  };
  PolyfillSet.prototype["delete"] = function(value) {
    var result = this.map_["delete"](value);
    this.size = this.map_.size;
    return result;
  };
  PolyfillSet.prototype.clear = function() {
    this.map_.clear();
    this.size = 0;
  };
  PolyfillSet.prototype.has = function(value) {
    return this.map_.has(value);
  };
  PolyfillSet.prototype.entries = function() {
    return this.map_.entries();
  };
  PolyfillSet.prototype.values = function() {
    return this.map_.values();
  };
  PolyfillSet.prototype.keys = PolyfillSet.prototype.values;
  PolyfillSet.prototype[Symbol.iterator] = PolyfillSet.prototype.values;
  PolyfillSet.prototype.forEach = function(callback, opt_thisArg) {
    var set = this;
    this.map_.forEach(function(value) {
      return callback.call(opt_thisArg, value, value, set);
    });
  };
  return PolyfillSet;
}, "es6", "es3");
(function() {
  var Module = function(id, opt_exports) {
    this.id = id;
    this.exports = opt_exports || {};
  };
  Module.prototype.exportAllFrom = function(other) {
    var module = this;
    var define = {};
    for (var key in other) {
      if (key == "default" || key in module.exports || key in define) {
        continue;
      }
      define[key] = {enumerable:true, get:function(key) {
        return function() {
          return other[key];
        };
      }(key)};
    }
    $jscomp.global.Object.defineProperties(module.exports, define);
  };
  var CacheEntry = function(def, module, path) {
    this.def = def;
    this.module = module;
    this.path = path;
    this.blockingDeps = new Set;
  };
  CacheEntry.prototype.load = function() {
    if (this.def) {
      var def = this.def;
      this.def = null;
      callRequireCallback(def, this.module);
    }
    return this.module.exports;
  };
  function callRequireCallback(callback, opt_module) {
    var oldPath = currentModulePath;
    try {
      if (opt_module) {
        currentModulePath = opt_module.id;
        callback.call(opt_module, createRequire(opt_module), opt_module.exports, opt_module);
      } else {
        callback($jscomp.require);
      }
    } finally {
      currentModulePath = oldPath;
    }
  }
  var moduleCache = new Map;
  var currentModulePath = "";
  function normalizePath(path) {
    var components = path.split("/");
    var i = 0;
    while (i < components.length) {
      if (components[i] == ".") {
        components.splice(i, 1);
      } else {
        if (i && components[i] == ".." && components[i - 1] && components[i - 1] != "..") {
          components.splice(--i, 2);
        } else {
          i++;
        }
      }
    }
    return components.join("/");
  }
  $jscomp.getCurrentModulePath = function() {
    return currentModulePath;
  };
  function getCacheEntry(id) {
    var cacheEntry = moduleCache.get(id);
    if (cacheEntry === undefined) {
      throw new Error("Module " + id + " does not exist.");
    }
    return cacheEntry;
  }
  var ensureMap = new Map;
  var CallbackEntry = function(requireSet, callback) {
    this.requireSet = requireSet;
    this.callback = callback;
  };
  function maybeNormalizePath(root, absOrRelativePath) {
    if (absOrRelativePath.startsWith("./") || absOrRelativePath.startsWith("../")) {
      return normalizePath(root + "/../" + absOrRelativePath);
    } else {
      return absOrRelativePath;
    }
  }
  function createRequire(opt_module) {
    function require(absOrRelativePath) {
      var absPath = absOrRelativePath;
      if (opt_module) {
        absPath = maybeNormalizePath(opt_module.id, absPath);
      }
      return getCacheEntry(absPath).load();
    }
    function requireEnsure(requires, callback) {
      if (currentModulePath) {
        for (var i = 0; i < requires.length; i++) {
          requires[i] = maybeNormalizePath(currentModulePath, requires[i]);
        }
      }
      var blockingRequires = [];
      for (var i = 0; i < requires.length; i++) {
        var required = moduleCache.get(requires[i]);
        if (!required || required.blockingDeps.size) {
          blockingRequires.push(requires[i]);
        }
      }
      if (blockingRequires.length) {
        var requireSet = new Set(blockingRequires);
        var callbackEntry = new CallbackEntry(requireSet, callback);
        requireSet.forEach(function(require) {
          var arr = ensureMap.get(require);
          if (!arr) {
            arr = [];
            ensureMap.set(require, arr);
          }
          arr.push(callbackEntry);
        });
      } else {
        callback(require);
      }
    }
    require.ensure = requireEnsure;
    return require;
  }
  $jscomp.require = createRequire();
  $jscomp.hasModule = function(id) {
    return moduleCache.has(id);
  };
  function markAvailable(absModulePath) {
    var ensures = ensureMap.get(absModulePath);
    if (ensures) {
      for (var i = 0; i < ensures.length; i++) {
        var entry = ensures[i];
        entry.requireSet["delete"](absModulePath);
        if (!entry.requireSet.size) {
          ensures.splice(i--, 1);
          callRequireCallback(entry.callback);
        }
      }
      if (!ensures.length) {
        ensureMap["delete"](absModulePath);
      }
    }
  }
  $jscomp.registerModule = function(moduleDef, absModulePath, opt_shallowDeps) {
    if (moduleCache.has(absModulePath)) {
      throw new Error("Module " + absModulePath + " has already been registered.");
    }
    if (currentModulePath) {
      throw new Error("Cannot nest modules.");
    }
    var shallowDeps = opt_shallowDeps || [];
    for (var i = 0; i < shallowDeps.length; i++) {
      shallowDeps[i] = maybeNormalizePath(absModulePath, shallowDeps[i]);
    }
    var blockingDeps = new Set;
    for (var i = 0; i < shallowDeps.length; i++) {
      getTransitiveBlockingDepsOf(shallowDeps[i]).forEach(function(transitive) {
        blockingDeps.add(transitive);
      });
    }
    blockingDeps["delete"](absModulePath);
    var cacheEntry = new CacheEntry(moduleDef, new Module(absModulePath), absModulePath);
    moduleCache.set(absModulePath, cacheEntry);
    blockingDeps.forEach(function(blocker) {
      addAsBlocking(cacheEntry, blocker);
    });
    if (!blockingDeps.size) {
      markAvailable(cacheEntry.module.id);
    }
    removeAsBlocking(cacheEntry);
  };
  function getTransitiveBlockingDepsOf(moduleId) {
    var cacheEntry = moduleCache.get(moduleId);
    var blocking = new Set;
    if (cacheEntry) {
      cacheEntry.blockingDeps.forEach(function(dep) {
        getTransitiveBlockingDepsOf(dep).forEach(function(transitive) {
          blocking.add(transitive);
        });
      });
    } else {
      blocking.add(moduleId);
    }
    return blocking;
  }
  var blockingModulePathToBlockedModules = new Map;
  function addAsBlocking(blocked, blocker) {
    if (blocked.module.id != blocker) {
      var blockedModules = blockingModulePathToBlockedModules.get(blocker);
      if (!blockedModules) {
        blockedModules = new Set;
        blockingModulePathToBlockedModules.set(blocker, blockedModules);
      }
      blockedModules.add(blocked);
      blocked.blockingDeps.add(blocker);
    }
  }
  function removeAsBlocking(cacheEntry) {
    var blocked = blockingModulePathToBlockedModules.get(cacheEntry.module.id);
    if (blocked) {
      blockingModulePathToBlockedModules["delete"](cacheEntry.module.id);
      blocked.forEach(function(blockedCacheEntry) {
        blockedCacheEntry.blockingDeps["delete"](cacheEntry.module.id);
        cacheEntry.blockingDeps.forEach(function(blocker) {
          addAsBlocking(blockedCacheEntry, blocker);
        });
        if (!blockedCacheEntry.blockingDeps.size) {
          removeAsBlocking(blockedCacheEntry);
          markAvailable(blockedCacheEntry.module.id);
        }
      });
    }
  }
  $jscomp.registerAndLoadModule = function(moduleDef, absModulePath, shallowDeps) {
    $jscomp.require.ensure([absModulePath], function(require) {
      require(absModulePath);
    });
    $jscomp.registerModule(moduleDef, absModulePath, shallowDeps);
  };
  $jscomp.registerEs6ModuleExports = function(absModulePath, exports) {
    if (moduleCache.has(absModulePath)) {
      throw new Error("Module at path " + absModulePath + " is already registered.");
    }
    var entry = new CacheEntry(null, new Module(absModulePath, exports), absModulePath);
    moduleCache.set(absModulePath, entry);
    markAvailable(absModulePath);
  };
  $jscomp.clearModules = function() {
    moduleCache.clear();
  };
})();
//src/webgames/Input.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {InputManager:{enumerable:true, get:function() {
    return InputManager;
  }}});
  class InputManager {
    constructor(domElement) {
      this._domElement = domElement;
      this._inFocus = document.activeElement === domElement;
      this._presses = new Map;
      this._actionToKeys = new Map;
      domElement.addEventListener("keydown", e => {
        keyChanged(this, e, true);
      });
      domElement.addEventListener("keyup", e => {
        keyChanged(this, e, false);
      });
      domElement.onblur = () => {
        this._presses.clear();
        this._inFocus = false;
      };
      domElement.onfocus = () => {
        this._presses.clear();
        this._inFocus = true;
      };
    }
    setKeysForAction(action, keys) {
      const actionToKeys = this._actionToKeys;
      if (keys != null) {
        actionToKeys.set(action, keys);
      } else {
        actionToKeys["delete"](action);
      }
    }
    isPressed(action) {
      const keys = this._actionToKeys.get(action);
      const presses = this._presses;
      return !!keys && !!keys.some(key => {
        const obj = presses.get(key);
        if (obj) {
          obj.danglingCount = 0;
          return obj.heldSince != null;
        } else {
          return false;
        }
      });
    }
    numPresses(action) {
      const keys = this._actionToKeys.get(action);
      if (keys) {
        const presses = this._presses;
        return keys.reduce((count, key) => {
          const obj = presses.get(key);
          if (obj) {
            const newCount = count + obj.danglingCount;
            obj.danglingCount = 0;
            return newCount;
          } else {
            return count;
          }
        }, 0);
      } else {
        return 0;
      }
    }
    getSignOfAction(negAction, posAction) {
      const neg = this.isPressed(negAction) ? 1 : 0;
      const pos = this.isPressed(posAction) ? 1 : 0;
      return pos - neg;
    }
  }
  function keyChanged(manager, event, isPressed) {
    const key = event.key;
    const presses = manager._presses;
    const object = presses.get(key);
    if (isPressed) {
      if (object == null) {
        presses.set(key, {heldSince:Date.now(), danglingCount:1, });
      } else {
        if (object.heldSince == null) {
          object.heldSince = Date.now();
        }
        object.danglingCount++;
      }
    } else {
      if (object != null) {
        object.heldSince = null;
      }
    }
  }
}, "src/webgames/Input.js", []);

//src/swagl.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {MatrixStack:{enumerable:true, get:function() {
    return MatrixStack;
  }}, Program:{enumerable:true, get:function() {
    return Program;
  }}, Shader:{enumerable:true, get:function() {
    return Shader;
  }}, Texture:{enumerable:true, get:function() {
    return Texture;
  }}, doAnimationFrame:{enumerable:true, get:function() {
    return doAnimationFrame;
  }}, loadTextureFromImgUrl:{enumerable:true, get:function() {
    return loadTextureFromImgUrl;
  }}, loadTextureFromRawBitmap:{enumerable:true, get:function() {
    return loadTextureFromRawBitmap;
  }}, makeSolidTexture:{enumerable:true, get:function() {
    return makeSolidTexture;
  }}, wrapPremadeTexture:{enumerable:true, get:function() {
    return wrapPremadeTexture;
  }}});
  const ShaderType = {FRAGMENT:"fragment", VERTEX:"vertex", };
  const LocationType = {UNIFORM:1, ATTRIBUTE:2, };
  class Location {
    constructor(type, prefix, name) {
      this.name = name;
      this.glName = `${prefix}${name}`;
      switch(type) {
        case "uniform":
          this.type = LocationType.UNIFORM;
          if (prefix !== "u_") {
            throw new Error(`uniform field "${this.glName}" invalid, must start with u_`);
          }
          break;
        case "in":
          this.type = LocationType.ATTRIBUTE;
          if (prefix !== "a_") {
            throw new Error(`in field "${this.glName}" invalid, must start with a_`);
          }
          break;
        default:
          throw new Error("Impossible");
      }
    }
  }
  function findLocations(code) {
    const locs = [];
    code.split("\n").forEach(line => {
      let name, declaration;
      declaration = /^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(line);
      if (declaration) {
        locs.push(new Location(declaration[1], declaration[2], declaration[3]));
      }
    });
    return locs;
  }
  const identityMat = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ]);
  class MatrixStack {
    constructor(gl, anchor) {
      this.gl = gl;
      this.anchor = anchor;
      this._stack = [];
      gl.uniformMatrix4fv(anchor, false, identityMat);
    }
    depth() {
      return this._stack.length;
    }
    peek() {
      const stack = this._stack;
      return stack[stack.length - 1] || identityMat;
    }
    pop() {
      return this._stack.pop();
    }
    pushAbsolute(matrix) {
      this.gl.uniformMatrix4fv(this.anchor, false, matrix);
      this._stack.push(matrix);
    }
    push(matrix) {
      const stack = this._stack;
      if (stack.length === 0) {
        this.pushAbsolute(matrix);
      } else {
        const A = matrix;
        const B = stack[stack.length - 1];
        this.pushAbsolute(new Float32Array([A[0] * B[0] + A[1] * B[4] + A[2] * B[8] + A[3] * B[12], A[0] * B[1] + A[1] * B[5] + A[2] * B[9] + A[3] * B[13], A[0] * B[2] + A[1] * B[6] + A[2] * B[10] + A[3] * B[14], A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3] * B[15], A[4] * B[0] + A[5] * B[4] + A[6] * B[8] + A[7] * B[12], A[4] * B[1] + A[5] * B[5] + A[6] * B[9] + A[7] * B[13], A[4] * B[2] + A[5] * B[6] + A[6] * B[10] + A[7] * B[14], A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7] * B[15], A[8] * 
        B[0] + A[9] * B[4] + A[10] * B[8] + A[11] * B[12], A[8] * B[1] + A[9] * B[5] + A[10] * B[9] + A[11] * B[13], A[8] * B[2] + A[9] * B[6] + A[10] * B[10] + A[11] * B[14], A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11] * B[15], A[12] * B[0] + A[13] * B[4] + A[14] * B[8] + A[15] * B[12], A[12] * B[1] + A[13] * B[5] + A[14] * B[9] + A[15] * B[13], A[12] * B[2] + A[13] * B[6] + A[14] * B[10] + A[15] * B[14], A[12] * B[3] + A[13] * B[7] + A[14] * B[11] + A[15] * B[15], ]));
      }
    }
    pushTranslation(x, y, z = 0) {
      const stack = this._stack;
      const A = stack.length ? stack[stack.length - 1] : identityMat;
      this.pushAbsolute(new Float32Array([A[0], A[1], A[2], A[3], A[4], A[5], A[6], A[7], A[8], A[9], A[10], A[11], x * A[0] + y * A[4] + z * A[8] + A[12], x * A[1] + y * A[5] + z * A[9] + A[13], x * A[2] + y * A[6] + z * A[10] + A[14], x * A[3] + y * A[7] + z * A[11] + A[15], ]));
    }
    pushYRotation(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      this.push(new Float32Array([cos, 0, sin, 0, 0, 1, 0, 0, -sin, 0, cos, 0, 0, 0, 0, 1, ]));
    }
    pushZRotation(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      this.push(new Float32Array([cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ]));
    }
  }
  class Shader {
    constructor(options, code) {
      this.name = options.name;
      var gl = this.gl = options.gl;
      var type = this.type = options.type;
      var glType;
      switch(type) {
        case ShaderType.VERTEX:
          glType = this.gl.VERTEX_SHADER;
          break;
        case ShaderType.FRAGMENT:
          glType = this.gl.FRAGMENT_SHADER;
          break;
        default:
          throw new Error(`Unrecognized shader type "${type}"`);
      }
      this._glType = glType;
      var shader = this._glShader = gl.createShader(glType);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        var message = `Failed to compile ${this.name} ${type}-shader: ${error}`;
        gl.deleteShader(shader);
        throw new Error(message);
      }
      this._locs = findLocations(code);
    }
  }
  class Program {
    constructor(options) {
      this.name = options.name;
      this.projection = options.projection;
      var gl = this.gl = options.gl;
      this.linked = false;
      this._glProgram = gl.createProgram();
      this._shaders = [];
      this.u = {};
      this.a = {};
      this.stack = null;
    }
    attach(...shaders) {
      const gl = this.gl;
      const glProgram = this._glProgram;
      shaders.forEach(shader => {
        this._shaders.push(shader);
        gl.attachShader(glProgram, shader._glShader);
      });
      return this;
    }
    link() {
      if (this.linked) {
        return this;
      }
      var gl = this.gl;
      var glProgram = this._glProgram;
      gl.linkProgram(glProgram);
      if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(glProgram);
        var message = `Failed to link ${this.name} program: ${info}`;
        gl.deleteProgram(glProgram);
        throw new Error(message);
      }
      this.linked = true;
      return this;
    }
  }
  function doAnimationFrame(program, code) {
    var gl = program.gl;
    var glProgram = program._glProgram;
    gl.useProgram(glProgram);
    var u = {}, a = {}, shaders = program._shaders;
    for (var i = 0; i < shaders.length; i++) {
      var locs = shaders[i]._locs;
      for (var j = 0; j < locs.length; j++) {
        var loc = locs[j];
        if (loc.type === LocationType.UNIFORM) {
          if (loc.glName in u) {
            continue;
          }
          u[loc.name] = gl.getUniformLocation(glProgram, loc.glName);
        } else {
          if (loc.glName in a) {
            continue;
          }
          a[loc.name] = gl.getAttribLocation(glProgram, loc.glName);
        }
      }
    }
    program.u = u;
    program.a = a;
    const projection = program.projection;
    if (projection) {
      if (projection in program.u) {
        program.stack = new MatrixStack(gl, program.u[projection]);
      } else {
        throw new Error(`No anchor point "${projection}" in program`);
      }
    }
    try {
      code(gl, program);
    } finally {
      program.u = {};
      program.a = {};
      program.stack = null;
    }
  }
  class Texture {
    constructor(gl, name, width, height, createTexture) {
      this.gl = gl;
      this.name = name;
      this.w = width;
      this.h = height;
      this._glTex = createTexture(gl);
    }
    bindTexture() {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this._glTex);
    }
    passSize(anchor) {
      this.gl.uniform2f(anchor, this.w, this.h);
    }
    rawTexture() {
      return this._glTex;
    }
  }
  function loadTextureFromImgUrl(options) {
    return (new Promise((resolve, reject) => {
      const image = new Image;
      image.onload = () => void resolve(image);
      image.onerror = () => {
        reject(new Error(`failed to load ${options.src}`));
      };
      image.mode = "no-cors";
      image.src = options.src;
    })).then(img => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      return new Texture(options.gl, options.name, width, height, createStandardTexture(gl => {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }));
    });
  }
  function loadTextureFromRawBitmap(options) {
    const {width, height} = options;
    return new Texture(options.gl, options.name, width, height, createStandardTexture(gl => {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, options.bmp, 0);
    }));
  }
  function wrapPremadeTexture(options) {
    return new Texture(options.gl, options.name, options.width, options.height, () => options.tex);
  }
  function createStandardTexture(loader) {
    return gl => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      loader(gl);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.bindTexture(gl.TEXTURE_2D, null);
      return texture;
    };
  }
  function makeSolidTexture(gl, r, g, b, a) {
    return loadTextureFromRawBitmap({name:"solid", width:1, height:1, gl, bmp:new Uint8Array([r, g, b, a]), });
  }
}, "src/swagl.js", []);

//src/sprites.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {Sprite:{enumerable:true, get:function() {
    return Sprite;
  }}, SpriteBuilder:{enumerable:true, get:function() {
    return SpriteBuilder;
  }}, SpriteSet:{enumerable:true, get:function() {
    return SpriteSet;
  }}, characterSpriteSheet:{enumerable:true, get:function() {
    return characterSpriteSheet;
  }}, flatSprite:{enumerable:true, get:function() {
    return flatSprite;
  }}, makeSpriteType:{enumerable:true, get:function() {
    return makeSpriteType;
  }}, spriteSheet:{enumerable:true, get:function() {
    return spriteSheet;
  }}});
  var module$src$swagl = $$require("src/swagl.js");
  const TUPLE_LENGTH = 5;
  let PositionTexPosition;
  let SpriteDatum;
  let SpriteBuilder;
  function makeDatum(set, name, offsets, nPoints) {
    return {_set:set, name, _offsets:offsets, nPoints};
  }
  class SpriteSet {
    constructor(tex, data) {
      this._tex = tex;
      this._buffer = null;
      const internalData = this.data = {};
      const allData = [];
      let numTuples = 0;
      for (const name in data) {
        const sequence = data[name];
        const offsets = [];
        const sequenceLength = sequence.length;
        if (sequenceLength === 0) {
          throw new Error("Sprite declared with 0 points");
        }
        const stepLength = sequence[0].length;
        if (stepLength == 0 || TUPLE_LENGTH % 5 !== 0) {
          throw new Error(`Sprite declared with list of length ${TUPLE_LENGTH} (must be non-zero multiple of 5)`);
        }
        const tuplesPerStep = stepLength / 5;
        for (let i = 0; i < sequenceLength; i++) {
          const tuples = sequence[i];
          if (tuples.length !== stepLength) {
            throw new Error(`Sprite declared with inconsistent lengths of elements`);
          }
          offsets.push(numTuples);
          allData.push.apply(allData, tuples);
          numTuples += tuplesPerStep;
        }
        internalData[name] = makeDatum(this, name, offsets, tuplesPerStep);
      }
      this._rawData = new Float32Array(allData);
    }
    bindTo(program) {
      const gl = this._tex.gl;
      let buffer = this._buffer;
      if (buffer != null) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      } else {
        this._buffer = buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._rawData, gl.STATIC_DRAW);
      }
      gl.activeTexture(gl.TEXTURE0);
      this._tex.bindTexture();
      gl.uniform1i(program.u["texture"], 0);
      gl.enableVertexAttribArray(program.a["texturePosition"]);
      gl.vertexAttribPointer(program.a["texturePosition"], 2, gl.FLOAT, false, 20, 12);
      gl.enableVertexAttribArray(program.a["position"]);
      gl.vertexAttribPointer(program.a["position"], 3, gl.FLOAT, false, 20, 0);
    }
    renderSpriteDatumPrebound(datumName, index) {
      if (!this.data.hasOwnProperty(datumName)) {
        throw new Error(`Can not render unknown "${datumName}"`);
      }
      const datum = this.data[datumName];
      const gl = this._tex.gl;
      const offsets = datum._offsets;
      gl.drawArrays(gl.TRIANGLE_STRIP, offsets[index % offsets.length], datum.nPoints);
    }
  }
  let SpriteDefinition;
  class Sprite {
    constructor(options, frameTimes, mode, time) {
      const {loops} = options;
      this._name = options.name;
      this._startTime = time;
      this._modes = options.modes;
      this._activeMode = mode;
      this._targetLoops = typeof loops === "number" ? loops : loops ? -1 : 0;
      this._spriteSet = options.set;
      this._frameTimes = frameTimes;
      this._currentLoop = 0;
      this._frameIndex = 0;
      this._nextFrameTime = time + frameTimes[0];
      this._frameData = options.perFrameData;
    }
    updateTime(time) {
      let changed = false;
      let nextFrameTime = this._nextFrameTime;
      while (nextFrameTime !== -1 && nextFrameTime <= time) {
        changed = true;
        const frameTimes = this._frameTimes;
        const nextFrame = this._frameIndex + 1;
        if (nextFrame === frameTimes.length) {
          if (this._currentLoop === this._targetLoops) {
            this._nextFrameTime = nextFrameTime = -1;
          } else {
            this._currentLoop++;
            this._frameIndex = 0;
            this._nextFrameTime = nextFrameTime = time + frameTimes[0];
          }
        } else {
          this._frameIndex = nextFrame;
          this._nextFrameTime = nextFrameTime = time + frameTimes[nextFrame];
        }
      }
      return changed;
    }
    setMode(mode) {
      if (mode === this._activeMode) {
        return;
      }
      if (!this._modes.includes(mode)) {
        throw new Error(`${this} does not have mode ${mode}`);
      }
      this._activeMode = mode;
    }
    frameIndex() {
      return this._frameIndex;
    }
    frameData() {
      const frameData = this._frameData;
      return frameData != null ? frameData[this._frameIndex] : undefined;
    }
    isFinished() {
      return this._nextFrameTime === -1;
    }
    resetSprite(mode, time) {
      if (!this._modes.includes(mode)) {
        throw new Error(`${this} does not have mode ${mode}`);
      }
      this._currentLoop = 0;
      this._startTime = time;
      this._activeMode = mode;
      this._frameIndex = 0;
      this._nextFrameTime = time + this._frameTimes[0];
    }
    renderSprite(program) {
      this._spriteSet.bindTo(program);
      this._spriteSet.renderSpriteDatumPrebound(this._activeMode, this._frameIndex);
    }
    name() {
      return this._name;
    }
    toString() {
      return `Sprite/${this._name}`;
    }
  }
  function calculateNextFrameTime(sprite, frameIndex, time) {
    const frames = sprite._frameTimes;
    if (frameIndex + 1 === frames.length && sprite._currentLoop === sprite._targetLoops) {
      return -1;
    } else {
      return time + frames[frameIndex];
    }
  }
  function makeSpriteType(options) {
    const {name, frameTime} = options;
    const data = options.set.data;
    let numFrames = -1;
    options.modes.forEach(mode => {
      const datum = data[mode];
      if (!datum) {
        throw new Error(`Sprite/${name} has non-existent mode ${mode}`);
      }
      if (numFrames === -1) {
        numFrames = datum._offsets.length;
      } else {
        if (numFrames !== datum._offsets.length) {
          throw new Error(`Sprite/${name} has inconsistent frame counts`);
        }
      }
    });
    if (numFrames === -1) {
      throw new Error(`Sprite/${name} given 0 modes`);
    }
    if (typeof frameTime !== "number" && frameTime.length !== numFrames) {
      throw new Error(`Sprite/${name} given ${frameTime.length} frame times for ${numFrames} frames`);
    }
    if (options.frameData && options.frameData.length !== numFrames) {
      throw new Error(`Sprite/${name} given ${options.frameData.length} frame data points for ${numFrames} frames`);
    }
    const frameTimes = typeof frameTime === "number" ? (new Array(numFrames)).fill(frameTime) : frameTime;
    return (mode, time) => new Sprite(options, frameTimes, mode, time);
  }
  function characterSpriteSheet({xPercent = 0, yInM = 0, zPercent = 0, widthInPixels, heightInPixels, texPixelsPerUnit, texture, numPerRow, count, reverseX = false}) {
    const width = widthInPixels / texPixelsPerUnit;
    const height = heightInPixels / texPixelsPerUnit;
    return spriteSheet({x:xPercent * width, y:yInM, z:zPercent * height, width, height, texWidth:widthInPixels / texture.w, texHeight:heightInPixels / texture.h, numPerRow, count, reverseX, });
  }
  function spriteSheet({x = 0, y = 0, z = 0, width, height, texWidth, texHeight, numPerRow, count, texStartXOffset = 0, texStartYOffset = 0, texWidthStride = texWidth, texHeightStride = texHeight, reverseX = false}) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / numPerRow);
      const col = i % numPerRow;
      const texStartX = texStartXOffset + col * texWidthStride;
      const texStartY = texStartYOffset + row * texHeightStride;
      result.push(flatSprite({x, y, z, width, height, texStartX, texEndX:texStartX + texWidth, texStartY, texEndY:texStartY + texHeight, reverseX, }));
    }
    return result;
  }
  function flatSprite({x = 0, y = 0, z = 0, width, height, depth = 0, texStartX, texStartY, texEndX, texEndY, reverseX = false}) {
    let startX, endX, leftX, rightX;
    if (!reverseX) {
      startX = texStartX;
      endX = texEndX;
      leftX = -x;
      rightX = width - x;
    } else {
      startX = texEndX;
      endX = texStartX;
      leftX = x - width;
      rightX = x;
    }
    return [rightX, -y, -z, endX, texEndY, leftX, -y, -z, startX, texEndY, rightX, depth - y, height - z, endX, texStartY, leftX, depth - y, height - z, startX, texStartY, ];
  }
}, "src/sprites.js", ["src/swagl.js"]);

//src/SpriteData.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {HERO_HEIGHT:{enumerable:true, get:function() {
    return HERO_HEIGHT;
  }}, LADDER_Y:{enumerable:true, get:function() {
    return LADDER_Y;
  }}, LAYOUT_TARGETS:{enumerable:true, get:function() {
    return LAYOUT_TARGETS;
  }}, PIXELS_PER_METER:{enumerable:true, get:function() {
    return PIXELS_PER_METER;
  }}, ROOM_DEPTH_RADIUS:{enumerable:true, get:function() {
    return ROOM_DEPTH_RADIUS;
  }}, ROOM_HEIGHT:{enumerable:true, get:function() {
    return ROOM_HEIGHT;
  }}, SWITCH_HEIGHT:{enumerable:true, get:function() {
    return SWITCH_HEIGHT;
  }}, TENTACLE_FRAMES:{enumerable:true, get:function() {
    return TENTACLE_FRAMES;
  }}, TEX_PIXELS_PER_METER:{enumerable:true, get:function() {
    return TEX_PIXELS_PER_METER;
  }}, TEX_PIXEL_PER_PIXEL:{enumerable:true, get:function() {
    return TEX_PIXEL_PER_PIXEL;
  }}, WALL_META:{enumerable:true, get:function() {
    return WALL_META;
  }}});
  const TEX_PIXEL_PER_PIXEL = 2;
  const PIXELS_PER_METER = 180;
  const TEX_PIXELS_PER_METER = TEX_PIXEL_PER_PIXEL * PIXELS_PER_METER;
  const ROOM_DEPTH_RADIUS = 0.75;
  const ROOM_HEIGHT = 2.5;
  const LADDER_Y = ROOM_DEPTH_RADIUS - 0.2;
  const SWITCH_HEIGHT = 1.4;
  const HERO_HEIGHT = 1.8;
  const TENTACLE_FRAMES = 29;
  const WALL_META = {portholeR:100, portholeRNextPowerOf2:128, portholeXs:[2423], portholeD:353, };
  const LAYOUT_TARGETS = {CEIL_LIP:-70, CEIL_FOREGROUND:0, CEIL_BACKGROUND:216, FLOOR_BACKGROUND:752, FLOOR_FOREGROUND:968, FLOOR_LIP:1038, };
}, "src/SpriteData.js", []);

//src/webgames/math.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {arctan:{enumerable:true, get:function() {
    return arctan;
  }}});
  function arctan(opposite, adjacent) {
    if (adjacent > 0) {
      return Math.atan(opposite / adjacent);
    } else {
      if (adjacent === 0) {
        if (opposite > 0) {
          return Math.PI / 2;
        } else {
          if (opposite === 0) {
            return 0;
          } else {
            return -Math.PI / 2;
          }
        }
      } else {
        return Math.atan(opposite / adjacent) + Math.PI;
      }
    }
  }
}, "src/webgames/math.js", []);

//src/Creature.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {Creature:{enumerable:true, get:function() {
    return Creature;
  }}, CreatureResources:{enumerable:true, get:function() {
    return CreatureResources;
  }}, deathByAxe:{enumerable:true, get:function() {
    return deathByAxe;
  }}, loadCreatureResources:{enumerable:true, get:function() {
    return loadCreatureResources;
  }}, processCreatures:{enumerable:true, get:function() {
    return processCreatures;
  }}, renderCreatures:{enumerable:true, get:function() {
    return renderCreatures;
  }}, spawnCreature:{enumerable:true, get:function() {
    return spawnCreature;
  }}});
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$sprites = $$require("src/sprites.js");
  var module$src$swagl = $$require("src/swagl.js");
  var module$src$Scene = $$require("src/Scene.js");
  var module$src$webgames$math = $$require("src/webgames/math.js");
  const CREATURE_RADIUS_PIXELS = 54;
  const CREATURE_IDLE_FRAMES = 6;
  const CREATURE_RADIUS = 0.25;
  const CREATURE_SPEED = 0.01;
  const CREATURE_BONUS_SPEED = 0.02;
  const CREATURE_HUNTING_DISTANCE = 2;
  const CREATURE_ATTACK_DISTANCE = 0.5;
  const STEP_TIME = 1 / 8;
  const ATTACH_Z_OFFSET = CREATURE_RADIUS * (3 / 4);
  let Tentacle;
  let CreatureResources;
  let CreatureState;
  const mirrorX = new Float32Array([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ]);
  async function loadCreatureResources(loadTexture, loadSound) {
    const [creatureTex, tentacleTex, creatureAttackTex, enemyDyingSound, creatureDeathTex] = await Promise.all([loadTexture("creature", "assets/Enemy.png"), loadTexture("tentacle", "assets/Tentacle.png"), loadTexture("creature_attack", "assets/enemy_bite.png"), loadSound("assets/Enemy Dying.mp3"), loadTexture("creature_death", "assets/Enemy Dying.png"), ]);
    const creatureSpriteSet = new module$src$sprites.SpriteSet(creatureTex, {"blink":(0,module$src$sprites.spriteSheet)({x:CREATURE_RADIUS, z:CREATURE_RADIUS, width:2 * CREATURE_RADIUS, height:2 * CREATURE_RADIUS, texWidth:2 * CREATURE_RADIUS_PIXELS / creatureTex.w, texHeight:2 * CREATURE_RADIUS_PIXELS / creatureTex.h, numPerRow:2, count:CREATURE_IDLE_FRAMES, reverseX:true, }), });
    const makeCreatureAttackSprite = (0,module$src$sprites.makeSpriteType)({name:"creature_attack", set:new module$src$sprites.SpriteSet(creatureAttackTex, {"bite":(0,module$src$sprites.spriteSheet)({x:2 * CREATURE_RADIUS, z:3 * CREATURE_RADIUS, width:4 * CREATURE_RADIUS, height:8 * CREATURE_RADIUS, texHeight:530 / creatureAttackTex.h, texWidth:278 / creatureAttackTex.w, numPerRow:7, count:42, reverseX:true, }), }), modes:["bite"], loops:false, frameTime:1 / 42, });
    const makeCreatureDeathSprite = (0,module$src$sprites.makeSpriteType)({name:"creature_death", set:new module$src$sprites.SpriteSet(creatureDeathTex, {"left":(0,module$src$sprites.spriteSheet)({x:330 / (460 / module$src$SpriteData.HERO_HEIGHT), y:module$src$SpriteData.ROOM_DEPTH_RADIUS / 2, z:0, width:660 / (460 / module$src$SpriteData.HERO_HEIGHT), height:module$src$SpriteData.HERO_HEIGHT, texWidth:660 / creatureDeathTex.w, texHeight:460 / creatureDeathTex.h, numPerRow:3, count:12, }), "right":(0,module$src$sprites.spriteSheet)({x:330 / 
    (450 / module$src$SpriteData.HERO_HEIGHT), y:module$src$SpriteData.ROOM_DEPTH_RADIUS / 2, z:0, width:660 / (450 / module$src$SpriteData.HERO_HEIGHT), height:module$src$SpriteData.HERO_HEIGHT, texWidth:660 / creatureDeathTex.w, texHeight:450 / creatureDeathTex.h, numPerRow:3, count:12, reverseX:true, }), }), modes:["left", "right"], loops:false, frameTime:1 / 8, });
    const frameTimes = (new Array(CREATURE_IDLE_FRAMES)).fill(1 / 8);
    frameTimes[0] = 4;
    const makeCreatureSprite = (0,module$src$sprites.makeSpriteType)({name:"creature_normal", set:creatureSpriteSet, modes:["blink"], loops:true, frameTime:frameTimes, });
    const tentacleFrames = [];
    const tentacleFramesPerRow = 5;
    const tipPoint = {x:0, y:48};
    const basePoint = {x:92, y:26};
    const basis = {x:basePoint.x - tipPoint.x, y:basePoint.y - tipPoint.y};
    const unitMag = Math.sqrt(basis.x * basis.x + basis.y * basis.y);
    basis.x /= unitMag;
    basis.y /= unitMag;
    const tentacleFrameW = 100;
    const tentacleFrameH = 77;
    for (let i = 0; i < module$src$SpriteData.TENTACLE_FRAMES; i++) {
      const col = i % tentacleFramesPerRow;
      const row = Math.floor(i / tentacleFramesPerRow);
      const points = [];
      const addProjectedPoint = (rawX, rawY) => {
        const x = rawX * tentacleFrameW - tipPoint.x;
        const y = rawY * tentacleFrameH - tipPoint.y;
        points.push((x * basis.x + y * basis.y) / unitMag, rawX, (x * -basis.y + y * basis.x) / module$src$SpriteData.TEX_PIXELS_PER_METER, tentacleFrameW * (col + rawX) / tentacleTex.w, tentacleFrameH * (row + rawY) / tentacleTex.h);
      };
      addProjectedPoint(1, 1);
      addProjectedPoint(0, 1);
      addProjectedPoint(1, 0);
      addProjectedPoint(0, 0);
      tentacleFrames.push(points);
    }
    const tentacleSprite = new module$src$sprites.SpriteSet(tentacleTex, {"wiggle":tentacleFrames, });
    return {makeCreatureSprite, makeCreatureAttackSprite, makeCreatureDeathSprite, tentacleSprite, enemyDyingSound, };
  }
  function makeDefaultCreatureSprite(room) {
    return room.resources.creature.makeCreatureSprite("blink", room.roomTime);
  }
  class Creature {
    constructor(room, x, y, heightOffGround) {
      const sprite = makeDefaultCreatureSprite(room);
      const roomBottom = room.roomBottom;
      this.startX = x;
      this.x = x;
      this.y = y;
      this.z = heightOffGround;
      this.nextTentacleMove = 0;
      this.nextTentacleIndex = 0;
      this.tentacles = [makeTentacle(0, x, y, -1, 1, roomBottom), makeTentacle(1, x, y, -1, -1, roomBottom), makeTentacle(2, x, y, 1, 1, roomBottom), makeTentacle(3, x, y, 1, -1, roomBottom), ];
      this.sprite = sprite;
      this.state = creatureStateNormal(this, room);
    }
    changeState(room, stateBuilder) {
      const oldStateOnExit = this.state.onExit;
      if (oldStateOnExit) {
        oldStateOnExit();
      }
      const state = stateBuilder(this, room);
      this.state = state;
      state.processStep(room);
    }
    setSprite(makeSprite, time, mode) {
      this.sprite = makeSprite(mode, time);
    }
    adjustTentacles(room, speedX) {
      const roomTime = room.roomTime;
      if (roomTime > this.nextTentacleMove) {
        let index = this.nextTentacleIndex;
        this.nextTentacleIndex = (index + 1) % this.tentacles.length;
        const toPlace = this.tentacles[index];
        const placementX = this.x + (STEP_TIME + 0.1) * speedX + toPlace.idealX;
        if (Math.abs(placementX - toPlace.placementX) > 0.05) {
          this.nextTentacleMove = roomTime + STEP_TIME;
          toPlace.movingUntil = roomTime + STEP_TIME;
          toPlace.moveStartX = toPlace.placementX;
          toPlace.moveStartY = toPlace.placementY;
          toPlace.moveStartZ = toPlace.placementZ;
          toPlace.placementX = placementX;
          toPlace.placementY = this.y + toPlace.idealY;
          toPlace.placementZ = room.roomBottom;
        }
      }
    }
  }
  function distanceFromHero(creature, room) {
    return Math.abs(creature.x - room.hero.heroX);
  }
  function creatureStateNormal(creature, room) {
    return {name:"creature_normal", processStep:() => {
      const roomTime = room.roomTime;
      creature.x = creature.startX + Math.sin(roomTime);
      creature.adjustTentacles(room, 0.5 * Math.cos(roomTime));
      const heroDistance = distanceFromHero(creature, room);
      if (heroDistance < CREATURE_HUNTING_DISTANCE) {
        if (heroDistance < CREATURE_ATTACK_DISTANCE) {
          creature.state = creatureStateAttack(creature, room);
        } else {
          creature.state = creatureStateHunting(creature, room);
        }
      }
    }, render:(gl, program, heroPoint) => {
      const stack = program.stack;
      const x = creature.x;
      const z = creature.z;
      stack.pushTranslation(x, creature.y, z);
      let needsMirror = heroPoint.x < x;
      let angle = (0,module$src$webgames$math.arctan)(heroPoint.z - z, heroPoint.x - x);
      if (needsMirror) {
        stack.push(mirrorX);
        angle = Math.PI - angle;
      }
      stack.pushYRotation(angle);
      creature.sprite.renderSprite(program);
      stack.pop();
      if (needsMirror) {
        stack.pop();
      }
      stack.pop();
    }, };
  }
  function getCreatureSpeed(room, start) {
    const currentTime = room.roomTime;
    return CREATURE_SPEED + Math.min(1, (currentTime - start) / 3) * CREATURE_BONUS_SPEED;
  }
  function creatureStateHunting(creature, room) {
    const startedAt = room.roomTime;
    return {name:"creature_hunting", processStep:() => {
      const roomTime = room.roomTime;
      const heroX = room.hero.heroX;
      const heroDistance = distanceFromHero(creature, room);
      if (heroDistance > CREATURE_ATTACK_DISTANCE / 2) {
        creature.x += (heroX < creature.x ? -1 : 1) * getCreatureSpeed(room, startedAt);
      }
      creature.adjustTentacles(room, 0.5 * Math.cos(roomTime));
      if (heroDistance < CREATURE_ATTACK_DISTANCE && roomTime - startedAt > 1) {
        creature.state = creatureStateAttack(creature, room);
      }
    }, render:(gl, program, heroPoint) => {
      const stack = program.stack;
      const x = creature.x;
      const z = creature.z;
      stack.pushTranslation(x, creature.y, z);
      let needsMirror = heroPoint.x < x;
      let angle = (0,module$src$webgames$math.arctan)(heroPoint.z - z, heroPoint.x - x);
      if (needsMirror) {
        stack.push(mirrorX);
        angle = Math.PI - angle;
      }
      stack.pushYRotation(angle);
      creature.sprite.renderSprite(program);
      stack.pop();
      if (needsMirror) {
        stack.pop();
      }
      stack.pop();
    }, };
  }
  function creatureStateAttack(creature, room) {
    const sprite = room.resources.creature.makeCreatureAttackSprite("bite", room.roomTime);
    creature.sprite = sprite;
    return {name:"creature_attack", processStep:() => {
      if (sprite.isFinished()) {
        const heroDistance = distanceFromHero(creature, room);
        if (heroDistance < 1.5) {
          console.warn("Kill / hurt the hero");
        }
        creature.state = creatureStateHunting(creature, room);
        creature.sprite = makeDefaultCreatureSprite(room);
      }
    }, render:(gl, program, heroPoint) => {
      const stack = program.stack;
      const x = creature.x;
      const z = creature.z;
      stack.pushTranslation(x, creature.y, z);
      let needsMirror = heroPoint.x < x;
      let angle = (0,module$src$webgames$math.arctan)(heroPoint.z - z, heroPoint.x - x);
      if (needsMirror) {
        stack.push(mirrorX);
        angle = Math.PI - angle;
      }
      stack.pushYRotation(angle);
      creature.sprite.renderSprite(program);
      stack.pop();
      if (needsMirror) {
        stack.pop();
      }
      stack.pop();
    }, };
  }
  function deathByAxe(creature, room) {
    if (creature.state.name !== "creature_death") {
      creature.changeState(room, creatureStateDeathByAxe);
    }
  }
  function creatureStateDeathByAxe(creature, room) {
    room.audio.playSound(creature, room.resources.creature.enemyDyingSound);
    const sprite = room.resources.creature.makeCreatureDeathSprite(room.hero.heroX < creature.x ? "left" : "right", room.roomTime);
    creature.sprite = sprite;
    return {name:"creature_death", processStep:() => {
      if (sprite.frameIndex() > 1 && creature.tentacles.length) {
        creature.tentacles = [];
      }
      if (sprite.isFinished()) {
        room.creatures.splice(room.creatures.indexOf(creature), 1);
      }
    }, render:(gl, program) => {
      console.log("DEATH");
      const stack = program.stack;
      stack.pushTranslation(creature.x, creature.y, room.roomBottom);
      sprite.renderSprite(program);
      stack.pop();
    }, };
  }
  function spawnCreature(room, x) {
    room.creatures.push(new Creature(room, x, 0, room.roomBottom + 3 * CREATURE_RADIUS));
  }
  function processCreatures(room) {
    const roomTime = room.roomTime;
    room.creatures.forEach(creature => {
      creature.sprite.updateTime(roomTime);
      creature.state.processStep(room);
    });
  }
  function renderCreatures(gl, program, room) {
    const stack = program.stack;
    const {tentacleSprite} = room.resources.creature;
    const roomTime = room.roomTime;
    const heroPoint = room.hero.getGoodFocusPoint();
    room.creatures.forEach(creature => {
      creature.state.render(gl, program, heroPoint);
    });
    tentacleSprite.bindTo(program);
    room.creatures.forEach(creature => {
      const attachZ = creature.z - ATTACH_Z_OFFSET;
      creature.tentacles.forEach(tentacle => {
        const attachX = creature.x + tentacle.bodyX;
        const attachY = creature.y + tentacle.bodyY;
        let placementX = tentacle.placementX;
        let placementY = tentacle.placementY;
        let placementZ = tentacle.placementZ;
        const movingUntil = tentacle.movingUntil;
        if (roomTime < movingUntil) {
          const percent = 1 - (movingUntil - roomTime) / STEP_TIME;
          placementX = bezier(percent, tentacle.moveStartX, attachX, placementX);
          placementY = bezier(percent, tentacle.moveStartY, attachY, placementY);
          placementZ = bezier(percent, tentacle.moveStartZ, attachZ, placementZ);
        }
        const dX = attachX - placementX;
        const dY = attachY - placementY;
        const dZ = attachZ - placementZ;
        const mag = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
        stack.pushTranslation(placementX, placementY, placementZ);
        stack.pushYRotation((0,module$src$webgames$math.arctan)(dZ, dX));
        stack.push(new Float32Array([mag, 0, 0, 0, 0, dY, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
        tentacleSprite.renderSpriteDatumPrebound("wiggle", Math.abs((Math.floor(24 * Date.now() / 1000) + tentacle.frameOffset) % (2 * module$src$SpriteData.TENTACLE_FRAMES - 1) + 1 - module$src$SpriteData.TENTACLE_FRAMES));
        stack.pop();
        stack.pop();
        stack.pop();
      });
    });
  }
  function makeTentacle(index, x, y, xSign, ySign, roomBottom) {
    const idealX = 0.4 * xSign;
    const idealY = 0.1 * ySign;
    const placementX = x + idealX;
    const placementY = y + idealY;
    return {index, bodyX:xSign * 0.05, bodyY:0, idealX, idealY, movingUntil:0, moveStartX:placementX, moveStartY:placementY, moveStartZ:roomBottom, placementX, placementY, placementZ:roomBottom, frameOffset:0, };
  }
  function bezier(percent, v1, v2, v3) {
    let v12 = percent * v2 + (1 - percent) * v1;
    let v23 = percent * v3 + (1 - percent) * v2;
    return percent * v23 + (1 - percent) * v12;
  }
}, "src/Creature.js", ["src/SpriteData.js", "src/sprites.js", "src/swagl.js", "src/Scene.js", "src/webgames/math.js"]);

//src/Interactables.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {LightSwitch:{enumerable:true, get:function() {
    return LightSwitch;
  }}});
  var module$src$swagl = $$require("src/swagl.js");
  var module$src$Scene = $$require("src/Scene.js");
  class LightSwitch {
    constructor(x) {
      this.on = false;
      this.x = x;
    }
    render(gl, program, room) {
      const stack = program.stack;
      const switches = room.resources.environ.lightSwitches;
      stack.pushTranslation(this.x, 0, room.roomBottom);
      switches.bindTo(program);
      switches.renderSpriteDatumPrebound(this.on ? "on" : "off", 0);
      stack.pop();
    }
  }
}, "src/Interactables.js", ["src/swagl.js", "src/Scene.js"]);

//src/Hero.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {Hero:{enumerable:true, get:function() {
    return Hero;
  }}, HeroResources:{enumerable:true, get:function() {
    return HeroResources;
  }}, heroStateNormal:{enumerable:true, get:function() {
    return heroStateNormal;
  }}, loadHeroResources:{enumerable:true, get:function() {
    return loadHeroResources;
  }}, processHero:{enumerable:true, get:function() {
    return processHero;
  }}, renderHero:{enumerable:true, get:function() {
    return renderHero;
  }}, transitionInHero:{enumerable:true, get:function() {
    return transitionInHero;
  }}});
  var module$src$sprites = $$require("src/sprites.js");
  var module$src$swagl = $$require("src/swagl.js");
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$webgames$math = $$require("src/webgames/math.js");
  var module$src$Scene = $$require("src/Scene.js");
  var module$src$Creature = $$require("src/Creature.js");
  var module$src$Interactables = $$require("src/Interactables.js");
  const HERO_PIXELS_PER_METER = 434 / module$src$SpriteData.HERO_HEIGHT;
  const charWInM = 405 / HERO_PIXELS_PER_METER;
  let HeroResources;
  let FlarePosition;
  let HeroState;
  class Hero {
    constructor(resources, x, z) {
      this.heroX = x;
      this.heroY = 0;
      this.heroZ = z;
      this.signX = 1;
      this.speedX = 0;
      this.sprite = resources.makeIdleSprite("right", 0);
      this.state = {name:"unstarted", processStep:room => this.changeState(room, heroStateNormal), render:() => {
        throw new Error("Hero did not get processed before rendering!");
      }, };
    }
    getGoodFocusPoint() {
      return {x:this.heroX, z:this.heroZ + module$src$SpriteData.HERO_HEIGHT - 0.1};
    }
    isFacingLeft() {
      return this.signX === -1;
    }
    directionMode() {
      return this.signX === -1 ? "left" : "right";
    }
    flarePosition() {
      const data = this.sprite.frameData();
      return data ? data.flare : null;
    }
    setSpeedX(speedX) {
      this.speedX = speedX;
      if (speedX !== 0) {
        this.signX = Math.sign(speedX);
      }
    }
    setSprite(makeSprite, time, mode = this.directionMode()) {
      this.sprite = makeSprite(mode, time);
    }
    renderSprite(gl, program, room) {
      const stack = program.stack;
      stack.pushTranslation(this.heroX, this.heroY, this.heroZ);
      this.sprite.renderSprite(program);
      stack.pop();
    }
    changeState(room, stateBuilder, arg) {
      const oldStateOnExit = this.state.onExit;
      if (oldStateOnExit) {
        oldStateOnExit();
      }
      const state = stateBuilder(this, room, arg);
      this.state = state;
      state.processStep(room);
    }
  }
  function processHero(room) {
    const hero = room.hero;
    hero.sprite.updateTime(room.roomTime);
    hero.state.processStep(room);
  }
  function renderHero(gl, program, room) {
    const render = room.hero.state.render;
    if (render) {
      render(gl, program);
    } else {
      room.hero.renderSprite(gl, program, room);
    }
  }
  function heroStateNormal(hero, room) {
    let isIdle = true;
    hero.setSprite(room.resources.hero.makeIdleSprite, room.roomTime);
    const state = {name:"normal", processStep:room => {
      const {hero, roomTime, input} = room;
      if (input.isPressed("up")) {
        const didInteract = room.interactables.some(interactable => {
          if (interactable instanceof module$src$Interactables.LightSwitch) {
            if (!interactable.on && Math.abs(hero.heroX - interactable.x) < 0.2) {
              hero.changeState(room, heroStateFlipSwitch, interactable);
              return true;
            }
          }
        });
        if (didInteract) {
          return;
        }
      }
      if (room.name === "r0" && input.isPressed("up")) {
        hero.changeState(room, heroStateClimbing);
        return;
      }
      if (input.isPressed("attack")) {
        hero.changeState(room, heroStateAttacking);
        return;
      }
      let charDx = 1.2 * room.stepSize * input.getSignOfAction("left", "right");
      const plannedX = hero.heroX + charDx;
      if (plannedX < room.roomLeft + charWInM) {
        charDx = room.roomLeft + charWInM - hero.heroX;
      } else {
        if (plannedX > room.roomRight - charWInM) {
          charDx = room.roomRight - charWInM - hero.heroX;
        }
      }
      hero.setSpeedX(charDx / room.stepSize);
      const mode = hero.directionMode();
      if (charDx) {
        hero.heroX += charDx;
        if (isIdle) {
          isIdle = false;
          hero.setSprite(room.resources.hero.makeWalkSprite, roomTime);
        }
      } else {
        if (!isIdle) {
          isIdle = true;
          hero.setSprite(room.resources.hero.makeIdleSprite, roomTime);
        }
      }
      hero.sprite.setMode(mode);
    }, };
    return state;
  }
  function heroStateAttacking(hero, room) {
    const targetX = hero.heroX + hero.signX * (300 / HERO_PIXELS_PER_METER);
    const enemyInRange = room.creatures.find(creature => Math.abs(targetX - creature.x) < 0.4);
    if (enemyInRange) {
      (0,module$src$Creature.deathByAxe)(enemyInRange, room);
    }
    hero.setSprite(room.resources.hero.makeAttackSprite, room.roomTime);
    hero.setSpeedX(0);
    const grunts = room.resources.hero.grunts;
    room.audio.playSound(hero, grunts[Math.floor(Math.random() * grunts.length)]);
    return {name:"attacking", processStep:room => {
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      }
    }, };
  }
  function heroStateFlipSwitch(hero, room, light) {
    hero.setSprite(room.resources.hero.makeSwitchFlipSprite, room.roomTime, "main");
    hero.setSpeedX(0);
    hero.heroX = light.x;
    return {name:"switch_on", processStep:() => {
      if (!light.on && hero.sprite.frameIndex() >= 6) {
        room.audio.playSound(light, room.resources.hero.lightSwitchSound);
        room.lightsOn = true;
        light.on = true;
      }
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      }
    }, };
  }
  function heroStateClimbing(hero, room) {
    hero.setSprite(room.resources.hero.makeClimbingSprite, room.roomTime, "up");
    hero.setSpeedX(0);
    hero.heroY = module$src$SpriteData.LADDER_Y;
    room.transition = {roomName:"r1", transitionType:"up", realWorldStartTime:Date.now() / 1000, seconds:1, };
    return {name:"climbing", processStep:room => {
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      } else {
        hero.heroZ = room.roomBottom + 0.3 * Math.min(5, hero.sprite.frameIndex());
      }
    }, onExit:() => {
      hero.heroY = 0;
      hero.heroZ = room.roomBottom;
    }, };
  }
  function heroStateEnterFromHatch(hero, room) {
    const startTime = room.roomTime;
    hero.setSprite(room.resources.hero.makeExitHatchSprite, room.roomTime, "exit");
    hero.setSpeedX(0);
    room.locks++;
    return {name:"entering_hatch", processStep:() => {
      const sprite = hero.sprite;
      if (room.roomTime < startTime + 1) {
        sprite.resetSprite("exit", room.roomTime);
      } else {
        if (sprite.isFinished()) {
          hero.changeState(room, heroStateNormal);
        } else {
          const offsets = [-.5, -.5, -.3, -.3];
          hero.heroZ = room.roomBottom + (offsets[hero.sprite.frameIndex()] || 0);
        }
      }
    }, render:(gl, program) => {
      if (room.roomTime < startTime + 1) {
        return;
      }
      hero.renderSprite(gl, program, room);
    }, onExit:() => {
      room.locks--;
      hero.heroZ = room.roomBottom;
    }, };
  }
  function transitionInHero(transition, oldRoom, newRoom) {
    const hero = newRoom.hero;
    hero.heroX = oldRoom.hero.heroX;
    hero.changeState(newRoom, heroStateEnterFromHatch);
  }
  async function loadHeroResources(loadTexture, loadSound) {
    const [idleTex, walkTex, attackTex, climbingTex, hatchTex, switchTex, grunts, lightSwitchSound] = await Promise.all([loadTexture("hero_idle", "assets/Hero Breathing with axe.png"), loadTexture("hero_walk", "assets/Hero Walking with axe.png"), loadTexture("hero_attack", "assets/Axe Chop.png"), loadTexture("hero_climbing", "assets/Climbing Up.png"), loadTexture("hero_hatch", "assets/climbing_in.png"), loadTexture("hero_light", "assets/Hero flipping Switch.png"), Promise.all([loadSound("assets/Grunt1.mp3"), 
    loadSound("assets/Grunt2.mp3"), loadSound("assets/Grunt3.mp3"), ]), loadSound("assets/light.mp3"), ]);
    const enterHatch = {name:"hero_hatch_enter", tex:hatchTex, widthPx:350, heightPx:406, xPx:161, yPx:479, frameCount:6, loops:false, frameTime:1 / 8, flareData:[{tx:201, ty:137, bx:172, by:175}, {tx:422, ty:246, bx:461, by:259}, {tx:67, ty:659, bx:113, by:651}, {tx:419, ty:658, bx:462, by:648}, {tx:80, ty:1041, bx:106, by:1067}, null, ], singleMode:"enter", };
    return {grunts, makeIdleSprite:makeHeroSpriteType({name:"hero_idle", tex:idleTex, widthPx:405, heightPx:434, xPx:220, yPx:434, frameCount:16, loops:true, frameTime:1 / 12, flareData:[{tx:388, ty:104, bx:385, by:170}, {tx:792, ty:105, bx:790, by:170}, {tx:1198, ty:105, bx:1195, by:169}, {tx:1602, ty:106, bx:1600, by:170}, {tx:2008, ty:106, bx:2005, by:172}, {tx:388, ty:539, bx:385, by:604}, {tx:794, ty:540, bx:790, by:605}, {tx:1196, ty:539, bx:1196, by:604}, {tx:1602, ty:539, bx:1602, by:604}, 
    {tx:2009, ty:541, bx:2007, by:604}, {tx:386, ty:974, bx:385, by:1036}, {tx:792, ty:972, bx:790, by:1033}, {tx:1198, ty:974, bx:1196, by:1038}, {tx:1602, ty:972, bx:1601, by:1036}, {tx:2010, ty:974, bx:2005, by:1044}, {tx:386, ty:1406, bx:385, by:1477}, ], }), makeWalkSprite:makeHeroSpriteType({name:"hero_walk", tex:walkTex, widthPx:424, heightPx:444, xPx:258, yPx:444, frameCount:8, loops:true, frameTime:1 / 8, flareData:[{tx:408, ty:110, bx:404, by:166}, {tx:830, ty:110, bx:829, by:166}, {tx:408, 
    ty:554, bx:404, by:614}, {tx:830, ty:554, bx:829, by:614}, {tx:408, ty:998, bx:404, by:1055}, {tx:830, ty:998, bx:829, by:1055}, {tx:408, ty:1444, bx:404, by:1500}, {tx:830, ty:1444, bx:829, by:1500}, ], }), makeAttackSprite:makeHeroSpriteType({name:"hero_attack", tex:attackTex, widthPx:644, heightPx:565, xPx:284, yPx:565, frameCount:5, loops:false, frameTime:1 / 12, flareData:[{tx:422, ty:285, bx:415, by:353}, {tx:936, ty:367, bx:868, by:380}, {tx:1507, ty:311, bx:1469, by:318}, {tx:162, ty:948, 
    bx:206, by:943}, {tx:1025, ty:934, bx:976, by:962}, ], }), makeClimbingSprite:makeHeroSpriteType({name:"hero_climbing_up", tex:climbingTex, widthPx:222, heightPx:412, xPx:110, yPx:412, frameCount:8, loops:false, frameTime:1 / 8, flareData:[{tx:128, ty:60, bx:65, by:54}, {tx:329, ty:155, bx:277, by:148}, {tx:579, ty:58, bx:518, by:56}, {tx:772, ty:157, bx:721, by:156}, {tx:95, ty:575, bx:65, by:567}, {tx:337, ty:472, bx:286, by:465}, null, null, ], singleMode:"up", scale:1.4, }), makeEnterHatchSprite:makeHeroSpriteType(enterHatch), 
    makeExitHatchSprite:makeHeroSpriteType({...enterHatch, name:"hero_hatch_exit", singleMode:"exit", reverseOrder:true, }), makeSwitchFlipSprite:makeHeroSpriteType({name:"hero_switch", tex:switchTex, widthPx:274, heightPx:444, xPx:104, yPx:442, frameCount:9, loops:false, frameTime:1 / 12, singleMode:"main", flareData:null, }), lightSwitchSound, };
  }
  function makeHeroSpriteType(options) {
    const {tex, widthPx, heightPx, xPx, yPx, frameCount} = options;
    const maybeReverse = options.reverseOrder ? array => [...array].reverse() : array => array;
    const pxPerMeter = HERO_PIXELS_PER_METER / (options.scale || 1);
    const numPerRow = Math.floor(tex.w / widthPx);
    const spriteSheetOptions = {x:xPx / pxPerMeter, z:(heightPx - yPx) / pxPerMeter, width:widthPx / pxPerMeter, height:heightPx / pxPerMeter, texWidth:widthPx / tex.w, texHeight:heightPx / tex.h, numPerRow, count:frameCount, };
    const perFrameData = options.flareData && options.flareData.map((data, index) => {
      if (!data) {
        return {flare:null};
      }
      const {tx, ty, bx, by} = data;
      const row = Math.floor(index / numPerRow);
      const col = index % numPerRow;
      return {flare:{x:(tx - (col * widthPx + xPx)) / pxPerMeter, z:(row * heightPx + yPx - ty) / pxPerMeter, angle:(0,module$src$webgames$math.arctan)(-(ty - by), tx - bx), }, };
    });
    let spriteSet, modes;
    if (options.singleMode) {
      modes = [options.singleMode];
      spriteSet = new module$src$sprites.SpriteSet(tex, {[options.singleMode]:maybeReverse((0,module$src$sprites.spriteSheet)(spriteSheetOptions)), });
    } else {
      modes = ["left", "right"];
      spriteSet = new module$src$sprites.SpriteSet(tex, {"right":maybeReverse((0,module$src$sprites.spriteSheet)(spriteSheetOptions)), "left":maybeReverse((0,module$src$sprites.spriteSheet)({...spriteSheetOptions, reverseX:true})), });
    }
    return (0,module$src$sprites.makeSpriteType)({name:options.name, set:spriteSet, modes, loops:options.loops, frameTime:options.frameTime, perFrameData:perFrameData && maybeReverse(perFrameData), });
  }
}, "src/Hero.js", ["src/sprites.js", "src/swagl.js", "src/SpriteData.js", "src/webgames/math.js", "src/Scene.js", "src/Creature.js", "src/Interactables.js"]);

//src/webgames/Audio.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {AudioManager:{enumerable:true, get:function() {
    return AudioManager;
  }}});
  class AudioManager {
    constructor() {
      this.audioContext = new AudioContext;
      this.activeSounds = new WeakMap;
    }
    loadSound(url) {
      return fetch(url).then(response => {
        if (!response.ok) {
          throw new Error(`failed to load ${url}`);
        }
        return response.arrayBuffer();
      }).then(buffer => this.audioContext.decodeAudioData(buffer));
    }
    playSound(source, buffer) {
      const activeSounds = this.activeSounds;
      const priorSound = activeSounds.get(source);
      if (priorSound) {
        priorSound.stop();
      }
      const audioContext = this.audioContext;
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = buffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
      activeSounds.set(source, audioSource);
    }
  }
}, "src/webgames/Audio.js", []);

//src/Flare.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {SparkParticle:{enumerable:true, get:function() {
    return SparkParticle;
  }}, makeSparkSprite:{enumerable:true, get:function() {
    return makeSparkSprite;
  }}, processFlare:{enumerable:true, get:function() {
    return processFlare;
  }}, renderSparks:{enumerable:true, get:function() {
    return renderSparks;
  }}});
  var module$src$Scene = $$require("src/Scene.js");
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$swagl = $$require("src/swagl.js");
  var module$src$sprites = $$require("src/sprites.js");
  const SPAWN_HERTZ = 48;
  const MAX_SPARKS = 100;
  let SparkParticle;
  function processFlare(room) {
    const {roomTime, stepSize, hero, sparks, roomBottom} = room;
    const toSpawn = Math.floor(SPAWN_HERTZ * roomTime) - Math.floor(SPAWN_HERTZ * (roomTime - stepSize));
    for (let i = 0; i < toSpawn; i++) {
      const speed = Math.random() * 2 + 1.4;
      let dy = 0.1 * Math.sin(2 * Math.PI * Math.random());
      const flarePosition = hero.flarePosition();
      if (!flarePosition) {
        break;
      }
      const x = hero.heroX + flarePosition.x * hero.signX;
      const z = flarePosition.z + hero.heroZ;
      const angle = (Math.random() - 0.5) * (Math.PI / 4) + flarePosition.angle;
      const dz = speed * Math.sin(angle);
      const dx = speed * Math.cos(angle) + hero.speedX;
      if (sparks.length > MAX_SPARKS) {
        sparks.pop();
      }
      sparks.push({dead:false, x, y:hero.heroY + 0.01, z, dx, dy, dz, startTime:roomTime, deathTime:roomTime + 1.5, onFloor:false, });
    }
    const normalZ = 1;
    const normalX = 0;
    const floorZ = room.roomBottom;
    const gravityZ = normalZ * 9.8 * stepSize;
    const gravityX = normalX * 9.8 * stepSize;
    const friction = 1 - 0.8 * stepSize;
    sparks.forEach(particle => {
      const declaredDead = particle.dead;
      if (!declaredDead && roomTime < particle.deathTime) {
        particle.x += particle.dx * stepSize;
        particle.y += particle.dy * stepSize;
        particle.z += particle.dz * stepSize;
        let dz = particle.dz;
        if (particle.onFloor) {
          particle.dx *= friction;
          particle.dy *= friction;
        } else {
          dz -= gravityZ;
          particle.dx -= gravityX;
          particle.dz = dz;
        }
        if (particle.x < room.roomLeft || particle.x > room.roomRight) {
          particle.dead = true;
        }
        const y = particle.y;
        if (y < -module$src$SpriteData.ROOM_DEPTH_RADIUS || y > module$src$SpriteData.ROOM_DEPTH_RADIUS) {
          const reflectAgainst = y > 0 ? module$src$SpriteData.ROOM_DEPTH_RADIUS : -module$src$SpriteData.ROOM_DEPTH_RADIUS;
          particle.y = reflectAgainst + (reflectAgainst - y);
          particle.dy = -particle.dy;
        }
        if (particle.z < floorZ) {
          if (dz > -.01) {
            particle.z = floorZ;
            particle.dz = 0;
            particle.onFloor = true;
          } else {
            particle.z = floorZ + floorZ - particle.z;
            particle.dz = -.25 * dz;
          }
        }
      } else {
        if (!declaredDead) {
          particle.dead = true;
        }
      }
    });
    sparks.sort(compareSparks);
  }
  function makeSparkSprite(gl) {
    const FADE_STEPS = 18;
    const TAIL_LEAD = 6;
    const FADE_COEFFICIENT = 1 / FADE_STEPS / FADE_STEPS;
    const colorVal = dropIndex => {
      return Math.max(0, Math.min(255, Math.round(256 * (1 - FADE_COEFFICIENT * dropIndex * dropIndex))));
    };
    const bmp = [];
    for (let repeatedRow = 0; repeatedRow < module$src$SpriteData.TEX_PIXEL_PER_PIXEL; repeatedRow++) {
      for (let i = 0; i < FADE_STEPS; i++) {
        for (let pixel = 0; pixel < 2; pixel++) {
          let r, gb, alpha;
          const pseudoframe = i + pixel * TAIL_LEAD;
          if (pseudoframe < FADE_STEPS) {
            r = 255;
            gb = colorVal(pseudoframe);
            alpha = 255;
          } else {
            r = 0;
            gb = 0;
            alpha = 0;
          }
          const a = colorVal(i + pixel * TAIL_LEAD);
          const b = colorVal(i + pixel * TAIL_LEAD + 1);
          for (let repeatedCol = 0; repeatedCol < module$src$SpriteData.TEX_PIXEL_PER_PIXEL; repeatedCol++) {
            bmp.push(r, gb, gb, alpha);
          }
        }
      }
    }
    const tex = (0,module$src$swagl.loadTextureFromRawBitmap)({name:"spark", width:2 * FADE_STEPS * module$src$SpriteData.TEX_PIXEL_PER_PIXEL, height:module$src$SpriteData.TEX_PIXEL_PER_PIXEL, gl, bmp:new Uint8Array(bmp), });
    return new module$src$sprites.SpriteSet(tex, {"fading":(0,module$src$sprites.spriteSheet)({x:1 / module$src$SpriteData.PIXELS_PER_METER, width:.04, height:2 / module$src$SpriteData.PIXELS_PER_METER, texWidth:1 / FADE_STEPS, texHeight:1, numPerRow:FADE_STEPS, count:FADE_STEPS, }), });
  }
  function compareSparks(a, b) {
    return a.dead ? b.dead ? 0 : 1 : b.dead ? -1 : a.y - b.y;
  }
  function renderSparks(gl, program, room) {
    const sparkSprite = room.resources.sparkSprite;
    const stack = program.stack;
    sparkSprite.bindTo(program);
    room.sparks.forEach(particle => {
      if (!particle.dead) {
        stack.pushTranslation(particle.x, particle.y, particle.z);
        stack.pushYRotation((particle.dx >= 0 ? Math.PI : 0) + Math.atan(particle.dz / particle.dx));
        sparkSprite.renderSpriteDatumPrebound("fading", Math.floor(12 * (room.roomTime - particle.startTime)));
        stack.pop();
        stack.pop();
      }
    });
  }
}, "src/Flare.js", ["src/Scene.js", "src/SpriteData.js", "src/swagl.js", "src/sprites.js"]);

//src/Scene.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {Room:{enumerable:true, get:function() {
    return Room;
  }}, RoomKernel:{enumerable:true, get:function() {
    return RoomKernel;
  }}, Transition:{enumerable:true, get:function() {
    return Transition;
  }}, makeRoom:{enumerable:true, get:function() {
    return makeRoom;
  }}, offsetAFrameFrom:{enumerable:true, get:function() {
    return offsetAFrameFrom;
  }}});
  var module$src$Creature = $$require("src/Creature.js");
  var module$src$Hero = $$require("src/Hero.js");
  var module$src$Environ = $$require("src/Environ.js");
  var module$src$webgames$Input = $$require("src/webgames/Input.js");
  var module$src$webgames$Audio = $$require("src/webgames/Audio.js");
  var module$src$Flare = $$require("src/Flare.js");
  var module$src$sprites = $$require("src/sprites.js");
  let Resources;
  let Transition;
  let Room;
  let RoomKernel;
  function makeRoom(options) {
    const {roomLeft, roomRight, roomBottom, kernel} = options;
    return {name:options.name, resources:kernel.resources, input:kernel.input, audio:kernel.audio, creatures:[], roomTime:0, roomTimeOffset:offsetAFrameFrom(0), stepSize:0, roomLeft, roomRight, roomBottom, environSprites:(0,module$src$Environ.makeRoomSprites)(kernel.resources.environ, roomRight - roomLeft, roomLeft), sparks:[], lightsOn:false, hero:new module$src$Hero.Hero(kernel.resources.hero, (roomRight + roomLeft) / 2, roomBottom), transition:null, locks:0, ambientLight:0, interactables:[], };
  }
  function offsetAFrameFrom(time) {
    return Date.now() / 1000 - 1 / 60 - time;
  }
}, "src/Scene.js", ["src/Creature.js", "src/Hero.js", "src/Environ.js", "src/webgames/Input.js", "src/webgames/Audio.js", "src/Flare.js", "src/sprites.js"]);

//src/lighting.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {Lighting:{enumerable:true, get:function() {
    return Lighting;
  }}});
  var module$src$swagl = $$require("src/swagl.js");
  var module$src$sprites = $$require("src/sprites.js");
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$Scene = $$require("src/Scene.js");
  const COMPRESSION = 4;
  const fadeWidth = 64;
  const FLIP_Y = new Float32Array([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ]);
  class Lighting {
    constructor(gl, viewportWidth, viewportHeight, texPixelsPerMeter) {
      const lightingTexWidth = viewportWidth / COMPRESSION;
      const lightingTexHeight = viewportHeight / COMPRESSION;
      const vShader = new module$src$swagl.Shader({gl, type:"vertex"}, `#version 300 es
in vec3 a_position;
in vec2 a_texturePosition;

uniform mat4 u_projection;

out vec2 v_texturePosition;

void main() {
  gl_Position = u_projection * vec4(a_position, 1);
  v_texturePosition = a_texturePosition;
}`);
      const fShader = new module$src$swagl.Shader({gl, type:"fragment"}, `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_threshold;
uniform vec4 u_color;

in vec2 v_texturePosition;
out vec4 output_color;

void main() {
    vec4 color = texture(u_texture, v_texturePosition.st);
    
    if (u_threshold != -1.f) {
      color.a -= u_threshold;
      if (color.a <= u_threshold) {
          discard;
      }
      output_color = color;
    } else {
      if (color.a == 0.f) {
        discard;
      }
      output_color = u_color;
    }
}`);
      const program = new module$src$swagl.Program({gl, projection:"projection"});
      program.attach(vShader, fShader).link();
      const targetTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, targetTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lightingTexWidth, lightingTexHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      const fadeRadius = COMPRESSION * (0.5 * fadeWidth) / texPixelsPerMeter;
      const fadeTexture = (0,module$src$swagl.loadTextureFromRawBitmap)({name:"fade", width:fadeWidth, height:fadeWidth, gl, bmp:makeQuadraticDropoff(fadeWidth, fadeWidth, 0.01, texPixelsPerMeter), });
      this._program = program;
      this._targetTex = (0,module$src$swagl.wrapPremadeTexture)({tex:targetTex, name:"lighting", width:lightingTexWidth, height:lightingTexHeight, gl, });
      this._frameBuffer = fb;
      this._fade = new module$src$sprites.SpriteSet(fadeTexture, {"main":[[fadeRadius, 0, -fadeRadius, 1, 0, fadeRadius, 0, fadeRadius, 1, 1, -fadeRadius, 0, -fadeRadius, 0, 0, -fadeRadius, 0, fadeRadius, 0, 1, ]], });
      this._whiteSquare = new module$src$sprites.SpriteSet((0,module$src$swagl.makeSolidTexture)(gl, 255, 255, 255, 255), {"main":[[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, ]], });
    }
    renderLighting(renderInCamera, room) {
      const gl = this._program.gl;
      const tex = this._targetTex;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
      gl.viewport(0, 0, tex.w, tex.h);
      (0,module$src$swagl.doAnimationFrame)(this._program, (gl, program) => {
        renderLightingToTexture(gl, program, renderInCamera, this, room);
      });
    }
    lightingTex() {
      return this._targetTex;
    }
  }
  function renderLightingToTexture(gl, program, renderInCamera, lighting, rooms) {
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const thresholdAnchor = program.u["threshold"];
    const colorAnchor = program.u["color"];
    gl.uniform1f(thresholdAnchor, -1);
    const stack = program.stack;
    renderInCamera(stack, () => {
      const whiteSquare = lighting._whiteSquare;
      whiteSquare.bindTo(program);
      rooms.forEach(room => {
        gl.uniform4f(colorAnchor, 0, 0, 0, window.lightsOn || room.lightsOn ? 1 : room.ambientLight);
        const projection = room.resources.environ.projection;
        const roomLeft = room.roomLeft - projection.lipWidth;
        const roomWidth = room.roomRight + projection.lipWidth - roomLeft;
        const roomBottom = room.roomBottom - projection.lipHeight;
        const roomHeight = 2 * projection.lipHeight + module$src$SpriteData.ROOM_HEIGHT;
        stack.push(new Float32Array([roomWidth, 0, 0, 0, 0, 0, 0, 0, 0, 0, roomHeight, 0, roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, roomBottom, 1]));
        whiteSquare.renderSpriteDatumPrebound("main", 0);
        stack.pop();
      });
      const fade = lighting._fade;
      fade.bindTo(program);
      gl.uniform4f(colorAnchor, 0, 0, 0, 1);
      rooms.forEach(room => {
        const time = room.roomTime;
        room.sparks.forEach(particle => {
          if (!particle.dead) {
            const startTime = particle.startTime;
            const percentPassed = (time - startTime) / (particle.deathTime - startTime);
            gl.uniform1f(thresholdAnchor, 0.5 * percentPassed * percentPassed);
            stack.pushTranslation(particle.x, particle.y, particle.z);
            fade.renderSpriteDatumPrebound("main", 0);
            stack.pop();
          }
        });
      });
    });
  }
  function makeQuadraticDropoff(width, height, brightRadius, texPixelsPerMeter) {
    const bitmap = new Uint8Array(4 * width * height);
    const getDistanceSquared = (pixelDx, pixelDy) => {
      const dx = pixelDx / texPixelsPerMeter;
      const dy = pixelDy / texPixelsPerMeter;
      return dx * dx + dy * dy;
    };
    const middleX = width / 2;
    const middleY = height / 2;
    const brightRadiusSquared = brightRadius * brightRadius;
    const edgeValue = Math.min(getDistanceSquared(middleX, 0), getDistanceSquared(middleY, 0));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = 4 * (y * width + x);
        const distanceSquared = getDistanceSquared(x - middleX, y - middleY);
        const percentageFromEdge = 1 - Math.sqrt(distanceSquared / edgeValue);
        const brightAdd = distanceSquared <= brightRadiusSquared ? 5 : 0;
        const primary = Math.max(Math.round(255 * percentageFromEdge * percentageFromEdge), 0);
        bitmap[offset + 0] = brightAdd + Math.max(Math.round(20 * percentageFromEdge), 0);
        bitmap[offset + 1] = brightAdd;
        bitmap[offset + 2] = brightAdd;
        bitmap[offset + 3] = primary;
      }
    }
    return bitmap;
  }
  function makeCircleSprite(radiusInPixels, texPixelsPerMeter) {
    const bitmap = new Uint8Array(4 * radiusInPixels * radiusInPixels);
  }
}, "src/lighting.js", ["src/swagl.js", "src/sprites.js", "src/SpriteData.js", "src/Scene.js"]);

//src/Environ.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {EnvironResources:{enumerable:true, get:function() {
    return EnvironResources;
  }}, EnvironRoomSprites:{enumerable:true, get:function() {
    return EnvironRoomSprites;
  }}, ProjectionData:{enumerable:true, get:function() {
    return ProjectionData;
  }}, buildProjectionData:{enumerable:true, get:function() {
    return buildProjectionData;
  }}, loadEnvironResources:{enumerable:true, get:function() {
    return loadEnvironResources;
  }}, makeRoomSprites:{enumerable:true, get:function() {
    return makeRoomSprites;
  }}});
  var module$src$sprites = $$require("src/sprites.js");
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$swagl = $$require("src/swagl.js");
  let ProjectionData;
  let EnvironResources;
  let EnvironRoomSprites;
  function buildProjectionData(outputWidth, outputHeight) {
    const roomDepth = 2 * module$src$SpriteData.ROOM_DEPTH_RADIUS;
    const layoutMiddleY = (module$src$SpriteData.LAYOUT_TARGETS.CEIL_FOREGROUND + module$src$SpriteData.LAYOUT_TARGETS.FLOOR_FOREGROUND) / 2;
    const clipSpaceY = layoutTargetY => (layoutMiddleY - layoutTargetY) / outputHeight;
    const Ry = clipSpaceY((module$src$SpriteData.LAYOUT_TARGETS.CEIL_FOREGROUND + module$src$SpriteData.LAYOUT_TARGETS.CEIL_BACKGROUND) / 2);
    const w1 = Ry / clipSpaceY(module$src$SpriteData.LAYOUT_TARGETS.CEIL_FOREGROUND);
    const w2 = Ry / clipSpaceY(module$src$SpriteData.LAYOUT_TARGETS.CEIL_BACKGROUND);
    const scaleY = Ry / (module$src$SpriteData.ROOM_HEIGHT / 2);
    const scaleX = scaleY * (outputHeight / outputWidth);
    const matrix = new Float32Array([scaleX, 0, 0, 0, 0, 0, 1 / roomDepth, (w2 - w1) / roomDepth, 0, scaleY, 0, 0, 0, 0, 0, (w1 + w2) / 2, ]);
    return {matrix, wForeground:w1, wBackground:w2, scaleX, scaleY, widthPx:outputWidth, heightPx:outputHeight, lipHeight:clipSpaceY(module$src$SpriteData.LAYOUT_TARGETS.CEIL_LIP) * w1 / scaleY - module$src$SpriteData.ROOM_HEIGHT / 2, lipWidth:0.3, };
  }
  async function loadEnvironResources(projection, loadTexture) {
    const [ladderTex, wallTex, floorTex, ceilTex, sideTex, variousTex, lightsTex] = await Promise.all([loadTexture("ladder", "assets/ladder.png"), loadTexture("wall", "assets/Back Wall.png"), loadTexture("floor", "assets/floor.png"), loadTexture("ceiling", "assets/ceiling.png"), loadTexture("wall", "assets/side_wall.png"), loadTexture("set_pieces", "assets/set_pieces.png"), loadTexture("lights", "assets/Light Switch Flip.png"), ]);
    const ladderSprite = new module$src$sprites.SpriteSet(ladderTex, {"main":[setPiece(projection, ladderTex, {xPx:ladderTex.w, yPx:ladderTex.h, widthPx:ladderTex.w, heightPx:ladderTex.h, offsetY:module$src$SpriteData.LADDER_Y, offsetZ:module$src$SpriteData.ROOM_HEIGHT / 2, })], });
    const setPieceData = {};
    setPieceData["barrel1"] = [setPiece(projection, variousTex, {xPx:370, yPx:270, widthPx:338, heightPx:222, offsetY:module$src$SpriteData.LADDER_Y, }), ];
    setPieceData["upperHatch"] = [setPiece(projection, variousTex, {xPx:2036, yPx:725, widthPx:345, heightPx:311, offsetY:module$src$SpriteData.LADDER_Y, }), ];
    setPieceData["lowerHatch"] = [setPiece(projection, variousTex, {xPx:2036, yPx:725, widthPx:345, heightPx:311, offsetY:0.1, flipY:true, offsetZ:0.5, }), ];
    const setPieces = new module$src$sprites.SpriteSet(variousTex, setPieceData);
    const offSwitchData = setPiece(projection, lightsTex, {xPx:316, yPx:298, widthPx:118, heightPx:152, offsetY:module$src$SpriteData.ROOM_DEPTH_RADIUS, offsetZ:module$src$SpriteData.SWITCH_HEIGHT, });
    const onSwitchData = setPiece(projection, lightsTex, {xPx:316, yPx:1110, widthPx:118, heightPx:152, offsetY:module$src$SpriteData.ROOM_DEPTH_RADIUS, offsetZ:module$src$SpriteData.SWITCH_HEIGHT, });
    const lightSwitches = new module$src$sprites.SpriteSet(lightsTex, {"on":[onSwitchData], "off":[offSwitchData], });
    return {projection, wallTex, floorTex, ceilTex, sideTex, ladderSprite, setPieces, lightSwitches, };
  }
  function makeRoomSprites({wallTex, floorTex, ceilTex, sideTex, projection}, roomWidth, trueRoomLeft) {
    const roomLeft = trueRoomLeft - projection.lipWidth;
    const roomRight = trueRoomLeft + roomWidth + projection.lipWidth;
    const wallTopY = 494 / wallTex.h;
    const wallBottomY = 1016 / wallTex.h;
    const wallHeightPercent = wallBottomY - wallTopY;
    const rightWallTex = wallHeightPercent * wallTex.h / module$src$SpriteData.ROOM_HEIGHT * roomWidth / wallTex.w;
    const wallSpriteSet = new module$src$sprites.SpriteSet(wallTex, {"main":[[roomRight, module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, rightWallTex, wallTopY, roomRight, module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, rightWallTex, wallBottomY, roomLeft, module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, 0, wallTopY, roomLeft, module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, 0, wallBottomY, ]], });
    const floorBackground = 110 / floorTex.h;
    const floorForeground = 220 / floorTex.h;
    const rightFloorTex = (floorForeground - floorBackground) * floorTex.h / (2 * module$src$SpriteData.ROOM_DEPTH_RADIUS) * roomWidth / floorTex.w;
    const floorSpriteSet = new module$src$sprites.SpriteSet(floorTex, {"main":[[roomRight, -module$src$SpriteData.ROOM_DEPTH_RADIUS, -projection.lipHeight, rightFloorTex, 1, roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, -projection.lipHeight, 0, 1, roomRight, -module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, rightFloorTex, floorForeground, roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, 0, floorForeground, roomRight, module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, rightFloorTex, floorBackground, 
    roomLeft, module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, 0, floorBackground, ]], });
    const ceilBackground = 144 / ceilTex.h;
    const ceilForeground = 32 / ceilTex.h;
    const rightCeilTex = (ceilForeground - ceilBackground) * ceilTex.h / (2 * module$src$SpriteData.ROOM_DEPTH_RADIUS) * roomWidth / ceilTex.w;
    const ceilSpriteSet = new module$src$sprites.SpriteSet(ceilTex, {"main":[[roomRight, -module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT + projection.lipHeight, rightCeilTex, 0, roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT + projection.lipHeight, 0, 0, roomRight, -module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, rightCeilTex, ceilForeground, roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, 
    0, ceilForeground, roomRight, module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, rightCeilTex, ceilBackground, roomLeft, module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, 0, ceilBackground, ]], });
    const sideLipX = 438 / sideTex.w;
    const sideForegroundX = 318 / sideTex.w;
    const sideForegroundHighY = 194 / sideTex.h;
    const sideForegroundLowY = 1164 / sideTex.h;
    const sideBackgroundX = 84 / sideTex.w;
    const sideBackgroundHighY = 414 / sideTex.h;
    const sideBackgroundLowY = 964 / sideTex.h;
    const sideLeftData = [roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, sideLipX, sideForegroundHighY, roomLeft, -module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, sideLipX, sideForegroundLowY, roomLeft + projection.lipWidth, -module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, sideForegroundX, sideForegroundHighY, roomLeft + projection.lipWidth, -module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, sideForegroundX, sideForegroundLowY, roomLeft + 
    projection.lipWidth, module$src$SpriteData.ROOM_DEPTH_RADIUS, module$src$SpriteData.ROOM_HEIGHT, sideBackgroundX, sideBackgroundHighY, roomLeft + projection.lipWidth, module$src$SpriteData.ROOM_DEPTH_RADIUS, 0, sideBackgroundX, sideBackgroundLowY, ];
    const sideRightData = [];
    for (let i = 0; i < sideLeftData.length; i += 5) {
      const x = sideLeftData[i + 0];
      const y = sideLeftData[i + 1];
      const z = sideLeftData[i + 2];
      const texX = sideLeftData[i + 3];
      const texY = sideLeftData[i + 4];
      sideRightData.push(roomRight + (roomLeft - x), y, z, texX, texY);
    }
    const sideSpriteSet = new module$src$sprites.SpriteSet(sideTex, {"right":[sideRightData], "left":[sideLeftData], });
    return {wallSpriteSet, floorSpriteSet, ceilSpriteSet, sideSpriteSet, };
  }
  function setPiece(projection, tex, {offsetX = 0, offsetY = 0, offsetZ = 0, xPx, yPx, widthPx, heightPx, rescale = 1, flipY = false, flipX = false}) {
    let imgTop = (yPx - heightPx) / tex.h;
    let imgBottom = yPx / tex.h;
    if (flipY) {
      const temp = imgTop;
      imgTop = imgBottom;
      imgBottom = temp;
    }
    let imgLeft = (xPx - widthPx) / tex.w;
    let imgRight = xPx / tex.w;
    if (flipX) {
      const temp = imgLeft;
      imgLeft = imgRight;
      imgRight = temp;
    }
    const {scaleX, scaleY} = projection;
    const centerW = wAt(projection, offsetY);
    const centerX = offsetX * scaleX / centerW;
    const centerY = offsetZ * scaleY / centerW;
    const Rx = widthPx / projection.widthPx / 2;
    const Ry = heightPx / projection.heightPx / 2;
    const left = centerX - Rx;
    const right = centerX + Rx;
    const top = centerY + Ry;
    const bottom = centerY - Ry;
    const x1 = left * centerW / scaleX;
    const x2 = right * centerW / scaleX;
    const z1 = top * centerW / scaleY;
    const z2 = bottom * centerW / scaleY;
    return [x1, offsetY, z1, imgLeft, imgTop, x2, offsetY, z1, imgRight, imgTop, x1, offsetY, z2, imgLeft, imgBottom, x2, offsetY, z2, imgRight, imgBottom, ];
  }
  function wAt(projection, y) {
    const p = (y + module$src$SpriteData.ROOM_DEPTH_RADIUS) / (2 * module$src$SpriteData.ROOM_DEPTH_RADIUS);
    return projection.wForeground * (1 - p) + projection.wBackground * p;
  }
  function wToY(projection, w) {
    const p = (w - projection.wForeground) / (projection.wBackground - projection.wForeground);
    return 2 * module$src$SpriteData.ROOM_DEPTH_RADIUS * p - module$src$SpriteData.ROOM_DEPTH_RADIUS;
  }
  function makeNorm(x, y, z) {
    const mag = Math.sqrt(x * x + y * y + z * z);
    return {x:x / mag, y:y / mag, z:z / mag};
  }
}, "src/Environ.js", ["src/sprites.js", "src/SpriteData.js", "src/swagl.js"]);

//src/World.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {World:{enumerable:true, get:function() {
    return World;
  }}, cameraPositionForRoom:{enumerable:true, get:function() {
    return cameraPositionForRoom;
  }}, initWorld:{enumerable:true, get:function() {
    return initWorld;
  }}, updateRoomTime:{enumerable:true, get:function() {
    return updateRoomTime;
  }}});
  var module$src$Scene = $$require("src/Scene.js");
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$Creature = $$require("src/Creature.js");
  var module$src$Interactables = $$require("src/Interactables.js");
  const CAMERA_X_OFFSET = 1;
  class World {
    constructor(kernel, startRoom) {
      this.kernel = kernel;
      this.rooms = new Map([[startRoom.name, startRoom]]);
      this.activeRoom = startRoom;
    }
    switchToRoom(roomName) {
      if (this.activeRoom.name === roomName) {
        return;
      }
      this.activeRoom = this.getRoom(roomName);
    }
    getRoom(roomName) {
      const rooms = this.rooms;
      let room = rooms.get(roomName);
      if (!room) {
        room = initRoom(this.kernel, roomName);
        rooms.set(roomName, room);
      }
      return room;
    }
  }
  function initWorld(kernel) {
    return new World(kernel, initRoom(kernel, "start"));
  }
  function initRoom(kernel, name) {
    switch(name) {
      case "start":
        {
          const room = (0,module$src$Scene.makeRoom)({kernel, name, roomRight:6, roomLeft:-6, roomBottom:20, });
          room.ambientLight = 0.4;
          room.hero.heroX = -1;
          room.interactables.push(new module$src$Interactables.LightSwitch(1));
          return room;
        }
      case "r0":
        {
          const room = (0,module$src$Scene.makeRoom)({kernel, name, roomLeft:0, roomRight:12, roomBottom:0, });
          const hero = room.hero;
          hero.heroX = room.roomLeft + 4;
          (0,module$src$Creature.spawnCreature)(room, hero.heroX + 2);
          room.ambientLight = 0.1;
          return room;
        }
      case "r1":
        {
          const room = (0,module$src$Scene.makeRoom)({kernel, name, roomLeft:-12, roomRight:10, roomBottom:module$src$SpriteData.ROOM_HEIGHT + 3, });
          (0,module$src$Creature.spawnCreature)(room, 0);
          return room;
        }
      default:
        throw new Error(`Unrecognized room name "${name}"`);
    }
  }
  function cameraPositionForRoom(room) {
    return {x:Math.min(Math.max(room.hero.heroX, room.roomLeft + CAMERA_X_OFFSET), room.roomRight - CAMERA_X_OFFSET), y:0, z:room.roomBottom + module$src$SpriteData.ROOM_HEIGHT / 2, };
  }
  function updateRoomTime(room, time) {
    const newTime = time - room.roomTimeOffset;
    room.stepSize = newTime - room.roomTime;
    room.roomTime = newTime;
  }
}, "src/World.js", ["src/Scene.js", "src/SpriteData.js", "src/Creature.js", "src/Interactables.js"]);

//src/exe.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  var module$src$swagl = $$require("src/swagl.js");
  var module$src$webgames$Input = $$require("src/webgames/Input.js");
  var module$src$lighting = $$require("src/lighting.js");
  var module$src$SpriteData = $$require("src/SpriteData.js");
  var module$src$Creature = $$require("src/Creature.js");
  var module$src$Scene = $$require("src/Scene.js");
  var module$src$Hero = $$require("src/Hero.js");
  var module$src$Environ = $$require("src/Environ.js");
  var module$src$webgames$Audio = $$require("src/webgames/Audio.js");
  var module$src$Flare = $$require("src/Flare.js");
  var module$src$World = $$require("src/World.js");
  async function onLoad() {
    const fpsNode = document.getElementById("fps");
    const canvas = document.getElementById("canvas");
    const computedStyle = window.getComputedStyle(canvas);
    const input = new module$src$webgames$Input.InputManager(document.body);
    input.setKeysForAction("left", ["a", "ArrowLeft"]);
    input.setKeysForAction("right", ["d", "ArrowRight"]);
    input.setKeysForAction("showLights", ["l"]);
    input.setKeysForAction("attack", ["f", " "]);
    input.setKeysForAction("fullscreen", ["u"]);
    input.setKeysForAction("up", ["w", "ArrowUp"]);
    input.setKeysForAction("down", ["s", "ArrowDown"]);
    input.setKeysForAction("lightUp", ["y"]);
    input.setKeysForAction("lightDown", ["h"]);
    let width = parseInt(computedStyle.getPropertyValue("width"), 10);
    let height = parseInt(computedStyle.getPropertyValue("height"), 10);
    let debugShowLights = false;
    const ratio = window.devicePixelRatio || 1;
    const canvasWidth = ratio * width;
    const canvasHeight = ratio * height;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const projection = (0,module$src$Environ.buildProjectionData)(width, height);
    const gl = canvas.getContext("webgl2", {antialias:false, alpha:false});
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    const vShader = new module$src$swagl.Shader({gl, type:"vertex"}, `#version 300 es
in vec3 a_position;
in vec2 a_texturePosition;

uniform mat4 u_projection;

out vec4 v_clipSpace;
out vec2 v_texturePosition;

void main() {
    vec4 position = u_projection * vec4(a_position, 1);
    // float inverse = 1.f / (1.f - position.z * .2f);

    // vec4 result = vec4(position.x, inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);
    // vec4 result = vec4(position.x * position.w, position.y, position.z, position.w);
    vec4 result = position;
    gl_Position = result;
    
    v_clipSpace = result;
    v_texturePosition = a_texturePosition;
}`);
    const fShader = new module$src$swagl.Shader({gl, type:"fragment"}, `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_lighting;

in vec2 v_texturePosition;
in vec4 v_clipSpace;
out vec4 output_color;

void main() {
    vec4 clipSpace = v_clipSpace / v_clipSpace.w; //vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w) / v_clipSpace.w;
    clipSpace.x = .5f * (clipSpace.x + 1.f);
    clipSpace.y = 1.f - .5f * (1.f - clipSpace.y); // why????

    vec4 color = texture(u_texture, v_texturePosition.st);
    if (color.a == 0.0) {
        discard;
    }

    vec4 light = texture(u_lighting, clipSpace.xy);
    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));
    output_color = vec4(math, color.a);
}`);
    const program = new module$src$swagl.Program({gl, projection:"projection"});
    program.attach(vShader, fShader).link();
    const lighting = new module$src$lighting.Lighting(gl, canvasWidth, canvasHeight, module$src$SpriteData.TEX_PIXELS_PER_METER);
    const audioManager = new module$src$webgames$Audio.AudioManager;
    const loadTexture = (name, url) => {
      return (0,module$src$swagl.loadTextureFromImgUrl)({gl, name, src:url});
    };
    const loadSound = url => audioManager.loadSound(url);
    const [environResources, creatureResources, heroResources] = await Promise.all([(0,module$src$Environ.loadEnvironResources)(projection, loadTexture), (0,module$src$Creature.loadCreatureResources)(loadTexture, loadSound), (0,module$src$Hero.loadHeroResources)(loadTexture, loadSound), ]);
    const kernel = {resources:{creature:creatureResources, hero:heroResources, environ:environResources, sparkSprite:(0,module$src$Flare.makeSparkSprite)(gl), }, input, audio:audioManager, };
    const world = (0,module$src$World.initWorld)(kernel);
    let mouseX = 0;
    let mouseY = 0;
    let avgFps = -1;
    let fullScreenRequest = null;
    document.addEventListener("fullscreenchange", event => {
      if (!document.fullscreenElement) {
        fullScreenRequest = null;
      }
    });
    let cameraPosition = {x:0, y:0, z:0};
    const shipLength = 100;
    const wave1 = (realTime, isFar) => {
      const time = realTime + (isFar ? 170 : 0);
      return Math.sin(Math.PI * time / 8) / 2;
    };
    const wave2 = (realTime, isFar) => {
      const time = realTime + (isFar ? 130 : 0);
      return Math.sin(Math.PI * time / 3) / 8;
    };
    let shipAngle, normalX, normalZ, shipDz;
    function processRoom(room) {
      let transition = room.transition;
      (0,module$src$Hero.processHero)(room);
      if (room.transition && !transition) {
        transition = room.transition;
        const newRoom = world.getRoom(transition.roomName);
        (0,module$src$Scene.offsetAFrameFrom)(room.roomTime + room.roomTimeOffset);
        (0,module$src$Hero.transitionInHero)(transition, room, newRoom);
      }
      (0,module$src$Flare.processFlare)(room);
      if (!transition && !room.locks) {
        (0,module$src$Creature.processCreatures)(room);
      }
    }
    function renderInCamera(stack, subcode) {
      stack.push(projection.matrix);
      stack.pushTranslation(-cameraPosition.x, -cameraPosition.y, -cameraPosition.z);
      stack.pushTranslation(0, 0, shipDz);
      stack.pushYRotation(shipAngle);
      subcode();
      stack.pop();
      stack.pop();
      stack.pop();
    }
    function renderInSceneContent(gl, program, room) {
      const stack = program.stack;
      stack.pushTranslation(0, 0, room.roomBottom);
      const wall = room.environSprites.wallSpriteSet;
      wall.bindTo(program);
      wall.renderSpriteDatumPrebound("main", 0);
      const floor = room.environSprites.floorSpriteSet;
      floor.bindTo(program);
      floor.renderSpriteDatumPrebound("main", 0);
      const ceilingSprite = room.environSprites.ceilSpriteSet;
      ceilingSprite.bindTo(program);
      ceilingSprite.renderSpriteDatumPrebound("main", 0);
      const sideSprite = room.environSprites.sideSpriteSet;
      sideSprite.bindTo(program);
      sideSprite.renderSpriteDatumPrebound("left", 0);
      sideSprite.renderSpriteDatumPrebound("right", 0);
      stack.pop();
      room.interactables.forEach(interactable => {
        interactable.render(gl, program, room);
      });
      (0,module$src$Hero.renderHero)(gl, program, room);
      (0,module$src$Creature.renderCreatures)(gl, program, room);
      (0,module$src$Flare.renderSparks)(gl, program, room);
    }
    function renderMain(gl, program, rooms) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE1);
      lighting.lightingTex().bindTexture();
      gl.uniform1i(program.u["lighting"], 1);
      gl.activeTexture(gl.TEXTURE0);
      renderInCamera(program.stack, () => {
        rooms.forEach(room => {
          const depth = program.stack.depth();
          renderInSceneContent(gl, program, room);
          const depth2 = program.stack.depth();
          if (depth2 !== depth) {
            console.error("yo!");
          }
        });
      });
    }
    let prevRun = Date.now();
    function gameLoop() {
      if (!fullScreenRequest && input.isPressed("fullscreen")) {
        fullScreenRequest = canvas.requestFullscreen();
      }
      const realTime = Date.now() / 1000;
      if (avgFps === -1) {
        avgFps = 60;
      } else {
        const FACTOR = 1 / 8;
        avgFps = FACTOR * 1 / (realTime - prevRun) + (1 - FACTOR) * avgFps;
      }
      fpsNode.innerHTML = `fps=${Math.round(avgFps)}`;
      prevRun = realTime;
      const bowY = wave1(realTime, false) + wave2(realTime, false);
      const sternY = wave1(realTime, true) + wave2(realTime, true);
      shipAngle = Math.asin((bowY - sternY) / shipLength);
      normalZ = Math.cos(shipAngle);
      normalX = Math.sin(shipAngle);
      shipDz = (bowY + sternY) / 2;
      let room = world.activeRoom;
      let nextRoom = null;
      const transition = room.transition;
      if (transition) {
        if (transition.realWorldStartTime + transition.seconds < realTime) {
          room.transition = null;
          world.switchToRoom(transition.roomName);
          room = world.activeRoom;
        } else {
          nextRoom = world.getRoom(transition.roomName);
        }
      }
      const rooms = nextRoom ? [room, nextRoom] : [room];
      rooms.forEach(room => (0,module$src$World.updateRoomTime)(room, realTime));
      cameraPosition = (0,module$src$World.cameraPositionForRoom)(room);
      if (nextRoom) {
        const p = (realTime - transition.realWorldStartTime) / transition.seconds;
        const factor = Math.sin(Math.PI / 2 * p);
        const smooth = (a, b) => a * (1 - factor) + b * factor;
        const targetCameraPosition = (0,module$src$World.cameraPositionForRoom)(nextRoom);
        cameraPosition = {x:smooth(cameraPosition.x, targetCameraPosition.x), y:smooth(cameraPosition.y, targetCameraPosition.y), z:smooth(cameraPosition.z, targetCameraPosition.z), };
      }
      if (input.numPresses("showLights") % 2) {
        debugShowLights = !debugShowLights;
        window.lightsOn = debugShowLights;
      }
      rooms.forEach(room => processRoom(room));
      lighting.renderLighting(renderInCamera, rooms);
      (0,module$src$swagl.doAnimationFrame)(program, (gl, program) => renderMain(gl, program, rooms));
      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
    canvas.onmousemove = event => {
      mouseX = event.offsetX;
      mouseY = event.offsetY;
    };
  }
  window.onload = onLoad;
}, "src/exe.js", ["src/swagl.js", "src/webgames/Input.js", "src/lighting.js", "src/SpriteData.js", "src/Creature.js", "src/Scene.js", "src/Hero.js", "src/Environ.js", "src/webgames/Audio.js", "src/Flare.js", "src/World.js"]);

