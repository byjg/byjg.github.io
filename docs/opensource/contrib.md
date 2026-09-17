# Contributing

Thank you for taking the time to contribute. Every ByJG component is
[MIT licensed](/license/), developed in the open, and pull requests are welcome.

Contributing to a PHP component has a few conventions of its own -- branches per
release series, and the composer commands CI runs. Those are on
[Contributing to PHP components](contrib-php.md); everything here applies to
every repository.

## Reporting an issue

Open it in the repository the problem is in, at
[github.com/byjg](https://github.com/byjg). What to put in it is on
[Issues](issues.md).

## Which branch

**Open the pull request against the repository's default branch.** That is
`master` in most repositories and `main` in a few (`mcpserver-byjg-docs`,
`shellscript-download`); it is the branch you get from a plain `git clone`.

Other branches you may see are not where contributions go:

| Branch | What it is |
|---|---|
| `4.9`, `5.0`, `6.0` in a PHP component | An older release series, kept for maintenance -- see [Contributing to PHP components](contrib-php.md) |
| `1.25`, `1.28`, `1.30`, `stable` in `docker-nginx-xtras` | The **upstream nginx** version each image is built from, not a ByJG release |
| Anything else | Someone's work in progress |

## What a pull request needs

The default branch is protected, and these rules are enforced by GitHub, not by
convention:

- **One approving review.** Pushing new commits dismisses a previous approval,
  so ask for a re-review after changing something.
- **Merge, squash and rebase** are all allowed; the maintainer picks.
- **No force-push and no branch deletion** on the protected branch.

Beyond that, what makes a pull request easy to accept is the same thing that
keeps these projects maintainable --
[Simple Principles to Avoid Overcomplicating the Complex](/blog/simple-principles-avoid-complexity)
says it better, and in short:

- **Keep it small, keep it simple.** One fix or one feature. More lines are not
  more robustness, and a pull request that mixes refactoring with behaviour
  takes much longer to review.
- **Include a test.** Good tests are what let the next person refactor without
  fear. A change without one is a change nobody can protect.
- **Explain the why** in the commit message and the description. The what is
  visible in the diff.
- **If it is getting hard, say so.** Fighting the code usually means the
  approach is wrong, not that you need more persistence. Open the pull request
  as a draft, or an issue, and let's find the simpler path together -- that is
  far more welcome than a workaround pushed through.

## Run the checks before you open it

CI runs the same commands, so running them first saves a round trip. When the
repository has a `docker-compose.yml`, the tests need those services:

```bash
docker compose up -d
```

| Project | Commands |
|---|---|
| PHP component | See [Contributing to PHP components](contrib-php.md) |
| JavaScript | `yarn` to install, then `yarn test` where the repository defines it. CI builds on **Node 22 and 24** |
| Python | `uv run pytest` |
| Docker image | Build the image, and run the tests the repository ships |

## Documentation

Documentation lives **in the component's own repository**: its `README.md` and
its `docs/` folder. When the project publishes, a workflow copies both into
this site, so a change in behaviour and the matching change in documentation
belong in the same pull request.

Never edit the documentation here at
[byjg/byjg.github.io](https://github.com/byjg/byjg.github.io): the `docs/`
folder of this site is generated, and the next publish of the component
overwrites it. The pages under
[Development Guidelines](/docs/opensource/guidelines/) describe how that
publishing works, and are worth reading before adding a new project.

## Community

Everyone taking part follows the [Code of Conduct](https://github.com/byjg/.github/blob/main/CODE_OF_CONDUCT.md).
Be respectful, and assume the person on the other side is doing their best with
the time they have. Ask when something is unclear -- an issue asking a question
is a perfectly good contribution, and often turns into a documentation fix.
