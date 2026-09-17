# Issues

Bugs, feature requests and questions all go to the **issue tracker of the
repository they belong to**, at [github.com/byjg](https://github.com/byjg).
There is no separate forum: discussions are turned off, so an issue is the
right place to ask.

**A security vulnerability is the exception**: never report it in an issue. See
[Security](security.md).

## Before opening one

Search the existing issues, open and closed. A closed issue often carries the
answer, or the release that fixed it.

Check which version you are on. For a PHP component:

```bash
composer show byjg/<component>
```

If you are several versions behind, try the current one first -- the problem may
already be fixed.

## Reporting a bug

What turns a report into a fix, roughly in order of usefulness:

1. **A way to reproduce it.** A few lines that fail are worth more than a
   paragraph describing the failure. A failing test is worth even more.
2. **What you expected, and what happened instead**, including the exact error
   message and stack trace.
3. **Versions**: the component's version, and the runtime it runs on -- the PHP
   version for a PHP component, the image tag for a Docker image, the Node
   version for a JavaScript library.
4. **Your environment**, when it is relevant: which database and version, which
   queue server, the operating system.

Please paste text rather than screenshots of text -- an error message in a
screenshot cannot be searched or copied.

## Asking for a feature

Describe the problem you are trying to solve before the solution you have in
mind. The components are deliberately small, so the answer is sometimes "this
belongs in your application" or "this is what component X already does" -- and
that answer arrives much faster when the underlying need is clear.

## Asking a question

Ask. If the answer turns out to be written down somewhere, the issue tells us
that page is hard to find; if it is not written down, the issue usually becomes
a documentation fix. Either way it is useful.

## What happens next

A confirmed issue is fixed through a pull request, from a maintainer or from
you -- if you already have one, see
[Contributing](contrib.md); a report with a fix attached is the fastest path
there is.
