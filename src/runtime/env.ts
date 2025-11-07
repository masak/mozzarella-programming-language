import {
    E505_UninitializedError,
} from "./error";
import {
    UninitValue,
    Value,
} from "./value";

class Binding {
    value: Value;
    mutable: boolean;

    constructor(value: Value, mutable: boolean) {
        this.value = value;
        this.mutable = mutable;
    }
}

export class Env {
    bindings: Map<string, Binding>;
    outer: Env | null;

    constructor(bindings: Map<string, Binding>, outer: Env | null) {
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
        let binding: Binding;
        if (binding = env.bindings.get(name)!) {
            let value = binding.value;
            if (value instanceof UninitValue) {
                throw new E505_UninitializedError(
                    `Uninitialized variable '${name}'`
                );
            }
            return value;
        }
        env = env.outer;
    }
    throw new Error(`Undeclared variable '${name}'`);
}

export function findEnvOfName(env: Env | null, name: string): [boolean, Env] {
    while (env != null) {
        if (env.bindings.has(name)) {
            let binding = env.bindings.get(name)!;
            let mutable = binding.mutable;
            return [mutable, env];
        }
        env = env.outer;
    }
    throw new Error(`Undeclared variable '${name}'`);
}

export function bindMutable(env: Env, name: string, value: Value): void {
    env.bindings.set(name, new Binding(value, /* mutable */ true));
}

export function bindReadonly(env: Env, name: string, value: Value): void {
    env.bindings.set(name, new Binding(value, /* mutable */ false));
}

