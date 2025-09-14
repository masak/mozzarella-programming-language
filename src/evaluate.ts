// MOZZARELLA AST TYPES                           and TOKEN TYPES     (+)
// --------------------                               -----------     means
// Expr                                               FalseKeyword    "has a
//   LiteralExpr    -- Token                          TrueKeyword     payload"
//   VarRefExpr     -- Token                          NoneKeyword
//   UnquoteExpr    -- Expr                           IntLiteral (+)
//   QuoteExpr      -- Block                          StrLiteral (+)
//   DoExpr         -- Statement | Block
//   CallExpr       -- Expr, Argument*                Identifier (+)
//   AssignExpr     -- Expr, Expr
//                                                    Dollar
// Statement                                          ParenL, ParenR
//   EmptyStatement -- (nothing)                      CurlyL, CurlyR
//   ExprStatement  -- Expr                           Backquote, Comma
//                                                    Assign, Semicolon
// Decl                                              
//   LetDecl        -- Token, Expr                    DoKeyword
//   MacroDecl      -- Token, ParameterList, Block    CodeKeyword
//                                                    LetKeyword
// Program          -- (Decl | Statement)*            MacroKeyword
// Block            -- (Decl | Statement)*
// ParameterList    -- Parameter*                     Whitespace
// Parameter        -- Token                          Comment
// Argument         -- Expr

const TokenKind = {
    FalseKeyword: 0x100,
    TrueKeyword: 0x101,
    NoneKeyword: 0x102,
    IntLiteral: 0x103,
    StrLiteral: 0x104,
    Identifier: 0x105,
    Dollar: 0x106,
    ParenL: 0x107,
    ParenR: 0x108,
    CurlyL: 0x109,
    CurlyR: 0x10a,
    Backquote: 0x10b,
    Comma: 0x10c,
    Assign: 0x10d,
    Semicolon: 0x10e,
    DoKeyword: 0x10f,
    CodeKeyword: 0x110,
    LetKeyword: 0x111,
    MacroKeyword: 0x112,

    Whitespace: 0x200,
    Comment: 0x201,

    Eof: 0x300,
};

abstract class SyntaxNode {
    children: Array<SyntaxNode>;

    constructor({ children }: { children: Array<SyntaxNode> }) {
        this.children = children;
    }
}

class Token extends SyntaxNode {
    kind: number;
    payload: undefined | bigint | string;

    constructor(
        { kind, payload }: { kind: number, payload?: bigint | string },
    ) {
        super({ children: [] });
        this.kind = kind;
        this.payload = payload;
    }
}

abstract class Expr extends SyntaxNode {
}

const literalTokenKinds = new Set([
    TokenKind.FalseKeyword,
    TokenKind.TrueKeyword,
    TokenKind.NoneKeyword,
    TokenKind.IntLiteral,
    TokenKind.StrLiteral,
]);

class LiteralExpr extends Expr {
    constructor(token: Token) {
        super({ children: [token] });
        if (!literalTokenKinds.has(token.kind)) {
            throw new Error("LiteralExpr needs to contain a literal token");
        }
    }
}

class VarRefExpr extends Expr {
    constructor(token: Token) {
        super({ children: [token] });
        if (token.kind !== TokenKind.Identifier) {
            throw new Error("VarExpr needs to contain an identifier token");
        }
    }
}

class UnquoteExpr extends Expr {
    constructor(expr: Expr) {
        super({ children: [expr] });
    }
}

class QuoteExpr extends Expr {
    constructor(block: Block) {
        super({ children: [block] });
    }
}

class DoExpr extends Expr {
    constructor(blorst: Statement | Block) {
        super({ children: [blorst] });
    }
}

class CallExpr extends Expr {
    constructor(funcExpr: Expr, args: Array<Argument>) {
        super({ children: [funcExpr, ...args] });
    }
}

class AssignExpr extends Expr {
    constructor(lhs: Expr, rhs: Expr) {
        super({ children: [lhs, rhs] });
        if (!(lhs instanceof VarRefExpr)) {
            throw new Error("Left operand of AssignExpr must be VarRefExpr");
        }
    }
}

