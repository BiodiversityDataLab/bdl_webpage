# Biodiversity Data Lab - Modern Static Site

This folder contains a redesigned static version of the Biodiversity Data Lab webpage. The top navigation has five tabs, two of them with dropdown sub-pages:

- **Home** (`/`) - mission, research pillars, lab life, and featured work
- **Team** (`/team/`)
  - **Lab members** (`/team/`) - current and previous lab members
  - **Activities** (`/team/activities/`) - lab moments and gallery (conferences, workshops, field trips)
- **Research** (`/research/`) - workflow overview and ongoing projects
  - **Publications** (`/research/publications/`)
  - **Software** (`/research/software/`) - BIOSCANN, environmental data pipeline, GitHub
  - **Fieldwork** (`/research/fieldwork/`) - insect traps, soil sampling, prescribed burning
- **News** (`/news/`)
- **Contact** (`/contact/`) - student projects, contact details, and donation/support information

The colour palette is defined as CSS variables at the top of `assets/css/styles.css`: forest `#12654C`, sage `#6A907D`, bark `#6D3D14`, and oxblood `#551B14`.

The site uses plain HTML, CSS, and JavaScript, so Netlify does not need a build step.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Deploy on Netlify

1. Push the contents of this folder to a GitHub repository.
2. In Netlify, import that repository.
3. Set **Build command** to blank and **Publish directory** to `.`.
4. Deploy.

`netlify.toml` and `_redirects` are included. Old paths such as `/outputs/`, `/connect/`, `/projects/`, `/people/`, `/papers/`, `/gallery/`, and `/donate/` redirect to the new pages.

## Raw media

Original photos, videos, and other source files live in `../media-source/`, next to this folder rather than inside it, so they are never published. When a file is needed on the site, copy a web-sized version into `assets/img/` or `assets/video/` and reference that copy. Only this folder is deployed.

## Media localization

The redesign uses your uploaded logo locally. It also includes the three newly supplied team photos in `assets/img/`, including a cropped working-session image for the landing page and gallery. To preserve the visual richness of the current public site, the HTML also references the existing public Wix-hosted photos and figures. Each image has a local SVG fallback, so pages still render if an image cannot be reached.

Before turning off the Wix site, run this command from the site root to download the remote images into `assets/media/` and rewrite the HTML to use local files:

```bash
python3 scripts/localize_wix_media.py --root .
```

After it finishes, commit the new `assets/media/` files and the rewritten HTML.

## Editing

Content is static and can be edited directly in the HTML files. The visual system lives in `assets/css/styles.css`; interactions such as mobile navigation, dropdown menus, scroll reveal, fallback images, and filters live in `assets/js/main.js`.
