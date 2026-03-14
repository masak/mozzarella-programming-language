export class SyntaxKind {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static STR_NODE = new SyntaxKind("StrNode");
    static INT_NODE = new SyntaxKind("IntNode");
    static BOOL_NODE = new SyntaxKind("BoolNode");
    static COMPUNIT = new SyntaxKind("CompUnit");
    static BLOCK = new SyntaxKind("Block");
    static EXPR_STATEMENT = new SyntaxKind("ExprStatement");
    static EMPTY_STATEMENT = new SyntaxKind("EmptyStatement");
    static BLOCK_STATEMENT = new SyntaxKind("BlockStatement");
    static IF_CLAUSE = new SyntaxKind("IfClause");
    static IF_CLAUSE_LIST = new SyntaxKind("IfClauseList");
    static IF_STATEMENT = new SyntaxKind("IfStatement");
    static FOR_STATEMENT = new SyntaxKind("ForStatement");
    static WHILE_STATEMENT = new SyntaxKind("WhileStatement");
    static LAST_STATEMENT = new SyntaxKind("LastStatement");
    static NEXT_STATEMENT = new SyntaxKind("NextStatement");
    static RETURN_STATEMENT = new SyntaxKind("ReturnStatement");
    static VAR_DECL = new SyntaxKind("VarDecl");
    static PARAMETER = new SyntaxKind("Parameter");
    static PARAMETER_LIST = new SyntaxKind("ParameterList");
    static FUNC_DECL = new SyntaxKind("FuncDecl");
    static MACRO_DECL = new SyntaxKind("MacroDecl");
    static PREFIX_OP_EXPR = new SyntaxKind("PrefixOpExpr");
    static INFIX_OP_EXPR = new SyntaxKind("InfixOpExpr");
    static INDEXING_EXPR = new SyntaxKind("IndexingExpr");
    static ARGUMENT = new SyntaxKind("Argument");
    static ARGUMENT_LIST = new SyntaxKind("ArgumentList");
    static CALL_EXPR = new SyntaxKind("CallExpr");
    static INT_LIT_EXPR = new SyntaxKind("IntLitExpr");
    static STR_LIT_EXPR = new SyntaxKind("StrLitExpr");
    static BOOL_LIT_EXPR = new SyntaxKind("BoolLitExpr");
    static NONE_LIT_EXPR = new SyntaxKind("NoneLitExpr");
    static PAREN_EXPR = new SyntaxKind("ParenExpr");
    static DO_EXPR = new SyntaxKind("DoExpr");
    static ARRAY_INITIALIZER_EXPR = new SyntaxKind("ArrayInitializerExpr");
    static VAR_REF_EXPR = new SyntaxKind("VarRefExpr");
    static QUOTE_EXPR = new SyntaxKind("QuoteExpr");
    static UNQUOTE_EXPR = new SyntaxKind("UnquoteExpr");
}

export class SyntaxNode {
    kind: SyntaxKind;
    children: Array<SyntaxNode | null>;
    payload: bigint | string | boolean | null;

    constructor(
        kind: SyntaxKind,
        children: Array<SyntaxNode | null>,
        payload: bigint | string | boolean | null,
    ) {
        this.kind = kind;
        this.children = children;
        this.payload = payload;
    }
}

export function makeStrNode(payload: string): SyntaxNode {
    return new SyntaxNode(SyntaxKind.STR_NODE, [], payload);
}

export function isStrNode(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.STR_NODE;
}

export function strNodePayload(syntaxNode: SyntaxNode): string {
    return syntaxNode.payload as string;
}

export function makeIntNode(payload: bigint): SyntaxNode {
    return new SyntaxNode(SyntaxKind.INT_NODE, [], payload);
}

export function isIntNode(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.INT_NODE;
}

export function intNodePayload(syntaxNode: SyntaxNode): bigint {
    return syntaxNode.payload as bigint;
}

export function makeBoolNode(payload: boolean): SyntaxNode {
    return new SyntaxNode(SyntaxKind.BOOL_NODE, [], payload);
}

export function isBoolNode(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.BOOL_NODE;
}

export function boolNodePayload(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.payload as boolean;
}

export function makeCompUnit(statements: Array<SyntaxNode>): SyntaxNode {
    return new SyntaxNode(SyntaxKind.COMPUNIT, statements, null);
}

export function isCompUnit(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.COMPUNIT;
}

export function compUnitStatements(syntaxNode: SyntaxNode): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function makeBlock(statements: Array<SyntaxNode>): SyntaxNode {
    return new SyntaxNode(SyntaxKind.BLOCK, statements, null);
}

export function isBlock(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.BLOCK;
}

export function blockStatements(syntaxNode: SyntaxNode): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function isStatement(syntaxNode: SyntaxNode): boolean {
    return [isExprStatement, isEmptyStatement, isBlockStatement, isIfStatement,
        isForStatement, isWhileStatement, isLastStatement, isNextStatement,
        isReturnStatement].some((p) => p(syntaxNode));
}

export function makeExprStatement(expr: SyntaxNode) {
    return new SyntaxNode(SyntaxKind.EXPR_STATEMENT, [expr], null);
}

