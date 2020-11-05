import vscode, { window } from 'vscode';
import { readHtmlTemplateFile as loadTemplateFile } from '../htmlTemplate';
import { Preview, PREVIEW_MODE, PreviewConfiguration } from './Preview';

interface WebviewPreviewConfiguration extends PreviewConfiguration
{

}

export class WebviewPreview extends Preview
{
    scriptSource: vscode.Uri;
    themeSource: vscode.Uri;
    panel?: vscode.WebviewPanel;

    previewConfiguration: WebviewPreviewConfiguration 
        = Preview.defaults.previewConfiguration

    // Moved to constructor
    // webview 展示
    tplStr = loadTemplateFile('../resource/template.html', {mini: true});

    previewMode = PREVIEW_MODE.webview;

    constructor(context: vscode.ExtensionContext)
    {
        super(context);

        this.scriptSource ??= this.getScript();
        this.themeSource ??= this.getThemes();

        this.init();
    }

    preview(...options: any[])
    {
        // 内容
        this.text = this.doc.getText();
        // ts 转化 js
        const preview = this.transpileSource();
        if(!preview)
            return;

        this.newText = preview;
        this.previewOnWebview();
    }

    previewOnWebview(): void
    {
        // webview 形式预览 ? 只支持html?
        if(!this.panel)
        {
            this.panel = window.createWebviewPanel(
                'js.preview',
                'ts-preview',
                this.previewColumn,
                {
                    enableScripts: true
                }
            );
        }
        let code = `<code class="javascript">${ this.newText }</code>`;
        let tplStr1: string = this.tplStr
            .replace(/\$\{code\}/, code)
            .replace(/\$\{themeSource\}/, `${ this.themeSource.scheme }:${ this.themeSource.path }`)
            .replace(/\$\{scriptSource\}/, `${ this.scriptSource.scheme }:${ this.scriptSource.path }`)
            .trim();

        this.panel.webview.html = tplStr1;
    }
    init()
    {
        this.preview(0);
        this.bindEvn();
    }
}
