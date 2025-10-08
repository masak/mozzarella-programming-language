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
    TokenKind,
} from "./token";
import {
    ArrayValue,
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    Value,
} from "./value";

function evaluate(expr: Expr): Value {
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
            let operandValue = evaluate(operand);
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of +");
            }
            return new IntValue(operandValue.payload);
        }
        else if (token.kind === TokenKind.Minus) {
            let operandValue = evaluate(operand);
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of -");
            }
            return new IntValue(-operandValue.payload);
        }
        else if (token.kind === TokenKind.Tilde) {
            let operandValue = evaluate(operand);
            return stringify(operandValue);
        }
        else if (token.kind === TokenKind.Quest) {
            let operandValue = evaluate(operand);
            return new BoolValue(boolify(operandValue));
        }
        else if (token.kind === TokenKind.Bang) {
            let operandValue = evaluate(operand);
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
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of +");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of +");
            }
            return new IntValue(left.payload + right.payload);
        }
        else if (token.kind === TokenKind.Minus) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of -");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of -");
            }
            return new IntValue(left.payload - right.payload);
        }
        else if (token.kind === TokenKind.Mult) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of *");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of *");
            }
            return new IntValue(left.payload * right.payload);
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of //");
            }
            let right = evaluate(rhs);
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
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of %");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
            }
            return new IntValue(left.payload % right.payload);
        }
        else if (token.kind === TokenKind.Tilde) {
            let left = evaluate(lhs);
            let strLeft = stringify(left);
            let right = evaluate(rhs);
            let strRight = stringify(right);
            return new StrValue(strLeft.payload + strRight.payload);
        }
        else if (token.kind === TokenKind.AmpAmp) {
            let left = evaluate(lhs);
            if (boolify(left)) {
                return evaluate(rhs);
            }
            else {
                return left;
            }
        }
        else if (token.kind === TokenKind.PipePipe) {
            let left = evaluate(lhs);
            if (boolify(left)) {
                return left;
            }
            else {
                return evaluate(rhs);
            }
        }
        else if (comparisonOps.has(token.kind)) {
            let [exprs, ops] = findAllChainedOps(expr);
            checkForUnchainableOps(ops);
            let success = true; // until proven false
            let prev = evaluate(exprs[0]);
            for (let i = 0; i < ops.length; i++) {
                let next = evaluate(exprs[i + 1]);
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
        let value = evaluate(inner);
        return value;
    }
    else if (expr instanceof DoExpr) {
        let statement = expr.children[0] as Statement;
        let value = executeStatement(statement);
        return value;
    }
    else if (expr instanceof ArrayInitializerExpr) {
        let elements: Array<Value> = [];
        for (let element of expr.children) {
            let value = evaluate(element);
            elements.push(value);
        }
        return new ArrayValue(elements);
    }
    else if (expr instanceof IndexingExpr) {
        let arrayExpr = expr.children[0] as Expr;
        let indexExpr = expr.children[1] as Expr;
        let array = evaluate(arrayExpr);
        if (!(array instanceof ArrayValue)) {
            throw new Error("Can only index an Array");
        }
        let index = evaluate(indexExpr);
        if (!(index instanceof IntValue)) {
            throw new Error("Can only index using an Int");
        }
        if (index.payload < 0 || index.payload >= array.elements.length) {
            throw new Error("Index out of bounds");
        }
        return array.elements[Number(index.payload)];
    }
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

function executeStatement(statement: Statement): Value {
    if (statement instanceof ExprStatement) {
        let expr = statement.children[0] as Expr;
        let value = evaluate(expr);
        return value;
    }
    else if (statement instanceof EmptyStatement) {
        return new NoneValue();
    }
    else if (statement instanceof BlockStatement) {
        let block = statement.children[0] as Block;
        return runBlock(block);
    }
    else if (statement instanceof IfStatement) {
        let clauses = statement.children[0].children as Array<IfClause>;
        for (let clause of clauses) {
            let condExpr = clause.children[0] as Expr;
            let value = evaluate(condExpr);
            if (boolify(value)) {
                let block = clause.children[1] as Block;
                return runBlock(block);
            }
        }
        if (statement.children.length > 1) {
            let elseBlock = statement.children[1] as Block;
            return runBlock(elseBlock);
        }
        else {
            return new NoneValue();
        }
    }
    else {
        throw new Error(
            `Unknown statement type ${statement.constructor.name}`
        );
    }
}

function runBlock(block: Block): Value {
    let statements = block.children as Array<Statement | Decl>;
    let lastValue = new NoneValue();
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof Statement) {
            let statement = statementOrDecl;
            lastValue = executeStatement(statement);
        }
        else {  // Decl
            let decl = statementOrDecl;
            if (decl instanceof VarDecl) {
                if (decl.children.length >= 2) {
                    let initExpr = decl.children[1] as Expr;
                    evaluate(initExpr);
                }
            }
            lastValue = new NoneValue();
        }
    }
    return lastValue;
}

export function runProgram(program: Program): Value {
    let statements = program.children as Array<Statement | Decl>;
    let lastValue = new NoneValue();
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof Statement) {
            let statement = statementOrDecl;
            lastValue = executeStatement(statement);
        }
        else {  // Decl
            let decl = statementOrDecl;
            if (decl instanceof VarDecl) {
                if (decl.children.length >= 2) {
                    let initExpr = decl.children[1] as Expr;
                    evaluate(initExpr);
                }
            }
            lastValue = new NoneValue();
        }
    }
    return lastValue;
}

