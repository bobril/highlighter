import high from "highlight.js/es/core";
import type { Emitter, LanguageFn } from "highlight.js";

export type StyledText = { text: string; style: undefined | string | string[] };
export type StyledLinesAndSpans = StyledText[][];

export interface HighlightResult {
    language: string | undefined;
    relevance: number;
    lines: StyledLinesAndSpans;
}

export function highlight(value: string, language?: string): HighlightResult {
    if (language != undefined && !high.getLanguage(language)) {
        language = undefined;
    }

    high.configure({ __emitter: TreeEmitter, classPrefix: "" });

    if (language == undefined) {
        let list = high.listLanguages();
        let result: TreeRoot = {
            type: "root",
            data: { language: undefined, relevance: 0 },
            children: [],
        };
        for (var i = 0; i < list.length; i++) {
            let root = highlightCore(value, list[i]);
            if (root.data.relevance > result.data.relevance) result = root;
        }
        return flattenToLines(result);
    } else {
        return flattenToLines(highlightCore(value, language));
    }
}

function highlightCore(value: string, language: string) {
    let result = high.highlight(value, { language, ignoreIllegals: true });
    let root = (result._emitter as TreeEmitter).root;
    root.data.language = result.language;
    root.data.relevance = result.relevance;
    return root;
}

function flattenToLines(root: TreeRoot): HighlightResult {
    var res = [[]];
    flattenTree(root, [], res);
    return { language: root.data.language, relevance: root.data.relevance, lines: res };
}

function convertToSimpleRepresentation(classStack: string[]): undefined | string | string[] {
    if (classStack.length == 0) return undefined;
    if (classStack.length == 1) return classStack[0];
    return classStack.slice(0);
}

function flattenTree(tree: TreeRoot | TreeNode, classStack: string[], res: StyledLinesAndSpans) {
    if (tree.type === "text") {
        var lines = tree.value.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if (i > 0) {
                res.push([]);
            }
            if (lines[i].length > 0)
                res[res.length - 1].push({ text: lines[i], style: convertToSimpleRepresentation(classStack) });
        }
    } else if (tree.type === "span") {
        let backupLen = classStack.length;
        let cn = tree.className;
        for (var i = 0; i < cn.length; i++) {
            var c = cn[i];
            if (classStack.indexOf(c) < 0) classStack.push(c);
        }
        let ch = tree.children;
        for (var i = 0; i < ch.length; i++) {
            flattenTree(ch[i], classStack, res);
        }
        classStack.length = backupLen;
    } else {
        let ch = tree.children;
        for (var i = 0; i < ch.length; i++) {
            flattenTree(ch[i], classStack, res);
        }
    }
}

export function registerLanguage(language: string, syntax: LanguageFn): void {
    high.registerLanguage(language, syntax);
}

export function listLanguages(): string[] {
    return high.listLanguages();
}

export function registerAliases(language: string, aliases: string | string[]) {
    high.registerAliases(aliases, { languageName: language });
}

type TreeNode = TreeSpan | TreeText;

type TreeText = {
    type: "text";
    value: string;
};

type TreeSpan = {
    type: "span";
    className: string[];
    children: TreeNode[];
};

type TreeRoot = {
    type: "root";
    data: { language: string | undefined; relevance: number };
    children: TreeNode[];
};

class TreeEmitter implements Emitter {
    root: TreeRoot;
    stack: [TreeRoot, ...TreeSpan[]];

    constructor() {
        this.root = {
            type: "root",
            data: { language: undefined, relevance: 0 },
            children: [],
        };
        this.stack = [this.root];
    }

    addText(value: string) {
        if (value === "") return;

        let current = this.stack[this.stack.length - 1];
        let tail = current.children[current.children.length - 1];

        if (tail && tail.type === "text") {
            tail.value += value;
        } else {
            current.children.push({ type: "text", value });
        }
    }

    addKeyword(value: string, name: string) {
        this.openNode(name);
        this.addText(value);
        this.closeNode();
    }

    addSublanguage(other: TreeEmitter, name?: string) {
        var current = this.stack[this.stack.length - 1];
        var results = other.root.children;

        if (name) {
            current.children.push({
                type: "span",
                className: [name],
                children: results,
            });
        } else {
            current.children.push(...results);
        }
    }

    openNode(name: string) {
        var className = name.split(".");
        var current = this.stack[this.stack.length - 1];
        var child: TreeSpan = {
            type: "span",
            className,
            children: [],
        };

        current.children.push(child);
        this.stack.push(child);
    }

    closeNode() {
        this.stack.pop();
    }
    closeAllNodes() {}
    finalize() {}
    toHTML() {
        return "";
    }
}
