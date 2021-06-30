const fs = require('fs');
const fm = require('front-matter');

const RE_MD = /\.mdx?$/;
// const RE_FILE = /\.[^.]+$/;
const RE_FILE = /\.(md|mdx|png|jpg|jpeg|svg|json|js|jsx)$/;
const INDEX_FILE = 'index.md';
const META_FILE = '__meta__.md';

const listSubpath = (path) =>
  fs
    .readdirSync(`./docs/${path}`)
    .sort((a, b) => (a === INDEX_FILE && -1) || (b === INDEX_FILE && 1) || 0);

const getDocId = (path) => (name) => `${path}/${name.replace(RE_MD, '')}`;

const getOrder = (item) => {
  if (typeof item === 'string') {
    let attributes = {};
    try {
      ({ attributes } = fm(fs.readFileSync(`./docs/${item}.md`, 'utf8')));
    } catch (ex) {}
    return attributes.order || 9999999;
  } else {
    return item._order || 9999999;
  }
};

const isDoc = (opt) => (name) =>
  RE_MD.test(name) &&
  name !== META_FILE &&
  (!opt.hideIndex || name !== INDEX_FILE);

const listDocIds = (path, opt = {}) => {
  const { collapsed = true } = opt;
  return listSubpath(path)
    .map((name) => {
      if (isDoc(opt)(name)) {
        const docId = getDocId(path)(name);
        ({ attributes } = fm(
          fs.readFileSync(`./docs/${path}/${name}`, 'utf8'),
        ));
        if (attributes.type === 'link') {
          const { title, type, href, order } = attributes;
          return {
            type,
            href,
            label: title,
            _order: order,
          };
        }
        return docId;
      } else if (RE_FILE.test(name)) {
        return null;
      } else {
        let attributes = {};
        try {
          ({ attributes } = fm(
            fs.readFileSync(`./docs/${path}/${name}/__meta__.md`, 'utf8'),
          ));
        } catch (ex) {}
        if (!attributes.title) {
          return null;
        }
        const {
          title,
          order,
          collapsed: attrCollapsed = collapsed,
        } = attributes;
        return {
          type: 'category',
          label: title,
          _order: order,
          collapsed: attrCollapsed,
          items: listDocIds(`${path}/${name}`, opt),
        };
      }
    })
    .filter((item) => Boolean(item))
    .sort((a, b) => {
      return getOrder(a) - getOrder(b);
    })
    .map((item) => {
      if (typeof item === 'object') {
        delete item._order;
      }
      return item;
    });
};

module.exports = {
  guide: listDocIds('guide'),
  napi: listDocIds('napi'),
  // issues: listDocIds('issues'),
  // community: listDocIds('community'),
};