abstract class Statement extends SyntaxNode {
}

class EmptyStatement extends Statement {
    constructor() {
        super({ children: [] });
    }
}

class ExprStatement extends Statement {
    constructor(expr: Expr) {
        super({ children: [expr] });
    }
}

abstract class Decl extends SyntaxNode {
}

class LetDecl extends Decl {
    constructor(token: Token, initializer: Expr) {
        super({ children: [token, initializer] });
        if (token.kind !== TokenKind.Identifier) {
            throw new Error("LetDecl needs to start with an identifier token");
        }
    }
}

class MacroDecl extends Decl {
    constructor(token: Token, parameterList: ParameterList, block: Block) {
        super({ children: [token, parameterList, block] });
        if (token.kind !== TokenKind.Identifier) {
            throw new Error(
                "MacroDecl needs to start with an identifier token"
            );
        }
    }
}

class Program extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super({ children: statements });
    }
}

class Block extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super({ children: statements });
    }
}

class ParameterList extends SyntaxNode {
    constructor(...parameters: Array<Parameter>) {
        super({ children: parameters });
    }
}

class Parameter extends SyntaxNode {
    constructor(token: Token) {
        super({ children: [token] });
        if (token.kind !== TokenKind.Identifier) {
            throw new Error("Parameter needs to contain an identifier token");
        }
    }
}

class Argument extends SyntaxNode {
    constructor(expr: Expr) {
        super({ children: [expr] });
    }
}

abstract class Value {
}

class Uninitialized extends Value {
}

class FalseValue extends Value {
}

class TrueValue extends Value {
}

class NoneValue extends Value {
}

class IntValue extends Value {
    payload: bigint;

    constructor(payload: bigint) {
        super();
        this.payload = payload;
    }
}

class StrValue extends Value {
    payload: string;

    constructor(payload: string) {
        super();
        this.payload = payload;
    }
}

class CodeValue extends Value {
    payload: Block;

    constructor(payload: Block) {
        super();
        this.payload = payload;
    }
}

class ClosureValue extends Value {
    env: Env;
    parameters: Array<string>;
    body: Block;

    constructor(env: Env, parameters: Array<string>, body: Block) {
        super();
        this.env = env;
        this.parameters = parameters;
        this.body = body;
    }
}

class MacroValue extends Value {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}

type Env = Map<string, Value>;

