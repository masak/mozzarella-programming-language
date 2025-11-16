import {
    Token,
} from "./token";

export abstract class SyntaxNode {
    children: Array<SyntaxNode | null>;

    constructor(children: Array<SyntaxNode | null>) {
        this.children = children;
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
    constructor(nameToken: Token, arrayExpr: Expr, body: Block) {
        super([nameToken, arrayExpr, body]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
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
    constructor(nameToken: Token, type: null, initExpr: Expr | null) {
        super([nameToken, type, initExpr]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
    }

    get type(): null {
        return this.children[1] as null;
    }

    get initExpr(): Expr | null {
        return this.children[2] as Expr | null;
    }
}

export class Parameter extends SyntaxNode {
    constructor(nameToken: Token, type: null) {
        super([nameToken, type]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
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
        nameToken: Token,
        parameterList: ParameterList,
        type: null,
        body: Block,
    ) {
        super([nameToken, parameterList, type, body]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
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
        nameToken: Token,
        parameterList: ParameterList,
        type: null,
        body: Block,
    ) {
        super([nameToken, parameterList, type, body]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
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
    constructor(opToken: Token, operand: Expr) {
        super([opToken, operand]);
    }

    get opToken(): Token {
        return this.children[0] as Token;
    }

    get operand(): Expr {
        return this.children[1] as Expr;
    }
}

export class InfixOpExpr extends Expr {
    constructor(lhs: Expr, opToken: Token, rhs: Expr) {
        super([lhs, opToken, rhs]);
    }

    get lhs(): Expr {
        return this.children[0] as Expr;
    }

    get opToken(): Token {
        return this.children[1] as Token;
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
    constructor(valueToken: Token) {
        super([valueToken]);
    }

    get valueToken(): Token {
        return this.children[0] as Token;
    }
}

export class StrLitExpr extends PrimaryExpr {
    constructor(valueToken: Token) {
        super([valueToken]);
    }

    get valueToken(): Token {
        return this.children[0] as Token;
    }
}

export class BoolLitExpr extends PrimaryExpr {
    constructor(valueToken: Token) {
        super([valueToken]);
    }

    get valueToken(): Token {
        return this.children[0] as Token;
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
    constructor(nameToken: Token) {
        super([nameToken]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
    }
}

