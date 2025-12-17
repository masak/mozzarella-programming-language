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
    SYNTAX_KIND__ARGUMENT,
    SYNTAX_KIND__ARGUMENT_LIST,
    SYNTAX_KIND__ARRAY_INITIALIZER_EXPR,
    SYNTAX_KIND__BLOCK,
    SYNTAX_KIND__BLOCK_STATEMENT,
    SYNTAX_KIND__BOOL_LIT_EXPR,
    SYNTAX_KIND__CALL_EXPR,
    SYNTAX_KIND__COMPUNIT,
    SYNTAX_KIND__DECL,
    SYNTAX_KIND__DO_EXPR,
    SYNTAX_KIND__EMPTY_STATEMENT,
    SYNTAX_KIND__EXPR,
    SYNTAX_KIND__EXPR_STATEMENT,
    SYNTAX_KIND__FOR_STATEMENT,
    SYNTAX_KIND__FUNC_DECL,
    SYNTAX_KIND__IF_CLAUSE,
    SYNTAX_KIND__IF_CLAUSE_LIST,
    SYNTAX_KIND__IF_STATEMENT,
    SYNTAX_KIND__INDEXING_EXPR,
    SYNTAX_KIND__INFIX_OP_EXPR,
    SYNTAX_KIND__INT_LIT_EXPR,
    SYNTAX_KIND__LAST_STATEMENT,
    SYNTAX_KIND__MACRO_DECL,
    SYNTAX_KIND__NEXT_STATEMENT,
    SYNTAX_KIND__NONE_LIT_EXPR,
    SYNTAX_KIND__PARAMETER,
    SYNTAX_KIND__PARAMETER_LIST,
    SYNTAX_KIND__PAREN_EXPR,
    SYNTAX_KIND__PREFIX_OP_EXPR,
    SYNTAX_KIND__PRIMARY_EXPR,
    SYNTAX_KIND__QUOTE_EXPR,
    SYNTAX_KIND__RETURN_STATEMENT,
    SYNTAX_KIND__STATEMENT,
    SYNTAX_KIND__STR_LIT_EXPR,
    SYNTAX_KIND__TOKEN_AMP_AMP,
    SYNTAX_KIND__TOKEN_ASSIGN,
    SYNTAX_KIND__TOKEN_BANG,
    SYNTAX_KIND__TOKEN_BANG_EQ,
    SYNTAX_KIND__TOKEN_EQ_EQ,
    SYNTAX_KIND__TOKEN_FALSE_KEYWORD,
    SYNTAX_KIND__TOKEN_FLOOR_DIV,
    SYNTAX_KIND__TOKEN_GREATER,
    SYNTAX_KIND__TOKEN_GREATER_EQ,
    SYNTAX_KIND__TOKEN_IDENTIFIER,
    SYNTAX_KIND__TOKEN_INT_LIT,
    SYNTAX_KIND__TOKEN_LESS,
    SYNTAX_KIND__TOKEN_LESS_EQ,
    SYNTAX_KIND__TOKEN_MINUS,
    SYNTAX_KIND__TOKEN_MOD,
    SYNTAX_KIND__TOKEN_MULT,
    SYNTAX_KIND__TOKEN_NONE_KEYWORD,
    SYNTAX_KIND__TOKEN_PIPE_PIPE,
    SYNTAX_KIND__TOKEN_PLUS,
    SYNTAX_KIND__TOKEN_QUEST,
    SYNTAX_KIND__TOKEN_STR_LIT,
    SYNTAX_KIND__TOKEN_TILDE,
    SYNTAX_KIND__TOKEN_TRUE_KEYWORD,
    SYNTAX_KIND__UNQUOTE_EXPR,
    SYNTAX_KIND__VAR_DECL,
    SYNTAX_KIND__VAR_REF_EXPR,
    SYNTAX_KIND__WHILE_STATEMENT,
} from "./reify";
import {
    IntValue,
    NoneValue,
    StrValue,
    SyntaxNodeValue,
} from "./value";

function hasKind(syntaxNodeValue: SyntaxNodeValue, intValue: IntValue) {
    return syntaxNodeValue.kind.payload === intValue.payload;
}

