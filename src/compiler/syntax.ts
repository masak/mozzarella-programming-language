export abstract class SyntaxNode {
    children: Array<SyntaxNode | null>;

    constructor(children: Array<SyntaxNode | null>) {
        this.children = children;
    }
}

export class StrNode extends SyntaxNode {
    payload: string;

    constructor(payload: string) {
        super([]);
        this.payload = payload;
    }
}

export class IntNode extends SyntaxNode {
    payload: bigint;

    constructor(payload: bigint) {
        super([]);
        this.payload = payload;
    }
}

export class BoolNode extends SyntaxNode {
    payload: boolean;

    constructor(payload: boolean) {
        super([]);
        this.payload = payload;
    }
}

export class CompUnit extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }

    get statements(): Array<Statement | Decl> {
        return this.children as Array<Statement | Decl>;
    }
}

export class Block extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }

    get statements(): Array<Statement | Decl> {
        return this.children as Array<Statement | Decl>;
    }
}

export abstract class Statement extends SyntaxNode {
}

export class ExprStatement extends Statement {
    constructor(expr: Expr) {
        super([expr]);
    }

    get expr(): Expr {
        return this.children[0] as Expr;
    }
}

export class EmptyStatement extends Statement {
    constructor() {
        super([]);
    }
}

export class BlockStatement extends Statement {
    constructor(block: Block) {
        super([block]);
    }

    get block(): Block {
        return this.children[0] as Block;
    }
}

export class IfClause extends SyntaxNode {
    constructor(condExpr: Expr, block: Block) {
        super([condExpr, block]);
    }

    get condExpr(): Expr {
        return this.children[0] as Expr;
    }

    get block(): Block {
        return this.children[1] as Block;
    }
}

export class IfClauseList extends SyntaxNode {
    get clauses(): Array<IfClause> {
        return this.children as Array<IfClause>;
    }
}

export class IfStatement extends Statement {
    constructor(clauseList: IfClauseList, elseBlock: Block | null) {
        super([clauseList, elseBlock]);
    }

    get clauseList(): IfClauseList {
        return this.children[0] as IfClauseList;
    }

    get elseBlock(): Block | null {
        return this.children[1] as Block | null;
    }
}

export class ForStatement extends Statement {
    constructor(name: StrNode, arrayExpr: Expr, body: Block) {
        super([name, arrayExpr, body]);
    }

    get name(): StrNode {
        return this.children[0] as StrNode;
    }

    get arrayExpr(): Expr {
        return this.children[1] as Expr;
    }

    get body(): Block {
        return this.children[2] as Block;
    }
}

export class WhileStatement extends Statement {
    constructor(condExpr: Expr, body: Block) {
        super([condExpr, body]);
    }

    get condExpr(): Expr {
        return this.children[0] as Expr;
    }

    get body(): Block {
        return this.children[1] as Block;
    }
}

export class LastStatement extends Statement {
    constructor() {
        super([]);
    }
}

export class NextStatement extends Statement {
    constructor() {
        super([]);
    }
}

export class ReturnStatement extends Statement {
    constructor(expr: Expr | null) {
        super([expr]);
    }

    get expr(): Expr | null {
        return this.children[0] as Expr | null;
    }
}

export abstract class Decl extends SyntaxNode {
}

export class VarDecl extends Decl {
    constructor(name: StrNode, type: null, initExpr: Expr | null) {
        super([name, type, initExpr]);
    }

    get name(): StrNode {
        return this.children[0] as StrNode;
    }

    get type(): null {
        return this.children[1] as null;
    }

    get initExpr(): Expr | null {
        return this.children[2] as Expr | null;
    }
}

export class Parameter extends SyntaxNode {
    constructor(name: StrNode, type: null) {
        super([name, type]);
    }

    get name(): StrNode {
        return this.children[0] as StrNode;
    }

    get type(): null {
        return this.children[1] as null;
    }
}

export class ParameterList extends SyntaxNode {
    constructor(parameters: Array<Parameter>) {
        super(parameters);
    }

    get parameters(): Array<Parameter> {
        return this.children as Array<Parameter>;
    }
}

export class FuncDecl extends Decl {
    constructor(
        name: StrNode,
        parameterList: ParameterList,
        type: null,
        body: Block,
    ) {
        super([name, parameterList, type, body]);
    }

    get name(): StrNode {
        return this.children[0] as StrNode;
    }