function evaluateExpr(expr: Expr, env: Env): Value {
    if (expr instanceof LiteralExpr) {
        let children = expr.children;
        if (children.length === 0) {
            throw new Error("LiteralExpr without children");
        }
        let token = children[0];
        if (!(token instanceof Token)) {
            throw new Error("LiteralExpr child is not a Token");
        }
        if (token.kind === TokenKind.FalseKeyword) {
            return new FalseValue();
        }
        else if (token.kind === TokenKind.TrueKeyword) {
            return new TrueValue();
        }
        else if (token.kind === TokenKind.NoneKeyword) {
            return new NoneValue();
        }
        else if (token.kind === TokenKind.IntLiteral) {
            let payload = token.payload;
            if (typeof payload !== "bigint") {
                throw new Error("IntLiteral token payload is not bigint");
            }
            return new IntValue(payload);
        }
        else if (token.kind === TokenKind.StrLiteral) {
            let payload = token.payload;
            if (typeof payload !== "string") {
                throw new Error("StrLiteral token payload is not string");
            }
            return new StrValue(payload);
        }
        else {
            throw new Error("LiteralExpr needs to contain a literal token");
        }
    }
    else if (expr instanceof VarRefExpr) {
        let children = expr.children;
        if (children.length === 0) {
            throw new Error("VarRefExpr without children");
        }
        let token = children[0];
        if (!(token instanceof Token)) {
            throw new Error("VarRefExpr child is not a Token");
        }
        let name = token.payload;
        if (typeof name !== "string") {
            throw new Error("VarRefExpr token payload is not string");
        }
        let value = env.get(name);
        if (value === undefined) {
            throw new Error(`Variable '${name} now found`);
        }
        return value;
    }
    else if (expr instanceof UnquoteExpr) {
        throw new Error("Encountered bare UnquoteExpr during evaluation");
    }
    else if (expr instanceof QuoteExpr) {
        if (expr.children.length < 1) {
            throw new Error("Not enough child nodes in QuoteExpr");
        }
        let block = expr.children[0];
        if (!(block instanceof Block)) {
            throw new Error("QuoteExpr child node must be a Block");
        }
        let realBlock = substituteUnquotes(block, env, 0);
        if (!(realBlock instanceof Block)) {
            throw new Error(
                "Result of substituting unquotes of contents of quoted " +
                "code must be a Block"
            );
        }
        return new CodeValue(realBlock);
    }
    else if (expr instanceof DoExpr) {
        let children = expr.children;
        if (children.length === 0) {
            throw new Error("DoExpr without children");
        }
        let blorst = children[0];
        if (blorst instanceof Statement) {
            let statement = blorst;
            return executeStatement(statement, env);
        }
        else if (blorst instanceof Block) {
            let block = blorst;
            return runBlock(block, env);
        }
        else {
            throw new Error("DoExpr needs to contain Statement or Block");
        }
    }
    else if (expr instanceof CallExpr) {
        let children = expr.children;
        if (children.length === 0) {
            throw new Error("CallExpr without children");
        }
        let funcExpr = children[0];
        if (!(funcExpr instanceof Expr)) {
            throw new Error("CallExpr first child needs to be an Expr");
        }
        let func = evaluateExpr(funcExpr, env);
        if (!(func instanceof ClosureValue)) {
            throw new Error(
                "Function expression did not evaluate to ClosureValue"
            );
        }
        let args: Array<Value> = [];
        for (let arg of children.slice(1)) {
            if (!(arg instanceof Argument)) {
                throw new Error(
                    "CallExpr argument child needs to be an Argument"
                );
            }
            let value = evaluateExpr(arg, env);
            args.push(value);
        }
        let funcBodyEnv = extendEnv(func.env, func.parameters, args);
        let returnValue = runBlock(func.body, funcBodyEnv);
        return returnValue;
    }
    else if (expr instanceof AssignExpr) {
        if (expr.children.length < 2) {
            throw new Error("Not enough operands in AssignExpr");
        }
        let lhs = expr.children[0];
        if (!(lhs instanceof VarRefExpr)) {
            throw new Error("Left operand of AssignExpr must be a VarRefExpr");
        }
        let varToken = lhs.children[0];
        if (!(varToken instanceof Token)) {
            throw new Error(
                "VarRefExpr left operand of AssignExpr must contain Token"
            );
        }
        if (varToken.kind !== TokenKind.Identifier) {
            throw new Error(
                "Token in VarRefExpr left operand of AssignExpr must be " +
                "an Identifier"
            );
        }
        let varName = varToken.payload;
        if (typeof varName !== "string") {
            throw new Error(
                "Identifier token payload in VarRefExpr must be a string"
            );
        }
        let rhs = expr.children[1];
        if (!(rhs instanceof Expr)) {
            throw new Error("Right opeand of AssignExpr must be an Expr");
        }
        let value = evaluateExpr(rhs, env);
        env.set(varName, value);
        return value;
    }
    else {
        throw new Error(`Unrecognized Expr type ${expr.constructor.name}`);
    }
}

