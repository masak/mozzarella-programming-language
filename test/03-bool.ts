import test from "ava";
import {
    run,
} from "../src/go";

test("boolean literals", (t) => {
    t.is(run("false"), "false");
    t.is(run("true"), "true");
});

