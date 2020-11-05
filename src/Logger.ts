/**
 * Modified form of `src/logger.ts` from 
 * [gistpad extension](https://github.com/vsls-contrib/gistpad/)
 */

import * as vscode from "vscode";
import { window } from "vscode";
import Settings from './settings'

import { bind } from 'helpful-decorators';

import { OUTPUT, META, DEBUG } from './constants'

//#region Declarations

const enum LogTypes
{
    'info'   = 'info',
    'warn'   = 'warning',
    'error'  = 'error',
    'debug'  = 'debug'
}
type        LogType    = keyof typeof LogTypes
type        LogOptions = typeof LogTypes[LogMethods]
export type LogMethods = LogType

interface Logger extends Record<LogMethods, (message: string) => void> { }

//#endregion Declarations

//#region Defaults

const defaultChannel = window.createOutputChannel(OUTPUT.CHANNEL.DEFAULT.NAME)

//#endregion Defaults

//#region Utils

/**
 * Returns object of formatted time components for the current time, 
 * or from a predefined `Date` instance .
 * 
 * @param date 
 *  Instance of `Date`
 */
function getFormattedTimeComponents(date: Date = new Date())
{
    return  {
        year:  date.getFullYear(),
        month: date.getMonth().toString().padStart(2, '0'),
        day:   date.getDay().toString().padStart(2, '0'),

        hour:  date.getHours().toString().padStart(2, '0'),
        sec:   date.getSeconds().toString().padStart(2, '0'),
        min:   date.getMinutes().toString().padStart(2, '0'),
        ms:    date.getMilliseconds().toString().padStart(3, '0'),
    };
}

/**
 * @TODO(disk0): Do
 * ``` ts
 * const hasChannel: MethodDecorator = 
 * function assertLogInstanceChannel(target, propertyKey, descriptor)
 * {
 *   const originalMethod = descriptor.value;
 * 
 *   descriptor.value = function (...args) {
 *     if (this.fuel > fuel) {
 *       originalMethod.apply(this, args);
 *     } else {
 *       console.log("Not enough fuel!");
 *     }
 *   };
 * 
 *   return descriptor;
 * }
 * ```
 */

//#endregion Utils

export class Log implements Logger
{
    constructor(private channel?: vscode.OutputChannel) { };

    @bind
    public focus(channel = this.channel)
    {
        this.assertChannel();

        this.channel!.show(true)
    }

    @bind
    private assertChannel(channel = this.channel): asserts channel
    { if(!channel) throw new Error(OUTPUT.MSG.ERROR.NO_CHANNEL) }

    @bind
    private log(message: string, level: LogOptions): void
    {
        this.assertChannel();

        // Emulate extension host logging format to get highlighting
        // > [2020-09-21 19:45:13.818] [exthost] [warning] TextEditor is closed/disposed

        let _ = getFormattedTimeComponents();

        const timestamp = [ 
            [ _.year, _.month, _.day ].join('-'), 
            [ _.hour, _.min,   _.sec ].join(":") + `.${_.ms}` 
        ].join(' ');

        this.channel!.appendLine( `[${ timestamp }] [${ META.EXTENSION.NAME }] [${ level }] ${ message }` )

        // const dateStr = Date();
        // let [month, , year]    = ( new Date() ).toLocaleDateString().split("/")
        // let [hour, minute, second] = ( new Date() ).toLocaleTimeString().slice(0,7).split(":")
            
    };

    @bind
    public info(message: string): void
    {
        this.log(message, LogTypes.info);
    };

    @bind
    public warn(message: string): void
    {
        this.log(message, LogTypes.warn);
    };

    @bind
    public error(message: string): void
    {
        this.log(message, LogTypes.error);
    };

    public debug(message: string): void
    {
        if(Settings.getDebug()) 
            this.log(message, LogTypes.debug)
    }

    public setLoggingChannel(channel: vscode.OutputChannel): void
    {
        if(this.channel) throw new Error(OUTPUT.MSG.ERROR.PREV_CHANNEL);

        this.channel = channel;

        this.info(`GistPad output channel initialized.`);
    };
}

/**
 * Default logging instance. For any logging that doesn't require a new 
 * output channel.
 */
export const log = new Log(defaultChannel)