    get parameterList(): ParameterList {
        return this.children[1] as ParameterList;
    }

    get type(): null {
        return this.children[2] as null;
    }

    get body(): Block {
        return this.children[3] as Block;
    }
}

export class MacroDecl extends Decl {
    constructor(
        name: StrNode,
        parameterList: ParameterList,
        type: null,
        body: Block,
    ) {
        super([name, parameterList, type, body]);
    }

    get name(): StrNode {
        return this.children[0] as StrNode;
    }

    get parameterList(): ParameterList {
        return this.children[1] as ParameterList;
    }

    get type(): null {
        return this.children[2] as null;
    }

    get body(): Block {
        return this.children[3] as Block;
    }
}

export abstract class Expr extends SyntaxNode {
}

export class PrefixOpExpr extends Expr {
    constructor(opName: StrNode, operand: Expr) {
        super([opName, operand]);
    }

    get opName(): StrNode {
        return this.children[0] as StrNode;
    }

    get operand(): Expr {
        return this.children[1] as Expr;
    }
}

export class InfixOpExpr extends Expr {
    constructor(lhs: Expr, opName: StrNode, rhs: Expr) {
        super([lhs, opName, rhs]);
    }

    get lhs(): Expr {
        return this.children[0] as Expr;
    }

    get opName(): StrNode {
        return this.children[1] as StrNode;
    }

    get rhs(): Expr {
        return this.children[2] as Expr;
    }
}

export class IndexingExpr extends Expr {
    constructor(arrayExpr: Expr, indexExpr: Expr) {
        super([arrayExpr, indexExpr]);
    }

    get arrayExpr(): Expr {
        return this.children[0] as Expr;
    }

    get indexExpr(): Expr {
        return this.children[1] as Expr;
    }
}

export class Argument extends SyntaxNode {
    constructor(expr: Expr) {
        super([expr]);
    }

    get expr(): Expr {
        return this.children[0] as Expr;
    }
}

export class ArgumentList extends SyntaxNode {
    constructor(args: Array<Argument>) {
        super(args);
    }

    get args(): Array<Argument> {
        return this.children as Array<Argument>;
    }
}

export class CallExpr extends Expr {
    constructor(funcExpr: Expr, argList: ArgumentList) {
        super([funcExpr, argList]);
    }

    get funcExpr(): Expr {
        return this.children[0] as Expr;
    }

    get argList(): ArgumentList {
        return this.children[1] as ArgumentList;
    }
}

export abstract class PrimaryExpr extends Expr {
}

export class IntLitExpr extends PrimaryExpr {
    constructor(value: IntNode) {
        super([value]);
    }

    get value(): IntNode {
        return this.children[0] as IntNode;
    }
}

export class StrLitExpr extends PrimaryExpr {
    constructor(value: StrNode) {
        super([value]);
    }

    get value(): StrNode {
        return this.children[0] as StrNode;
    }
}

export class BoolLitExpr extends PrimaryExpr {
    constructor(value: BoolNode) {
        super([value]);
    }

    get value(): BoolNode {
        return this.children[0] as BoolNode;
    }
}

export class NoneLitExpr extends PrimaryExpr {
    constructor() {
        super([]);
    }
}

export class ParenExpr extends PrimaryExpr {
    constructor(innerExpr: Expr) {
        super([innerExpr]);
    }

    get innerExpr(): Expr {
        return this.children[0] as Expr;
    }
}

export class DoExpr extends PrimaryExpr {
    constructor(statement: Statement) {
        super([statement]);
    }

    get statement(): Statement {
        return this.children[0] as Statement;
    }
}

export class ArrayInitializerExpr extends PrimaryExpr {
    constructor(elements: Array<Expr>) {
        super(elements);
    }

    get elements(): Array<Expr> {
        return this.children as Array<Expr>;
    }
}

export class VarRefExpr extends PrimaryExpr {
    constructor(name: StrNode) {
        super([name]);
    }

    get name(): StrNode {
        return this.children[0] as StrNode;
    }
}

export class QuoteExpr extends PrimaryExpr {
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }

    get statements(): Array<Statement | Decl> {
        return this.children as Array<Statement | Decl>;
    }
}

export class UnquoteExpr extends PrimaryExpr {
    constructor(innerExpr: Expr) {
        super([innerExpr]);
    }

    get innerExpr(): Expr {
        return this.children[0] as Expr;
    }
}

