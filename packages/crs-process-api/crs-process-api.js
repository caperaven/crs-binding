// src/process-registry.js
var SchemaRegistry = class {
  constructor() {
    this._schemas = {};
    crsbinding.events.emitter.on("run-process", this._runProcess.bind(this));
  }
  _runProcess(args) {
    return new Promise(async (resolve, reject) => {
      const processName = args.step.action;
      const schemaName = args.step.args.schema;
      let schema = this._schemas[schemaName];
      if (schema == null && crs.process.fetch != null) {
        schema = await crs.process.fetch(args.step);
        this.add(schema);
      }
      if (schema == null) {
        throw new Error(`process "${schemaName}" not in registry and not loaded.`);
      }
      const process = schema[processName];
      process.name = processName;
      await copyParametersToProcess(process, args.parameters);
      const result = await crs.process.run(args.context, process).catch((error) => {
        let event = process.aborted == true ? "crs-process-aborted" : "crs-process-error";
        crsbinding.events.emitter.emit(event, {
          step: process.currentStep,
          error
        });
        args.step.aborted = true;
        return;
      });
      const resultPath = args.step.args?.target;
      if (resultPath != null) {
        await crs.process.setValue(resultPath, result, args.context, args.process, args.item);
      }
      resolve();
    });
  }
  add(schema) {
    this._schemas[schema.id] = schema;
  }
  remove(schema) {
    delete this._schemas[schema.id];
  }
};
async function copyParametersToProcess(process, parameters) {
  if (parameters == null)
    return;
  process.parameters = process.parameters || {};
  for (const [key, value] of Object.entries(parameters)) {
    process.parameters[key] = value;
  }
}

