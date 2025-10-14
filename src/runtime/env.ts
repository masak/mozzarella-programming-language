import {
    UninitValue,
    Value,
} from "./value";

export class Env {
    bindings: Map<string, Value>;
    outer: Env | null;

    constructor(bindings: Map<string, Value>, outer: Env | null) {
        this.bindings = bindings;
        this.outer = outer;
    }
}

export function emptyEnv(): Env {
    return new Env(new Map(), null);
}

export function extend(env: Env) {
    return new Env(new Map(), env);
}

export function lookup(env: Env | null, name: string): Value {
    while (env !== null) {
        let value: Value;
        if (value = env.bindings.get(name)!) {
            if (value instanceof UninitValue) {
                throw new Error(`Uninitialized variable '${name}'`);
            }
            return value;
        }
        env = env.outer;
    }
    throw new Error(`Undeclared variable '${name}'`);
}

export function findEnvOfName(env: Env | null, name: string): Env {
    while (env != null) {
        if (env.bindings.has(name)) {
            return env;
        }
        env = env.outer;
    }
    throw new Error(`Undeclared variable '${name}'`);
}

export function bind(env: Env, name: string, value: Value): void {
    env.bindings.set(name, value);
}

