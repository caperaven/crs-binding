import {getPathOfFile, relativePathFrom} from "./../../src/lib/utils.js";

test("getPathOfFile - folder", () => {
    const result = getPathOfFile("https://folder/subfolder/");
    expect(result).toBe("https://folder/subfolder/");
})

test("getPathOfFile - file", () => {
    const result = getPathOfFile("https://folder/subfolder/index.js");
    expect(result).toBe("https://folder/subfolder/");
})

test("relativePathFrom - folder", () => {
    const result = relativePathFrom("https://folder/subfolder/", "../../test.js");
    expect(result).toBe("https://test.js");
})

test("relativePathFrom - file", () => {
    const result = relativePathFrom("https://folder/subfolder/index.js", "./../../test.js");
    expect(result).toBe("https://test.js");
})

test("relativePathFrom - subfolder", () => {
    const result = relativePathFrom("https://folder/subfolder/index.js", "./fragments/fragment1.html");
    expect(result).toBe("https://folder/subfolder/fragments/fragment1.html");
})

