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
        ctx.url = `/node_modules/${ctx.url.slice('/components/'.length)}`;
      }
      return next();
    },
  ],
};
