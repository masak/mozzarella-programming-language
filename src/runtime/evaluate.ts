// The evaluator
//
// Can be described as a CEKJ machine. The CEK part is standard: code,
// environment, kontinuation with a "k". The J part contains a table of _jump
// targets_, making `next`/`last`/`return` work.
import {
    blockStatements,
    boolLitExprValue,
    compUnitStatements,
    exprStatementExpr,
    funcDeclBody,
    funcDeclName,
    funcDeclParameterList,
    infixOpExprLhs,
    infixOpExprOpName,
    infixOpExprRhs,
    intLitExprValue,
    isFuncDecl,
    isMacroDecl,
    isVarDecl,
    macroDeclBody,
    macroDeclName,
    macroDeclParameterList,
    parameterListParameters,
    parameterName,
    parenExprInnerExpr,
    prefixOpExprOperand,
    prefixOpExprOpName,
    strLitExprValue,
    SyntaxNode,
    SyntaxKind,
    varDeclName,
} from "../compiler/syntax";
import {
    boolify,
} from "./boolify";
import {
    checkForUnchainableOps,
    comparisonOps,
    evaluateComparison,
    findAllChainedOps,
} from "./compare";
import {
    E000_InternalError,
    E500_OutOfFuel,
    E601_ZeroDivisionError,
    E603_TypeError,
    E611_TooManyArgumentsError,
    E612_NotEnoughArgumentsError,
} from "./error";
import {
    bindMutable,
    bindReadonly,
    emptyEnv,
    Env,
    extend,
} from "./env";
import {
    stringify,
} from "./stringify";
import {
    BoolValue,
    FuncValue,
    IntValue,
    MacroValue,
    NoneValue,
    StrValue,
    UninitValue,
    Value,
} from "./value";

class Mode {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static GetValue = new Mode("GetValue");
    static GetCell = new Mode("GetCell");
    static Ignore = new Mode("Ignore");
    static Interpolate = new Mode("Interpolate");
}

function error(propName: string): never {
    throw new E000_InternalError(
        `During frame construction, no value for '${propName}'`
    );
}

class Frame {
    mode: Mode;
    node: SyntaxNode;
    state: number;
    quoteLevel: number;
    env: Env;
    index: number;
    value: Value;
    v1: Value;
    nn: Array<SyntaxNode>;
    ss: Array<string>;
    tail: Frame | null;

    constructor(oldFrame: Frame | null, newProps: Partial<Frame>) {
        this.mode = newProps.mode ?? oldFrame?.mode ?? Mode.GetValue;
        this.node = newProps.node ?? oldFrame?.node ?? error("node");
        this.state = newProps.state ?? oldFrame?.state ?? 0;
        this.quoteLevel = newProps.quoteLevel ?? oldFrame?.quoteLevel ?? 0;
        this.env = newProps.env ?? oldFrame?.env ?? error("env");
        this.index = newProps.index ?? oldFrame?.index ?? 0;
        this.value = newProps.value ?? oldFrame?.value ?? new NoneValue();
        this.v1 = newProps.v1 ?? oldFrame?.v1 ?? new NoneValue();
        this.nn = newProps.nn ?? oldFrame?.nn ?? [];
        this.ss = newProps.ss ?? oldFrame?.ss ?? [];
        this.tail = newProps.tail ?? oldFrame?.tail ?? null;
    }
}

function load(compUnit: SyntaxNode, staticEnvs: Map<SyntaxNode, Env>): Frame {
    let env = initializeEnv(emptyEnv(), compUnit, staticEnvs);
    return new Frame(null, {
        node: compUnit,
        env,
    });
}

function recurse(
    parentFrame: Frame,
    state: number,
    childProps: Partial<Frame>,
): Frame {
    return new Frame(
        null,
        { ...childProps, tail: new Frame(parentFrame, { state }) },
    );
}

function tailRecurse(parentFrame: Frame, childProps: Partial<Frame>): Frame {
    return new Frame(null, { ...childProps, tail: parentFrame.tail });
}

