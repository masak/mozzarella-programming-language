import test from "ava";
import {
    run,
} from "../src/go";

test("integer literals", (t) => {
    t.is(run("12345"), "12345");
    t.is(run("0"), "0");
    t.is(run("654_321"), "654321");
});

