"use strict";
/*
 * Build javascript passthrough modules for highlight.js languages
 * adapted from react-syntax-highlighter
 */
const path = require("path");
const fs = require("fs");
const camel = require("to-camel-case");

function makeImportName(name) {
    if (name === "1c") {
        return "oneC";
    }
    return camel(name);
}

fs.readdir(path.join(__dirname, "../node_modules/highlight.js/lib/languages"), (err, files) => {
    if (err) {
        throw err;
    }

    const availableLanguageNames = files.filter((n) => !n.endsWith(".js.js")).map((file) => file.split(".js")[0]);

    const importLangs = availableLanguageNames.map(
        (name) => `import ${makeImportName(name)} from 'highlight.js/lib/languages/${name}';\n`
    );
    const regLangs = availableLanguageNames.map((name) => `registerLanguage("${name}", ${makeImportName(name)});\n`);
    fs.writeFile(
        path.join(__dirname, "../allLanguages.ts"),
        'import { registerLanguage } from "./src/core";\n' + importLangs.join("") + regLangs.join(""),
        (err) => {
            if (err) {
                throw err;
            }
        }
    );
});
