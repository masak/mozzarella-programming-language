import {
    Argument,
    ArgumentList,
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    BoolNode,
    CallExpr,
    CompUnit,
    Decl,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    ForStatement,
    FuncDecl,
    IfClause,
    IfClauseList,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    IntNode,
    LastStatement,
    MacroDecl,
    NextStatement,
    NoneLitExpr,
    Parameter,
    ParameterList,
    ParenExpr,
    PrefixOpExpr,
    PrimaryExpr,
    QuoteExpr,
    ReturnStatement,
    Statement,
    StrLitExpr,
    StrNode,
    SyntaxNode,
    UnquoteExpr,
    VarDecl,
    VarRefExpr,
    WhileStatement,
} from "../compiler/syntax";
import {
    E000_InternalError,
} from "./error";
import {
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    SyntaxNodeValue,
} from "./value";

export const SYNTAX_KIND__INT_NODE = new IntValue(BigInt(0x1001));
export const SYNTAX_KIND__STR_NODE = new IntValue(BigInt(0x1002));
export const SYNTAX_KIND__BOOL_NODE = new IntValue(BigInt(0x1003));
export const SYNTAX_KIND__COMPUNIT = new IntValue(BigInt(0x2000));
export const SYNTAX_KIND__BLOCK = new IntValue(BigInt(0x2001));
export const SYNTAX_KIND__STATEMENT = new IntValue(BigInt(0x2002));
export const SYNTAX_KIND__EXPR_STATEMENT = new IntValue(BigInt(0x2003));
export const SYNTAX_KIND__EMPTY_STATEMENT = new IntValue(BigInt(0x2004));
export const SYNTAX_KIND__BLOCK_STATEMENT = new IntValue(BigInt(0x2005));
export const SYNTAX_KIND__IF_CLAUSE = new IntValue(BigInt(0x2006));
export const SYNTAX_KIND__IF_CLAUSE_LIST = new IntValue(BigInt(0x2007));
export const SYNTAX_KIND__IF_STATEMENT = new IntValue(BigInt(0x2008));
export const SYNTAX_KIND__FOR_STATEMENT = new IntValue(BigInt(0x2009));
export const SYNTAX_KIND__WHILE_STATEMENT = new IntValue(BigInt(0x200A));
export const SYNTAX_KIND__LAST_STATEMENT = new IntValue(BigInt(0x200B));
export const SYNTAX_KIND__NEXT_STATEMENT = new IntValue(BigInt(0x200C));
export const SYNTAX_KIND__RETURN_STATEMENT = new IntValue(BigInt(0x200D));
export const SYNTAX_KIND__DECL = new IntValue(BigInt(0x200E));
export const SYNTAX_KIND__VAR_DECL = new IntValue(BigInt(0x200F));
export const SYNTAX_KIND__PARAMETER = new IntValue(BigInt(0x2010));
export const SYNTAX_KIND__PARAMETER_LIST = new IntValue(BigInt(0x2011));
export const SYNTAX_KIND__FUNC_DECL = new IntValue(BigInt(0x2012));
export const SYNTAX_KIND__MACRO_DECL = new IntValue(BigInt(0x2013));
export const SYNTAX_KIND__EXPR = new IntValue(BigInt(0x2014));
export const SYNTAX_KIND__PREFIX_OP_EXPR = new IntValue(BigInt(0x2015));
export const SYNTAX_KIND__INFIX_OP_EXPR = new IntValue(BigInt(0x2016));
export const SYNTAX_KIND__INDEXING_EXPR = new IntValue(BigInt(0x2017));
export const SYNTAX_KIND__ARGUMENT = new IntValue(BigInt(0x2018));
export const SYNTAX_KIND__ARGUMENT_LIST = new IntValue(BigInt(0x2019));
export const SYNTAX_KIND__CALL_EXPR = new IntValue(BigInt(0x201A));
export const SYNTAX_KIND__PRIMARY_EXPR = new IntValue(BigInt(0x201B));
export const SYNTAX_KIND__INT_LIT_EXPR = new IntValue(BigInt(0x201C));
export const SYNTAX_KIND__STR_LIT_EXPR = new IntValue(BigInt(0x201D));
export const SYNTAX_KIND__BOOL_LIT_EXPR = new IntValue(BigInt(0x201E));
export const SYNTAX_KIND__NONE_LIT_EXPR = new IntValue(BigInt(0x201F));
export const SYNTAX_KIND__PAREN_EXPR = new IntValue(BigInt(0x2020));
export const SYNTAX_KIND__DO_EXPR = new IntValue(BigInt(0x2021));
export const SYNTAX_KIND__ARRAY_INITIALIZER_EXPR
    = new IntValue(BigInt(0x2022));
