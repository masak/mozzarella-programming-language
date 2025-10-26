import {
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    CompUnit,
    Decl,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    ForStatement,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    LastStatement,
    NoneLitExpr,
    ParenExpr,
    PrefixOpExpr,
    Statement,
    StrLitExpr,
    VarDecl,
    VarRefExpr,
    WhileStatement,
} from "./syntax";

class VarState {
    static declared = new VarState();
    static accessed = new VarState();
}

type Context = Map<string, VarState>;

function validateExpr(expr: Expr, contextStack: Array<Context>): void {
    if (expr instanceof IntLitExpr) {
        // do nothing
    }
    else if (expr instanceof StrLitExpr) {
        // do nothing
    }
    else if (expr instanceof BoolLitExpr) {
        // do nothing
    }
    else if (expr instanceof NoneLitExpr) {
        // do nothing
    }
    else if (expr instanceof PrefixOpExpr) {
        validateExpr(expr.operand, contextStack);
    }
    else if (expr instanceof InfixOpExpr) {
        validateExpr(expr.lhs, contextStack);
        validateExpr(expr.rhs, contextStack);
    }
    else if (expr instanceof ParenExpr) {
        validateExpr(expr.innerExpr, contextStack);
    }
    else if (expr instanceof DoExpr) {
        validateStatement(expr.statement, contextStack);
    }
    else if (expr instanceof ArrayInitializerExpr) {
        for (let element of expr.elements) {
            validateExpr(element, contextStack);
        }
    }
    else if (expr instanceof IndexingExpr) {
        validateExpr(expr.arrayExpr, contextStack);
        validateExpr(expr.indexExpr, contextStack);
    }
    else if (expr instanceof VarRefExpr) {
        let name = expr.nameToken.payload as string;
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
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

function validateBlock(block: Block, contextStack: Array<Context>): void {
    contextStack.push(new Map());
    for (let statementOrDecl of block.statements) {
        if (statementOrDecl instanceof Statement) {
            let statement = statementOrDecl;
            validateStatement(statement, contextStack);
        }
        else {  // Decl
            let decl = statementOrDecl;
            validateDecl(decl, contextStack);
        }
    }
    contextStack.pop();
}

function validateStatement(
    statement: Statement,
    contextStack: Array<Context>,
): void {
    if (statement instanceof ExprStatement) {
        validateExpr(statement.expr, contextStack);
    }
    else if (statement instanceof EmptyStatement) {
        // do nothing
    }
    else if (statement instanceof BlockStatement) {
        validateBlock(statement.block, contextStack);
    }
    else if (statement instanceof IfStatement) {
        for (let clause of statement.clauseList.clauses) {
            validateExpr(clause.condExpr, contextStack);
            validateBlock(clause.block, contextStack);
        }
        if (statement.elseBlock !== null) {
            validateBlock(statement.elseBlock, contextStack);
        }
    }
    else if (statement instanceof ForStatement) {
        validateExpr(statement.arrayExpr, contextStack);
        validateBlock(statement.body, contextStack);
    }
    else if (statement instanceof WhileStatement) {
        validateExpr(statement.condExpr, contextStack);
        validateBlock(statement.body, contextStack);
    }
    else if (statement instanceof LastStatement) {
        // do nothing
    }
    else {
        throw new Error(
            `Unknown statement type ${statement.constructor.name}`
        );
    }
}

function validateDecl(
    decl: Decl,
    contextStack: Array<Context>,
): void {
    if (decl instanceof VarDecl) {
        let name = decl.nameToken.payload as string;
        let context = contextStack[contextStack.length - 1];
        if (context.get(name) === VarState.declared) {
            throw new Error(`Redeclaration of name '${name}'`);
        }
        else if (context.get(name) === VarState.accessed) {
            throw new Error(`Use of variable '${name}' before declaration`);
        }
        else {
            context.set(name, VarState.declared);
        }
    }
    else {
        throw new Error(
            `Unknown declaration type ${decl.constructor.name}`
        );
    }
}

export function validateProgram(program: CompUnit): void {
    let contextStack: Array<Context> = [new Map()];
    for (let statementOrDecl of program.statements) {
        if (statementOrDecl instanceof Statement) {
            let statement = statementOrDecl;
            validateStatement(statement, contextStack);
        }
        else {  // Decl
            let decl = statementOrDecl;
            validateDecl(decl, contextStack);
        }
    }
}

