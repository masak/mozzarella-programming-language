import {
    Argument,
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
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
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    LastStatement,
    MacroDecl,
    NextStatement,
    NoneLitExpr,
    ParenExpr,
    PrefixOpExpr,
    QuoteExpr,
    ReturnStatement,
    Statement,
    StrLitExpr,
    SyntaxNode,
    UnquoteExpr,
    VarDecl,
    VarRefExpr,
    WhileStatement,
} from "../compiler/syntax";
import {
    Token,
    TokenKind,
} from "../compiler/token";
import {
    boolify,
} from "./boolify";
import {
    checkForUnchainableOps,
    comparisonOps,
    evaluateComparison,
    findAllChainedOps,
} from "./compare";
import {
    E000_InternalError,
    E500_OutOfFuel,
    E601_ZeroDivisionError,
    E603_TypeError,
    E604_IndexError,
    E607_CannotAssignError,
    E608_ReadonlyError,
    E609_LastOutsideLoopError,
    E610_NextOutsideLoopError,
    E611_TooManyArgumentsError,
    E612_NotEnoughArgumentsError,
    E613_ReturnOutsideRoutineError,
    E614_MacroAtRuntimeError,
} from "./error";
import {
    bindMutable,
    bindReadonly,
    emptyEnv,
    Env,
    extend,
    findEnvOfName,
    lookup,
} from "./env";
import {
    ArrayElementLocation,
    assign,
    Location,
    VarLocation,
} from "./location";
import {
    kindAndPayloadOfNode,
    isExprKind,
    isStatementKind,
    SYNTAX_KIND__BLOCK,
    SYNTAX_KIND__BOOL_LIT_EXPR,
    SYNTAX_KIND__DO_EXPR,
    SYNTAX_KIND__INT_LIT_EXPR,
    SYNTAX_KIND__NONE_LIT_EXPR,
    SYNTAX_KIND__STR_LIT_EXPR,
    SYNTAX_KIND__TOKEN_FALSE_KEYWORD,
    SYNTAX_KIND__TOKEN_INT_LIT,
    SYNTAX_KIND__TOKEN_STR_LIT,
    SYNTAX_KIND__TOKEN_TRUE_KEYWORD,
} from "./reify";
import {
    stringify,
} from "./stringify";
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

type Kont =
    | CompUnitKont
    | InfixOp1Kont
    | InfixOp2Kont
    | ComparisonOp1Kont
    | ComparisonOp2Kont
    | BlockKont
    | IfKont
    | ArrayInitializerKont
    | Indexing1Kont
    | Indexing2Kont
    | VarKont
    | For1Kont
    | For2Kont
    | Assign1Kont
    | Assign2Kont
    | IndexingLoc1Kont
    | IndexingLoc2Kont
    | BlockLocKont
    | IfLocKont
    | While1Kont
    | While2Kont
    | Call1Kont
    | Call2Kont
    | BlockIgnoreKont
    | InfixOpIgnore1Kont
    | InfixOpIgnore2Kont
    | ComparisonOpIgnore1Kont
    | AssignIgnore1Kont
    | AssignIgnore2Kont
    | ReturnIgnoreKont
    | ReturnKont
    | CallIgnore1Kont
    | CallIgnore2Kont
    | Quote1Kont
    | Quote2Kont
    | UnquoteKont
    | QuoteIgnore1Kont
    | HaltKont
;

