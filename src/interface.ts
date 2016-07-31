interface Ajax {
    get: (url: string) => string;
    getRequests: () => Object;
    load: (opts: HttpOptions) => void;
    onComplete: (response: string, request: HttpOptions, success: boolean, xhr: XMLHttpRequest) => void;
}

interface Core {
    create: (obj: Object) => Object;
    emptyFn: () => void;
    extend: (proto: Object, ...args: Object[]) => Object;
    mixin: (child: Object, parent: Object) => Object;
    mixinIf: (child: Object, parent: Object) => Object;
}

interface HttpOptions {
    async: boolean;
    data: string;
    headers: string;
    id?: number;
    postvars: string;
    timeout: number;
    type: string;
    url: string;
    abort: Function;
    complete: Function;
    error: Function;
    success: Function;
}

interface Observer {
    subscriberEvents: (v: string|string[]) => void;
    fire: (type: string, options: Object) => boolean;
    isObserved: (type: string) => boolean;
    purgeSubscribers: () => void;
    subscribe: (type: string, fn: Function) => void;
    unsubscribe: (type: string, fn: Function) => void;
}

interface RuleBag {
    email: RuleDef;
    phone: RuleDef;
    ssn: RuleDef;
    zip: RuleDef;
    [propName: string]: RuleDef;
}

interface RuleDef {
    re: string;
    mask?: string;
    message: string;
}

interface Rules {
    getRule: (name: string) => RuleDef;
    setRule: (name: string, rule: RuleDef) => RuleBag;
    removeRule: (name: string) => RuleBag;
    rules: () => RuleBag;
}

interface Util {
    globalSymbol: string;
    addCommas: (format: number|string) => string;
    camelCase: (str: string) => string;
    capFirstLetter: (str: string) => string;
    copy: (...args: any[]) => Object;
    deepCopy: (orig: Object[]|Object) => Object;
    flush: (...actions: string[]) => void;
    howMany: (haystack: string, needle: string) => number;
    increment: () => number;
    isArray: (v: any) => boolean;
    isEmpty: (v: string|Object) => boolean;
    makeArray: (o, start?: number) => any[];
    makeId: () => string;
    range: (range: string) => number[]|string[];
    toArray: (o: Object) => any[];
    trim: (str: string) => string;
}

export {
    Ajax,
    Core,
    HttpOptions,
    Observer,
    RuleDef,
    RuleBag,
    Rules,
    Util
};

