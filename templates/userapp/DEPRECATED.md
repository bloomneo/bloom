# Deprecated

This template is frozen as of Bloom 5.1.0 and will be removed in 6.0.

`bloom create <name> userapp` now composes the same application from the `app`
base plus layers. Nothing is lost — the layered path has full parity and adds
combinations this directory never supported (for example auth + mobile).

Why it went: each of these six directories held a complete copy of the source
tree. A fix had to land in six places, they drifted, and combinations that were
not pre-built simply did not exist.

To keep using this exact tree for one more release:

    bloom create <name> userapp --legacy
