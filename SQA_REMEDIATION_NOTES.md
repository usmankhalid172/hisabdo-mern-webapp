# SQA Remediation Notes

Addressed against the SQA issue list dated 19 Aug 2026:

- ISS-01: Founder GitHub link updated to the repository URL declared in package metadata.
- ISS-02: Referenced raster images converted to WebP and resized where appropriate; non-critical images remain lazy/async.
- ISS-03: Explicit width/height attributes added to HTML images to reserve layout space; CSS aspect-ratio hints preserved where used.
- ISS-04: Local components/main scripts marked defer to reduce parser blocking.
- ISS-05: Additional mobile centering/max-width hardening added.
- ISS-06: Non-critical local scripts deferred; final main-thread/Lighthouse confirmation still requires a fresh browser/PageSpeed run by SQA.

Important: Lighthouse/PageSpeed scores cannot be truthfully confirmed from static source inspection alone. SQA should run the fresh device/PageSpeed test requested in its note.
