import {
    makeBoolNode,
    makeIntNode,
    makeStrNode,
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
    SYNTAX_KIND__BOOL_NODE,
    SYNTAX_KIND__INT_NODE,
    SYNTAX_KIND__STR_NODE,
    SyntaxNodeValue,
} from "./value";

const kindMap: Map<bigint, SyntaxKind> = new Map([
    [BigInt(0x2000), SyntaxKind.COMPUNIT],
    [BigInt(0x2001), SyntaxKind.BLOCK],
    [BigInt(0x2003), SyntaxKind.EXPR_STATEMENT],
    [BigInt(0x2004), SyntaxKind.EMPTY_STATEMENT],
    [BigInt(0x2005), SyntaxKind.BLOCK_STATEMENT],
    [BigInt(0x2006), SyntaxKind.IF_CLAUSE],
    [BigInt(0x2007), SyntaxKind.IF_CLAUSE_LIST],
    [BigInt(0x2008), SyntaxKind.IF_STATEMENT],
    [BigInt(0x2009), SyntaxKind.FOR_STATEMENT],
    [BigInt(0x200A), SyntaxKind.WHILE_STATEMENT],
    [BigInt(0x200B), SyntaxKind.LAST_STATEMENT],
    [BigInt(0x200C), SyntaxKind.NEXT_STATEMENT],
    [BigInt(0x200D), SyntaxKind.RETURN_STATEMENT],
    [BigInt(0x200F), SyntaxKind.VAR_DECL],
    [BigInt(0x2010), SyntaxKind.PARAMETER],
    [BigInt(0x2011), SyntaxKind.PARAMETER_LIST],
    [BigInt(0x2012), SyntaxKind.FUNC_DECL],
    [BigInt(0x2013), SyntaxKind.MACRO_DECL],
    [BigInt(0x2015), SyntaxKind.PREFIX_OP_EXPR],
    [BigInt(0x2016), SyntaxKind.INFIX_OP_EXPR],
    [BigInt(0x2017), SyntaxKind.INDEXING_EXPR],
    [BigInt(0x2018), SyntaxKind.ARGUMENT],
    [BigInt(0x2019), SyntaxKind.ARGUMENT_LIST],
    [BigInt(0x201A), SyntaxKind.CALL_EXPR],
    [BigInt(0x201C), SyntaxKind.INT_LIT_EXPR],
    [BigInt(0x201D), SyntaxKind.STR_LIT_EXPR],
    [BigInt(0x201E), SyntaxKind.BOOL_LIT_EXPR],
    [BigInt(0x201F), SyntaxKind.NONE_LIT_EXPR],
    [BigInt(0x2020), SyntaxKind.PAREN_EXPR],
    [BigInt(0x2021), SyntaxKind.DO_EXPR],
    [BigInt(0x2022), SyntaxKind.ARRAY_INITIALIZER_EXPR],
    [BigInt(0x2023), SyntaxKind.VAR_REF_EXPR],
    [BigInt(0x2024), SyntaxKind.QUOTE_EXPR],
    [BigInt(0x2025), SyntaxKind.UNQUOTE_EXPR],
]);

function hasKind(syntaxNodeValue: SyntaxNodeValue, kind: bigint) {
    return syntaxNodeValue.kind.payload === kind;
}

export function absorbNode(
    syntaxNodeValue: SyntaxNodeValue | NoneValue,
): SyntaxNode | null {
    if (syntaxNodeValue instanceof NoneValue) {
        return null;
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__INT_NODE)) {
        return makeIntNode((syntaxNodeValue.payload as IntValue).payload);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__STR_NODE)) {
        return makeStrNode((syntaxNodeValue.payload as StrValue).payload);
    }
    else if (hasKind(syntaxNodeValue, SYNTAX_KIND__BOOL_NODE)) {
        return makeBoolNode((syntaxNodeValue.payload as BoolValue).payload);
    }
    else {
        let kind = kindMap.get(syntaxNodeValue.kind.payload);
        if (kind === undefined) {
            throw new E000_InternalError(
                "Converting unknown node kind '" +
                    syntaxNodeValue.kind.payload + "'"
            );
        }
        let children =  syntaxNodeValue.children.map(absorbNode);
        return new SyntaxNode(kind, children, null);
    }
}

