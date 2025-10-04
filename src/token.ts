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
    static NoneKeyword = new TokenKind("NoneKeyword");
    static Plus = new TokenKind("Plus");
    static Minus = new TokenKind("Minus");
    static Mult = new TokenKind("Mult");
    static FloorDiv = new TokenKind("FloorDiv");
    static Mod = new TokenKind("Mod");
    static Tilde = new TokenKind("Tilde");
    static Quest = new TokenKind("Quest");
    static Bang = new TokenKind("Bang");
    static AmpAmp = new TokenKind("AmpAmp");
    static PipePipe = new TokenKind("PipePipe");
    static Less = new TokenKind("Less");
    static LessEq = new TokenKind("LessEq");
    static Greater = new TokenKind("Greater");
    static GreaterEq = new TokenKind("GreaterEq");
    static EqEq = new TokenKind("EqEq");
    static BangEq = new TokenKind("BangEq");
    static ParenL = new TokenKind("ParenL");
    static ParenR = new TokenKind("ParenR");
    static Semi = new TokenKind("Semi");
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

