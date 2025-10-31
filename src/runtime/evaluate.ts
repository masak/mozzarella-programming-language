import {
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
    NextStatement,
    NoneLitExpr,
    ParenExpr,
    PrefixOpExpr,
    Statement,
    StrLitExpr,
    SyntaxNode,
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
    bind,
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
    stringify,
} from "./stringify";
import {
    ArrayValue,
    BoolValue,
    FuncValue,
    IntValue,
    NoneValue,
    StrValue,
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
    | HaltKont
;

class CompUnitKont {
    callLevel: number;
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class PrefixOpKont {
    callLevel: number;
    token: Token;
    tail: Kont;

    constructor(callLevel: number, token: Token, tail: Kont) {
        this.callLevel = callLevel;
        this.token = token;
        this.tail = tail;
    }
}

class InfixOp1Kont {
    callLevel: number;
    token: Token;
    rhs: Expr;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        token: Token,
        rhs: Expr,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.token = token;
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
    }
}

class InfixOp2Kont {
    callLevel: number;
    left: Value;
    token: Token;
    tail: Kont;

    constructor(callLevel: number, left: Value, token: Token, tail: Kont) {
        this.callLevel = callLevel;
        this.left = left;
        this.token = token;
        this.tail = tail;
    }
}

class ComparisonOp1Kont {
    callLevel: number;
    exprs: Array<Expr>;
    ops: Array<Token>;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        exprs: Array<Expr>,
        ops: Array<Token>,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.exprs = exprs;
        this.ops = ops;
        this.env = env;
        this.tail = tail;
    }
}

