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
} from "./compiler/error";
export {
    E500_OutOfFuel,
    E501_ZeroDivisionError,
    E502_UnchainableOpsError,
    E503_TypeError,
    E504_IndexError,
    E505_UninitializedError,
    E506_UndeclaredError,
    E507_CannotAssignError,
    E508_ReadonlyError,
    E509_LastOutsideLoopError,
    E510_NextOutsideLoopError,
    E511_TooManyArgumentsError,
    E512_NotEnoughArgumentsError,
    E513_ReturnOutsideRoutineError,
    E514_MacroAtRuntimeError,
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

