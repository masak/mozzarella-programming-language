// The evaluator
//
// Can be described as a CEKJ machine. The CEK part is standard: code,
// environment, kontinuation with a "k". The J part contains a table of _jump
// targets_, making `next`/`last`/`return` work.
import {
    argumentExpr,
    argumentListArguments,
    arrayInitializerExprElements,
    blockStatementBlock,
    blockStatements,
    boolLitExprValue,
    callExprArgumentList,
    callExprFuncExpr,
    compUnitStatements,
    doExprStatement,
    exprStatementExpr,
    forStatementArrayExpr,
    forStatementBody,
    forStatementName,
    funcDeclBody,
    funcDeclName,
    funcDeclParameterList,
    ifClauseBlock,
    ifClauseCondExpr,
    ifClauseListClauses,
    ifStatementClauseList,
    ifStatementElseBlock,
    indexingExprArrayExpr,
    indexingExprIndexExpr,
    infixOpExprOpName,
    intLitExprValue,
    isBlock,
    isEmptyPlaceholder,
    isExprStatement,
    isFuncDecl,
    isMacroDecl,
    isQuoteExpr,
    isStatement,
    isUnquoteExpr,
    isVarDecl,
    macroDeclBody,
    macroDeclName,
    macroDeclParameterList,
    parameterListParameters,
    parameterName,
    parenExprInnerExpr,
    prefixOpExprOpName,
    quoteExprStatements,
    returnStatementExpr,
    strLitExprValue,
    SyntaxNode,
    SyntaxKind,
    unquoteExprInnerExpr,
    varDeclInitExpr,
    varDeclName,
    varRefExprName,
    whileStatementBody,
    whileStatementCondExpr,
} from "../compiler/syntax";
import {
    boolify,
} from "./boolify";
import {
    ArrayElementCell,
    Cell,
    VarCell,
} from "./cell";
import {
    bindMutable,
    bindReadonly,
    findEnvOfName,
    lookup,
    emptyEnv,
    Env,
    extend,
} from "./env";
import {
    E000_InternalError,
    E500_OutOfFuel,
    E603_TypeError,
    E604_IndexError,
    E607_CannotAssignError,
    E608_ReadonlyError,
    E609_LastOutsideLoopError,
    E610_NextOutsideLoopError,
    E611_TooManyArgumentsError,
    E612_NotEnoughArgumentsError,
    E613_ReturnOutsideRoutineError,
    E614_MacroAtRuntimeError,
} from "./error";
import {
    assertNotAssignable,
    cloneJumpMap,
    Frame,
    JumpMap,
    makeRootFrame,
    Mode,
    recurse,
    tailRecurse,
} from "./frame";
import {
    infixOpMap,
} from "./infix";
import {
    prefixOpMap,
} from "./prefix";
import {
    isExprKind,
    isStatementKind,
    kindAndPayloadOfNode,
} from "./reify";
import {
    ArrayValue,
    BoolValue,
    FuncValue,
    IntValue,
    MacroValue,
    NoneValue,
    StrValue,
    SYNTAX_KIND__BLOCK,
    SYNTAX_KIND__BOOL_LIT_EXPR,
    SYNTAX_KIND__BOOL_NODE,
    SYNTAX_KIND__DO_EXPR,
    SYNTAX_KIND__INT_LIT_EXPR,
    SYNTAX_KIND__INT_NODE,
    SYNTAX_KIND__NONE_LIT_EXPR,
    SYNTAX_KIND__STR_LIT_EXPR,
    SYNTAX_KIND__STR_NODE,
    SyntaxNodeValue,
    UninitValue,
    Value,
} from "./value";

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