class ComparisonOp2Kont {
    callLevel: number;
    prev: Value;
    exprs: Array<Expr>;
    ops: Array<Token>;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        prev: Value,
        exprs: Array<Expr>,
        ops: Array<Token>,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.prev = prev;
        this.exprs = exprs;
        this.ops = ops;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class BlockKont {
    callLevel: number;
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class IfKont {
    callLevel: number;
    clauses: Array<IfClause>;
    elseBlock: Block | null;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        clauses: Array<IfClause>,
        elseBlock: Block | null,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.clauses = clauses;
        this.elseBlock = elseBlock;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class ArrayInitializerKont {
    callLevel: number;
    elemValues: Array<Value>;
    elemExprs: Array<Expr>;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        elemValues: Array<Value>,
        elemExprs: Array<Expr>,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.elemValues = elemValues;
        this.elemExprs = elemExprs;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class Indexing1Kont {
    callLevel: number;
    indexExpr: Expr;
    env: Env;
    tail: Kont;

    constructor(callLevel: number, indexExpr: Expr, env: Env, tail: Kont) {
        this.callLevel = callLevel;
        this.indexExpr = indexExpr;
        this.env = env;
        this.tail = tail;
    }
}

class Indexing2Kont {
    callLevel: number;
    array: ArrayValue;
    tail: Kont;

    constructor(callLevel: number, array: ArrayValue, tail: Kont) {
        this.callLevel = callLevel;
        this.array = array;
        this.tail = tail;
    }
}

class VarKont {
    callLevel: number;
    name: string;
    env: Env;
    tail: Kont;

    constructor(callLevel: number, name: string, env: Env, tail: Kont) {
        this.callLevel = callLevel;
        this.name = name;
        this.env = env;
        this.tail = tail;
    }
}

class For1Kont {
    callLevel: number;
    name: string;
    body: Block;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        name: string,
        body: Block,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.name = name;
        this.body = body;
        this.env = env;
        this.tail = tail;
    }
}

class For2Kont {
    callLevel: number;
    arrayValue: ArrayValue;
    name: string;
    body: Block;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        arrayValue: ArrayValue,
        name: string,
        body: Block,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.arrayValue = arrayValue;
        this.name = name;
        this.body = body;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class Assign1Kont {
    callLevel: number;
    rhs: Expr;
    env: Env;
    tail: Kont;

    constructor(callLevel: number, rhs: Expr, env: Env, tail: Kont) {
        this.callLevel = callLevel;
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
    }
}

class Assign2Kont {
    callLevel: number;
    location: Location;
    tail: Kont;

    constructor(callLevel: number, location: Location, tail: Kont) {
        this.callLevel = callLevel;
        this.location = location;
        this.tail = tail;
    }
}

class IndexingLoc1Kont {
    callLevel: number;
    indexExpr: Expr;
    env: Env;
    tail: Kont;

    constructor(callLevel: number, indexExpr: Expr, env: Env, tail: Kont) {
        this.callLevel = callLevel;
        this.indexExpr = indexExpr;
        this.env = env;
        this.tail = tail;
    }
}

class IndexingLoc2Kont {
    callLevel: number;
    array: ArrayValue;
    tail: Kont;

    constructor(callLevel: number, array: ArrayValue, tail: Kont) {
        this.callLevel = callLevel;
        this.array = array;
        this.tail = tail;
    }
}

class BlockLocKont {
    callLevel: number;
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class IfLocKont {
    callLevel: number;
    clauses: Array<IfClause>;
    elseBlock: Block | null;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        clauses: Array<IfClause>,
        elseBlock: Block | null,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.clauses = clauses;
        this.elseBlock = elseBlock;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class While1Kont {
    callLevel: number;
    condExpr: Expr;
    body: Block;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        condExpr: Expr,
        body: Block,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.condExpr = condExpr;
        this.body = body;
        this.env = env;
        this.tail = tail;
    }
}

class While2Kont {
    callLevel: number;
    condExpr: Expr;
    body: Block;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        condExpr: Expr,
        body: Block,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.condExpr = condExpr;
        this.body = body;
        this.env = env;
        this.tail = tail;
    }
}

class Call1Kont {
    callLevel: number;
    args: Array<Expr>;
    env: Env;
    tail: Kont;

    constructor(callLevel: number, args: Array<Expr>, env: Env, tail: Kont) {
        this.callLevel = callLevel;
        this.args = args;
        this.env = env;
        this.tail = tail;
    }
}

class Call2Kont {
    callLevel: number;
    funcValue: FuncValue;
    argValues: Array<Value>;
    args: Array<Expr>;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        callLevel: number,
        funcValue: FuncValue,
        argValues: Array<Value>,
        args: Array<Expr>,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.callLevel = callLevel;
        this.funcValue = funcValue;
        this.argValues = argValues;
        this.args = args;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class HaltKont {
    callLevel: number;

    constructor(callLevel: number) {
        this.callLevel = callLevel;
    }
}

class Mode {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static GetValue = new Mode("GetValue");
    static GetLocation = new Mode("GetLocation");
}

type State = PState | RetState;

class PState {
    code: [Mode, number, SyntaxNode];
    env: Env;
    kont: Kont;

    constructor(code: [Mode, number, SyntaxNode], env: Env, kont: Kont) {
        this.code = code;
        this.env = env;
        this.kont = kont;
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

function load(compUnit: CompUnit): State {
    let env = initializeEnv(emptyEnv(), compUnit.statements);
    return new PState([Mode.GetValue, 0, compUnit], env, new HaltKont(0));
}

function initializeEnv(env: Env, statements: Array<Statement | Decl>): Env {
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof VarDecl) {
            let varDecl = statementOrDecl;
            let name = varDecl.nameToken.payload as string;
            bind(env, name, new UninitValue());
        }
        else if (statementOrDecl instanceof FuncDecl) {
            let funcDecl = statementOrDecl;
            let name = funcDecl.nameToken.payload as string;
            bind(env, name, new FuncValue(name, env, funcDecl.body));
        }
    }

    return env;
}

function reducePState(
    { code: [mode, callLevel, syntaxNode], env, kont }: PState,
): State {
    if (mode === Mode.GetValue) {
        if (syntaxNode instanceof CompUnit) {
            let statements = syntaxNode.statements;
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let compUnitKont = new CompUnitKont(
                    callLevel,
                    statements,
                    1,
                    env,
                    kont,
                );
                return new PState(
                    [Mode.GetValue, callLevel, statements[0]],
                    env,
                    compUnitKont,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState(
                [Mode.GetValue, callLevel, syntaxNode.expr],
                env,
                kont,
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
                let prefixOpKont = new PrefixOpKont(callLevel, opToken, kont);
                return new PState(
                    [Mode.GetValue, callLevel, operand],
                    env,
                    prefixOpKont,
                );
            }
            else {
                throw new Error(`Unknown prefix op type ${opToken.kind.kind}`);
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
                    = new InfixOp1Kont(callLevel, opToken, rhs, env, kont);
                return new PState(
                    [Mode.GetValue, callLevel, lhs],
                    env,
                    infixOpKont1,
                );
            }
            else if (comparisonOps.has(opToken.kind)) {
                let [exprs, ops] = findAllChainedOps(syntaxNode);
                checkForUnchainableOps(ops);
                let comparisonOp1Kont = new ComparisonOp1Kont(
                    callLevel,
                    exprs,
                    ops,
                    env,
                    kont,
                );
                return new PState(
                    [Mode.GetValue, callLevel, exprs[0]],
                    env,
                    comparisonOp1Kont,
                );
            }
            else if (opToken.kind === TokenKind.Assign) {
                let assign1Kont = new Assign1Kont(callLevel, rhs, env, kont);
                return new PState(
                    [Mode.GetLocation, callLevel, lhs],
                    env,
                    assign1Kont,
                );
            }
            else {
                throw new Error(`Unknown infix op type ${opToken.kind.kind}`);
            }
        }
        else if (syntaxNode instanceof ParenExpr) {
            let innerExpr = syntaxNode.innerExpr;
            return new PState(
                [Mode.GetValue, callLevel, innerExpr],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof EmptyStatement) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof BlockStatement) {
            return new PState(
                [Mode.GetValue, callLevel, syntaxNode.block],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof Block) {
            let statements = syntaxNode.statements;
            env = initializeEnv(extend(env), statements);
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let blockKont = new BlockKont(
                    callLevel,
                    statements,
                    1,
                    env,
                    kont,
                );
                return new PState(
                    [Mode.GetValue, callLevel, statements[0]],
                    env,
                    blockKont,
                );
            }
        }
        else if (syntaxNode instanceof DoExpr) {
            let statement = syntaxNode.statement;
            return new PState(
                [Mode.GetValue, callLevel, statement],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof IfStatement) {
            let clauses = syntaxNode.clauseList.clauses;
            let elseBlock = syntaxNode.elseBlock;
            let condExpr = clauses[0].condExpr;
            let ifKont = new IfKont(
                callLevel,
                clauses,
                elseBlock,
                0,
                env,
                kont,
            );
            return new PState(
                [Mode.GetValue, callLevel, condExpr],
                env,
                ifKont,
            );
        }
        else if (syntaxNode instanceof ArrayInitializerExpr) {
            if (syntaxNode.elements.length === 0) {
                return new RetState(new ArrayValue([]), kont);
            }
            else {
                let arrayInitializerKont = new ArrayInitializerKont(
                    callLevel,
                    new Array(syntaxNode.elements.length),
                    syntaxNode.elements,
                    0,
                    env,
                    kont,
                );
                return new PState(
                    [Mode.GetValue, callLevel, syntaxNode.children[0] as Expr],
                    env,
                    arrayInitializerKont,
                );
            }
        }
        else if (syntaxNode instanceof IndexingExpr) {
            let arrayExpr = syntaxNode.arrayExpr;
            let indexExpr = syntaxNode.indexExpr;
            let indexing1Kont = new Indexing1Kont(
                callLevel,
                indexExpr,
                env,
                kont,
            );
            return new PState(
                [Mode.GetValue, callLevel, arrayExpr],
                env,
                indexing1Kont,
            );
        }
        else if (syntaxNode instanceof VarDecl) {
            let initExpr = syntaxNode.initExpr;
            if (initExpr !== null) {
                let name = syntaxNode.nameToken.payload as string;
                let varKont = new VarKont(callLevel, name, env, kont);
                return new PState(
                    [Mode.GetValue, callLevel, initExpr],
                    env,
                    varKont,
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
            bind(env, name, new UninitValue());
            let arrayExpr = syntaxNode.arrayExpr;
            let body = syntaxNode.body;
            let for1Kont = new For1Kont(callLevel, name, body, env, kont);
            return new PState(
                [Mode.GetValue, callLevel, arrayExpr],
                env,
                for1Kont,
            );
        }
        else if (syntaxNode instanceof WhileStatement) {
            let condExpr = syntaxNode.condExpr;
            let body = syntaxNode.body;
            let while1Kont = new While1Kont(
                callLevel,
                condExpr,
                body,
                env,
                kont,
            );
            return new PState(
                [Mode.GetValue, callLevel, condExpr],
                env,
                while1Kont,
            );
        }
        else if (syntaxNode instanceof LastStatement) {
            while (true) {
                if (kont.callLevel < callLevel) {
                    break;
                }
                else if (kont instanceof While2Kont
                    || kont instanceof For2Kont) {
                    return new RetState(new NoneValue(), kont.tail);
                }
                else if (kont instanceof HaltKont) {
                    break;
                }
                else {
                    kont = kont.tail;
                }
            }
            throw new Error("'last' outside of loop");
        }
        else if (syntaxNode instanceof NextStatement) {
            while (true) {
                if (kont.callLevel < callLevel) {
                    break;
                }
                else if (kont instanceof While2Kont) {
                    let condExpr = kont.condExpr;
                    let body = kont.body;
                    let while1Kont = new While1Kont(
                        callLevel,
                        condExpr,
                        body,
                        kont.env,
                        kont.tail,
                    );
                    return new PState(
                        [Mode.GetValue, callLevel, condExpr],
                        kont.env,
                        while1Kont,
                    );
                }
                else if (kont instanceof For2Kont) {
                    let arrayValue = kont.arrayValue;
                    if (kont.nextIndex >= arrayValue.elements.length) {
                        return new RetState(new NoneValue(), kont.tail);
                    }
                    else {
                        let bodyEnv = extend(kont.env);
                        let element = arrayValue.elements[kont.nextIndex];
                        bind(bodyEnv, kont.name, element);
                        let for2Kont = new For2Kont(
                            kont.callLevel,
                            arrayValue,
                            kont.name,
                            kont.body,
                            kont.nextIndex + 1,
                            kont.env,
                            kont.tail,
                        );
                        return new PState(
                            [Mode.GetValue, callLevel, kont.body],
                            bodyEnv,
                            for2Kont,
                        );
                    }
                }
                else if (kont instanceof HaltKont) {
                    break;
                }
                else {
                    kont = kont.tail;
                }
            }
            throw new Error("'next' outside of any loop");
        }
        else if (syntaxNode instanceof FuncDecl) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof CallExpr) {
            let funcExpr = syntaxNode.funcExpr;
            let args = syntaxNode.argList.args;
            let call1Kont = new Call1Kont(callLevel, args, env, kont);
            return new PState(
                [Mode.GetValue, callLevel, funcExpr],
                env,
                call1Kont,
            );
        }
        else {
            throw new Error(
                `Unrecognized syntax node ${syntaxNode.constructor.name}`
            );
        }
    }
    else if (mode === Mode.GetLocation) {
        if (syntaxNode instanceof IndexingExpr) {
            let arrayExpr = syntaxNode.arrayExpr;
            let indexExpr = syntaxNode.indexExpr;
            let indexingLoc1Kont = new IndexingLoc1Kont(
                callLevel,
                indexExpr,
                env,
                kont,
            );
            return new PState(
                [Mode.GetValue, callLevel, arrayExpr],
                env,
                indexingLoc1Kont,
            );
        }
        else if (syntaxNode instanceof VarRefExpr) {
            let name = syntaxNode.nameToken.payload as string;
            let varEnv = findEnvOfName(env, name);
            return new RetState(new VarLocation(varEnv, name), kont);
        }
        else if (syntaxNode instanceof ParenExpr) {
            let innerExpr = syntaxNode.innerExpr;
            return new PState(
                [Mode.GetLocation, callLevel, innerExpr],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof DoExpr) {
            let statement = syntaxNode.statement;
            return new PState(
                [Mode.GetLocation, callLevel, statement],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof BlockStatement) {
            return new PState(
                [Mode.GetLocation, callLevel, syntaxNode.block],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof Block) {
            let statements = syntaxNode.statements;
            env = initializeEnv(extend(env), statements);
            if (statements.length === 0) {
                throw new Error(
                    "Can't evaluate an empty block for a location"
                );
            }
            else if (statements.length === 1) {
                return new PState(
                    [Mode.GetLocation, callLevel, statements[0]],
                    env,
                    kont,
                );
            }
            else {
                let blockLoc1Kont
                    = new BlockLocKont(callLevel, statements, 1, env, kont);
                return new PState(
                    [Mode.GetValue, callLevel, statements[0]],
                    env,
                    blockLoc1Kont,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState(
                [Mode.GetLocation, callLevel, syntaxNode.expr],
                env,
                kont,
            );
        }
        else if (syntaxNode instanceof IfStatement) {
            let clauses = syntaxNode.clauseList.clauses;
            let elseBlock = syntaxNode.elseBlock;
            let condExpr = clauses[0].condExpr;
            let ifLocKont = new IfLocKont(
                callLevel,
                clauses,
                elseBlock,
                0,
                env,
                kont,
            );
            return new PState(
                [Mode.GetValue, callLevel, condExpr],
                env,
                ifLocKont,
            );
        }
        else {
            throw new Error(
                "Unsupported for-location syntax node " +
                    syntaxNode.constructor.name
            );
        }
    }
    else {
        throw new Error("Precondition failed: unrecognized mode");
    }
}

function reduceRetState({ value, kont }: RetState): State {
    if (kont instanceof CompUnitKont) {
        if (kont.nextIndex >= kont.statements.length) {
            return new RetState(value, kont.tail);
        }
        else {
            let compUnitKont = new CompUnitKont(
                kont.callLevel,
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.callLevel,
                    kont.statements[kont.nextIndex],
                ],
                kont.env,
                compUnitKont,
            );
        }
    }
    else if (kont instanceof PrefixOpKont) {
        let operandValue = value;
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of +");
            }
            return new RetState(new IntValue(operandValue.payload), kont.tail);
        }
        else if (token.kind === TokenKind.Minus) {
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of -");
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
            throw new Error(`Unknown prefix op type ${kont.token.kind.kind}`);
        }
    }
    else if (kont instanceof InfixOp1Kont) {
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of +");
            }
            let infixOp2Kont = new InfixOp2Kont(
                kont.callLevel,
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Minus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of -");
            }
            let infixOp2Kont = new InfixOp2Kont(
                kont.callLevel,
                left,
                token,
                kont.tail);
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Mult) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of *");
            }
            let infixOp2Kont = new InfixOp2Kont(
                kont.callLevel,
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of //");
            }
            let infixOp2Kont = new InfixOp2Kont(
                kont.callLevel,
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Mod) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of %");
            }
            let infixOp2Kont = new InfixOp2Kont(
                kont.callLevel,
                left,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            let left = value;
            let strLeft = stringify(left);
            let infixOp2Kont = new InfixOp2Kont(
                kont.callLevel,
                strLeft,
                token,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.AmpAmp) {
            let left = value;
            if (boolify(left)) {
                // tail call
                return new PState(
                    [Mode.GetValue, kont.callLevel, kont.rhs],
                    kont.env,
                    kont.tail,
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
                    [Mode.GetValue, kont.callLevel, kont.rhs],
                    kont.env,
                    kont.tail,
                );
            }
        }
        else {
            throw new Error(`Unknown infix op type ${token.kind.kind}`);
        }
    }
    else if (kont instanceof InfixOp2Kont) {
        let token = kont.token;
        if (token.kind === TokenKind.Plus) {
            let left = kont.left as IntValue;
            let right = value;
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of +");
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
                throw new Error("Expected Int as rhs of -");
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
                throw new Error("Expected Int as rhs of *");
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
                throw new Error("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
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
                throw new Error("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
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
            throw new Error(
                "Precondition broken: no second continuation for &&"
            );
        }
        else if (token.kind === TokenKind.PipePipe) {
            throw new Error(
                "Precondition broken: no second continuation for ||"
            );
        }
        else {
            throw new Error(`Unknown infix op type ${token.kind.kind}`);
        }
    }
    else if (kont instanceof ComparisonOp1Kont) {
        let comparisonOp2Kont = new ComparisonOp2Kont(
            kont.callLevel,
            value,
            kont.exprs,
            kont.ops,
            0,
            kont.env,
            kont.tail,
        );
        return new PState(
            [Mode.GetValue, kont.callLevel, kont.exprs[1]],
            kont.env,
            comparisonOp2Kont,
        );
    }
    else if (kont instanceof ComparisonOp2Kont) {
        let op = kont.ops[kont.index];
        if (evaluateComparison(kont.prev, op, value)) {
            if (kont.index + 1 >= kont.ops.length) {
                return new RetState(new BoolValue(true), kont.tail);
            }
            else {
                let comparisonOp2Kont = new ComparisonOp2Kont(
                    kont.callLevel,
                    value,
                    kont.exprs,
                    kont.ops,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                );
                return new PState(
                    [
                        Mode.GetValue,
                        kont.callLevel,
                        kont.exprs[kont.index + 2],
                    ],
                    kont.env,
                    comparisonOp2Kont,
                );
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
                kont.callLevel,
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.callLevel,
                    kont.statements[kont.nextIndex],
                ],
                kont.env,
                blockKont,
            );
        }
    }
    else if (kont instanceof IfKont) {
        if (boolify(value)) {
            let clause = kont.clauses[kont.index];
            let block = clause.block;
            return new PState(
                [Mode.GetValue, kont.callLevel, block],
                kont.env,
                kont.tail,
            );
        }
        else {
            if (kont.index + 1 >= kont.clauses.length) {
                if (kont.elseBlock instanceof Block) {
                    return new PState(
                        [Mode.GetValue, kont.callLevel, kont.elseBlock],
                        kont.env,
                        kont.tail,
                    );
                }
                else {
                    return new RetState(new NoneValue(), kont.tail);
                }
            }
            else {
                let condExpr = kont.clauses[kont.index + 1].condExpr;
                let ifKont = new IfKont(
                    kont.callLevel,
                    kont.clauses,
                    kont.elseBlock,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                );
                return new PState(
                    [Mode.GetValue, kont.callLevel, condExpr],
                    kont.env,
                    ifKont,
                );
            }
        }
    }
    else if (kont instanceof ArrayInitializerKont) {
        kont.elemValues[kont.index] = value;
        if (kont.index + 1 >= kont.elemExprs.length) {
            return new RetState(new ArrayValue(kont.elemValues), kont.tail);
        }
        else {
            let arrayInitializerKont = new ArrayInitializerKont(
                kont.callLevel,
                kont.elemValues,
                kont.elemExprs,
                kont.index + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.callLevel,
                    kont.elemExprs[kont.index + 1],
                ],
                kont.env,
                arrayInitializerKont,
            );
        }
    }
    else if (kont instanceof Indexing1Kont) {
        let array = value;
        if (!(array instanceof ArrayValue)) {
            throw new Error("Can only index an Array");
        }
        let indexing2Kont = new Indexing2Kont(
            kont.callLevel,
            array,
            kont.tail,
        );
        return new PState(
            [Mode.GetValue, kont.callLevel, kont.indexExpr],
            kont.env,
            indexing2Kont,
        );
    }
    else if (kont instanceof Indexing2Kont) {
        let index = value;
        if (!(index instanceof IntValue)) {
            throw new Error("Can only index using an Int");
        }
        if (index.payload < 0 || index.payload >= kont.array.elements.length) {
            throw new Error("Index out of bounds");
        }
        return new RetState(
            kont.array.elements[Number(index.payload)],
            kont.tail,
        );
    }
    else if (kont instanceof VarKont) {
        bind(kont.env, kont.name, value);
        return new RetState(new NoneValue(), kont.tail);
    }
    else if (kont instanceof For1Kont) {
        let arrayValue = value;
        if (!(arrayValue instanceof ArrayValue)) {
            throw new Error("Type error: not an array");
        }
        if (arrayValue.elements.length === 0) {
            return new RetState(new NoneValue(), kont.tail);
        }
        else {
            let bodyEnv = extend(kont.env);
            let element = arrayValue.elements[0];
            bind(bodyEnv, kont.name, element);
            let for2Kont = new For2Kont(
                kont.callLevel,
                arrayValue,
                kont.name,
                kont.body,
                1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.body],
                bodyEnv,
                for2Kont,
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
            bind(bodyEnv, kont.name, element);
            let for2Kont = new For2Kont(
                kont.callLevel,
                arrayValue,
                kont.name,
                kont.body,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.body],
                bodyEnv,
                for2Kont,
            );
        }
    }
    else if (kont instanceof IndexingLoc1Kont) {
        let array = value;
        if (!(array instanceof ArrayValue)) {
            throw new Error("Can only index an Array");
        }
        let indexingLoc2Kont = new IndexingLoc2Kont(
            kont.callLevel,
            array,
            kont.tail,
        );
        return new PState(
            [Mode.GetValue, kont.callLevel, kont.indexExpr],
            kont.env,
            indexingLoc2Kont,
        );
    }
    else if (kont instanceof IndexingLoc2Kont) {
        let index = value;
        if (!(index instanceof IntValue)) {
            throw new Error("Can only index using an Int");
        }
        return new RetState(
            new ArrayElementLocation(kont.array, Number(index.payload)),
            kont.tail,
        );
    }
    else if (kont instanceof Assign1Kont) {
        let location = value;
        let rhs = kont.rhs;
        let assign2Kont = new Assign2Kont(kont.callLevel, location, kont.tail);
        return new PState(
            [Mode.GetValue, kont.callLevel, rhs],
            kont.env,
            assign2Kont,
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
                    kont.callLevel,
                    kont.statements[kont.nextIndex],
                ],
                kont.env,
                kont.tail,
            );
        }
        else {
            let blockLocKont = new BlockLocKont(
                kont.callLevel,
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [
                    Mode.GetValue,
                    kont.callLevel,
                    kont.statements[kont.nextIndex],
                ],
                kont.env,
                blockLocKont,
            );
        }
    }
    else if (kont instanceof IfLocKont) {
        if (boolify(value)) {
            let clause = kont.clauses[kont.index];
            let block = clause.children[1] as Block;
            return new PState(
                [Mode.GetLocation, kont.callLevel, block],
                kont.env,
                kont.tail,
            );
        }
        else {
            if (kont.index + 1 >= kont.clauses.length) {
                if (kont.elseBlock instanceof Block) {
                    return new PState(
                        [Mode.GetLocation, kont.callLevel, kont.elseBlock],
                        kont.env,
                        kont.tail,
                    );
                }
                else {
                    throw new Error(
                        "Attempt to assign to 'if' statement that fell off "
                        + "the end without 'else' clause."
                    );
                }
            }
            else {
                let condExpr = kont.clauses[kont.index + 1].condExpr;
                let ifKont = new IfLocKont(
                    kont.callLevel,
                    kont.clauses,
                    kont.elseBlock,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                );
                return new PState(
                    [Mode.GetValue, kont.callLevel, condExpr],
                    kont.env,
                    ifKont,
                );
            }
        }
    }
    else if (kont instanceof While1Kont) {
        if (boolify(value)) {
            let while2Kont = new While2Kont(
                kont.callLevel,
                kont.condExpr,
                kont.body,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.body],
                kont.env,
                while2Kont,
            );
        }
        else {
            return new RetState(new NoneValue(), kont.tail);
        }
    }
    else if (kont instanceof While2Kont) {
        let while1Kont = new While1Kont(
            kont.callLevel,
            kont.condExpr,
            kont.body,
            kont.env,
            kont.tail,
        );
        return new PState(
            [Mode.GetValue, kont.callLevel, kont.condExpr],
            kont.env,
            while1Kont,
        );
    }
    else if (kont instanceof Call1Kont) {
        if (!(value instanceof FuncValue)) {
            throw new Error("Not callable: not a function");
        }
        if (kont.args.length > 0) {
            throw new Error("Too many arguments");
        }
        else if (kont.args.length < 0) {
            throw new Error("Not enough arguments");
        }
        if (kont.args.length === 0) {
            return new PState(
                [Mode.GetValue, kont.callLevel + 1, value.body],
                value.outerEnv,
                kont.tail,
            );
        }
        else {
            let call2Kont = new Call2Kont(
                kont.callLevel,
                value,
                Array.from(
                    { length: kont.args.length },
                    () => new UninitValue()
                ),
                kont.args,
                1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.args[0]],
                kont.env,
                call2Kont,
            );
        }
    }
    else if (kont instanceof Call2Kont) {
        if (kont.index + 1 >= kont.args.length) {
            return new PState(
                [Mode.GetValue, kont.callLevel + 1, kont.funcValue.body],
                kont.funcValue.outerEnv,
                kont.tail,
            );
        }
        else {
            kont.argValues[kont.index] = value; // dirty mutation; justified
            let call2Kont = new Call2Kont(
                kont.callLevel,
                kont.funcValue,
                kont.argValues,
                kont.args,
                kont.index + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.callLevel, kont.args[kont.index + 1]],
                kont.env,
                call2Kont,
            );
        }
    }
    else {
        throw new Error(`Unrecognized kont ${kont.constructor.name}`);
    }
}

function unload(kont: RetState): Value {
    return kont.value;
}

export function runCompUnit(compUnit: CompUnit): Value {
    let state = load(compUnit);

    while (state instanceof PState || !(state.kont instanceof HaltKont)) {
        if (state instanceof PState) {
            state = reducePState(state);
        }
        else {
            state = reduceRetState(state);
        }
    }
    return unload(state);
}

