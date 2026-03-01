import {
    E000_InternalError,
    E401_IncompatibleSyntaxError,
} from "./error";
import {
    Block,
    BlockStatement,
    BoolLitExpr,
    BoolNode,
    CallExpr,
    CompUnit,
    DoExpr,
    Expr,
    ForStatement,
    FuncDecl,
    IntLitExpr,
    IntNode,
    MacroDecl,
    NoneLitExpr,
    QuoteExpr,
    Statement,
    StrLitExpr,
    StrNode,
    SyntaxNode,
    VarRefExpr,
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
    staticEnvs: Map<CompUnit | Block, Env>,
): void {
    let staticEnv = envStack[envStack.length - 1];
    if (syntaxNode instanceof CompUnit || syntaxNode instanceof Block) {
        staticEnv = initializeEnv(extend(staticEnv), syntaxNode, staticEnvs);
        staticEnvs.set(syntaxNode, staticEnv);
        envStack.push(staticEnv);
    }
    else if (syntaxNode instanceof ForStatement) {
        let name = syntaxNode.name.payload as string;
        staticEnv = extend(staticEnv);
        bindReadonly(staticEnv, name, new UninitValue());
        envStack.push(staticEnv);
    }
    else if (syntaxNode instanceof FuncDecl
                || syntaxNode instanceof MacroDecl) {
        staticEnv = extend(staticEnv);
        for (let param of syntaxNode.parameterList.parameters) {
            let name = param.name.payload as string;
            bindReadonly(staticEnv, name, new UninitValue());
        }
        envStack.push(staticEnv);
    }
}

function visitUp(syntaxNode: SyntaxNode, envStack: Array<Env>): void {
    if (syntaxNode instanceof CompUnit || syntaxNode instanceof Block
            || syntaxNode instanceof ForStatement
            || syntaxNode instanceof FuncDecl
            || syntaxNode instanceof MacroDecl) {
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
    staticEnvs: Map<CompUnit | Block, Env>,
): SyntaxNode {
    if (syntaxNode instanceof QuoteExpr) {
        return syntaxNode;
    }

    visitDown(syntaxNode, envStack, staticEnvs);

    let newChildren: Array<SyntaxNode | null> = [];
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
        let newSyntaxNode = Object.assign(
            Object.create(Object.getPrototypeOf(syntaxNode)),
            { children: newChildren },
        );
        if (syntaxNode instanceof CompUnit || syntaxNode instanceof Block) {
            let env: Env;
            if (env = staticEnvs.get(syntaxNode)!) {
                staticEnvs.set(newSyntaxNode, env);
            }
        }
        return newSyntaxNode;
    }
}

function traverseWithReplacement(
    compUnit: CompUnit,
    staticEnvs: Map<CompUnit | Block, Env>,
    visit: VisitFn,
): CompUnit {
    let staticEnv = emptyEnv();
    return traverseNode(compUnit, visit, [staticEnv], staticEnvs) as CompUnit;
}

export function macroExpandCompUnit(
    compUnit: CompUnit,
    staticEnvs: Map<CompUnit | Block, Env>,
): CompUnit {
    return traverseWithReplacement(
        compUnit,
        staticEnvs,
        function visit(
            syntaxNode: SyntaxNode,
            staticEnv: Env,
            replaceWith: ReplaceFn,
        ) {
            if (syntaxNode instanceof CallExpr) {
                let funcExpr = syntaxNode.funcExpr;
                let argExprs = syntaxNode.argList.args.map((arg) => arg.expr);
                if (funcExpr instanceof VarRefExpr) {
                    let name = funcExpr.name.payload as string;
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
                            replaceWith(new NoneLitExpr());
                        }
                        else if (resultValue instanceof IntValue) {
                            let intNode = new IntNode(resultValue.payload);
                            replaceWith(new IntLitExpr(intNode));
                        }
                        else if (resultValue instanceof StrValue) {
                            let strNode = new StrNode(resultValue.payload);
                            replaceWith(new StrLitExpr(strNode));
                        }
                        else if (resultValue instanceof BoolValue) {
                            let boolNode = new BoolNode(resultValue.payload);
                            replaceWith(new BoolLitExpr(boolNode));
                        }
                        else if (resultValue instanceof SyntaxNodeValue) {
                            let result = absorbNode(resultValue);
                            if (result === null) {
                                // this case is impossible, but the signature
                                // of `absorbNode` forces us to handle it
                                replaceWith(new NoneLitExpr());
                            }
                            else if (result instanceof Expr) {
                                replaceWith(result);
                            }
                            else if (result instanceof Statement) {
                                let doExpr = new DoExpr(result);
                                replaceWith(doExpr);
                            }
                            else if (result instanceof Block) {
                                let blockStatement
                                    = new BlockStatement(result);
                                let doExpr = new DoExpr(blockStatement);
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
                            throw new E000_InternalError(
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