class CompUnitKont {
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class PrefixOpKont {
    token: Token;
    tail: Kont;

    constructor(token: Token, tail: Kont) {
        this.token = token;
        this.tail = tail;
    }
}

class InfixOp1Kont {
    token: Token;
    rhs: Expr;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        token: Token,
        rhs: Expr,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.token = token;
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class InfixOp2Kont {
    left: Value;
    token: Token;
    tail: Kont;

    constructor(left: Value, token: Token, tail: Kont) {
        this.left = left;
        this.token = token;
        this.tail = tail;
    }
}

class ComparisonOp1Kont {
    exprs: Array<Expr>;
    ops: Array<Token>;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        exprs: Array<Expr>,
        ops: Array<Token>,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.exprs = exprs;
        this.ops = ops;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class ComparisonOp2Kont {
    prev: Value;
    exprs: Array<Expr>;
    ops: Array<Token>;
    index: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        prev: Value,
        exprs: Array<Expr>,
        ops: Array<Token>,
        index: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.prev = prev;
        this.exprs = exprs;
        this.ops = ops;
        this.index = index;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class BlockKont {
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class IfKont {
    clauses: Array<IfClause>;
    elseBlock: Block | null;
    index: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        clauses: Array<IfClause>,
        elseBlock: Block | null,
        index: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.clauses = clauses;
        this.elseBlock = elseBlock;
        this.index = index;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class ArrayInitializerKont {
    elemValues: Array<Value>;
    elemExprs: Array<Expr>;
    index: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        elemValues: Array<Value>,
        elemExprs: Array<Expr>,
        index: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.elemValues = elemValues;
        this.elemExprs = elemExprs;
        this.index = index;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Indexing1Kont {
    indexExpr: Expr;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(indexExpr: Expr, env: Env, tail: Kont, jumpMap: JumpMap) {
        this.indexExpr = indexExpr;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Indexing2Kont {
    array: ArrayValue;
    tail: Kont;

    constructor(array: ArrayValue, tail: Kont) {
        this.array = array;
        this.tail = tail;
    }
}

class VarKont {
    name: string;
    env: Env;
    tail: Kont;

    constructor(name: string, env: Env, tail: Kont) {
        this.name = name;
        this.env = env;
        this.tail = tail;
    }
}

class For1Kont {
    name: string;
    body: Block;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        name: string,
        body: Block,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.name = name;
        this.body = body;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class For2Kont {
    arrayValue: ArrayValue;
    name: string;
    body: Block;
    nextIndex: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        arrayValue: ArrayValue,
        name: string,
        body: Block,
        nextIndex: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.arrayValue = arrayValue;
        this.name = name;
        this.body = body;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Assign1Kont {
    rhs: Expr;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(rhs: Expr, env: Env, tail: Kont, jumpMap: JumpMap) {
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Assign2Kont {
    location: Location;
    tail: Kont;

    constructor(location: Location, tail: Kont) {
        this.location = location;
        this.tail = tail;
    }
}

class IndexingLoc1Kont {
    indexExpr: Expr;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(indexExpr: Expr, env: Env, tail: Kont, jumpMap: JumpMap) {
        this.indexExpr = indexExpr;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class IndexingLoc2Kont {
    array: ArrayValue;
    tail: Kont;

    constructor(array: ArrayValue, tail: Kont) {
        this.array = array;
        this.tail = tail;
    }
}

class BlockLocKont {
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class IfLocKont {
    clauses: Array<IfClause>;
    elseBlock: Block | null;
    index: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        clauses: Array<IfClause>,
        elseBlock: Block | null,
        index: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.clauses = clauses;
        this.elseBlock = elseBlock;
        this.index = index;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class While1Kont {
    condExpr: Expr;
    body: Block;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        condExpr: Expr,
        body: Block,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.condExpr = condExpr;
        this.body = body;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class While2Kont {
    condExpr: Expr;
    body: Block;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        condExpr: Expr,
        body: Block,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.condExpr = condExpr;
        this.body = body;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Call1Kont {
    args: Array<Argument>;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        args: Array<Argument>,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.args = args;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Call2Kont {
    funcValue: FuncValue;
    argValues: Array<Value>;
    args: Array<Argument>;
    index: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        funcValue: FuncValue,
        argValues: Array<Value>,
        args: Array<Argument>,
        index: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.funcValue = funcValue;
        this.argValues = argValues;
        this.args = args;
        this.index = index;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class BlockIgnoreKont {
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class InfixOpIgnore1Kont {
    token: Token;
    rhs: Expr;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        token: Token,
        rhs: Expr,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.token = token;
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class InfixOpIgnore2Kont {
    left: Value;
    token: Token;
    tail: Kont;

    constructor(left: Value, token: Token, tail: Kont) {
        this.left = left;
        this.token = token;
        this.tail = tail;
    }
}

class ComparisonOpIgnore1Kont {
    exprs: Array<Expr>;
    ops: Array<Token>;
    env: Env;
    tail: Kont;

    constructor(
        exprs: Array<Expr>,
        ops: Array<Token>,
        env: Env,
        tail: Kont,
    ) {
        this.exprs = exprs;
        this.ops = ops;
        this.env = env;
        this.tail = tail;
    }
}

class AssignIgnore1Kont {
    rhs: Expr;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(rhs: Expr, env: Env, tail: Kont, jumpMap: JumpMap) {
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class AssignIgnore2Kont {
    location: Location;
    tail: Kont;

    constructor(location: Location, tail: Kont) {
        this.location = location;
        this.tail = tail;
    }
}

class ReturnIgnoreKont {
    tail: Kont;
    jumpMap: JumpMap;

    constructor(tail: Kont, jumpMap: JumpMap) {
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class ReturnKont {
    tail: Kont;
    jumpMap: JumpMap;

    constructor(tail: Kont, jumpMap: JumpMap) {
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class CallIgnore1Kont {
    args: Array<Expr>;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(args: Array<Expr>, env: Env, tail: Kont, jumpMap: JumpMap) {
        this.args = args;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class CallIgnore2Kont {
    funcValue: FuncValue;
    argValues: Array<Value>;
    args: Array<Expr>;
    index: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        funcValue: FuncValue,
        argValues: Array<Value>,
        args: Array<Expr>,
        index: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.funcValue = funcValue;
        this.argValues = argValues;
        this.args = args;
        this.index = index;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Quote1Kont {
    index: number;
    statements: Array<Statement | Decl>;
    statementValues: Array<SyntaxNodeValue>;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        index: number,
        statements: Array<Statement | Decl>,
        statementValues: Array<SyntaxNodeValue>,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.index = index;
        this.statements = statements;
        this.statementValues = statementValues;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class Quote2Kont {
    index: number;
    node: SyntaxNode;
    childValues: Array<SyntaxNodeValue | NoneValue>;
    quoteLevel: number;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        index: number,
        node: SyntaxNode,
        childValues: Array<SyntaxNodeValue | NoneValue>,
        quoteLevel: number,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.index = index;
        this.node = node;
        this.childValues = childValues;
        this.quoteLevel = quoteLevel;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class UnquoteKont {
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(env: Env, tail: Kont, jumpMap: JumpMap) {
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class QuoteIgnore1Kont {
    index: number;
    statements: Array<Statement | Decl>;
    env: Env;
    tail: Kont;
    jumpMap: JumpMap;

    constructor(
        index: number,
        statements: Array<Statement | Decl>,
        env: Env,
        tail: Kont,
        jumpMap: JumpMap,
    ) {
        this.index = index;
        this.statements = statements;
        this.env = env;
        this.tail = tail;
        this.jumpMap = jumpMap;
    }
}

class HaltKont {
    constructor() {
    }
}

class Mode {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static GetValue = new Mode("GetValue");
    static GetLocation = new Mode("GetLocation");
    static Ignore = new Mode("Ignore");
    static Interpolate = new Mode("Interpolate");
}

class JumpMap {
    lastTarget: Kont | null = null;
    nextTarget: Kont | null = null;
    returnTarget: Kont | null = null;
}

function cloneJumpMap(original: JumpMap): JumpMap {
    let copy = new JumpMap();
    copy.lastTarget = original.lastTarget;
    copy.nextTarget = original.nextTarget;
    copy.returnTarget = original.returnTarget;
    return copy;
}

type State = PState | RetState;

class PState {
    code: [Mode, SyntaxNode, number];
    env: Env;
    kont: Kont;
    jumpMap: JumpMap;

    constructor(
        code: [Mode, SyntaxNode, number],
        env: Env,
        kont: Kont,
        jumpMap: JumpMap,
    ) {
        this.code = code;
        this.env = env;
        this.kont = kont;
        this.jumpMap = jumpMap;
    }
}

class RetState {
    value: Value | Location;
    kont: Kont;

    constructor(value: Value | Location, kont: Kont) {
        this.value = value;
        this.kont = kont;
    }
}

function load(
    compUnit: CompUnit,
    staticEnvs: Map<CompUnit | Block, Env>,
): State {
    let env = initializeEnv(emptyEnv(), compUnit, staticEnvs);
    return new PState(
        [Mode.GetValue, compUnit, 0],
        env,
        new HaltKont(),
        new JumpMap(),
    );
}

export function initializeEnv(
    env: Env,
    compUnitOrBlock: CompUnit | Block,
    staticEnvs: Map<CompUnit | Block, Env>,
): Env {
    for (let statementOrDecl of compUnitOrBlock.statements) {
        if (statementOrDecl instanceof VarDecl) {
            let varDecl = statementOrDecl;
            let name = varDecl.nameToken.payload as string;
            let staticEnv = staticEnvs.get(compUnitOrBlock);
            let value
                = staticEnv?.bindings.get(name)?.value ?? new UninitValue();
            bindMutable(env, name, value);
        }
        else if (statementOrDecl instanceof FuncDecl) {
            let funcDecl = statementOrDecl;
            let name = funcDecl.nameToken.payload as string;
            let parameterList = funcDecl.parameterList.parameters.map(
                (parameter) => parameter.nameToken.payload as string
            );
            let funcValue = new FuncValue(
                name,
                env,
                parameterList,
                funcDecl.body,
            );
            bindReadonly(env, name, funcValue);
        }
        else if (statementOrDecl instanceof MacroDecl) {
            let macroDecl = statementOrDecl;
            let name = macroDecl.nameToken.payload as string;
            let parameterList = macroDecl.parameterList.parameters.map(
                (parameter) => parameter.nameToken.payload as string
            );
            let macroValue = new MacroValue(
                name,
                env,
                parameterList,
                macroDecl.body,
            );
            bindReadonly(env, name, macroValue);
        }
    }

    return env;
}

function zip<T, U>(ts: Array<T>, us: Array<U>): Array<[T, U]> {
    if (ts.length !== us.length) {
        throw new E000_InternalError(
            `Precondition failed: unequal lengths ${ts.length} ` +
            `and ${us.length}`
        );
    }
    let result: Array<[T, U]> = [];
    for (let i = 0; i < ts.length; i++) {
        result.push([ts[i], us[i]]);
    }
    return result;
}

function reducePState(
    { code: [mode, syntaxNode, quoteLevel], env, kont, jumpMap }: PState,
    staticEnvs: Map<CompUnit | Block, Env>,
): State {
    if (mode === Mode.GetValue) {
        if (syntaxNode instanceof CompUnit) {
            let statements = syntaxNode.statements;
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let compUnitKont = new CompUnitKont(
                    statements,
                    1,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.GetValue, statements[0], quoteLevel],
                    env,
                    compUnitKont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState(
                [Mode.GetValue, syntaxNode.expr, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof IntLitExpr) {
            let payload = syntaxNode.valueToken.payload as bigint;
            return new RetState(new IntValue(payload), kont);
        }
        else if (syntaxNode instanceof StrLitExpr) {
            let payload = syntaxNode.valueToken.payload as string;
            return new RetState(new StrValue(payload), kont);
        }
        else if (syntaxNode instanceof BoolLitExpr) {
            let payload = syntaxNode.valueToken.payload as boolean;
            return new RetState(new BoolValue(payload), kont);
        }
        else if (syntaxNode instanceof NoneLitExpr) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof PrefixOpExpr) {
            let opToken = syntaxNode.opToken;
            let operand = syntaxNode.operand;
            if (opToken.kind === TokenKind.Plus
                || opToken.kind === TokenKind.Minus
                || opToken.kind === TokenKind.Tilde
                || opToken.kind === TokenKind.Quest
                || opToken.kind === TokenKind.Bang) {
                let prefixOpKont = new PrefixOpKont(opToken, kont);
                return new PState(
                    [Mode.GetValue, operand, quoteLevel],
                    env,
                    prefixOpKont,
                    jumpMap,
                );
            }
            else {
                throw new E000_InternalError(
                    `Unknown prefix op type ${opToken.kind.kind}`
                );
            }
        }
        else if (syntaxNode instanceof InfixOpExpr) {
            let lhs = syntaxNode.lhs;
            let opToken = syntaxNode.opToken;
            let rhs = syntaxNode.rhs;
            if (opToken.kind === TokenKind.Plus
                || opToken.kind === TokenKind.Minus
                || opToken.kind === TokenKind.Mult
                || opToken.kind === TokenKind.FloorDiv
                || opToken.kind === TokenKind.Mod
                || opToken.kind === TokenKind.Tilde
                || opToken.kind === TokenKind.AmpAmp
                || opToken.kind === TokenKind.PipePipe) {
                let infixOpKont1
                    = new InfixOp1Kont(opToken, rhs, env, kont, jumpMap);
                return new PState(
                    [Mode.GetValue, lhs, quoteLevel],
                    env,
                    infixOpKont1,
                    jumpMap,
                );
            }
            else if (comparisonOps.has(opToken.kind)) {
                let [exprs, ops] = findAllChainedOps(syntaxNode);
                checkForUnchainableOps(ops);
                let comparisonOp1Kont = new ComparisonOp1Kont(
                    exprs,
                    ops,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.GetValue, exprs[0], quoteLevel],
                    env,
                    comparisonOp1Kont,
                    jumpMap,
                );
            }
            else if (opToken.kind === TokenKind.Assign) {
                let assign1Kont = new Assign1Kont(rhs, env, kont, jumpMap);
                return new PState(
                    [Mode.GetLocation, lhs, quoteLevel],
                    env,
                    assign1Kont,
                    jumpMap,
                );
            }
            else {
                throw new E000_InternalError(
                    `Unknown infix op type ${opToken.kind.kind}`
                );
            }
        }
        else if (syntaxNode instanceof ParenExpr) {
            let innerExpr = syntaxNode.innerExpr;
            return new PState(
                [Mode.GetValue, innerExpr, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof EmptyStatement) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof BlockStatement) {
            return new PState(
                [Mode.GetValue, syntaxNode.block, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof Block) {
            env = initializeEnv(extend(env), syntaxNode, staticEnvs);
            let statements = syntaxNode.statements;
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let blockKont = new BlockKont(
                    statements,
                    1,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.GetValue, statements[0], quoteLevel],
                    env,
                    blockKont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof DoExpr) {
            let statement = syntaxNode.statement;
            return new PState(
                [Mode.GetValue, statement, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof IfStatement) {
            let clauses = syntaxNode.clauseList.clauses;
            let elseBlock = syntaxNode.elseBlock;
            let condExpr = clauses[0].condExpr;
            let ifKont = new IfKont(
                clauses,
                elseBlock,
                0,
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, condExpr, quoteLevel],
                env,
                ifKont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof ArrayInitializerExpr) {
            if (syntaxNode.elements.length === 0) {
                return new RetState(new ArrayValue([]), kont);
            }
            else {
                let arrayInitializerKont = new ArrayInitializerKont(
                    new Array(syntaxNode.elements.length),
                    syntaxNode.elements,
                    0,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [
                        Mode.GetValue,
                        syntaxNode.children[0] as Expr,
                        quoteLevel,
                    ],
                    env,
                    arrayInitializerKont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof IndexingExpr) {
            let arrayExpr = syntaxNode.arrayExpr;
            let indexExpr = syntaxNode.indexExpr;
            let indexing1Kont = new Indexing1Kont(
                indexExpr,
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, arrayExpr, quoteLevel],
                env,
                indexing1Kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof VarDecl) {
            let initExpr = syntaxNode.initExpr;
            if (initExpr !== null) {
                let name = syntaxNode.nameToken.payload as string;
                let varKont = new VarKont(name, env, kont);
                return new PState(
                    [Mode.GetValue, initExpr, quoteLevel],
                    env,
                    varKont,
                    jumpMap,
                );
            }
            else {
                return new RetState(new NoneValue(), kont);
            }
        }
        else if (syntaxNode instanceof VarRefExpr) {
            let name = syntaxNode.nameToken.payload as string;
            let value = lookup(env, name);
            return new RetState(value, kont);
        }
        else if (syntaxNode instanceof ForStatement) {
            env = extend(env);
            let name = syntaxNode.nameToken.payload as string;
            bindReadonly(env, name, new UninitValue());
            let arrayExpr = syntaxNode.arrayExpr;
            let body = syntaxNode.body;
            let for1Kont = new For1Kont(name, body, env, kont, jumpMap);
            return new PState(
                [Mode.GetValue, arrayExpr, quoteLevel],
                env,
                for1Kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof WhileStatement) {
            let condExpr = syntaxNode.condExpr;
            let body = syntaxNode.body;
            let while1Kont = new While1Kont(
                condExpr,
                body,
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, condExpr, quoteLevel],
                env,
                while1Kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof LastStatement) {
            let lastTarget = jumpMap.lastTarget;
            if (lastTarget === null) {
                throw new E609_LastOutsideLoopError(
                    "'last' outside of loop"
                );
            }
            else {
                return new RetState(new NoneValue(), lastTarget);
            }
        }
        else if (syntaxNode instanceof NextStatement) {
            let nextTarget = jumpMap.nextTarget;
            if (nextTarget === null) {
                throw new E610_NextOutsideLoopError("'next' outside of loop");
            }
            else {
                return new RetState(new NoneValue(), nextTarget);
            }
        }
        else if (syntaxNode instanceof FuncDecl) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof CallExpr) {
            let funcExpr = syntaxNode.funcExpr;
            let args = syntaxNode.argList.args;
            let call1Kont = new Call1Kont(args, env, kont, jumpMap);
            return new PState(
                [Mode.GetValue, funcExpr, quoteLevel],
                env,
                call1Kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof ReturnStatement) {
            if (syntaxNode.expr === null) {
                let returnTarget = jumpMap.returnTarget;
                if (returnTarget === null) {
                    throw new E613_ReturnOutsideRoutineError();
                }
                else {
                    return new RetState(new NoneValue(), returnTarget);
                }
            }
            else {
                let returnKont = new ReturnKont(kont, jumpMap);
                return new PState(
                    [Mode.GetValue, syntaxNode.expr, quoteLevel],
                    env,
                    returnKont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof MacroDecl) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof QuoteExpr) {
            if (syntaxNode.statements.length === 0) {
                let value = new SyntaxNodeValue(
                    SYNTAX_KIND__BLOCK,
                    [],
                    new NoneValue(),
                );
                return new RetState(value, kont);
            }
            else {
                let statements = syntaxNode.statements;
                let statementValues: Array<SyntaxNodeValue> = [];
                let quote1Kont = new Quote1Kont(
                    0,
                    statements,
                    statementValues,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.Interpolate, statements[0], /* quoteLevel */ 1],
                    env,
                    quote1Kont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof UnquoteExpr) {
            throw new E000_InternalError(
                "Precondition failed: evaluating UnquoteExpr"
            );
        }
        else {
            throw new E000_InternalError(
                `Unrecognized syntax node ${syntaxNode.constructor.name}`
            );
        }
    }
    else if (mode === Mode.GetLocation) {
        if (syntaxNode instanceof IndexingExpr) {
            let arrayExpr = syntaxNode.arrayExpr;
            let indexExpr = syntaxNode.indexExpr;
            let indexingLoc1Kont = new IndexingLoc1Kont(
                indexExpr,
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, arrayExpr, quoteLevel],
                env,
                indexingLoc1Kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof VarRefExpr) {
            let name = syntaxNode.nameToken.payload as string;
            let [mutable, varEnv] = findEnvOfName(env, name);
            if (!mutable) {
                throw new E608_ReadonlyError(`Binding '${name}' is readonly`);
            }
            return new RetState(new VarLocation(varEnv, name), kont);
        }
        else if (syntaxNode instanceof ParenExpr) {
            let innerExpr = syntaxNode.innerExpr;
            return new PState(
                [Mode.GetLocation, innerExpr, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof DoExpr) {
            let statement = syntaxNode.statement;
            return new PState(
                [Mode.GetLocation, statement, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof BlockStatement) {
            return new PState(
                [Mode.GetLocation, syntaxNode.block, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof Block) {
            env = initializeEnv(extend(env), syntaxNode, staticEnvs);
            let statements = syntaxNode.statements;
            if (statements.length === 0) {
                throw new E607_CannotAssignError(
                    "Can't evaluate an empty block for a location"
                );
            }
            else if (statements.length === 1) {
                return new PState(
                    [Mode.GetLocation, statements[0], quoteLevel],
                    env,
                    kont,
                    jumpMap,
                );
            }
            else {
                let blockLoc1Kont
                    = new BlockLocKont(statements, 1, env, kont, jumpMap);
                return new PState(
                    [Mode.GetValue, statements[0], quoteLevel],
                    env,
                    blockLoc1Kont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState(
                [Mode.GetLocation, syntaxNode.expr, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof IfStatement) {
            let clauses = syntaxNode.clauseList.clauses;
            let elseBlock = syntaxNode.elseBlock;
            let condExpr = clauses[0].condExpr;
            let ifLocKont = new IfLocKont(
                clauses,
                elseBlock,
                0,
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, condExpr, quoteLevel],
                env,
                ifLocKont,
                jumpMap,
            );
        }
        else {
            throw new E607_CannotAssignError(
                "Cannot assign to " + syntaxNode.constructor.name
            );
        }
    }
    else if (mode === Mode.Ignore) {
        if (syntaxNode instanceof Block) {
            env = initializeEnv(extend(env), syntaxNode, staticEnvs);
            let statements = syntaxNode.statements;
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let blockIgnoreKont = new BlockIgnoreKont(
                    statements,
                    1,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.Ignore, statements[0], quoteLevel],
                    env,
                    blockIgnoreKont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState(
                [Mode.Ignore, syntaxNode.expr, quoteLevel],
                env,
                kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof VarRefExpr) {
            let name = syntaxNode.nameToken.payload as string;
            /* ignore */ lookup(env, name);
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof InfixOpExpr) {
            let lhs = syntaxNode.lhs;
            let opToken = syntaxNode.opToken;
            let rhs = syntaxNode.rhs;
            if (opToken.kind === TokenKind.Plus
                || opToken.kind === TokenKind.Minus
                || opToken.kind === TokenKind.Mult
                || opToken.kind === TokenKind.FloorDiv
                || opToken.kind === TokenKind.Mod
                || opToken.kind === TokenKind.Tilde
                || opToken.kind === TokenKind.AmpAmp
                || opToken.kind === TokenKind.PipePipe) {
                let infixOpIgnore1Kont = new InfixOpIgnore1Kont(
                    opToken,
                    rhs,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.GetValue, lhs, quoteLevel],
                    env,
                    infixOpIgnore1Kont,
                    jumpMap,
                );
            }
            else if (comparisonOps.has(opToken.kind)) {
                let [exprs, ops] = findAllChainedOps(syntaxNode);
                checkForUnchainableOps(ops);
                let comparisonOpIgnore1Kont = new ComparisonOpIgnore1Kont(
                    exprs,
                    ops,
                    env,
                    kont,
                );
                return new PState(
                    [Mode.GetValue, exprs[0], quoteLevel],
                    env,
                    comparisonOpIgnore1Kont,
                    jumpMap,
                );
            }
            else if (opToken.kind === TokenKind.Assign) {
                let assignIgnore1Kont = new AssignIgnore1Kont(
                    rhs,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.GetLocation, lhs, quoteLevel],
                    env,
                    assignIgnore1Kont,
                    jumpMap,
                );
            }
            else {
                throw new E000_InternalError(
                    `Unknown infix op type ${opToken.kind.kind}`
                );
            }
        }
        else if (syntaxNode instanceof IntLitExpr) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof ReturnStatement) {
            if (syntaxNode.expr === null) {
                let returnTarget = jumpMap.returnTarget;
                if (returnTarget === null) {
                    throw new E613_ReturnOutsideRoutineError();
                }
                else {
                    return new RetState(new NoneValue(), returnTarget);
                }
            }
            else {
                let returnIgnoreKont = new ReturnIgnoreKont(kont, jumpMap);
                return new PState(
                    [Mode.GetValue, syntaxNode.expr, quoteLevel],
                    env,
                    returnIgnoreKont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof CallExpr) {
            let funcExpr = syntaxNode.funcExpr;
            let args = syntaxNode.argList.args;
            let callIgnore1Kont = new CallIgnore1Kont(
                args,
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, funcExpr, quoteLevel],
                env,
                callIgnore1Kont,
                jumpMap,
            );
        }
        else if (syntaxNode instanceof LastStatement) {
            let lastTarget = jumpMap.lastTarget;
            if (lastTarget === null) {
                throw new E609_LastOutsideLoopError(
                    "'last' outside of loop"
                );
            }
            else {
                return new RetState(new NoneValue(), lastTarget);
            }
        }
        else if (syntaxNode instanceof NextStatement) {
            let nextTarget = jumpMap.nextTarget;
            if (nextTarget === null) {
                throw new E610_NextOutsideLoopError("'next' outside of loop");
            }
            else {
                return new RetState(new NoneValue(), nextTarget);
            }
        }
        else if (syntaxNode instanceof QuoteExpr) {
            if (syntaxNode.statements.length === 0) {
                /* ignore */
                return new RetState(new NoneValue(), kont);
            }
            else {
                let statements = syntaxNode.statements;
                let quoteIgnore1Kont = new QuoteIgnore1Kont(
                    0,
                    statements,
                    env,
                    kont,
                    jumpMap,
                );
                return new PState(
                    [Mode.Interpolate, statements[0], /* quoteLevel */ 1],
                    env,
                    quoteIgnore1Kont,
                    jumpMap,
                );
            }
        }
        else if (syntaxNode instanceof VarDecl) {
            let initExpr = syntaxNode.initExpr;
            if (initExpr !== null) {
                let name = syntaxNode.nameToken.payload as string;
                let varKont = new VarKont(name, env, kont);
                return new PState(
                    [Mode.GetValue, initExpr, quoteLevel],
                    env,
                    varKont,
                    jumpMap,
                );
            }
            else {
                return new RetState(new NoneValue(), kont);
            }
        }
        else {
            throw new E000_InternalError(
                "Unsupported ignore syntax node " + syntaxNode.constructor.name
            );
        }
    }
    else if (mode === Mode.Interpolate) {
        if (syntaxNode instanceof UnquoteExpr && quoteLevel < 1) {
            throw new E000_InternalError(
                "Precondition failed: Quote level too low"
            );
        }
        else if (syntaxNode instanceof UnquoteExpr && quoteLevel === 1) {
            let unquoteKont = new UnquoteKont(
                env,
                kont,
                jumpMap,
            );
            return new PState(
                [Mode.GetValue, syntaxNode.innerExpr, /* quoteLevel */ 0],
                env,
                unquoteKont,
                jumpMap,
            );
        }
        else {  // either UnquoteExpr at quoteLevel > 1, or any other node
            let childQuoteLevel = syntaxNode instanceof QuoteExpr
                ? quoteLevel + 1
                : syntaxNode instanceof UnquoteExpr
                    ? quoteLevel - 1
                    : quoteLevel;
            if (syntaxNode.children.length > 0) {
                let childValues: Array<SyntaxNodeValue | NoneValue> = [];
                let quote2Kont = new Quote2Kont(
                    0,
                    syntaxNode,
                    childValues,
                    childQuoteLevel,
                    env,
                    kont,
                    jumpMap,
                );
                let firstChild = syntaxNode.children[0];
                if (firstChild === null) {
                    return new RetState(new NoneValue(), quote2Kont);
                }
                else {
                    return new PState(
                        [Mode.Interpolate, firstChild, childQuoteLevel],
                        env,
                        quote2Kont,
                        jumpMap,
                    );
                }
            }
            else {
                let [kind, payload] = kindAndPayloadOfNode(syntaxNode);
                let value = new SyntaxNodeValue(kind, [], payload);
                return new RetState(value, kont);
            }
        }
    }
    else {
        throw new E000_InternalError("Precondition failed: unrecognized mode");
    }
}

function reduceRetState({ value, kont }: RetState): State {
    if (kont instanceof CompUnitKont) {
        if (kont.nextIndex >= kont.statements.length) {
            return new RetState(value, kont.tail);
        }
        else {
            let compUnitKont = new CompUnitKont(
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.statements[kont.nextIndex],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                compUnitKont,
                kont.jumpMap,
            );
        }
    }
    else if (kont instanceof PrefixOpKont) {
        let operandValue = value;
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            if (!(operandValue instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of +");
            }
            return new RetState(new IntValue(operandValue.payload), kont.tail);
        }
        else if (token.kind === TokenKind.Minus) {
            if (!(operandValue instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of -");
            }
            return new RetState(
                new IntValue(-operandValue.payload),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            return new RetState(
                stringify(operandValue),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Quest) {
            return new RetState(
                new BoolValue(boolify(operandValue)),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Bang) {
            return new RetState(
                new BoolValue(!boolify(operandValue)),
                kont.tail,
            );
        }
        else {
            throw new E000_InternalError(
                `Unknown prefix op type ${kont.token.kind.kind}`
            );
        }
    }
    else if (kont instanceof InfixOp1Kont) {
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            let infixOp2Kont = new InfixOp2Kont(
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Minus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of -");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Mult) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of *");
            }
            let infixOp2Kont = new InfixOp2Kont(
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of //");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Mod) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of %");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            let left = value;
            let strLeft = stringify(left);
            let infixOp2Kont = new InfixOp2Kont(
                strLeft,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.AmpAmp) {
            let left = value;
            if (boolify(left)) {
                // tail call
                return new PState(
                    [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
            }
            else {
                return new RetState(left, kont.tail);
            }
        }
        else if (token.kind === TokenKind.PipePipe) {
            let left = value;
            if (boolify(left)) {
                return new RetState(left, kont.tail);
            }
            else {
                // tail call
                return new PState(
                    [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
            }
        }
        else {
            throw new E000_InternalError(
                `Unknown infix op type ${token.kind.kind}`
            );
        }
    }
    else if (kont instanceof InfixOp2Kont) {
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            let left = kont.left as IntValue;
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return new RetState(
                new IntValue(left.payload + right.payload),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Minus) {
            let left = kont.left as IntValue;
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of -");
            }
            return new RetState(
                new IntValue(left.payload - right.payload),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Mult) {
            let left = kont.left as IntValue;
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of *");
            }
            return new RetState(
                new IntValue(left.payload * right.payload),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = kont.left as IntValue;
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            let negative = left.payload < 0n !== right.payload < 0n;
            let nonZeroMod = left.payload % right.payload !== 0n;
            let diff = negative && nonZeroMod ? 1n : 0n;
            return new RetState(
                new IntValue(left.payload / right.payload - diff),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Mod) {
            let left = kont.left as IntValue;
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            return new RetState(
                new IntValue(left.payload % right.payload),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            let strLeft = kont.left as StrValue;
            let right = value;
            let strRight = stringify(right);
            return new RetState(
                new StrValue(strLeft.payload + strRight.payload),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.AmpAmp) {
            throw new E000_InternalError(
                "Precondition failed: no second continuation for &&"
            );
        }
        else if (token.kind === TokenKind.PipePipe) {
            throw new E000_InternalError(
                "Precondition failed: no second continuation for ||"
            );
        }
        else {
            throw new E000_InternalError(
                `Unknown infix op type ${token.kind.kind}`
            );
        }
    }
    else if (kont instanceof ComparisonOp1Kont) {
        let comparisonOp2Kont = new ComparisonOp2Kont(
            value,
            kont.exprs,
            kont.ops,
            0,
            kont.env,
            kont.tail,
            kont.jumpMap,
        );
        return new PState(
            [Mode.GetValue, kont.exprs[1], /* quoteLevel */ 0],
            kont.env,
            comparisonOp2Kont,
            kont.jumpMap,
        );
    }
    else if (kont instanceof ComparisonOp2Kont) {
        let op = kont.ops[kont.index];
        if (evaluateComparison(kont.prev, op, value)) {
            if (kont.index + 1 < kont.ops.length) {
                let comparisonOp2Kont = new ComparisonOp2Kont(
                    value,
                    kont.exprs,
                    kont.ops,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
                return new PState(
                    [
                        Mode.GetValue,
                        kont.exprs[kont.index + 2],
                        /* quoteLevel */ 0,
                    ],
                    kont.env,
                    comparisonOp2Kont,
                    kont.jumpMap,
                );
            }
            else {
                return new RetState(new BoolValue(true), kont.tail);
            }
        }
        else {
            return new RetState(new BoolValue(false), kont.tail);
        }
    }
    else if (kont instanceof BlockKont) {
        if (kont.nextIndex >= kont.statements.length) {
            return new RetState(value, kont.tail);
        }
        else {
            let blockKont = new BlockKont(
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.statements[kont.nextIndex],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                blockKont,
                kont.jumpMap,
            );
        }
    }
    else if (kont instanceof IfKont) {
        if (boolify(value)) {
            let clause = kont.clauses[kont.index];
            let block = clause.block;
            return new PState(
                [Mode.GetValue, block, /* quoteLevel */ 0],
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
        }
        else {
            if (kont.index + 1 < kont.clauses.length) {
                let condExpr = kont.clauses[kont.index + 1].condExpr;
                let ifKont = new IfKont(
                    kont.clauses,
                    kont.elseBlock,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
                return new PState(
                    [Mode.GetValue, condExpr, /* quoteLevel */ 0],
                    kont.env,
                    ifKont,
                    kont.jumpMap,
                );
            }
            else if (kont.elseBlock instanceof Block) {
                return new PState(
                    [Mode.GetValue, kont.elseBlock, /* quoteLevel */ 0],
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
            }
            else {
                return new RetState(new NoneValue(), kont.tail);
            }
        }
    }
    else if (kont instanceof ArrayInitializerKont) {
        kont.elemValues[kont.index] = value;
        if (kont.index + 1 < kont.elemExprs.length) {
            let arrayInitializerKont = new ArrayInitializerKont(
                kont.elemValues,
                kont.elemExprs,
                kont.index + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.elemExprs[kont.index + 1],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                arrayInitializerKont,
                kont.jumpMap,
            );
        }
        else {
            return new RetState(new ArrayValue(kont.elemValues), kont.tail);
        }
    }
    else if (kont instanceof Indexing1Kont) {
        let array = value;
        if (!(array instanceof ArrayValue)) {
            throw new E603_TypeError("Can only index an Array");
        }
        let indexing2Kont = new Indexing2Kont(array, kont.tail);
        return new PState(
            [Mode.GetValue, kont.indexExpr, /* quoteLevel */ 0],
            kont.env,
            indexing2Kont,
            kont.jumpMap,
        );
    }
    else if (kont instanceof Indexing2Kont) {
        let index = value;
        if (!(index instanceof IntValue)) {
            throw new E603_TypeError("Can only index using an Int");
        }
        if (index.payload < 0 || index.payload >= kont.array.elements.length) {
            throw new E604_IndexError("Index out of bounds");
        }
        return new RetState(
            kont.array.elements[Number(index.payload)],
            kont.tail,
        );
    }
    else if (kont instanceof VarKont) {
        bindMutable(kont.env, kont.name, value);
        return new RetState(new NoneValue(), kont.tail);
    }
    else if (kont instanceof For1Kont) {
        let arrayValue = value;
        if (!(arrayValue instanceof ArrayValue)) {
            throw new E603_TypeError("Type error: not an array");
        }
        if (arrayValue.elements.length === 0) {
            return new RetState(new NoneValue(), kont.tail);
        }
        else {
            let bodyEnv = extend(kont.env);
            let element = arrayValue.elements[0];
            bindReadonly(bodyEnv, kont.name, element);
            let for2Kont = new For2Kont(
                arrayValue,
                kont.name,
                kont.body,
                1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.lastTarget = kont.tail;
            jumpMap.nextTarget = for2Kont;
            return new PState(
                [Mode.GetValue, kont.body, /* quoteLevel */ 0],
                bodyEnv,
                for2Kont,
                jumpMap,
            );
        }
    }
    else if (kont instanceof For2Kont) {
        let arrayValue = kont.arrayValue;
        if (kont.nextIndex >= arrayValue.elements.length) {
            return new RetState(new NoneValue(), kont.tail);
        }
        else {
            let bodyEnv = extend(kont.env);
            let element = arrayValue.elements[kont.nextIndex];
            bindReadonly(bodyEnv, kont.name, element);
            let for2Kont = new For2Kont(
                arrayValue,
                kont.name,
                kont.body,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.lastTarget = kont.tail;
            jumpMap.nextTarget = for2Kont;
            return new PState(
                [Mode.GetValue, kont.body, /* quoteLevel */ 0],
                bodyEnv,
                for2Kont,
                jumpMap,
            );
        }
    }
    else if (kont instanceof IndexingLoc1Kont) {
        let array = value;
        if (!(array instanceof ArrayValue)) {
            throw new E603_TypeError("Can only index an Array");
        }
        let indexingLoc2Kont = new IndexingLoc2Kont(array, kont.tail);
        return new PState(
            [Mode.GetValue, kont.indexExpr, /* quoteLevel */ 0],
            kont.env,
            indexingLoc2Kont,
            kont.jumpMap,
        );
    }
    else if (kont instanceof IndexingLoc2Kont) {
        let index = value;
        if (!(index instanceof IntValue)) {
            throw new E603_TypeError("Can only index using an Int");
        }
        return new RetState(
            new ArrayElementLocation(kont.array, Number(index.payload)),
            kont.tail,
        );
    }
    else if (kont instanceof Assign1Kont) {
        let location = value;
        let rhs = kont.rhs;
        let assign2Kont = new Assign2Kont(location, kont.tail);
        return new PState(
            [Mode.GetValue, rhs, /* quoteLevel */ 0],
            kont.env,
            assign2Kont,
            kont.jumpMap,
        );
    }
    else if (kont instanceof Assign2Kont) {
        assign(kont.location, value);
        return new RetState(value, kont.tail);
    }
    else if (kont instanceof BlockLocKont) {
        if (kont.nextIndex + 1 >= kont.statements.length) {
            return new PState(
                [
                    Mode.GetLocation,
                    kont.statements[kont.nextIndex],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
        }
        else {
            let blockLocKont = new BlockLocKont(
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.statements[kont.nextIndex],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                blockLocKont,
                kont.jumpMap,
            );
        }
    }
    else if (kont instanceof IfLocKont) {
        if (boolify(value)) {
            let clause = kont.clauses[kont.index];
            let block = clause.children[1] as Block;
            return new PState(
                [Mode.GetLocation, block, /* quoteLevel */  0],
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
        }
        else {
            if (kont.index + 1 < kont.clauses.length) {
                let condExpr = kont.clauses[kont.index + 1].condExpr;
                let ifKont = new IfLocKont(
                    kont.clauses,
                    kont.elseBlock,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
                return new PState(
                    [Mode.GetValue, condExpr, /* quoteLevel */ 0],
                    kont.env,
                    ifKont,
                    kont.jumpMap,
                );
            }
            else if (kont.elseBlock instanceof Block) {
                return new PState(
                    [Mode.GetLocation, kont.elseBlock, /* quoteLevel */ 0],
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
            }
            else {
                throw new E607_CannotAssignError();
            }
        }
    }
    else if (kont instanceof While1Kont) {
        if (boolify(value)) {
            let while2Kont = new While2Kont(
                kont.condExpr,
                kont.body,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.lastTarget = kont.tail;
            jumpMap.nextTarget = while2Kont;
            return new PState(
                [Mode.GetValue, kont.body, /* quoteLevel */ 0],
                kont.env,
                while2Kont,
                jumpMap,
            );
        }
        else {
            return new RetState(new NoneValue(), kont.tail);
        }
    }
    else if (kont instanceof While2Kont) {
        let while1Kont = new While1Kont(
            kont.condExpr,
            kont.body,
            kont.env,
            kont.tail,
            kont.jumpMap,
        );
        return new PState(
            [Mode.GetValue, kont.condExpr, /* quoteLevel */ 0],
            kont.env,
            while1Kont,
            kont.jumpMap,
        );
    }
    else if (kont instanceof Call1Kont) {
        if (value instanceof MacroValue) {
            throw new E614_MacroAtRuntimeError();
        }
        if (!(value instanceof FuncValue)) {
            throw new E603_TypeError("Not callable: not a function");
        }
        if (kont.args.length > value.parameters.length) {
            throw new E611_TooManyArgumentsError();
        }
        else if (kont.args.length < value.parameters.length) {
            throw new E612_NotEnoughArgumentsError();
        }
        if (kont.args.length === 0) {
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.returnTarget = kont.tail;
            jumpMap.lastTarget = null;
            jumpMap.nextTarget = null;
            return new PState(
                [Mode.Ignore, value.body, /* quoteLevel */ 0],
                value.outerEnv,
                kont.tail,
                jumpMap,
            );
        }
        else {
            let call2Kont = new Call2Kont(
                value,
                Array.from(
                    { length: kont.args.length },
                    () => new UninitValue()
                ),
                kont.args,
                0,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [Mode.GetValue, kont.args[0].expr, /* quoteLevel */ 0],
                kont.env,
                call2Kont,
                kont.jumpMap,
            );
        }
    }
    else if (kont instanceof Call2Kont) {
        kont.argValues[kont.index] = value; // dirty mutation; justified
        if (kont.index + 1 < kont.args.length) {
            let call2Kont = new Call2Kont(
                kont.funcValue,
                kont.argValues,
                kont.args,
                kont.index + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.args[kont.index + 1].expr,
                    /* quoteLevel */ 0,
                ],
                kont.env,
                call2Kont,
                kont.jumpMap,
            );
        }
        else {
            let bodyEnv = extend(kont.funcValue.outerEnv);
            for (let [param, arg] of zip(
                kont.funcValue.parameters,
                kont.argValues,
            )) {
                bindReadonly(bodyEnv, param, arg);
            }
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.returnTarget = kont.tail;
            jumpMap.lastTarget = null;
            jumpMap.nextTarget = null;
            return new PState(
                [Mode.Ignore, kont.funcValue.body, /* quoteLevel */ 0],
                bodyEnv,
                kont.tail,
                jumpMap,
            );
        }
    }
    else if (kont instanceof BlockIgnoreKont) {
        if (kont.nextIndex >= kont.statements.length) {
            return new RetState(new NoneValue(), kont.tail);
        }
        else {
            let blockIgnoreKont = new BlockIgnoreKont(
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.statements[kont.nextIndex],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                blockIgnoreKont,
                kont.jumpMap,
            );
        }
    }
    else if (kont instanceof AssignIgnore1Kont) {
        let location = value;
        let rhs = kont.rhs;
        let assignIgnore2Kont = new AssignIgnore2Kont(location, kont.tail);
        return new PState(
            [Mode.GetValue, rhs, /* quoteLevel */ 0],
            kont.env,
            assignIgnore2Kont,
            kont.jumpMap,
        );
    }
    else if (kont instanceof ReturnIgnoreKont) {
        let returnTarget = kont.jumpMap.returnTarget;
        if (returnTarget === null) {
            throw new E613_ReturnOutsideRoutineError();
        }
        else {
            return new RetState(value, returnTarget);
        }
    }
    else if (kont instanceof ReturnKont) {
        let returnTarget = kont.jumpMap.returnTarget;
        if (returnTarget === null) {
            throw new E613_ReturnOutsideRoutineError();
        }
        else {
            return new RetState(value, returnTarget);
        }
    }
    else if (kont instanceof AssignIgnore2Kont) {
        assign(kont.location, value);
        return new RetState(new NoneValue(), kont.tail);
    }
    else if (kont instanceof CallIgnore1Kont) {
        if (value instanceof MacroValue) {
            throw new E614_MacroAtRuntimeError();
        }
        if (!(value instanceof FuncValue)) {
            throw new E603_TypeError("Not callable: not a function");
        }
        if (kont.args.length > value.parameters.length) {
            throw new E611_TooManyArgumentsError();
        }
        else if (kont.args.length < value.parameters.length) {
            throw new E612_NotEnoughArgumentsError();
        }
        if (kont.args.length === 0) {
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.returnTarget = kont.tail;
            jumpMap.lastTarget = null;
            jumpMap.nextTarget = null;
            return new PState(
                [Mode.Ignore, value.body, /* quoteLevel */ 0],
                value.outerEnv,
                kont.tail,
                jumpMap,
            );
        }
        else {
            let callIgnore2Kont = new CallIgnore2Kont(
                value,
                Array.from(
                    { length: kont.args.length },
                    () => new UninitValue()
                ),
                kont.args,
                0,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [Mode.GetValue, kont.args[0], /* quoteLevel */ 0],
                kont.env,
                callIgnore2Kont,
                kont.jumpMap,
            );
        }
    }
    else if (kont instanceof CallIgnore2Kont) {
        kont.argValues[kont.index] = value; // dirty mutation; justified
        if (kont.index + 1 < kont.args.length) {
            let callIgnore2Kont = new CallIgnore2Kont(
                kont.funcValue,
                kont.argValues,
                kont.args,
                kont.index + 1,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.args[kont.index + 1],
                    /* quoteLevel */ 0,
                ],
                kont.env,
                callIgnore2Kont,
                kont.jumpMap,
            );
        }
        else {
            let bodyEnv = extend(kont.funcValue.outerEnv);
            for (let [param, arg] of zip(
                kont.funcValue.parameters,
                kont.argValues,
            )) {
                bindReadonly(bodyEnv, param, arg);
            }
            let jumpMap = cloneJumpMap(kont.jumpMap);
            jumpMap.returnTarget = kont.tail;
            jumpMap.lastTarget = null;
            jumpMap.nextTarget = null;
            return new PState(
                [Mode.Ignore, kont.funcValue.body, /* quoteLevel */ 0],
                bodyEnv,
                kont.tail,
                jumpMap,
            );
        }
    }
    else if (kont instanceof InfixOpIgnore1Kont) {
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            let infixOp2Kont = new InfixOpIgnore2Kont(
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Minus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of -");
            }
            let infixOp2Kont = new InfixOpIgnore2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Mult) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of *");
            }
            let infixOp2Kont = new InfixOpIgnore2Kont(
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of //");
            }
            let infixOp2Kont = new InfixOpIgnore2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Mod) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of %");
            }
            let infixOp2Kont = new InfixOpIgnore2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            let left = value;
            let strLeft = stringify(left);
            let infixOp2Kont = new InfixOpIgnore2Kont(
                strLeft,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                kont.env,
                infixOp2Kont,
                kont.jumpMap,
            );
        }
        else if (token.kind === TokenKind.AmpAmp) {
            let left = value;
            if (boolify(left)) {
                // tail call
                return new PState(
                    [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
            }
            else {
                return new RetState(left, kont.tail);
            }
        }
        else if (token.kind === TokenKind.PipePipe) {
            let left = value;
            if (boolify(left)) {
                return new RetState(left, kont.tail);
            }
            else {
                // tail call
                return new PState(
                    [Mode.GetValue, kont.rhs, /* quoteLevel */ 0],
                    kont.env,
                    kont.tail,
                    kont.jumpMap,
                );
            }
        }
        else {
            throw new E000_InternalError(
                `Unknown infix op type ${token.kind.kind}`
            );
        }
    }
    else if (kont instanceof InfixOpIgnore2Kont) {
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return new RetState(
                new NoneValue(),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Minus) {
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of -");
            }
            return new RetState(
                new NoneValue(),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Mult) {
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of *");
            }
            return new RetState(
                new NoneValue(),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            return new RetState(
                new NoneValue(),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Mod) {
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            return new RetState(
                new NoneValue(),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            return new RetState(
                new NoneValue(),
                kont.tail,
            );
        }
        else if (token.kind === TokenKind.AmpAmp) {
            throw new E000_InternalError(
                "Precondition failed: no second continuation for &&"
            );
        }
        else if (token.kind === TokenKind.PipePipe) {
            throw new E000_InternalError(
                "Precondition failed: no second continuation for ||"
            );
        }
        else {
            throw new E000_InternalError(
                `Unknown infix op type ${token.kind.kind}`
            );
        }
    }
    else if (kont instanceof Quote1Kont) {
        kont.statementValues[kont.index] = value as SyntaxNodeValue;
        if (kont.index + 1 < kont.statements.length) {
            let statements = kont.statements;
            let quote1Kont = new Quote1Kont(
                kont.index + 1,
                statements,
                kont.statementValues,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.Interpolate,
                    statements[kont.index + 1],
                    /* quoteLevel */ 1,
                ],
                kont.env,
                quote1Kont,
                kont.jumpMap,
            );
        }
        else {
            let value: SyntaxNodeValue;
            if (kont.statements.length === 1) {
                if (kont.statements[0] instanceof ExprStatement) {
                    value = kont.statementValues[0].children[0] as
                        SyntaxNodeValue;
                }
                else if (kont.statements[0] instanceof Statement) {
                    value = kont.statementValues[0] as SyntaxNodeValue;
                }
                else {
                    value = new SyntaxNodeValue(
                        SYNTAX_KIND__BLOCK,
                        kont.statementValues,
                        new NoneValue(),
                    );
                }
            }
            else {
                value = new SyntaxNodeValue(
                    SYNTAX_KIND__BLOCK,
                    kont.statementValues,
                    new NoneValue(),
                );
            }
            return new RetState(value, kont.tail);
        }
    }
    else if (kont instanceof Quote2Kont) {
        kont.childValues[kont.index] = value;
        if (kont.index + 1 < kont.node.children.length) {
            let quote2Kont = new Quote2Kont(
                kont.index + 1,
                kont.node,
                kont.childValues,
                kont.quoteLevel,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            let child = kont.node.children[kont.index + 1];
            if (child === null) {
                return new RetState(new NoneValue(), quote2Kont);
            }
            else {
                return new PState(
                    [Mode.Interpolate, child, kont.quoteLevel],
                    kont.env,
                    quote2Kont,
                    kont.jumpMap,
                );
            }
        }
        else {
            let [kind, payload] = kindAndPayloadOfNode(kont.node);
            let value = new SyntaxNodeValue(kind, kont.childValues, payload);
            return new RetState(value, kont.tail);
        }
    }
    else if (kont instanceof UnquoteKont) {
        if (value instanceof IntValue) {
            return new RetState(
                new SyntaxNodeValue(
                    SYNTAX_KIND__INT_LIT_EXPR,
                    [new SyntaxNodeValue(
                        SYNTAX_KIND__TOKEN_INT_LIT,
                        [],
                        value,
                    )],
                    new NoneValue(),
                ),
                kont.tail,
            );
        }
        else if (value instanceof StrValue) {
            return new RetState(
                new SyntaxNodeValue(
                    SYNTAX_KIND__STR_LIT_EXPR,
                    [new SyntaxNodeValue(
                        SYNTAX_KIND__TOKEN_STR_LIT,
                        [],
                        value,
                    )],
                    new NoneValue(),
                ),
                kont.tail,
            );
        }
        else if (value instanceof BoolValue) {
            if (value.payload) {
                return new RetState(
                    new SyntaxNodeValue(
                        SYNTAX_KIND__BOOL_LIT_EXPR,
                        [new SyntaxNodeValue(
                            SYNTAX_KIND__TOKEN_TRUE_KEYWORD,
                            [],
                            value,
                        )],
                        new NoneValue(),
                    ),
                    kont.tail,
                );
            }
            else {
                return new RetState(
                    new SyntaxNodeValue(
                        SYNTAX_KIND__BOOL_LIT_EXPR,
                        [new SyntaxNodeValue(
                            SYNTAX_KIND__TOKEN_FALSE_KEYWORD,
                            [],
                            value,
                        )],
                        new NoneValue(),
                    ),
                    kont.tail,
                );
            }
        }
        else if (value instanceof NoneValue) {
            return new RetState(
                new SyntaxNodeValue(SYNTAX_KIND__NONE_LIT_EXPR, [], value),
                kont.tail,
            );
        }
        else if (value instanceof SyntaxNodeValue) {
            if (isExprKind(value)) {
                return new RetState(value, kont.tail);
            }
            else if (isStatementKind(value)) {
                let doExpr = new SyntaxNodeValue(
                    SYNTAX_KIND__DO_EXPR,
                    [value],
                    new NoneValue(),
                );
                return new RetState(doExpr, kont.tail);
            }
            else {
                throw new E603_TypeError(
                    "Unknown syntax node kind in quote interpolation"
                );
            }
        }
        else {
            throw new E603_TypeError(
                "Unknown syntax node kind in quote interpolation"
            );
        }
    }
    else if (kont instanceof QuoteIgnore1Kont) {
        if (kont.index + 1 < kont.statements.length) {
            let statements = kont.statements;
            let quoteIgnore1Kont = new QuoteIgnore1Kont(
                kont.index + 1,
                statements,
                kont.env,
                kont.tail,
                kont.jumpMap,
            );
            return new PState(
                [
                    Mode.Interpolate,
                    statements[kont.index + 1],
                    /* quoteLevel */ 1,
                ],
                kont.env,
                quoteIgnore1Kont,
                kont.jumpMap,
            );
        }
        else {
            /* ignore */
            return new RetState(new NoneValue(), kont.tail);
        }
    }
    else {
        throw new E000_InternalError(
            `Unrecognized kont ${kont.constructor.name}`
        );
    }
}

function unload(kont: RetState): Value {
    return kont.value;
}

export function runCompUnit(
    compUnit: CompUnit,
    staticEnvs: Map<CompUnit | Block, Env>,
): Value {
    let state = load(compUnit, staticEnvs);

    while (state instanceof PState || !(state.kont instanceof HaltKont)) {
        if (state instanceof PState) {
            state = reducePState(state, staticEnvs);
        }
        else {
            state = reduceRetState(state);
        }
    }
    return unload(state);
}

export function runCompUnitWithFuel(
    compUnit: CompUnit,
    fuel: number,
    staticEnvs: Map<CompUnit | Block, Env>,
): Value {
    let state = load(compUnit, staticEnvs);

    while (state instanceof PState || !(state.kont instanceof HaltKont)) {
        if (state instanceof PState) {
            state = reducePState(state, staticEnvs);
        }
        else {
            state = reduceRetState(state);
        }

        --fuel;
        if (fuel <= 0) {
            throw new E500_OutOfFuel();
        }
    }
    return unload(state);
}

export function callMacro(
    macroValue: MacroValue,
    argValues: Array<Value>,
    staticEnv: Env,
    staticEnvs: Map<CompUnit | Block, Env>,
): Value {
    if (argValues.length > macroValue.parameters.length) {
        throw new E611_TooManyArgumentsError();
    }
    else if (argValues.length < macroValue.parameters.length) {
        throw new E612_NotEnoughArgumentsError();
    }

    let bodyEnv = extend(staticEnv);
    for (let [param, arg] of zip(macroValue.parameters, argValues)) {
        bindReadonly(bodyEnv, param, arg);
    }
    let haltKont = new HaltKont();
    let jumpMap = new JumpMap();
    jumpMap.returnTarget = haltKont;
    jumpMap.lastTarget = null;
    jumpMap.nextTarget = null;

    let state: State = new PState(
        [Mode.Ignore, macroValue.body, /* quoteLevel */ 0],
        bodyEnv,
        haltKont,
        jumpMap,
    );

    while (state instanceof PState || !(state.kont instanceof HaltKont)) {
        if (state instanceof PState) {
            state = reducePState(state, staticEnvs);
        }
        else {
            state = reduceRetState(state);
        }
    }
    return unload(state);
}

