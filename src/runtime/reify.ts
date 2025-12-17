import {
    Argument,
    ArgumentList,
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
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
    SyntaxNode,
    UnquoteExpr,
    VarDecl,
    VarRefExpr,
    WhileStatement,
} from "../compiler/syntax";
import {
    Token,
    TokenKind,
} from "../compiler/token";
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

export const SYNTAX_KIND__TOKEN_INT_LIT = new IntValue(BigInt(0x1001));
export const SYNTAX_KIND__TOKEN_STR_LIT = new IntValue(BigInt(0x1002));
export const SYNTAX_KIND__TOKEN_TRUE_KEYWORD = new IntValue(BigInt(0x1003));
export const SYNTAX_KIND__TOKEN_FALSE_KEYWORD = new IntValue(BigInt(0x1004));
export const SYNTAX_KIND__TOKEN_NONE_KEYWORD = new IntValue(BigInt(0x1005));
export const SYNTAX_KIND__TOKEN_PLUS = new IntValue(BigInt(0x1006));
export const SYNTAX_KIND__TOKEN_MINUS = new IntValue(BigInt(0x1007));
export const SYNTAX_KIND__TOKEN_MULT = new IntValue(BigInt(0x1008));
export const SYNTAX_KIND__TOKEN_FLOOR_DIV = new IntValue(BigInt(0x1009));
export const SYNTAX_KIND__TOKEN_MOD = new IntValue(BigInt(0x100A));
export const SYNTAX_KIND__TOKEN_TILDE = new IntValue(BigInt(0x100B));
export const SYNTAX_KIND__TOKEN_QUEST = new IntValue(BigInt(0x100C));
export const SYNTAX_KIND__TOKEN_BANG = new IntValue(BigInt(0x100D));
export const SYNTAX_KIND__TOKEN_AMP_AMP = new IntValue(BigInt(0x100E));
export const SYNTAX_KIND__TOKEN_PIPE_PIPE = new IntValue(BigInt(0x100F));
export const SYNTAX_KIND__TOKEN_LESS = new IntValue(BigInt(0x1010));
export const SYNTAX_KIND__TOKEN_LESS_EQ = new IntValue(BigInt(0x1011));
export const SYNTAX_KIND__TOKEN_GREATER = new IntValue(BigInt(0x1012));
export const SYNTAX_KIND__TOKEN_GREATER_EQ = new IntValue(BigInt(0x1013));
export const SYNTAX_KIND__TOKEN_EQ_EQ = new IntValue(BigInt(0x1014));
export const SYNTAX_KIND__TOKEN_BANG_EQ = new IntValue(BigInt(0x1015));
export const SYNTAX_KIND__TOKEN_ASSIGN = new IntValue(BigInt(0x1016));
export const SYNTAX_KIND__TOKEN_IDENTIFIER = new IntValue(BigInt(0x1017));
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
    if (syntaxNode instanceof Token) {
        let tokenKind = syntaxNode.kind;
        if (tokenKind === TokenKind.IntLit) {
            kind = SYNTAX_KIND__TOKEN_INT_LIT;
            payload = new IntValue(syntaxNode.payload as bigint);
        }
        else if (tokenKind === TokenKind.StrLit) {
            kind = SYNTAX_KIND__TOKEN_STR_LIT;
            payload = new StrValue(syntaxNode.payload as string);
        }
        else if (tokenKind === TokenKind.TrueKeyword) {
            kind = SYNTAX_KIND__TOKEN_TRUE_KEYWORD;
            payload = new BoolValue(true);
        }
        else if (tokenKind === TokenKind.FalseKeyword) {
            kind = SYNTAX_KIND__TOKEN_FALSE_KEYWORD;
            payload = new BoolValue(false);
        }
        else if (tokenKind === TokenKind.NoneKeyword) {
            kind = SYNTAX_KIND__TOKEN_NONE_KEYWORD;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Plus) {
            kind = SYNTAX_KIND__TOKEN_PLUS;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Minus) {
            kind = SYNTAX_KIND__TOKEN_MINUS;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Mult) {
            kind = SYNTAX_KIND__TOKEN_MULT;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.FloorDiv) {
            kind = SYNTAX_KIND__TOKEN_FLOOR_DIV;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Mod) {
            kind = SYNTAX_KIND__TOKEN_MOD;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Tilde) {
            kind = SYNTAX_KIND__TOKEN_TILDE;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Quest) {
            kind = SYNTAX_KIND__TOKEN_QUEST;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Bang) {
            kind = SYNTAX_KIND__TOKEN_BANG;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.AmpAmp) {
            kind = SYNTAX_KIND__TOKEN_AMP_AMP;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.PipePipe) {
            kind = SYNTAX_KIND__TOKEN_PIPE_PIPE;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Less) {
            kind = SYNTAX_KIND__TOKEN_LESS;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.LessEq) {
            kind = SYNTAX_KIND__TOKEN_LESS_EQ;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Greater) {
            kind = SYNTAX_KIND__TOKEN_GREATER;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.GreaterEq) {
            kind = SYNTAX_KIND__TOKEN_GREATER_EQ;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.EqEq) {
            kind = SYNTAX_KIND__TOKEN_EQ_EQ;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.BangEq) {
            kind = SYNTAX_KIND__TOKEN_BANG_EQ;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Assign) {
            kind = SYNTAX_KIND__TOKEN_ASSIGN;
            payload = new NoneValue();
        }
        else if (tokenKind === TokenKind.Identifier) {
            kind = SYNTAX_KIND__TOKEN_IDENTIFIER;
            payload = new StrValue(syntaxNode.payload as string);
        }
        else {
            throw new E000_InternalError(
                `Unrecognized token kind ${tokenKind.kind}`
            );
        }
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