function load(
    compUnit: SyntaxNode,
    staticEnvs: Map<SyntaxNode, Env>,
    rootFrame: Frame,
): Frame {
    let env = initializeEnv(emptyEnv(), compUnit, staticEnvs);
    let jumpMap = new JumpMap();
    return new Frame(
        null,
        { node: compUnit, env, staticEnvs, jumpMap, tail: rootFrame },
    );
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

type Handler = (frame: Frame) => Frame | Value | Cell;
let handlerMap = new Map<SyntaxKind, Handler>();

handlerMap.set(SyntaxKind.COMPUNIT, (frame) => {
    // assertNotAssignable();
    // let statements = compUnitStatements(node);
    // let lastIndex = statements.length - 1;
    // for (let index = 0; index < statements.length; index++) {    // [0]
    //     let statement = statements[index];
    //     if (index === lastIndex) {
    //         return eval(statement);
    //     }
    //     else {
    //         eval(statement);
    //     }
    // }
    // return new NoneValue();

    assertNotAssignable(frame);
    let statements = compUnitStatements(frame.node);
    let lastIndex = statements.length - 1;
    if (frame.index < statements.length) {
        let statement = statements[frame.index];
        if (frame.index === lastIndex) {
            return tailRecurse(frame, { node: statement });
        }
        else {
            frame.index++;
            return recurse(frame, 0, { node: statement });
        }
    }
    else {
        return new NoneValue();
    }
});

handlerMap.set(SyntaxKind.BLOCK, (frame) => {
    // env = initializeEnv(extend(env), node, staticEnvs)           // [0]
    // let statements = compUnitStatements(node);
    // let lastIndex = statements.length - 1;
    // for (let index = 0; index < statements.length; index++) {    // [1]
    //     let statement = statements[index];
    //     if (index === lastIndex) {
    //         return eval(statement);
    //     }
    //     else {
    //         eval(statement);
    //     }
    // }
    // if (mode === Mode.GetCell) {
    //     throw new E607_CannotAssignError(
    //         "Cannot assign to empty block"
    //     );
    // }
    // return new NoneValue();

    let statements = blockStatements(frame.node);
    let lastIndex = statements.length - 1;
    switch (frame.state) {
        case 0: {
            let env = initializeEnv(
                extend(frame.env),
                frame.node,
                frame.staticEnvs,
            );
            return new Frame(
                frame,
                {
                    state: 1,
                    env,
                    staticEnvs: frame.staticEnvs,
                }
            );
        }
        case 1: {
            if (frame.index < statements.length) {
                let statement = statements[frame.index];
                if (frame.index === lastIndex) {
                    return tailRecurse(
                        frame,
                        { node: statement, mode: frame.mode },
                    );
                }
                else {
                    frame.index++;
                    return recurse(frame, 1, { node: statement });
                }
            }
            else {
                if (frame.mode === Mode.GetCell) {
                    throw new E607_CannotAssignError(
                        "Cannot assign to empty block"
                    );
                }
                return new NoneValue();
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.EXPR_STATEMENT, (frame) => {
    let expr = exprStatementExpr(frame.node);
    return tailRecurse(frame, { node: expr, mode: frame.mode });
});

handlerMap.set(SyntaxKind.EMPTY_STATEMENT, (frame) => {
    return new NoneValue();
});

handlerMap.set(SyntaxKind.BLOCK_STATEMENT, (frame) => {
    let block = blockStatementBlock(frame.node);
    return tailRecurse(frame, { node: block, mode: frame.mode });
});

handlerMap.set(SyntaxKind.IF_STATEMENT, (frame) => {
    // let clauses = ifClauseListClauses(ifStatementClauseList(node));
    // for (let index = 0; index < clauses.length; index++) {       // [0]
    //     let condExpr = ifClauseCondExpr(clauses[index]);
    //     let cond = eval(condExpr);
    //     if (boolify(cond)) {                                     // [1]
    //         let block = ifClauseBlock(clauses[index]);
    //         return eval(block);
    //     }
    // }
    // let elseBlock = ifStatementElseBlock(node);
    // if (isBlock(elseBlock)) {
    //     return eval(elseBlock);
    // }
    // assertNotAssignable();
    // return new NoneValue();

    let clauses = ifClauseListClauses(ifStatementClauseList(frame.node));
    switch (frame.state) {
        case 0: {
            if (frame.index < clauses.length) {
                let condExpr = ifClauseCondExpr(clauses[frame.index]);
                return recurse(frame, 1, { node: condExpr });
            }
            else {
                let elseBlock = ifStatementElseBlock(frame.node);
                if (isBlock(elseBlock)) {
                    return tailRecurse(
                        frame,
                        { node: elseBlock, mode: frame.mode },
                    );
                }
                assertNotAssignable(frame);
                return new NoneValue();
            }
        }
        case 1: {
            let cond = frame.value;
            if (boolify(cond)) {
                let block = ifClauseBlock(clauses[frame.index]);
                return tailRecurse(
                    frame,
                    { node: block, mode: frame.mode },
                );
            }
            return new Frame(frame, { state: 0, index: frame.index + 1 });
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.FOR_STATEMENT, (frame) => {
    // assertNotAssignable();
    // env = extend(env);                                           // [0]
    // let name = forStatementName(node).payload as string;
    // bindReadonly(env, name, new UninitValue());
    // let arrayExpr = forStatementArrayExpr(node);
    // let arrayValue = eval(arrayExpr);                            // [1]
    // if (!(arrayValue instanceof ArrayValue)) {
    //     throw new E603_TypeError("Type error: not an array");
    // }
    // let body = forStatementBody(node);
    // for (let index = 0; index < arrayValue.elements.length; index++) {
    //                                                              // [2]
    //     let bodyEnv = extend(kont.env);
    //     let element = arrayValue.elements[0];
    //     bindReadonly(bodyEnv, kont.name, element);
    //     // (set up jumpMap stuff)
    //     eval(body, bodyEnv);                                     // [3]
    // }
    // return new NoneValue();

    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let env = extend(frame.env);
            let name = forStatementName(frame.node).payload as string;
            bindReadonly(env, name, new UninitValue());
            let arrayExpr = forStatementArrayExpr(frame.node);
            return recurse(frame, 1, { node: arrayExpr, env });
        }
        case 1: {
            if (!(frame.value instanceof ArrayValue)) {
                throw new E603_TypeError("Type error: not an array");
            }
            frame.v1 = frame.value;
            return new Frame(frame, { state: 2 });
        }
        case 2: {
            let arrayValue = frame.v1 as ArrayValue;
            if (frame.index < arrayValue.elements.length) {
                let bodyEnv = extend(frame.env);
                let name = forStatementName(frame.node).payload as string;
                let element = arrayValue.elements[frame.index];
                bindReadonly(bodyEnv, name, element);
                let jumpMap = cloneJumpMap(frame.jumpMap);
                jumpMap.lastTarget = frame.tail;
                jumpMap.nextTarget = new Frame(frame, { state: 3 });
                let body = forStatementBody(frame.node);
                return recurse(
                    frame,
                    3,
                    { node: body, env: bodyEnv, jumpMap },
                );
            }
            else {
                return new NoneValue();
            }
        }
        case 3: {
            return new Frame(frame, { state: 2, index: frame.index + 1 });
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.WHILE_STATEMENT, (frame) => {
    // let condExpr = whileStatementCondExpr(node);                 // [0]
    // let body = whileStatementBody(node);
    // let cond = eval(condExpr);
    // while (boolify(cond)) {                                      // [1]
    //     // (set up jumpMap stuff)
    //     eval(body);
    //     cond = eval(condExpr);
    // }
    // return new NoneValue();

    let condExpr = whileStatementCondExpr(frame.node);
    let body = whileStatementBody(frame.node);
    switch (frame.state) {
        case 0: {
            return recurse(frame, 1, { node: condExpr });
        }
        case 1: {
            let cond = frame.value;
            if (boolify(cond)) {
                let jumpMap = cloneJumpMap(frame.jumpMap);
                jumpMap.lastTarget = frame.tail;
                jumpMap.nextTarget = new Frame(frame, { state: 0 });
                return recurse(frame, 0, { node: body, jumpMap });
            }
            else {
                return new NoneValue();
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.LAST_STATEMENT, (frame) => {
    let lastTarget = frame.jumpMap.lastTarget;
    if (lastTarget === null) {
        throw new E609_LastOutsideLoopError("'last' outside of loop");
    }
    else {
        return lastTarget;
    }
});

handlerMap.set(SyntaxKind.NEXT_STATEMENT, (frame) => {
    let nextTarget = frame.jumpMap.nextTarget;
    if (nextTarget === null) {
        throw new E610_NextOutsideLoopError("'next' outside of loop");
    }
    else {
        return nextTarget;
    }
});

handlerMap.set(SyntaxKind.RETURN_STATEMENT, (frame) => {
    // let expr = returnStatementExpr(node);                        // [0]
    // let value;
    // if (isEmptyPlaceholder(expr)) {
    //     value = new NoneValue();
    // }
    // else {
    //     value = eval(expr);
    // }
    // (jump to jumpMap.returnTarget with value)                    // [1]

    let expr = returnStatementExpr(frame.node);
    switch (frame.state) {
        case 0: {
            if (isEmptyPlaceholder(expr)) {
                frame.value = new NoneValue();
                return new Frame(frame, { state: 1 });
            }
            else {
                return recurse(frame, 1, { node: expr });
            }
        }
        case 1: {
            let value = frame.value;
            let returnTarget = frame.jumpMap.returnTarget;
            if (returnTarget === null) {
                throw new E613_ReturnOutsideRoutineError(
                    "'return' outside of routine"
                );
            }
            else {
                returnTarget.value = value;
                return returnTarget;
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.VAR_DECL, (frame) => {
    // assertNotAssignable();
    // let initExpr = varDeclInitExpr(node);                        // [0]
    // if (isEmptyPlaceholder(initExpr)) {
    //     return new NoneValue();
    // }
    // else {
    //     let value = eval(initExpr);
    //     let name = varDeclName(node).payload as string;          // [1]
    //     bindMutable(env, name, value);
    //     return new NoneValue();
    // }

    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let initExpr = varDeclInitExpr(frame.node);
            if (isEmptyPlaceholder(initExpr)) {
                return new NoneValue();
            }
            else {
                return recurse(frame, 1, { node: initExpr });
            }
        }
        case 1: {
            let value = frame.value;
            let name = varDeclName(frame.node).payload as string;
            bindMutable(frame.env, name, value);
            return new NoneValue();
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.FUNC_DECL, (frame) => {
    assertNotAssignable(frame);
    return new NoneValue();
});

handlerMap.set(SyntaxKind.MACRO_DECL, (frame) => {
    assertNotAssignable(frame);
    return new NoneValue();
});

handlerMap.set(SyntaxKind.PREFIX_OP_EXPR, (frame) => {
    assertNotAssignable(frame);
    let opName = prefixOpExprOpName(frame.node).payload as string;
    let handler = prefixOpMap.get(opName);
    if (handler === undefined) {
        throw new E000_InternalError(
            `Missing handler for prefix op '${opName}'`
        );
    }
    return handler(frame);
});

handlerMap.set(SyntaxKind.INFIX_OP_EXPR, (frame) => {
    let opName = infixOpExprOpName(frame.node).payload as string;
    let handler = infixOpMap.get(opName);
    if (handler === undefined) {
        throw new E000_InternalError(
            `Missing handler for infix op '${opName}'`
        );
    }
    return handler(frame);
});

handlerMap.set(SyntaxKind.INDEXING_EXPR, (frame) => {
    // let arrayExpr = indexingExprArrayExpr(node);                 // [0]
    // let array = eval(arrayExpr);
    // if (!(array instanceof ArrayValue)) {                        // [1]
    //     throw new E603_TypeError("Can only index an Array");
    // }
    // let indexExpr = indexingExprIndexExpr(node);
    // let index = eval(indexExpr);
    // if (!(index instanceof IntValue)) {                          // [2]
    //     throw new E603_TypeError("Can only index using an Int");
    // }
    // if (index.payload < 0 || index.payload >= array.elements.length) {
    //     throw new E604_IndexError("Index out of bounds");
    // }
    // if (mode === Mode.GetValue) {
    //     return array.elements[Number(index.payload)];
    // }
    // else if (mode === Mode.GetCell) {
    //     return new ArrayElementCell(array, Number(index.payload));
    // }
    // else {
    //     throw new E000_InternalError("Unknown mode in indexingExpr");
    // }

    switch (frame.state) {
        case 0: {
            let arrayExpr = indexingExprArrayExpr(frame.node);
            return recurse(frame, 1, { node: arrayExpr });
        }
        case 1: {
            let array = frame.value;
            if (!(array instanceof ArrayValue)) {
                throw new E603_TypeError("Can only index an Array");
            }
            frame.v1 = array;
            let indexExpr = indexingExprIndexExpr(frame.node);
            return recurse(frame, 2, { node: indexExpr });
        }
        case 2: {
            let array = frame.v1 as ArrayValue;
            let index = frame.value;
            if (!(index instanceof IntValue)) {
                throw new E603_TypeError("Can only index using an Int");
            }
            if (index.payload < 0 || index.payload >= array.elements.length) {
                throw new E604_IndexError("Index out of bounds");
            }
            if (frame.mode === Mode.GetValue) {
                return array.elements[Number(index.payload)];
            }
            else if (frame.mode === Mode.GetCell) {
                return new ArrayElementCell(array, Number(index.payload));
            }
            else {  // Mode.Ignore
                return new NoneValue();
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.CALL_EXPR, (frame) => {
    // let funcExpr = callExprFuncExpr(node);
    // let args = argumentListArguments(callExprArgumentList(node));
    // let funcValue = eval(funcExpr);                              // [1]
    // if (funcValue instanceof MacroValue) {
    //     throw new E614_MacroAtRuntimeError();
    // }
    // if (!(funcValue instanceof FuncValue)) {
    //     throw new E603_TypeError("Not callable: not a function");
    // }
    // if (args.length > funcValue.parameters.length) {
    //     throw new E611_TooManyArgumentsError();
    // }
    // else if (args.length < funcValue.parameters.length) {
    //     throw new E612_NotEnoughArgumentsError();
    // }
    // let argValues
    //     = Array.from({ length: args.length }, () => new UninitValue());
    // for (let index = 0; index < args.length; index++) {          // [2]
    //     let argExpr = argumentExpr(args[index]);
    //     let argValue = eval(argExpr);
    //     argValues[index] = argValue;                             // [3]
    // }
    // // (set up jumpMap stuff)
    // let bodyEnv = extend(kont.funcValue.outerEnv);
    // for (let [param, arg] of zip(funcValue.parameters, argValues)) {
    //     bindReadonly(bodyEnv, param, arg);
    // }
    // return eval(funcValue.body, bodyEnv);

    let funcExpr = callExprFuncExpr(frame.node);
    let args = argumentListArguments(callExprArgumentList(frame.node));
    switch (frame.state) {
        case 0: {
            return recurse(frame, 1, { node: funcExpr });
        }
        case 1: {
            let funcValue = frame.value;
            if (funcValue instanceof MacroValue) {
                throw new E614_MacroAtRuntimeError();
            }
            if (!(funcValue instanceof FuncValue)) {
                throw new E603_TypeError("Not callable: not a function");
            }
            if (args.length > funcValue.parameters.length) {
                throw new E611_TooManyArgumentsError();
            }
            else if (args.length < funcValue.parameters.length) {
                throw new E612_NotEnoughArgumentsError();
            }
            frame.v1 = funcValue;
            frame.vv
                = Array.from({ length: args.length }, () => new UninitValue());
            return new Frame(frame, { state: 2 });
        }
        case 2: {
            if (frame.index < args.length) {
                let argExpr = argumentExpr(args[frame.index]);
                return recurse(frame, 3, { node: argExpr });
            }
            else {
                let jumpMap = cloneJumpMap(frame.jumpMap);
                jumpMap.returnTarget = frame.tail;
                jumpMap.lastTarget = null;
                jumpMap.nextTarget = null;
                let funcValue = frame.v1 as FuncValue;
                let argValues = frame.vv;
                let bodyEnv = extend(funcValue.outerEnv);
                for (let [param, arg] of
                     zip(funcValue.parameters, argValues)) {
                    bindReadonly(bodyEnv, param, arg);
                }
                return tailRecurse(
                    frame,
                    {
                        node: funcValue.body,
                        mode: Mode.Ignore,
                        env: bodyEnv,
                        jumpMap,
                    },
                );
            }
        }
        case 3: {
            let argValue = frame.value;
            frame.vv[frame.index] = argValue;
            return new Frame(frame, { state: 2, index: frame.index + 1 });
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.INT_LIT_EXPR, (frame) => {
    assertNotAssignable(frame);
    let payload = intLitExprValue(frame.node).payload as bigint;
    return frame.mode === Mode.Ignore
        ? new NoneValue()
        : new IntValue(payload);
});

handlerMap.set(SyntaxKind.STR_LIT_EXPR, (frame) => {
    assertNotAssignable(frame);
    let payload = strLitExprValue(frame.node).payload as string;
    return frame.mode === Mode.Ignore
        ? new NoneValue()
        : new StrValue(payload);
});

handlerMap.set(SyntaxKind.BOOL_LIT_EXPR, (frame) => {
    assertNotAssignable(frame);
    let payload = boolLitExprValue(frame.node).payload as boolean;
    return frame.mode === Mode.Ignore
        ? new NoneValue()
        : new BoolValue(payload);
});

handlerMap.set(SyntaxKind.NONE_LIT_EXPR, (frame) => {
    assertNotAssignable(frame);
    return new NoneValue();
});

handlerMap.set(SyntaxKind.PAREN_EXPR, (frame) => {
    let innerExpr = parenExprInnerExpr(frame.node);
    return tailRecurse(frame, { node: innerExpr, mode: frame.mode });
});

handlerMap.set(SyntaxKind.DO_EXPR, (frame) => {
    let statement = doExprStatement(frame.node);
    return tailRecurse(frame, { node: statement, mode: frame.mode });
});

handlerMap.set(SyntaxKind.ARRAY_INITIALIZER_EXPR, (frame) => {
    // assertNotAssignable();
    // let elements = arrayInitializerExprElements(node);
    // let elemValues = [];
    // for (let index = 0; index < elements.length; index++) {      // [0]
    //     let value = eval(elements[index]);
    //     elemValues[index] = value;                               // [1]
    // }
    // return new ArrayValue(elemValues);

    assertNotAssignable(frame);
    let elements = arrayInitializerExprElements(frame.node);
    switch (frame.state) {
        case 0: {
            if (frame.index < elements.length) {
                return recurse(frame, 1, { node: elements[frame.index] });
            }
            else {
                return frame.mode === Mode.Ignore
                    ? new NoneValue()
                    : new ArrayValue(frame.vv);
            }
        }
        case 1: {
            frame.vv[frame.index] = frame.value;
            return new Frame(frame, { state: 0, index: frame.index + 1 });
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.VAR_REF_EXPR, (frame) => {
    let name = varRefExprName(frame.node).payload as string;
    if (frame.mode === Mode.GetValue) {
        let value = lookup(frame.env, name);
        return value;
    }
    else if (frame.mode === Mode.GetCell) {
        let [mutable, varEnv] = findEnvOfName(frame.env, name);
        if (!mutable) {
            throw new E608_ReadonlyError(`Binding '${name}' is readonly`);
        }
        return new VarCell(varEnv, name);
    }
    else {  // Mode.Ignore
        /* ignore */ lookup(frame.env, name);
        return new NoneValue();
    }
});

handlerMap.set(SyntaxKind.QUOTE_EXPR, (frame) => {
    // assertNotAssignable(frame);
    // let statements = quoteExprStatements(node);
    // let statementValues: Array<Value> = [];
    // for (let index = 0; index < statements.length; index++) {    // [0]
    //     statementValues[index] = interpolate(statement);         // [1]
    // }
    //
    // if (statements.length === 1 && isExprStatement(statements[0])) {
    //     return statementValues[0].children[0] as SyntaxNodeValue;
    // }
    // else if (statements.length === 1 && isStatement(statements[0])) {
    //     return statementValues[0] as SyntaxNodeValue;
    // }
    // else {
    //     return new SyntaxNodeValue(
    //         new IntValue(SYNTAX_KIND__BLOCK),
    //         statementValues,
    //         new NoneValue(),
    //     );
    // }
    //
    // function interpolate(node): SyntaxNodeValue {
    //     let childValues: Array<SyntaxNodeValue> = [];
    //     for (let childNode of node.children) {
    //         childValues.push(interpolate(childNode));
    //     }
    //
    //     let [kind, payload] = kindAndPayloadOfNode(node);
    //     return new SyntaxNodeValue(kind, childValues, payload);
    // }

    assertNotAssignable(frame);
    let statements = quoteExprStatements(frame.node);
    switch (frame.state) {
        case 0: {
            if (frame.index < statements.length) {
                return recurse(
                    frame,
                    1,
                    {
                        node: frame.node,
                        state: 2,
                        nn: [statements[frame.index]],
                        quoteLevel: 1,
                    },
                );
            }
            else {
                if (frame.mode === Mode.Ignore) {
                    return new NoneValue();
                }
                else if (statements.length === 1
                    && isExprStatement(statements[0])) {
                    return (frame.vv[0] as SyntaxNodeValue).children[0];
                }
                else if (statements.length === 1
                         && isStatement(statements[0])) {
                    return frame.vv[0];
                }
                else {
                    return new SyntaxNodeValue(
                        new IntValue(SYNTAX_KIND__BLOCK),
                        frame.vv as Array<SyntaxNodeValue>,
                        new NoneValue(),
                    );
                }
            }
        }
        case 1: {
            frame.vv[frame.index] = frame.value;
            return new Frame(frame, { state: 0, index: frame.index + 1 });
        }
        case 2: {
            let subNode = frame.nn[0];
            if (isUnquoteExpr(subNode) && frame.quoteLevel < 1) {
                throw new E000_InternalError(
                    "Precondition failed: Quote level too low"
                );
            }
            else if (isUnquoteExpr(subNode) && frame.quoteLevel === 1) {
                return recurse(
                    frame,
                    4,
                    { node: unquoteExprInnerExpr(subNode) },
                );
            }
            else {  // either UnquoteExpr at quoteLevel > 1, or any other node
                let quoteLevel = isQuoteExpr(subNode)
                    ? frame.quoteLevel + 1
                    : isUnquoteExpr(subNode)
                        ? frame.quoteLevel - 1
                        : frame.quoteLevel;
                if (frame.index < subNode.children.length) {
                    return recurse(
                        frame,
                        3,
                        {
                            node: frame.node,
                            state: 2,
                            nn: [subNode.children[frame.index]],
                            quoteLevel,
                        },
                    );
                }
                else {
                    let [kind, payload] = kindAndPayloadOfNode(subNode);
                    return new SyntaxNodeValue(
                        kind,
                        frame.vv as Array<SyntaxNodeValue>,
                        payload,
                    );
                }
            }
        }
        case 3: {
            frame.vv[frame.index] = frame.value;
            return new Frame(frame, { state: 2, index: frame.index + 1 });
        }
        case 4: {
            let value = frame.value;
            if (value instanceof IntValue) {
                return new SyntaxNodeValue(
                    new IntValue(SYNTAX_KIND__INT_LIT_EXPR),
                    [new SyntaxNodeValue(
                        new IntValue(SYNTAX_KIND__INT_NODE),
                        [],
                        value,
                    )],
                    new NoneValue(),
                );
            }
            else if (value instanceof StrValue) {
                return new SyntaxNodeValue(
                    new IntValue(SYNTAX_KIND__STR_LIT_EXPR),
                    [new SyntaxNodeValue(
                        new IntValue(SYNTAX_KIND__STR_NODE),
                        [],
                        value,
                    )],
                    new NoneValue(),
                );
            }
            else if (value instanceof BoolValue) {
                if (value.payload) {
                    return new SyntaxNodeValue(
                        new IntValue(SYNTAX_KIND__BOOL_LIT_EXPR),
                        [new SyntaxNodeValue(
                            new IntValue(SYNTAX_KIND__BOOL_NODE),
                            [],
                            value,
                        )],
                        new NoneValue(),
                    );
                }
                else {
                    return new SyntaxNodeValue(
                        new IntValue(SYNTAX_KIND__BOOL_LIT_EXPR),
                        [new SyntaxNodeValue(
                            new IntValue(SYNTAX_KIND__BOOL_NODE),
                            [],
                            value,
                        )],
                        new NoneValue(),
                    );
                }
            }
            else if (value instanceof NoneValue) {
                return new SyntaxNodeValue(
                    new IntValue(SYNTAX_KIND__NONE_LIT_EXPR),
                    [],
                    value,
                );
            }
            else if (value instanceof SyntaxNodeValue) {
                if (isExprKind(value)) {
                    return value;
                }
                else if (isStatementKind(value)) {
                    return new SyntaxNodeValue(
                        new IntValue(SYNTAX_KIND__DO_EXPR),
                        [value],
                        new NoneValue(),
                    );
                }
                else {
                    throw new E603_TypeError(
                        "Unknown syntax node kind in quote interpolation"
                    );
                }
            }
            else {
                throw new E603_TypeError(
                    "Unknown syntax node kind in quote interpolation"
                );
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

handlerMap.set(SyntaxKind.UNQUOTE_EXPR, (frame) => {
    throw new E000_InternalError(
        "Precondition failed: evaluating UnquoteExpr"
    );
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

function run(
    frame: Frame,
    staticEnvs: Map<SyntaxNode, Env>,
    rootFrame: Frame,
    fuel: number = Infinity,
): Value {
    while (true) {
        let result = step(frame, staticEnvs);
        if (result instanceof Frame) {
            if (result === rootFrame) {
                return result.value;
            }
            frame = result;
        }
        else if (result instanceof Cell) {
            frame = frame.tail!;
            frame.cell = result;
        }
        else if (frame.tail !== rootFrame) {
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

export function runCompUnit(
    compUnit: SyntaxNode,
    staticEnvs: Map<SyntaxNode, Env>,
): Value {
    let rootFrame = makeRootFrame();
    let frame = load(compUnit, staticEnvs, rootFrame);
    return run(frame, staticEnvs, rootFrame);
}

export function runCompUnitWithFuel(
    compUnit: SyntaxNode,
    fuel: number,
    staticEnvs: Map<SyntaxNode, Env>,
): Value {
    let rootFrame = makeRootFrame();
    let frame = load(compUnit, staticEnvs, rootFrame);
    return run(frame, staticEnvs, rootFrame, fuel);
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

    let rootFrame = makeRootFrame();

    let jumpMap = new JumpMap();
    jumpMap.returnTarget = rootFrame;
    jumpMap.lastTarget = null;
    jumpMap.nextTarget = null;

    let frame = new Frame(null, {
        mode: Mode.Ignore,
        node: macroValue.body,
        quoteLevel: 0,
        env: bodyEnv,
        staticEnvs,
        jumpMap,
        tail: rootFrame,
    });
    return run(frame, staticEnvs, rootFrame);
}

