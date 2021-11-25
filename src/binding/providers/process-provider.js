import {ProviderBase} from "./provider-base.js";

export class ProcessProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);

        this._eventHandler = this.event.bind(this);
        this._element.addEventListener(this._property, this._eventHandler);
    }

    dispose() {
        this._element.removeEventListener(this._property, this._eventHandler);
        this._eventHandler = null;

        super.dispose();
    }

    event() {
        if (globalThis.crs?.process == null) {
            return console.error("crs-process-api not present or running at this time");
        }

        if (this._value[0] == "{") {
            executeStep(this);
        }
        else {
            const left = this._value.split("{")[0];
            if (left.indexOf("[") == -1) {
                executeFunction(this);
            }
            else {
                executeProcess(this);
            }
        }
    }
}

function executeStep(provider) {
    const exp  = sanitize(provider._value, provider._context);
    const step = getObject(exp, provider._context);
    const ctx  = crsbinding.data.getContext(provider._context);

    crs.process.runStep(step, ctx, null, null);
}

function executeFunction(provider) {
    const exp     = sanitize(provider._value, provider._context);
    const parts   = exp.split("(");
    const fnParts = parts[0].split(".");
    const stepStr = `{type: "${fnParts[0]}", action: "${fnParts[1]}", args: ${parts[1]}}`.replace(")", "");
    const step    = getObject(stepStr, provider._context);
    const ctx     = crsbinding.data.getContext(provider._context);

    crs.process.runStep(step, ctx, null, null);
}

function executeProcess(provider) {
    const exp          = sanitize(provider._value, provider._context);
    const schemaParts  = exp.split("[");
    const schema       = schemaParts[0];
    const processParts = schemaParts[1].replace("]", "").split("(");
    const process      = processParts[0];
    const parameters   = getParameters(processParts[1].replace(")", "").trim(), provider._context);
    const ctx          = crsbinding.data.getContext(provider._context);

    const args = {
        context: ctx,
        step: {
            action: process,
            args: {
                schema: schema
            }
        }
    }

    if (parameters != null) {
        args.parameters = parameters;
    }

    crsbinding.events.emitter.emit("run-process", args);
}

function getObject(str, id) {
    if (str.indexOf("{") == -1) {
        str = `{${str}}`;
    }

    const fn = new Function("context", `return ${str};`);

    const context = crsbinding.data.getContext(id);
    const binding = crsbinding.data.getData(id).data;

    let ctx = {};
    Object.assign(ctx, binding);
    Object.assign(ctx, context);

    const result = fn(ctx);
    ctx = null;

    return result;
}

function getParameters(str, id) {
    if (str.length == 0) return null;
    return getObject(str, id);
}

function sanitize(str, bId) {
    return str
        .replace("bId", `bId: ${bId}`)
        .split("$context.").join("context.")
}