function substituteUnquotes(
    node: SyntaxNode,
    env: Env,
    level: number,
): SyntaxNode {
    // The following "leaf types" have no descendant nodes which may contain
    // either quotes or unquotes, and thus we can return them unmodified.
    if (node instanceof LiteralExpr || node instanceof VarRefExpr ||
        node instanceof EmptyStatement || node instanceof Parameter) {
        return node;
    }
    // Then there are a number of "compound types", which contain children
    // which may contain quotes or unquotes, but they do not themselves
    // participate in the quoting/unquoting mechanism. We handle these
    // individually based on the structure given by the node type.
    else if (node instanceof DoExpr) {
        let children = node.children;
        if (children.length === 0) {
            throw new Error("DoExpr without children");
        }
        let blorst = children[0];
        if (blorst instanceof Statement) {
            let statement = blorst;
            return new DoExpr(substituteUnquotes(statement, env, level));
        }
        else if (blorst instanceof Block) {
            let block = blorst;
            return new DoExpr(substituteUnquotes(block, env, level));
        }
        else {
            throw new Error("DoExpr needs to contain Statement or Block");
        }
    }
    else if (node instanceof CallExpr) {
        let children = node.children;
        if (children.length === 0) {
            throw new Error("CallExpr without children");
        }
        let funcExpr = children[0];
        if (!(funcExpr instanceof Expr)) {
            throw new Error("CallExpr first child needs to be an Expr");
        }
        let substitutedFunc = substituteUnquotes(funcExpr, env, level);
        if (!(substitutedFunc instanceof Expr)) {
            throw new Error(
                "Function expression did not substitute to an Expr"
            );
        }
        let substitutedArgs: Array<Argument> = [];
        for (let arg of children.slice(1)) {
            if (!(arg instanceof Argument)) {
                throw new Error(
                    "CallExpr argument child needs to be an Argument"
                );
            }
            let substitutedArg = substituteUnquotes(arg, env, level);
            if (!(substitutedArg instanceof Argument)) {
                throw new Error("Argument did not substitute to an Argument");
            }
            substitutedArgs.push(substitutedArg);
        }
        return new CallExpr(substitutedFunc, substitutedArgs);
    }
    else if (node instanceof AssignExpr) {
        if (node.children.length < 2) {
            throw new Error("Not enough operands in AssignExpr");
        }
        let lhs = node.children[0];
        if (!(lhs instanceof VarRefExpr)) {
            throw new Error("Left operand of AssignExpr must be a VarRefExpr");
        }
        let rhs = node.children[1];
        if (!(rhs instanceof Expr)) {
            throw new Error("Right opeand of AssignExpr must be an Expr");
        }
        let substitutedLhs = substituteUnquotes(lhs, env, level);
        if (!(substitutedLhs instanceof VarRefExpr)) {
            throw new Error("VarRefExpr did not substitute to a VarRefExpr");
        }
        let substitutedRhs = substituteUnquotes(rhs, env, level);
        if (!(substitutedRhs instanceof Expr)) {
            throw new Error("Expr did not substitute to an Expr");
        }
        return new AssignExpr(substitutedLhs, substitutedRhs);
    }
    else if (node instanceof ExprStatement) {
        if (node.children.length < 1) {
            throw new Error("Not enough children in ExprStatement");
        }
        let expr = node.children[0];
        if (!(expr instanceof Expr)) {
            throw new Error("ExprStatement child node needs to be an Expr");
        }
        let substitutedExpr = substituteUnquotes(expr, env, level);
        if (!(substitutedExpr instanceof Expr)) {
            throw new Error("Expr did not substitute to Expr");
        }
        return new ExprStatement(substitutedExpr);
    }
    else if (node instanceof LetDecl) {
        let children = node.children;
        if (children.length < 2) {
            throw new Error("Not enough children in LetDecl");
        }
        let token = children[0];
        if (!(token instanceof Token)) {
            throw new Error("Variable of LetDecl must be a Token");
        }
        let initializer = children[1];
        if (!(initializer instanceof Expr)) {
            throw new Error("Initializer of LetDecl must be an Expr");
        }
        let substitutedInitializer =
            substituteUnquotes(initializer, env, level);
        if (!(substitutedInitializer instanceof Expr)) {
            throw new Error("Expr did not substitute to Expr");
        }
        return new LetDecl(token, substitutedInitializer);
    }
    else if (node instanceof MacroDecl) {
        let children = node.children;
        if (children.length < 3) {
            throw new Error("Not enough children in MacroDecl");
        }
        let token = children[0];
        if (!(token instanceof Token)) {
            throw new Error("MacroDecl name needs to be a Token");
        }
        let parameterList = children[1];
        if (!(parameterList instanceof ParameterList)) {
            throw new Error(
                "MacroDecl parameter list needs to be a ParameterList"
            );
        }
        let substitutedParameterList =
            substituteUnquotes(parameterList, env, level);
        if (!(substitutedParameterList instanceof ParameterList)) {
            throw new Error(
                "ParameterList did not substitute to ParameterList"
            );
        }
        let block = children[2];
        if (!(block instanceof Block)) {
            throw new Error("MacroDecl block needs to be a Block");
        }
        let substitutedBlock = substituteUnquotes(block, env, level);
        if (!(substitutedBlock instanceof Block)) {
            throw new Error("Block did not substitute to Block");
        }
        return new MacroDecl(
            token,
            substitutedParameterList,
            substitutedBlock,
        );
    }
    else if (node instanceof Block) {
        let substitutedChildren: Array<Statement | Decl> = [];
        for (let child of node.children) {
            if (!(child instanceof Statement || child instanceof Decl)) {
                throw new Error("Child of Block must be Statement or Decl");
            }
            let substitutedChild = substituteUnquotes(child, env, level);
            if (!(substitutedChild instanceof Statement ||
                  substitutedChild instanceof Decl)) {
                throw new Error("Substituted child must be Statement or Decl");
            }
            substitutedChildren.push(substitutedChild);
        }
        return new Block(substitutedChildren);
    }
    else if (node instanceof ParameterList) {
        let substitutedParameters: Array<Parameter> = [];
        for (let parameter of node.children) {
            if (!(parameter instanceof Parameter)) {
                throw new Error("Child of ParameterList must be a Parameter");
            }
            let substitutedParameter =
                substituteUnquotes(parameter, env, level);
            if (!(substitutedParameter instanceof Parameter)) {
                throw new Error("Parameter did not subsitute for Parameter");
            }
            substitutedParameters.push(substitutedParameter);
        }
        return new ParameterList(...substitutedParameters);
    }
    else if (node instanceof Argument) {
        if (node.children.length < 3) {
            throw new Error("Not enough children in Argument");
        }
        let expr = node.children[0];
        if (!(expr instanceof Expr)) {
            throw new Error("Argument child needs to be an Expr");
        }
        let substitutedExpr = substituteUnquotes(expr, env, level);
        if (!(substitutedExpr instanceof Expr)) {
            throw new Error("Expr did not substitute to Expr");
        }
        return new Argument(substitutedExpr);
    }
    // When we encounter a QuoteExpr, we want to descend into it and handle all
    // the nodes in there; but we increment the quote level by one, making some
    // of the unquotes inert.
    else if (node instanceof QuoteExpr) {
        if (node.children.length < 1) {
            throw new Error("Not enough child nodes in QuoteExpr");
        }
        let block = node.children[0];
        if (!(block instanceof Block)) {
            throw new Error("QuoteExpr child node must be a Block");
        }
        return new QuoteExpr(substituteUnquotes(block, env, level + 1));
    }
    // When we see an UnquoteExpr, _either_ we're on quote level 0, in which
    // case it's time to actually evaluate this unquote, _or_ we're on a higher
    // quote level, in which case we decrement the level by 1 and recurse.
    else if (node instanceof UnquoteExpr) {
        if (node.children.length < 1) {
            throw new Error("Not enough children in UnquoteExpr");
        }
        let expr = node.children[0];
        if (!(expr instanceof Expr)) {
            throw new Error("UnquoteExpr child must be an Expr");
        }
        if (level === 0) {
            let codeValue = evaluateExpr(expr, env);
            if (!(codeValue instanceof CodeValue)) {
                throw new Error(
                    "Result of evaluating an unquote must be a CodeValue"
                );
            }
            let block = codeValue.payload;
            return new DoExpr(block);
        }
        else {
            return substituteUnquotes(expr, env, level - 1);
        }
    }
    else if (node instanceof Program) {
        throw new Error(
            "A Program node can never occur inside of a QuoteExpr"
        );
    }
    else {
        throw new Error(`Unknown Node subtype ${node.constructor.name}`);
    }
}

