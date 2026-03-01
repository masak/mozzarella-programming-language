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
    SYNTAX_KIND__ARGUMENT,
    SYNTAX_KIND__ARGUMENT_LIST,
    SYNTAX_KIND__ARRAY_INITIALIZER_EXPR,
    SYNTAX_KIND__BLOCK,
    SYNTAX_KIND__BLOCK_STATEMENT,
    SYNTAX_KIND__BOOL_LIT_EXPR,
    SYNTAX_KIND__BOOL_NODE,
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
    SYNTAX_KIND__INT_NODE,
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
    SYNTAX_KIND__STR_NODE,
    SYNTAX_KIND__UNQUOTE_EXPR,
    SYNTAX_KIND__VAR_DECL,
    SYNTAX_KIND__VAR_REF_EXPR,
    SYNTAX_KIND__WHILE_STATEMENT,
} from "./reify";
import {
    BoolValue,
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
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__INT_NODE)) {
        return new IntNode((syntaxNodeValue.payload as IntValue).payload);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__STR_NODE)) {
        return new StrNode((syntaxNodeValue.payload as StrValue).payload);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__BOOL_NODE)) {
        return new BoolNode((syntaxNodeValue.payload as BoolValue).payload);
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
        let name = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        let arrayExpr = absorbNode(syntaxNodeValue.children[1]) as Expr;
        let body = absorbNode(syntaxNodeValue.children[2]) as Block;
        return new ForStatement(name, arrayExpr, body);
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
        let name = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        let type = absorbNode(syntaxNodeValue.children[1]) as null;
        let initExpr = absorbNode(syntaxNodeValue.children[2]) as Expr | null;
        return new VarDecl(name, type, initExpr);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PARAMETER)) {
        let name = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        let type = absorbNode(syntaxNodeValue.children[1]) as null;
        return new Parameter(name, type);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PARAMETER_LIST)) {
        let parameters
            = syntaxNodeValue.children.map(absorbNode) as Array<Parameter>;
        return new ParameterList(parameters);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__FUNC_DECL)) {
        let name = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        let parameterList
            = absorbNode(syntaxNodeValue.children[1]) as ParameterList;
        let type = absorbNode(syntaxNodeValue.children[2]) as null;
        let body = absorbNode(syntaxNodeValue.children[3]) as Block;
        return new FuncDecl(name, parameterList, type, body);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__MACRO_DECL)) {
        let name = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        let parameterList
            = absorbNode(syntaxNodeValue.children[1]) as ParameterList;
        let type = absorbNode(syntaxNodeValue.children[2]) as null;
        let body = absorbNode(syntaxNodeValue.children[3]) as Block;
        return new MacroDecl(name, parameterList, type, body);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__EXPR)) {
        throw new E000_InternalError("Conversion of abstract expression");
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__PREFIX_OP_EXPR)) {
        let opName = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        let operand = absorbNode(syntaxNodeValue.children[1]) as Expr;
        return new PrefixOpExpr(opName, operand);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__INFIX_OP_EXPR)) {
        let lhs = absorbNode(syntaxNodeValue.children[0]) as Expr;
        let opName = absorbNode(syntaxNodeValue.children[1]) as StrNode;
        let rhs = absorbNode(syntaxNodeValue.children[2]) as Expr;
        return new InfixOpExpr(lhs, opName, rhs);
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
        let value = absorbNode(syntaxNodeValue.children[0]) as IntNode;
        return new IntLitExpr(value);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__STR_LIT_EXPR)) {
        let value = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        return new StrLitExpr(value);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__BOOL_LIT_EXPR)) {
        let value = absorbNode(syntaxNodeValue.children[0]) as BoolNode;
        return new BoolLitExpr(value);
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
        let name = absorbNode(syntaxNodeValue.children[0]) as StrNode;
        return new VarRefExpr(name);
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

