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
    static Eof = new TokenKind("Eof");
}

export class Token extends SyntaxNode {
    kind: TokenKind;
    payload?: bigint | string;

    constructor(kind: TokenKind, payload?: bigint | string) {
        super([]);
        this.kind = kind;
        this.payload = payload;
    }
}

