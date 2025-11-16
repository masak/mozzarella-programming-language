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
    ReturnStatement,
    Statement,
    StrLitExpr,
    SyntaxNode,
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

export function reifyNode(
    syntaxNode: SyntaxNode | null,
): SyntaxNodeValue | NoneValue {
    if (syntaxNode === null) {
        return new NoneValue();
    }
    else if (syntaxNode instanceof Token) {
        let tokenKind = syntaxNode.kind;
        if (tokenKind === TokenKind.IntLit) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_INT_LIT,
                [],
                new IntValue(syntaxNode.payload as bigint),
            );
        }
        else if (tokenKind === TokenKind.StrLit) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_STR_LIT,
                [],
                new StrValue(syntaxNode.payload as string),
            );
        }
        else if (tokenKind === TokenKind.TrueKeyword) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_TRUE_KEYWORD,
                [],
                new BoolValue(true),
            );
        }
        else if (tokenKind === TokenKind.FalseKeyword) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_FALSE_KEYWORD,
                [],
                new BoolValue(false),
            );
        }
        else if (tokenKind === TokenKind.NoneKeyword) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_NONE_KEYWORD,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Plus) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_PLUS,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Minus) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_MINUS,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Mult) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_MULT,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.FloorDiv) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_FLOOR_DIV,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Mod) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_MOD,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Tilde) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_TILDE,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Quest) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_QUEST,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Bang) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_BANG,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.AmpAmp) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_AMP_AMP,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.PipePipe) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_PIPE_PIPE,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Less) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_LESS,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.LessEq) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_LESS_EQ,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Greater) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_GREATER,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.GreaterEq) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_GREATER_EQ,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.EqEq) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_EQ_EQ,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.BangEq) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_BANG_EQ,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Assign) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_ASSIGN,
                [],
                new NoneValue(),
            );
        }
        else if (tokenKind === TokenKind.Identifier) {
            return new SyntaxNodeValue(
                SYNTAX_KIND__TOKEN_IDENTIFIER,
                [],
                new StrValue(syntaxNode.payload as string),
            );
        }
        else {
            throw new E000_InternalError(
                `Unrecognized token kind ${tokenKind.kind}`
            );
        }
    }
    else if (syntaxNode instanceof CompUnit) {
        let statements = syntaxNode.statements;
        return new SyntaxNodeValue(
            SYNTAX_KIND__COMPUNIT,
            statements.map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof Block) {
        let statements = syntaxNode.statements;
        return new SyntaxNodeValue(
            SYNTAX_KIND__BLOCK,
            statements.map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ExprStatement) {
        let expr = syntaxNode.expr;
        return new SyntaxNodeValue(
            SYNTAX_KIND__EXPR_STATEMENT,
            [reifyNode(expr)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof EmptyStatement) {
        return new SyntaxNodeValue(
            SYNTAX_KIND__EMPTY_STATEMENT,
            [],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof BlockStatement) {
        let block = syntaxNode.block;
        return new SyntaxNodeValue(
            SYNTAX_KIND__BLOCK_STATEMENT,
            [reifyNode(block)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof IfClause) {
        let condExpr = syntaxNode.condExpr;
        let block = syntaxNode.block;
        return new SyntaxNodeValue(
            SYNTAX_KIND__IF_CLAUSE,
            [reifyNode(condExpr), reifyNode(block)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof IfClauseList) {
        let clauses = syntaxNode.clauses;
        return new SyntaxNodeValue(
            SYNTAX_KIND__IF_CLAUSE_LIST,
            clauses.map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof IfStatement) {
        let clauseList = syntaxNode.clauseList;
        let elseBlock = syntaxNode.elseBlock;
        return new SyntaxNodeValue(
            SYNTAX_KIND__IF_STATEMENT,
            [reifyNode(clauseList), reifyNode(elseBlock)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ForStatement) {
        let nameToken = syntaxNode.nameToken;
        let arrayExpr = syntaxNode.arrayExpr;
        let body = syntaxNode.body;
        return new SyntaxNodeValue(
            SYNTAX_KIND__FOR_STATEMENT,
            [reifyNode(nameToken), reifyNode(arrayExpr), reifyNode(body)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof WhileStatement) {
        let condExpr = syntaxNode.condExpr;
        let body = syntaxNode.body;
        return new SyntaxNodeValue(
            SYNTAX_KIND__WHILE_STATEMENT,
            [reifyNode(condExpr), reifyNode(body)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof LastStatement) {
        return new SyntaxNodeValue(
            SYNTAX_KIND__LAST_STATEMENT,
            [],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof NextStatement) {
        return new SyntaxNodeValue(
            SYNTAX_KIND__NEXT_STATEMENT,
            [],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ReturnStatement) {
        let expr = syntaxNode.expr;
        return new SyntaxNodeValue(
            SYNTAX_KIND__RETURN_STATEMENT,
            [reifyNode(expr)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof Statement) {
        throw new E000_InternalError(
            "Converting unknown statement node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    else if (syntaxNode instanceof VarDecl) {
        let nameToken = syntaxNode.nameToken;
        let type = syntaxNode.type;
        let initExpr = syntaxNode.initExpr;
        return new SyntaxNodeValue(
            SYNTAX_KIND__VAR_DECL,
            [reifyNode(nameToken), reifyNode(type), reifyNode(initExpr)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof Parameter) {
        let nameToken = syntaxNode.nameToken;
        let type = syntaxNode.type;
        return new SyntaxNodeValue(
            SYNTAX_KIND__PARAMETER,
            [reifyNode(nameToken), reifyNode(type)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ParameterList) {
        let parameters = syntaxNode.parameters;
        return new SyntaxNodeValue(
            SYNTAX_KIND__PARAMETER_LIST,
            parameters.map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof FuncDecl) {
        let nameToken = syntaxNode.nameToken;
        let parameterList = syntaxNode.parameterList;
        let type = syntaxNode.type;
        let body = syntaxNode.body;
        return new SyntaxNodeValue(
            SYNTAX_KIND__FUNC_DECL,
            [nameToken, parameterList, type, body].map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof MacroDecl) {
        let nameToken = syntaxNode.nameToken;
        let parameterList = syntaxNode.parameterList;
        let type = syntaxNode.type;
        let body = syntaxNode.body;
        return new SyntaxNodeValue(
            SYNTAX_KIND__MACRO_DECL,
            [nameToken, parameterList, type, body].map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof Decl) {
        throw new E000_InternalError(
            "Converting unknown declaration node type '" +
                syntaxNode.constructor.name + "'"
        );
    }
    else if (syntaxNode instanceof PrefixOpExpr) {
        let opToken = syntaxNode.opToken;
        let operand = syntaxNode.operand;
        return new SyntaxNodeValue(
            SYNTAX_KIND__PREFIX_OP_EXPR,
            [reifyNode(opToken), reifyNode(operand)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof InfixOpExpr) {
        let lhs = syntaxNode.lhs;
        let opToken = syntaxNode.opToken;
        let rhs = syntaxNode.rhs;
        return new SyntaxNodeValue(
            SYNTAX_KIND__INFIX_OP_EXPR,
            [reifyNode(lhs), reifyNode(opToken), reifyNode(rhs)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof IndexingExpr) {
        let arrayExpr = syntaxNode.arrayExpr;
        let indexExpr = syntaxNode.indexExpr;
        return new SyntaxNodeValue(
            SYNTAX_KIND__INDEXING_EXPR,
            [reifyNode(arrayExpr), reifyNode(indexExpr)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof Argument) {
        let expr = syntaxNode.expr;
        return new SyntaxNodeValue(
            SYNTAX_KIND__ARGUMENT,
            [reifyNode(expr)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ArgumentList) {
        let args = syntaxNode.args;
        return new SyntaxNodeValue(
            SYNTAX_KIND__ARGUMENT_LIST,
            args.map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof CallExpr) {
        let funcExpr = syntaxNode.funcExpr;
        let argList = syntaxNode.argList;
        return new SyntaxNodeValue(
            SYNTAX_KIND__CALL_EXPR,
            [reifyNode(funcExpr), reifyNode(argList)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof IntLitExpr) {
        let valueToken = syntaxNode.valueToken;
        return new SyntaxNodeValue(
            SYNTAX_KIND__INT_LIT_EXPR,
            [reifyNode(valueToken)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof StrLitExpr) {
        let valueToken = syntaxNode.valueToken;
        return new SyntaxNodeValue(
            SYNTAX_KIND__STR_LIT_EXPR,
            [reifyNode(valueToken)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof BoolLitExpr) {
        let valueToken = syntaxNode.valueToken;
        return new SyntaxNodeValue(
            SYNTAX_KIND__BOOL_LIT_EXPR,
            [reifyNode(valueToken)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof NoneLitExpr) {
        return new SyntaxNodeValue(
            SYNTAX_KIND__BOOL_LIT_EXPR,
            [],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ParenExpr) {
        let innerExpr = syntaxNode.innerExpr;
        return new SyntaxNodeValue(
            SYNTAX_KIND__PAREN_EXPR,
            [reifyNode(innerExpr)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof DoExpr) {
        let statement = syntaxNode.statement;
        return new SyntaxNodeValue(
            SYNTAX_KIND__DO_EXPR,
            [reifyNode(statement)],
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof ArrayInitializerExpr) {
        let elements = syntaxNode.elements;
        return new SyntaxNodeValue(
            SYNTAX_KIND__ARRAY_INITIALIZER_EXPR,
            elements.map(reifyNode),
            new NoneValue(),
        );
    }
    else if (syntaxNode instanceof VarRefExpr) {
        let nameToken = syntaxNode.nameToken;
        return new SyntaxNodeValue(
            SYNTAX_KIND__VAR_REF_EXPR,
            [reifyNode(nameToken)],
            new NoneValue(),
        );
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
            `Converting unknown node type '${syntaxNode.constructor.name}'`
        );
    }
}

