# Delivery workflow

The contract every piece of work follows. The assigned GitHub issue is
the only authoritative specification for the current task.

## Model

```
Milestone = a closable project phase
Issue     = a reviewable outcome
Branch    = exactly one issue
PR        = exactly one issue
Commit    = one logical part of the outcome
```

No code is written without an active issue. No pull request resolves two
issues. No phase begins before the previous milestone meets its exit
criteria.

## Issue format

Every work item uses this structure:

```
Outcome              a concrete, reviewable result
Context              why the result is needed and how it fits
Allowed files        exactly which files may change
Scope                what is done
Out of scope         what is explicitly not done
Dependencies         issues that must be closed first
Acceptance criteria  objectively verifiable requirements
Validation commands  the commands that must pass
Required evidence    screenshots, measurements, test output
```

## Allowed files

Only files listed under Allowed files may change. If the work requires
any other file, the work stops and the issue is amended first. An open
category is not a valid Allowed files entry.

## Stop conditions

Work stops and is reported — never improvised — when:

- a new dependency appears to be needed;
- global architecture would need to change;
- a requirement conflicts with a decision record;
- the issue is too large for one focused session (30 minutes–4 hours);
- files outside Allowed files would need changes;
- a quality check was already broken before the work began;
- required copy or a design decision is missing;
- experimental CSS would be required for a core function;
- a decision field in the issue is unfilled.

Stopping is correct scope control, not failure.

## Gates are phase-aware

A quality gate becomes mandatory immediately when its owning issue is
merged. Earlier issues are responsible only for the gates available when
their work begins. The issue introducing a gate must pass that gate
before it can close.

## Binary assets

No image or other binary brand asset may be committed until its owning
issue defines and executes a metadata inspection and sanitisation step.
The issue introducing a binary asset includes: neutral filename, metadata
inspection, metadata removal, dimensions, format, file-size verification,
and visual verification.

## Negative fixtures

Files that deliberately violate a gate are generated temporarily and are
never committed to repository history.

## Before work begins

The implementer posts:

```
Issue:
Expected outcome:
Files to change:
Files explicitly not changing:
Validation commands:
Risks or ambiguities:
```

## When work is complete

The implementer posts:

```
Completed:
Files changed:
Acceptance criteria:
Validation results:
Evidence:
Remaining concerns:
```

## Definition of Done

An issue is not done until:

- [ ] Scope is unchanged
- [ ] Only allowed files are changed
- [ ] Acceptance criteria are met
- [ ] HTML is semantic and validated
- [ ] CSS is validated and linted
- [ ] No unnecessary JavaScript has been added
- [ ] No dependency has been added without approval
- [ ] No noisy or explanatory comments have been added
- [ ] Accessibility has been verified
- [ ] Mobile and desktop have been verified
- [ ] Reduced motion works where motion exists
- [ ] No console errors or warnings
- [ ] The deployable directory serves correctly
- [ ] Necessary documentation is updated
- [ ] Evidence is in the pull request

Applied phase-aware: only the gates that exist bind the issue.
