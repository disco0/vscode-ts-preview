//#region Imports

import { workspace } from 'vscode'
import { window } from 'vscode'

import { bind, debounce } from 'helpful-decorators'

// NOTE: Keep up to date with package.json, or figure out how to import a JSON file 
//       outside of the rootDir without breaking output structure
type SettingsSchema = {
    type: string;
    title: string;
    properties: {
        "ts-preview.mode": {
            scope: string;
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        "ts-preview.debug": {
            scope: string;
            type: string;
            default: boolean;
            title: string;
            description: string;
        };
    };
}

//#endregion Imports

const settingsCooldown = 400;
const debounceSubsequent: (ms: number) => MethodDecorator 
    = (ms: number) => debounce(ms, {trailing: true})

const userConfig = workspace.getConfiguration('ts-preview');

export class Settings
{
    static get base()
    {
        return workspace.getConfiguration('ts-preview');
    }

    @bind
    static getDebug()
    { 
        return Settings.base.get<boolean>('debug', false);
    }

    @bind
    static getMode()
    { 
        return Settings.base.get<TSPreview.Configuration.Mode>('debug', 'editor');
    }
}

export default Settings


//#region Configuration Schema

namespace TSPreview
{
    export namespace Configuration
    {
        export type Mode = 'editor' | 'webview'
        export type Debug = boolean

    }
}

//#endregion Configuration Schema