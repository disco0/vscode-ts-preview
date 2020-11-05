
//#region Util

/**
 * (Comment copied from original location as `DocPreview#preprocess` method directly)
 *
 *   Text preprocessing applied after compilation - initially added to insert `// @ts-no-check` to
 * previews displayed in an editor instance, as TypeScript compiler incorrectly detects
 * redeclarations of all variables in source file.
 *
 * @TODO 
 *   Customizable? Configuration object with prepend, append, custom `(source: string) => string`
 * style callback?
 */
export const prependTsNoCheckComment: PreprocessTransform = 
function(source)
{
    return [`// @ts-nocheck`, source].join('\n')
}


const exportStatementRegex =
    /(?<=(;[\n\s]*|^)[\s]*)export[\n\s]+(?:\{.*?\}|(const|var|let)[\n\s]+[a-zA-Z_]+[\n\s]+=)/g;
/**
 * If source does not contain an export statement, then append one at the end.
 * 
 * TODO: If no better way to to stop type checking from detecting duplicate declarations
 *       when working with a script file preview, add some sort of flag to tell 
 *       the preview editor to make non-compilation result modifications hidden with 
 *       decorations (`DocPreviewPreprocessFunction` was defined with a `this` type for
 *       this reason).
 */
export const insertExportIfMissing: PreprocessTransform = 
function(source)
{   
    // Return as passed in if effectively empty, or export statement (roughly) matched
    if(
        source.trim().length === 0
        || !!exportStatementRegex.exec(source)
    ) return source;

    return [source, 'export { };'].join('\n')
}

//#endregion Util

//#region Declarations

export type PreprocessTransform = (source: string) => string 
export type PreprocessConfiguration = Arrayable<PreprocessTransform>

//#endregion Declarations