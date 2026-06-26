# Source notes

- This is a static redesign based on the public information contained in the prior static export of `https://www.biodiversity.se/`.
- It is not the proprietary Wix editor/runtime source code.
- The uploaded `BDDL_icononly_300x300.png` logo has been copied into `assets/img/logo-icon.png` and used throughout the design.
- The site reorganizes the original pages into fewer tabs while preserving the key content:
  - Home
  - Projects + Measuring Biodiversity → Research
  - People → Team
  - News + Papers + Gallery → Outputs
  - Contact + Donate → Connect
- Remote media URLs are listed in `assets/data/media-manifest.json` (74 unique URLs). Use `scripts/localize_wix_media.py` to download them locally before decommissioning Wix hosting.

- User-supplied team photos are included locally as `lab-working-session.jpg`, `lab-working-session-crop.jpg`, `lab-tree-portrait.jpg`, and `lab-uppsala-selfie.jpg`.
- The landing page was updated with the supplied mission statement, definition of data-driven biodiversity research, revised Who we are text, and updated Environmental DNA / Remote sensing / Machine learning pillar text.
