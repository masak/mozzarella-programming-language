import {
    E301_RedeclarationError,
} from "./error";
import {
    Block,
    CompUnit,
    FuncDecl,
    SyntaxNode,
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
        let name = syntaxNode.nameToken.payload as string;
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
        let name = syntaxNode.nameToken.payload as string;
        let context = contextStack[contextStack.length - 1];
        if (context.get(name) === VarState.declared) {
            throw new E301_RedeclarationError(
                `Redeclaration of name '${name}'`
            );
        }
        else if (context.get(name) === VarState.accessed) {
            throw new Error(`Use of variable '${name}' before declaration`);
        }
        else {
            context.set(name, VarState.declared);
        }
    }
    else if (syntaxNode instanceof FuncDecl) {
        let name = syntaxNode.nameToken.payload as string;
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

function traverse(syntaxNode: SyntaxNode, contextStack: Array<Context>): void {
    visitDown(syntaxNode, contextStack);

    for (let child of syntaxNode.children) {
        if (child instanceof SyntaxNode) {
            traverse(child, contextStack);
        }
    }

    visitUp(syntaxNode, contextStack);
}

export function validateCompUnit(compUnit: CompUnit): void {
    let contextStack: Array<Context> = [new Map()];
    traverse(compUnit, contextStack);
}

