import {
    E000_InternalError,
    E401_IncompatibleSyntaxError,
} from "./error";
import {
    argumentExpr,
    argumentListArguments,
    callExprArgumentList,
    callExprFuncExpr,
    forStatementName,
    funcDeclParameterList,
    isBlock,
    isCallExpr,
    isCompUnit,
    isExpr,
    isForStatement,
    isFuncDecl,
    isMacroDecl,
    isQuoteExpr,
    isStatement,
    isVarRefExpr,
    macroDeclParameterList,
    makeBlockStatement,
    makeBoolLitExpr,
    makeBoolNode,
    makeDoExpr,
    makeIntLitExpr,
    makeIntNode,
    makeNoneLitExpr,
    makeStrLitExpr,
    makeStrNode,
    parameterListParameters,
    parameterName,
    SyntaxNode,
    varRefExprName,
} from "./syntax";
import {
    absorbNode,
} from "../runtime/absorb";
import {
    bindReadonly,
    emptyEnv,
    Env,
    extend,
    tolerantLookup,
} from "../runtime/env";
import {
    callMacro,
    initializeEnv,
} from "../runtime/evaluate";
import {
    reifyNode,
} from "../runtime/reify";
import {
    BoolValue,
    IntValue,
    MacroValue,
    NoneValue,
    StrValue,
    SyntaxNodeValue,
    UninitValue,
} from "../runtime/value";

function visitDown(
    syntaxNode: SyntaxNode,
    envStack: Array<Env>,
    staticEnvs: Map<SyntaxNode, Env>,
): void {
    let staticEnv = envStack[envStack.length - 1];
    if (isCompUnit(syntaxNode) || isBlock(syntaxNode)) {
        staticEnv = initializeEnv(extend(staticEnv), syntaxNode, staticEnvs);
        staticEnvs.set(syntaxNode, staticEnv);
        envStack.push(staticEnv);
    }
    else if (isForStatement(syntaxNode)) {
        let name = forStatementName(syntaxNode).payload as string;
        staticEnv = extend(staticEnv);
        bindReadonly(staticEnv, name, new UninitValue());
        envStack.push(staticEnv);
    }
    else if (isFuncDecl(syntaxNode)) {
        staticEnv = extend(staticEnv);
        let parameters = parameterListParameters(
            funcDeclParameterList(syntaxNode)
        );
        for (let param of parameters) {
            let name = parameterName(param).payload as string;
            bindReadonly(staticEnv, name, new UninitValue());
        }
        envStack.push(staticEnv);
    }
    else if (isMacroDecl(syntaxNode)) {
        staticEnv = extend(staticEnv);
        let parameters = parameterListParameters(
            macroDeclParameterList(syntaxNode)
        );
        for (let param of parameters) {
            let name = parameterName(param).payload as string;
            bindReadonly(staticEnv, name, new UninitValue());
        }
        envStack.push(staticEnv);
    }
}

function visitUp(syntaxNode: SyntaxNode, envStack: Array<Env>): void {
    if (isCompUnit(syntaxNode) || isBlock(syntaxNode)
            || isForStatement(syntaxNode) || isFuncDecl(syntaxNode)
            || isMacroDecl(syntaxNode)) {
        envStack.pop();
    }
}

function pairwise<T>(fn: (x: T, y: T) => boolean, xs: Array<T>, ys: Array<T>) {
    if (xs.length !== ys.length) {
        throw new E000_InternalError(
            "Precondition failed: lists are of unequal length"
        );
    }
    for (let i = 0; i < xs.length; i++) {
        if (!fn(xs[i], ys[i])) {
            return false;
        }
    }
    return true;
}

type ReplaceFn = (newNode: SyntaxNode) => void;

type VisitFn = (
    syntaxNode: SyntaxNode,
    staticEnv: Env,
    replaceWith: ReplaceFn,
) => void;

