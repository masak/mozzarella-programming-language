import {
    SyntaxNode,
} from "./syntax";

export class TokenKind {
    kind: string;

    constructor(kind: string) {
        this.kind = kind;
    }

    static IntLit = new TokenKind("IntLit");
    static Eof = new TokenKind("Eof");
}

export class Token extends SyntaxNode {
    kind: TokenKind;
    payload?: bigint;

    constructor(kind: TokenKind, payload?: bigint) {
        super([]);
        this.kind = kind;
        this.payload = payload;
    }
}

