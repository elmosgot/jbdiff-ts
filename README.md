# JBDiff TypeScript

Multi-line diff calculation based on the [JetBrains IntelliJ diff engine](https://github.com/JetBrains/intellij-community/tree/master/platform/util/diff/src/com/intellij/diff), ported to TypeScript for shared use in a CLI and VS Code extension.

## Packages

| Package | Description |
| --- | --- |
| `@jbdiff/core` | Diff algorithm (ByWord pipeline, comparison policies) |
| `@jbdiff/cli` | `jbdiff` command-line tool |
| `@jbdiff/vscode` | VS Code extension with custom diff viewer *(planned)* |

## Quick start

```bash
npm install
npm test
npm run build
npm run cli -- file1.txt file2.txt
```

## Comparison policies

- `DEFAULT` — whitespace differences are shown
- `TRIM_WHITESPACES` — leading/trailing whitespace ignored in diff
- `IGNORE_WHITESPACES` — all whitespace differences ignored

## License

Apache 2.0 — see [LICENSE](LICENSE). Algorithm derived from [JetBrains IntelliJ Community Edition](https://github.com/JetBrains/intellij-community).
