import test from "ava";
import {
    run,
} from "../src/go";

test("string literals", (t) => {
    t.is(run('""'), '""');
    t.is(run('"abc"'), '"abc"');
    t.is(run('"x\\n\\r\\"y"'), '"x\\n\\r\\"y"');
    t.is(run('"tabs\\ttabs"'), '"tabs\\ttabs"');
});

