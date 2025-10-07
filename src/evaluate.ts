import {
    stringify,
} from "./stringify";
import {
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    IfClause,
    IfStatement,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    ParenExpr,
    PrefixOpExpr,
    Program,
    Statement,
    StrLitExpr,
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

function boolify(value: Value): boolean {
    if (value instanceof IntValue) {
        return value.payload !== 0n;
    }
    else if (value instanceof StrValue) {
        return value.payload !== "";
    }
    else if (value instanceof BoolValue) {
        return value.payload;
    }
    else if (value instanceof NoneValue) {
        return false;
    }
    else if (value instanceof ArrayValue) {
        return value.elements.length !== 0;
    }
    else { // generic fallback
        return true;
    }
}

function isComparable(value: Value): boolean {
    return value instanceof IntValue ||
        value instanceof StrValue ||
        value instanceof ArrayValue;
}

function isLessThan(left: Value, right: Value): boolean {
    let comparable = isComparable(left) && isComparable(right);
    let sameType = left.constructor === right.constructor;
    if (!(comparable && sameType)) {
        throw new Error(`Cannot compare ${left.constructor.name} ` +
                        `and ${right.constructor.name}`);
    }

    if (left instanceof IntValue) {
        if (!(right instanceof IntValue)) {
            throw new Error("Precondition failed: not an Int");
        }
        return left.payload < right.payload;
    }
    else if (left instanceof StrValue) {
        if (!(right instanceof StrValue)) {
            throw new Error("Precondition failed: not a Str");
        }
        return left.payload < right.payload;
    }
    else if (left instanceof ArrayValue) {
        if (!(right instanceof ArrayValue)) {
            throw new Error("Precondition failed: not an Array");
        }
        for (let i = 0; i < left.elements.length; i++) {
            if (i >= right.elements.length) {   // left array longer
                return false;
            }
            let l = left.elements[i];
            let r = right.elements[i];
            if (isLessThan(l, r)) {
                return true;
            }
            else if (areEqual(l, r)) {
                continue;
            }
            else {  // different types, or l > r
                return false;
            }
        }
        // For the length of the left array, the elements are pairwise equal
        return left.elements.length < right.elements.length;
    }
    else {
        throw new Error("Precondition failed: unrecognized comparable type");
    }
}

function areEqual(left: Value, right: Value): boolean {
    if (left instanceof IntValue) {
        if (!(right instanceof IntValue)) {
            return false;
        }
        return left.payload === right.payload;
    }
    else if (left instanceof StrValue) {
        if (!(right instanceof StrValue)) {
            return false;
        }
        return left.payload === right.payload;
    }
    else if (left instanceof BoolValue) {
        if (!(right instanceof BoolValue)) {
            return false;
        }
        return left.payload === right.payload;
    }
    else if (left instanceof NoneValue) {
        if (!(right instanceof NoneValue)) {
            return false;
        }
        return true;
    }
    else if (left instanceof ArrayValue) {
        if (!(right instanceof ArrayValue)) {
            return false;
        }
        return left.elements.length === right.elements.length &&
            pairwise(areEqual, left.elements, right.elements);
    }
    else {
        // Generic fallback: reference equality
        return left === right;
    }
}

function pairwise<T>(fn: (x: T, y: T) => boolean, xs: Array<T>, ys: Array<T>) {
    if (xs.length !== ys.length) {
        throw new Error("Precondition failed: lists are of unequal length");
    }
    for (let i = 0; i < xs.length; i++) {
        if (!fn(xs[i], ys[i])) {
            return false;
        }
    }
    return true;
}

const comparisonOps = new Set([
    TokenKind.Less,
    TokenKind.LessEq,
    TokenKind.Greater,
    TokenKind.GreaterEq,
    TokenKind.EqEq,
    TokenKind.BangEq,
]);

// Traverses down the left leg of an expression tree, collecting all comparison
// operators and their operands, in left-to-right (top-to-bottom) order.
function findAllChainedOps(root: Expr): [Array<Expr>, Array<Token>] {
    if (!(root instanceof InfixOpExpr)
        || !comparisonOps.has((root.children[1] as Token).kind)) {
        throw new Error("Precondition failed: root must be comparison expr");
    }
    let stack: Array<InfixOpExpr> = [root];
    while (true) {
        let lhs = stack[stack.length - 1].children[0];
        if (lhs instanceof InfixOpExpr
            && comparisonOps.has((lhs.children[1] as Token).kind)) {
            stack.push(lhs);
        }
        else {
            break;
        }
    }
    let firstLhs: Expr = stack[stack.length - 1].children[0] as Expr;
    let exprs: Array<Expr> = [firstLhs];
    let ops: Array<Token> = [];
    while (stack.length > 0) {
        let expr = stack.pop()!;
        let op = expr.children[1] as Token;
        ops.push(op);
        let rhs = expr.children[2] as Expr;
        exprs.push(rhs);
    }
    return [exprs, ops];
}

// Upholds the following rules:
//
// - The != operator doesn't chain with anything (even itself)
// - The (< <= ==) operators go together, as do the (> >= ==) operators, but
//   any other combination of comparison operators is disallowed
function checkForUnchainableOps(ops: Array<Token>) {
    let hasNotEq = ops.some((op) => op.kind === TokenKind.BangEq);
    if (hasNotEq && ops.length > 1) {
        let notEqOpIndex = ops.findIndex((op) => op.kind === TokenKind.BangEq);
        let otherOp = notEqOpIndex < ops.length
            ? ops[notEqOpIndex + 1]
            : ops[notEqOpIndex - 1];
        throw new Error(`Cannot chain != and ${otherOp.kind.kind}`);
    }

    let hasLessTypeOps = ops.some(
        (op) => op.kind === TokenKind.Less || op.kind === TokenKind.LessEq
    );
    let hasGreaterTypeOps = ops.some(
        (op) => op.kind === TokenKind.Greater
            || op.kind === TokenKind.GreaterEq
    );
    if (hasLessTypeOps && hasGreaterTypeOps) {
        let lessTypeOp = ops.find(
            (op) => op.kind === TokenKind.Less || op.kind === TokenKind.LessEq
        )!;
        let greaterTypeOp = ops.find(
            (op) => op.kind === TokenKind.Greater
                || op.kind === TokenKind.GreaterEq
        )!;
        throw new Error(`Cannot chain ${lessTypeOp.kind.kind} ` +
                        `and ${greaterTypeOp.kind.kind}`);
    }
}

function evaluateComparison(left: Value, op: Token, right: Value): boolean {
    if (op.kind === TokenKind.Less) {
        return isLessThan(left, right);
    }
    else if (op.kind === TokenKind.LessEq) {
        return isLessThan(left, right) || areEqual(left, right);
    }
    else if (op.kind === TokenKind.Greater) {
        return isLessThan(right, left);
    }
    else if (op.kind === TokenKind.GreaterEq) {
        return isLessThan(right, left) || areEqual(left, right);
    }
    else if (op.kind === TokenKind.EqEq) {
        return areEqual(left, right);
    }
    else if (op.kind === TokenKind.BangEq) {
        return !areEqual(left, right);
    }
    else {
        throw new Error(`Unrecognized comparison token kind ${op.kind.kind}`);
    }
}

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
    let statements = block.children as Array<Statement>;
    let lastValue = new NoneValue();
    for (let statement of statements) {
        lastValue = executeStatement(statement);
    }
    return lastValue;
}

export function runProgram(program: Program): Value {
    let statements = program.children as Array<Statement>;
    let lastValue = new NoneValue();
    for (let statement of statements) {
        lastValue = executeStatement(statement);
    }
    return lastValue;
}

