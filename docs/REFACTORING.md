# Refactoring Rules

## Objective
Improve maintainability without changing external behavior unless explicitly planned.

## When Refactoring Is Allowed
- Code readability is poor.
- Duplication increases change risk.
- Module boundaries are unclear.
- Security or reliability improves through structure.

## Required Process
1. Freeze behavior with tests (or characterize current behavior first).
2. Refactor in small isolated steps.
3. Keep each step deployable.
4. Run lint, tests, and static checks after each step.
5. Document any intentional behavior change.

## Guardrails
- No mixed commits: refactor and feature work should be separate.
- No schema or API change hidden inside "cleanup".
- Do not rename large surfaces without migration notes.
- Preserve observability: logs, metrics, and traces must remain useful.

## Refactor Checklist
- Public API compatibility checked.
- Data contracts unchanged or versioned.
- Error semantics preserved.
- Performance baseline not degraded.
- Security controls unchanged or stronger.
