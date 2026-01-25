import {
    Lexer,
} from "./compiler/lex";
import {
    macroExpandCompUnit,
} from "./compiler/expand";
import {
    Parser,
} from "./compiler/parse";
import {
    Block,
    CompUnit,
} from "./compiler/syntax";
import {
    validateCompUnit,
} from "./compiler/validate";
import {
    displayValue,
} from "./runtime/display";
import {
    Env,
} from "./runtime/env";
import {
    runCompUnit,
    runCompUnitWithFuel,
} from "./runtime/evaluate";

export {
    E201_SyntaxError,
    E301_RedeclarationError,
    E302_UseBeforeDeclarationError,
    E303_UnquoteOutsideQuoteError,
} from "./compiler/error";
export {
    E500_OutOfFuel,
    E601_ZeroDivisionError,
    E602_UnchainableOpsError,
    E603_TypeError,
    E604_IndexError,
    E605_UninitializedError,
    E606_UndeclaredError,
    E607_CannotAssignError,
    E608_ReadonlyError,
    E609_LastOutsideLoopError,
    E610_NextOutsideLoopError,
    E611_TooManyArgumentsError,
    E612_NotEnoughArgumentsError,
    E613_ReturnOutsideRoutineError,
    E614_MacroAtRuntimeError,
} from "./runtime/error";

export function run(source: string): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let compUnit = parser.parseCompUnit();
    validateCompUnit(compUnit);
    let staticEnvs = new Map<CompUnit | Block, Env>();
    compUnit = macroExpandCompUnit(compUnit, staticEnvs);
    let value = runCompUnit(compUnit, staticEnvs);
    return displayValue(value, new Set());
}

export function runWithFuel(source: string, fuel: number): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let compUnit = parser.parseCompUnit();
    validateCompUnit(compUnit);
    let staticEnvs = new Map<CompUnit | Block, Env>();
    compUnit = macroExpandCompUnit(compUnit, staticEnvs);
    let value = runCompUnitWithFuel(compUnit, fuel, staticEnvs);
    return displayValue(value, new Set());
}

