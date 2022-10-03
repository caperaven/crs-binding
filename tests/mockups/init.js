/**
 * Initialize the mocking objects for testing purposes
 */
import * as path from "https://deno.land/std/path/mod.ts";
import {exists} from "https://deno.land/std/fs/mod.ts"
import {ElementMock} from "./element-mock.js"
import "./custom-elements.js";
import "./document-mock.js";

export async function init() {
    const packages = await getPackagesFolder()

    globalThis.DocumentFragment = ElementMock;
    globalThis.HTMLElement = ElementMock;
    globalThis.HTMLInputElement = ElementMock;
    globalThis.requestAnimationFrame = (callback) => callback();

    const crs_binding = path.join(packages, "./../src/index.js");
    await import(crs_binding);
}

async function getPackagesFolder() {
    const dirname = path.dirname(path.fromFileUrl(import.meta.url));

    let dir = path.join(dirname, "./../../packages");
    if (! await exists(dir)) {
        dir = path.join(dirname, "./../..");
    }

    return path.join("file://", dir);
}