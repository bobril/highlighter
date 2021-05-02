import * as b from "bobril";
import * as high from "./index";
import * as styles from "./styles";

var styleNames = Object.keys(styles);
var defaultStyleIdx = styleNames.indexOf("docco");

b.init(() => {
    var styleIdx = b.useState(defaultStyleIdx);
    var lineNumbers = b.useState(true);
    var wrapLines = b.useState(true);
    var startLineNumber = b.useState("1");
    return (
        <>
            <h1>Example for highligher</h1>
            <div>
                Style: {styleNames[styleIdx()]}{" "}
                <button
                    onClick={() => {
                        styleIdx((styleIdx() + 1) % styleNames.length);
                        return true;
                    }}
                >
                    Next
                </button>
            </div>

            <label>
                <input id="" type="checkbox" value={lineNumbers} />
                line numbers
            </label>
            <span> </span>
            <label>
                <input type="checkbox" value={wrapLines} />
                wrap lines
            </label>
            <span> </span>
            <label>
                Start line number: <input type="number" value={startLineNumber} />
            </label>
            <high.Highlighter
                showLineNumbers={lineNumbers()}
                startingLineNumber={parseInt(startLineNumber())}
                style={(styles as any)[styleNames[styleIdx()]]}
                lineContentStyle={wrapLines() ? undefined : () => undefined}
            >{`import * as b from "bobril";

declare var DEBUG: boolean;

function equalsIncludingNaN(a: any, b: any) {
    return a === b || (a !== a && b !== b); // it correctly returns true for NaN and NaN
}

function comp() {
    return <div>Pretty long text to show wrapping works. It is still not enough. {1+2+3+4+5+6+7+8}</div>;
}`}</high.Highlighter>
        </>
    );
});
