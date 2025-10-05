import test from "ava";
import {
    run,
} from "../src/run";

test("block statements", (t) => {
    t.is(run("{ 1; 2 } 3"), "3");
    t.is(run("1; { 2; 3 }"), "3");
    t.is(run("{} 1"), "1");
    t.is(run("1; {}"), "none");
});

