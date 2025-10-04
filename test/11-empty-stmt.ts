import test from "ava";
import {
    run,
} from "../src/run";

test("empty statement", (t) => {
    t.is(run(""), "none");
    t.is(run(";"), "none");
    t.is(run("\n\n"), "none");
    t.is(run("    "), "none");
    t.is(run("  ;     "), "none");
    t.is(run("  ;  \n  "), "none");
});

