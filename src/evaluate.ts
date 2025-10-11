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
    bind,
    emptyEnv,
    Env,
    extend,
    lookup,
} from "./env";
import {
    stringify,
} from "./stringify";
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
    ForStatement,
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
    VarRefExpr,
} from "./syntax";
import {
    Token,
    TokenKind,
} from "./token";
import {
    ArrayValue,
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    UninitValue,
    Value,
} from "./value";

function evaluate(expr: Expr, env: Env): Value {
    if (expr instanceof IntLitExpr) {
        let payload = (expr.children[0] as Token).payload as bigint;
        return new IntValue(payload);
    }
    else if (expr instanceof StrLitExpr) {
        let payload = (expr.children[0] as Token).payload as string;
        return new StrValue(payload);
    }
    else if (expr instanceof BoolLitExpr) {
        let payload = (expr.children[0] as Token).payload as boolean;
        return new BoolValue(payload);
    }
    else if (expr instanceof NoneLitExpr) {
        return new NoneValue();
    }
    else if (expr instanceof PrefixOpExpr) {
        let token = expr.children[0] as Token;
        let operand = expr.children[1] as Expr;
        if (token.kind === TokenKind.Plus) {
            let operandValue = evaluate(operand, env);
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of +");
            }
            return new IntValue(operandValue.payload);
        }
        else if (token.kind === TokenKind.Minus) {
            let operandValue = evaluate(operand, env);
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of -");
            }
            return new IntValue(-operandValue.payload);
        }
        else if (token.kind === TokenKind.Tilde) {
            let operandValue = evaluate(operand, env);
            return stringify(operandValue);
        }
        else if (token.kind === TokenKind.Quest) {
            let operandValue = evaluate(operand, env);
            return new BoolValue(boolify(operandValue));
        }
        else if (token.kind === TokenKind.Bang) {
            let operandValue = evaluate(operand, env);
            return new BoolValue(!boolify(operandValue));
        }
        else {
            throw new Error(`Unknown prefix op type ${token.kind.kind}`);
        }
    }
    else if (expr instanceof InfixOpExpr) {
        let lhs = expr.children[0] as Expr;
        let token = expr.children[1] as Token;
        let rhs = expr.children[2] as Expr;
        if (token.kind === TokenKind.Plus) {
            let left = evaluate(lhs, env);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of +");
            }
            let right = evaluate(rhs, env);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of +");
            }
            return new IntValue(left.payload + right.payload);
        }
        else if (token.kind === TokenKind.Minus) {
            let left = evaluate(lhs, env);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of -");
            }
            let right = evaluate(rhs, env);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of -");
            }
            return new IntValue(left.payload - right.payload);
        }
        else if (token.kind === TokenKind.Mult) {
            let left = evaluate(lhs, env);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of *");
            }
            let right = evaluate(rhs, env);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of *");
            }
            return new IntValue(left.payload * right.payload);
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = evaluate(lhs, env);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of //");
            }
            let right = evaluate(rhs, env);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
            }
            let negative = left.payload < 0n !== right.payload < 0n;
            let nonZeroMod = left.payload % right.payload !== 0n;
            let diff = negative && nonZeroMod ? 1n : 0n;
            return new IntValue(left.payload / right.payload - diff);
        }
        else if (token.kind === TokenKind.Mod) {
            let left = evaluate(lhs, env);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of %");
            }
            let right = evaluate(rhs, env);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
            }
            return new IntValue(left.payload % right.payload);
        }
        else if (token.kind === TokenKind.Tilde) {
            let left = evaluate(lhs, env);
            let strLeft = stringify(left);
            let right = evaluate(rhs, env);
            let strRight = stringify(right);
            return new StrValue(strLeft.payload + strRight.payload);
        }
        else if (token.kind === TokenKind.AmpAmp) {
            let left = evaluate(lhs, env);
            if (boolify(left)) {
                return evaluate(rhs, env);
            }
            else {
                return left;
            }
        }
        else if (token.kind === TokenKind.PipePipe) {
            let left = evaluate(lhs, env);
            if (boolify(left)) {
                return left;
            }
            else {
                return evaluate(rhs, env);
            }
        }
        else if (comparisonOps.has(token.kind)) {
            let [exprs, ops] = findAllChainedOps(expr);
            checkForUnchainableOps(ops);
            let success = true; // until proven false
            let prev = evaluate(exprs[0], env);
            for (let i = 0; i < ops.length; i++) {
                let next = evaluate(exprs[i + 1], env);
                let op = ops[i];
                success = evaluateComparison(prev, op, next);
                if (!success) {
                    break;
                }
                prev = next;
            }
            return new BoolValue(success);
        }
        else {
            throw new Error(`Unknown infix op type ${token.kind.kind}`);
        }
    }
    else if (expr instanceof ParenExpr) {
        let inner = expr.children[0] as Expr;
        let value = evaluate(inner, env);
        return value;
    }
    else if (expr instanceof DoExpr) {
        let statement = expr.children[0] as Statement;
        let value = executeStatement(statement, env);
        return value;
    }
    else if (expr instanceof ArrayInitializerExpr) {
        let elements: Array<Value> = [];
        for (let element of expr.children) {
            let value = evaluate(element, env);
            elements.push(value);
        }
        return new ArrayValue(elements);
    }
    else if (expr instanceof IndexingExpr) {
        let arrayExpr = expr.children[0] as Expr;
        let indexExpr = expr.children[1] as Expr;
        let array = evaluate(arrayExpr, env);
        if (!(array instanceof ArrayValue)) {
            throw new Error("Can only index an Array");
        }
        let index = evaluate(indexExpr, env);
        if (!(index instanceof IntValue)) {
            throw new Error("Can only index using an Int");
        }
        if (index.payload < 0 || index.payload >= array.elements.length) {
            throw new Error("Index out of bounds");
        }
        return array.elements[Number(index.payload)];
    }
    else if (expr instanceof VarRefExpr) {
        let name = (expr.children[0] as Token).payload as string;
        let value = lookup(env, name);
        return value;
    }
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

