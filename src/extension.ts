import * as vscode from 'vscode';
import { log } from './Logger';
import Settings from './settings'
import { DynamicPreview } from './Preview';

const tsPreviewInstances: Previews = [];
export function activate(context: vscode.ExtensionContext) 
{
    log.info("Extension activated.")
    context.subscriptions.push( vscode.commands.registerCommand('ts-preview.dynamic', () => {
        let currEditor = vscode.window.activeTextEditor;
        log.info("Editor info:\n" + JSON.stringify(currEditor, null, 4));
        if (currEditor && currEditor.document.languageId === 'typescript')
        {
            log.info("Creating new dynamic preview instance.")
            tsPreviewInstances.push(DynamicPreview(context))
        } 
        else 
        {
            vscode.window.showInformationMessage('Current editor instance language is not typescript.');
        }
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
