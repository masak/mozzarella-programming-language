import {
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    Decl,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    IfClause,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    ParenExpr,
    PrefixOpExpr,
    Program,
    Statement,
    StrLitExpr,
    VarDecl,
} from "./syntax";
import {
    Token,
} from "./token";

type Context = Set<string>;

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
        let operand = expr.children[1] as Expr;
        validateExpr(operand, contextStack);
    }
    else if (expr instanceof InfixOpExpr) {
        let lhs = expr.children[0] as Expr;
        validateExpr(lhs, contextStack);
        let rhs = expr.children[2] as Expr;
        validateExpr(rhs, contextStack);
    }
    else if (expr instanceof ParenExpr) {
        let inner = expr.children[0] as Expr;
        validateExpr(inner, contextStack);
    }
    else if (expr instanceof DoExpr) {
        let statement = expr.children[0] as Statement;
        validateStatement(statement, contextStack);
    }
    else if (expr instanceof ArrayInitializerExpr) {
        for (let element of expr.children) {
            validateExpr(element, contextStack);
        }
    }
    else if (expr instanceof IndexingExpr) {
        let arrayExpr = expr.children[0] as Expr;
        validateExpr(arrayExpr, contextStack);
        let indexExpr = expr.children[1] as Expr;
        validateExpr(indexExpr, contextStack);
    }
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

function validateBlock(block: Block, contextStack: Array<Context>): void {
    contextStack.push(new Set());
    let statements = block.children as Array<Statement | Decl>;
    for (let statementOrDecl of statements) {
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
        let expr = statement.children[0] as Expr;
        validateExpr(expr, contextStack);
    }
    else if (statement instanceof EmptyStatement) {
        // do nothing
    }
    else if (statement instanceof BlockStatement) {
        let block = statement.children[0] as Block;
        validateBlock(block, contextStack);
    }
    else if (statement instanceof IfStatement) {
        let clauses = statement.children[0].children as Array<IfClause>;
        for (let clause of clauses) {
            let condExpr = clause.children[0] as Expr;
            validateExpr(condExpr, contextStack);
            let block = clause.children[1] as Block;
            validateBlock(block, contextStack);
        }
        if (statement.children.length > 1) {
            let elseBlock = statement.children[1] as Block;
            validateBlock(elseBlock, contextStack);
        }
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
        let nameToken = decl.children[0] as Token;
        let name = nameToken.payload as string;
        let context = contextStack[contextStack.length - 1];
        if (context.has(name)) {
            throw new Error(`Redeclaration of name '${name}'`);
        }
        context.add(name);
    }
    else {
        throw new Error(
            `Unknown declaration type ${decl.constructor.name}`
        );
    }
}

export function validateProgram(program: Program): void {
    let contextStack: Array<Context> = [new Set()];
    let statements = program.children as Array<Statement | Decl>;
    for (let statementOrDecl of statements) {
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

