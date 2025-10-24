import {
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    CompUnit,
    Decl,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    ForStatement,
    IfClause,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
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
    IntValue,
    NoneValue,
    StrValue,
    UninitValue,
    Value,
} from "./value";

type Kont =
    | ProgramKont
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
    | HaltKont
;

class ProgramKont {
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
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

    constructor(token: Token, rhs: Expr, env: Env, tail: Kont) {
        this.token = token;
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
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

class ComparisonOp2Kont {
    prev: Value;
    exprs: Array<Expr>;
    ops: Array<Token>;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        prev: Value,
        exprs: Array<Expr>,
        ops: Array<Token>,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.prev = prev;
        this.exprs = exprs;
        this.ops = ops;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class BlockKont {
    statements: Array<Statement | Decl>;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class IfKont {
    clauses: Array<IfClause>;
    elseBlock: Block | null;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        clauses: Array<IfClause>,
        elseBlock: Block | null,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.clauses = clauses;
        this.elseBlock = elseBlock;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class ArrayInitializerKont {
    elemValues: Array<Value>;
    elemExprs: Array<Expr>;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        elemValues: Array<Value>,
        elemExprs: Array<Expr>,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.elemValues = elemValues;
        this.elemExprs = elemExprs;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class Indexing1Kont {
    indexExpr: Expr;
    env: Env;
    tail: Kont;

    constructor(indexExpr: Expr, env: Env, tail: Kont) {
        this.indexExpr = indexExpr;
        this.env = env;
        this.tail = tail;
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

    constructor(name: string, body: Block, env: Env, tail: Kont) {
        this.name = name;
        this.body = body;
        this.env = env;
        this.tail = tail;
    }
}

class For2Kont {
    arrayValue: ArrayValue;
    name: string;
    body: Block;
    nextIndex: number;
    env: Env;
    tail: Kont;

    constructor(
        arrayValue: ArrayValue,
        name: string,
        body: Block,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.arrayValue = arrayValue;
        this.name = name;
        this.body = body;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class Assign1Kont {
    rhs: Expr;
    env: Env;
    tail: Kont;

    constructor(rhs: Expr, env: Env, tail: Kont) {
        this.rhs = rhs;
        this.env = env;
        this.tail = tail;
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

    constructor(indexExpr: Expr, env: Env, tail: Kont) {
        this.indexExpr = indexExpr;
        this.env = env;
        this.tail = tail;
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

    constructor(
        statements: Array<Statement | Decl>,
        nextIndex: number,
        env: Env,
        tail: Kont,
    ) {
        this.statements = statements;
        this.nextIndex = nextIndex;
        this.env = env;
        this.tail = tail;
    }
}

class IfLocKont {
    clauses: Array<IfClause>;
    elseBlock: Block | null;
    index: number;
    env: Env;
    tail: Kont;

    constructor(
        clauses: Array<IfClause>,
        elseBlock: Block | null,
        index: number,
        env: Env,
        tail: Kont,
    ) {
        this.clauses = clauses;
        this.elseBlock = elseBlock;
        this.index = index;
        this.env = env;
        this.tail = tail;
    }
}

class While1Kont {
    condExpr: Expr;
    body: Block;
    env: Env;
    tail: Kont;

    constructor(condExpr: Expr, body: Block, env: Env, tail: Kont) {
        this.condExpr = condExpr;
        this.body = body;
        this.env = env;
        this.tail = tail;
    }
}

class While2Kont {
    condExpr: Expr;
    body: Block;
    env: Env;
    tail: Kont;

    constructor(condExpr: Expr, body: Block, env: Env, tail: Kont) {
        this.condExpr = condExpr;
        this.body = body;
        this.env = env;
        this.tail = tail;
    }
}

class HaltKont {
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
    code: [Mode, SyntaxNode];
    env: Env;
    kont: Kont;

    constructor(code: [Mode, SyntaxNode], env: Env, kont: Kont) {
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

function load(program: CompUnit): State {
    let env = initializeEnv(emptyEnv(), program.statements);
    return new PState([Mode.GetValue, program], env, new HaltKont());
}

function initializeEnv(env: Env, statements: Array<Statement | Decl>): Env {
    for (let statementOrDecl of statements) {
        if (statementOrDecl instanceof VarDecl) {
            let varDecl = statementOrDecl;
            let name = varDecl.name.payload as string;
            bind(env, name, new UninitValue());
        }
    }

    return env;
}

function reducePState({ code: [mode, syntaxNode], env, kont }: PState): State {
    if (mode === Mode.GetValue) {
        if (syntaxNode instanceof CompUnit) {
            let statements = syntaxNode.statements;
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let programKont = new ProgramKont(statements, 1, env, kont);
                return new PState(
                    [Mode.GetValue, statements[0]],
                    env,
                    programKont,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState([Mode.GetValue, syntaxNode.expr], env, kont);
        }
        else if (syntaxNode instanceof IntLitExpr) {
            let payload = syntaxNode.token.payload as bigint;
            return new RetState(new IntValue(payload), kont);
        }
        else if (syntaxNode instanceof StrLitExpr) {
            let payload = syntaxNode.token.payload as string;
            return new RetState(new StrValue(payload), kont);
        }
        else if (syntaxNode instanceof BoolLitExpr) {
            let payload = syntaxNode.token.payload as boolean;
            return new RetState(new BoolValue(payload), kont);
        }
        else if (syntaxNode instanceof NoneLitExpr) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof PrefixOpExpr) {
            let token = syntaxNode.token;
            let operand = syntaxNode.operand;
            if (token.kind === TokenKind.Plus || token.kind === TokenKind.Minus
                || token.kind === TokenKind.Tilde
                || token.kind === TokenKind.Quest
                || token.kind === TokenKind.Bang) {
                let prefixOpKont = new PrefixOpKont(token, kont);
                return new PState([Mode.GetValue, operand], env, prefixOpKont);
            }
            else {
                throw new Error(`Unknown prefix op type ${token.kind.kind}`);
            }
        }
        else if (syntaxNode instanceof InfixOpExpr) {
            let lhs = syntaxNode.lhs;
            let token = syntaxNode.token;
            let rhs = syntaxNode.rhs;
            if (token.kind === TokenKind.Plus || token.kind === TokenKind.Minus
                    || token.kind === TokenKind.Mult
                    || token.kind === TokenKind.FloorDiv
                    || token.kind === TokenKind.Mod
                    || token.kind === TokenKind.Tilde
                    || token.kind === TokenKind.AmpAmp
                    || token.kind === TokenKind.PipePipe) {
                let infixOpKont1
                    = new InfixOp1Kont(token, rhs, env, kont);
                return new PState([Mode.GetValue, lhs], env, infixOpKont1);
            }
            else if (comparisonOps.has(token.kind)) {
                let [exprs, ops] = findAllChainedOps(syntaxNode);
                checkForUnchainableOps(ops);
                let comparisonOp1Kont = new ComparisonOp1Kont(
                    exprs,
                    ops,
                    env,
                    kont,
                );
                return new PState(
                    [Mode.GetValue, exprs[0]],
                    env,
                    comparisonOp1Kont,
                );
            }
            else if (token.kind === TokenKind.Assign) {
                let assign1Kont = new Assign1Kont(rhs, env, kont);
                return new PState([Mode.GetLocation, lhs], env, assign1Kont);
            }
            else {
                throw new Error(`Unknown infix op type ${token.kind.kind}`);
            }
        }
        else if (syntaxNode instanceof ParenExpr) {
            return new PState([Mode.GetValue, syntaxNode.inner], env, kont);
        }
        else if (syntaxNode instanceof EmptyStatement) {
            return new RetState(new NoneValue(), kont);
        }
        else if (syntaxNode instanceof BlockStatement) {
            return new PState([Mode.GetValue, syntaxNode.block], env, kont);
        }
        else if (syntaxNode instanceof Block) {
            let statements = syntaxNode.statements;
            env = initializeEnv(extend(env), statements);
            if (statements.length === 0) {
                return new RetState(new NoneValue(), kont);
            }
            else {
                let blockKont = new BlockKont(statements, 1, env, kont);
                return new PState(
                    [Mode.GetValue, statements[0]],
                    env,
                    blockKont,
                );
            }
        }
        else if (syntaxNode instanceof DoExpr) {
            let statement = syntaxNode.statement;
            return new PState([Mode.GetValue, statement], env, kont);
        }
        else if (syntaxNode instanceof IfStatement) {
            let clauses = syntaxNode.clauseList.clauses;
            let elseBlock = syntaxNode.elseBlock;
            let condExpr = clauses[0].condExpr;
            let ifKont = new IfKont(clauses, elseBlock, 0, env, kont);
            return new PState([Mode.GetValue, condExpr], env, ifKont);
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
                );
                return new PState(
                    [Mode.GetValue, syntaxNode.children[0] as Expr],
                    env,
                    arrayInitializerKont,
                );
            }
        }
        else if (syntaxNode instanceof IndexingExpr) {
            let arrayExpr = syntaxNode.array;
            let indexExpr = syntaxNode.index;
            let indexing1Kont = new Indexing1Kont(indexExpr, env, kont);
            return new PState([Mode.GetValue, arrayExpr], env, indexing1Kont);
        }
        else if (syntaxNode instanceof VarDecl) {
            let initExpr = syntaxNode.initExpr;
            if (initExpr !== null) {
                let name = syntaxNode.name.payload as string;
                let varKont = new VarKont(name, env, kont);
                return new PState([Mode.GetValue, initExpr], env, varKont);
            }
            else {
                return new RetState(new NoneValue(), kont);
            }
        }
        else if (syntaxNode instanceof VarRefExpr) {
            let name = syntaxNode.token.payload as string;
            let value = lookup(env, name);
            return new RetState(value, kont);
        }
        else if (syntaxNode instanceof ForStatement) {
            env = extend(env);
            let name = syntaxNode.name.payload as string;
            bind(env, name, new UninitValue());
            let arrayExpr = syntaxNode.arrayExpr;
            let body = syntaxNode.body;
            let for1Kont = new For1Kont(name, body, env, kont);
            return new PState([Mode.GetValue, arrayExpr], env, for1Kont);
        }
        else if (syntaxNode instanceof WhileStatement) {
            let condExpr = syntaxNode.condExpr;
            let body = syntaxNode.body;
            let while1Kont = new While1Kont(condExpr, body, env, kont);
            return new PState([Mode.GetValue, condExpr], env, while1Kont);
        }
        else {
            throw new Error(
                `Unrecognized syntax node ${syntaxNode.constructor.name}`
            );
        }
    }
    else if (mode === Mode.GetLocation) {
        if (syntaxNode instanceof IndexingExpr) {
            let arrayExpr = syntaxNode.array;
            let indexExpr = syntaxNode.index;
            let indexingLoc1Kont = new IndexingLoc1Kont(indexExpr, env, kont);
            return new PState(
                [Mode.GetValue, arrayExpr],
                env,
                indexingLoc1Kont,
            );
        }
        else if (syntaxNode instanceof VarRefExpr) {
            let name = syntaxNode.token.payload as string;
            let varEnv = findEnvOfName(env, name);
            return new RetState(new VarLocation(varEnv, name), kont);
        }
        else if (syntaxNode instanceof ParenExpr) {
            return new PState([Mode.GetLocation, syntaxNode.inner], env, kont);
        }
        else if (syntaxNode instanceof DoExpr) {
            let statement = syntaxNode.statement;
            return new PState([Mode.GetLocation, statement], env, kont);
        }
        else if (syntaxNode instanceof BlockStatement) {
            return new PState([Mode.GetLocation, syntaxNode.block], env, kont);
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
                    [Mode.GetLocation, statements[0]],
                    env,
                    kont,
                );
            }
            else {
                let blockLoc1Kont
                    = new BlockLocKont(statements, 1, env, kont);
                return new PState(
                    [Mode.GetValue, statements[0]],
                    env,
                    blockLoc1Kont,
                );
            }
        }
        else if (syntaxNode instanceof ExprStatement) {
            return new PState([Mode.GetLocation, syntaxNode.expr], env, kont);
        }
        else if (syntaxNode instanceof IfStatement) {
            let clauses = syntaxNode.clauseList.clauses;
            let elseBlock = syntaxNode.elseBlock;
            let condExpr = clauses[0].condExpr;
            let ifLocKont = new IfLocKont(clauses, elseBlock, 0, env, kont);
            return new PState([Mode.GetValue, condExpr], env, ifLocKont);
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
    if (kont instanceof ProgramKont) {
        if (kont.nextIndex >= kont.statements.length) {
            return new RetState(value, kont.tail);
        }
        else {
            let programKont = new ProgramKont(
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.statements[kont.nextIndex]],
                kont.env,
                programKont,
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
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Minus) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of -");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Mult) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of *");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of //");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Mod) {
            let left = value;
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of %");
            }
            let infixOp2Kont = new InfixOp2Kont(left, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.Tilde) {
            let left = value;
            let strLeft = stringify(left);
            let infixOp2Kont = new InfixOp2Kont(strLeft, token, kont.tail);
            return new PState(
                [Mode.GetValue, kont.rhs],
                kont.env,
                infixOp2Kont,
            );
        }
        else if (token.kind === TokenKind.AmpAmp) {
            let left = value;
            if (boolify(left)) {
                // tail call
                return new PState(
                    [Mode.GetValue, kont.rhs],
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
                    [Mode.GetValue, kont.rhs],
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
            value,
            kont.exprs,
            kont.ops,
            0,
            kont.env,
            kont.tail,
        );
        return new PState(
            [Mode.GetValue, kont.exprs[1]],
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
                    value,
                    kont.exprs,
                    kont.ops,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                );
                return new PState(
                    [Mode.GetValue, kont.exprs[kont.index + 2]],
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
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.statements[kont.nextIndex]],
                kont.env,
                blockKont,
            );
        }
    }
    else if (kont instanceof IfKont) {
        if (boolify(value)) {
            let clause = kont.clauses[kont.index];
            let block = clause.block;
            return new PState([Mode.GetValue, block], kont.env, kont.tail);
        }
        else {
            if (kont.index + 1 >= kont.clauses.length) {
                if (kont.elseBlock instanceof Block) {
                    return new PState(
                        [Mode.GetValue, kont.elseBlock],
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
                    kont.clauses,
                    kont.elseBlock,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                );
                return new PState([Mode.GetValue, condExpr], kont.env, ifKont);
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
                kont.elemValues,
                kont.elemExprs,
                kont.index + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.elemExprs[kont.index + 1]],
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
        let indexing2Kont = new Indexing2Kont(array, kont.tail);
        return new PState(
            [Mode.GetValue, kont.indexExpr],
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
                arrayValue,
                kont.name,
                kont.body,
                1,
                kont.env,
                kont.tail,
            );
            return new PState([Mode.GetValue, kont.body], bodyEnv, for2Kont);
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
                arrayValue,
                kont.name,
                kont.body,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState([Mode.GetValue, kont.body], bodyEnv, for2Kont);
        }
    }
    else if (kont instanceof IndexingLoc1Kont) {
        let array = value;
        if (!(array instanceof ArrayValue)) {
            throw new Error("Can only index an Array");
        }
        let indexingLoc2Kont = new IndexingLoc2Kont(array, kont.tail);
        return new PState(
            [Mode.GetValue, kont.indexExpr],
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
        let assign2Kont = new Assign2Kont(location, kont.tail);
        return new PState([Mode.GetValue, rhs], kont.env, assign2Kont);
    }
    else if (kont instanceof Assign2Kont) {
        assign(kont.location, value);
        return new RetState(value, kont.tail);
    }
    else if (kont instanceof BlockLocKont) {
        if (kont.nextIndex + 1 >= kont.statements.length) {
            return new PState(
                [Mode.GetLocation, kont.statements[kont.nextIndex]],
                kont.env,
                kont.tail,
            );
        }
        else {
            let blockLocKont = new BlockLocKont(
                kont.statements,
                kont.nextIndex + 1,
                kont.env,
                kont.tail,
            );
            return new PState(
                [Mode.GetValue, kont.statements[kont.nextIndex]],
                kont.env,
                blockLocKont,
            );
        }
    }
    else if (kont instanceof IfLocKont) {
        if (boolify(value)) {
            let clause = kont.clauses[kont.index];
            let block = clause.children[1] as Block;
            return new PState([Mode.GetLocation, block], kont.env, kont.tail);
        }
        else {
            if (kont.index + 1 >= kont.clauses.length) {
                if (kont.elseBlock instanceof Block) {
                    return new PState(
                        [Mode.GetLocation, kont.elseBlock],
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
                    kont.clauses,
                    kont.elseBlock,
                    kont.index + 1,
                    kont.env,
                    kont.tail,
                );
                return new PState([Mode.GetValue, condExpr], kont.env, ifKont);
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
            );
            return new PState(
                [Mode.GetValue, kont.body],
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
            kont.condExpr,
            kont.body,
            kont.env,
            kont.tail,
        );
        return new PState(
            [Mode.GetValue, kont.condExpr],
            kont.env,
            while1Kont,
        );
    }
    else {
        throw new Error(`Unrecognized kont ${kont.constructor.name}`);
    }
}

function unload(kont: RetState): Value {
    return kont.value;
}

export function runProgram(program: CompUnit): Value {
    let state = load(program);

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

