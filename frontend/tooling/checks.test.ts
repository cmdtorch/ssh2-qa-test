import { basename } from "node:path";

import { expect, it } from "vitest";

import { runScript, withFixture } from "./run";

// @scenario web-app :: Clean frontend passes the checks
// @case web-app :: ESLint and Prettier on delivered code
it("passes lint and format checks on the delivered code", () => {
  const lint = runScript("lint");
  const format = runScript("format:check");

  expect(lint, lint.output).toMatchObject({ status: 0 });
  expect(format, format.output).toMatchObject({ status: 0 });
  expect(format.output).toContain("All matched files use Prettier code style!");
});

// @scenario web-app :: Format violation is reported
// @case web-app :: Badly formatted frontend file
it("reports an unformatted file by name", () => {
  withFixture("ugly.ts", "export const a   =   {b:1}\n", (dir) => {
    const format = runScript("format:check");

    expect(format.status).toBe(1);
    expect(format.output).toContain(`[warn] ${basename(dir)}/ugly.ts`);
    expect(format.output).toContain(
      "Code style issues found in the above file.",
    );
  });
});

// @scenario web-app :: Lint violation is reported
// @case web-app :: Unused variable in a frontend file
it("reports an unused variable with the file and the rule", () => {
  withFixture("unused.ts", "const unusedValue = 1; export {};\n", (dir) => {
    const lint = runScript("lint");

    expect(lint.status).toBe(1);
    expect(lint.output).toContain(`${dir}/unused.ts`);
    expect(lint.output).toMatch(
      /1:7\s+error\s+'unusedValue' is assigned a value but never used\s+@typescript-eslint\/no-unused-vars/,
    );
  });
});

// @scenario web-app :: Type check passes
// @case web-app :: Type check on delivered code
it("passes the type check on the delivered code", () => {
  const typecheck = runScript("typecheck");

  expect(typecheck, typecheck.output).toMatchObject({ status: 0 });
});

// @scenario web-app :: Type error is reported
// @case web-app :: Number assigned to a string variable
it("reports a type error with the file name", () => {
  withFixture("broken.ts", "export const title: string = 42;\n", (dir) => {
    const typecheck = runScript("typecheck");

    expect(typecheck.status).not.toBe(0);
    expect(typecheck.output).toContain(
      `${basename(dir)}/broken.ts(1,14): error TS2322: Type 'number' is not assignable to type 'string'.`,
    );
  });
});
