import test from "ava";
import {
    run,
} from "../src/go";

test("comparison operators", (t) => {
    t.is(run("1 < 2"), "true");
    t.is(run("2 < 1"), "false");
    t.is(run("3 < 3"), "false");

    t.is(run("3 < 6 < 9"), "true");
    t.is(run("3 < 9 < 6"), "false");
    t.is(run("6 < 3 < 9"), "false");
    t.is(run("3 < 6 < 6"), "false");

    t.is(run("1 <= 2"), "true");
    t.is(run("2 <= 1"), "false");
    t.is(run("3 <= 3"), "true");

    t.is(run("3 <= 6 <= 9"), "true");
    t.is(run("3 <= 9 <= 6"), "false");
    t.is(run("6 <= 3 <= 9"), "false");
    t.is(run("3 <= 6 <= 6"), "true");

    t.is(run("3 < 6 <= 9"), "true");
    t.is(run("3 < 9 <= 6"), "false");
    t.is(run("6 < 3 <= 9"), "false");
    t.is(run("3 < 6 <= 6"), "true");

    t.is(run('"ab" < "abc"'), "true");
    t.is(run('"abc" < "ab"'), "false");
    t.is(run('"crab" < "crab"'), "false");

    t.is(run('"crab" < "fusion" < "indigo"'), "true");
    t.is(run('"crab" < "indigo" < "fusion"'), "false");
    t.is(run('"fusion" < "crab" < "indigo"'), "false");
    t.is(run('"crab" < "fusion" < "fusion"'), "false");

    t.is(run('"ab" <= "abc"'), "true");
    t.is(run('"abc" <= "ab"'), "false");
    t.is(run('"crab" <= "crab"'), "true");

    t.is(run('"crab" <= "fusion" <= "indigo"'), "true");
    t.is(run('"crab" <= "indigo" <= "fusion"'), "false");
    t.is(run('"fusion" <= "crab" <= "indigo"'), "false");
    t.is(run('"crab" <= "fusion" <= "fusion"'), "true");

    t.is(run('"crab" < "fusion" <= "indigo"'), "true");
    t.is(run('"crab" < "indigo" <= "fusion"'), "false");
    t.is(run('"fusion" < "crab" <= "indigo"'), "false");
    t.is(run('"crab" < "fusion" <= "fusion"'), "true");

    t.is(run("2 > 1"), "true");
    t.is(run("1 > 2"), "false");
    t.is(run("3 > 3"), "false");

    t.is(run("9 > 6 > 3"), "true");
    t.is(run("6 > 9 > 3"), "false");
    t.is(run("9 > 3 > 6"), "false");
    t.is(run("6 > 6 > 3"), "false");

    t.is(run("2 >= 1"), "true");
    t.is(run("1 >= 2"), "false");
    t.is(run("3 >= 3"), "true");

    t.is(run("9 >= 6 >= 3"), "true");
    t.is(run("6 >= 9 >= 3"), "false");
    t.is(run("9 >= 3 >= 6"), "false");
    t.is(run("6 >= 6 >= 3"), "true");

    t.is(run("9 >= 6 > 3"), "true");
    t.is(run("6 >= 9 > 3"), "false");
    t.is(run("9 >= 3 > 6"), "false");
    t.is(run("6 >= 6 > 3"), "true");

    t.is(run('"abc" > "ab"'), "true");
    t.is(run('"ab" > "abc"'), "false");
    t.is(run('"crab" > "crab"'), "false");

    t.is(run('"indigo" > "fusion" > "crab"'), "true");
    t.is(run('"fusion" > "indigo" > "crab"'), "false");
    t.is(run('"indigo" > "crab" > "fusion"'), "false");
    t.is(run('"fusion" > "fusion" > "crab"'), "false");

    t.is(run('"abc" >= "ab"'), "true");
    t.is(run('"ab" >= "abc"'), "false");
    t.is(run('"crab" >= "crab"'), "true");

    t.is(run('"indigo" >= "fusion" >= "crab"'), "true");
    t.is(run('"fusion" >= "indigo" >= "crab"'), "false");
    t.is(run('"indigo" >= "crab" >= "fusion"'), "false");
    t.is(run('"fusion" >= "fusion" >= "crab"'), "true");

    t.is(run('"indigo" >= "fusion" > "crab"'), "true");
    t.is(run('"fusion" >= "indigo" > "crab"'), "false");
    t.is(run('"indigo" >= "crab" > "fusion"'), "false");
    t.is(run('"fusion" >= "fusion" > "crab"'), "true");

    t.is(run("5 == 5"), "true");
    t.is(run("5 == -5"), "false");
    t.is(run("5 == 42"), "false");
    t.is(run("0 == -0"), "true");
    t.is(run('"foo" == "foo"'), "true");
    t.is(run('"" == ""'), "true");
    t.is(run('"foo" == ""'), "false");
    t.is(run('"foo" == "bar"'), "false");
    t.is(run('5 == "5"'), "false");
    t.is(run('5 == "foo"'), "false");
    t.is(run('0 == ""'), "false");

    t.is(run("5 != 5"), "false");
    t.is(run("5 != -5"), "true");
    t.is(run("5 != 42"), "true");
    t.is(run("0 != -0"), "false");
    t.is(run('"foo" != "foo"'), "false");
    t.is(run('"" != ""'), "false");
    t.is(run('"foo" != ""'), "true");
    t.is(run('"foo" != "bar"'), "true");
    t.is(run('5 != "5"'), "true");
    t.is(run('5 != "foo"'), "true");
    t.is(run('0 != ""'), "true");

    t.is(run("3 < 6 == 6 < 9"), "true");
    t.is(run("3 < 6 == 9 < 9"), "false");
    t.is(run("3 <= 6 == 6 <= 9"), "true");
    t.is(run("3 <= 6 == 9 <= 6"), "false");

    t.is(run('"crab" < "fusion" == "fusion" < "indigo"'), "true");
    t.is(run('"crab" < "fusion" == "indigo" < "indigo"'), "false");
    t.is(run('"crab" <= "fusion" == "fusion" <= "indigo"'), "true");
    t.is(run('"crab" <= "fusion" == "indigo" <= "fusion"'), "false");

    t.is(run("9 > 6 == 6 > 3"), "true");
    t.is(run("9 > 9 == 6 > 3"), "false");
    t.is(run("9 >= 6 == 6 >= 3"), "true");
    t.is(run("6 >= 9 == 6 >= 3"), "false");

    t.is(run('"indigo" > "fusion" == "fusion" > "crab"'), "true");
    t.is(run('"indigo" > "fusion" == "indigo" > "crab"'), "false");
    t.is(run('"indigo" >= "fusion" == "fusion" >= "crab"'), "true");
    t.is(run('"fusion" >= "indigo" == "fusion" >= "crab"'), "false");

    t.throws(() => run("5 == 5 != 5"));
    t.throws(() => run("5 != 5 != 5"));
    t.throws(() => run("5 < 6 != 5"));
    t.throws(() => run('5 < 6 != "foo"'));

    t.throws(() => run("3 < 6 != 6 < 9"));
    t.throws(() => run("3 < 6 != 9 < 9"));
    t.throws(() => run("3 <= 6 != 6 <= 9"));
    t.throws(() => run("3 <= 6 != 9 <= 6"));

    t.throws(() => run('"indigo" > "fusion" != "fusion" > "crab"'));
    t.throws(() => run('"indigo" > "fusion" != "indigo" > "crab"'));
    t.throws(() => run('"indigo" >= "fusion" != "fusion" >= "crab"'));
    t.throws(() => run('"fusion" >= "indigo" != "fusion" >= "crab"'));
});

