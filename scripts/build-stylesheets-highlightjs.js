"use strict";
/*
 * Quick and dirty script to build javascript stylesheets from highlight.js css
 * adapted from react-syntax-highlighter
 */
const path = require("path");
const fs = require("fs");
const css = require("css");
const camel = require("to-camel-case");

fs.readdir(path.join(__dirname, "../node_modules/highlight.js/styles"), (err, files) => {
    if (err) {
        throw err;
    }

    const onlyCSSFiles = files.filter((file) => !file.includes(".min.css") && file.includes(".css"));
    onlyCSSFiles.forEach((file) => {
        createJavascriptStyleSheet(file);
    });
    const availableStyleNames = onlyCSSFiles.map((file) =>
        file.split(".css")[0] === "default" ? "default-style" : file.split(".css")[0]
    );
    const defaultExports = availableStyleNames.map(
        (name) => `export { default as ${camel(name)} } from './styles/${name}';\n`
    );
    fs.writeFile(path.join(__dirname, "../styles.ts"), defaultExports.join(""), (err) => {
        if (err) {
            throw err;
        }
    });
});

function simplifyClass(c) {
    if (c == ".hljs") return "$";
    if (c == ".hljs a") return undefined;
    if (c == ".hljs a:focus") return undefined;
    if (c == ".hljs a:hover") return undefined;
    if (c == ".hljs-title.class_") return undefined;
    if (c == ".hljs mark") return undefined;
    if (c == "pre code.hljs") return undefined;
    if (c == "code.hljs") return undefined;
    if (
        c == ".hljs::selection" ||
        c == ".hljs ::selection" ||
        c == ".hljs span::selection" ||
        c == ".hljs::-moz-selection" ||
        c == ".hljs span::-moz-selection"
    )
        return "::selection";
    console.log(c);
    var m = c.match(/\.hljs-[-a-z]+/gi);
    var res = m.map((s) => s.substring(6)).join(" ");
    return res;
}

function createJavascriptStyleSheet(file) {
    const fileWithoutCSS = file.split(".css")[0] === "default" ? "default-style" : file.split(".css")[0];
    fs.readFile(path.join(__dirname, `../node_modules/highlight.js/styles/${file}`), "utf-8", (err, data) => {
        if (err) {
            throw err;
        }
        const javacriptStylesheet = css.parse(data).stylesheet.rules.reduce((sheet, rule) => {
            if (rule.type === "rule") {
                const style = rule.selectors.reduce((selectors, selector) => {
                    selector = simplifyClass(selector);
                    if (selector) {
                        const selectorObject = rule.declarations.reduce((declarations, declaration) => {
                            if (declaration.type === "declaration" && declaration.property) {
                                var prop = camel(declaration.property);
                                var val = declaration.value;
                                if (val.substring(0, 4) == "url(") {
                                    val = val.split(" ");
                                    val = val[val.length - 1];
                                }
                                if (val.indexOf(" url(") >= 0) {
                                    val = val.substring(0, val.indexOf(" url("));
                                }
                                declarations[prop] = val;
                            }
                            return declarations;
                        }, {});
                        selectors[selector] = selectorObject;
                    }
                    return selectors;
                }, {});
                sheet = Object.keys(style).reduce((stylesheet, selector) => {
                    if (stylesheet[selector]) {
                        stylesheet[selector] = Object.assign({}, stylesheet[selector], style[selector]);
                    } else {
                        stylesheet[selector] = style[selector];
                    }
                    return stylesheet;
                }, sheet);
            }
            return sheet;
        }, {});
        fs.writeFile(
            path.join(__dirname, `../styles/${fileWithoutCSS}.ts`),
            `export default ${JSON.stringify(javacriptStylesheet, null, 4)}`,
            (err) => {
                if (err) {
                    throw err;
                }
            }
        );
    });
}