export function absorbNode(
    syntaxNodeValue: SyntaxNodeValue | NoneValue,
): SyntaxNode | null {
    if (syntaxNodeValue instanceof NoneValue) {
        return null;
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_INT_LIT)) {
        return new Token(
            TokenKind.IntLit,
            (syntaxNodeValue.payload as IntValue).payload,
        );
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_STR_LIT)) {
        return new Token(
            TokenKind.StrLit,
            (syntaxNodeValue.payload as StrValue).payload,
        );
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_TRUE_KEYWORD)) {
        return new Token(TokenKind.TrueKeyword);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_FALSE_KEYWORD)) {
        return new Token(TokenKind.FalseKeyword);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_NONE_KEYWORD)) {
        return new Token(TokenKind.NoneKeyword);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_PLUS)) {
        return new Token(TokenKind.Plus);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_MINUS)) {
        return new Token(TokenKind.Minus);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_MULT)) {
        return new Token(TokenKind.Mult);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_FLOOR_DIV)) {
        return new Token(TokenKind.FloorDiv);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_MOD)) {
        return new Token(TokenKind.Mod);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_TILDE)) {
        return new Token(TokenKind.Tilde);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_QUEST)) {
        return new Token(TokenKind.Quest);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_BANG)) {
        return new Token(TokenKind.Bang);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_AMP_AMP)) {
        return new Token(TokenKind.AmpAmp);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_PIPE_PIPE)) {
        return new Token(TokenKind.PipePipe);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_LESS)) {
        return new Token(TokenKind.Less);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_LESS_EQ)) {
        return new Token(TokenKind.LessEq);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_GREATER)) {
        return new Token(TokenKind.Greater);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_GREATER_EQ)) {
        return new Token(TokenKind.GreaterEq);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_EQ_EQ)) {
        return new Token(TokenKind.EqEq);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_BANG_EQ)) {
        return new Token(TokenKind.BangEq);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_ASSIGN)) {
        return new Token(TokenKind.Assign);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__TOKEN_IDENTIFIER)) {
        return new Token(
            TokenKind.Identifier,
            (syntaxNodeValue.payload as StrValue).payload,
        );
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__COMPUNIT)) {
        let statements
            = syntaxNodeValue.children
                .map(absorbNode) as Array<Statement | Decl>;
        return new CompUnit(statements);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__BLOCK)) {
        let statements
            = syntaxNodeValue.children
                .map(absorbNode) as Array<Statement | Decl>;
        return new Block(statements);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__STATEMENT)) {
        throw new E000_InternalError("Conversion of abstract statement");
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__EXPR_STATEMENT)) {
        let expr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        return new ExprStatement(expr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__EMPTY_STATEMENT)) {
        return new EmptyStatement();
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__BLOCK_STATEMENT)) {
        let block = absorbNode(syntaxNodeValue.children[0]) as Block;
        return new BlockStatement(block);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__IF_CLAUSE)) {
        let condExpr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        let block = absorbNode(syntaxNodeValue.children[1]) as Block;
        return new IfClause(condExpr, block);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__IF_CLAUSE_LIST)) {
        let clauses = syntaxNodeValue.children.map(absorbNode) as Array<IfClause>;
        return new IfClauseList(clauses);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__IF_STATEMENT)) {
        let clauseList = absorbNode(syntaxNodeValue.children[0]) as IfClauseList;
        let elseBlock = absorbNode(syntaxNodeValue.children[1]) as Block | null;
        return new IfStatement(clauseList, elseBlock);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__FOR_STATEMENT)) {
        let nameToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        let arrayExpr = absorbNode(syntaxNodeValue.children[1]) as Expr;
        let body = absorbNode(syntaxNodeValue.children[2]) as Block;
        return new ForStatement(nameToken, arrayExpr, body);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__WHILE_STATEMENT)) {
        let condExpr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        let body = absorbNode(syntaxNodeValue.children[1]) as Block;
        return new WhileStatement(condExpr, body);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__LAST_STATEMENT)) {
        return new LastStatement();
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__NEXT_STATEMENT)) {
        return new NextStatement();
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__RETURN_STATEMENT)) {
        let expr = absorbNode(syntaxNodeValue.children[0]) as Expr | null;
        return new ReturnStatement(expr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__DECL)) {
        throw new E000_InternalError("Conversion of abstract declaration");
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__VAR_DECL)) {
        let nameToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        let type = absorbNode(syntaxNodeValue.children[1]) as null;
        let initExpr = absorbNode(syntaxNodeValue.children[2]) as Expr | null;
        return new VarDecl(nameToken, type, initExpr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PARAMETER)) {
        let nameToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        let type = absorbNode(syntaxNodeValue.children[1]) as null;
        return new Parameter(nameToken, type);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PARAMETER_LIST)) {
        let parameters
            = syntaxNodeValue.children.map(absorbNode) as Array<Parameter>;
        return new ParameterList(parameters);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__FUNC_DECL)) {
        let nameToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        let parameterList
            = absorbNode(syntaxNodeValue.children[1]) as ParameterList;
        let type = absorbNode(syntaxNodeValue.children[2]) as null;
        let body = absorbNode(syntaxNodeValue.children[3]) as Block;
        return new FuncDecl(nameToken, parameterList, type, body);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__MACRO_DECL)) {
        let nameToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        let parameterList
            = absorbNode(syntaxNodeValue.children[1]) as ParameterList;
        let type = absorbNode(syntaxNodeValue.children[2]) as null;
        let body = absorbNode(syntaxNodeValue.children[3]) as Block;
        return new MacroDecl(nameToken, parameterList, type, body);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__EXPR)) {
        throw new E000_InternalError("Conversion of abstract expression");
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PREFIX_OP_EXPR)) {
        let opToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        let operand = absorbNode(syntaxNodeValue.children[1]) as Expr;
        return new PrefixOpExpr(opToken, operand);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__INFIX_OP_EXPR)) {
        let lhs = absorbNode(syntaxNodeValue.children[0]) as Expr;
        let opToken = absorbNode(syntaxNodeValue.children[1]) as Token;
        let rhs = absorbNode(syntaxNodeValue.children[2]) as Expr;
        return new InfixOpExpr(lhs, opToken, rhs);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__INDEXING_EXPR)) {
        let arrayExpr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        let indexExpr = absorbNode(syntaxNodeValue.children[1]) as Expr;
        return new IndexingExpr(arrayExpr, indexExpr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__ARGUMENT)) {
        let expr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        return new Argument(expr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__ARGUMENT_LIST)) {
        let args = syntaxNodeValue.children.map(absorbNode) as Array<Argument>;
        return new ArgumentList(args);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__CALL_EXPR)) {
        let funcExpr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        let argList = absorbNode(syntaxNodeValue.children[1]) as ArgumentList;
        return new CallExpr(funcExpr, argList);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PRIMARY_EXPR)) {
        throw new E000_InternalError(
            "Conversion of abstract primary expression"
        );
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__INT_LIT_EXPR)) {
        let valueToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        return new IntLitExpr(valueToken);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__STR_LIT_EXPR)) {
        let valueToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        return new StrLitExpr(valueToken);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__BOOL_LIT_EXPR)) {
        let valueToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        return new BoolLitExpr(valueToken);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__NONE_LIT_EXPR)) {
        return new NoneLitExpr();
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PAREN_EXPR)) {
        let innerExpr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        return new ParenExpr(innerExpr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__DO_EXPR)) {
        let statement = absorbNode(syntaxNodeValue.children[0]) as Statement;
        return new DoExpr(statement);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__ARRAY_INITIALIZER_EXPR)) {
        let elements = syntaxNodeValue.children.map(absorbNode) as Array<Expr>;
        return new ArrayInitializerExpr(elements);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__VAR_REF_EXPR)) {
        let nameToken = absorbNode(syntaxNodeValue.children[0]) as Token;
        return new VarRefExpr(nameToken);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__QUOTE_EXPR)) {
        let statements
            = syntaxNodeValue.children
                .map(absorbNode) as Array<Statement | Decl>;
        return new QuoteExpr(statements);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__UNQUOTE_EXPR)) {
        let innerExpr = absorbNode(syntaxNodeValue.children[0]) as Expr;
        return new UnquoteExpr(innerExpr);
    }
    else {
        throw new E000_InternalError(
            "Converting unknown node kind '" +
                syntaxNodeValue.kind.payload + "'"
        );
    }
}

