import {
    E000_InternalError,
    E502_UnchainableOpsError,
} from "./error";
import {
    _b,
    _i,
    IrBasicBlock,
    IrBranchJump,
    IrCompUnit,
    IrDirectJump,
    IrFunc,
    IrInstr,
    IrInstrAddInts,
    IrInstrConcat,
    IrInstrEq,
    IrInstrFloorDivInts,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetNone,
    IrInstrGetStr,
    IrInstrGetTrue,
    IrInstrGreater,
    IrInstrGreaterEq,
    IrInstrLess,
    IrInstrLessEq,
    IrInstrModInts,
    IrInstrMulInts,
    IrInstrNegInt,
    IrInstrNotEq,
    IrInstrPhi,
    IrInstrPosInt,
    IrInstrSubInts,
    IrInstrToBool,
    IrInstrToNegBool,
    IrInstrToStr,
    IrInstrUpsilon,
} from "./ir";
import {
    BoolLitExpr,
    CompUnit,
    Expr,
    ExprStatement,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    PrefixOpExpr,
    StrLitExpr,
} from "./syntax";
import {
    Token,
    TokenKind,
} from "./token";
import {
    IntValue,
    StrValue,
} from "../runtime/value";

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
        throw new E000_InternalError(
            "Precondition failed: root must be comparison expr"
        );
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
        let otherOp = notEqOpIndex < ops.length - 1
            ? ops[notEqOpIndex + 1]
            : ops[notEqOpIndex - 1];
        throw new E502_UnchainableOpsError(
            `Cannot chain != and ${otherOp.kind.kind}`
        );
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
        throw new E502_UnchainableOpsError(
            `Cannot chain ${lessTypeOp.kind.kind} `
                + `and ${greaterTypeOp.kind.kind}`
        );
    }
}

