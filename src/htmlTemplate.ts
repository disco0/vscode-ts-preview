import * as fs from 'fs';
import * as path from 'path';

interface ReadOptions 
{
    mini: boolean;
}

export function readHtmlTemplateFile(dirPath: string, opt: ReadOptions): string
{
    let htmlStr     = '',
        absoluteDir = path.resolve(__dirname, dirPath);

    if(fs.existsSync(absoluteDir))
        htmlStr = fs.readFileSync(absoluteDir, 'utf-8');
    else
        console.log(absoluteDir, 'is not exit');

    if (opt.mini)
        htmlStr = htmlStr.replace(/[\r\t\n\s]+/, ' ');

    return htmlStr;
}
