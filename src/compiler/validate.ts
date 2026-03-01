import {
    E301_RedeclarationError,
    E302_UseBeforeDeclarationError,
    E303_UnquoteOutsideQuoteError,
} from "./error";
import {
    Block,
    CompUnit,
    FuncDecl,
    MacroDecl,
    QuoteExpr,
    SyntaxNode,
    UnquoteExpr,
    VarDecl,
    VarRefExpr,
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
    if (syntaxNode instanceof VarRefExpr) {
        let name = syntaxNode.name.payload as string;
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
    else if (syntaxNode instanceof Block) {
        contextStack.push(new Map());
    }
    else if (syntaxNode instanceof VarDecl) {
        let name = syntaxNode.name.payload as string;
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
    else if (syntaxNode instanceof FuncDecl) {
        let name = syntaxNode.name.payload as string;
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
    else if (syntaxNode instanceof MacroDecl) {
        let name = syntaxNode.name.payload as string;
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
    if (syntaxNode instanceof Block) {
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
            if (child instanceof QuoteExpr) {
                traverse(child, contextStack, quoteLevel + 1);
            }
            else if (child instanceof UnquoteExpr) {
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

export function validateCompUnit(compUnit: CompUnit): void {
    traverse(compUnit, /* contextStack */ [new Map()], /* quoteLevel */ 0);
}

