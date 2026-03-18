class TokenKind {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static IntLit = new TokenKind("IntLit");
}

class CharacterClass {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

const ASCII_DIGIT = new CharacterClass("ASCII digit");

class RuleBuilder {
    tokenKind: TokenKind;
    rule: Rule;

    constructor(tokenKind: TokenKind) {
        this.tokenKind = tokenKind;
        this.rule = new Rule([]);
    }

    cc(characterClass: CharacterClass): RuleBuilder {
        this.rule = appendAtom(
            this.rule,
            makeCharacterClassAtom(characterClass),
        );
        return this;
    }

    zeroOrMore(loopBody: (r: RuleBuilder) => void): RuleBuilder {
        let r = new RuleBuilder(this.tokenKind);
        loopBody(r);
        this.rule = appendAtom(
            this.rule,
            makeZeroOrMore(r.rule),
        );
        return this;
    }

    acc(): RuleBuilder {
        this.rule = makeAccumulating(this.rule);
        return this;
    }

    ch(character: string): RuleBuilder {
        this.rule = appendAtom(
            this.rule,
            characterAtom(character),
        );
        return this;
    }

    orError(message: string): RuleBuilder {
        this.rule = attachError(this.rule, message);
        return this;
    }

    or(): RuleBuilder {
        this.rule = makeNewAlternative(this.rule);
        return this;
    }

    payload(stringBuilder: (characters: Array<string>) => string): void {
        this.rule = attachPayload(this.rule, stringBuilder);
    }
}

class Rule {
    atoms: Array<Atom>;

    constructor(atoms: Array<Atom>) {
        this.atoms = atoms;
    }
}

abstract class Atom {
}

class CharacterClassAtom extends Atom {
    characterClass: CharacterClass;

    constructor(characterClass: CharacterClass) {
        super();
        this.characterClass = characterClass;
    }
}

function makeCharacterClassAtom(characterClass: CharacterClass) {
    return new CharacterClassAtom(characterClass);
}

class ZeroOrMoreAtom extends Atom {
    rule: Rule;

    constructor(rule: Rule) {
        super();
        this.rule = rule;
    }
}

function makeZeroOrMore(rule: Rule) {
    return new ZeroOrMoreAtom(rule);
}

function appendAtom(rule: Rule, atom: Atom) {
    return new Rule([...rule.atoms, atom]);
}

class LexerSpec {
    rules: Array<Rule> = [];

    constructor(rules: Array<Rule>) {
        this.rules = rules;
    }
}

function defineLexer(
    definitionBody: (addRule: (tokenKind: TokenKind) => RuleBuilder) => void,
): LexerSpec {
    let rules: Array<Rule> = [];

    definitionBody((tokenKind: TokenKind) => {
        return new RuleBuilder(tokenKind);
    });

    return new LexerSpec(rules);
}

defineLexer((addRule) => {
    addRule(TokenKind.IntLit).cc(ASCII_DIGIT).acc().zeroOrMore((r) => {
        r.ch("_").cc(ASCII_DIGIT).acc().orError("Underscore must be followed by a digit")
        .or()
        .cc(ASCII_DIGIT).acc();
    }).payload((chars) => chars.join(""));
});
