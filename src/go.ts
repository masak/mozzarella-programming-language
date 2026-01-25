import {
    IrCompUnit,
} from "./compiler/ir";
import {
    Lexer,
} from "./compiler/lex";
import {
    Parser,
} from "./compiler/parse";
import {
    syntaxToIr,
} from "./compiler/syntax-to-ir";
import {
    validateCompUnit,
} from "./compiler/validate";
import {
    displayValue,
} from "./runtime/display";
import {
    runIr,
} from "./runtime/run-ir";

export {
    E201_SyntaxError,
    E301_RedeclarationError,
    E302_UseBeforeDeclarationError,
    E303_UnquoteOutsideQuoteError,
    E502_UnchainableOpsError,
} from "./compiler/error";
export {
    E500_OutOfFuel,
    E601_ZeroDivisionError,
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

export function run(source: string | IrCompUnit): string {
    let irCompUnit: IrCompUnit;

    if (typeof source === "string") {
        let lexer = new Lexer(source);
        let parser = new Parser(lexer);
        let compUnit = parser.parseCompUnit();
        validateCompUnit(compUnit);
        irCompUnit = syntaxToIr(compUnit);
    }
    else {
        irCompUnit = source;
    }

    let value = runIr(irCompUnit);
    return displayValue(value, new Set());
}

