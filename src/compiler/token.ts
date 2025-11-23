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
    static CurlyL = new TokenKind("CurlyL");
    static CurlyR = new TokenKind("CurlyR");
    static DoKeyword = new TokenKind("DoKeyword");
    static IfKeyword = new TokenKind("IfKeyword");
    static ElseKeyword = new TokenKind("ElseKeyword");
    static SquareL = new TokenKind("SquareL");
    static SquareR = new TokenKind("SquareR");
    static Comma = new TokenKind("Comma");
    static MyKeyword = new TokenKind("MyKeyword");
    static Assign = new TokenKind("Assign");
    static Identifier = new TokenKind("Identifier");
    static ForKeyword = new TokenKind("ForKeyword");
    static InKeyword = new TokenKind("InKeyword");
    static WhileKeyword = new TokenKind("WhileKeyword");
    static LastKeyword = new TokenKind("LastKeyword");
    static NextKeyword = new TokenKind("NextKeyword");
    static FuncKeyword = new TokenKind("FuncKeyword");
    static ReturnKeyword = new TokenKind("ReturnKeyword");
    static MacroKeyword = new TokenKind("MacroKeyword");
    static Backquote = new TokenKind("Backquote");
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