export function syntaxToIr(compUnit: CompUnit): IrCompUnit {
    let instrs: Array<IrInstr> = [];
    let blocks: Array<IrBasicBlock> = [];
    let currentBlock = blocks[0];

    function lastBlock(): IrBasicBlock {
        return blocks[blocks.length - 1];
    }

    function addBlock() {
        instrs = [];
        blocks.push(new IrBasicBlock({ instrs }));
        currentBlock = lastBlock();
    }

    function convertExpr(expr: Expr): IrInstr {
        let oldLength = instrs.length;

        if (expr instanceof IntLitExpr) {
            let valueToken = expr.valueToken;
            let value = new IntValue(valueToken.payload as bigint);
            instrs.push(new IrInstrGetInt(value));
        }
        else if (expr instanceof StrLitExpr) {
            let valueToken = expr.valueToken;
            let value = new StrValue(valueToken.payload as string);
            instrs.push(new IrInstrGetStr(value));
        }
        else if (expr instanceof BoolLitExpr) {
            let valueToken = expr.valueToken;
            if (valueToken.payload as boolean) {
                instrs.push(new IrInstrGetTrue());
            }
            else {
                instrs.push(new IrInstrGetFalse());
            }
        }
        else if (expr instanceof NoneLitExpr) {
            instrs.push(new IrInstrGetNone());
        }
        else if (expr instanceof PrefixOpExpr) {
            let token = expr.opToken;
            if (token.kind === TokenKind.Plus) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrPosInt(operand));
            }
            else if (token.kind === TokenKind.Minus) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrNegInt(operand));
            }
            else if (token.kind === TokenKind.Tilde) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrToStr(operand));
            }
            else if (token.kind === TokenKind.Quest) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrToBool(operand));
            }
            else if (token.kind === TokenKind.Bang) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrToNegBool(operand));
            }
            else {
                throw new E000_InternalError(
                    `Unknown prefix op type ${token.kind.kind}`
                );
            }
        }
        else if (expr instanceof InfixOpExpr) {
            let token = expr.opToken;
            if (token.kind === TokenKind.Plus) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrAddInts(left, right));
            }
            else if (token.kind === TokenKind.Minus) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrSubInts(left, right));
            }
            else if (token.kind === TokenKind.Mult) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrMulInts(left, right));
            }
            else if (token.kind === TokenKind.FloorDiv) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrFloorDivInts(left, right));
            }
            else if (token.kind === TokenKind.Mod) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrModInts(left, right));
            }
            else if (token.kind === TokenKind.Tilde) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrConcat(left, right));
            }
            else if (token.kind === TokenKind.AmpAmp) {
                let left = convertExpr(expr.lhs);
                let cond = new IrInstrToBool(left);
                instrs.push(cond);
                let branchBlock = currentBlock;

                addBlock();
                let right = convertExpr(expr.rhs);
                let trueUpsilon = new IrInstrUpsilon(right, _i);
                instrs.push(trueUpsilon);
                let trueBlock = currentBlock;

                addBlock();
                let falseUpsilon = new IrInstrUpsilon(left, _i);
                instrs.push(falseUpsilon);
                let falseBlock = currentBlock;

                addBlock();
                let phi = new IrInstrPhi();
                instrs.push(phi);
                trueUpsilon.phi = phi;
                falseUpsilon.phi = phi;
                let joinBlock = currentBlock;

                branchBlock.jump
                    = new IrBranchJump(cond, trueBlock, falseBlock);
                trueBlock.jump = new IrDirectJump(joinBlock);
                falseBlock.jump = new IrDirectJump(joinBlock);
            }
            else if (token.kind === TokenKind.PipePipe) {
                let left = convertExpr(expr.lhs);
                let cond = new IrInstrToBool(left);
                instrs.push(cond);
                let branchBlock = currentBlock;

                addBlock();
                let trueUpsilon = new IrInstrUpsilon(left, _i);
                instrs.push(trueUpsilon);
                let trueBlock = currentBlock;

                addBlock();
                let right = convertExpr(expr.rhs);
                let falseUpsilon = new IrInstrUpsilon(right, _i);
                instrs.push(falseUpsilon);
                let falseBlock = currentBlock;

                addBlock();
                let phi = new IrInstrPhi();
                instrs.push(phi);
                trueUpsilon.phi = phi;
                falseUpsilon.phi = phi;
                let joinBlock = currentBlock;

                branchBlock.jump
                    = new IrBranchJump(cond, trueBlock, falseBlock);
                trueBlock.jump = new IrDirectJump(joinBlock);
                falseBlock.jump = new IrDirectJump(joinBlock);
            }
            else if (comparisonOps.has(token.kind)) {
                let [exprs, ops] = findAllChainedOps(expr);
                checkForUnchainableOps(ops);

                let jumps: Array<IrBranchJump> = [];
                let prev = convertExpr(exprs[0]);
                for (let i = 0; i < ops.length; i++) {
                    let next = convertExpr(exprs[i + 1]);
                    let op = ops[i];
                    let cond: IrInstr;
                    if (op.kind === TokenKind.Less) {
                        cond = new IrInstrLess(prev, next);
                    }
                    else if (op.kind === TokenKind.LessEq) {
                        cond = new IrInstrLessEq(prev, next);
                    }
                    else if (op.kind === TokenKind.Greater) {
                        cond = new IrInstrGreater(prev, next);
                    }
                    else if (op.kind === TokenKind.GreaterEq) {
                        cond = new IrInstrGreaterEq(prev, next);
                    }
                    else if (op.kind === TokenKind.EqEq) {
                        cond = new IrInstrEq(prev, next);
                    }
                    else if (op.kind === TokenKind.BangEq) {
                        cond = new IrInstrNotEq(prev, next);
                    }
                    else {
                        throw new E000_InternalError(
                            "Unrecognized comparison op"
                        );
                    }
                    instrs.push(cond);

                    let jump = new IrBranchJump(cond, _b, _b);
                    jumps.push(jump);
                    currentBlock.jump = jump;

                    addBlock();
                    jump.trueTarget = currentBlock;
                    prev = next;
                }

                let tt = new IrInstrGetTrue();
                instrs.push(tt);
                let u1 = new IrInstrUpsilon(tt, _i);
                instrs.push(u1);
                let trueBlock = currentBlock;

                addBlock();
                let ff = new IrInstrGetFalse();
                instrs.push(ff);
                let u2 = new IrInstrUpsilon(ff, _i);
                instrs.push(u2);
                let falseBlock = currentBlock;

                for (let jump of jumps) {
                    jump.falseTarget = falseBlock;
                }

                addBlock();
                let phi = new IrInstrPhi();
                instrs.push(phi);
                u1.phi = phi;
                u2.phi = phi;
                trueBlock.jump = new IrDirectJump(currentBlock);
                falseBlock.jump = new IrDirectJump(currentBlock);
            }
            else {
                throw new E000_InternalError(
                    `Unknown prefix op type ${token.kind.kind}`
                );
            }
        }
        else {
            throw new E000_InternalError(
                `Unrecognized expr ${expr.constructor.name}`
            );
        }

        if (instrs.length <= oldLength) {
            throw new E000_InternalError("No instructions added");
        }
        return instrs[instrs.length - 1];
    }

    addBlock();

    for (let statement of compUnit.children) {
        if (statement === null) {
            // skip
        }
        else if (statement instanceof ExprStatement) {
            let expr = statement.expr;
            /* ignore */ convertExpr(expr);
        }
        else {
            throw new E000_InternalError(
                `Unrecognized statement ${statement.constructor.name}`
            );
        }
    }

    let irFunc = new IrFunc({ blocks });
    let irCompUnit = new IrCompUnit({ funcs: [irFunc] });

    return irCompUnit;
}

