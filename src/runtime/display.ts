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
    SYNTAX_KIND__DO_EXPR,
    SYNTAX_KIND__EMPTY_STATEMENT,
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
    SYNTAX_KIND__RETURN_STATEMENT,
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
    SYNTAX_KIND__VAR_DECL,
    SYNTAX_KIND__VAR_REF_EXPR,
    SYNTAX_KIND__WHILE_STATEMENT,
} from "./reify";
import {
    ArrayValue,
    BoolValue,
    FuncValue,
    IntValue,
    MacroValue,
    NoneValue,
    StrValue,
    SyntaxNodeValue,
    UninitValue,
    Value,
} from "./value";

function escapeString(input: string): string {
    let result: Array<string> = [];
    for (let char of input.split("")) {
        if (char === "\n") {
            result.push("\\n");
        }
        else if (char === "\r") {
            result.push("\\r");
        }
        else if (char === "\t") {
            result.push("\\t");
        }
        else if (char === '"') {
            result.push('\\"');
        }
        else if (char === "\\") {
            result.push("\\\\");
        }
        else {
            result.push(char);
        }
    }
    return result.join("");
}

function hasKind(syntaxNodeValue: SyntaxNodeValue, intValue: IntValue) {
    return syntaxNodeValue.kind.payload === intValue.payload;
}

export function displayValue(value: Value, seen: Set<Value>): string {
    if (value instanceof IntValue) {
        return String(value.payload);
    }
    else if (value instanceof StrValue) {
        return ['"', escapeString(value.payload), '"'].join("");
    }
    else if (value instanceof BoolValue) {
        return value.payload ? "true" : "false";
    }
    else if (value instanceof NoneValue) {
        return "none";
    }
    else if (value instanceof ArrayValue) {
        if (seen.has(value)) {
            return "[...]";
        }
        else {
            seen.add(value);
            let elements = value.elements.map(
                (v) => displayValue(v, seen)
            ).join(", ");
            seen.delete(value);
            return ["[", elements, "]"].join("");
        }
    }
    else if (value instanceof FuncValue) {
        let params = value.parameters.join(", ");
        return ["<func ", value.name, "(", params, ")>"].join("");
    }
    else if (value instanceof MacroValue) {
        let params = value.parameters.join(", ");
        return ["<macro ", value.name, "(", params, ")>"].join("");
    }
    else if (value instanceof SyntaxNodeValue) {
        let kind;
        if (hasKind(value, SYNTAX_KIND__TOKEN_INT_LIT)) {
            kind = "token IntLit";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_STR_LIT)) {
            kind = "token StrLit";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_TRUE_KEYWORD)) {
            kind = "token TrueKeyword";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_FALSE_KEYWORD)) {
            kind = "token FalseKeyword";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_NONE_KEYWORD)) {
            kind = "token NoneKeyword";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_PLUS)) {
            kind = "token Plus";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_MINUS)) {
            kind = "token Minus";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_MULT)) {
            kind = "token Mult";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_FLOOR_DIV)) {
            kind = "token FloorDiv";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_MOD)) {
            kind = "token Mod";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_TILDE)) {
            kind = "token Tilde";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_QUEST)) {
            kind = "token Quest";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_BANG)) {
            kind = "token Bang";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_AMP_AMP)) {
            kind = "token AmpAmp";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_PIPE_PIPE)) {
            kind = "token PipePipe";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_LESS)) {
            kind = "token Less";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_LESS_EQ)) {
            kind = "token LessEq";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_GREATER)) {
            kind = "token Greater";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_GREATER_EQ)) {
            kind = "token GreaterEq";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_EQ_EQ)) {
            kind = "token EqEq";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_BANG_EQ)) {
            kind = "token BangEq";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_ASSIGN)) {
            kind = "token Assign";
        }
        else if (hasKind(value, SYNTAX_KIND__TOKEN_IDENTIFIER)) {
            kind = "token Identifier";
        }
        else if (hasKind(value, SYNTAX_KIND__COMPUNIT)) {
            kind = "CompUnit";
        }
        else if (hasKind(value, SYNTAX_KIND__BLOCK)) {
            kind = "Block";
        }
        else if (hasKind(value, SYNTAX_KIND__EXPR_STATEMENT)) {
            kind = "ExprStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__EMPTY_STATEMENT)) {
            kind = "EmptyStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__BLOCK_STATEMENT)) {
            kind = "BlockStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__IF_CLAUSE)) {
            kind = "IfClause";
        }
        else if (hasKind(value, SYNTAX_KIND__IF_CLAUSE_LIST)) {
            kind = "IfClauseList";
        }
        else if (hasKind(value, SYNTAX_KIND__IF_STATEMENT)) {
            kind = "IfStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__FOR_STATEMENT)) {
            kind = "ForStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__WHILE_STATEMENT)) {
            kind = "WhileStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__LAST_STATEMENT)) {
            kind = "LastStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__NEXT_STATEMENT)) {
            kind = "NextStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__RETURN_STATEMENT)) {
            kind = "ReturnStatement";
        }
        else if (hasKind(value, SYNTAX_KIND__VAR_DECL)) {
            kind = "VarDecl";
        }
        else if (hasKind(value, SYNTAX_KIND__PARAMETER)) {
            kind = "Parameter";
        }
        else if (hasKind(value, SYNTAX_KIND__PARAMETER_LIST)) {
            kind = "ParameterList";
        }
        else if (hasKind(value, SYNTAX_KIND__FUNC_DECL)) {
            kind = "FuncDecl";
        }
        else if (hasKind(value, SYNTAX_KIND__MACRO_DECL)) {
            kind = "MacroDecl";
        }
        else if (hasKind(value, SYNTAX_KIND__PREFIX_OP_EXPR)) {
            kind = "PrefixOpExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__INFIX_OP_EXPR)) {
            kind = "InfixOpExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__INDEXING_EXPR)) {
            kind = "IndexingExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__ARGUMENT)) {
            kind = "Argument";
        }
        else if (hasKind(value, SYNTAX_KIND__ARGUMENT_LIST)) {
            kind = "ArgumentList";
        }
        else if (hasKind(value, SYNTAX_KIND__CALL_EXPR)) {
            kind = "CallExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__PRIMARY_EXPR)) {
            kind = "PrimaryExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__INT_LIT_EXPR)) {
            kind = "IntLitExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__STR_LIT_EXPR)) {
            kind = "StrLitExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__BOOL_LIT_EXPR)) {
            kind = "BoolLitExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__NONE_LIT_EXPR)) {
            kind = "NoneLitExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__PAREN_EXPR)) {
            kind = "ParenExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__DO_EXPR)) {
            kind = "DoExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__ARRAY_INITIALIZER_EXPR)) {
            kind = "ArrayInitializerExpr";
        }
        else if (hasKind(value, SYNTAX_KIND__VAR_REF_EXPR)) {
            kind = "VarRefExpr";
        }
        else {
            throw new E000_InternalError(
                `Unknown syntax kind '${value.kind.payload}'`
            );
        }
        return ["<syntax ", kind, ">"].join("");
    }
    else if (value instanceof UninitValue) {
        throw new E000_InternalError(
            "Precondition failed: uninitialized pseudo-value"
        );
    }
    else {
        throw new E000_InternalError(
            `Unknown value type '${value.constructor.name}'`
        );
    }
}