export const SYNTAX_KIND__VAR_REF_EXPR = new IntValue(BigInt(0x2023));
export const SYNTAX_KIND__QUOTE_EXPR = new IntValue(BigInt(0x2024));
export const SYNTAX_KIND__UNQUOTE_EXPR = new IntValue(BigInt(0x2025));

const exprKinds = new Set([
    SYNTAX_KIND__PREFIX_OP_EXPR,
    SYNTAX_KIND__INFIX_OP_EXPR,
    SYNTAX_KIND__INDEXING_EXPR,
    SYNTAX_KIND__ARGUMENT,
    SYNTAX_KIND__ARGUMENT_LIST,
    SYNTAX_KIND__CALL_EXPR,
    SYNTAX_KIND__INT_LIT_EXPR,
    SYNTAX_KIND__STR_LIT_EXPR,
    SYNTAX_KIND__BOOL_LIT_EXPR,
    SYNTAX_KIND__NONE_LIT_EXPR,
    SYNTAX_KIND__PAREN_EXPR,
    SYNTAX_KIND__DO_EXPR,
    SYNTAX_KIND__ARRAY_INITIALIZER_EXPR,
    SYNTAX_KIND__VAR_REF_EXPR,
    SYNTAX_KIND__QUOTE_EXPR,
    SYNTAX_KIND__UNQUOTE_EXPR,
]);

export function isExprKind(syntaxNodeValue: SyntaxNodeValue): boolean {
    return exprKinds.has(syntaxNodeValue.kind);
}

const statementKinds = new Set([
    SYNTAX_KIND__EXPR_STATEMENT,
    SYNTAX_KIND__EMPTY_STATEMENT,
    SYNTAX_KIND__BLOCK_STATEMENT,
    SYNTAX_KIND__IF_STATEMENT,
    SYNTAX_KIND__FOR_STATEMENT,
    SYNTAX_KIND__WHILE_STATEMENT,
    SYNTAX_KIND__LAST_STATEMENT,
    SYNTAX_KIND__NEXT_STATEMENT,
    SYNTAX_KIND__RETURN_STATEMENT,
]);

export function isStatementKind(syntaxNodeValue: SyntaxNodeValue): boolean {
    return statementKinds.has(syntaxNodeValue.kind);
}

