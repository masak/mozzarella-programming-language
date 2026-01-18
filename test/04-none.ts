import test from "ava";
import {
    run,
} from "../src/go";

test("none literal", (t) => {
    t.is(run("none"), "none");
});

