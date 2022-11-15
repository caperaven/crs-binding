/* tslint:disable */
/* eslint-disable */
/**
*/
export function init_panic_hook(): void;
/**
* Test if a object is visible in the scope of the defined filter.
* @param {string} intent
* @param {string} object
* @param {boolean} case_sensitive
* @returns {boolean}
*/
export function in_filter(intent: string, object: string, case_sensitive: boolean): boolean;
/**
* Filter a set of records and give back the indexes of the records visible in the filter.
* @param {string} intent
* @param {string} data
* @param {boolean} case_sensitive
* @returns {Uint32Array}
*/
export function filter_data(intent: string, data: string, case_sensitive: boolean): Uint32Array;
/**
* @param {string} intent
* @param {string} data
* @returns {string}
*/
export function group_data(intent: string, data: string): string;
/**
* @param {string} intent
* @param {string} data
* @param {Uint32Array} rows
* @returns {Uint32Array}
*/
export function sort_data(intent: string, data: string, rows: Uint32Array): Uint32Array;
/**
* @param {string} intent
* @param {string} data
* @param {Uint32Array} rows
* @returns {string}
*/
export function aggregate_rows(intent: string, data: string, rows: Uint32Array): string;
/**
* @param {string} group
* @param {string} aggregate_intent
* @param {string} data
* @returns {string}
*/
export function calculate_group_aggregate(group: string, aggregate_intent: string, data: string): string;
/**
* @param {string} intent
* @param {string} data
* @param {Uint32Array} rows
* @returns {string}
*/
export function unique_values(intent: string, data: string, rows: Uint32Array): string;
/**
* Convert PT100H30M into "0:0:100:30:0"
* @param {string} duration
* @returns {string}
*/
export function iso8601_to_string(duration: string): string;
/**
* @param {string} dates
* @param {string | undefined} field_name
* @returns {string}
*/
export function iso8601_batch(dates: string, field_name?: string): string;
/**
* @param {string} expr
* @param {string} object
* @param {boolean} case_sensitive
* @returns {boolean}
*/
export function evaluate_obj(expr: string, object: string, case_sensitive: boolean): boolean;
/**
* @param {string} intent
* @param {string} data
* @param {Uint32Array} rows
* @returns {string}
*/
export function build_perspective(intent: string, data: string, rows: Uint32Array): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly init_panic_hook: () => void;
  readonly in_filter: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly filter_data: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly group_data: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly sort_data: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly aggregate_rows: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly calculate_group_aggregate: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly unique_values: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly iso8601_to_string: (a: number, b: number, c: number) => void;
  readonly iso8601_batch: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly evaluate_obj: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly build_perspective: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

/**
* Synchronously compiles the given `bytes` and instantiates the WebAssembly module.
*
* @param {BufferSource} bytes
*
* @returns {InitOutput}
*/
export function initSync(bytes: BufferSource): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