export function initializeEnv(
    env: Env,
    compUnitOrBlock: SyntaxNode,
    staticEnvs: Map<SyntaxNode, Env>,
): Env {
    let statements = blockStatements(compUnitOrBlock);
    for (let statementOrDecl of statements) {
        if (isVarDecl(statementOrDecl)) {
            let varDecl = statementOrDecl;
            let name = varDeclName(varDecl).payload as string;
            let staticEnv = staticEnvs.get(compUnitOrBlock);
            let value
                = staticEnv?.bindings.get(name)?.value ?? new UninitValue();
            bindMutable(env, name, value);
        }
        else if (isFuncDecl(statementOrDecl)) {
            let funcDecl = statementOrDecl;
            let name = funcDeclName(funcDecl).payload as string;
            let parameterList = parameterListParameters(
                funcDeclParameterList(funcDecl)
            ).map((parameter) => parameterName(parameter).payload as string);
            let funcValue = new FuncValue(
                name,
                env,
                parameterList,
                funcDeclBody(funcDecl),
            );
            bindReadonly(env, name, funcValue);
        }
        else if (isMacroDecl(statementOrDecl)) {
            let macroDecl = statementOrDecl;
            let name = macroDeclName(macroDecl).payload as string;
            let parameterList = parameterListParameters(
                macroDeclParameterList(macroDecl)
            ).map((parameter) => parameterName(parameter).payload as string);
            let macroValue = new MacroValue(
                name,
                env,
                parameterList,
                macroDeclBody(macroDecl),
            );
            bindReadonly(env, name, macroValue);
        }
    }

    return env;
}

type Handler = (frame: Frame) => Frame | Value;
let handlerMap = new Map<SyntaxKind, Handler>();

handlerMap.set(SyntaxKind.EMPTY_PLACEHOLDER, (frame) => {
    throw new E000_InternalError("Tried to evaluate EmptyPlaceholder");
});

handlerMap.set(SyntaxKind.STR_NODE, (frame) => {
    throw new E000_InternalError("Tried to evaluate StrNode");
});

handlerMap.set(SyntaxKind.INT_NODE, (frame) => {
    throw new E000_InternalError("Tried to evaluate IntNode");
});

handlerMap.set(SyntaxKind.BOOL_NODE, (frame) => {
    throw new E000_InternalError("Tried to evaluate BoolNode");
});

