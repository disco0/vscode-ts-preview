type PreviewMode = keyof typeof import('./Preview/Preview').PREVIEW_MODE;
type Previews = Array<import('./Preview').Preview<PreviewMode>>

type ExtensionOf = import('tsdef').InheritClass

type Arrayable<T> = T | T[]
type Maybe<T> = T | undefined;

type WithDefined<T> = 
{
    [P in keyof T]-?: T[P];
};

