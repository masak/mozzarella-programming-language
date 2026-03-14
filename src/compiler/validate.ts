import {
    E301_RedeclarationError,
    E302_UseBeforeDeclarationError,
    E303_UnquoteOutsideQuoteError,
} from "./error";
import {
    funcDeclName,
    isBlock,
    isFuncDecl,
    isMacroDecl,
    isQuoteExpr,
    isUnquoteExpr,
    isVarDecl,
    isVarRefExpr,
    macroDeclName,
    SyntaxNode,
    varDeclName,
    varRefExprName,
} from "./syntax";

class VarState {
    static declared = new VarState();
    static accessed = new VarState();
}

type Context = Map<string, VarState>;

function visitDown(
    syntaxNode: SyntaxNode,
    contextStack: Array<Context>,
): void {
    if (isVarRefExpr(syntaxNode)) {
        let name = varRefExprName(syntaxNode).payload as string;
        for (let i = contextStack.length - 1; i >= 0; i--) {
            let context = contextStack[i];
            if (context.has(name)) {
                break;
            }
            else {
                context.set(name, VarState.accessed);
            }
        }
    }
    else if (isBlock(syntaxNode)) {
        contextStack.push(new Map());
    }
    else if (isVarDecl(syntaxNode)) {
        let name = varDeclName(syntaxNode).payload as string;
        let context = contextStack[contextStack.length - 1];
        if (context.get(name) === VarState.declared) {
            throw new E301_RedeclarationError(
                `Redeclaration of name '${name}'`
            );
        }
        else if (context.get(name) === VarState.accessed) {
            throw new E302_UseBeforeDeclarationError(
                `Use of variable '${name}' before declaration`
            );
        }
        else {
            context.set(name, VarState.declared);
        }
    }
    else if (isFuncDecl(syntaxNode)) {
        let name = funcDeclName(syntaxNode).payload as string;
        let context = contextStack[contextStack.length - 1];
        if (context.get(name) === VarState.declared) {
            throw new E301_RedeclarationError(
                `Redeclaration of name '${name}'`
            );
        }
        else {
            context.set(name, VarState.declared);
        }
    }
    else if (isMacroDecl(syntaxNode)) {
        let name = macroDeclName(syntaxNode).payload as string;
        let context = contextStack[contextStack.length - 1];
        if (context.get(name) === VarState.declared) {
            throw new E301_RedeclarationError(
                `Redeclaration of name '${name}'`
            );
        }
        else {
            context.set(name, VarState.declared);
        }
    }
}

function visitUp(
    syntaxNode: SyntaxNode,
    contextStack: Array<Context>,
): void {
    if (isBlock(syntaxNode)) {
        contextStack.pop();
    }
}

function traverse(
    syntaxNode: SyntaxNode,
    contextStack: Array<Context>,
    quoteLevel: number,
): void {
    if (quoteLevel === 0) {
        visitDown(syntaxNode, contextStack);
    }

    for (let child of syntaxNode.children) {
        if (child instanceof SyntaxNode) {
            if (isQuoteExpr(child)) {
                traverse(child, contextStack, quoteLevel + 1);
            }
            else if (isUnquoteExpr(child)) {
                if (quoteLevel <= 0) {
                    throw new E303_UnquoteOutsideQuoteError();
                }
                traverse(child, contextStack, quoteLevel - 1);
            }
            else {
                traverse(child, contextStack, quoteLevel);
            }
        }
    }

    if (quoteLevel === 0) {
        visitUp(syntaxNode, contextStack);
    }
}

export function validateCompUnit(compUnit: SyntaxNode): void {
    traverse(compUnit, /* contextStack */ [new Map()], /* quoteLevel */ 0);
}