function executeStatement(statement: Statement, env: Env): Value {
    if (statement instanceof ExprStatement) {
        let expr = statement.children[0] as Expr;
        let value = evaluate(expr, env);
        return value;
    }
    else if (statement instanceof EmptyStatement) {
        return new NoneValue();
    }
    else if (statement instanceof BlockStatement) {
        let block = statement.children[0] as Block;
        return runBlock(block, env);
    }
    else if (statement instanceof IfStatement) {
        let clauses = statement.children[0].children as Array<IfClause>;
        for (let clause of clauses) {
            let condExpr = clause.children[0] as Expr;
            let value = evaluate(condExpr, env);
            if (boolify(value)) {
                let block = clause.children[1] as Block;
                return runBlock(block, env);
            }
        }
        if (statement.children.length > 1) {
            let elseBlock = statement.children[1] as Block;
            return runBlock(elseBlock, env);
        }
        else {
            return new NoneValue();
        }
    }
    else if (statement instanceof ForStatement) {
        env = extend(env);
        let name = (statement.children[0] as Token).payload as string;
        bind(env, name, new UninitValue());
        let arrayExpr = statement.children[1] as Expr;
        let arrayValue = evaluate(arrayExpr, env);
        if (!(arrayValue instanceof ArrayValue)) {
            throw new Error("Type error: not an array");
        }
        let body = statement.children[2] as Block;
        for (let element of arrayValue.elements) {
            let bodyEnv = extend(env);
            bind(bodyEnv, name, element);
            runBlock(body, bodyEnv);
        }
        return new NoneValue();
    }
    else {
        throw new Error(
            `Unknown statement type ${statement.constructor.name}`
        );
    }
}

function runBlock(block: Block, env: Env): Value {
    env = extend(env);
    let statements = block.children as Array<Statement | Decl>;
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof VarDecl) {
            let varDecl = statementOrDecl;
            let name = (varDecl.children[0] as Token).payload as string;
            bind(env, name, new UninitValue());
        }
    }

    let lastValue = new NoneValue();
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof Statement) {
            let statement = statementOrDecl;
            lastValue = executeStatement(statement, env);
        }
        else {  // Decl
            let decl = statementOrDecl;
            if (decl instanceof VarDecl) {
                if (decl.children.length >= 2) {
                    let name = (decl.children[0] as Token).payload as string;
                    let initExpr = decl.children[1] as Expr;
                    let value = evaluate(initExpr, env);
                    bind(env, name, value);
                }
            }
            lastValue = new NoneValue();
        }
    }
    return lastValue;
}

export function runProgram(program: Program): Value {
    let env = emptyEnv();
    let statements = program.children as Array<Statement | Decl>;
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof VarDecl) {
            let varDecl = statementOrDecl;
            let name = (varDecl.children[0] as Token).payload as string;
            bind(env, name, new UninitValue());
        }
    }

    let lastValue = new NoneValue();
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof Statement) {
            let statement = statementOrDecl;
            lastValue = executeStatement(statement, env);
        }
        else {  // Decl
            let decl = statementOrDecl;
            if (decl instanceof VarDecl) {
                if (decl.children.length >= 2) {
                    let name = (decl.children[0] as Token).payload as string;
                    let initExpr = decl.children[1] as Expr;
                    let value = evaluate(initExpr, env);
                    bind(env, name, value);
                }
            }
            lastValue = new NoneValue();
        }
    }
    return lastValue;
}

