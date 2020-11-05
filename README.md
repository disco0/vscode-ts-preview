# typescript-preview-fork

This is a fork from the original `typescript-preview` extension repo that adds some additional features in addtion to partial refactoring of extension code. 

[Upstream Readme][original-readme]

## TODO for translated upstream and local fork
* General
    - [x] Mode selection: editor | webview
    - [x] Refactor to base abstract `Preview` class, and create `DocPreview` and `WebviewPreview` implementations
 
* Compilation
    - [x] Default to newer compilation target
    * Postprocessing
        - [x] Add post-compilation `(compiled: string) => string` hook for modifying output to text editor preview
        - [x] Prepend `// @ts-nocheck` to compiled files being written to text edtior previews
    - [ ] (Option to) prioritize tsconfig support under the project file, or path defined in user settings

* Preview management
    - [ ] Enable saving/updating preview text editor to file
    - [ ] After the file is modified, the preview file will be reminded whether to save before closing, pending processing
    - [ ] `markdown.preview` mode (?)

	- [ ] Properly handle preview instance / typescript source editor close (this may have worked before refactoring lol)
 
* Webviews
    - [x] webview mode preview processing
    - [ ] **[Upstream:Next]** Try to import local resource files (solve multiple theme style files)
    - [ ] There may be anomalies in multi-column testing. For example, the original file is in the second column and the preview appears in the second
    - [ ] Serve to port on `localhost` / configurable address (see [Instant Markdown extension][vscode-markdown-extension])
    * Configuration
        - [ ] Font size
        - [ ] Provide several theme colors

* Build
	- [ ] Build with webpack, preferrably webpack.config.ts

[original-readme]: ./README-ORIG.md
[vscode-markdown-extension]: https://github.com/dbankier/vscode-instant-markdown/
