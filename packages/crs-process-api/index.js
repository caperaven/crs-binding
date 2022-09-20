import{SchemaRegistry as d}from"./process-registry.js";import{ProcessRunner as o}from"./process-runner.js";async function r(s){await crs.modules.add("action",`${s}/action-systems/action-actions.js`),await crs.modules.add("array",`${s}/action-systems/array-actions.js`),await crs.modules.add("binding",`${s}/action-systems/binding-actions.js`),await crs.modules.add("component",`${s}/action-systems/component-actions.js`),await crs.modules.add("condition",`${s}/action-systems/condition-actions.js`),await crs.modules.add("console",`${s}/action-systems/console-actions.js`),await crs.modules.add("cssgrid",`${s}/action-systems/css-grid-actions.js`),await crs.modules.add("data",`${s}/action-systems/data-actions.js`),await crs.modules.add("db",`${s}/action-systems/database-actions.js`),await crs.modules.add("dom",`${s}/action-systems/dom-actions.js`),await crs.modules.add("events",`${s}/action-systems/events-actions.js`),await crs.modules.add("files",`${s}/action-systems/files-actions.js`),await crs.modules.add("fs",`${s}/action-systems/fs-actions.js`),await crs.modules.add("loop",`${s}/action-systems/loop-actions.js`),await crs.modules.add("math",`${s}/action-systems/math-actions.js`),await crs.modules.add("media",`${s}/action-systems/media-actions.js`),await crs.modules.add("module",`${s}/action-systems/module-actions.js`),await crs.modules.add("object",`${s}/action-systems/object-actions.js`),await crs.modules.add("process",`${s}/action-systems/process-actions.js`),await crs.modules.add("random",`${s}/action-systems/random-actions.js`),await crs.modules.add("rest_services",`${s}/action-systems/rest-services-actions.js`),await crs.modules.add("session_storage",`${s}/action-systems/session-storage-actions.js`),await crs.modules.add("local_storage",`${s}/action-systems/local-storage-actions.js`),await crs.modules.add("string",`${s}/action-systems/string-actions.js`),await crs.modules.add("system",`${s}/action-systems/system-actions.js`),await crs.modules.add("translations",`${s}/action-systems/translations-actions.js`),await crs.modules.add("validate",`${s}/action-systems/validate-actions.js`),await crs.modules.add("fixed_layout",`${s}/action-systems/fixed-layout-actions.js`),crs.dom=(await crs.modules.get("dom")).DomActions}globalThis.crs=globalThis.crs||{},globalThis.crs.intent={},globalThis.crs.processSchemaRegistry=new d,globalThis.crs.process=o,globalThis.crs.AsyncFunction=Object.getPrototypeOf(async function(){}).constructor,globalThis.crs.call=async(s,a,i,c,e,n)=>{crs.intent[s]==null&&await crs.modules.get(s);const t=crs.intent[s];return t[a]==null?await t.perform({action:a,args:i},c,e,n):await t[a]({args:i},c,e,n)},globalThis.crs.getNextStep=(s,a)=>typeof a=="object"?a:crsbinding.utils.getValueOnPath(s.steps,a),crsbinding.events.emitter.on("crs-process-error",s=>{console.error(s.error)});export{r as initialize};