// src/process-runner.js
var ProcessRunner = class {
  static run(context, process, item, text, prefixes) {
    return new Promise(async (resolve, reject) => {
      process = JSON.parse(JSON.stringify(process));
      process.data = process.data || {};
      process.context = context;
      process.functions = {};
      process.text = text;
      process.expCache = {};
      populatePrefixes(prefixes, process);
      if (process.bindable == true) {
        if (crs.intent.binding == null) {
          await crs.modules.get("binding");
        }
        await crs.intent.binding.create_context(null, context, process, null);
      }
      await crsbinding.events.emitter.emit("process-starting", process);
      crsbinding.idleTaskManager.add(async () => {
        let result;
        await validateParameters(context, process, item).catch((error) => {
          process.aborted = true;
          reject({ process: process.name, step: process.currentStep, error });
        });
        await this.runStep(process.steps.start, context, process, item).then(async () => {
          result = process.result;
          await this.cleanProcess(process);
        }).then(() => resolve(result)).catch((error) => {
          process.aborted = true;
          reject({ process: process.name, step: process.currentStep, error });
        });
      });
    });
  }
  static async runStep(step, context = null, process = null, item = null) {
    if (step == null)
      return;
    await setBinding("binding_before", step, context, process, item);
    let result;
    if (step.type != null) {
      if (crs.intent[step.type] == null) {
        await crs.modules.get(step.type);
      }
      result = await crs.intent[step.type].perform(step, context, process, item);
    }
    if (step.args?.log != null) {
      const value = await this.getValue(step.args.log, context, process, item);
      console.log(value);
    }
    await setBinding("binding_after", step, context, process, item);
    if (process?.aborted !== true && step.aborted !== true) {
      const nextStep = process?.steps?.[step.alt_next_step || step.next_step];
      if (process != null) {
        process.currentStep = step.next_step;
      }
      if (nextStep != null) {
        return await this.runStep(nextStep, context, process, item);
      }
    }
    return result;
  }
  static async getValue(expr, context = null, process = null, item = null) {
    if (typeof expr != "string")
      return expr;
    if (expr.indexOf("${") == 0)
      return expr;
    if (expr == "$context")
      return context;
    if (expr == "$process")
      return process;
    if (expr == "$item")
      return item;
    if (expr.indexOf("$") == -1)
      return expr;
    if (expr.indexOf("$binding") != -1) {
      return crsbinding.data.getValue(process.parameters.bId, expr.replace("$binding.", ""));
    }
    if (expr.indexOf("$fn") != -1) {
      expr = expr.split("$fn").join("");
    }
    expr = process?.expCache == null ? expr : getFromCache(expr, process);
    if (expr.indexOf("rgb(") != -1) {
      return expr;
    }
    let fn = process?.functions?.[expr];
    if (fn == null) {
      const exp = expr.split("$").join("");
      fn = new Function("context", "process", "item", `return ${exp};`);
      if (process != null && process.functions != null) {
        process.functions[expr] = fn;
      }
    }
    return fn(context, process, item);
  }
  static async setValue(expr, value, context, process, item) {
    let ctx;
    expr = process?.expCache == null ? expr : getFromCache(expr, process);
    if (expr.indexOf("$binding") != -1) {
      const bId = process.parameters?.bId;
      const property = expr.split(".")[1];
      return crsbinding.data.setProperty(bId, property, value);
    }
    if (expr.indexOf("$item") != -1) {
      ctx = item;
      expr = expr.replace("$item.", "");
    } else if (expr.indexOf("$process") != -1) {
      ctx = process;
      expr = expr.replace("$process.", "");
    } else {
      ctx = context;
      expr = expr.replace("$context.", "");
    }
    let obj = ctx;
    if (expr.indexOf(".") == -1) {
      obj[expr] = await this.getValue(value, context, process, item);
    } else {
      const parts = expr.split(".");
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        obj = obj[part] = obj[part] || {};
      }
      value = await this.getValue(value, context, process, item);
      obj[parts[parts.length - 1]] = value;
    }
  }
  static async cleanProcess(process) {
    if (process.bindable == true) {
      crsbinding.data.removeObject(process.parameters.bId);
    }
    await this.cleanObject(process.data);
    await this.cleanObject(process.functions);
    delete process.context;
    delete process.functions;
    delete process.parameters;
    delete process.result;
    delete process.data;
    delete process.steps;
    delete process.text;
    delete process.prefixes;
    delete process.expCache;
    await crsbinding.events.emitter.emit("process-ended", process);
  }
  static async cleanObject(obj) {
    if (obj == null)
      return;
    const keys = Object.keys(obj);
    for (let key of keys) {
      delete obj[key];
    }
    return null;
  }
};
async function setBinding(name, step, context, process, item) {
  if (crs.intent.binding == null) {
    await crs.modules.get("binding");
  }
  const obj = step[name];
  if (obj == null || process.parameters?.bId == null)
    return;
  const keys = Object.keys(obj);
  for (let key of keys) {
    await crs.intent.binding.set_property({
      args: {
        property: key,
        value: obj[key]
      }
    }, context, process, item);
  }
}
async function validateParameters(context, process, item) {
  if (process.parameters_def == null)
    return;
  process.parameters = process.parameters || {};
  let isValid = true;
  for (const [key, value] of Object.entries(process.parameters_def)) {
    if (value.required === true) {
      if (process.parameters[key] == null && value.default != null) {
        process.parameters[key] = await crs.process.getValue(value.default, context, process, item);
      }
      isValid = process.parameters[key] != null;
    }
    if (isValid === false) {
      process.aborted = true;
      process.currentStep = "validate process parameters";
      throw new Error(`required parameter "${key}" not set or is null`);
    }
  }
}
function populatePrefixes(prefixes, process) {
  process.prefixes = process.prefixes || {};
  if (prefixes != null) {
    Object.assign(process.prefixes, prefixes);
  }
  process.prefixes["$text"] = "$process.text";
  process.prefixes["$data"] = "$process.data";
  process.prefixes["$parameters"] = "$process.parameters";
  process.prefixes["$bId"] = "$process.parameters.bId";
  process.prefixes["$global"] = "globalThis";
}
function getFromCache(expr, process) {
  if (process == null)
    return expr;
  if (process.expCache[expr] != null) {
    return process.expCache[expr];
  }
  const prop = expr;
  const exp = expr.split(".")[0];
  if (process?.prefixes[exp] == null)
    return expr;
  expr = expr.split(exp).join(process.prefixes[exp]);
  process.expCache[prop] = expr;
  return expr;
}

