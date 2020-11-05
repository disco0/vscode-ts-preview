///<reference lib="es2020"/>

//#region Test Input

let input = `at Evaluator.visitImport (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/evaluator.js:915:21)
at Evaluator.Visitor.visit (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/index.js:28:40)
at Evaluator.visit (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/evaluator.js:160:18)
at Evaluator.visitRoot (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/evaluator.js:707:27)
at Evaluator.Visitor.visit (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/index.js:28:40)
at Evaluator.visit (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/evaluator.js:160:18)
at Evaluator.evaluate (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/visitor/evaluator.js:247:15)
at Renderer.render (/Users/disk0/Dropbox/dev/dotfile/stylus/node_modules/stylus/lib/renderer.js:86:26)
at StylusSource.compile (/Users/disk0/Dropbox/dev/dotfile/stylus/validate/StylusSource.ts:161:35)
at Object.<anonymous> (/Users/disk0/Dropbox/dev/dotfile/stylus/validate/index.ts:35:32)`;

//#endregion Test Input

//#region Body

// Groups with `__` prefix contains nested styles
const lineRegexp = 
/^(?<__location>at[ ](?<__function>(?<object>[a-zA-Z_\$]+)(?:(?<func_delim>\.)(?<method>[a-zA-Z_\$]+)?)(?<rest>.*?)))[ ]+[\(](?<__path>(?<file>(?:[A-Z]:)?[\/\\][^:\n]+?)(?<line>:\d+)(?<column>:\d+))[\)]$/gm;

const parseLine = (line: string) => lineRegexp.exec(line)?.groups ?? {};

const logParseLine = (line: string) => ((groups: RegExpExecArray['groups']) => {
    for(const [group, value] of Object.entries(groups))
    {
        if(group.startsWith('__')) 
            continue;
            
        console.info(
            '%c%s:%c\n%c  - %c"%s"', 
            
            'color: #00A;font-weight: 700;', group, '', 'color: #6A9;font-size: 1.2em', 
            
            'color: #0A2;font-size: 1.2em', value
        )
    }
    const baseGroups = Object.entries(groups).filter(([k,]) => !(k.startsWith('__')))
    console.log(`%c${baseGroups.map(([,_])=> `"${_}"`).join(' | ')}`, 'color: #049')
})(parseLine(line));

//#endregion Body

//#region Run

input.split(/\n\r?/).forEach(logParseLine) 

//#endregion Run