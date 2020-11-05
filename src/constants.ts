import vscode from 'vscode';

export const META =
{
    EXTENSION: 
    { 
        NAME: 'ts-preview' 
    },
    COMMAND_PREFIX: 'ts-preview'
} as const;

export const COMMAND = 
{
    /**
     * Generates command name with extension's namespacing
     */
    NAME(commandName: string | TemplateStringsArray, ...values: any[])
    {
        const prefix = META.COMMAND_PREFIX;

        if (typeof commandName === 'string')
            return `${prefix}.${commandName.replace(/^\./, '')}`;
        
        const bases = commandName as TemplateStringsArray;

        if(values.length === 0)
            return `${prefix}.${bases[0]}`
        
        else
            return `${prefix}.${bases[0]}` +
                bases.slice(1)
                     .flatMap((str: string, idx: number) =>
                          values[idx] ? str + values[idx].toString() : str)
                     .join('');
    }
}

export const OUTPUT = 
{ 
    CHANNEL: 
    { 
        DEFAULT: { NAME: META.EXTENSION.NAME }
    },

    MSG: 
    {
        ERROR:
        {
            NO_CHANNEL:   "Error executing Log functionality: Property `channel` in Log instance has not been initialized.",
            PREV_CHANNEL: "Error setting logging channel: Property `channel` in Log instance already defined."
        }
    }
} as const;

export default
{ 
    META,
    COMMAND,
    OUTPUT
}


// vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
//     if(event.affectsConfiguration(COMMAND.NAME`debug`))
//     {

//     }
//     else
//     {
        
//     }
// })

export let DEBUG: boolean = vscode.workspace.getConfiguration('ts-preview').get('debug', false);
