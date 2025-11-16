import {
    E505_UninitializedError,
    E506_UndeclaredError,
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
    throw new E506_UndeclaredError(`Undeclared variable '${name}'`);
}

// Used when looking up the names for macro calls; in this scenario, both
// undeclared and uninitialized variables are simply treated as harmless
// "fall-through" cases, not errors.
export function tolerantLookup(env: Env | null, name: string): Value | null {
    while (env !== null) {
        let binding: Binding;
        if (binding = env.bindings.get(name)!) {
            let value = binding.value;
            if (value instanceof UninitValue) {
                return null;
            }
            return value;
        }
        env = env.outer;
    }
    return null;
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
    throw new E506_UndeclaredError(`Undeclared variable '${name}'`);
}

export function bindMutable(env: Env, name: string, value: Value): void {
    env.bindings.set(name, new Binding(value, /* mutable */ true));
}

export function bindReadonly(env: Env, name: string, value: Value): void {
    env.bindings.set(name, new Binding(value, /* mutable */ false));
}