export function isExprStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.EXPR_STATEMENT;
}

export function exprStatementExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeEmptyStatement(): SyntaxNode {
    return new SyntaxNode(SyntaxKind.EMPTY_STATEMENT, [], null);
}

export function isEmptyStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.EMPTY_STATEMENT;
}

export function makeBlockStatement(block: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.BLOCK_STATEMENT, [block], null);
}

export function isBlockStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.BLOCK_STATEMENT;
}

export function blockStatementBlock(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeIfClause(
    condExpr: SyntaxNode,
    block: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(SyntaxKind.IF_CLAUSE, [condExpr, block], null);
}

export function isIfClause(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.IF_CLAUSE;
}

export function ifClauseCondExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function ifClauseBlock(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function makeIfClauseList(clauses: Array<SyntaxNode>): SyntaxNode {
    return new SyntaxNode(SyntaxKind.IF_CLAUSE_LIST, clauses, null);
}

export function isIfClauseList(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.IF_CLAUSE_LIST;
}

export function ifClauseListClauses(
    syntaxNode: SyntaxNode,
): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function makeIfStatement(
    clauseList: SyntaxNode,
    elseBlock: SyntaxNode | null,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.IF_STATEMENT,
        [clauseList, elseBlock],
        null,
    );
}

export function isIfStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.IF_STATEMENT;
}

export function ifStatementClauseList(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function ifStatementElseBlock(
    syntaxNode: SyntaxNode,
): SyntaxNode | null {
    return syntaxNode.children[1];
}

export function makeForStatement(
    name: SyntaxNode,
    arrayExpr: SyntaxNode,
    body: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.FOR_STATEMENT,
        [name, arrayExpr, body],
        null,
    );
}

export function isForStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.FOR_STATEMENT;
}

export function forStatementName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function forStatementArrayExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function forStatementBody(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[2] as SyntaxNode;
}

export function makeWhileStatement(
    condExpr: SyntaxNode,
    body: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.WHILE_STATEMENT,
        [condExpr, body],
        null,
    );
}

export function isWhileStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.WHILE_STATEMENT;
}

export function whileStatementCondExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function whileStatementBody(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function makeLastStatement(): SyntaxNode {
    return new SyntaxNode(SyntaxKind.LAST_STATEMENT, [], null);
}

export function isLastStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.LAST_STATEMENT;
}

export function makeNextStatement(): SyntaxNode {
    return new SyntaxNode(SyntaxKind.NEXT_STATEMENT, [], null);
}

export function isNextStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.NEXT_STATEMENT;
}

export function makeReturnStatement(expr: SyntaxNode | null): SyntaxNode {
    return new SyntaxNode(SyntaxKind.RETURN_STATEMENT, [expr], null);
}

export function isReturnStatement(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.RETURN_STATEMENT;
}

export function returnStatementExpr(
    syntaxNode: SyntaxNode,
): SyntaxNode | null {
    return syntaxNode.children[0];
}

export function makeVarDecl(
    name: SyntaxNode,
    type: null,
    initExpr: SyntaxNode | null,
): SyntaxNode {
    return new SyntaxNode(SyntaxKind.VAR_DECL, [name, type, initExpr], null);
}

export function isVarDecl(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.VAR_DECL;
}

export function varDeclName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function varDeclType(syntaxNode: SyntaxNode): SyntaxNode | null {
    return syntaxNode.children[1];
}

export function varDeclInitExpr(syntaxNode: SyntaxNode): SyntaxNode | null {
    return syntaxNode.children[2];
}

export function makeParameter(name: SyntaxNode, type: null): SyntaxNode {
    return new SyntaxNode(SyntaxKind.PARAMETER, [name, type], null);
}

export function isParameter(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.PARAMETER;
}

export function parameterName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function parameterType(syntaxNode: SyntaxNode): SyntaxNode | null {
    return syntaxNode.children[1];
}

export function makeParameterList(parameters: Array<SyntaxNode>): SyntaxNode {
    return new SyntaxNode(SyntaxKind.PARAMETER_LIST, parameters, null);
}

export function isParameterList(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.PARAMETER_LIST;
}

export function parameterListParameters(
    syntaxNode: SyntaxNode,
): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function makeFuncDecl(
    name: SyntaxNode,
    parameterList: SyntaxNode,
    type: null,
    body: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.FUNC_DECL,
        [name, parameterList, type, body],
        null,
    );
}

export function isFuncDecl(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.FUNC_DECL;
}

export function funcDeclName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function funcDeclParameterList(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function funcDeclType(syntaxNode: SyntaxNode): SyntaxNode | null {
    return syntaxNode.children[2];
}

export function funcDeclBody(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[3] as SyntaxNode;
}

export function makeMacroDecl(
    name: SyntaxNode,
    parameterList: SyntaxNode,
    type: null,
    body: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.MACRO_DECL,
        [name, parameterList, type, body],
        null,
    );
}

export function isMacroDecl(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.MACRO_DECL;
}

