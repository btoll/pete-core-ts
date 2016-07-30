interface HttpOptions {
    async: boolean;
    data: string;
    headers: string;
    id?: string;
    postvars: string;
    timeout: number;
    type: string;
    url: string;
    abort: Function;
    complete: Function;
    error: Function;
    success: Function;
}

interface Proto {
    $compose: Function;
    [propName: string]: Function|string;
}

interface Rule {
    re: string;
    mask?: string;
    message: string;
}

interface RuleBag {
    email: Rule;
    phone: Rule;
    ssn: Rule;
    zip: Rule;
    [propName: string]: Rule;
}

export { HttpOptions, Proto, Rule, RuleBag };

