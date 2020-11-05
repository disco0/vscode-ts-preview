//#region Imports

import * as path from 'path';

import vscode, {
    Position, 
    Range, 
    window, 
    workspace, 
    // StatusBarAlignment
} from 'vscode';
import ts from 'typescript';
import { DiagnosticCategory } from 'typescript'

import { formatDiagnostics } from '../util'
import { log } from '../Logger'

//#endregion Imports

//#region Types

export const enum PREVIEW_MODE 
{
    'editor'  = 'editor',
    'webview' = 'webview'
};
type PreviewLUT = typeof PREVIEW_MODE;

export interface ExtensionConfiguration
{
    mode: PreviewMode
}

/** 
 * Generic allows for typechecking based on target environment's `setTimeout` implementation 
 */
type Timer = ReturnType<typeof setTimeout>

// For extensions by subclasses
export interface PreviewConfiguration
{
    /**
     * Beginning line 
     */
    lineNumber: number;
}

//#endregion Types

//#region Defaults

const defaultPreviewConfiguration: PreviewConfiguration = 
{
    lineNumber: 0
}

//#endregion Defaults

export abstract class Preview // <MODE extends keyof typeof PREVIEW_MODE>
{
    abstract init(): void 
    
    /**
     * Main function for subclass to generate and display preview.
     */
    abstract preview(options: PreviewConfiguration): void;

    abstract previewMode: PreviewMode;
    abstract previewConfiguration: PreviewConfiguration;


    doc:           vscode.TextDocument;
    text:          string;
    newText:       string;
    context:       vscode.ExtensionContext;

    // // TODO: Implement debouncing for compilation
    // #_debouncePeriod: number = 700
    // get debouncePeriod(){ /* ... */ }
    // set debouncePeriod(newPeriod: number){ if(isNaturalNumber){ this.#_debouncePeriod = newPeriod; } }

    static defaults = Object.freeze(
    {
        previewColumn: 2,
        previewConfiguration: defaultPreviewConfiguration
    } as const)

    previewColumn: number = Preview.defaults.previewColumn;
    
    constructor(
        context: vscode.ExtensionContext, 
        editor: Maybe<vscode.TextEditor> = vscode.window.activeTextEditor
    ) {
        // 活动窗口
        if(!editor)
        {
            log.warn('No active text editor found, cancelling preview creation');
            throw new Error('No active text editor found, cancelling preview creation');
        }

        // 当前窗口document
        this.doc = editor.document;
        this.text = '';
        this.newText = '';
        this.context = context;

        // Moved to post-super call in subclasses
        // this.init();
    }

    updateTimer = 
    {
        current: undefined as Maybe<Timer> 
    }

    bindEvn(): void 
    {
        let timer = this.updateTimer.current ?? undefined;
        workspace.onDidChangeTextDocument(({ contentChanges, document }) => {
            if(timer) clearTimeout(timer); // clearTimeout(timer);
            if (window.visibleTextEditors.length < 1) 
                return;
            
            // timer = setTimeout(() => {
            this.updateTimer.current = setTimeout(() => {

                if (contentChanges.length > 0) 
                    this.previewConfiguration.lineNumber = contentChanges[0].range.start.line;

                if (document === this.doc) 
                    // 触发 ts 编译
                    this.preview(this.previewConfiguration);

            }, 100);
        });
    }
    
    getThemes() 
    {
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'resource', 'theme.css'));
        return onDiskPath.with({ scheme: 'vscode-resource' });
    }
    
    getScript()
    {
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'resource', 'highlight.pack.js'));
        return onDiskPath.with({ scheme: 'vscode-resource' });
    }
    
    static transpileOptions: ts.TranspileOptions = 
    {
        // compilerOptions?: CompilerOptions;
        // fileName?: string;
        // moduleName?: string;
        // renamedDependencies?: MapLike<string>;
        // transformers?: CustomTransformers;
        /**
         * TODO: Configurable compilation:
         *  - Ability to read a project config file?
         *  - Configuration via {workspace,user} settings?
         */
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            // Be as flexible as possible to avoid configuration
            target: ts.ScriptTarget.ES2020,
        },
        reportDiagnostics: true,
    };

    transpileSource(transpileOptions = Preview.transpileOptions): string | undefined
    {
        let transpile = ts.transpileModule(this.text, transpileOptions);

        const diagnostics = transpile.diagnostics ?? []
        // Enumerate error diagnostics 
        const errorDiag = diagnostics.filter(diag => diag.category === DiagnosticCategory.Error) ?? []
        if(errorDiag.length > 0)
        {
            // Errors found, return undefined.
            log.error('Skipping preview, errors found in compilation')
            log.error(`${formatDiagnostics(...diagnostics)}`);
            log.error('Output from cancelled preview:\n' + transpile.outputText);
            return;
        }
        return transpile.outputText;
    }

    static get config(): ExtensionConfiguration
    {
        const configuration =
            Object.fromEntries(Object.entries(
                vscode.workspace.getConfiguration('ts-preview'))
                      .filter(([k, v]) => !['has', 'get', 'update', 'inspect'].includes(k)
            ))
        
        log.info(`Read workspace configuration:\n${configuration}`)

        return configuration as ExtensionConfiguration;
    }
}

export default Preview;