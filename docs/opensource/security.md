# Security

**Found a vulnerability? Please do not open a public issue.** Report it
privately: open the repository the problem is in, go to the **Security** tab
and select **Report a vulnerability**.

The full policy -- which versions receive fixes, what to include, and what
happens after you report -- is the
[security policy](https://github.com/byjg/.github/blob/main/SECURITY.md) that every ByJG repository shares. In short:

- Security fixes go to the latest release of the current series and to the next
  major while it is unreleased; older series do not receive them.
- Security reports take priority over all other work, and every step happens
  in the private report thread, visible to the reporter.
- Details stay private until a fix is released; if a fix is not ready within
  90 days, a disclosure date is agreed with the reporter.
- A fix is released as a patch and announced as a GitHub Security Advisory, which
  is what `composer audit` and Dependabot read.
