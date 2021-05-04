# Bobril Highlighter

Bobril component for syntax highlighting of source code. For actual work uses highlight.js.

[![npm version](https://badge.fury.io/js/%40bobril%2Fhighlighter.svg)](https://badge.fury.io/js/%40bobril%2Fhighlighter)

[Demo](https://bobril.github.io/highligher)

## How to use

```tsx
import * as b from "bobril";
import * as high from "@bobril/highlighter";
import { docco } from "@bobril/highlighter/styles";

b.init(() => <high.Highlighter style={docco}>{`let actual = "code " + "shine";`}</high.Highlighter>);
```

By default only most common languages are registered. If all are needed use this:

```tsx
import "@bobril/highlighter/allLanguages";
```

## Props of component

-   `language?: string` - if not provided then autodetect (slower)
-   `style?: HighlightStyle` - provide theme to use for styling
-   `showLineNumbers?: boolean` - default is `true`
-   `startingLineNumber?: number` - default is `1`, `NaN` is automatically set to `1` as well.
-   `lineStyle?: ((line: number) => b.IBobrilStyles) | undefined` - allow style `div` for each line
-   `lineContentStyle?: ((line: number) => b.IBobrilStyles) | undefined` - allow to style `div` of line content without line number
-   `lineNumberStyle?: ((largestLineNumber: number, style: HighlightStyle) => (line: number) => b.IBobrilStyles) | undefined` - allows complete override of default line number style
-   `children?: string` - only one string child is allowed and it must contain code to format

## Acknowledges

-   highlight.js - actual ground work
-   lowlight - for Emitter Tree approach
-   react-syntax-highlighter - scripts and inspirations in line number styling
