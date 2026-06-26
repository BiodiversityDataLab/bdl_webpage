# Biodiversity Data Lab - Modern Static Site

This folder contains a redesigned static version of the Biodiversity Data Lab webpage. It is organized into fewer top-level tabs:

- **Home** - mission, definition of data-driven biodiversity research, team photos, research pillars, lab-life section, and featured work
- **Research** - projects plus biodiversity measurement methods
- **Team** - current and previous lab members, plus a lab moments photo strip
- **Outputs** - news, publications, and gallery content with filters
- **Connect** - contact form, address, and donation/support information

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

`netlify.toml` and `_redirects` are included. Old paths such as `/projects/`, `/people/`, `/papers/`, and `/donate/` redirect to the redesigned pages.

## Media localization

The redesign uses your uploaded logo locally. It also includes the three newly supplied team photos in `assets/img/`, including a cropped working-session image for the landing page and gallery. To preserve the visual richness of the current public site, the HTML also references the existing public Wix-hosted photos and figures. Each image has a local SVG fallback, so pages still render if an image cannot be reached.

Before turning off the Wix site, run this command from the site root to download the remote images into `assets/media/` and rewrite the HTML to use local files:

```bash
python3 scripts/localize_wix_media.py --root .
```

After it finishes, commit the new `assets/media/` files and the rewritten HTML.

## Editing

Content is static and can be edited directly in the HTML files. The visual system lives in `assets/css/styles.css`; interactions such as mobile navigation, scroll reveal, fallback images, and filters live in `assets/js/main.js`.
