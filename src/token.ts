import {
    SyntaxNode,
} from "./syntax";

export class TokenKind {
    kind: string;

    constructor(kind: string) {
        this.kind = kind;
    }

    static IntLit = new TokenKind("IntLit");
    static StrLit = new TokenKind("StrLit");
    static TrueKeyword = new TokenKind("TrueKeyword");
    static FalseKeyword = new TokenKind("FalseKeyword");
    static Eof = new TokenKind("Eof");
}

export class Token extends SyntaxNode {
    kind: TokenKind;
    payload?: bigint | string | boolean;

    constructor(kind: TokenKind, payload?: bigint | string | boolean) {
        super([]);
        this.kind = kind;
        this.payload = payload;
    }
}