handlerMap.set(SyntaxKind.COMPUNIT, (frame) => {
    // let statements = compUnitStatements(node);
    // let lastIndex = statements.length - 1;
    // for (let index = 0; index < statements.length; index++) {    // [0]
    //     let value = eval(statements[index]);
    //     if (index === lastIndex) {                               // [1]
    //         return value;
    //     }
    // }
    // return new NoneValue();

    switch (frame.state) {
        case 0: {
            let statements = compUnitStatements(frame.node);
            if (frame.index < statements.length) {
                return recurse(
                    frame,
                    1,
                    { node: statements[frame.index], env: frame.env },
                );
            }
            else {
                return new NoneValue();
            }
        }
        case 1: {
            let statements = compUnitStatements(frame.node);
            let lastIndex = statements.length - 1;
            if (frame.index === lastIndex) {
                return frame.value;
            }
            else {
                return new Frame(frame, { state: 0, index: frame.index + 1 });
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.BLOCK, (frame) => {
    throw new E000_InternalError("Evaluating Block not implemented yet");
});

handlerMap.set(SyntaxKind.EXPR_STATEMENT, (frame) => {
    let expr = exprStatementExpr(frame.node);
    return tailRecurse(frame, { node: expr, env: frame.env });
});

handlerMap.set(SyntaxKind.EMPTY_STATEMENT, (frame) => {
    return new NoneValue();
});

handlerMap.set(SyntaxKind.BLOCK_STATEMENT, (frame) => {
    throw new E000_InternalError(
        "Evaluating BlockStatement not implemented yet"
    );
});

handlerMap.set(SyntaxKind.IF_CLAUSE, (frame) => {
    throw new E000_InternalError("Evaluating IfClause not implemented yet");
});

handlerMap.set(SyntaxKind.IF_CLAUSE_LIST, (frame) => {
    throw new E000_InternalError(
        "Evaluating IfClauseList not implemented yet"
    );
});

handlerMap.set(SyntaxKind.IF_STATEMENT, (frame) => {
    throw new E000_InternalError("Evaluating IfStatement not implemented yet");
});

handlerMap.set(SyntaxKind.FOR_STATEMENT, (frame) => {
    throw new E000_InternalError(
        "Evaluating ForStatement not implemented yet"
    );
});

handlerMap.set(SyntaxKind.WHILE_STATEMENT, (frame) => {
    throw new E000_InternalError(
        "Evaluating WhileStatement not implemented yet"
    );
});

handlerMap.set(SyntaxKind.LAST_STATEMENT, (frame) => {
    throw new E000_InternalError(
        "Evaluating LastStatement not implemented yet"
    );
});

handlerMap.set(SyntaxKind.NEXT_STATEMENT, (frame) => {
    throw new E000_InternalError(
        "Evaluating NextStatement not implemented yet"
    );
});

handlerMap.set(SyntaxKind.RETURN_STATEMENT, (frame) => {
    throw new E000_InternalError(
        "Evaluating ReturnStatement not implemented yet"
    );
});

handlerMap.set(SyntaxKind.VAR_DECL, (frame) => {
    throw new E000_InternalError("Evaluating VarDecl not implemented yet");
});

handlerMap.set(SyntaxKind.PARAMETER, (frame) => {
    throw new E000_InternalError("Evaluating Parameter not implemented yet");
});

handlerMap.set(SyntaxKind.PARAMETER_LIST, (frame) => {
    throw new E000_InternalError(
        "Evaluating ParameterList not implemented yet"
    );
});

handlerMap.set(SyntaxKind.FUNC_DECL, (frame) => {
    throw new E000_InternalError("Evaluating FuncDecl not implemented yet");
});

handlerMap.set(SyntaxKind.MACRO_DECL, (frame) => {
    throw new E000_InternalError("Evaluating MacroDecl not implemented yet");
});

handlerMap.set(SyntaxKind.PREFIX_OP_EXPR, (frame) => {
    // let opName = prefixOpExprOpName(node).payload as string;
    // let operand = prefixOpExprOperand(node);
    // if (["+", "-"].includes(opName)) {                           // [0]
    //     let value = eval(operand);
    //     if (opName === "+") {                                    // [1]
    //         if (!(value instanceof IntValue)) {
    //             throw new E603_TypeError("Expected Int as operand of +");
    //         }
    //         return new IntValue(value.payload);
    //     }
    //     else if (opName === "-") {
    //         if (!(value instanceof IntValue)) {
    //             throw new E603_TypeError("Expected Int as operand of -");
    //         }
    //         return new IntValue(-value.payload);
    //     }
    //     else {
    //         throw new E000_InternalError(`Unknown prefix op ${opName}`);
    //     }
    // }
    // else if (opName === "~") {
    //     let value = eval(operand);
    //     return stringify(value);                                 // [2]
    // }
    // else if (["?", "!"].includes(opName)) {
    //     let value = eval(operand);
    //     if (opName === "?") {                                    // [3]
    //         return new BoolValue(boolify(value));
    //     }
    //     else {
    //         return new BoolValue(!boolify(value));
    //     }
    // }
    // else {
    //     throw new E000_InternalError(
    //         `Unknown prefix op type ${opName}`
    //     );
    // }
    let opName = prefixOpExprOpName(frame.node).payload as string;
    switch (frame.state) {
        case 0: {
            let operand = prefixOpExprOperand(frame.node);
            if (["+", "-"].includes(opName)) {
                return recurse(frame, 1, { node: operand, env: frame.env });
            }
            else if (opName === "~") {
                return recurse(frame, 2, { node: operand, env: frame.env });
            }
            else if (["?", "!"].includes(opName)) {
                return recurse(frame, 3, { node: operand, env: frame.env });
            }
            else {
                throw new E000_InternalError(
                    `Unknown prefix op type ${opName}`
                );
            }
        }
        case 1: {
            let value = frame.value;
            if (opName === "+") {
                if (!(value instanceof IntValue)) {
                    throw new E603_TypeError("Expected Int as operand of +");
                }
                return new IntValue(value.payload);
            }
            else if (opName === "-") {
                if (!(value instanceof IntValue)) {
                    throw new E603_TypeError("Expected Int as operand of -");
                }
                return new IntValue(-value.payload);
            }
            else {
                throw new E000_InternalError(`Unknown prefix op ${opName}`);
            }
        }
        case 2: {
            let value = frame.value;
            return stringify(value);
        }
        case 3: {
            let value = frame.value;
            if (opName === "?") {
                return new BoolValue(boolify(value));
            }
            else {
                return new BoolValue(!boolify(value));
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.INFIX_OP_EXPR, (frame) => {
    // let lhs = infixOpExprLhs(node);
    // let opName = infixOpExprOpName(node).payload as string;
    // let rhs = infixOpExprRhs(node);
    // if (["+", "-", "*", "//", "%"].includes(opName)) {           // [0]
    //     let left = eval(lhs);
    //     if (!(left instanceof IntValue)) {                       // [1]
    //         throw new E603_TypeError(`Expected Int as lhs of ${opName}`);
    //     }
    //     let right = eval(rhs);
    //     if (!(right instanceof IntValue)) {                      // [2]
    //         throw new E603_TypeError(`Expected Int as rhs of ${opName}`);
    //     }
    //     if (opName === "+") {
    //         return new IntValue(left.payload + right.payload);
    //     }
    //     else if (opName === "-") {
    //         return new IntValue(left.payload - right.payload);
    //     }
    //     else if (opName === "*") {
    //         return new IntValue(left.payload * right.payload);
    //     }
    //     else if (opName === "//") {
    //         if (!(right instanceof IntValue)) {
    //             throw new E603_TypeError("Expected Int as rhs of //");
    //         }
    //         if (right.payload === 0n) {
    //             throw new E601_ZeroDivisionError("Division by 0");
    //         }
    //         let negative = left.payload < 0n !== right.payload < 0n;
    //         let nonZeroMod = left.payload % right.payload !== 0n;
    //         let diff = negative && nonZeroMod ? 1n : 0n;
    //         return new IntValue(left.payload / right.payload - diff);
    //     }
    //     else if (opName === "%") {
    //         if (!(right instanceof IntValue)) {
    //             throw new E603_TypeError("Expected Int as rhs of %");
    //         }
    //         if (right.payload === 0n) {
    //             throw new E601_ZeroDivisionError("Division by 0");
    //         }
    //         return new IntValue(left.payload % right.payload);
    //     }
    // }
    // else if (opName === "~") {
    //     let left = eval(lhs);
    //     let strLeft = stringify(left);                           // [3]
    //     let right = eval(rhs);
    //     let strRight = stringify(right);                         // [4]
    //     return new StrValue(strLeft.payload + strRight.payload);
    // }
    // else if (opName === "&&") {
    //     let left = eval(lhs);
    //     return boolify(left)                                     // [5]
    //         ? eval(rhs)
    //         : left;
    //     }
    // }
    // else if (opName === "||") {
    //     let left = eval(lhs);
    //     return boolify(left)                                     // [6]
    //         ? left
    //         : eval(rhs);
    // }
    // else if (comparisonOps.has(opName)) {
    //     let [exprs, ops] = findAllChainedOps(node);
    //     checkForUnchainableOps(ops);
    //     let prevValue = eval(exprs[0]);
    //     for (let index = 0; index < exprs.length - 1; index++) { // [7]
    //         let next = exprs[index + 1];
    //         let nextValue = eval(next);
    //         let op = ops[index];                                 // [8]
    //         if (!evaluateComparison(prevValue, op, nextValue)) {
    //             return new BoolValue(false);
    //         }
    //         prevValue = nextValue;
    //     }
    //     return new BoolValue(true);
    // }
    // else {
    //     throw new E000_InternalError(`Unknown infix op ${opName}`);
    // }
    let opName = infixOpExprOpName(frame.node).payload as string;
    switch (frame.state) {
        case 0: {
            if (["+", "-", "*", "//", "%"].includes(opName)) {
                let lhs = infixOpExprLhs(frame.node);
                return recurse(frame, 1, { node: lhs, env: frame.env });
            }
            else if (opName === "~") {
                let lhs = infixOpExprLhs(frame.node);
                return recurse(frame, 3, { node: lhs, env: frame.env });
            }
            else if (opName === "&&") {
                let lhs = infixOpExprLhs(frame.node);
                return recurse(frame, 5, { node: lhs, env: frame.env });
            }
            else if (opName === "||") {
                let lhs = infixOpExprLhs(frame.node);
                return recurse(frame, 6, { node: lhs, env: frame.env });
            }
            else if (comparisonOps.has(opName)) {
                let [exprs, ops] = findAllChainedOps(frame.node);
                frame.nn = exprs;
                frame.ss = ops;
                checkForUnchainableOps(ops);
                return recurse(frame, 7, { node: exprs[0], env: frame.env });
            }
            else {
                throw new E000_InternalError(`Unknown infix op ${opName}`);
            }
        }
        case 1: {
            let left = frame.value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError(`Expected Int as lhs of ${opName}`);
            }
            frame.v1 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs, env: frame.env });
        }
        case 2: {
            let left = frame.v1 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError(`Expected Int as rhs of ${opName}`);
            }
            if (opName === "+") {
                return new IntValue(left.payload + right.payload);
            }
            else if (opName === "-") {
                return new IntValue(left.payload - right.payload);
            }
            else if (opName === "*") {
                return new IntValue(left.payload * right.payload);
            }
            else if (opName === "//") {
                if (!(right instanceof IntValue)) {
                    throw new E603_TypeError("Expected Int as rhs of //");
                }
                if (right.payload === 0n) {
                    throw new E601_ZeroDivisionError("Division by 0");
                }
                let negative = left.payload < 0n !== right.payload < 0n;
                let nonZeroMod = left.payload % right.payload !== 0n;
                let diff = negative && nonZeroMod ? 1n : 0n;
                return new IntValue(left.payload / right.payload - diff);
            }
            else if (opName === "%") {
                if (!(right instanceof IntValue)) {
                    throw new E603_TypeError("Expected Int as rhs of %");
                }
                if (right.payload === 0n) {
                    throw new E601_ZeroDivisionError("Division by 0");
                }
                return new IntValue(left.payload % right.payload);
            }
        }
        case 3: {
            let left = frame.value;
            let strLeft = stringify(left);
            frame.v1 = strLeft;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 4, { node: rhs, env: frame.env });
        }
        case 4: {
            let strLeft = frame.v1 as StrValue;
            let right = frame.value;
            let strRight = stringify(right);
            return new StrValue(strLeft.payload + strRight.payload);
        }
        case 5: {
            let left = frame.value;
            let rhs = infixOpExprRhs(frame.node);
            if (boolify(left)) {
                return tailRecurse(frame, { node: rhs, env: frame.env });
            }
            else {
                return left;
            }
        }
        case 6: {
            let left = frame.value;
            let rhs = infixOpExprRhs(frame.node);
            if (boolify(left)) {
                return left;
            }
            else {
                return tailRecurse(frame, { node: rhs, env: frame.env });
            }
        }
        case 7: {
            let prevValue = frame.value;
            frame.v1 = prevValue;
            if (frame.index < frame.nn.length - 1) {
                let next = frame.nn[frame.index + 1];
                return recurse(frame, 8, { node: next, env: frame.env });
            }
            else {
                return new BoolValue(true);
            }
        }
        case 8: {
            let nextValue = frame.value;
            let prevValue = frame.v1;
            let op = frame.ss[frame.index];
            if (!evaluateComparison(prevValue, op, nextValue)) {
                return new BoolValue(false);
            }
            frame.v1 = nextValue;
            frame.index++;
            return new Frame(frame, { state: 7 });
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.INDEXING_EXPR, (frame) => {
    throw new E000_InternalError(
        "Evaluating IndexingExpr not implemented yet"
    );
});

handlerMap.set(SyntaxKind.ARGUMENT, (frame) => {
    throw new E000_InternalError("Evaluating Argument not implemented yet");
});

handlerMap.set(SyntaxKind.ARGUMENT_LIST, (frame) => {
    throw new E000_InternalError(
        "Evaluating ArgumentList not implemented yet"
    );
});

handlerMap.set(SyntaxKind.CALL_EXPR, (frame) => {
    throw new E000_InternalError("Evaluating CallExpr not implemented yet");
});

handlerMap.set(SyntaxKind.INT_LIT_EXPR, (frame) => {
    let payload = intLitExprValue(frame.node).payload as bigint;
    return new IntValue(payload);
});

handlerMap.set(SyntaxKind.STR_LIT_EXPR, (frame) => {
    let payload = strLitExprValue(frame.node).payload as string;
    return new StrValue(payload);
});

handlerMap.set(SyntaxKind.BOOL_LIT_EXPR, (frame) => {
    let payload = boolLitExprValue(frame.node).payload as boolean;
    return new BoolValue(payload);
});

handlerMap.set(SyntaxKind.NONE_LIT_EXPR, (frame) => {
    return new NoneValue();
});

handlerMap.set(SyntaxKind.PAREN_EXPR, (frame) => {
    let innerExpr = parenExprInnerExpr(frame.node);
    return tailRecurse(frame, { node: innerExpr, env: frame.env });
});

handlerMap.set(SyntaxKind.DO_EXPR, (frame) => {
    throw new E000_InternalError("Evaluating DoExpr not implemented yet");
});

handlerMap.set(SyntaxKind.ARRAY_INITIALIZER_EXPR, (frame) => {
    throw new E000_InternalError(
        "Evaluating ArrayInitializerExpr not implemented yet"
    );
});

handlerMap.set(SyntaxKind.VAR_REF_EXPR, (frame) => {
    throw new E000_InternalError("Evaluating VarRefExpr not implemented yet");
});

handlerMap.set(SyntaxKind.QUOTE_EXPR, (frame) => {
    throw new E000_InternalError("Evaluating QuoteExpr not implemented yet");
});

handlerMap.set(SyntaxKind.UNQUOTE_EXPR, (frame) => {
    throw new E000_InternalError("Evaluating UnquoteExpr not implemented yet");
});

function step(frame: Frame, staticEnvs: Map<SyntaxNode, Env>): Frame | Value {
    let handler = handlerMap.get(frame.node.kind);
    if (handler === undefined) {
        throw new E000_InternalError(
            `Missing handler for ${frame.node.constructor.name}`
        );
    }
    return handler(frame);
}

export function runCompUnit(
    compUnit: SyntaxNode,
    staticEnvs: Map<SyntaxNode, Env>,
): Value {
    let frame = load(compUnit, staticEnvs);

    while (true) {
        let result = step(frame, staticEnvs);
        if (result instanceof Frame) {
            frame = result;
        }
        else if (frame.tail) {
            frame = frame.tail;
            frame.value = result;
        }
        else {
            return result;
        }
    }
}

export function runCompUnitWithFuel(
    compUnit: SyntaxNode,
    fuel: number,
    staticEnvs: Map<SyntaxNode, Env>,
): Value {
    let frame = load(compUnit, staticEnvs);

    while (true) {
        let result = step(frame, staticEnvs);
        if (result instanceof Frame) {
            frame = result;
        }
        else if (frame.tail) {
            frame = frame.tail;
            frame.value = result;
        }
        else {
            return result;
        }

        --fuel;
        if (fuel <= 0) {
            throw new E500_OutOfFuel();
        }
    }
}

function zip<T, U>(ts: Array<T>, us: Array<U>): Array<[T, U]> {
    if (ts.length !== us.length) {
        throw new E000_InternalError(
            `Precondition failed: unequal lengths ${ts.length} ` +
            `and ${us.length}`
        );
    }
    let result: Array<[T, U]> = [];
    for (let i = 0; i < ts.length; i++) {
        result.push([ts[i], us[i]]);
    }
    return result;
}

export function callMacro(
    macroValue: MacroValue,
    argValues: Array<Value>,
    staticEnv: Env,
    staticEnvs: Map<SyntaxNode, Env>,
): Value {
    if (argValues.length > macroValue.parameters.length) {
        throw new E611_TooManyArgumentsError();
    }
    else if (argValues.length < macroValue.parameters.length) {
        throw new E612_NotEnoughArgumentsError();
    }

    let bodyEnv = extend(staticEnv);
    for (let [param, arg] of zip(macroValue.parameters, argValues)) {
        bindReadonly(bodyEnv, param, arg);
    }

    let frame = new Frame(null, {
        mode: Mode.Ignore,
        node: macroValue.body,
        quoteLevel: 0,
        env: bodyEnv,
    });

    while (true) {
        let result = step(frame, staticEnvs);
        if (result instanceof Frame) {
            frame = result;
        }
        else if (frame.tail) {
            frame = frame.tail;
            frame.value = result;
        }
        else {
            return result;
        }
    }
}