function executeStatement(statement: Statement, env: Env): Value {
    if (statement instanceof EmptyStatement) {
        return new NoneValue();
    }
    else if (statement instanceof ExprStatement) {
        if (statement.children.length < 1) {
            throw new Error("Not enough children in ExprStatement");
        }
        let expr = statement.children[0];
        if (!(expr instanceof Expr)) {
            throw new Error("ExprStatement child node needs to be an Expr");
        }
        return evaluateExpr(expr, env);
    }
    else {
        throw new Error(
            `Unknown Statement subtype ${statement.constructor.name}`
        );
    }
}

function runBlock(block: Program | Block, env: Env): Value {
    let blockEnv = new Map(env);
    for (let child of block.children) {
        if (child instanceof LetDecl) {
            let decl = child;
            let children = decl.children;
            if (children.length < 1) {
                throw new Error("Not enough children in LetDecl");
            }
            let token = children[0];
            if (!(token instanceof Token)) {
                throw new Error("Variable of LetDecl must be a Token");
            }
            if (token.kind !== TokenKind.Identifier) {
                throw new Error(
                    "Variable of LetDecl must be an Identifier token"
                );
            }
            let varName = token.payload;
            if (typeof varName !== "string") {
                throw new Error(
                    "Variable Identifier token must have a string payload"
                );
            }
            env.set(varName, new Uninitialized());
        }
        else if (child instanceof MacroDecl) {
            let decl = child;
            let children = decl.children;
            if (children.length < 1) {
                throw new Error("Not enough children in MacroDecl");
            }
            let token = children[0];
            if (!(token instanceof Token)) {
                throw new Error("Variable of MacroDecl must be a Token");
            }
            if (token.kind !== TokenKind.Identifier) {
                throw new Error(
                    "Variable of MacroDecl must be an Identifier token"
                );
            }
            let varName = token.payload;
            if (typeof varName !== "string") {
                throw new Error(
                    "Variable Identifier token must have a string payload"
                );
            }
            env.set(varName, new MacroValue(varName));
        }
    }

    let lastStatementValue = new NoneValue();
    for (let child of block.children) {
        if (child instanceof Statement) {
            let statement = child;
            lastStatementValue = executeStatement(statement, blockEnv);
        }
        else if (child instanceof Decl) {
            let decl = child;
            if (decl instanceof LetDecl) {
                let children = decl.children;
                if (children.length < 2) {
                    throw new Error("Not enough children in LetDecl");
                }
                let token = children[0];
                if (!(token instanceof Token)) {
                    throw new Error("Variable of LetDecl must be a Token");
                }
                if (token.kind !== TokenKind.Identifier) {
                    throw new Error(
                        "Variable of LetDecl must be an Identifier token"
                    );
                }
                let varName = token.payload;
                if (typeof varName !== "string") {
                    throw new Error(
                        "Variable Identifier token must have a string payload"
                    );
                }
                let initializer = children[1];
                if (!(initializer instanceof Expr)) {
                    throw new Error("Initializer of LetDecl must be an Expr");
                }
                let value = evaluateExpr(initializer, blockEnv);
                env.set(varName, value);
            }
            lastStatementValue = new NoneValue();
        }
        else {
            throw new Error("Block child needs to be Statement or Decl");
        }
    }
    return lastStatementValue;

}

function zip<S, T>(ss: Array<S>, ts: Array<T>): Array<[S, T]> {
    if (ss.length !== ts.length) {
        throw new Error("Arrays in zip of unequal length");
    }
    let result: Array<[S, T]> = [];
    for (let i = 0; i < ss.length; i++) {
        result.push([ss[i], ts[i]]);
    }
    return result;
}

function extendEnv(
    env: Env,
    parameters: Array<string>,
    args: Array<Value>,
): Env {
    let result = new Map(env);
    for (let [param, arg] of zip(parameters, args)) {
        result.set(param, arg);
    }
    return result;
}
