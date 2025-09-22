import test from "ava";
import {
    run,
} from "../src/run";

test("boolean literals", (t) => {
    t.is(run("false"), "false");
    t.is(run("true"), "true");
});

