# Deploying cedarstonellc.com

The site is live for preview at the GitHub Pages project URL. It is NOT yet on the
real domain, because `cedarstonellc.com` currently points at the old Netlify holding
page.

## To put it on the real domain (one action, at the registrar)

1. In the DNS for `cedarstonellc.com`, replace the current records with:

   | Type  | Host | Value                  |
   |-------|------|------------------------|
   | A     | @    | 185.199.108.153        |
   | A     | @    | 185.199.109.153        |
   | A     | @    | 185.199.110.153        |
   | A     | @    | 185.199.111.153        |
   | CNAME | www  | cedarstone-ventures.github.io. |

2. Tell the operator. It then runs `mv CNAME.pending CNAME`, commits, and enables
   HTTPS. Propagation is usually minutes, occasionally a few hours.

`CNAME.pending` is held out of the build on purpose: while a CNAME file is present,
GitHub Pages serves ONLY at the custom domain, which would make the site unreachable
for preview until DNS moves.
