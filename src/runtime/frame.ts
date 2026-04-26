import {
    makeEmptyPlaceholder,
    SyntaxNode,
} from "../compiler/syntax";
import {
    Cell,
} from "./cell";
import {
    emptyEnv,
    Env,
} from "./env";
import {
    E000_InternalError,
} from "./error";
import {
    NoneValue,
    Value,
} from "./value";

export class Mode {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static GetValue = new Mode("GetValue");
    static GetCell = new Mode("GetCell");
    static Ignore = new Mode("Ignore");
}

function error(propName: string): never {
    throw new E000_InternalError(
        `During frame construction, no value for '${propName}'`
    );
}

export class Frame {
    mode: Mode;
    node: SyntaxNode;
    state: number;
    quoteLevel: number;
    env: Env;
    staticEnvs: Map<SyntaxNode, Env>;
    index: number;
    value: Value;
    cell: Cell | null;
    v1: Value;
    nn: Array<SyntaxNode>;
    ss: Array<string>;
    vv: Array<Value>;
    jumpMap: JumpMap;
    tail: Frame;

    constructor(oldFrame: Frame | null, newProps: Partial<Frame>) {
        this.mode = newProps.mode ?? oldFrame?.mode ?? Mode.GetValue;
        this.node = newProps.node ?? oldFrame?.node ?? error("node");
        this.state = newProps.state ?? oldFrame?.state ?? 0;
        this.quoteLevel = newProps.quoteLevel ?? oldFrame?.quoteLevel ?? 0;
        this.env = newProps.env ?? oldFrame?.env ?? error("env");
        this.staticEnvs = newProps.staticEnvs
            ?? oldFrame?.staticEnvs
            ?? error("staticEnvs");
        this.index = newProps.index ?? oldFrame?.index ?? 0;
        this.value = newProps.value ?? oldFrame?.value ?? new NoneValue();
        this.cell = newProps.cell ?? oldFrame?.cell ?? null;
        this.v1 = newProps.v1 ?? oldFrame?.v1 ?? new NoneValue();
        this.nn = newProps.nn ?? oldFrame?.nn ?? [];
        this.ss = newProps.ss ?? oldFrame?.ss ?? [];
        this.vv = newProps.vv ?? oldFrame?.vv ?? [];
        this.jumpMap = newProps.jumpMap
            ?? oldFrame?.jumpMap
            ?? error("jumpMap");
        this.tail = newProps.tail ?? oldFrame?.tail ?? error("tail");
    }
}

export class JumpMap {
    lastTarget: Frame | null = null;
    nextTarget: Frame | null = null;
    returnTarget: Frame | null = null;
}

export function cloneJumpMap(original: JumpMap): JumpMap {
    let copy = new JumpMap();
    copy.lastTarget = original.lastTarget;
    copy.nextTarget = original.nextTarget;
    copy.returnTarget = original.returnTarget;
    return copy;
}

function initialize<T>(fn: () => T): T {
    return fn();
}

export function makeRootFrame(): Frame {
    return initialize(() => {
        let rootFrame = new Frame(null, {
            node: makeEmptyPlaceholder(),
            env: emptyEnv(),
            staticEnvs: new Map(),
            jumpMap: new JumpMap(),
            tail: ({} as any) as Frame,
        });
        rootFrame.tail = rootFrame;   // tie the knot
        return rootFrame;
    });
}

// Clones the current frame, sets the clone's state to the desired target
// state, and creates a new child frame with the desired properties.
export function recurse(
    parentFrame: Frame,
    state: number,
    childProps: Partial<Frame>,
): Frame {
    return new Frame(
        null,
        {
            env: parentFrame.env,
            staticEnvs: parentFrame.staticEnvs,
            jumpMap: parentFrame.jumpMap,
            ...childProps,
            tail: new Frame(parentFrame, { state }),
        },
    );
}

// Replaces the current frame with a new child frame with the desired
// properties.
export function tailRecurse(
    parentFrame: Frame,
    childProps: Partial<Frame>,
): Frame {
    return new Frame(
        null,
        {
            env: parentFrame.env,
            staticEnvs: parentFrame.staticEnvs,
            jumpMap: parentFrame.jumpMap,
            ...childProps,
            tail: parentFrame.tail,
        },
    );
}

