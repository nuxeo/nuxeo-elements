import path from 'path';

/**
 * Serves a package's `index.html` docs page (`iron-component-page`), replacing
 * `polymer serve --npm -c ../node_modules` after `polymer-cli` was removed in ELEMENTS-2018.
 *
 * The docs pages load their dependencies from absolute `/components/<specifier>` URLs, which was
 * `polymer serve`'s mount point for the component directory. Nothing rewrites those URLs, so the
 * middleware below maps them onto the hoisted workspace `node_modules` instead.
 *
 * Used from a package directory (`cd ui && npm run serve`), so the server root is the repo root
 * one level up and the browser opens on that package.
 */
const pkg = path.basename(process.cwd());

export default {
  rootDir: path.resolve(process.cwd(), '..'),
  open: `/${pkg}/`,
  nodeResolve: true,
  middleware: [
    (ctx, next) => {
      if (ctx.url.startsWith('/components/')) {
        const specifier = ctx.url.slice('/components/'.length);
        // Only rewrite plain package specifiers. Skip anything containing a `..` segment (raw or
        // percent-encoded) so a request like `/components/../../etc` can't be mapped into an
        // arbitrary path outside the hoisted node_modules.
        let decoded = specifier;
        try {
          decoded = decodeURIComponent(specifier);
        } catch {
          // Malformed encoding — leave as-is; the traversal check below still applies.
        }
        if (!decoded.split(/[/\\]/).includes('..')) {
          ctx.url = `/node_modules/${specifier}`;
        }
      }
      return next();
    },
  ],
};
