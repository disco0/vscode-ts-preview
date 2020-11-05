import vscode, { 
    Position,
    Range,
    workspace,
    window,
} from 'vscode'

import { log } from '../Logger'
import type { LogMethods } from '../Logger'

import is from '../guard'
import { } from '../util'

import { Preview, PREVIEW_MODE } from './Preview'
import type { PreviewConfiguration } from './Preview'

import {  
    PreprocessConfiguration,
    PreprocessTransform,
    insertExportIfMissing,
    prependTsNoCheckComment
} from './preprocess'

//#region Declarations

interface DocPreviewOptions extends PreviewConfiguration
{
    preprocess?: PreprocessConfiguration
}

//#endregion Declarations

//#region Defaults

const defaultPreviewOptions: DocPreviewOptions = Object.freeze({
    ...Preview.defaults.previewConfiguration,
    preprocess:
    [
        prependTsNoCheckComment,
        insertExportIfMissing
    ]
});

const defaults = Object.freeze({
    previewOptions: defaultPreviewOptions
} as const);

//#endregion Defaults

export class DocPreview extends Preview // <'editor'>
{
    previewMode = PREVIEW_MODE.editor;

    default = defaults
    previewConfiguration: DocPreviewOptions = 
    {
        ...Preview.defaults.previewConfiguration,
        
        ...this.default.previewOptions
    }
    
    previewEditorConfiguration =
    {
        content:   this.newText,
        language: 'javascript'
    } as const;

    // For any kind of storage needed per preview
    state: Record<string, any> = 
    { }

    tsDoc?: vscode.TextDocument

    tsDocInitalized(tsDoc: vscode.TextDocument): asserts tsDoc
    {
        if(!vscode.workspace.textDocuments.includes(tsDoc))
        {
            log.info("tsDoc property not defined after running <instance DocPreview>.createDoc().");
            throw new Error("tsDoc property not defined after running <instance DocPreview>.createDoc().")
        }
    }

    async getDoc(documentConfig = this.previewEditorConfiguration): Promise<vscode.TextDocument>
    {
        if(this.tsDoc)
            return this.tsDoc;
        
        this.tsDoc = await vscode.workspace.openTextDocument(documentConfig);
        return this.tsDoc
    }
        
    constructor(context: vscode.ExtensionContext)
    {
        super(context);
        /**
         * @TODO: Initialize properties inside constructor to allow stricter
         *        typing of properties.
         * tsDoc - Either inline an invocation of get
         */
        this.getDoc().then(doc => {
            this.tsDoc = doc;
            window.showTextDocument(this.tsDoc, {
                viewColumn:    this.previewColumn,
                preserveFocus: true,
                preview:       true
            });
            this.init()
        });
    }

    preview(options?: DocPreviewOptions): void;
    preview(lineNumber?: number): void;
    preview(options: number | DocPreviewOptions | undefined): void
    {
        /**
         * Object.assign transfers readonly attribute, throwing error on later modifications of 
         * `config`. Originally added const assertions to defaults to catch changes, so either 
         * defaults objects need to lose the const assertions, or all uses of them should be 
         * converted to spread literals (which would work fine, and is the current "solution" to 
         * the larger problem causing this issue [1])
         * default members. Maybe better to catch errors for now and remove eventually at a later
         * date.
         * 
         * [1] https://github.com/microsoft/TypeScript/issues/33149#issuecomment-526734132
         */ 
        let config = {...this.default.previewOptions} as WithDefined<DocPreviewOptions>
        
        //#region Collapse Overloads

        if(is.Number(options))
        {
            config.lineNumber = options;
        }
        else if(is.Object(options))
        {
            Object.assign(config, options)
        }
        log.debug(`[preview] Preprocess? ${
            typeof config.preprocess === 'function' ? 'Single' : 
            Array.isArray(config.preprocess)        ? 'Chain'  : 'No'
        }`)
        log.debug(`[preview] Line Number: ${config.lineNumber.toString()}`);

        //#endregion Collapse Overloads

        // @TODO finish line number control

        // 内容
        this.text = this.doc.getText();

        const preview = this.transpileSource()

        if(!preview) 
            return;

        this.newText = this.applyPreprocess(preview, config.preprocess);
        
        // 新窗口展示 js preview | 编辑器形式
        this.previewOnDoc();
    }
    
    /**
     * 更新已有的 js preview 内容
     * @param textEditor
     */
    async updatePreviewEditor(textEditor: vscode.TextEditor): Promise<boolean>
    {
        // 行数
        let lineCount: number          = textEditor.document.lineCount || 0;
        let start:     vscode.Position = new Position(0, 0);
        let end:       vscode.Position = new Position(lineCount + 1, 0);
        let range:     vscode.Range    = new Range(start, end);
        return textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(range, this.newText);
        });
    }

    previewOnDoc(): void
    {
        if (this.tsDoc) 
        {
            window.showTextDocument(this.tsDoc, {
                viewColumn: Preview.defaults.previewColumn,
                preserveFocus: true,
                preview: true,
            }).then(async (textEditor) => {
                if (textEditor.document === this.tsDoc) 
                    return await this.updatePreviewEditor(textEditor);
            });
        } 
        else 
        {
            workspace.openTextDocument({
                content: this.newText,
                language: 'javascript',
            }).then(doc => {
                this.tsDoc = doc;
                return window.showTextDocument(this.tsDoc, {
                    viewColumn: Preview.defaults.previewColumn,
                    preserveFocus: true,
                    preview: true,
                });
            });
        }
    }

    init()
    {
        // 获取配置
        // let conf = Preview.config;
        // vscode.window.showInformationMessage('gogo');
        this.preview();
        this.bindEvn();
    }

    logNewText(prefixLine: string, level: LogMethods = 'debug')
    {
        log[level]([prefixLine, this.newText].join('\n'))
    }

    applyPreprocess(source: string, preprocess: Arrayable<(source: string) => string> = (source) => source)
    {
        if(Array.isArray(preprocess))
        {
            log.debug(`[DocPreview::applyPreprocess] Applying ${preprocess.length} preprocess functions (expected).`)
            let result = source;
            for(const transform of preprocess)
            {
                if(typeof transform !== 'function') 
                    continue;

                result = transform.call(this, result);
            }
            return result;
        }
        else if(typeof preprocess === 'function')
        {
            log.debug(`[DocPreview::applyPreprocess] Applying one preprocess function.`)
            return preprocess.call(this, source);
        }
        else
            throw new Error('preprocess value is neither array (of functions) or function.')
    }
}