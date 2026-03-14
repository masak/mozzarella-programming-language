import {
    SyntaxNode,
} from "../compiler/syntax";
import {
    Env,
} from "./env";

export abstract class Value {
}

export class IntValue {
    payload: bigint;

    constructor(payload: bigint) {
        this.payload = payload;
    }
}

export class StrValue {
    payload: string;

    constructor(payload: string) {
        this.payload = payload;
    }
}

export class BoolValue {
    payload: boolean;

    constructor(payload: boolean) {
        this.payload = payload;
    }
}

export class NoneValue {
}

export class ArrayValue {
    elements: Array<Value>;

    constructor(elements: Array<Value>) {
        this.elements = elements;
    }
}

export class FuncValue {
    name: string;
    outerEnv: Env;
    parameters: Array<string>;
    body: SyntaxNode;

    constructor(
        name: string,
        outerEnv: Env,
        parameters: Array<string>,
        body: SyntaxNode,
    ) {
        this.name = name;
        this.outerEnv = outerEnv;
        this.parameters = parameters;
        this.body = body;
    }
}

export class MacroValue {
    name: string;
    outerEnv: Env;
    parameters: Array<string>;
    body: SyntaxNode;

    constructor(
        name: string,
        outerEnv: Env,
        parameters: Array<string>,
        body: SyntaxNode,
    ) {
        this.name = name;
        this.outerEnv = outerEnv;
        this.parameters = parameters;
        this.body = body;
    }
}

export class SyntaxNodeValue {
    kind: IntValue;
    children: Array<SyntaxNodeValue>;
    payload: IntValue | StrValue | BoolValue | NoneValue;

    constructor(
        kind: IntValue,
        children: Array<SyntaxNodeValue>,
        payload: IntValue | StrValue | BoolValue | NoneValue,
    ) {
        this.kind = kind;
        this.children = children;
        this.payload = payload;
    }
}

export const SYNTAX_KIND__EMPTY_PLACEHOLDER = BigInt(0x0000);
export const SYNTAX_KIND__INT_NODE = BigInt(0x1001);
export const SYNTAX_KIND__STR_NODE = BigInt(0x1002);
export const SYNTAX_KIND__BOOL_NODE = BigInt(0x1003);
export const SYNTAX_KIND__COMPUNIT = BigInt(0x2000);
export const SYNTAX_KIND__BLOCK = BigInt(0x2001);
export const SYNTAX_KIND__EXPR_STATEMENT = BigInt(0x2003);
export const SYNTAX_KIND__EMPTY_STATEMENT = BigInt(0x2004);
export const SYNTAX_KIND__BLOCK_STATEMENT = BigInt(0x2005);
export const SYNTAX_KIND__IF_CLAUSE = BigInt(0x2006);
export const SYNTAX_KIND__IF_CLAUSE_LIST = BigInt(0x2007);
export const SYNTAX_KIND__IF_STATEMENT = BigInt(0x2008);
export const SYNTAX_KIND__FOR_STATEMENT = BigInt(0x2009);
export const SYNTAX_KIND__WHILE_STATEMENT = BigInt(0x200A);
export const SYNTAX_KIND__LAST_STATEMENT = BigInt(0x200B);
export const SYNTAX_KIND__NEXT_STATEMENT = BigInt(0x200C);
export const SYNTAX_KIND__RETURN_STATEMENT = BigInt(0x200D);
export const SYNTAX_KIND__VAR_DECL = BigInt(0x200F);
export const SYNTAX_KIND__PARAMETER = BigInt(0x2010);
export const SYNTAX_KIND__PARAMETER_LIST = BigInt(0x2011);
export const SYNTAX_KIND__FUNC_DECL = BigInt(0x2012);
export const SYNTAX_KIND__MACRO_DECL = BigInt(0x2013);
export const SYNTAX_KIND__PREFIX_OP_EXPR = BigInt(0x2015);
export const SYNTAX_KIND__INFIX_OP_EXPR = BigInt(0x2016);
export const SYNTAX_KIND__INDEXING_EXPR = BigInt(0x2017);
export const SYNTAX_KIND__ARGUMENT = BigInt(0x2018);
export const SYNTAX_KIND__ARGUMENT_LIST = BigInt(0x2019);
export const SYNTAX_KIND__CALL_EXPR = BigInt(0x201A);
export const SYNTAX_KIND__INT_LIT_EXPR = BigInt(0x201C);
export const SYNTAX_KIND__STR_LIT_EXPR = BigInt(0x201D);
export const SYNTAX_KIND__BOOL_LIT_EXPR = BigInt(0x201E);
export const SYNTAX_KIND__NONE_LIT_EXPR = BigInt(0x201F);
export const SYNTAX_KIND__PAREN_EXPR = BigInt(0x2020);
export const SYNTAX_KIND__DO_EXPR = BigInt(0x2021);
export const SYNTAX_KIND__ARRAY_INITIALIZER_EXPR = BigInt(0x2022);
export const SYNTAX_KIND__VAR_REF_EXPR = BigInt(0x2023);
export const SYNTAX_KIND__QUOTE_EXPR = BigInt(0x2024);
export const SYNTAX_KIND__UNQUOTE_EXPR = BigInt(0x2025);

export class UninitValue {
}

