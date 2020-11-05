import { Preview } from './Preview'
import type { ExtensionContext } from 'vscode'

import { DocPreview } from './DocPreview'
import { WebviewPreview } from './WebviewPreview'

/**
 * Create a new typescript preview based on current user configuration
 * setting for `ts-preview.mode`, or by argument `mode`.
 */
function PreviewForConfiguration(context: ExtensionContext): Preview // <PreviewMode>;
function PreviewForConfiguration<M extends PreviewMode = typeof Preview.config.mode>
(
    context: ExtensionContext, 
    mode?: M
) : Preview { // <'editor' | 'webview'> {   
    switch(mode || Preview.config.mode)
    {
        case 'webview': 
            return new WebviewPreview(context);
        case 'editor':
        default:
            return new DocPreview(context);
    }
}

export { PreviewForConfiguration as DynamicPreview }