function traverseNode(
    syntaxNode: SyntaxNode,
    visit: VisitFn,
    envStack: Array<Env>,
    staticEnvs: Map<SyntaxNode, Env>,
): SyntaxNode {
    if (isQuoteExpr(syntaxNode)) {
        return syntaxNode;
    }

    visitDown(syntaxNode, envStack, staticEnvs);

    let newChildren: Array<SyntaxNode> = [];
    for (let child of syntaxNode.children) {
        if (child instanceof SyntaxNode) {
            let wasReplaced = false;
            let newChild = child;
            let staticEnv = envStack[envStack.length - 1];

            function replaceWith(node: SyntaxNode): void {
                newChild = node;
                wasReplaced = true;
            }

            visit(child, staticEnv, replaceWith);
            while (wasReplaced) {
                wasReplaced = false;
                visit(newChild, staticEnv, replaceWith);
            }

            newChild = traverseNode(newChild, visit, envStack, staticEnvs);
            newChildren.push(newChild);
        }
        else {
            newChildren.push(child);
        }
    }

    visitUp(syntaxNode, envStack);

    if (pairwise((o, n) => o === n, syntaxNode.children, newChildren)) {
        return syntaxNode;
    }
    else {  // something changed
        let newSyntaxNode = new SyntaxNode(syntaxNode.kind, newChildren, null);
        if (isCompUnit(syntaxNode) || isBlock(syntaxNode)) {
            let env: Env;
            if (env = staticEnvs.get(syntaxNode)!) {
                staticEnvs.set(newSyntaxNode, env);
            }
        }
        return newSyntaxNode;
    }
}

function traverseWithReplacement(
    compUnit: SyntaxNode,
    staticEnvs: Map<SyntaxNode, Env>,
    visit: VisitFn,
): SyntaxNode {
    let staticEnv = emptyEnv();
    return traverseNode(compUnit, visit, [staticEnv], staticEnvs);
}

export function macroExpandCompUnit(
    compUnit: SyntaxNode,
    staticEnvs: Map<SyntaxNode, Env>,
): SyntaxNode {
    return traverseWithReplacement(
        compUnit,
        staticEnvs,
        function visit(
            syntaxNode: SyntaxNode,
            staticEnv: Env,
            replaceWith: ReplaceFn,
        ) {
            if (isCallExpr(syntaxNode)) {
                let funcExpr = callExprFuncExpr(syntaxNode);
                let argExprs = argumentListArguments(
                    callExprArgumentList(syntaxNode)
                ).map(argumentExpr);
                if (isVarRefExpr(funcExpr)) {
                    let name = varRefExprName(funcExpr).payload as string;
                    let macroValue = tolerantLookup(staticEnv, name);
                    if (macroValue === null) {
                        // technically redundant, as the `instanceof` check
                        // below already excludes this
                        return;
                    }
                    if (macroValue instanceof MacroValue) {
                        let argValues = argExprs.map(reifyNode);
                        let resultValue = callMacro(
                            macroValue,
                            argValues,
                            staticEnv,
                            staticEnvs,
                        );
                        if (resultValue instanceof NoneValue) {
                            replaceWith(makeNoneLitExpr());
                        }
                        else if (resultValue instanceof IntValue) {
                            let intNode = makeIntNode(resultValue.payload);
                            replaceWith(makeIntLitExpr(intNode));
                        }
                        else if (resultValue instanceof StrValue) {
                            let strNode = makeStrNode(resultValue.payload);
                            replaceWith(makeStrLitExpr(strNode));
                        }
                        else if (resultValue instanceof BoolValue) {
                            let boolNode = makeBoolNode(resultValue.payload);
                            replaceWith(makeBoolLitExpr(boolNode));
                        }
                        else if (resultValue instanceof SyntaxNodeValue) {
                            let result = absorbNode(resultValue);
                            if (isExpr(result)) {
                                replaceWith(result);
                            }
                            else if (isStatement(result)) {
                                let doExpr = makeDoExpr(result);
                                replaceWith(doExpr);
                            }
                            else if (isBlock(result)) {
                                let blockStatement
                                    = makeBlockStatement(result);
                                let doExpr = makeDoExpr(blockStatement);
                                replaceWith(doExpr);
                            }
                            else {
                                throw new E401_IncompatibleSyntaxError(
                                    "Cannot expand node type: " +
                                        result.constructor.name
                                );
                            }
                        }
                        else {
                            throw new E401_IncompatibleSyntaxError(
                                "Unexpected macro result type " +
                                    resultValue.constructor.name
                            );
                        }
                    }
                }
            }
        },
    );
}

