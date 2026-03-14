import {
    isBoolNode,
    isIntNode,
    isStrNode,
    SyntaxKind,
    SyntaxNode,
} from "../compiler/syntax";
import {
    E000_InternalError,
} from "./error";
import {
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    SYNTAX_KIND__ARGUMENT,
    SYNTAX_KIND__ARGUMENT_LIST,
    SYNTAX_KIND__ARRAY_INITIALIZER_EXPR,
    SYNTAX_KIND__BLOCK,
    SYNTAX_KIND__BLOCK_STATEMENT,
    SYNTAX_KIND__BOOL_LIT_EXPR,
    SYNTAX_KIND__BOOL_NODE,
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
    SYNTAX_KIND__INT_NODE,
    SYNTAX_KIND__LAST_STATEMENT,
    SYNTAX_KIND__MACRO_DECL,
    SYNTAX_KIND__NEXT_STATEMENT,
    SYNTAX_KIND__NONE_LIT_EXPR,
    SYNTAX_KIND__PARAMETER,
    SYNTAX_KIND__PARAMETER_LIST,
    SYNTAX_KIND__PAREN_EXPR,
    SYNTAX_KIND__PREFIX_OP_EXPR,
    SYNTAX_KIND__QUOTE_EXPR,
    SYNTAX_KIND__RETURN_STATEMENT,
    SYNTAX_KIND__STR_LIT_EXPR,
    SYNTAX_KIND__STR_NODE,
    SYNTAX_KIND__UNQUOTE_EXPR,
    SYNTAX_KIND__VAR_DECL,
    SYNTAX_KIND__VAR_REF_EXPR,
    SYNTAX_KIND__WHILE_STATEMENT,
    SyntaxNodeValue,
} from "./value";

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
    return exprKinds.has(syntaxNodeValue.kind.payload);
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
    return statementKinds.has(syntaxNodeValue.kind.payload);
}

const kindMap: Map<SyntaxKind, bigint> = new Map([
    [SyntaxKind.INT_NODE, SYNTAX_KIND__INT_NODE],
    [SyntaxKind.STR_NODE, SYNTAX_KIND__STR_NODE],
    [SyntaxKind.BOOL_NODE, SYNTAX_KIND__BOOL_NODE],
    [SyntaxKind.COMPUNIT, SYNTAX_KIND__COMPUNIT],
    [SyntaxKind.BLOCK, SYNTAX_KIND__BLOCK],
    [SyntaxKind.EXPR_STATEMENT, SYNTAX_KIND__EXPR_STATEMENT],
    [SyntaxKind.EMPTY_STATEMENT, SYNTAX_KIND__EMPTY_STATEMENT],
    [SyntaxKind.BLOCK_STATEMENT, SYNTAX_KIND__BLOCK_STATEMENT],
    [SyntaxKind.IF_CLAUSE, SYNTAX_KIND__IF_CLAUSE],
    [SyntaxKind.IF_CLAUSE_LIST, SYNTAX_KIND__IF_CLAUSE_LIST],
    [SyntaxKind.IF_STATEMENT, SYNTAX_KIND__IF_STATEMENT],
    [SyntaxKind.FOR_STATEMENT, SYNTAX_KIND__FOR_STATEMENT],
    [SyntaxKind.WHILE_STATEMENT, SYNTAX_KIND__WHILE_STATEMENT],
    [SyntaxKind.LAST_STATEMENT, SYNTAX_KIND__LAST_STATEMENT],
    [SyntaxKind.NEXT_STATEMENT, SYNTAX_KIND__NEXT_STATEMENT],
    [SyntaxKind.RETURN_STATEMENT, SYNTAX_KIND__RETURN_STATEMENT],
    [SyntaxKind.VAR_DECL, SYNTAX_KIND__VAR_DECL],
    [SyntaxKind.PARAMETER, SYNTAX_KIND__PARAMETER],
    [SyntaxKind.PARAMETER_LIST, SYNTAX_KIND__PARAMETER_LIST],
    [SyntaxKind.FUNC_DECL, SYNTAX_KIND__FUNC_DECL],
    [SyntaxKind.MACRO_DECL, SYNTAX_KIND__MACRO_DECL],
    [SyntaxKind.PREFIX_OP_EXPR, SYNTAX_KIND__PREFIX_OP_EXPR],
    [SyntaxKind.INFIX_OP_EXPR, SYNTAX_KIND__INFIX_OP_EXPR],
    [SyntaxKind.INDEXING_EXPR, SYNTAX_KIND__INDEXING_EXPR],
    [SyntaxKind.ARGUMENT, SYNTAX_KIND__ARGUMENT],
    [SyntaxKind.ARGUMENT_LIST, SYNTAX_KIND__ARGUMENT_LIST],
    [SyntaxKind.CALL_EXPR, SYNTAX_KIND__CALL_EXPR],
    [SyntaxKind.INT_LIT_EXPR, SYNTAX_KIND__INT_LIT_EXPR],
    [SyntaxKind.STR_LIT_EXPR, SYNTAX_KIND__STR_LIT_EXPR],
    [SyntaxKind.BOOL_LIT_EXPR, SYNTAX_KIND__BOOL_LIT_EXPR],
    [SyntaxKind.NONE_LIT_EXPR, SYNTAX_KIND__NONE_LIT_EXPR],
    [SyntaxKind.PAREN_EXPR, SYNTAX_KIND__PAREN_EXPR],
    [SyntaxKind.DO_EXPR, SYNTAX_KIND__DO_EXPR],
    [SyntaxKind.ARRAY_INITIALIZER_EXPR, SYNTAX_KIND__ARRAY_INITIALIZER_EXPR],
    [SyntaxKind.VAR_REF_EXPR, SYNTAX_KIND__VAR_REF_EXPR],
    [SyntaxKind.QUOTE_EXPR, SYNTAX_KIND__QUOTE_EXPR],
    [SyntaxKind.UNQUOTE_EXPR, SYNTAX_KIND__UNQUOTE_EXPR],
]);

export function kindAndPayloadOfNode(
    syntaxNode: SyntaxNode,
): [IntValue, IntValue | StrValue | BoolValue | NoneValue] {
    let kind = kindMap.get(syntaxNode.kind);
    if (kind === undefined) {
        throw new E000_InternalError(
            `Converting unknown node type '${syntaxNode.kind.name}'`
        );
    }

    let payload = isIntNode(syntaxNode)
        ? new IntValue(syntaxNode.payload as bigint)
        : isStrNode(syntaxNode)
            ? new StrValue(syntaxNode.payload as string)
            : isBoolNode(syntaxNode)
                ? new BoolValue(syntaxNode.payload as boolean)
                : new NoneValue();

    return [new IntValue(kind), payload];
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