// src/index.js
async function initialize(root) {
  await crs.modules.add("action", `${root}/action-systems/action-actions.js`);
  await crs.modules.add("array", `${root}/action-systems/array-actions.js`);
  await crs.modules.add("binding", `${root}/action-systems/binding-actions.js`);
  await crs.modules.add("component", `${root}/action-systems/component-actions.js`);
  await crs.modules.add("condition", `${root}/action-systems/condition-actions.js`);
  await crs.modules.add("console", `${root}/action-systems/console-actions.js`);
  await crs.modules.add("cssgrid", `${root}/action-systems/css-grid-actions.js`);
  await crs.modules.add("data", `${root}/action-systems/data-actions.js`);
  await crs.modules.add("db", `${root}/action-systems/database-actions.js`);
  await crs.modules.add("dom", `${root}/action-systems/dom-actions.js`);
  await crs.modules.add("dom_binding", `${root}/action-systems/dom-binding-actions.js`);
  await crs.modules.add("dom_collection", `${root}/action-systems/dom-collection-actions.js`);
  await crs.modules.add("dom_interactive", `${root}/action-systems/dom-interactive-actions.js`);
  await crs.modules.add("dom_utils", `${root}/action-systems/dom-utils-actions.js`);
  await crs.modules.add("dom_widget", `${root}/action-systems/dom-widgets-actions.js`);
  await crs.modules.add("events", `${root}/action-systems/events-actions.js`);
  await crs.modules.add("files", `${root}/action-systems/files-actions.js`);
  await crs.modules.add("fs", `${root}/action-systems/fs-actions.js`);
  await crs.modules.add("loop", `${root}/action-systems/loop-actions.js`);
  await crs.modules.add("math", `${root}/action-systems/math-actions.js`);
  await crs.modules.add("media", `${root}/action-systems/media-actions.js`);
  await crs.modules.add("module", `${root}/action-systems/module-actions.js`);
  await crs.modules.add("object", `${root}/action-systems/object-actions.js`);
  await crs.modules.add("process", `${root}/action-systems/process-actions.js`);
  await crs.modules.add("random", `${root}/action-systems/random-actions.js`);
  await crs.modules.add("rest_services", `${root}/action-systems/rest-services-actions.js`);
  await crs.modules.add("session_storage", `${root}/action-systems/session-storage-actions.js`);
  await crs.modules.add("local_storage", `${root}/action-systems/local-storage-actions.js`);
  await crs.modules.add("string", `${root}/action-systems/string-actions.js`);
  await crs.modules.add("system", `${root}/action-systems/system-actions.js`);
  await crs.modules.add("translations", `${root}/action-systems/translations-actions.js`);
  await crs.modules.add("validate", `${root}/action-systems/validate-actions.js`);
  await crs.modules.add("fixed_layout", `${root}/action-systems/fixed-layout-actions.js`);
  await crs.modules.add("colors", `${root}/action-systems/colors-actions.js`);
  crs.dom = (await crs.modules.get("dom")).DomActions;
}
globalThis.crs = globalThis.crs || {};
globalThis.crs.intent = {};
globalThis.crs.processSchemaRegistry = new SchemaRegistry();
globalThis.crs.process = ProcessRunner;
globalThis.crs.AsyncFunction = Object.getPrototypeOf(async function() {
}).constructor;
globalThis.crs.call = async (system, fn, args, context, process, item) => {
  if (crs.intent[system] == null) {
    await crs.modules.get(system);
  }
  const module = crs.intent[system];
  if (module[fn] == null) {
    return await module["perform"]({ action: fn, args }, context, process, item);
  }
  return await module[fn]({ args }, context, process, item);
};
globalThis.crs.getNextStep = (process, step) => {
  if (typeof step == "object")
    return step;
  return crsbinding.utils.getValueOnPath(process.steps, step);
};
crsbinding.events.emitter.on("crs-process-error", (message) => {
  console.error(message.error);
});
export {
  initialize
};
