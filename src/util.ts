import { Diagnostic } from 'typescript'
import { log } from './Logger'

//#region Types

const isDiagnostic = (obj: any): obj is Diagnostic => {
    if(typeof obj !== 'object') return false
    if(!('source' in obj)) return false;
    if(!('code' in obj)) return false;
    if(!('number' in obj)) return false;
    return true;
}

//#endregion Types

//#region Typescript Compiler

import ts from 'typescript'

function formatDiagnostic(diagnostic: Diagnostic): string
{
    diagnostic
    return [
        "Error ", diagnostic.code, ": ",
        ts.flattenDiagnosticMessageText( diagnostic.messageText, "\n" )
    ].join('')
}

function formatDiagnosticArray(diagnostics: Diagnostic[])
{
    return ['Diagnostics:', ...diagnostics.map(formatDiagnostic).join('\n')].join('\n')
}

export function formatDiagnostics(diagnostic: Diagnostic): string;
export function formatDiagnostics(diagnostics: Arrayable<Diagnostic>): string;
export function formatDiagnostics(...diagnostics: Diagnostic[]): string;
export function formatDiagnostics(...diags: Diagnostic[] | [Arrayable<Diagnostic>]): string
{  
    const diagnostics: Diagnostic[] = []
    
    //#region Overload Collapse

    diags.forEach(item => {
        if(isDiagnostic(item))
            diagnostics.push(item)
        else if (Array.isArray(item))
            diagnostics.push(...item.filter(isDiagnostic))
        else
            return;
    })

    //#endregion Overload Collapse

    // TODO: Finish formatting proper
    return JSON.stringify(diagnostics, null, 4);

    if(diagnostics.length === 0)
        log.warn('No diagnostics passed in to formatter.')
    else if(diagnostics.length === 1)
        formatDiagnostic(diagnostics[0])
    else 
        formatDiagnosticArray(diagnostics)
}

export const tsc = 
{
    format: { diagnostic: formatDiagnostic }
}

//#endregion Typescript Compiler