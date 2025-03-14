import * as b from "bobril";
import * as core from "./core";
import defaultStyle from "../styles/default-style";

export function getEmWidthOfNumber(num: number) {
    return `${num.toString().length * 0.6 + 0.25}em`;
}

export function assembleLineNumberStyles(largestLineNumber: number) {
    return {
        display: "inline-block",
        minWidth: getEmWidthOfNumber(largestLineNumber),
        paddingRight: "0.8em",
        textAlign: "end",
        userSelect: "none",
    };
}

export type HighlightStyle = Record<string, b.IBobrilStyles>;

export interface IHighligherData {
    language?: string;
    style?: HighlightStyle;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineStyle?: ((line: number) => b.IBobrilStyles) | undefined;
    lineContentStyle?: ((line: number) => b.IBobrilStyles) | undefined;
    lineNumberStyle?:
        | ((largestLineNumber: number, style: HighlightStyle) => (line: number) => b.IBobrilStyles)
        | undefined;
    children?: string;
}

function noop() {
    return undefined;
}

function displayFlex() {
    return { display: "flex" };
}

function autoWrap(): b.IBobrilStyles {
    return { whiteSpace: "pre-wrap" };
}

function defaultNumberStyle(largestLineNumber: number, style: HighlightStyle) {
    var res = [assembleLineNumberStyles(largestLineNumber), style["comment"]];
    return () => res;
}

export function Highlighter(data: IHighligherData) {
    var style = data.style || (defaultStyle as HighlightStyle);
    var language = data.language;
    var showLineNumbers = data.showLineNumbers ?? true;
    var startingLineNumber = data.startingLineNumber ?? 1;
    if (isNaN(startingLineNumber)) startingLineNumber = 1;
    var lineStyle = data.lineStyle || (showLineNumbers ? displayFlex : noop);
    var lineContentStyle = data.lineContentStyle || autoWrap;
    var lineNumberStyle = data.lineNumberStyle || defaultNumberStyle;
    const code = data.children || "";
    return b.useMemo(() => {
        var result = core.highlight(code, language);
        var flatNodes = result.lines;
        function applyStyle(classes: undefined | string | string[]): b.IBobrilStyles {
            if (classes == undefined) return undefined;
            if (b.isString(classes)) return style[classes];
            var res = new Array(classes.length);
            for (var i = 0; i < classes.length; i++) {
                res[i] = style[classes[i]];
            }
            return res;
        }
        if (showLineNumbers) {
            const largestLineNumber = flatNodes.length + startingLineNumber - 1;
            const lineNumberStyleFactory = lineNumberStyle(largestLineNumber, style);
            return (
                <pre style={style["$"]}>
                    <code>
                        {flatNodes.map((line, lineNumber) => {
                            const trueLineNumber = lineNumber + startingLineNumber;
                            return (
                                <div style={lineStyle(trueLineNumber)}>
                                    <div style={lineNumberStyleFactory(trueLineNumber)}>{trueLineNumber}</div>
                                    <div style={lineContentStyle(trueLineNumber)}>
                                        {line.map((n) => (
                                            <span style={applyStyle(n.style)}>{n.text}</span>
                                        ))}
                                        {line.length == 0 ? "\n" : ""}
                                    </div>
                                </div>
                            );
                        })}
                    </code>
                </pre>
            );
        } else {
            return (
                <pre style={style["$"]}>
                    <code>
                        {flatNodes.map((line, lineNumber) => (
                            <div
                                style={[
                                    lineStyle(lineNumber + startingLineNumber),
                                    lineContentStyle(lineNumber + startingLineNumber),
                                ]}
                            >
                                {line.map((n) => (
                                    <span style={applyStyle(n.style)}>{n.text}</span>
                                ))}
                                {line.length == 0 ? "\n" : ""}
                            </div>
                        ))}
                    </code>
                </pre>
            );
        }
    }, [code, language, style, showLineNumbers, startingLineNumber, lineStyle, lineContentStyle, lineNumberStyle]);
}
