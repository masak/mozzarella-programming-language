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
    E607_CannotAssignError,
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
    // immutable properties
    mode: Mode;
    node: SyntaxNode;
    state: number;
    env: Env;
    staticEnvs: Map<SyntaxNode, Env>;
    value: Value;
    cell: Cell | null;
    jumpMap: JumpMap;
    tail: Frame;

    // mutable properties
    datum1: number;
    datum2: number | Value;
    datum3: Array<SyntaxNode>;
    datum4: Array<Value>;

    constructor(oldFrame: Frame | null, newProps: Partial<Frame>) {
        this.mode = newProps.mode ?? oldFrame?.mode ?? Mode.GetValue;
        this.node = newProps.node ?? oldFrame?.node ?? error("node");
        this.state = newProps.state ?? oldFrame?.state ?? 0;
        this.env = newProps.env ?? oldFrame?.env ?? error("env");
        this.staticEnvs = newProps.staticEnvs
            ?? oldFrame?.staticEnvs
            ?? error("staticEnvs");
        this.value = newProps.value ?? oldFrame?.value ?? new NoneValue();
        this.cell = newProps.cell ?? oldFrame?.cell ?? null;
        this.jumpMap = newProps.jumpMap
            ?? oldFrame?.jumpMap
            ?? error("jumpMap");
        this.tail = newProps.tail ?? oldFrame?.tail ?? error("tail");

        this.datum1 = newProps.datum1 ?? oldFrame?.datum1 ?? 0;
        this.datum2 = newProps.datum2 ?? oldFrame?.datum2 ?? 0;
        this.datum3 = newProps.datum3 ?? oldFrame?.datum3 ?? [];
        this.datum4 = newProps.datum4 ?? oldFrame?.datum4 ?? [];
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

export function assertNotAssignable(frame: Frame) {
    if (frame.mode === Mode.GetCell) {
        throw new E607_CannotAssignError(
            "Cannot assign to " + frame.node.kind.name
        );
    }
}