export function kindAndPayloadOfNode(
    syntaxNode: SyntaxNode,
): [IntValue, IntValue | StrValue | BoolValue | NoneValue] {
    let kind: IntValue;
    let payload: IntValue | StrValue | BoolValue | NoneValue;
    if (syntaxNode instanceof IntNode) {
        kind = SYNTAX_KIND__INT_NODE;
        payload = new IntValue(syntaxNode.payload as bigint);
    }
    else if (syntaxNode instanceof StrNode) {
        kind = SYNTAX_KIND__STR_NODE;
        payload = new StrValue(syntaxNode.payload as string);
    }
    else if (syntaxNode instanceof BoolNode) {
        kind = SYNTAX_KIND__BOOL_NODE;
        payload = new BoolValue(syntaxNode.payload as boolean);
    }
    else if (syntaxNode instanceof CompUnit) {
        kind = SYNTAX_KIND__COMPUNIT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof Block) {
        kind = SYNTAX_KIND__BLOCK;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ExprStatement) {
        kind = SYNTAX_KIND__EXPR_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof EmptyStatement) {
        kind = SYNTAX_KIND__EMPTY_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof BlockStatement) {
        kind = SYNTAX_KIND__BLOCK_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof IfClause) {
        kind = SYNTAX_KIND__IF_CLAUSE;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof IfClauseList) {
        kind = SYNTAX_KIND__IF_CLAUSE_LIST;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof IfStatement) {
        kind = SYNTAX_KIND__IF_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ForStatement) {
        kind = SYNTAX_KIND__FOR_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof WhileStatement) {
        kind = SYNTAX_KIND__WHILE_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof LastStatement) {
        kind = SYNTAX_KIND__LAST_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof NextStatement) {
        kind = SYNTAX_KIND__NEXT_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ReturnStatement) {
        kind = SYNTAX_KIND__RETURN_STATEMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof Statement) {
        throw new E000_InternalError(
            "Converting unknown statement node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    else if (syntaxNode instanceof VarDecl) {
        kind = SYNTAX_KIND__VAR_DECL;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof Parameter) {
        kind = SYNTAX_KIND__PARAMETER;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ParameterList) {
        kind = SYNTAX_KIND__PARAMETER_LIST;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof FuncDecl) {
        kind = SYNTAX_KIND__FUNC_DECL;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof MacroDecl) {
        kind = SYNTAX_KIND__MACRO_DECL;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof Decl) {
        throw new E000_InternalError(
            "Converting unknown declaration node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    else if (syntaxNode instanceof PrefixOpExpr) {
        kind = SYNTAX_KIND__PREFIX_OP_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof InfixOpExpr) {
        kind = SYNTAX_KIND__INFIX_OP_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof IndexingExpr) {
        kind = SYNTAX_KIND__INDEXING_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof Argument) {
        kind = SYNTAX_KIND__ARGUMENT;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ArgumentList) {
        kind = SYNTAX_KIND__ARGUMENT_LIST;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof CallExpr) {
        kind = SYNTAX_KIND__CALL_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof IntLitExpr) {
        kind = SYNTAX_KIND__INT_LIT_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof StrLitExpr) {
        kind = SYNTAX_KIND__STR_LIT_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof BoolLitExpr) {
        kind = SYNTAX_KIND__BOOL_LIT_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof NoneLitExpr) {
        kind = SYNTAX_KIND__NONE_LIT_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ParenExpr) {
        kind = SYNTAX_KIND__PAREN_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof DoExpr) {
        kind = SYNTAX_KIND__DO_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof ArrayInitializerExpr) {
        kind = SYNTAX_KIND__ARRAY_INITIALIZER_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof VarRefExpr) {
        kind = SYNTAX_KIND__VAR_REF_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof QuoteExpr) {
        kind = SYNTAX_KIND__QUOTE_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof UnquoteExpr) {
        kind = SYNTAX_KIND__UNQUOTE_EXPR;
        payload = new NoneValue();
    }
    else if (syntaxNode instanceof PrimaryExpr) {
        throw new E000_InternalError(
            "Converting unknown primary expression node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    else if (syntaxNode instanceof Expr) {
        throw new E000_InternalError(
            "Converting unknown expression node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    else {
        throw new E000_InternalError(
            "Converting unknown node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    return [kind, payload];
}

export function reifyNode(
    syntaxNode: SyntaxNode | null,
): SyntaxNodeValue | NoneValue {
    if (syntaxNode === null) {
        return new NoneValue();
    }
    else {
        let [kind, payload] = kindAndPayloadOfNode(syntaxNode);
        let children = syntaxNode.children.map(reifyNode);
        return new SyntaxNodeValue(kind, children, payload);
    }
}