export function macroDeclName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function macroDeclParameterList(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function macroDeclType(syntaxNode: SyntaxNode): SyntaxNode | null {
    return syntaxNode.children[2];
}

export function macroDeclBody(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[3] as SyntaxNode;
}

export function isExpr(syntaxNode: SyntaxNode): boolean {
    return [
        isPrefixOpExpr, isInfixOpExpr, isIndexingExpr, isCallExpr,
        isIntLitExpr, isStrLitExpr, isBoolLitExpr, isNoneLitExpr, isDoExpr,
        isArrayInitializerExpr, isVarRefExpr, isQuoteExpr, isUnquoteExpr,
    ].some((p) => p(syntaxNode));
}

export function makePrefixOpExpr(
    opName: SyntaxNode,
    operand: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(SyntaxKind.PREFIX_OP_EXPR, [opName, operand], null);
}

export function isPrefixOpExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.PREFIX_OP_EXPR;
}

export function prefixOpExprOpName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function prefixOpExprOperand(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function makeInfixOpExpr(
    lhs: SyntaxNode,
    opName: SyntaxNode,
    rhs: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(SyntaxKind.INFIX_OP_EXPR, [lhs, opName, rhs], null);
}

export function isInfixOpExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.INFIX_OP_EXPR;
}

export function infixOpExprLhs(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function infixOpExprOpName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function infixOpExprRhs(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[2] as SyntaxNode;
}

export function makeIndexingExpr(
    arrayExpr: SyntaxNode,
    indexExpr: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.INDEXING_EXPR,
        [arrayExpr, indexExpr],
        null,
    );
}

export function isIndexingExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.INDEXING_EXPR;
}

export function indexingExprArrayExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function indexingExprIndexExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function makeArgument(expr: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.ARGUMENT, [expr], null);
}

export function isArgument(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.ARGUMENT;
}

export function argumentExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeArgumentList(args: Array<SyntaxNode>): SyntaxNode {
    return new SyntaxNode(SyntaxKind.ARGUMENT_LIST, args, null);
}

export function isArgumentList(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.ARGUMENT_LIST;
}

export function argumentListArguments(
    syntaxNode: SyntaxNode,
): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function makeCallExpr(
    funcExpr: SyntaxNode,
    argumentList: SyntaxNode,
): SyntaxNode {
    return new SyntaxNode(
        SyntaxKind.CALL_EXPR,
        [funcExpr, argumentList],
        null,
    );
}

export function isCallExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.CALL_EXPR;
}

export function callExprFuncExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function callExprArgumentList(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[1] as SyntaxNode;
}

export function makeIntLitExpr(value: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.INT_LIT_EXPR, [value], null);
}

export function isIntLitExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.INT_LIT_EXPR;
}

export function intLitExprValue(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeStrLitExpr(value: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.STR_LIT_EXPR, [value], null);
}

export function isStrLitExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.STR_LIT_EXPR;
}

export function strLitExprValue(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeBoolLitExpr(value: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.BOOL_LIT_EXPR, [value], null);
}

export function isBoolLitExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.BOOL_LIT_EXPR;
}

export function boolLitExprValue(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeNoneLitExpr(): SyntaxNode {
    return new SyntaxNode(SyntaxKind.NONE_LIT_EXPR, [], null);
}

export function isNoneLitExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.NONE_LIT_EXPR;
}

export function makeParenExpr(innerExpr: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.PAREN_EXPR, [innerExpr], null);
}

export function isParenExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.PAREN_EXPR;
}

export function parenExprInnerExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeDoExpr(statement: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.DO_EXPR, [statement], null);
}

export function isDoExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.DO_EXPR;
}

export function doExprStatement(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeArrayInitializerExpr(
    elements: Array<SyntaxNode>,
): SyntaxNode {
    return new SyntaxNode(SyntaxKind.ARRAY_INITIALIZER_EXPR, elements, null);
}

export function isArrayInitializerExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.ARRAY_INITIALIZER_EXPR;
}

export function arrayInitializerExprElements(
    syntaxNode: SyntaxNode,
): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function makeVarRefExpr(name: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.VAR_REF_EXPR, [name], null);
}

export function isVarRefExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.VAR_REF_EXPR;
}

export function varRefExprName(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

export function makeQuoteExpr(statements: Array<SyntaxNode>): SyntaxNode {
    return new SyntaxNode(SyntaxKind.QUOTE_EXPR, statements, null);
}

export function isQuoteExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.QUOTE_EXPR;
}

export function quoteExprStatements(
    syntaxNode: SyntaxNode,
): Array<SyntaxNode> {
    return syntaxNode.children as Array<SyntaxNode>;
}

export function makeUnquoteExpr(innerExpr: SyntaxNode): SyntaxNode {
    return new SyntaxNode(SyntaxKind.UNQUOTE_EXPR, [innerExpr], null);
}

export function isUnquoteExpr(syntaxNode: SyntaxNode): boolean {
    return syntaxNode.kind === SyntaxKind.UNQUOTE_EXPR;
}

export function unquoteExprInnerExpr(syntaxNode: SyntaxNode): SyntaxNode {
    return syntaxNode.children[0] as SyntaxNode;
}

