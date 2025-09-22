import test from "ava";
import {
    run,
} from "../src/run";

test("none literal", (t) => {
    t.is(run("none"), "none");
});

