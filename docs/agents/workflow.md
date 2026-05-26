# Workflow conventions

Team standards for branching, committing, and merging. Skills that create branches, write commits, or open pull requests read from here to operate consistently with the project's standards.

## Base branch

`main` — the default target for all pull requests.

## Branch naming

`feat/<slug>` for new features, `fix/<slug>` for bug fixes. Use lowercase kebab-case for the slug (e.g. `feat/add-exercise-log`, `fix/timer-reset`).

## Commit message format

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

Where `type` is one of: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`.

`scope` is optional but encouraged — use the feature or module name (e.g. `feat(exercises): add rep counter`).

The description is lowercase, imperative mood, no trailing period.

## Merge strategy

Squash and merge; delete the branch after merge. Each PR becomes one commit on `main`.

## PR title format

Mirrors the commit message format: `<type>(<scope>): <description>` — the squash commit message is taken directly from the PR title.
