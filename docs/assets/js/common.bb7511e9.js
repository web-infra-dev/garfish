/*! For license information please see common.bb7511e9.js.LICENSE.txt */
(self.webpackChunkgarfish_docs = self.webpackChunkgarfish_docs || []).push([
  [592],
  {
    2137: function (e, t, r) {
      'use strict';
      function n(e, t, r, n, i, o, a) {
        try {
          var u = e[o](a),
            s = u.value;
        } catch (c) {
          return void r(c);
        }
        u.done ? t(s) : Promise.resolve(s).then(n, i);
      }
      function i(e) {
        return function () {
          var t = this,
            r = arguments;
          return new Promise(function (i, o) {
            var a = e.apply(t, r);
            function u(e) {
              n(a, i, o, u, s, 'next', e);
            }
            function s(e) {
              n(a, i, o, u, s, 'throw', e);
            }
            u(void 0);
          });
        };
      }
      r.d(t, {
        Z: function () {
          return i;
        },
      });
    },
    8173: function (e, t, r) {
      'use strict';
      function n(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
        return n;
      }
      function i(e, t) {
        var r =
          ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
          e['@@iterator'];
        if (r) return (r = r.call(e)).next.bind(r);
        if (
          Array.isArray(e) ||
          (r = (function (e, t) {
            if (e) {
              if ('string' == typeof e) return n(e, t);
              var r = Object.prototype.toString.call(e).slice(8, -1);
              return (
                'Object' === r && e.constructor && (r = e.constructor.name),
                'Map' === r || 'Set' === r
                  ? Array.from(e)
                  : 'Arguments' === r ||
                    /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                  ? n(e, t)
                  : void 0
              );
            }
          })(e)) ||
          (t && e && 'number' == typeof e.length)
        ) {
          r && (e = r);
          var i = 0;
          return function () {
            return i >= e.length ? { done: !0 } : { done: !1, value: e[i++] };
          };
        }
        throw new TypeError(
          'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
        );
      }
      r.d(t, {
        Z: function () {
          return i;
        },
      });
    },
    7757: function (e, t, r) {
      e.exports = r(5666);
    },
    2511: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return h;
        },
      });
      var n = r(9756),
        i = r(7294),
        o = r(3727),
        a = r(9962),
        u = r(2735),
        s = r(6136),
        c = (0, i.createContext)({ collectLink: function () {} }),
        l = r(9524),
        f = r(3905),
        d = [
          'isNavLink',
          'to',
          'href',
          'activeClassName',
          'isActive',
          'data-noBrokenLinkCheck',
          'autoAddBaseUrl',
        ];
      var h = function (e) {
        var t,
          r,
          h = e.isNavLink,
          p = e.to,
          m = e.href,
          v = e.activeClassName,
          g = e.isActive,
          y = e['data-noBrokenLinkCheck'],
          b = e.autoAddBaseUrl,
          w = void 0 === b || b,
          E = (0, n.Z)(e, d),
          x = (0, a.Z)().siteConfig.trailingSlash,
          k = (0, l.C)().withBaseUrl,
          _ = (0, i.useContext)(c),
          D = p || m,
          C = (0, u.Z)(D),
          F = null == D ? void 0 : D.replace('pathname://', ''),
          L =
            void 0 !== F
              ? ((r = F),
                w &&
                (function (e) {
                  return e.startsWith('/');
                })(r)
                  ? k(r)
                  : r)
              : void 0;
        L && C && (L = (0, f.applyTrailingSlash)(L, x));
        var A,
          S = (0, i.useRef)(!1),
          P = h ? o.OL : o.rU,
          N = s.Z.canUseIntersectionObserver;
        (0, i.useEffect)(
          function () {
            return (
              !N && C && null != L && window.docusaurus.prefetch(L),
              function () {
                N && A && A.disconnect();
              }
            );
          },
          [L, N, C],
        );
        var I =
            null !== (t = null == L ? void 0 : L.startsWith('#')) &&
            void 0 !== t &&
            t,
          T = !L || !C || I;
        return (
          L && C && !I && !y && _.collectLink(L),
          T
            ? i.createElement(
                'a',
                Object.assign(
                  { href: L },
                  D && !C && { target: '_blank', rel: 'noopener noreferrer' },
                  E,
                ),
              )
            : i.createElement(
                P,
                Object.assign(
                  {},
                  E,
                  {
                    onMouseEnter: function () {
                      S.current ||
                        null == L ||
                        (window.docusaurus.preload(L), (S.current = !0));
                    },
                    innerRef: function (e) {
                      var t, r;
                      N &&
                        e &&
                        C &&
                        ((t = e),
                        (r = function () {
                          null != L && window.docusaurus.prefetch(L);
                        }),
                        (A = new window.IntersectionObserver(function (e) {
                          e.forEach(function (e) {
                            t === e.target &&
                              (e.isIntersecting || e.intersectionRatio > 0) &&
                              (A.unobserve(t), A.disconnect(), r());
                          });
                        })).observe(t));
                    },
                    to: L || '',
                  },
                  h && { isActive: g, activeClassName: v },
                ),
              )
        );
      };
    },
    7130: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return f;
        },
        I: function () {
          return l;
        },
      });
      var n = r(7294),
        i = /{\w+}/g,
        o = '{}';
      function a(e, t) {
        var r = [],
          a = e.replace(i, function (e) {
            var i = e.substr(1, e.length - 2),
              a = null == t ? void 0 : t[i];
            if (void 0 !== a) {
              var u = n.isValidElement(a) ? a : String(a);
              return r.push(u), o;
            }
            return e;
          });
        return 0 === r.length
          ? e
          : r.every(function (e) {
              return 'string' == typeof e;
            })
          ? a.split(o).reduce(function (e, t, n) {
              var i;
              return e
                .concat(t)
                .concat(null !== (i = r[n]) && void 0 !== i ? i : '');
            }, '')
          : a.split(o).reduce(function (e, t, i) {
              return [].concat(e, [
                n.createElement(n.Fragment, { key: i }, t, r[i]),
              ]);
            }, []);
      }
      function u(e) {
        return a(e.children, e.values);
      }
      var s = r(4644);
      function c(e) {
        var t,
          r = e.id,
          n = e.message;
        return null !== (t = s[null != r ? r : n]) && void 0 !== t ? t : n;
      }
      function l(e, t) {
        var r,
          n = e.message;
        return a(
          null !== (r = c({ message: n, id: e.id })) && void 0 !== r ? r : n,
          t,
        );
      }
      function f(e) {
        var t,
          r = e.children,
          i = e.id,
          o = e.values,
          a = null !== (t = c({ message: r, id: i })) && void 0 !== t ? t : r;
        return n.createElement(u, { values: o }, a);
      }
    },
    2735: function (e, t, r) {
      'use strict';
      function n(e) {
        return !0 === /^(\w*:|\/\/)/.test(e);
      }
      function i(e) {
        return void 0 !== e && !n(e);
      }
      r.d(t, {
        b: function () {
          return n;
        },
        Z: function () {
          return i;
        },
      });
    },
    5094: function (e, t, r) {
      'use strict';
      r.r(t),
        r.d(t, {
          BrowserRouter: function () {
            return n.VK;
          },
          HashRouter: function () {
            return n.UT;
          },
          Link: function () {
            return n.rU;
          },
          MemoryRouter: function () {
            return n.VA;
          },
          NavLink: function () {
            return n.OL;
          },
          Prompt: function () {
            return n.NL;
          },
          Redirect: function () {
            return n.l_;
          },
          Route: function () {
            return n.AW;
          },
          Router: function () {
            return n.F0;
          },
          StaticRouter: function () {
            return n.gx;
          },
          Switch: function () {
            return n.rs;
          },
          generatePath: function () {
            return n.Gn;
          },
          matchPath: function () {
            return n.LX;
          },
          useHistory: function () {
            return n.k6;
          },
          useLocation: function () {
            return n.TH;
          },
          useParams: function () {
            return n.UO;
          },
          useRouteMatch: function () {
            return n.$B;
          },
          withRouter: function () {
            return n.EN;
          },
        });
      var n = r(3727);
    },
    9524: function (e, t, r) {
      'use strict';
      r.d(t, {
        C: function () {
          return o;
        },
        Z: function () {
          return a;
        },
      });
      var n = r(9962),
        i = r(2735);
      function o() {
        var e = (0, n.Z)().siteConfig,
          t = (e = void 0 === e ? {} : e).baseUrl,
          r = void 0 === t ? '/' : t,
          o = e.url;
        return {
          withBaseUrl: function (e, t) {
            return (function (e, t, r, n) {
              var o = void 0 === n ? {} : n,
                a = o.forcePrependBaseUrl,
                u = void 0 !== a && a,
                s = o.absolute,
                c = void 0 !== s && s;
              if (!r) return r;
              if (r.startsWith('#')) return r;
              if ((0, i.b)(r)) return r;
              if (u) return t + r;
              var l = r.startsWith(t) ? r : t + r.replace(/^\//, '');
              return c ? e + l : l;
            })(o, r, e, t);
          },
        };
      }
      function a(e, t) {
        return void 0 === t && (t = {}), (0, o().withBaseUrl)(e, t);
      }
    },
    1610: function (e, t, r) {
      'use strict';
      r.r(t),
        r.d(t, {
          default: function () {
            return i;
          },
          useAllPluginInstancesData: function () {
            return o;
          },
          usePluginData: function () {
            return a;
          },
        });
      var n = r(9962);
      function i() {
        var e = (0, n.Z)().globalData;
        if (!e) throw new Error('Docusaurus global data not found.');
        return e;
      }
      function o(e) {
        var t = i()[e];
        if (!t)
          throw new Error(
            'Docusaurus plugin global data not found for "' + e + '" plugin.',
          );
        return t;
      }
      function a(e, t) {
        void 0 === t && (t = 'default');
        var r = o(e)[t];
        if (!r)
          throw new Error(
            'Docusaurus plugin global data not found for "' +
              e +
              '" plugin with id "' +
              t +
              '".',
          );
        return r;
      }
    },
    3167: function (e, t, r) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.getDocVersionSuggestions = t.getActiveDocContext = t.getActiveVersion = t.getLatestVersion = t.getActivePlugin = void 0);
      var n = r(5094);
      t.getActivePlugin = function (e, t, r) {
        void 0 === r && (r = {});
        var i = Object.entries(e).find(function (e) {
            e[0];
            var r = e[1];
            return !!n.matchPath(t, { path: r.path, exact: !1, strict: !1 });
          }),
          o = i ? { pluginId: i[0], pluginData: i[1] } : void 0;
        if (!o && r.failfast)
          throw new Error(
            'Can\'t find active docs plugin for "' +
              t +
              '" pathname, while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: ' +
              Object.values(e)
                .map(function (e) {
                  return e.path;
                })
                .join(', '),
          );
        return o;
      };
      t.getLatestVersion = function (e) {
        return e.versions.find(function (e) {
          return e.isLast;
        });
      };
      t.getActiveVersion = function (e, r) {
        var i = t.getLatestVersion(e);
        return []
          .concat(
            e.versions.filter(function (e) {
              return e !== i;
            }),
            [i],
          )
          .find(function (e) {
            return !!n.matchPath(r, { path: e.path, exact: !1, strict: !1 });
          });
      };
      t.getActiveDocContext = function (e, r) {
        var i,
          o,
          a = t.getActiveVersion(e, r),
          u =
            null == a
              ? void 0
              : a.docs.find(function (e) {
                  return !!n.matchPath(r, {
                    path: e.path,
                    exact: !0,
                    strict: !1,
                  });
                });
        return {
          activeVersion: a,
          activeDoc: u,
          alternateDocVersions: u
            ? ((i = u.id),
              (o = {}),
              e.versions.forEach(function (e) {
                e.docs.forEach(function (t) {
                  t.id === i && (o[e.name] = t);
                });
              }),
              o)
            : {},
        };
      };
      t.getDocVersionSuggestions = function (e, r) {
        var n = t.getLatestVersion(e),
          i = t.getActiveDocContext(e, r),
          o = i.activeVersion !== n;
        return {
          latestDocSuggestion: o
            ? null == i
              ? void 0
              : i.alternateDocVersions[n.name]
            : void 0,
          latestVersionSuggestion: o ? n : void 0,
        };
      };
    },
    3256: function (e, t, r) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.useDocVersionSuggestions = t.useActiveDocContext = t.useActiveVersion = t.useLatestVersion = t.useVersions = t.useActivePluginAndVersion = t.useActivePlugin = t.useDocsData = t.useAllDocsData = void 0);
      var n = r(655),
        i = r(5094),
        o = n.__importStar(r(1610)),
        a = r(3167);
      t.useAllDocsData = function () {
        var e;
        return null !== (e = o.default()['docusaurus-plugin-content-docs']) &&
          void 0 !== e
          ? e
          : {};
      };
      t.useDocsData = function (e) {
        return o.usePluginData('docusaurus-plugin-content-docs', e);
      };
      t.useActivePlugin = function (e) {
        void 0 === e && (e = {});
        var r = t.useAllDocsData(),
          n = i.useLocation().pathname;
        return a.getActivePlugin(r, n, e);
      };
      t.useActivePluginAndVersion = function (e) {
        void 0 === e && (e = {});
        var r = t.useActivePlugin(e),
          n = i.useLocation().pathname;
        if (r)
          return {
            activePlugin: r,
            activeVersion: a.getActiveVersion(r.pluginData, n),
          };
      };
      t.useVersions = function (e) {
        return t.useDocsData(e).versions;
      };
      t.useLatestVersion = function (e) {
        var r = t.useDocsData(e);
        return a.getLatestVersion(r);
      };
      t.useActiveVersion = function (e) {
        var r = t.useDocsData(e),
          n = i.useLocation().pathname;
        return a.getActiveVersion(r, n);
      };
      t.useActiveDocContext = function (e) {
        var r = t.useDocsData(e),
          n = i.useLocation().pathname;
        return a.getActiveDocContext(r, n);
      };
      t.useDocVersionSuggestions = function (e) {
        var r = t.useDocsData(e),
          n = i.useLocation().pathname;
        return a.getDocVersionSuggestions(r, n);
      };
    },
    6681: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return o;
        },
      });
      var n = r(7294),
        i = 'iconExternalLink_3J9K',
        o = function (e) {
          var t = e.width,
            r = void 0 === t ? 13.5 : t,
            o = e.height,
            a = void 0 === o ? 13.5 : o;
          return n.createElement(
            'svg',
            {
              width: r,
              height: a,
              'aria-hidden': 'true',
              viewBox: '0 0 24 24',
              className: i,
            },
            n.createElement('path', {
              fill: 'currentColor',
              d:
                'M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z',
            }),
          );
        };
    },
    6416: function (e, t, r) {
      'use strict';
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = ['width', 'height', 'className'];
      t.Z = function (e) {
        var t = e.width,
          r = void 0 === t ? 30 : t,
          u = e.height,
          s = void 0 === u ? 30 : u,
          c = e.className,
          l = (0, i.Z)(e, a);
        return o.createElement(
          'svg',
          (0, n.Z)(
            {
              className: c,
              width: r,
              height: s,
              viewBox: '0 0 30 30',
              'aria-hidden': 'true',
            },
            l,
          ),
          o.createElement('path', {
            stroke: 'currentColor',
            strokeLinecap: 'round',
            strokeMiterlimit: '10',
            strokeWidth: '2',
            d: 'M4 7h22M4 15h22M4 23h22',
          }),
        );
      };
    },
    462: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return st;
        },
      });
      var n = r(7294),
        i = r(6010),
        o = r(7130),
        a = r(4395),
        u = 'skipToContent_1oUP';
      function s(e) {
        e.setAttribute('tabindex', '-1'),
          e.focus(),
          e.removeAttribute('tabindex');
      }
      var c = function () {
          var e = (0, n.useRef)(null);
          return (
            (0, a.ru)(function () {
              e.current && s(e.current);
            }),
            n.createElement(
              'div',
              { ref: e },
              n.createElement(
                'a',
                {
                  href: '#main',
                  className: (0, i.Z)(u, 'shadow--md'),
                  onClick: function (e) {
                    e.preventDefault();
                    var t =
                      document.querySelector('main:first-of-type') ||
                      document.querySelector('.main-wrapper');
                    t && s(t);
                  },
                },
                n.createElement(
                  o.Z,
                  {
                    id: 'theme.common.skipToMainContent',
                    description:
                      'The skip to content label used for accessibility, allowing to rapidly navigate to main content with keyboard tab/enter navigation',
                  },
                  'Skip to main content',
                ),
              ),
            )
          );
        },
        l = r(50),
        f = 'announcementBar_3WsW',
        d = 'announcementBarClose_38nx',
        h = 'announcementBarContent_3EUC',
        p = 'announcementBarCloseable_3myR';
      var m = function () {
          var e,
            t = (0, l.Z)(),
            r = t.isAnnouncementBarClosed,
            u = t.closeAnnouncementBar,
            s = (0, a.LU)().announcementBar;
          if (!s) return null;
          var c = s.content,
            m = s.backgroundColor,
            v = s.textColor,
            g = s.isCloseable;
          return !c || (g && r)
            ? null
            : n.createElement(
                'div',
                {
                  className: f,
                  style: { backgroundColor: m, color: v },
                  role: 'banner',
                },
                n.createElement('div', {
                  className: (0, i.Z)(h, ((e = {}), (e[p] = g), e)),
                  dangerouslySetInnerHTML: { __html: c },
                }),
                g
                  ? n.createElement(
                      'button',
                      {
                        type: 'button',
                        className: (0, i.Z)(d, 'clean-btn'),
                        onClick: u,
                        'aria-label': (0, o.I)({
                          id: 'theme.AnnouncementBar.closeButtonAriaLabel',
                          message: 'Close',
                          description:
                            'The ARIA label for close button of announcement bar',
                        }),
                      },
                      n.createElement(
                        'span',
                        { 'aria-hidden': 'true' },
                        '\xd7',
                      ),
                    )
                  : null,
              );
        },
        v = r(2122),
        g = r(3537),
        y = r(8173),
        b = r(2137),
        w = r(7757),
        E = r.n(w),
        x = r(9962),
        k = r(6136),
        _ = r(5977),
        D = r(5202),
        C = r(2953),
        F = r(1523),
        L = r(5583),
        A = r(9395),
        S = 'searchBar_2TTC',
        P = 'dropdownMenu_MoYd',
        N = 'suggestion_3FkI',
        I = 'cursor_1lnb',
        T = 'hitTree_5FeM',
        O = 'hitIcon_2Pcq',
        Z = 'hitPath_nTfC',
        Q = 'noResultsIcon_pVui',
        R = 'hitFooter_1iAK',
        j = 'hitWrapper_2Uh4',
        B = 'hitTitle_w1zy',
        V = 'hitAction_240A',
        z = 'noResults_Zl3Q',
        M = 'searchBarContainer_MM2z',
        U = 'searchBarLoadingRing_2jQk',
        W = 'searchIndexLoading_A9cH',
        H = 'input_Im1d',
        q = 'hint_2jn0',
        G = 'suggestions_u0li',
        $ = 'dataset_1eJy',
        J = 'empty_2lJx';
      function K(e) {
        var t = e.document,
          r = e.type,
          n = e.page,
          i = e.metadata,
          o = e.tokens,
          a = e.isInterOfTree,
          u = e.isLastOfTree,
          s = 0 === r,
          c = 1 === r,
          l = [];
        a
          ? l.push(
              '<svg viewBox="0 0 24 54"><g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v42M20 27H8.3"></path></g></svg>',
            )
          : u &&
            l.push(
              '<svg viewBox="0 0 24 54"><g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v21M20 27H8.3"></path></g></svg>',
            );
        var f = l.map(function (e) {
            return '<span class="' + T + '">' + e + '</span>';
          }),
          d =
            '<span class="' +
            O +
            '">' +
            (s
              ? '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path></svg>'
              : c
              ? '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M13 13h4-4V8H7v5h6v4-4H7V8H3h4V3v5h6V3v5h4-4v5zm-6 0v4-4H3h4z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
              : '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M17 5H3h14zm0 5H3h14zm0 5H3h14z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path></svg>') +
            '</span>',
          h = [
            '<span class="' +
              B +
              '">' +
              (0, L.o)(t.t, (0, A.m)(i, 't'), o) +
              '</span>',
          ];
        return (
          s ||
            h.push(
              '<span class="' +
                Z +
                '">' +
                (0, F.C)(
                  n.t ||
                    (t.u.startsWith('/docs/api-reference/')
                      ? 'API Reference'
                      : ''),
                  o,
                ) +
                '</span>',
            ),
          []
            .concat(f, [d, '<span class="' + j + '">'], h, [
              '</span>',
              '<span class="' +
                V +
                '"><svg width="20" height="20" viewBox="0 0 20 20"><g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3v4c0 2-2 4-4 4H2"></path><path d="M8 17l-6-6 6-6"></path></g></svg></span>',
            ])
            .join('')
        );
      }
      function X() {
        return (
          '<span class="' +
          z +
          '"><span class="' +
          Q +
          '"><svg width="40" height="40" viewBox="0 0 20 20" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 4.8c2 3 1.7 7-1 9.7h0l4.3 4.3-4.3-4.3a7.8 7.8 0 01-9.8 1m-2.2-2.2A7.8 7.8 0 0113.2 2.4M2 18L18 2"></path></svg></span><span>' +
          g.Iz.no_results +
          '</span></span>'
        );
      }
      var Y = r(568);
      function ee() {
        return te.apply(this, arguments);
      }
      function te() {
        return (te = (0, b.Z)(
          E().mark(function e() {
            var t, n;
            return E().wrap(function (e) {
              for (;;)
                switch ((e.prev = e.next)) {
                  case 0:
                    return (
                      (e.next = 2),
                      Promise.all([r.e(443), r.e(525)]).then(
                        r.t.bind(r, 8443, 23),
                      )
                    );
                  case 2:
                    return (
                      (t = e.sent),
                      (n = t.default).noConflict
                        ? n.noConflict()
                        : t.noConflict && t.noConflict(),
                      e.abrupt('return', n)
                    );
                  case 6:
                  case 'end':
                    return e.stop();
                }
            }, e);
          }),
        )).apply(this, arguments);
      }
      var re = '_highlight';
      var ne = function (e) {
          var t,
            r = e.handleSearchBarToggle,
            o = (0, x.Z)().siteConfig.baseUrl,
            a = (0, _.k6)(),
            u = (0, _.TH)(),
            s = (0, n.useRef)(null),
            c = (0, n.useRef)('empty'),
            l = (0, n.useRef)(!1),
            f = (0, n.useState)(!1),
            d = f[0],
            h = f[1],
            p = (0, n.useState)(!1),
            m = p[0],
            v = p[1],
            w = (0, n.useCallback)(
              (0, b.Z)(
                E().mark(function e() {
                  var t, r, n, i, u, f, d;
                  return E().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if ('empty' === c.current) {
                            e.next = 2;
                            break;
                          }
                          return e.abrupt('return');
                        case 2:
                          return (
                            (c.current = 'loading'),
                            h(!0),
                            (e.next = 6),
                            Promise.all([(0, D.w)(o), ee()])
                          );
                        case 6:
                          (t = e.sent),
                            (r = t[0]),
                            (n = r.wrappedIndexes),
                            (i = r.zhDictionary),
                            (u = t[1]),
                            (f = u(
                              s.current,
                              {
                                hint: !1,
                                autoselect: !0,
                                cssClasses: {
                                  root: S,
                                  noPrefix: !0,
                                  dropdownMenu: P,
                                  input: H,
                                  hint: q,
                                  suggestions: G,
                                  suggestion: N,
                                  cursor: I,
                                  dataset: $,
                                  empty: J,
                                },
                              },
                              [
                                {
                                  source: (0, C.v)(n, i, g.qo),
                                  templates: {
                                    suggestion: K,
                                    empty: X,
                                    footer: function (e) {
                                      var t = e.query;
                                      if (!e.isEmpty) {
                                        var r = document.createElement('a'),
                                          n =
                                            o +
                                            'search?q=' +
                                            encodeURIComponent(t);
                                        (r.href = n),
                                          (r.textContent =
                                            g.Iz.see_all_results),
                                          r.addEventListener('click', function (
                                            e,
                                          ) {
                                            e.ctrlKey ||
                                              e.metaKey ||
                                              (e.preventDefault(),
                                              f.autocomplete.close(),
                                              a.push(n));
                                          });
                                        var i = document.createElement('div');
                                        return (
                                          (i.className = R), i.appendChild(r), i
                                        );
                                      }
                                    },
                                  },
                                },
                              ],
                            ).on('autocomplete:selected', function (e, t) {
                              var r = t.document,
                                n = r.u,
                                i = r.h,
                                o = t.tokens,
                                u = n;
                              if (g.vc && o.length > 0) {
                                for (
                                  var s,
                                    c = new URLSearchParams(),
                                    l = (0, y.Z)(o);
                                  !(s = l()).done;

                                ) {
                                  var f = s.value;
                                  c.append(re, f);
                                }
                                u += '?' + c.toString();
                              }
                              i && (u += i), a.push(u);
                            })),
                            (c.current = 'done'),
                            h(!1),
                            l.current &&
                              ((d = s.current).value && f.autocomplete.open(),
                              d.focus());
                        case 15:
                        case 'end':
                          return e.stop();
                      }
                  }, e);
                }),
              ),
              [o, a],
            );
          (0, n.useEffect)(
            function () {
              if (g.vc) {
                var e = k.Z.canUseDOM
                  ? new URLSearchParams(u.search).getAll(re)
                  : [];
                if (0 !== e.length) {
                  var t = document.querySelector('article');
                  if (t) {
                    var r = new g.vc(t);
                    r.unmark(), r.mark(e);
                  }
                }
              }
            },
            [u.search],
          );
          var F = (0, n.useCallback)(
              function () {
                (l.current = !0), w(), null == r || r(!0);
              },
              [r, w],
            ),
            L = (0, n.useCallback)(
              function () {
                null == r || r(!1);
              },
              [r],
            ),
            A = (0, n.useCallback)(
              function () {
                w();
              },
              [w],
            ),
            T = (0, n.useCallback)(function (e) {
              e.target.value && v(!0);
            }, []);
          return n.createElement(
            'div',
            {
              className: (0, i.Z)(
                'navbar__search',
                M,
                ((t = {}), (t[W] = d && m), t),
              ),
            },
            n.createElement('input', {
              placeholder: g.Iz.search_placeholder,
              'aria-label': 'Search',
              className: 'navbar__search-input',
              onMouseEnter: A,
              onFocus: F,
              onBlur: L,
              onChange: T,
              ref: s,
            }),
            n.createElement(Y.Z, { className: U }),
          );
        },
        ie = { toggle: 'toggle_71bT' },
        oe = function (e) {
          var t = e.icon,
            r = e.style;
          return n.createElement(
            'span',
            { className: (0, i.Z)(ie.toggle, ie.dark), style: r },
            t,
          );
        },
        ae = function (e) {
          var t = e.icon,
            r = e.style;
          return n.createElement(
            'span',
            { className: (0, i.Z)(ie.toggle, ie.light), style: r },
            t,
          );
        },
        ue = (0, n.memo)(function (e) {
          var t = e.className,
            r = e.icons,
            o = e.checked,
            a = e.disabled,
            u = e.onChange,
            s = (0, n.useState)(o),
            c = s[0],
            l = s[1],
            f = (0, n.useState)(!1),
            d = f[0],
            h = f[1],
            p = (0, n.useRef)(null);
          return n.createElement(
            'div',
            {
              className: (0, i.Z)('react-toggle', t, {
                'react-toggle--checked': c,
                'react-toggle--focus': d,
                'react-toggle--disabled': a,
              }),
            },
            n.createElement(
              'div',
              {
                className: 'react-toggle-track',
                role: 'button',
                tabIndex: -1,
                onClick: function () {
                  var e;
                  return null == (e = p.current) ? void 0 : e.click();
                },
              },
              n.createElement(
                'div',
                { className: 'react-toggle-track-check' },
                r.checked,
              ),
              n.createElement(
                'div',
                { className: 'react-toggle-track-x' },
                r.unchecked,
              ),
              n.createElement('div', { className: 'react-toggle-thumb' }),
            ),
            n.createElement('input', {
              ref: p,
              checked: c,
              type: 'checkbox',
              className: 'react-toggle-screenreader-only',
              'aria-label': 'Switch between dark and light mode',
              onChange: u,
              onClick: function () {
                return l(!c);
              },
              onFocus: function () {
                return h(!0);
              },
              onBlur: function () {
                return h(!1);
              },
            }),
          );
        });
      function se(e) {
        var t = (0, a.LU)().colorMode.switchConfig,
          r = t.darkIcon,
          i = t.darkIconStyle,
          o = t.lightIcon,
          u = t.lightIconStyle,
          s = (0, x.Z)().isClient;
        return n.createElement(
          ue,
          (0, v.Z)(
            {
              disabled: !s,
              icons: {
                checked: n.createElement(oe, { icon: r, style: i }),
                unchecked: n.createElement(ae, { icon: o, style: u }),
              },
            },
            e,
          ),
        );
      }
      var ce = r(8002),
        le = r(5717),
        fe = function (e) {
          var t = (0, _.TH)(),
            r = (0, n.useState)(e),
            i = r[0],
            o = r[1],
            u = (0, n.useRef)(!1),
            s = (0, n.useState)(0),
            c = s[0],
            l = s[1],
            f = (0, n.useCallback)(function (e) {
              null !== e && l(e.getBoundingClientRect().height);
            }, []);
          return (
            (0, le.Z)(
              function (t, r) {
                var n = t.scrollY,
                  i = r.scrollY;
                if (e)
                  if (n < c) o(!0);
                  else {
                    if (u.current) return (u.current = !1), void o(!1);
                    i && 0 === n && o(!0);
                    var a = document.documentElement.scrollHeight - c,
                      s = window.innerHeight;
                    i && n >= i ? o(!1) : n + s < a && o(!0);
                  }
              },
              [c, u],
            ),
            (0, a.ru)(function () {
              e && o(!0);
            }),
            (0, n.useEffect)(
              function () {
                e && t.hash && (u.current = !0);
              },
              [t.hash],
            ),
            { navbarRef: f, isNavbarVisible: i }
          );
        },
        de = r(9729),
        he = r(3301),
        pe = r(9756),
        me = r(6971),
        ve = ['width', 'height'],
        ge = function (e) {
          var t = e.width,
            r = void 0 === t ? 20 : t,
            i = e.height,
            o = void 0 === i ? 20 : i,
            a = (0, pe.Z)(e, ve);
          return n.createElement(
            'svg',
            (0, v.Z)(
              {
                viewBox: '0 0 20 20',
                width: r,
                height: o,
                'aria-hidden': 'true',
              },
              a,
            ),
            n.createElement('path', {
              fill: 'currentColor',
              d:
                'M19.753 10.909c-.624-1.707-2.366-2.726-4.661-2.726-.09 0-.176.002-.262.006l-.016-2.063 3.525-.607c.115-.019.133-.119.109-.231-.023-.111-.167-.883-.188-.976-.027-.131-.102-.127-.207-.109-.104.018-3.25.461-3.25.461l-.013-2.078c-.001-.125-.069-.158-.194-.156l-1.025.016c-.105.002-.164.049-.162.148l.033 2.307s-3.061.527-3.144.543c-.084.014-.17.053-.151.143.019.09.19 1.094.208 1.172.018.08.072.129.188.107l2.924-.504.035 2.018c-1.077.281-1.801.824-2.256 1.303-.768.807-1.207 1.887-1.207 2.963 0 1.586.971 2.529 2.328 2.695 3.162.387 5.119-3.06 5.769-4.715 1.097 1.506.256 4.354-2.094 5.98-.043.029-.098.129-.033.207l.619.756c.08.096.206.059.256.023 2.51-1.73 3.661-4.515 2.869-6.683zm-7.386 3.188c-.966-.121-.944-.914-.944-1.453 0-.773.327-1.58.876-2.156a3.21 3.21 0 011.229-.799l.082 4.277a2.773 2.773 0 01-1.243.131zm2.427-.553l.046-4.109c.084-.004.166-.01.252-.01.773 0 1.494.145 1.885.361.391.217-1.023 2.713-2.183 3.758zm-8.95-7.668a.196.196 0 00-.196-.145h-1.95a.194.194 0 00-.194.144L.008 16.916c-.017.051-.011.076.062.076h1.733c.075 0 .099-.023.114-.072l1.008-3.318h3.496l1.008 3.318c.016.049.039.072.113.072h1.734c.072 0 .078-.025.062-.076-.014-.05-3.083-9.741-3.494-11.04zm-2.618 6.318l1.447-5.25 1.447 5.25H3.226z',
            }),
          );
        },
        ye = ['mobile', 'dropdownItemsBefore', 'dropdownItemsAfter'];
      function be(e) {
        var t = e.mobile,
          r = e.dropdownItemsBefore,
          i = e.dropdownItemsAfter,
          o = (0, pe.Z)(e, ye),
          u = (0, x.Z)().i18n,
          s = u.currentLocale,
          c = u.locales,
          l = u.localeConfigs,
          f = (0, a.l5)();
        function d(e) {
          return l[e].label;
        }
        var h = c.map(function (e) {
            var t =
              'pathname://' + f.createUrl({ locale: e, fullyQualified: !1 });
            return {
              isNavLink: !0,
              label: d(e),
              to: t,
              target: '_self',
              autoAddBaseUrl: !1,
              className: e === s ? 'dropdown__link--active' : '',
              style: { textTransform: 'capitalize' },
            };
          }),
          p = [].concat(r, h, i),
          m = t ? 'Languages' : d(s);
        return n.createElement(
          me.Z,
          (0, v.Z)({}, o, {
            href: '#',
            mobile: t,
            label: n.createElement(
              'span',
              null,
              n.createElement(ge, {
                style: { verticalAlign: 'text-bottom', marginRight: 5 },
              }),
              n.createElement('span', null, m),
            ),
            items: p,
          }),
        );
      }
      function we(e) {
        return e.mobile ? null : n.createElement(ne, null);
      }
      var Ee = ['type'],
        xe = {
          default: function () {
            return me.Z;
          },
          localeDropdown: function () {
            return be;
          },
          search: function () {
            return we;
          },
          docsVersion: function () {
            return r(6028).Z;
          },
          docsVersionDropdown: function () {
            return r(7999).Z;
          },
          doc: function () {
            return r(4520).Z;
          },
        };
      function ke(e) {
        var t = e.type,
          r = (0, pe.Z)(e, Ee),
          i = (function (e) {
            void 0 === e && (e = 'default');
            var t = xe[e];
            if (!t)
              throw new Error(
                'No NavbarItem component found for type "' + e + '".',
              );
            return t();
          })(t);
        return n.createElement(i, r);
      }
      var _e = r(2827),
        De = r(6416),
        Ce = 'displayOnlyInLargeViewport_GrZ2',
        Fe = 'navbarHideable_2qcr',
        Le = 'navbarHidden_3yey',
        Ae = 'right';
      var Se = function () {
          var e,
            t = (0, a.LU)(),
            r = t.navbar,
            o = r.items,
            u = r.hideOnScroll,
            s = r.style,
            c = t.colorMode.disableSwitch,
            l = (0, n.useState)(!1),
            f = l[0],
            d = l[1],
            h = (0, ce.Z)(),
            p = h.isDarkTheme,
            m = h.setLightTheme,
            g = h.setDarkTheme,
            y = fe(u),
            b = y.navbarRef,
            w = y.isNavbarVisible;
          (0, de.Z)(f);
          var E = (0, n.useCallback)(
              function () {
                d(!0);
              },
              [d],
            ),
            x = (0, n.useCallback)(
              function () {
                d(!1);
              },
              [d],
            ),
            k = (0, n.useCallback)(
              function (e) {
                return e.target.checked ? g() : m();
              },
              [m, g],
            ),
            _ = (0, he.Z)();
          (0, n.useEffect)(
            function () {
              _ === he.D.desktop && d(!1);
            },
            [_],
          );
          var D = o.some(function (e) {
              return 'search' === e.type;
            }),
            C = (function (e) {
              return {
                leftItems: e.filter(function (e) {
                  var t;
                  return 'left' === (null != (t = e.position) ? t : Ae);
                }),
                rightItems: e.filter(function (e) {
                  var t;
                  return 'right' === (null != (t = e.position) ? t : Ae);
                }),
              };
            })(o),
            F = C.leftItems,
            L = C.rightItems;
          return n.createElement(
            'nav',
            {
              ref: b,
              className: (0, i.Z)(
                'navbar',
                'navbar--fixed-top',
                ((e = {
                  'navbar--dark': 'dark' === s,
                  'navbar--primary': 'primary' === s,
                  'navbar-sidebar--show': f,
                }),
                (e[Fe] = u),
                (e[Le] = u && !w),
                e),
              ),
            },
            n.createElement(
              'div',
              { className: 'navbar__inner' },
              n.createElement(
                'div',
                { className: 'navbar__items' },
                null != o &&
                  0 !== o.length &&
                  n.createElement(
                    'button',
                    {
                      'aria-label': 'Navigation bar toggle',
                      className: 'navbar__toggle clean-btn',
                      type: 'button',
                      tabIndex: 0,
                      onClick: E,
                      onKeyDown: E,
                    },
                    n.createElement(De.Z, null),
                  ),
                n.createElement(_e.Z, {
                  className: 'navbar__brand',
                  imageClassName: 'navbar__logo',
                  titleClassName: 'navbar__title',
                }),
                F.map(function (e, t) {
                  return n.createElement(ke, (0, v.Z)({}, e, { key: t }));
                }),
              ),
              n.createElement(
                'div',
                { className: 'navbar__items navbar__items--right' },
                L.map(function (e, t) {
                  return n.createElement(ke, (0, v.Z)({}, e, { key: t }));
                }),
                !c &&
                  n.createElement(se, {
                    className: Ce,
                    checked: p,
                    onChange: k,
                  }),
                !D && n.createElement(ne, null),
              ),
            ),
            n.createElement('div', {
              role: 'presentation',
              className: 'navbar-sidebar__backdrop',
              onClick: x,
            }),
            n.createElement(
              'div',
              { className: 'navbar-sidebar' },
              n.createElement(
                'div',
                { className: 'navbar-sidebar__brand' },
                n.createElement(_e.Z, {
                  className: 'navbar__brand',
                  imageClassName: 'navbar__logo',
                  titleClassName: 'navbar__title',
                  onClick: x,
                }),
                !c && f && n.createElement(se, { checked: p, onChange: k }),
              ),
              n.createElement(
                'div',
                { className: 'navbar-sidebar__items' },
                n.createElement(
                  'div',
                  { className: 'menu' },
                  n.createElement(
                    'ul',
                    { className: 'menu__list' },
                    o.map(function (e, t) {
                      return n.createElement(
                        ke,
                        (0, v.Z)({ mobile: !0 }, e, { onClick: x, key: t }),
                      );
                    }),
                  ),
                ),
              ),
            ),
          );
        },
        Pe = r(2511),
        Ne = r(9524),
        Ie = 'footerLogoLink_MyFc',
        Te = r(4087),
        Oe = ['to', 'href', 'label', 'prependBaseUrlToHref'];
      function Ze(e) {
        var t = e.to,
          r = e.href,
          i = e.label,
          o = e.prependBaseUrlToHref,
          a = (0, pe.Z)(e, Oe),
          u = (0, Ne.Z)(t),
          s = (0, Ne.Z)(r, { forcePrependBaseUrl: !0 });
        return n.createElement(
          Pe.Z,
          (0, v.Z)(
            { className: 'footer__link-item' },
            r ? { href: o ? s : r } : { to: u },
            a,
          ),
          i,
        );
      }
      var Qe = function (e) {
        var t = e.sources,
          r = e.alt;
        return n.createElement(Te.Z, {
          className: 'footer__logo',
          alt: r,
          sources: t,
        });
      };
      var Re = function () {
          var e = (0, a.LU)().footer,
            t = e || {},
            r = t.copyright,
            o = t.links,
            u = void 0 === o ? [] : o,
            s = t.logo,
            c = void 0 === s ? {} : s,
            l = {
              light: (0, Ne.Z)(c.src),
              dark: (0, Ne.Z)(c.srcDark || c.src),
            };
          return e
            ? n.createElement(
                'footer',
                {
                  className: (0, i.Z)('footer', {
                    'footer--dark': 'dark' === e.style,
                  }),
                },
                n.createElement(
                  'div',
                  { className: 'container' },
                  u &&
                    u.length > 0 &&
                    n.createElement(
                      'div',
                      { className: 'row footer__links' },
                      u.map(function (e, t) {
                        return n.createElement(
                          'div',
                          { key: t, className: 'col footer__col' },
                          null != e.title
                            ? n.createElement(
                                'div',
                                { className: 'footer__title' },
                                e.title,
                              )
                            : null,
                          null != e.items &&
                            Array.isArray(e.items) &&
                            e.items.length > 0
                            ? n.createElement(
                                'ul',
                                { className: 'footer__items' },
                                e.items.map(function (e, t) {
                                  return e.html
                                    ? n.createElement('li', {
                                        key: t,
                                        className: 'footer__item',
                                        dangerouslySetInnerHTML: {
                                          __html: e.html,
                                        },
                                      })
                                    : n.createElement(
                                        'li',
                                        {
                                          key: e.href || e.to,
                                          className: 'footer__item',
                                        },
                                        n.createElement(Ze, e),
                                      );
                                }),
                              )
                            : null,
                        );
                      }),
                    ),
                  (c || r) &&
                    n.createElement(
                      'div',
                      { className: 'footer__bottom text--center' },
                      c &&
                        (c.src || c.srcDark) &&
                        n.createElement(
                          'div',
                          { className: 'margin-bottom--sm' },
                          c.href
                            ? n.createElement(
                                Pe.Z,
                                { href: c.href, className: Ie },
                                n.createElement(Qe, { alt: c.alt, sources: l }),
                              )
                            : n.createElement(Qe, { alt: c.alt, sources: l }),
                        ),
                      r
                        ? n.createElement('div', {
                            className: 'footer__copyright',
                            dangerouslySetInnerHTML: { __html: r },
                          })
                        : null,
                    ),
                ),
              )
            : null;
        },
        je = (0, a.WA)('theme'),
        Be = 'light',
        Ve = 'dark',
        ze = function (e) {
          return e === Ve ? Ve : Be;
        },
        Me = function (e) {
          (0, a.WA)('theme').set(ze(e));
        },
        Ue = function () {
          var e = (0, a.LU)().colorMode,
            t = e.defaultMode,
            r = e.disableSwitch,
            i = e.respectPrefersColorScheme,
            o = (0, n.useState)(
              (function (e) {
                return k.Z.canUseDOM
                  ? ze(document.documentElement.getAttribute('data-theme'))
                  : ze(e);
              })(t),
            ),
            u = o[0],
            s = o[1],
            c = (0, n.useCallback)(function () {
              s(Be), Me(Be);
            }, []),
            l = (0, n.useCallback)(function () {
              s(Ve), Me(Ve);
            }, []);
          return (
            (0, n.useEffect)(
              function () {
                document.documentElement.setAttribute('data-theme', ze(u));
              },
              [u],
            ),
            (0, n.useEffect)(
              function () {
                if (!r)
                  try {
                    var e = je.get();
                    null !== e && s(ze(e));
                  } catch (t) {
                    console.error(t);
                  }
              },
              [s],
            ),
            (0, n.useEffect)(function () {
              (r && !i) ||
                window
                  .matchMedia('(prefers-color-scheme: dark)')
                  .addListener(function (e) {
                    var t = e.matches;
                    s(t ? Ve : Be);
                  });
            }, []),
            { isDarkTheme: u === Ve, setLightTheme: c, setDarkTheme: l }
          );
        },
        We = r(5406);
      var He = function (e) {
          var t = Ue(),
            r = t.isDarkTheme,
            i = t.setLightTheme,
            o = t.setDarkTheme;
          return n.createElement(
            We.Z.Provider,
            { value: { isDarkTheme: r, setLightTheme: i, setDarkTheme: o } },
            e.children,
          );
        },
        qe = 'docusaurus.tab.',
        Ge = function () {
          var e = (0, n.useState)({}),
            t = e[0],
            r = e[1],
            i = (0, n.useCallback)(function (e, t) {
              (0, a.WA)('docusaurus.tab.' + e).set(t);
            }, []);
          return (
            (0, n.useEffect)(function () {
              try {
                for (
                  var e, t = {}, n = (0, y.Z)((0, a._f)());
                  !(e = n()).done;

                ) {
                  var i = e.value;
                  if (i.startsWith(qe))
                    t[i.substring(qe.length)] = (0, a.WA)(i).get();
                }
                r(t);
              } catch (o) {
                console.error(o);
              }
            }, []),
            {
              tabGroupChoices: t,
              setTabGroupChoices: function (e, t) {
                r(function (r) {
                  var n;
                  return Object.assign({}, r, (((n = {})[e] = t), n));
                }),
                  i(e, t);
              },
            }
          );
        },
        $e = (0, a.WA)('docusaurus.announcement.dismiss'),
        Je = (0, a.WA)('docusaurus.announcement.id'),
        Ke = function () {
          var e = (0, a.LU)().announcementBar,
            t = (0, n.useState)(!0),
            r = t[0],
            i = t[1],
            o = (0, n.useCallback)(function () {
              $e.set('true'), i(!0);
            }, []);
          return (
            (0, n.useEffect)(function () {
              if (e) {
                var t = e.id,
                  r = Je.get();
                'annoucement-bar' === r && (r = 'announcement-bar');
                var n = t !== r;
                Je.set(t),
                  n && $e.set('false'),
                  (n || 'false' === $e.get()) && i(!1);
              }
            }, []),
            { isAnnouncementBarClosed: r, closeAnnouncementBar: o }
          );
        },
        Xe = r(2713);
      var Ye = function (e) {
        var t = Ge(),
          r = t.tabGroupChoices,
          i = t.setTabGroupChoices,
          o = Ke(),
          a = o.isAnnouncementBarClosed,
          u = o.closeAnnouncementBar;
        return n.createElement(
          Xe.Z.Provider,
          {
            value: {
              tabGroupChoices: r,
              setTabGroupChoices: i,
              isAnnouncementBarClosed: a,
              closeAnnouncementBar: u,
            },
          },
          e.children,
        );
      };
      function et(e) {
        var t = e.children;
        return n.createElement(
          He,
          null,
          n.createElement(Ye, null, n.createElement(a.L5, null, t)),
        );
      }
      var tt = r(9584);
      function rt(e) {
        var t = e.locale,
          r = e.version,
          i = e.tag;
        return n.createElement(
          tt.Z,
          null,
          t &&
            n.createElement('meta', { name: 'docusaurus_locale', content: t }),
          r &&
            n.createElement('meta', { name: 'docusaurus_version', content: r }),
          i && n.createElement('meta', { name: 'docusaurus_tag', content: i }),
        );
      }
      var nt = r(4175);
      function it() {
        var e = (0, x.Z)().i18n,
          t = e.defaultLocale,
          r = e.locales,
          i = (0, a.l5)();
        return n.createElement(
          tt.Z,
          null,
          r.map(function (e) {
            return n.createElement('link', {
              key: e,
              rel: 'alternate',
              href: i.createUrl({ locale: e, fullyQualified: !0 }),
              hrefLang: e,
            });
          }),
          n.createElement('link', {
            rel: 'alternate',
            href: i.createUrl({ locale: t, fullyQualified: !0 }),
            hrefLang: 'x-default',
          }),
        );
      }
      function ot(e) {
        var t = e.permalink,
          r = (0, x.Z)().siteConfig.url,
          i = (function () {
            var e = (0, x.Z)().siteConfig.url,
              t = (0, _.TH)().pathname;
            return e + (0, Ne.Z)(t);
          })(),
          o = t ? '' + r + t : i;
        return n.createElement(
          tt.Z,
          null,
          n.createElement('meta', { property: 'og:url', content: o }),
          n.createElement('link', { rel: 'canonical', href: o }),
        );
      }
      function at(e) {
        var t = (0, x.Z)(),
          r = t.siteConfig,
          i = r.favicon,
          o = r.themeConfig,
          u = o.metadatas,
          s = o.image,
          c = t.i18n,
          l = c.currentLocale,
          f = c.localeConfigs,
          d = e.title,
          h = e.description,
          p = e.image,
          m = e.keywords,
          g = e.searchMetadatas,
          y = (0, Ne.Z)(i),
          b = (0, a.pe)(d),
          w = l,
          E = f[l].direction;
        return n.createElement(
          n.Fragment,
          null,
          n.createElement(
            tt.Z,
            null,
            n.createElement('html', { lang: w, dir: E }),
            i && n.createElement('link', { rel: 'shortcut icon', href: y }),
            n.createElement('title', null, b),
            n.createElement('meta', { property: 'og:title', content: b }),
            p ||
              (s &&
                n.createElement('meta', {
                  name: 'twitter:card',
                  content: 'summary_large_image',
                })),
          ),
          n.createElement(nt.Z, { description: h, keywords: m, image: p }),
          n.createElement(ot, null),
          n.createElement(it, null),
          n.createElement(rt, (0, v.Z)({ tag: a.HX, locale: l }, g)),
          n.createElement(
            tt.Z,
            null,
            u.map(function (e, t) {
              return n.createElement(
                'meta',
                (0, v.Z)({ key: 'metadata_' + t }, e),
              );
            }),
          ),
        );
      }
      var ut = function () {
        (0, n.useEffect)(function () {
          var e = 'navigation-with-keyboard';
          function t(t) {
            'keydown' === t.type &&
              'Tab' === t.key &&
              document.body.classList.add(e),
              'mousedown' === t.type && document.body.classList.remove(e);
          }
          return (
            document.addEventListener('keydown', t),
            document.addEventListener('mousedown', t),
            function () {
              document.body.classList.remove(e),
                document.removeEventListener('keydown', t),
                document.removeEventListener('mousedown', t);
            }
          );
        }, []);
      };
      var st = function (e) {
        var t = e.children,
          r = e.noFooter,
          o = e.wrapperClassName,
          u = e.pageClassName;
        return (
          ut(),
          n.createElement(
            et,
            null,
            n.createElement(at, e),
            n.createElement(c, null),
            n.createElement(m, null),
            n.createElement(Se, null),
            n.createElement(
              'div',
              { className: (0, i.Z)(a.kM.wrapper.main, o, u) },
              t,
            ),
            !r && n.createElement(Re, null),
          )
        );
      };
    },
    2827: function (e, t, r) {
      'use strict';
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = r(2511),
        u = r(4087),
        s = r(9524),
        c = r(9962),
        l = ['imageClassName', 'titleClassName'];
      t.Z = function (e) {
        var t = (0, c.Z)(),
          r = t.siteConfig,
          f = r.title,
          d = r.themeConfig.navbar,
          h = d.title,
          p = d.logo,
          m = void 0 === p ? { src: '' } : p,
          v = t.isClient,
          g = e.imageClassName,
          y = e.titleClassName,
          b = (0, i.Z)(e, l),
          w = (0, s.Z)(m.href || '/'),
          E = { light: (0, s.Z)(m.src), dark: (0, s.Z)(m.srcDark || m.src) };
        return o.createElement(
          a.Z,
          (0, n.Z)({ to: w }, b, m.target && { target: m.target }),
          m.src &&
            o.createElement(u.Z, {
              key: v,
              className: g,
              sources: E,
              alt: m.alt || h || f,
            }),
          null != h && o.createElement('b', { className: y }, h),
        );
      };
    },
    6971: function (e, t, r) {
      'use strict';
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = r(6010),
        u = r(2511),
        s = r(9524),
        c = r(5977),
        l = r(4395),
        f = r(6681),
        d = r(2735),
        h = [
          'activeBasePath',
          'activeBaseRegex',
          'to',
          'href',
          'label',
          'activeClassName',
          'prependBaseUrlToHref',
        ],
        p = ['items', 'position', 'className'],
        m = ['className'],
        v = ['items', 'className', 'position'],
        g = ['className'],
        y = ['mobile'],
        b = 'dropdown__link--active';
      function w(e) {
        var t = e.activeBasePath,
          r = e.activeBaseRegex,
          a = e.to,
          c = e.href,
          l = e.label,
          p = e.activeClassName,
          m = void 0 === p ? 'navbar__link--active' : p,
          v = e.prependBaseUrlToHref,
          g = (0, i.Z)(e, h),
          y = (0, s.Z)(a),
          w = (0, s.Z)(t),
          E = (0, s.Z)(c, { forcePrependBaseUrl: !0 }),
          x = l && c && !(0, d.Z)(c),
          k = m === b;
        return o.createElement(
          u.Z,
          (0, n.Z)(
            {},
            c
              ? { href: v ? E : c }
              : Object.assign(
                  { isNavLink: !0, activeClassName: m, to: y },
                  t || r
                    ? {
                        isActive: function (e, t) {
                          return r
                            ? new RegExp(r).test(t.pathname)
                            : t.pathname.startsWith(w);
                        },
                      }
                    : null,
                ),
            g,
          ),
          x
            ? o.createElement(
                'span',
                null,
                l,
                o.createElement(f.Z, k && { width: 12, height: 12 }),
              )
            : l,
        );
      }
      function E(e) {
        var t,
          r = e.items,
          u = e.position,
          s = e.className,
          c = (0, i.Z)(e, p),
          l = (0, o.useRef)(null),
          f = (0, o.useRef)(null),
          d = (0, o.useState)(!1),
          h = d[0],
          v = d[1];
        (0, o.useEffect)(
          function () {
            var e = function (e) {
              l.current && !l.current.contains(e.target) && v(!1);
            };
            return (
              document.addEventListener('mousedown', e),
              document.addEventListener('touchstart', e),
              function () {
                document.removeEventListener('mousedown', e),
                  document.removeEventListener('touchstart', e);
              }
            );
          },
          [l],
        );
        var g = function (e, t) {
          return (
            void 0 === t && (t = !1),
            (0, a.Z)({ 'navbar__item navbar__link': !t, dropdown__link: t }, e)
          );
        };
        return r
          ? o.createElement(
              'div',
              {
                ref: l,
                className: (0, a.Z)(
                  'navbar__item',
                  'dropdown',
                  'dropdown--hoverable',
                  {
                    'dropdown--left': 'left' === u,
                    'dropdown--right': 'right' === u,
                    'dropdown--show': h,
                  },
                ),
              },
              o.createElement(
                w,
                (0, n.Z)({ className: g(s) }, c, {
                  onClick: c.to
                    ? void 0
                    : function (e) {
                        return e.preventDefault();
                      },
                  onKeyDown: function (e) {
                    'Enter' === e.key && (e.preventDefault(), v(!h));
                  },
                }),
                null != (t = c.children) ? t : c.label,
              ),
              o.createElement(
                'ul',
                { ref: f, className: 'dropdown__menu' },
                r.map(function (e, t) {
                  var a = e.className,
                    u = (0, i.Z)(e, m);
                  return o.createElement(
                    'li',
                    { key: t },
                    o.createElement(
                      w,
                      (0, n.Z)(
                        {
                          onKeyDown: function (e) {
                            if (t === r.length - 1 && 'Tab' === e.key) {
                              e.preventDefault(), v(!1);
                              var n = l.current.nextElementSibling;
                              n && n.focus();
                            }
                          },
                          activeClassName: b,
                          className: g(a, !0),
                        },
                        u,
                      ),
                    ),
                  );
                }),
              ),
            )
          : o.createElement(w, (0, n.Z)({ className: g(s) }, c));
      }
      function x(e) {
        var t,
          r,
          u,
          s = e.items,
          f = e.className,
          d = (e.position, (0, i.Z)(e, v)),
          h = (0, o.useRef)(null),
          p = (0, c.TH)().pathname,
          m = (0, o.useState)(function () {
            var e;
            return (
              null ==
                (e = !(
                  null != s &&
                  s.some(function (e) {
                    return (0, l.Mg)(e.to, p);
                  })
                )) || e
            );
          }),
          y = m[0],
          b = m[1],
          E = function (e, t) {
            return (
              void 0 === t && (t = !1),
              (0, a.Z)('menu__link', { 'menu__link--sublist': t }, e)
            );
          };
        if (!s)
          return o.createElement(
            'li',
            { className: 'menu__list-item' },
            o.createElement(w, (0, n.Z)({ className: E(f) }, d)),
          );
        var x =
          null != (t = h.current) && t.scrollHeight
            ? (null == (r = h.current) ? void 0 : r.scrollHeight) + 'px'
            : void 0;
        return o.createElement(
          'li',
          {
            className: (0, a.Z)('menu__list-item', {
              'menu__list-item--collapsed': y,
            }),
          },
          o.createElement(
            w,
            (0, n.Z)({ role: 'button', className: E(f, !0) }, d, {
              onClick: function (e) {
                e.preventDefault(),
                  b(function (e) {
                    return !e;
                  });
              },
            }),
            null != (u = d.children) ? u : d.label,
          ),
          o.createElement(
            'ul',
            {
              className: 'menu__list',
              ref: h,
              style: { height: y ? void 0 : x },
            },
            s.map(function (e, t) {
              var r = e.className,
                a = (0, i.Z)(e, g);
              return o.createElement(
                'li',
                { className: 'menu__list-item', key: t },
                o.createElement(
                  w,
                  (0, n.Z)(
                    { activeClassName: 'menu__link--active', className: E(r) },
                    a,
                    { onClick: d.onClick },
                  ),
                ),
              );
            }),
          ),
        );
      }
      t.Z = function (e) {
        var t = e.mobile,
          r = void 0 !== t && t,
          n = (0, i.Z)(e, y),
          a = r ? x : E;
        return o.createElement(a, n);
      };
    },
    4520: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return d;
        },
      });
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = r(6971),
        u = r(7849),
        s = r(6010),
        c = r(4395),
        l = r(3905),
        f = ['docId', 'activeSidebarClassName', 'label', 'docsPluginId'];
      function d(e) {
        var t,
          r = e.docId,
          d = e.activeSidebarClassName,
          h = e.label,
          p = e.docsPluginId,
          m = (0, i.Z)(e, f),
          v = (0, u.Iw)(p),
          g = v.activeVersion,
          y = v.activeDoc,
          b = (0, c.J)(p).preferredVersion,
          w = (0, u.yW)(p),
          E = (function (e, t) {
            var r,
              n = (r = []).concat.apply(
                r,
                e.map(function (e) {
                  return e.docs;
                }),
              ),
              i = n.find(function (e) {
                return e.id === t;
              });
            if (!i) {
              var o = n
                .map(function (e) {
                  return e.id;
                })
                .join('\n- ');
              throw new Error(
                'DocNavbarItem: couldn\'t find any doc with id "' +
                  t +
                  '" in version' +
                  (e.length ? 's' : '') +
                  ' ' +
                  e
                    .map(function (e) {
                      return e.name;
                    })
                    .join(', ') +
                  '".\nAvailable doc ids are:\n- ' +
                  o,
              );
            }
            return i;
          })((0, l.uniq)([g, b, w].filter(Boolean)), r);
        return o.createElement(
          a.Z,
          (0, n.Z)({ exact: !0 }, m, {
            className: (0, s.Z)(
              m.className,
              ((t = {}), (t[d] = y && y.sidebar === E.sidebar), t),
            ),
            label: null != h ? h : E.id,
            to: E.path,
          }),
        );
      }
    },
    7999: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return f;
        },
      });
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = r(6971),
        u = r(7849),
        s = r(4395),
        c = [
          'mobile',
          'docsPluginId',
          'dropdownActiveClassDisabled',
          'dropdownItemsBefore',
          'dropdownItemsAfter',
        ],
        l = function (e) {
          return e.docs.find(function (t) {
            return t.id === e.mainDocId;
          });
        };
      function f(e) {
        var t,
          r,
          f = e.mobile,
          d = e.docsPluginId,
          h = e.dropdownActiveClassDisabled,
          p = e.dropdownItemsBefore,
          m = e.dropdownItemsAfter,
          v = (0, i.Z)(e, c),
          g = (0, u.Iw)(d),
          y = (0, u.gB)(d),
          b = (0, u.yW)(d),
          w = (0, s.J)(d),
          E = w.preferredVersion,
          x = w.savePreferredVersionName;
        var k = (function () {
            var e = y.map(function (e) {
                var t =
                  (null == g ? void 0 : g.alternateDocVersions[e.name]) || l(e);
                return {
                  isNavLink: !0,
                  label: e.label,
                  to: t.path,
                  isActive: function () {
                    return e === (null == g ? void 0 : g.activeVersion);
                  },
                  onClick: function () {
                    x(e.name);
                  },
                };
              }),
              t = [].concat(p, e, m);
            if (!(t.length <= 1)) return t;
          })(),
          _ = null != (t = null != (r = g.activeVersion) ? r : E) ? t : b,
          D = f && k ? 'Versions' : _.label,
          C = f && k ? void 0 : l(_).path;
        return o.createElement(
          a.Z,
          (0, n.Z)({}, v, {
            mobile: f,
            label: D,
            to: C,
            items: k,
            isActive: h
              ? function () {
                  return !1;
                }
              : void 0,
          }),
        );
      }
    },
    6028: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return l;
        },
      });
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = r(6971),
        u = r(7849),
        s = r(4395),
        c = ['label', 'to', 'docsPluginId'];
      function l(e) {
        var t,
          r = e.label,
          l = e.to,
          f = e.docsPluginId,
          d = (0, i.Z)(e, c),
          h = (0, u.zu)(f),
          p = (0, s.J)(f).preferredVersion,
          m = (0, u.yW)(f),
          v = null != (t = null != h ? h : p) ? t : m,
          g = null != r ? r : v.label,
          y =
            null != l
              ? l
              : (function (e) {
                  return e.docs.find(function (t) {
                    return t.id === e.mainDocId;
                  });
                })(v).path;
        return o.createElement(a.Z, (0, n.Z)({}, d, { label: g, to: y }));
      }
    },
    4175: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return u;
        },
      });
      var n = r(7294),
        i = r(9584),
        o = r(4395),
        a = r(9524);
      function u(e) {
        var t = e.title,
          r = e.description,
          u = e.keywords,
          s = e.image,
          c = (0, o.LU)().image,
          l = (0, o.pe)(t),
          f = (0, a.Z)(s || c, { absolute: !0 });
        return n.createElement(
          i.Z,
          null,
          t && n.createElement('title', null, l),
          t && n.createElement('meta', { property: 'og:title', content: l }),
          r && n.createElement('meta', { name: 'description', content: r }),
          r &&
            n.createElement('meta', { property: 'og:description', content: r }),
          u &&
            n.createElement('meta', {
              name: 'keywords',
              content: Array.isArray(u) ? u.join(',') : u,
            }),
          f && n.createElement('meta', { property: 'og:image', content: f }),
          f && n.createElement('meta', { name: 'twitter:image', content: f }),
        );
      }
    },
    5406: function (e, t, r) {
      'use strict';
      var n = r(7294).createContext(void 0);
      t.Z = n;
    },
    4087: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return f;
        },
      });
      var n = r(2122),
        i = r(9756),
        o = r(7294),
        a = r(6010),
        u = r(9962),
        s = r(8002),
        c = {
          themedImage: 'themedImage_1VuW',
          'themedImage--light': 'themedImage--light_3UqQ',
          'themedImage--dark': 'themedImage--dark_hz6m',
        },
        l = ['sources', 'className', 'alt'],
        f = function (e) {
          var t = (0, u.Z)().isClient,
            r = (0, s.Z)().isDarkTheme,
            f = e.sources,
            d = e.className,
            h = e.alt,
            p = void 0 === h ? '' : h,
            m = (0, i.Z)(e, l),
            v = t ? (r ? ['dark'] : ['light']) : ['light', 'dark'];
          return o.createElement(
            o.Fragment,
            null,
            v.map(function (e) {
              return o.createElement(
                'img',
                (0, n.Z)(
                  {
                    key: e,
                    src: f[e],
                    alt: p,
                    className: (0, a.Z)(
                      c.themedImage,
                      c['themedImage--' + e],
                      d,
                    ),
                  },
                  m,
                ),
              );
            }),
          );
        };
    },
    2713: function (e, t, r) {
      'use strict';
      var n = (0, r(7294).createContext)(void 0);
      t.Z = n;
    },
    7849: function (e, t, r) {
      'use strict';
      r.d(t, {
        Iw: function () {
          return n.useActiveDocContext;
        },
        gA: function () {
          return n.useActivePlugin;
        },
        zu: function () {
          return n.useActiveVersion;
        },
        _r: function () {
          return n.useAllDocsData;
        },
        Jo: function () {
          return n.useDocVersionSuggestions;
        },
        zh: function () {
          return n.useDocsData;
        },
        yW: function () {
          return n.useLatestVersion;
        },
        gB: function () {
          return n.useVersions;
        },
      });
      var n = r(3256);
    },
    9729: function (e, t, r) {
      'use strict';
      var n = r(7294);
      t.Z = function (e) {
        void 0 === e && (e = !0),
          (0, n.useEffect)(
            function () {
              return (
                (document.body.style.overflow = e ? 'hidden' : 'visible'),
                function () {
                  document.body.style.overflow = 'visible';
                }
              );
            },
            [e],
          );
      };
    },
    5717: function (e, t, r) {
      'use strict';
      var n = r(7294),
        i = r(6136),
        o = function () {
          return {
            scrollX: i.Z.canUseDOM ? window.pageXOffset : 0,
            scrollY: i.Z.canUseDOM ? window.pageYOffset : 0,
          };
        };
      t.Z = function (e, t) {
        void 0 === t && (t = []);
        var r = (0, n.useRef)(o()),
          i = function () {
            var t = o();
            e && e(t, r.current), (r.current = t);
          };
        (0, n.useEffect)(function () {
          var e = { passive: !0 };
          return (
            i(),
            window.addEventListener('scroll', i, e),
            function () {
              return window.removeEventListener('scroll', i, e);
            }
          );
        }, t);
      };
    },
    8002: function (e, t, r) {
      'use strict';
      var n = r(7294),
        i = r(5406);
      t.Z = function () {
        var e = (0, n.useContext)(i.Z);
        if (null == e)
          throw new Error(
            '"useThemeContext" is used outside of "Layout" component. Please see https://docusaurus.io/docs/api/themes/configuration#usethemecontext.',
          );
        return e;
      };
    },
    50: function (e, t, r) {
      'use strict';
      var n = r(7294),
        i = r(2713);
      t.Z = function () {
        var e = (0, n.useContext)(i.Z);
        if (null == e)
          throw new Error(
            '"useUserPreferencesContext" is used outside of "Layout" component.',
          );
        return e;
      };
    },
    3301: function (e, t, r) {
      'use strict';
      r.d(t, {
        D: function () {
          return o;
        },
      });
      var n = r(7294),
        i = r(6136),
        o = { desktop: 'desktop', mobile: 'mobile' };
      t.Z = function () {
        var e = i.Z.canUseDOM;
        function t() {
          if (e) return window.innerWidth > 996 ? o.desktop : o.mobile;
        }
        var r = (0, n.useState)(t),
          a = r[0],
          u = r[1];
        return (
          (0, n.useEffect)(function () {
            if (e)
              return (
                window.addEventListener('resize', r),
                function () {
                  return window.removeEventListener('resize', r);
                }
              );
            function r() {
              u(t());
            }
          }, []),
          a
        );
      };
    },
    4395: function (e, t, r) {
      'use strict';
      r.d(t, {
        HX: function () {
          return m;
        },
        L5: function () {
          return S;
        },
        kM: function () {
          return I;
        },
        WA: function () {
          return c;
        },
        os: function () {
          return v;
        },
        Mg: function () {
          return b;
        },
        _f: function () {
          return l;
        },
        bc: function () {
          return p;
        },
        l5: function () {
          return d;
        },
        ru: function () {
          return _;
        },
        J: function () {
          return N;
        },
        LU: function () {
          return i;
        },
        pe: function () {
          return w;
        },
      });
      var n = r(9962);
      function i() {
        return (0, n.Z)().siteConfig.themeConfig;
      }
      var o = 'localStorage';
      function a(e) {
        if ((void 0 === e && (e = o), 'undefined' == typeof window))
          throw new Error(
            'Browser storage is not available on Node.js/Docusaurus SSR process.',
          );
        if ('none' === e) return null;
        try {
          return window[e];
        } catch (r) {
          return (
            (t = r),
            u ||
              (console.warn(
                'Docusaurus browser storage is not available.\nPossible reasons: running Docusaurus in an iframe, in an incognito browser session, or using too strict browser privacy settings.',
                t,
              ),
              (u = !0)),
            null
          );
        }
        var t;
      }
      var u = !1;
      var s = {
        get: function () {
          return null;
        },
        set: function () {},
        del: function () {},
      };
      var c = function (e, t) {
        if ('undefined' == typeof window)
          return (function (e) {
            function t() {
              throw new Error(
                'Illegal storage API usage for storage key "' +
                  e +
                  '".\nDocusaurus storage APIs are not supposed to be called on the server-rendering process.\nPlease only call storage APIs in effects and event handlers.',
              );
            }
            return { get: t, set: t, del: t };
          })(e);
        var r = a(null == t ? void 0 : t.persistence);
        return null === r
          ? s
          : {
              get: function () {
                return r.getItem(e);
              },
              set: function (t) {
                return r.setItem(e, t);
              },
              del: function () {
                return r.removeItem(e);
              },
            };
      };
      function l(e) {
        void 0 === e && (e = o);
        var t = a(e);
        if (!t) return [];
        for (var r = [], n = 0; n < t.length; n += 1) {
          var i = t.key(n);
          null !== i && r.push(i);
        }
        return r;
      }
      var f = r(5977);
      function d() {
        var e = (0, n.Z)(),
          t = e.siteConfig,
          r = t.baseUrl,
          i = t.url,
          o = e.i18n,
          a = o.defaultLocale,
          u = o.currentLocale,
          s = (0, f.TH)().pathname,
          c = u === a ? r : r.replace('/' + u + '/', '/'),
          l = s.replace(r, '');
        return {
          createUrl: function (e) {
            var t = e.locale;
            return (
              '' +
              (e.fullyQualified ? i : '') +
              (function (e) {
                return e === a ? '' + c : '' + c + e + '/';
              })(t) +
              l
            );
          },
        };
      }
      var h = /title=(["'])(.*?)\1/;
      function p(e) {
        var t, r;
        return null !==
          (r =
            null === (t = null == e ? void 0 : e.match(h)) || void 0 === t
              ? void 0
              : t[2]) && void 0 !== r
          ? r
          : '';
      }
      var m = 'default';
      function v(e, t) {
        return 'docs-' + e + '-' + t;
      }
      var g = r(7849),
        y = !!g._r,
        b = function (e, t) {
          var r = function (e) {
            return !e || (null == e ? void 0 : e.endsWith('/')) ? e : e + '/';
          };
          return r(e) === r(t);
        },
        w = function (e) {
          var t = (0, n.Z)().siteConfig,
            r = void 0 === t ? {} : t,
            i = r.title,
            o = r.titleDelimiter,
            a = void 0 === o ? '|' : o;
          return e && e.trim().length ? e.trim() + ' ' + a + ' ' + i : i;
        },
        E = r(7294),
        x = ['zero', 'one', 'two', 'few', 'many', 'other'];
      function k(e) {
        return x.filter(function (t) {
          return e.includes(t);
        });
      }
      k(['one', 'other']);
      function _(e) {
        var t = (0, f.TH)().pathname,
          r = (0, E.useRef)(t);
        (0, E.useEffect)(
          function () {
            t !== r.current && ((r.current = t), e());
          },
          [t, r, e],
        );
      }
      var D = function (e) {
          return 'docs-preferred-version-' + e;
        },
        C = {
          save: function (e, t, r) {
            c(D(e), { persistence: t }).set(r);
          },
          read: function (e, t) {
            return c(D(e), { persistence: t }).get();
          },
          clear: function (e, t) {
            c(D(e), { persistence: t }).del();
          },
        };
      function F(e) {
        var t = e.pluginIds,
          r = e.versionPersistence,
          n = e.allDocsData;
        var i = {};
        return (
          t.forEach(function (e) {
            i[e] = (function (e) {
              var t = C.read(e, r);
              return n[e].versions.some(function (e) {
                return e.name === t;
              })
                ? { preferredVersionName: t }
                : (C.clear(e, r), { preferredVersionName: null });
            })(e);
          }),
          i
        );
      }
      function L() {
        var e = (0, g._r)(),
          t = i().docs.versionPersistence,
          r = (0, E.useMemo)(
            function () {
              return Object.keys(e);
            },
            [e],
          ),
          n = (0, E.useState)(function () {
            return (function (e) {
              var t = {};
              return (
                e.forEach(function (e) {
                  t[e] = { preferredVersionName: null };
                }),
                t
              );
            })(r);
          }),
          o = n[0],
          a = n[1];
        return (
          (0, E.useEffect)(
            function () {
              a(F({ allDocsData: e, versionPersistence: t, pluginIds: r }));
            },
            [e, t, r],
          ),
          [
            o,
            (0, E.useMemo)(
              function () {
                return {
                  savePreferredVersion: function (e, r) {
                    C.save(e, t, r),
                      a(function (t) {
                        var n;
                        return Object.assign(
                          {},
                          t,
                          (((n = {})[e] = { preferredVersionName: r }), n),
                        );
                      });
                  },
                };
              },
              [a],
            ),
          ]
        );
      }
      var A = (0, E.createContext)(null);
      function S(e) {
        var t = e.children;
        return y
          ? E.createElement(P, null, t)
          : E.createElement(E.Fragment, null, t);
      }
      function P(e) {
        var t = e.children,
          r = L();
        return E.createElement(A.Provider, { value: r }, t);
      }
      function N(e) {
        void 0 === e && (e = 'default');
        var t = (0, g.zh)(e),
          r = (function () {
            var e = (0, E.useContext)(A);
            if (!e)
              throw new Error(
                'Can\'t find docs preferred context, maybe you forgot to use the "DocsPreferredVersionContextProvider"?',
              );
            return e;
          })(),
          n = r[0],
          i = r[1],
          o = n[e].preferredVersionName;
        return {
          preferredVersion: o
            ? t.versions.find(function (e) {
                return e.name === o;
              })
            : null,
          savePreferredVersionName: (0, E.useCallback)(
            function (t) {
              i.savePreferredVersion(e, t);
            },
            [i],
          ),
        };
      }
      var I = {
        page: {
          blogListPage: 'blog-list-page',
          blogPostPage: 'blog-post-page',
          blogTagsListPage: 'blog-tags-list-page',
          blogTagsPostPage: 'blog-tags-post-page',
          docPage: 'doc-page',
          mdxPage: 'mdx-page',
        },
        wrapper: {
          main: 'main-wrapper',
          blogPages: 'blog-wrapper',
          docPages: 'docs-wrapper',
          mdxPages: 'mdx-wrapper',
        },
      };
    },
    4136: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.default = function (e, t) {
          if (e.startsWith('#')) return e;
          if (void 0 === t) return e;
          var r,
            n = e.split(/[#?]/)[0],
            i =
              '/' === n
                ? '/'
                : t
                ? (r = n).endsWith('/')
                  ? r
                  : r + '/'
                : (function (e) {
                    return e.endsWith('/') ? e.slice(0, -1) : e;
                  })(n);
          return e.replace(n, i);
        });
    },
    3905: function (e, t, r) {
      'use strict';
      var n =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.uniq = t.applyTrailingSlash = void 0);
      var i = r(4136);
      Object.defineProperty(t, 'applyTrailingSlash', {
        enumerable: !0,
        get: function () {
          return n(i).default;
        },
      });
      var o = r(3509);
      Object.defineProperty(t, 'uniq', {
        enumerable: !0,
        get: function () {
          return n(o).default;
        },
      });
    },
    3509: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.default = function (e) {
          return Array.from(new Set(e));
        });
    },
    568: function (e, t, r) {
      'use strict';
      r.d(t, {
        Z: function () {
          return a;
        },
      });
      var n = r(7294),
        i = r(6010),
        o = 'loadingRing_s5VG';
      function a(e) {
        var t = e.className;
        return n.createElement(
          'div',
          { className: (0, i.Z)(o, t) },
          n.createElement('div', null),
          n.createElement('div', null),
          n.createElement('div', null),
          n.createElement('div', null),
        );
      }
    },
    5202: function (e, t, r) {
      'use strict';
      r.d(t, {
        w: function () {
          return l;
        },
      });
      var n = r(8173),
        i = r(2137),
        o = r(7757),
        a = r.n(o),
        u = r(1336),
        s = r.n(u),
        c = r(3537);
      function l(e) {
        return f.apply(this, arguments);
      }
      function f() {
        return (f = (0, i.Z)(
          a().mark(function e(t) {
            var r, i, o;
            return a().wrap(function (e) {
              for (;;)
                switch ((e.prev = e.next)) {
                  case 0:
                    return (
                      (e.next = 3), fetch(t + 'search-index.json?_=' + c.rx)
                    );
                  case 3:
                    return (e.next = 5), e.sent.json();
                  case 5:
                    return (
                      (r = e.sent),
                      (i = r.map(function (e, t) {
                        var r = e.documents,
                          n = e.index;
                        return {
                          type: t,
                          documents: r,
                          index: s().Index.load(n),
                        };
                      })),
                      (o = r.reduce(function (e, t) {
                        for (
                          var r, i = (0, n.Z)(t.index.invertedIndex);
                          !(r = i()).done;

                        ) {
                          var o = r.value;
                          /(?:[\u3400-\u4DBF\u4E00-\u9FFC\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD884[\uDC00-\uDF4A])/.test(
                            o[0][0],
                          ) && e.add(o[0]);
                        }
                        return e;
                      }, new Set())),
                      e.abrupt('return', {
                        wrappedIndexes: i,
                        zhDictionary: Array.from(o),
                      })
                    );
                  case 9:
                    return e.abrupt('return', {
                      wrappedIndexes: [],
                      zhDictionary: [],
                    });
                  case 10:
                  case 'end':
                    return e.stop();
                }
            }, e);
          }),
        )).apply(this, arguments);
      }
    },
    2953: function (e, t, r) {
      'use strict';
      r.d(t, {
        v: function () {
          return l;
        },
      });
      var n = r(8173),
        i = r(1336),
        o = r.n(i);
      function a(e, t) {
        var r = [];
        return (
          (function e(i, o) {
            if (0 !== i.length) {
              var a = i[0];
              if (
                /(?:[\u3400-\u4DBF\u4E00-\u9FFC\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD884[\uDC00-\uDF4A])/.test(
                  a,
                )
              )
                for (
                  var u,
                    s = (function (e, t) {
                      var r = [];
                      return (
                        (function e(i, o) {
                          for (
                            var a, u = 0, s = !1, c = (0, n.Z)(t);
                            !(a = c()).done;

                          ) {
                            var l = a.value;
                            if (i.substr(0, l.length) === l) {
                              var f = {
                                missed: o.missed,
                                term: o.term.concat({ value: l }),
                              };
                              i.length > l.length
                                ? e(i.substr(l.length), f)
                                : r.push(f),
                                (s = !0);
                            } else
                              for (var d = l.length - 1; d > u; d -= 1) {
                                var h = l.substr(0, d);
                                if (i.substr(0, d) === h) {
                                  u = d;
                                  var p = {
                                    missed: o.missed,
                                    term: o.term.concat({
                                      value: h,
                                      trailing: !0,
                                    }),
                                  };
                                  i.length > d ? e(i.substr(d), p) : r.push(p),
                                    (s = !0);
                                  break;
                                }
                              }
                          }
                          s ||
                            (i.length > 0
                              ? e(i.substr(1), {
                                  missed: o.missed + 1,
                                  term: o.term,
                                })
                              : o.term.length > 0 && r.push(o));
                        })(e, { missed: 0, term: [] }),
                        r
                          .sort(function (e, t) {
                            var r = e.missed > 0 ? 1 : 0,
                              n = t.missed > 0 ? 1 : 0;
                            return r !== n
                              ? r - n
                              : e.term.length - t.term.length;
                          })
                          .map(function (e) {
                            return e.term;
                          })
                      );
                    })(a, t),
                    c = (0, n.Z)(s);
                  !(u = c()).done;

                ) {
                  var l = u.value,
                    f = o.concat.apply(o, l);
                  e(i.slice(1), f);
                }
              else {
                var d = o.concat({ value: a });
                e(i.slice(1), d);
              }
            } else r.push(o);
          })(e, []),
          r
        );
      }
      var u = r(3537);
      function s(e) {
        return c(e).concat(
          c(
            e.filter(function (e) {
              var t = e[e.length - 1];
              return !t.trailing && t.maybeTyping;
            }),
            !0,
          ),
        );
      }
      function c(e, t) {
        return e.map(function (e) {
          return {
            tokens: e.map(function (e) {
              return e.value;
            }),
            term: e.map(function (e) {
              return {
                value: e.value,
                presence: o().Query.presence.REQUIRED,
                wildcard: (t ? e.trailing || e.maybeTyping : e.trailing)
                  ? o().Query.wildcard.TRAILING
                  : o().Query.wildcard.NONE,
              };
            }),
          };
        });
      }
      function l(e, t, r) {
        return function (i, c) {
          var l = (function (e, t) {
            if (1 === t.length && ['ja', 'jp', 'th'].includes(t[0]))
              return o()
                [t[0]].tokenizer(e)
                .map(function (e) {
                  return e.toString();
                });
            var r = /[^-\s]+/g;
            return (
              t.includes('zh') &&
                (r = /[0-9A-Z_a-z]+|(?:[\u3400-\u4DBF\u4E00-\u9FFC\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD884[\uDC00-\uDF4A])+/g),
              e.toLowerCase().match(r) || []
            );
          })(i, u.dK);
          if (0 !== l.length) {
            var f = (function (e, t) {
                var r = a(e, t);
                if (0 === r.length)
                  return [
                    {
                      tokens: e,
                      term: e.map(function (e) {
                        return {
                          value: e,
                          presence: o().Query.presence.REQUIRED,
                          wildcard:
                            o().Query.wildcard.LEADING |
                            o().Query.wildcard.TRAILING,
                        };
                      }),
                    },
                  ];
                for (var i, c = (0, n.Z)(r); !(i = c()).done; ) {
                  var l = i.value;
                  l[l.length - 1].maybeTyping = !0;
                }
                for (var f, d, h = [], p = (0, n.Z)(u.dK); !(f = p()).done; ) {
                  var m = f.value;
                  if ('en' === m) u._k || h.unshift(o().stopWordFilter);
                  else {
                    var v = o()[m];
                    v.stopWordFilter && h.unshift(v.stopWordFilter);
                  }
                }
                if (h.length > 0) {
                  var g = function (e) {
                    return h.reduce(function (e, t) {
                      return e.filter(function (e) {
                        return t(e.value);
                      });
                    }, e);
                  };
                  d = [];
                  for (var y, b = [], w = (0, n.Z)(r); !(y = w()).done; ) {
                    var E = y.value,
                      x = g(E);
                    d.push(x), x.length < E.length && x.length > 0 && b.push(x);
                  }
                  r.push.apply(r, b);
                } else d = r.slice();
                for (var k, _ = [], D = (0, n.Z)(d); !(k = D()).done; ) {
                  var C = k.value;
                  if (C.length > 2)
                    for (var F = C.length - 1; F >= 0; F -= 1)
                      _.push(C.slice(0, F).concat(C.slice(F + 1)));
                }
                return s(r).concat(s(_));
              })(l, t),
              d = [],
              h = function () {
                for (
                  var t,
                    i = p.value,
                    o = i.term,
                    a = i.tokens,
                    u = function () {
                      var i = t.value,
                        u = i.documents,
                        s = i.index,
                        c = i.type;
                      if (
                        (d.push.apply(
                          d,
                          s
                            .query(function (e) {
                              for (var t, r = (0, n.Z)(o); !(t = r()).done; ) {
                                var i = t.value;
                                e.term(i.value, {
                                  wildcard: i.wildcard,
                                  presence: i.presence,
                                });
                              }
                            })
                            .slice(0, r)
                            .filter(function (e) {
                              return !d.some(function (t) {
                                return t.document.i.toString() === e.ref;
                              });
                            })
                            .slice(0, r - d.length)
                            .map(function (t) {
                              var r = u.find(function (e) {
                                return e.i.toString() === t.ref;
                              });
                              return {
                                document: r,
                                type: c,
                                page:
                                  0 !== c &&
                                  e[0].documents.find(function (e) {
                                    return e.i === r.p;
                                  }),
                                metadata: t.matchData.metadata,
                                tokens: a,
                                score: t.score,
                              };
                            }),
                        ),
                        d.length >= r)
                      )
                        return { v: 'break|search' };
                    },
                    s = (0, n.Z)(e);
                  !(t = s()).done;

                ) {
                  var c = u();
                  if ('object' == typeof c) return c.v;
                }
              };
            e: for (var p, m = (0, n.Z)(f); !(p = m()).done; ) {
              if ('break|search' === h()) break e;
            }
            !(function (e) {
              e.forEach(function (e, t) {
                e.index = t;
              }),
                e.sort(function (t, r) {
                  var n =
                      t.type > 0 && t.page
                        ? e.findIndex(function (e) {
                            return e.document === t.page;
                          })
                        : t.index,
                    i =
                      r.type > 0 && r.page
                        ? e.findIndex(function (e) {
                            return e.document === r.page;
                          })
                        : r.index;
                  return (
                    -1 === n && (n = t.index),
                    -1 === i && (i = r.index),
                    n === i
                      ? 0 === t.type
                        ? -1
                        : 0 === r.type
                        ? 1
                        : t.index - r.index
                      : n - i
                  );
                });
            })(d),
              (function (e) {
                e.forEach(function (t, r) {
                  r > 0 &&
                    t.page &&
                    e.some(function (e) {
                      return e.document === t.page;
                    }) &&
                    (r < e.length - 1 && e[r + 1].page === t.page
                      ? (t.isInterOfTree = !0)
                      : (t.isLastOfTree = !0));
                });
              })(d),
              c(d);
          } else c([]);
        };
      }
    },
    2092: function (e, t, r) {
      'use strict';
      function n(e) {
        return e
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
      r.d(t, {
        X: function () {
          return n;
        },
      });
    },
    9395: function (e, t, r) {
      'use strict';
      function n(e, t) {
        for (var r = [], n = 0, i = Object.values(e); n < i.length; n++) {
          var o = i[n];
          o[t] && r.push.apply(r, o[t].position);
        }
        return r.sort(function (e, t) {
          return e[0] - t[0] || t[1] - e[1];
        });
      }
      r.d(t, {
        m: function () {
          return n;
        },
      });
    },
    1523: function (e, t, r) {
      'use strict';
      r.d(t, {
        C: function () {
          return o;
        },
      });
      var n = r(8173),
        i = r(2092);
      function o(e, t, r) {
        for (var a, u = [], s = (0, n.Z)(t); !(a = s()).done; ) {
          var c = a.value,
            l = e.toLowerCase().indexOf(c);
          if (l >= 0) {
            l > 0 && u.push(o(e.substr(0, l), t)),
              u.push('<mark>' + (0, i.X)(e.substr(l, c.length)) + '</mark>');
            var f = l + c.length;
            f < e.length && u.push(o(e.substr(f), t));
            break;
          }
        }
        return 0 === u.length
          ? r
            ? '<mark>' + (0, i.X)(e) + '</mark>'
            : (0, i.X)(e)
          : u.join('');
      }
    },
    5583: function (e, t, r) {
      'use strict';
      r.d(t, {
        o: function () {
          return s;
        },
      });
      var n = r(2092),
        i = r(1523),
        o = /[0-9A-Z_a-z]+|(?:[\u3400-\u4DBF\u4E00-\u9FFC\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD884[\uDC00-\uDF4A])/;
      function a(e) {
        for (var t = [], r = 0, n = e; n.length > 0; ) {
          var i = n.match(o);
          if (!i) {
            t.push(n);
            break;
          }
          i.index > 0 && t.push(n.substr(0, i.index)),
            t.push(i[0]),
            (r += i.index + i[0].length),
            (n = e.substr(r));
        }
        return t;
      }
      var u = r(3537);
      function s(e, t, r, n) {
        void 0 === n && (n = u.Hk);
        for (
          var i = { chunkIndex: -1 },
            o = c(e, t, r, 0, 0, i),
            a = o.slice(0, i.chunkIndex),
            s = o[i.chunkIndex],
            l = [s.html],
            f = o.slice(i.chunkIndex + 1),
            d = s.textLength,
            h = 0,
            p = 0,
            m = !1,
            v = !1;
          d < n;

        )
          if ((h <= p || 0 === f.length) && a.length > 0) {
            var g = a.pop();
            d + g.textLength <= n
              ? (l.unshift(g.html), (h += g.textLength), (d += g.textLength))
              : ((m = !0), (a.length = 0));
          } else {
            if (!(f.length > 0)) break;
            var y = f.shift();
            d + y.textLength <= n
              ? (l.push(y.html), (p += y.textLength), (d += y.textLength))
              : ((v = !0), (f.length = 0));
          }
        return (
          (m || a.length > 0) && l.unshift('\u2026'),
          (v || f.length > 0) && l.push('\u2026'),
          l.join('')
        );
      }
      function c(e, t, r, o, u, s) {
        var l = [],
          f = t[o],
          d = f[0],
          h = f[1];
        if (d < u) (o += 1) < t.length && l.push.apply(l, c(e, t, r, o, u));
        else {
          d > u &&
            l.push.apply(
              l,
              a(e.substring(u, d)).map(function (e) {
                return { html: (0, n.X)(e), textLength: e.length };
              }),
            ),
            s && (s.chunkIndex = l.length),
            l.push({ html: (0, i.C)(e.substr(d, h), r, !0), textLength: h });
          var p = d + h;
          (o += 1) < t.length
            ? l.push.apply(l, c(e, t, r, o, p))
            : p < e.length &&
              l.push.apply(
                l,
                a(e.substr(p)).map(function (e) {
                  return { html: (0, n.X)(e), textLength: e.length };
                }),
              );
        }
        return l;
      }
    },
    3537: function (e, t, r) {
      'use strict';
      r.d(t, {
        vc: function () {
          return u;
        },
        rx: function () {
          return s;
        },
        dK: function () {
          return o;
        },
        _k: function () {
          return a;
        },
        Hk: function () {
          return l;
        },
        qo: function () {
          return c;
        },
        Iz: function () {
          return f;
        },
      });
      var n = r(1336),
        i = r.n(n);
      r(892)(i()), r(7702).w(i()), r(4182)(i());
      var o = ['en', 'zh'],
        a = !1,
        u = null,
        s = null,
        c = 8,
        l = 50,
        f = {
          search_placeholder: 'Search',
          see_all_results: 'See all results',
          no_results: 'No results.',
          search_results_for: 'Search results for "{{ keyword }}"',
          search_the_documentation: 'Search the documentation',
          count_documents_found_plural: '{{ count }} documents found',
          count_documents_found: '{{ count }} document found',
          no_documents_were_found: 'No documents were found',
        };
    },
    7702: function (e, t, r) {
      'use strict';
      function n(e) {
        var t = new RegExp('^[^' + e + ']+', 'u'),
          r = new RegExp('[^' + e + ']+$', 'u');
        return function (e) {
          return e.update(function (e) {
            return e.replace(t, '').replace(r, '');
          });
        };
      }
      function i(e, t) {
        (e.trimmerSupport.generateTrimmer = n),
          (e.zh = function () {
            this.pipeline.reset(),
              this.pipeline.add(e.zh.trimmer, e.zh.stopWordFilter),
              t && (this.tokenizer = t);
          }),
          t && (e.zh.tokenizer = t),
          (e.zh.wordCharacters =
            '\\u3400-\\u4DBF\\u4E00-\\u9FFC\\uFA0E\\uFA0F\\uFA11\\uFA13\\uFA14\\uFA1F\\uFA21\\uFA23\\uFA24\\uFA27-\\uFA29\\u{20000}-\\u{2A6DD}\\u{2A700}-\\u{2B734}\\u{2B740}-\\u{2B81D}\\u{2B820}-\\u{2CEA1}\\u{2CEB0}-\\u{2EBE0}\\u{30000}-\\u{3134A}'),
          (e.zh.trimmer = e.trimmerSupport.generateTrimmer(
            e.zh.wordCharacters,
          )),
          e.Pipeline.registerFunction(e.zh.trimmer, 'trimmer-zh'),
          (e.zh.stopWordFilter = e.generateStopWordFilter(
            '\u7684 \u4e00 \u4e0d \u5728 \u4eba \u6709 \u662f \u4e3a \u4ee5 \u4e8e \u4e0a \u4ed6 \u800c \u540e \u4e4b \u6765 \u53ca \u4e86 \u56e0 \u4e0b \u53ef \u5230 \u7531 \u8fd9 \u4e0e \u4e5f \u6b64 \u4f46 \u5e76 \u4e2a \u5176 \u5df2 \u65e0 \u5c0f \u6211 \u4eec \u8d77 \u6700 \u518d \u4eca \u53bb \u597d \u53ea \u53c8 \u6216 \u5f88 \u4ea6 \u67d0 \u628a \u90a3 \u4f60 \u4e43 \u5b83 \u5427 \u88ab \u6bd4 \u522b \u8d81 \u5f53 \u4ece \u5230 \u5f97 \u6253 \u51e1 \u513f \u5c14 \u8be5 \u5404 \u7ed9 \u8ddf \u548c \u4f55 \u8fd8 \u5373 \u51e0 \u65e2 \u770b \u636e \u8ddd \u9760 \u5566 \u4e86 \u53e6 \u4e48 \u6bcf \u4eec \u561b \u62ff \u54ea \u90a3 \u60a8 \u51ed \u4e14 \u5374 \u8ba9 \u4ecd \u5565 \u5982 \u82e5 \u4f7f \u8c01 \u867d \u968f \u540c \u6240 \u5979 \u54c7 \u55e1 \u5f80 \u54ea \u4e9b \u5411 \u6cbf \u54df \u7528 \u4e8e \u54b1 \u5219 \u600e \u66fe \u81f3 \u81f4 \u7740 \u8bf8 \u81ea'.split(
              ' ',
            ),
          )),
          e.Pipeline.registerFunction(e.zh.stopWordFilter, 'stopWordFilter-zh');
      }
      r.d(t, {
        w: function () {
          return i;
        },
      });
    },
    6010: function (e, t, r) {
      'use strict';
      function n(e) {
        var t,
          r,
          i = '';
        if ('string' == typeof e || 'number' == typeof e) i += e;
        else if ('object' == typeof e)
          if (Array.isArray(e))
            for (t = 0; t < e.length; t++)
              e[t] && (r = n(e[t])) && (i && (i += ' '), (i += r));
          else for (t in e) e[t] && (i && (i += ' '), (i += t));
        return i;
      }
      function i() {
        for (var e, t, r = 0, i = ''; r < arguments.length; )
          (e = arguments[r++]) && (t = n(e)) && (i && (i += ' '), (i += t));
        return i;
      }
      r.d(t, {
        Z: function () {
          return i;
        },
      });
    },
    4182: function (e, t, r) {
      var n, i;
      void 0 ===
        (i =
          'function' ==
          typeof (n = function () {
            return function (e) {
              e.multiLanguage = function () {
                for (
                  var t = Array.prototype.slice.call(arguments),
                    r = t.join('-'),
                    n = '',
                    i = [],
                    o = [],
                    a = 0;
                  a < t.length;
                  ++a
                )
                  'en' == t[a]
                    ? ((n += '\\w'),
                      i.unshift(e.stopWordFilter),
                      i.push(e.stemmer),
                      o.push(e.stemmer))
                    : ((n += e[t[a]].wordCharacters),
                      e[t[a]].stopWordFilter &&
                        i.unshift(e[t[a]].stopWordFilter),
                      e[t[a]].stemmer &&
                        (i.push(e[t[a]].stemmer), o.push(e[t[a]].stemmer)));
                var u = e.trimmerSupport.generateTrimmer(n);
                return (
                  e.Pipeline.registerFunction(u, 'lunr-multi-trimmer-' + r),
                  i.unshift(u),
                  function () {
                    this.pipeline.reset(),
                      this.pipeline.add.apply(this.pipeline, i),
                      this.searchPipeline &&
                        (this.searchPipeline.reset(),
                        this.searchPipeline.add.apply(this.searchPipeline, o));
                  }
                );
              };
            };
          })
            ? n.call(t, r, t, e)
            : n) || (e.exports = i);
    },
    892: function (e, t, r) {
      var n, i;
      void 0 ===
        (i =
          'function' ==
          typeof (n = function () {
            return function (e) {
              (e.stemmerSupport = {
                Among: function (e, t, r, n) {
                  if (
                    ((this.toCharArray = function (e) {
                      for (
                        var t = e.length, r = new Array(t), n = 0;
                        n < t;
                        n++
                      )
                        r[n] = e.charCodeAt(n);
                      return r;
                    }),
                    (!e && '' != e) || (!t && 0 != t) || !r)
                  )
                    throw (
                      'Bad Among initialisation: s:' +
                      e +
                      ', substring_i: ' +
                      t +
                      ', result: ' +
                      r
                    );
                  (this.s_size = e.length),
                    (this.s = this.toCharArray(e)),
                    (this.substring_i = t),
                    (this.result = r),
                    (this.method = n);
                },
                SnowballProgram: function () {
                  var e;
                  return {
                    bra: 0,
                    ket: 0,
                    limit: 0,
                    cursor: 0,
                    limit_backward: 0,
                    setCurrent: function (t) {
                      (e = t),
                        (this.cursor = 0),
                        (this.limit = t.length),
                        (this.limit_backward = 0),
                        (this.bra = this.cursor),
                        (this.ket = this.limit);
                    },
                    getCurrent: function () {
                      var t = e;
                      return (e = null), t;
                    },
                    in_grouping: function (t, r, n) {
                      if (this.cursor < this.limit) {
                        var i = e.charCodeAt(this.cursor);
                        if (
                          i <= n &&
                          i >= r &&
                          t[(i -= r) >> 3] & (1 << (7 & i))
                        )
                          return this.cursor++, !0;
                      }
                      return !1;
                    },
                    in_grouping_b: function (t, r, n) {
                      if (this.cursor > this.limit_backward) {
                        var i = e.charCodeAt(this.cursor - 1);
                        if (
                          i <= n &&
                          i >= r &&
                          t[(i -= r) >> 3] & (1 << (7 & i))
                        )
                          return this.cursor--, !0;
                      }
                      return !1;
                    },
                    out_grouping: function (t, r, n) {
                      if (this.cursor < this.limit) {
                        var i = e.charCodeAt(this.cursor);
                        if (i > n || i < r) return this.cursor++, !0;
                        if (!(t[(i -= r) >> 3] & (1 << (7 & i))))
                          return this.cursor++, !0;
                      }
                      return !1;
                    },
                    out_grouping_b: function (t, r, n) {
                      if (this.cursor > this.limit_backward) {
                        var i = e.charCodeAt(this.cursor - 1);
                        if (i > n || i < r) return this.cursor--, !0;
                        if (!(t[(i -= r) >> 3] & (1 << (7 & i))))
                          return this.cursor--, !0;
                      }
                      return !1;
                    },
                    eq_s: function (t, r) {
                      if (this.limit - this.cursor < t) return !1;
                      for (var n = 0; n < t; n++)
                        if (e.charCodeAt(this.cursor + n) != r.charCodeAt(n))
                          return !1;
                      return (this.cursor += t), !0;
                    },
                    eq_s_b: function (t, r) {
                      if (this.cursor - this.limit_backward < t) return !1;
                      for (var n = 0; n < t; n++)
                        if (
                          e.charCodeAt(this.cursor - t + n) != r.charCodeAt(n)
                        )
                          return !1;
                      return (this.cursor -= t), !0;
                    },
                    find_among: function (t, r) {
                      for (
                        var n = 0,
                          i = r,
                          o = this.cursor,
                          a = this.limit,
                          u = 0,
                          s = 0,
                          c = !1;
                        ;

                      ) {
                        for (
                          var l = n + ((i - n) >> 1),
                            f = 0,
                            d = u < s ? u : s,
                            h = t[l],
                            p = d;
                          p < h.s_size;
                          p++
                        ) {
                          if (o + d == a) {
                            f = -1;
                            break;
                          }
                          if ((f = e.charCodeAt(o + d) - h.s[p])) break;
                          d++;
                        }
                        if (
                          (f < 0 ? ((i = l), (s = d)) : ((n = l), (u = d)),
                          i - n <= 1)
                        ) {
                          if (n > 0 || i == n || c) break;
                          c = !0;
                        }
                      }
                      for (;;) {
                        if (u >= (h = t[n]).s_size) {
                          if (((this.cursor = o + h.s_size), !h.method))
                            return h.result;
                          var m = h.method();
                          if (((this.cursor = o + h.s_size), m))
                            return h.result;
                        }
                        if ((n = h.substring_i) < 0) return 0;
                      }
                    },
                    find_among_b: function (t, r) {
                      for (
                        var n = 0,
                          i = r,
                          o = this.cursor,
                          a = this.limit_backward,
                          u = 0,
                          s = 0,
                          c = !1;
                        ;

                      ) {
                        for (
                          var l = n + ((i - n) >> 1),
                            f = 0,
                            d = u < s ? u : s,
                            h = (p = t[l]).s_size - 1 - d;
                          h >= 0;
                          h--
                        ) {
                          if (o - d == a) {
                            f = -1;
                            break;
                          }
                          if ((f = e.charCodeAt(o - 1 - d) - p.s[h])) break;
                          d++;
                        }
                        if (
                          (f < 0 ? ((i = l), (s = d)) : ((n = l), (u = d)),
                          i - n <= 1)
                        ) {
                          if (n > 0 || i == n || c) break;
                          c = !0;
                        }
                      }
                      for (;;) {
                        var p;
                        if (u >= (p = t[n]).s_size) {
                          if (((this.cursor = o - p.s_size), !p.method))
                            return p.result;
                          var m = p.method();
                          if (((this.cursor = o - p.s_size), m))
                            return p.result;
                        }
                        if ((n = p.substring_i) < 0) return 0;
                      }
                    },
                    replace_s: function (t, r, n) {
                      var i = n.length - (r - t),
                        o = e.substring(0, t),
                        a = e.substring(r);
                      return (
                        (e = o + n + a),
                        (this.limit += i),
                        this.cursor >= r
                          ? (this.cursor += i)
                          : this.cursor > t && (this.cursor = t),
                        i
                      );
                    },
                    slice_check: function () {
                      if (
                        this.bra < 0 ||
                        this.bra > this.ket ||
                        this.ket > this.limit ||
                        this.limit > e.length
                      )
                        throw 'faulty slice operation';
                    },
                    slice_from: function (e) {
                      this.slice_check(), this.replace_s(this.bra, this.ket, e);
                    },
                    slice_del: function () {
                      this.slice_from('');
                    },
                    insert: function (e, t, r) {
                      var n = this.replace_s(e, t, r);
                      e <= this.bra && (this.bra += n),
                        e <= this.ket && (this.ket += n);
                    },
                    slice_to: function () {
                      return (
                        this.slice_check(), e.substring(this.bra, this.ket)
                      );
                    },
                    eq_v_b: function (e) {
                      return this.eq_s_b(e.length, e);
                    },
                  };
                },
              }),
                (e.trimmerSupport = {
                  generateTrimmer: function (e) {
                    var t = new RegExp('^[^' + e + ']+'),
                      r = new RegExp('[^' + e + ']+$');
                    return function (e) {
                      return 'function' == typeof e.update
                        ? e.update(function (e) {
                            return e.replace(t, '').replace(r, '');
                          })
                        : e.replace(t, '').replace(r, '');
                    };
                  },
                });
            };
          })
            ? n.call(t, r, t, e)
            : n) || (e.exports = i);
    },
    1336: function (e, t, r) {
      var n, i;
      !(function () {
        var o,
          a,
          u,
          s,
          c,
          l,
          f,
          d,
          h,
          p,
          m,
          v,
          g,
          y,
          b,
          w,
          E,
          x,
          k,
          _,
          D,
          C,
          F,
          L,
          A,
          S,
          P = function (e) {
            var t = new P.Builder();
            return (
              t.pipeline.add(P.trimmer, P.stopWordFilter, P.stemmer),
              t.searchPipeline.add(P.stemmer),
              e.call(t, t),
              t.build()
            );
          };
        (P.version = '2.3.9'),
          (P.utils = {}),
          (P.utils.warn =
            ((o = this),
            function (e) {
              o.console && console.warn && console.warn(e);
            })),
          (P.utils.asString = function (e) {
            return null == e ? '' : e.toString();
          }),
          (P.utils.clone = function (e) {
            if (null == e) return e;
            for (
              var t = Object.create(null), r = Object.keys(e), n = 0;
              n < r.length;
              n++
            ) {
              var i = r[n],
                o = e[i];
              if (Array.isArray(o)) t[i] = o.slice();
              else {
                if (
                  'string' != typeof o &&
                  'number' != typeof o &&
                  'boolean' != typeof o
                )
                  throw new TypeError(
                    'clone is not deep and does not support nested objects',
                  );
                t[i] = o;
              }
            }
            return t;
          }),
          (P.FieldRef = function (e, t, r) {
            (this.docRef = e), (this.fieldName = t), (this._stringValue = r);
          }),
          (P.FieldRef.joiner = '/'),
          (P.FieldRef.fromString = function (e) {
            var t = e.indexOf(P.FieldRef.joiner);
            if (-1 === t) throw 'malformed field ref string';
            var r = e.slice(0, t),
              n = e.slice(t + 1);
            return new P.FieldRef(n, r, e);
          }),
          (P.FieldRef.prototype.toString = function () {
            return (
              null == this._stringValue &&
                (this._stringValue =
                  this.fieldName + P.FieldRef.joiner + this.docRef),
              this._stringValue
            );
          }),
          (P.Set = function (e) {
            if (((this.elements = Object.create(null)), e)) {
              this.length = e.length;
              for (var t = 0; t < this.length; t++) this.elements[e[t]] = !0;
            } else this.length = 0;
          }),
          (P.Set.complete = {
            intersect: function (e) {
              return e;
            },
            union: function () {
              return this;
            },
            contains: function () {
              return !0;
            },
          }),
          (P.Set.empty = {
            intersect: function () {
              return this;
            },
            union: function (e) {
              return e;
            },
            contains: function () {
              return !1;
            },
          }),
          (P.Set.prototype.contains = function (e) {
            return !!this.elements[e];
          }),
          (P.Set.prototype.intersect = function (e) {
            var t,
              r,
              n,
              i = [];
            if (e === P.Set.complete) return this;
            if (e === P.Set.empty) return e;
            this.length < e.length
              ? ((t = this), (r = e))
              : ((t = e), (r = this)),
              (n = Object.keys(t.elements));
            for (var o = 0; o < n.length; o++) {
              var a = n[o];
              a in r.elements && i.push(a);
            }
            return new P.Set(i);
          }),
          (P.Set.prototype.union = function (e) {
            return e === P.Set.complete
              ? P.Set.complete
              : e === P.Set.empty
              ? this
              : new P.Set(
                  Object.keys(this.elements).concat(Object.keys(e.elements)),
                );
          }),
          (P.idf = function (e, t) {
            var r = 0;
            for (var n in e) '_index' != n && (r += Object.keys(e[n]).length);
            var i = (t - r + 0.5) / (r + 0.5);
            return Math.log(1 + Math.abs(i));
          }),
          (P.Token = function (e, t) {
            (this.str = e || ''), (this.metadata = t || {});
          }),
          (P.Token.prototype.toString = function () {
            return this.str;
          }),
          (P.Token.prototype.update = function (e) {
            return (this.str = e(this.str, this.metadata)), this;
          }),
          (P.Token.prototype.clone = function (e) {
            return (
              (e =
                e ||
                function (e) {
                  return e;
                }),
              new P.Token(e(this.str, this.metadata), this.metadata)
            );
          }),
          (P.tokenizer = function (e, t) {
            if (null == e || null == e) return [];
            if (Array.isArray(e))
              return e.map(function (e) {
                return new P.Token(
                  P.utils.asString(e).toLowerCase(),
                  P.utils.clone(t),
                );
              });
            for (
              var r = e.toString().toLowerCase(),
                n = r.length,
                i = [],
                o = 0,
                a = 0;
              o <= n;
              o++
            ) {
              var u = o - a;
              if (r.charAt(o).match(P.tokenizer.separator) || o == n) {
                if (u > 0) {
                  var s = P.utils.clone(t) || {};
                  (s.position = [a, u]),
                    (s.index = i.length),
                    i.push(new P.Token(r.slice(a, o), s));
                }
                a = o + 1;
              }
            }
            return i;
          }),
          (P.tokenizer.separator = /[\s\-]+/),
          (P.Pipeline = function () {
            this._stack = [];
          }),
          (P.Pipeline.registeredFunctions = Object.create(null)),
          (P.Pipeline.registerFunction = function (e, t) {
            t in this.registeredFunctions &&
              P.utils.warn('Overwriting existing registered function: ' + t),
              (e.label = t),
              (P.Pipeline.registeredFunctions[e.label] = e);
          }),
          (P.Pipeline.warnIfFunctionNotRegistered = function (e) {
            (e.label && e.label in this.registeredFunctions) ||
              P.utils.warn(
                'Function is not registered with pipeline. This may cause problems when serialising the index.\n',
                e,
              );
          }),
          (P.Pipeline.load = function (e) {
            var t = new P.Pipeline();
            return (
              e.forEach(function (e) {
                var r = P.Pipeline.registeredFunctions[e];
                if (!r)
                  throw new Error('Cannot load unregistered function: ' + e);
                t.add(r);
              }),
              t
            );
          }),
          (P.Pipeline.prototype.add = function () {
            var e = Array.prototype.slice.call(arguments);
            e.forEach(function (e) {
              P.Pipeline.warnIfFunctionNotRegistered(e), this._stack.push(e);
            }, this);
          }),
          (P.Pipeline.prototype.after = function (e, t) {
            P.Pipeline.warnIfFunctionNotRegistered(t);
            var r = this._stack.indexOf(e);
            if (-1 == r) throw new Error('Cannot find existingFn');
            (r += 1), this._stack.splice(r, 0, t);
          }),
          (P.Pipeline.prototype.before = function (e, t) {
            P.Pipeline.warnIfFunctionNotRegistered(t);
            var r = this._stack.indexOf(e);
            if (-1 == r) throw new Error('Cannot find existingFn');
            this._stack.splice(r, 0, t);
          }),
          (P.Pipeline.prototype.remove = function (e) {
            var t = this._stack.indexOf(e);
            -1 != t && this._stack.splice(t, 1);
          }),
          (P.Pipeline.prototype.run = function (e) {
            for (var t = this._stack.length, r = 0; r < t; r++) {
              for (var n = this._stack[r], i = [], o = 0; o < e.length; o++) {
                var a = n(e[o], o, e);
                if (null != a && '' !== a)
                  if (Array.isArray(a))
                    for (var u = 0; u < a.length; u++) i.push(a[u]);
                  else i.push(a);
              }
              e = i;
            }
            return e;
          }),
          (P.Pipeline.prototype.runString = function (e, t) {
            var r = new P.Token(e, t);
            return this.run([r]).map(function (e) {
              return e.toString();
            });
          }),
          (P.Pipeline.prototype.reset = function () {
            this._stack = [];
          }),
          (P.Pipeline.prototype.toJSON = function () {
            return this._stack.map(function (e) {
              return P.Pipeline.warnIfFunctionNotRegistered(e), e.label;
            });
          }),
          (P.Vector = function (e) {
            (this._magnitude = 0), (this.elements = e || []);
          }),
          (P.Vector.prototype.positionForIndex = function (e) {
            if (0 == this.elements.length) return 0;
            for (
              var t = 0,
                r = this.elements.length / 2,
                n = r - t,
                i = Math.floor(n / 2),
                o = this.elements[2 * i];
              n > 1 && (o < e && (t = i), o > e && (r = i), o != e);

            )
              (n = r - t),
                (i = t + Math.floor(n / 2)),
                (o = this.elements[2 * i]);
            return o == e || o > e ? 2 * i : o < e ? 2 * (i + 1) : void 0;
          }),
          (P.Vector.prototype.insert = function (e, t) {
            this.upsert(e, t, function () {
              throw 'duplicate index';
            });
          }),
          (P.Vector.prototype.upsert = function (e, t, r) {
            this._magnitude = 0;
            var n = this.positionForIndex(e);
            this.elements[n] == e
              ? (this.elements[n + 1] = r(this.elements[n + 1], t))
              : this.elements.splice(n, 0, e, t);
          }),
          (P.Vector.prototype.magnitude = function () {
            if (this._magnitude) return this._magnitude;
            for (var e = 0, t = this.elements.length, r = 1; r < t; r += 2) {
              var n = this.elements[r];
              e += n * n;
            }
            return (this._magnitude = Math.sqrt(e));
          }),
          (P.Vector.prototype.dot = function (e) {
            for (
              var t = 0,
                r = this.elements,
                n = e.elements,
                i = r.length,
                o = n.length,
                a = 0,
                u = 0,
                s = 0,
                c = 0;
              s < i && c < o;

            )
              (a = r[s]) < (u = n[c])
                ? (s += 2)
                : a > u
                ? (c += 2)
                : a == u && ((t += r[s + 1] * n[c + 1]), (s += 2), (c += 2));
            return t;
          }),
          (P.Vector.prototype.similarity = function (e) {
            return this.dot(e) / this.magnitude() || 0;
          }),
          (P.Vector.prototype.toArray = function () {
            for (
              var e = new Array(this.elements.length / 2), t = 1, r = 0;
              t < this.elements.length;
              t += 2, r++
            )
              e[r] = this.elements[t];
            return e;
          }),
          (P.Vector.prototype.toJSON = function () {
            return this.elements;
          }),
          (P.stemmer =
            ((a = {
              ational: 'ate',
              tional: 'tion',
              enci: 'ence',
              anci: 'ance',
              izer: 'ize',
              bli: 'ble',
              alli: 'al',
              entli: 'ent',
              eli: 'e',
              ousli: 'ous',
              ization: 'ize',
              ation: 'ate',
              ator: 'ate',
              alism: 'al',
              iveness: 'ive',
              fulness: 'ful',
              ousness: 'ous',
              aliti: 'al',
              iviti: 'ive',
              biliti: 'ble',
              logi: 'log',
            }),
            (u = {
              icate: 'ic',
              ative: '',
              alize: 'al',
              iciti: 'ic',
              ical: 'ic',
              ful: '',
              ness: '',
            }),
            (s = '[aeiouy]'),
            (c = '[^aeiou][^aeiouy]*'),
            (l = new RegExp(
              '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*',
            )),
            (f = new RegExp(
              '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*',
            )),
            (d = new RegExp(
              '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$',
            )),
            (h = new RegExp('^([^aeiou][^aeiouy]*)?[aeiouy]')),
            (p = /^(.+?)(ss|i)es$/),
            (m = /^(.+?)([^s])s$/),
            (v = /^(.+?)eed$/),
            (g = /^(.+?)(ed|ing)$/),
            (y = /.$/),
            (b = /(at|bl|iz)$/),
            (w = new RegExp('([^aeiouylsz])\\1$')),
            (E = new RegExp('^' + c + s + '[^aeiouwxy]$')),
            (x = /^(.+?[^aeiou])y$/),
            (k = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/),
            (_ = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/),
            (D = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/),
            (C = /^(.+?)(s|t)(ion)$/),
            (F = /^(.+?)e$/),
            (L = /ll$/),
            (A = new RegExp('^' + c + s + '[^aeiouwxy]$')),
            (S = function (e) {
              var t, r, n, i, o, s, c;
              if (e.length < 3) return e;
              if (
                ('y' == (n = e.substr(0, 1)) &&
                  (e = n.toUpperCase() + e.substr(1)),
                (o = m),
                (i = p).test(e)
                  ? (e = e.replace(i, '$1$2'))
                  : o.test(e) && (e = e.replace(o, '$1$2')),
                (o = g),
                (i = v).test(e))
              ) {
                var S = i.exec(e);
                (i = l).test(S[1]) && ((i = y), (e = e.replace(i, '')));
              } else
                o.test(e) &&
                  ((t = (S = o.exec(e))[1]),
                  (o = h).test(t) &&
                    ((s = w),
                    (c = E),
                    (o = b).test((e = t))
                      ? (e += 'e')
                      : s.test(e)
                      ? ((i = y), (e = e.replace(i, '')))
                      : c.test(e) && (e += 'e')));
              return (
                (i = x).test(e) && (e = (t = (S = i.exec(e))[1]) + 'i'),
                (i = k).test(e) &&
                  ((t = (S = i.exec(e))[1]),
                  (r = S[2]),
                  (i = l).test(t) && (e = t + a[r])),
                (i = _).test(e) &&
                  ((t = (S = i.exec(e))[1]),
                  (r = S[2]),
                  (i = l).test(t) && (e = t + u[r])),
                (o = C),
                (i = D).test(e)
                  ? ((t = (S = i.exec(e))[1]), (i = f).test(t) && (e = t))
                  : o.test(e) &&
                    ((t = (S = o.exec(e))[1] + S[2]),
                    (o = f).test(t) && (e = t)),
                (i = F).test(e) &&
                  ((t = (S = i.exec(e))[1]),
                  (o = d),
                  (s = A),
                  ((i = f).test(t) || (o.test(t) && !s.test(t))) && (e = t)),
                (o = f),
                (i = L).test(e) &&
                  o.test(e) &&
                  ((i = y), (e = e.replace(i, ''))),
                'y' == n && (e = n.toLowerCase() + e.substr(1)),
                e
              );
            }),
            function (e) {
              return e.update(S);
            })),
          P.Pipeline.registerFunction(P.stemmer, 'stemmer'),
          (P.generateStopWordFilter = function (e) {
            var t = e.reduce(function (e, t) {
              return (e[t] = t), e;
            }, {});
            return function (e) {
              if (e && t[e.toString()] !== e.toString()) return e;
            };
          }),
          (P.stopWordFilter = P.generateStopWordFilter([
            'a',
            'able',
            'about',
            'across',
            'after',
            'all',
            'almost',
            'also',
            'am',
            'among',
            'an',
            'and',
            'any',
            'are',
            'as',
            'at',
            'be',
            'because',
            'been',
            'but',
            'by',
            'can',
            'cannot',
            'could',
            'dear',
            'did',
            'do',
            'does',
            'either',
            'else',
            'ever',
            'every',
            'for',
            'from',
            'get',
            'got',
            'had',
            'has',
            'have',
            'he',
            'her',
            'hers',
            'him',
            'his',
            'how',
            'however',
            'i',
            'if',
            'in',
            'into',
            'is',
            'it',
            'its',
            'just',
            'least',
            'let',
            'like',
            'likely',
            'may',
            'me',
            'might',
            'most',
            'must',
            'my',
            'neither',
            'no',
            'nor',
            'not',
            'of',
            'off',
            'often',
            'on',
            'only',
            'or',
            'other',
            'our',
            'own',
            'rather',
            'said',
            'say',
            'says',
            'she',
            'should',
            'since',
            'so',
            'some',
            'than',
            'that',
            'the',
            'their',
            'them',
            'then',
            'there',
            'these',
            'they',
            'this',
            'tis',
            'to',
            'too',
            'twas',
            'us',
            'wants',
            'was',
            'we',
            'were',
            'what',
            'when',
            'where',
            'which',
            'while',
            'who',
            'whom',
            'why',
            'will',
            'with',
            'would',
            'yet',
            'you',
            'your',
          ])),
          P.Pipeline.registerFunction(P.stopWordFilter, 'stopWordFilter'),
          (P.trimmer = function (e) {
            return e.update(function (e) {
              return e.replace(/^\W+/, '').replace(/\W+$/, '');
            });
          }),
          P.Pipeline.registerFunction(P.trimmer, 'trimmer'),
          (P.TokenSet = function () {
            (this.final = !1),
              (this.edges = {}),
              (this.id = P.TokenSet._nextId),
              (P.TokenSet._nextId += 1);
          }),
          (P.TokenSet._nextId = 1),
          (P.TokenSet.fromArray = function (e) {
            for (
              var t = new P.TokenSet.Builder(), r = 0, n = e.length;
              r < n;
              r++
            )
              t.insert(e[r]);
            return t.finish(), t.root;
          }),
          (P.TokenSet.fromClause = function (e) {
            return 'editDistance' in e
              ? P.TokenSet.fromFuzzyString(e.term, e.editDistance)
              : P.TokenSet.fromString(e.term);
          }),
          (P.TokenSet.fromFuzzyString = function (e, t) {
            for (
              var r = new P.TokenSet(),
                n = [{ node: r, editsRemaining: t, str: e }];
              n.length;

            ) {
              var i = n.pop();
              if (i.str.length > 0) {
                var o,
                  a = i.str.charAt(0);
                a in i.node.edges
                  ? (o = i.node.edges[a])
                  : ((o = new P.TokenSet()), (i.node.edges[a] = o)),
                  1 == i.str.length && (o.final = !0),
                  n.push({
                    node: o,
                    editsRemaining: i.editsRemaining,
                    str: i.str.slice(1),
                  });
              }
              if (0 != i.editsRemaining) {
                if ('*' in i.node.edges) var u = i.node.edges['*'];
                else {
                  u = new P.TokenSet();
                  i.node.edges['*'] = u;
                }
                if (
                  (0 == i.str.length && (u.final = !0),
                  n.push({
                    node: u,
                    editsRemaining: i.editsRemaining - 1,
                    str: i.str,
                  }),
                  i.str.length > 1 &&
                    n.push({
                      node: i.node,
                      editsRemaining: i.editsRemaining - 1,
                      str: i.str.slice(1),
                    }),
                  1 == i.str.length && (i.node.final = !0),
                  i.str.length >= 1)
                ) {
                  if ('*' in i.node.edges) var s = i.node.edges['*'];
                  else {
                    s = new P.TokenSet();
                    i.node.edges['*'] = s;
                  }
                  1 == i.str.length && (s.final = !0),
                    n.push({
                      node: s,
                      editsRemaining: i.editsRemaining - 1,
                      str: i.str.slice(1),
                    });
                }
                if (i.str.length > 1) {
                  var c,
                    l = i.str.charAt(0),
                    f = i.str.charAt(1);
                  f in i.node.edges
                    ? (c = i.node.edges[f])
                    : ((c = new P.TokenSet()), (i.node.edges[f] = c)),
                    1 == i.str.length && (c.final = !0),
                    n.push({
                      node: c,
                      editsRemaining: i.editsRemaining - 1,
                      str: l + i.str.slice(2),
                    });
                }
              }
            }
            return r;
          }),
          (P.TokenSet.fromString = function (e) {
            for (
              var t = new P.TokenSet(), r = t, n = 0, i = e.length;
              n < i;
              n++
            ) {
              var o = e[n],
                a = n == i - 1;
              if ('*' == o) (t.edges[o] = t), (t.final = a);
              else {
                var u = new P.TokenSet();
                (u.final = a), (t.edges[o] = u), (t = u);
              }
            }
            return r;
          }),
          (P.TokenSet.prototype.toArray = function () {
            for (var e = [], t = [{ prefix: '', node: this }]; t.length; ) {
              var r = t.pop(),
                n = Object.keys(r.node.edges),
                i = n.length;
              r.node.final && (r.prefix.charAt(0), e.push(r.prefix));
              for (var o = 0; o < i; o++) {
                var a = n[o];
                t.push({ prefix: r.prefix.concat(a), node: r.node.edges[a] });
              }
            }
            return e;
          }),
          (P.TokenSet.prototype.toString = function () {
            if (this._str) return this._str;
            for (
              var e = this.final ? '1' : '0',
                t = Object.keys(this.edges).sort(),
                r = t.length,
                n = 0;
              n < r;
              n++
            ) {
              var i = t[n];
              e = e + i + this.edges[i].id;
            }
            return e;
          }),
          (P.TokenSet.prototype.intersect = function (e) {
            for (
              var t = new P.TokenSet(),
                r = void 0,
                n = [{ qNode: e, output: t, node: this }];
              n.length;

            ) {
              r = n.pop();
              for (
                var i = Object.keys(r.qNode.edges),
                  o = i.length,
                  a = Object.keys(r.node.edges),
                  u = a.length,
                  s = 0;
                s < o;
                s++
              )
                for (var c = i[s], l = 0; l < u; l++) {
                  var f = a[l];
                  if (f == c || '*' == c) {
                    var d = r.node.edges[f],
                      h = r.qNode.edges[c],
                      p = d.final && h.final,
                      m = void 0;
                    f in r.output.edges
                      ? ((m = r.output.edges[f]).final = m.final || p)
                      : (((m = new P.TokenSet()).final = p),
                        (r.output.edges[f] = m)),
                      n.push({ qNode: h, output: m, node: d });
                  }
                }
            }
            return t;
          }),
          (P.TokenSet.Builder = function () {
            (this.previousWord = ''),
              (this.root = new P.TokenSet()),
              (this.uncheckedNodes = []),
              (this.minimizedNodes = {});
          }),
          (P.TokenSet.Builder.prototype.insert = function (e) {
            var t,
              r = 0;
            if (e < this.previousWord)
              throw new Error('Out of order word insertion');
            for (
              var n = 0;
              n < e.length &&
              n < this.previousWord.length &&
              e[n] == this.previousWord[n];
              n++
            )
              r++;
            this.minimize(r),
              (t =
                0 == this.uncheckedNodes.length
                  ? this.root
                  : this.uncheckedNodes[this.uncheckedNodes.length - 1].child);
            for (n = r; n < e.length; n++) {
              var i = new P.TokenSet(),
                o = e[n];
              (t.edges[o] = i),
                this.uncheckedNodes.push({ parent: t, char: o, child: i }),
                (t = i);
            }
            (t.final = !0), (this.previousWord = e);
          }),
          (P.TokenSet.Builder.prototype.finish = function () {
            this.minimize(0);
          }),
          (P.TokenSet.Builder.prototype.minimize = function (e) {
            for (var t = this.uncheckedNodes.length - 1; t >= e; t--) {
              var r = this.uncheckedNodes[t],
                n = r.child.toString();
              n in this.minimizedNodes
                ? (r.parent.edges[r.char] = this.minimizedNodes[n])
                : ((r.child._str = n), (this.minimizedNodes[n] = r.child)),
                this.uncheckedNodes.pop();
            }
          }),
          (P.Index = function (e) {
            (this.invertedIndex = e.invertedIndex),
              (this.fieldVectors = e.fieldVectors),
              (this.tokenSet = e.tokenSet),
              (this.fields = e.fields),
              (this.pipeline = e.pipeline);
          }),
          (P.Index.prototype.search = function (e) {
            return this.query(function (t) {
              new P.QueryParser(e, t).parse();
            });
          }),
          (P.Index.prototype.query = function (e) {
            for (
              var t = new P.Query(this.fields),
                r = Object.create(null),
                n = Object.create(null),
                i = Object.create(null),
                o = Object.create(null),
                a = Object.create(null),
                u = 0;
              u < this.fields.length;
              u++
            )
              n[this.fields[u]] = new P.Vector();
            e.call(t, t);
            for (u = 0; u < t.clauses.length; u++) {
              var s = t.clauses[u],
                c = null,
                l = P.Set.empty;
              c = s.usePipeline
                ? this.pipeline.runString(s.term, { fields: s.fields })
                : [s.term];
              for (var f = 0; f < c.length; f++) {
                var d = c[f];
                s.term = d;
                var h = P.TokenSet.fromClause(s),
                  p = this.tokenSet.intersect(h).toArray();
                if (
                  0 === p.length &&
                  s.presence === P.Query.presence.REQUIRED
                ) {
                  for (var m = 0; m < s.fields.length; m++) {
                    o[(N = s.fields[m])] = P.Set.empty;
                  }
                  break;
                }
                for (var v = 0; v < p.length; v++) {
                  var g = p[v],
                    y = this.invertedIndex[g],
                    b = y._index;
                  for (m = 0; m < s.fields.length; m++) {
                    var w = y[(N = s.fields[m])],
                      E = Object.keys(w),
                      x = g + '/' + N,
                      k = new P.Set(E);
                    if (
                      (s.presence == P.Query.presence.REQUIRED &&
                        ((l = l.union(k)),
                        void 0 === o[N] && (o[N] = P.Set.complete)),
                      s.presence != P.Query.presence.PROHIBITED)
                    ) {
                      if (
                        (n[N].upsert(b, s.boost, function (e, t) {
                          return e + t;
                        }),
                        !i[x])
                      ) {
                        for (var _ = 0; _ < E.length; _++) {
                          var D,
                            C = E[_],
                            F = new P.FieldRef(C, N),
                            L = w[C];
                          void 0 === (D = r[F])
                            ? (r[F] = new P.MatchData(g, N, L))
                            : D.add(g, N, L);
                        }
                        i[x] = !0;
                      }
                    } else
                      void 0 === a[N] && (a[N] = P.Set.empty),
                        (a[N] = a[N].union(k));
                  }
                }
              }
              if (s.presence === P.Query.presence.REQUIRED)
                for (m = 0; m < s.fields.length; m++) {
                  o[(N = s.fields[m])] = o[N].intersect(l);
                }
            }
            var A = P.Set.complete,
              S = P.Set.empty;
            for (u = 0; u < this.fields.length; u++) {
              var N;
              o[(N = this.fields[u])] && (A = A.intersect(o[N])),
                a[N] && (S = S.union(a[N]));
            }
            var I = Object.keys(r),
              T = [],
              O = Object.create(null);
            if (t.isNegated()) {
              I = Object.keys(this.fieldVectors);
              for (u = 0; u < I.length; u++) {
                F = I[u];
                var Z = P.FieldRef.fromString(F);
                r[F] = new P.MatchData();
              }
            }
            for (u = 0; u < I.length; u++) {
              var Q = (Z = P.FieldRef.fromString(I[u])).docRef;
              if (A.contains(Q) && !S.contains(Q)) {
                var R,
                  j = this.fieldVectors[Z],
                  B = n[Z.fieldName].similarity(j);
                if (void 0 !== (R = O[Q]))
                  (R.score += B), R.matchData.combine(r[Z]);
                else {
                  var V = { ref: Q, score: B, matchData: r[Z] };
                  (O[Q] = V), T.push(V);
                }
              }
            }
            return T.sort(function (e, t) {
              return t.score - e.score;
            });
          }),
          (P.Index.prototype.toJSON = function () {
            var e = Object.keys(this.invertedIndex)
                .sort()
                .map(function (e) {
                  return [e, this.invertedIndex[e]];
                }, this),
              t = Object.keys(this.fieldVectors).map(function (e) {
                return [e, this.fieldVectors[e].toJSON()];
              }, this);
            return {
              version: P.version,
              fields: this.fields,
              fieldVectors: t,
              invertedIndex: e,
              pipeline: this.pipeline.toJSON(),
            };
          }),
          (P.Index.load = function (e) {
            var t = {},
              r = {},
              n = e.fieldVectors,
              i = Object.create(null),
              o = e.invertedIndex,
              a = new P.TokenSet.Builder(),
              u = P.Pipeline.load(e.pipeline);
            e.version != P.version &&
              P.utils.warn(
                "Version mismatch when loading serialised index. Current version of lunr '" +
                  P.version +
                  "' does not match serialized index '" +
                  e.version +
                  "'",
              );
            for (var s = 0; s < n.length; s++) {
              var c = (f = n[s])[0],
                l = f[1];
              r[c] = new P.Vector(l);
            }
            for (s = 0; s < o.length; s++) {
              var f,
                d = (f = o[s])[0],
                h = f[1];
              a.insert(d), (i[d] = h);
            }
            return (
              a.finish(),
              (t.fields = e.fields),
              (t.fieldVectors = r),
              (t.invertedIndex = i),
              (t.tokenSet = a.root),
              (t.pipeline = u),
              new P.Index(t)
            );
          }),
          (P.Builder = function () {
            (this._ref = 'id'),
              (this._fields = Object.create(null)),
              (this._documents = Object.create(null)),
              (this.invertedIndex = Object.create(null)),
              (this.fieldTermFrequencies = {}),
              (this.fieldLengths = {}),
              (this.tokenizer = P.tokenizer),
              (this.pipeline = new P.Pipeline()),
              (this.searchPipeline = new P.Pipeline()),
              (this.documentCount = 0),
              (this._b = 0.75),
              (this._k1 = 1.2),
              (this.termIndex = 0),
              (this.metadataWhitelist = []);
          }),
          (P.Builder.prototype.ref = function (e) {
            this._ref = e;
          }),
          (P.Builder.prototype.field = function (e, t) {
            if (/\//.test(e))
              throw new RangeError(
                "Field '" + e + "' contains illegal character '/'",
              );
            this._fields[e] = t || {};
          }),
          (P.Builder.prototype.b = function (e) {
            this._b = e < 0 ? 0 : e > 1 ? 1 : e;
          }),
          (P.Builder.prototype.k1 = function (e) {
            this._k1 = e;
          }),
          (P.Builder.prototype.add = function (e, t) {
            var r = e[this._ref],
              n = Object.keys(this._fields);
            (this._documents[r] = t || {}), (this.documentCount += 1);
            for (var i = 0; i < n.length; i++) {
              var o = n[i],
                a = this._fields[o].extractor,
                u = a ? a(e) : e[o],
                s = this.tokenizer(u, { fields: [o] }),
                c = this.pipeline.run(s),
                l = new P.FieldRef(r, o),
                f = Object.create(null);
              (this.fieldTermFrequencies[l] = f),
                (this.fieldLengths[l] = 0),
                (this.fieldLengths[l] += c.length);
              for (var d = 0; d < c.length; d++) {
                var h = c[d];
                if (
                  (null == f[h] && (f[h] = 0),
                  (f[h] += 1),
                  null == this.invertedIndex[h])
                ) {
                  var p = Object.create(null);
                  (p._index = this.termIndex), (this.termIndex += 1);
                  for (var m = 0; m < n.length; m++)
                    p[n[m]] = Object.create(null);
                  this.invertedIndex[h] = p;
                }
                null == this.invertedIndex[h][o][r] &&
                  (this.invertedIndex[h][o][r] = Object.create(null));
                for (var v = 0; v < this.metadataWhitelist.length; v++) {
                  var g = this.metadataWhitelist[v],
                    y = h.metadata[g];
                  null == this.invertedIndex[h][o][r][g] &&
                    (this.invertedIndex[h][o][r][g] = []),
                    this.invertedIndex[h][o][r][g].push(y);
                }
              }
            }
          }),
          (P.Builder.prototype.calculateAverageFieldLengths = function () {
            for (
              var e = Object.keys(this.fieldLengths),
                t = e.length,
                r = {},
                n = {},
                i = 0;
              i < t;
              i++
            ) {
              var o = P.FieldRef.fromString(e[i]),
                a = o.fieldName;
              n[a] || (n[a] = 0),
                (n[a] += 1),
                r[a] || (r[a] = 0),
                (r[a] += this.fieldLengths[o]);
            }
            var u = Object.keys(this._fields);
            for (i = 0; i < u.length; i++) {
              var s = u[i];
              r[s] = r[s] / n[s];
            }
            this.averageFieldLength = r;
          }),
          (P.Builder.prototype.createFieldVectors = function () {
            for (
              var e = {},
                t = Object.keys(this.fieldTermFrequencies),
                r = t.length,
                n = Object.create(null),
                i = 0;
              i < r;
              i++
            ) {
              for (
                var o = P.FieldRef.fromString(t[i]),
                  a = o.fieldName,
                  u = this.fieldLengths[o],
                  s = new P.Vector(),
                  c = this.fieldTermFrequencies[o],
                  l = Object.keys(c),
                  f = l.length,
                  d = this._fields[a].boost || 1,
                  h = this._documents[o.docRef].boost || 1,
                  p = 0;
                p < f;
                p++
              ) {
                var m,
                  v,
                  g,
                  y = l[p],
                  b = c[y],
                  w = this.invertedIndex[y]._index;
                void 0 === n[y]
                  ? ((m = P.idf(this.invertedIndex[y], this.documentCount)),
                    (n[y] = m))
                  : (m = n[y]),
                  (v =
                    (m * ((this._k1 + 1) * b)) /
                    (this._k1 *
                      (1 -
                        this._b +
                        this._b * (u / this.averageFieldLength[a])) +
                      b)),
                  (v *= d),
                  (v *= h),
                  (g = Math.round(1e3 * v) / 1e3),
                  s.insert(w, g);
              }
              e[o] = s;
            }
            this.fieldVectors = e;
          }),
          (P.Builder.prototype.createTokenSet = function () {
            this.tokenSet = P.TokenSet.fromArray(
              Object.keys(this.invertedIndex).sort(),
            );
          }),
          (P.Builder.prototype.build = function () {
            return (
              this.calculateAverageFieldLengths(),
              this.createFieldVectors(),
              this.createTokenSet(),
              new P.Index({
                invertedIndex: this.invertedIndex,
                fieldVectors: this.fieldVectors,
                tokenSet: this.tokenSet,
                fields: Object.keys(this._fields),
                pipeline: this.searchPipeline,
              })
            );
          }),
          (P.Builder.prototype.use = function (e) {
            var t = Array.prototype.slice.call(arguments, 1);
            t.unshift(this), e.apply(this, t);
          }),
          (P.MatchData = function (e, t, r) {
            for (
              var n = Object.create(null), i = Object.keys(r || {}), o = 0;
              o < i.length;
              o++
            ) {
              var a = i[o];
              n[a] = r[a].slice();
            }
            (this.metadata = Object.create(null)),
              void 0 !== e &&
                ((this.metadata[e] = Object.create(null)),
                (this.metadata[e][t] = n));
          }),
          (P.MatchData.prototype.combine = function (e) {
            for (var t = Object.keys(e.metadata), r = 0; r < t.length; r++) {
              var n = t[r],
                i = Object.keys(e.metadata[n]);
              null == this.metadata[n] &&
                (this.metadata[n] = Object.create(null));
              for (var o = 0; o < i.length; o++) {
                var a = i[o],
                  u = Object.keys(e.metadata[n][a]);
                null == this.metadata[n][a] &&
                  (this.metadata[n][a] = Object.create(null));
                for (var s = 0; s < u.length; s++) {
                  var c = u[s];
                  null == this.metadata[n][a][c]
                    ? (this.metadata[n][a][c] = e.metadata[n][a][c])
                    : (this.metadata[n][a][c] = this.metadata[n][a][c].concat(
                        e.metadata[n][a][c],
                      ));
                }
              }
            }
          }),
          (P.MatchData.prototype.add = function (e, t, r) {
            if (!(e in this.metadata))
              return (
                (this.metadata[e] = Object.create(null)),
                void (this.metadata[e][t] = r)
              );
            if (t in this.metadata[e])
              for (var n = Object.keys(r), i = 0; i < n.length; i++) {
                var o = n[i];
                o in this.metadata[e][t]
                  ? (this.metadata[e][t][o] = this.metadata[e][t][o].concat(
                      r[o],
                    ))
                  : (this.metadata[e][t][o] = r[o]);
              }
            else this.metadata[e][t] = r;
          }),
          (P.Query = function (e) {
            (this.clauses = []), (this.allFields = e);
          }),
          (P.Query.wildcard = new String('*')),
          (P.Query.wildcard.NONE = 0),
          (P.Query.wildcard.LEADING = 1),
          (P.Query.wildcard.TRAILING = 2),
          (P.Query.presence = { OPTIONAL: 1, REQUIRED: 2, PROHIBITED: 3 }),
          (P.Query.prototype.clause = function (e) {
            return (
              'fields' in e || (e.fields = this.allFields),
              'boost' in e || (e.boost = 1),
              'usePipeline' in e || (e.usePipeline = !0),
              'wildcard' in e || (e.wildcard = P.Query.wildcard.NONE),
              e.wildcard & P.Query.wildcard.LEADING &&
                e.term.charAt(0) != P.Query.wildcard &&
                (e.term = '*' + e.term),
              e.wildcard & P.Query.wildcard.TRAILING &&
                e.term.slice(-1) != P.Query.wildcard &&
                (e.term = e.term + '*'),
              'presence' in e || (e.presence = P.Query.presence.OPTIONAL),
              this.clauses.push(e),
              this
            );
          }),
          (P.Query.prototype.isNegated = function () {
            for (var e = 0; e < this.clauses.length; e++)
              if (this.clauses[e].presence != P.Query.presence.PROHIBITED)
                return !1;
            return !0;
          }),
          (P.Query.prototype.term = function (e, t) {
            if (Array.isArray(e))
              return (
                e.forEach(function (e) {
                  this.term(e, P.utils.clone(t));
                }, this),
                this
              );
            var r = t || {};
            return (r.term = e.toString()), this.clause(r), this;
          }),
          (P.QueryParseError = function (e, t, r) {
            (this.name = 'QueryParseError'),
              (this.message = e),
              (this.start = t),
              (this.end = r);
          }),
          (P.QueryParseError.prototype = new Error()),
          (P.QueryLexer = function (e) {
            (this.lexemes = []),
              (this.str = e),
              (this.length = e.length),
              (this.pos = 0),
              (this.start = 0),
              (this.escapeCharPositions = []);
          }),
          (P.QueryLexer.prototype.run = function () {
            for (var e = P.QueryLexer.lexText; e; ) e = e(this);
          }),
          (P.QueryLexer.prototype.sliceString = function () {
            for (
              var e = [], t = this.start, r = this.pos, n = 0;
              n < this.escapeCharPositions.length;
              n++
            )
              (r = this.escapeCharPositions[n]),
                e.push(this.str.slice(t, r)),
                (t = r + 1);
            return (
              e.push(this.str.slice(t, this.pos)),
              (this.escapeCharPositions.length = 0),
              e.join('')
            );
          }),
          (P.QueryLexer.prototype.emit = function (e) {
            this.lexemes.push({
              type: e,
              str: this.sliceString(),
              start: this.start,
              end: this.pos,
            }),
              (this.start = this.pos);
          }),
          (P.QueryLexer.prototype.escapeCharacter = function () {
            this.escapeCharPositions.push(this.pos - 1), (this.pos += 1);
          }),
          (P.QueryLexer.prototype.next = function () {
            if (this.pos >= this.length) return P.QueryLexer.EOS;
            var e = this.str.charAt(this.pos);
            return (this.pos += 1), e;
          }),
          (P.QueryLexer.prototype.width = function () {
            return this.pos - this.start;
          }),
          (P.QueryLexer.prototype.ignore = function () {
            this.start == this.pos && (this.pos += 1), (this.start = this.pos);
          }),
          (P.QueryLexer.prototype.backup = function () {
            this.pos -= 1;
          }),
          (P.QueryLexer.prototype.acceptDigitRun = function () {
            var e, t;
            do {
              t = (e = this.next()).charCodeAt(0);
            } while (t > 47 && t < 58);
            e != P.QueryLexer.EOS && this.backup();
          }),
          (P.QueryLexer.prototype.more = function () {
            return this.pos < this.length;
          }),
          (P.QueryLexer.EOS = 'EOS'),
          (P.QueryLexer.FIELD = 'FIELD'),
          (P.QueryLexer.TERM = 'TERM'),
          (P.QueryLexer.EDIT_DISTANCE = 'EDIT_DISTANCE'),
          (P.QueryLexer.BOOST = 'BOOST'),
          (P.QueryLexer.PRESENCE = 'PRESENCE'),
          (P.QueryLexer.lexField = function (e) {
            return (
              e.backup(),
              e.emit(P.QueryLexer.FIELD),
              e.ignore(),
              P.QueryLexer.lexText
            );
          }),
          (P.QueryLexer.lexTerm = function (e) {
            if (
              (e.width() > 1 && (e.backup(), e.emit(P.QueryLexer.TERM)),
              e.ignore(),
              e.more())
            )
              return P.QueryLexer.lexText;
          }),
          (P.QueryLexer.lexEditDistance = function (e) {
            return (
              e.ignore(),
              e.acceptDigitRun(),
              e.emit(P.QueryLexer.EDIT_DISTANCE),
              P.QueryLexer.lexText
            );
          }),
          (P.QueryLexer.lexBoost = function (e) {
            return (
              e.ignore(),
              e.acceptDigitRun(),
              e.emit(P.QueryLexer.BOOST),
              P.QueryLexer.lexText
            );
          }),
          (P.QueryLexer.lexEOS = function (e) {
            e.width() > 0 && e.emit(P.QueryLexer.TERM);
          }),
          (P.QueryLexer.termSeparator = P.tokenizer.separator),
          (P.QueryLexer.lexText = function (e) {
            for (;;) {
              var t = e.next();
              if (t == P.QueryLexer.EOS) return P.QueryLexer.lexEOS;
              if (92 != t.charCodeAt(0)) {
                if (':' == t) return P.QueryLexer.lexField;
                if ('~' == t)
                  return (
                    e.backup(),
                    e.width() > 0 && e.emit(P.QueryLexer.TERM),
                    P.QueryLexer.lexEditDistance
                  );
                if ('^' == t)
                  return (
                    e.backup(),
                    e.width() > 0 && e.emit(P.QueryLexer.TERM),
                    P.QueryLexer.lexBoost
                  );
                if ('+' == t && 1 === e.width())
                  return e.emit(P.QueryLexer.PRESENCE), P.QueryLexer.lexText;
                if ('-' == t && 1 === e.width())
                  return e.emit(P.QueryLexer.PRESENCE), P.QueryLexer.lexText;
                if (t.match(P.QueryLexer.termSeparator))
                  return P.QueryLexer.lexTerm;
              } else e.escapeCharacter();
            }
          }),
          (P.QueryParser = function (e, t) {
            (this.lexer = new P.QueryLexer(e)),
              (this.query = t),
              (this.currentClause = {}),
              (this.lexemeIdx = 0);
          }),
          (P.QueryParser.prototype.parse = function () {
            this.lexer.run(), (this.lexemes = this.lexer.lexemes);
            for (var e = P.QueryParser.parseClause; e; ) e = e(this);
            return this.query;
          }),
          (P.QueryParser.prototype.peekLexeme = function () {
            return this.lexemes[this.lexemeIdx];
          }),
          (P.QueryParser.prototype.consumeLexeme = function () {
            var e = this.peekLexeme();
            return (this.lexemeIdx += 1), e;
          }),
          (P.QueryParser.prototype.nextClause = function () {
            var e = this.currentClause;
            this.query.clause(e), (this.currentClause = {});
          }),
          (P.QueryParser.parseClause = function (e) {
            var t = e.peekLexeme();
            if (null != t)
              switch (t.type) {
                case P.QueryLexer.PRESENCE:
                  return P.QueryParser.parsePresence;
                case P.QueryLexer.FIELD:
                  return P.QueryParser.parseField;
                case P.QueryLexer.TERM:
                  return P.QueryParser.parseTerm;
                default:
                  var r = 'expected either a field or a term, found ' + t.type;
                  throw (
                    (t.str.length >= 1 && (r += " with value '" + t.str + "'"),
                    new P.QueryParseError(r, t.start, t.end))
                  );
              }
          }),
          (P.QueryParser.parsePresence = function (e) {
            var t = e.consumeLexeme();
            if (null != t) {
              switch (t.str) {
                case '-':
                  e.currentClause.presence = P.Query.presence.PROHIBITED;
                  break;
                case '+':
                  e.currentClause.presence = P.Query.presence.REQUIRED;
                  break;
                default:
                  var r = "unrecognised presence operator'" + t.str + "'";
                  throw new P.QueryParseError(r, t.start, t.end);
              }
              var n = e.peekLexeme();
              if (null == n) {
                r = 'expecting term or field, found nothing';
                throw new P.QueryParseError(r, t.start, t.end);
              }
              switch (n.type) {
                case P.QueryLexer.FIELD:
                  return P.QueryParser.parseField;
                case P.QueryLexer.TERM:
                  return P.QueryParser.parseTerm;
                default:
                  r = "expecting term or field, found '" + n.type + "'";
                  throw new P.QueryParseError(r, n.start, n.end);
              }
            }
          }),
          (P.QueryParser.parseField = function (e) {
            var t = e.consumeLexeme();
            if (null != t) {
              if (-1 == e.query.allFields.indexOf(t.str)) {
                var r = e.query.allFields
                    .map(function (e) {
                      return "'" + e + "'";
                    })
                    .join(', '),
                  n =
                    "unrecognised field '" + t.str + "', possible fields: " + r;
                throw new P.QueryParseError(n, t.start, t.end);
              }
              e.currentClause.fields = [t.str];
              var i = e.peekLexeme();
              if (null == i) {
                n = 'expecting term, found nothing';
                throw new P.QueryParseError(n, t.start, t.end);
              }
              switch (i.type) {
                case P.QueryLexer.TERM:
                  return P.QueryParser.parseTerm;
                default:
                  n = "expecting term, found '" + i.type + "'";
                  throw new P.QueryParseError(n, i.start, i.end);
              }
            }
          }),
          (P.QueryParser.parseTerm = function (e) {
            var t = e.consumeLexeme();
            if (null != t) {
              (e.currentClause.term = t.str.toLowerCase()),
                -1 != t.str.indexOf('*') && (e.currentClause.usePipeline = !1);
              var r = e.peekLexeme();
              if (null != r)
                switch (r.type) {
                  case P.QueryLexer.TERM:
                    return e.nextClause(), P.QueryParser.parseTerm;
                  case P.QueryLexer.FIELD:
                    return e.nextClause(), P.QueryParser.parseField;
                  case P.QueryLexer.EDIT_DISTANCE:
                    return P.QueryParser.parseEditDistance;
                  case P.QueryLexer.BOOST:
                    return P.QueryParser.parseBoost;
                  case P.QueryLexer.PRESENCE:
                    return e.nextClause(), P.QueryParser.parsePresence;
                  default:
                    var n = "Unexpected lexeme type '" + r.type + "'";
                    throw new P.QueryParseError(n, r.start, r.end);
                }
              else e.nextClause();
            }
          }),
          (P.QueryParser.parseEditDistance = function (e) {
            var t = e.consumeLexeme();
            if (null != t) {
              var r = parseInt(t.str, 10);
              if (isNaN(r)) {
                var n = 'edit distance must be numeric';
                throw new P.QueryParseError(n, t.start, t.end);
              }
              e.currentClause.editDistance = r;
              var i = e.peekLexeme();
              if (null != i)
                switch (i.type) {
                  case P.QueryLexer.TERM:
                    return e.nextClause(), P.QueryParser.parseTerm;
                  case P.QueryLexer.FIELD:
                    return e.nextClause(), P.QueryParser.parseField;
                  case P.QueryLexer.EDIT_DISTANCE:
                    return P.QueryParser.parseEditDistance;
                  case P.QueryLexer.BOOST:
                    return P.QueryParser.parseBoost;
                  case P.QueryLexer.PRESENCE:
                    return e.nextClause(), P.QueryParser.parsePresence;
                  default:
                    n = "Unexpected lexeme type '" + i.type + "'";
                    throw new P.QueryParseError(n, i.start, i.end);
                }
              else e.nextClause();
            }
          }),
          (P.QueryParser.parseBoost = function (e) {
            var t = e.consumeLexeme();
            if (null != t) {
              var r = parseInt(t.str, 10);
              if (isNaN(r)) {
                var n = 'boost must be numeric';
                throw new P.QueryParseError(n, t.start, t.end);
              }
              e.currentClause.boost = r;
              var i = e.peekLexeme();
              if (null != i)
                switch (i.type) {
                  case P.QueryLexer.TERM:
                    return e.nextClause(), P.QueryParser.parseTerm;
                  case P.QueryLexer.FIELD:
                    return e.nextClause(), P.QueryParser.parseField;
                  case P.QueryLexer.EDIT_DISTANCE:
                    return P.QueryParser.parseEditDistance;
                  case P.QueryLexer.BOOST:
                    return P.QueryParser.parseBoost;
                  case P.QueryLexer.PRESENCE:
                    return e.nextClause(), P.QueryParser.parsePresence;
                  default:
                    n = "Unexpected lexeme type '" + i.type + "'";
                    throw new P.QueryParseError(n, i.start, i.end);
                }
              else e.nextClause();
            }
          }),
          void 0 ===
            (i =
              'function' ==
              typeof (n = function () {
                return P;
              })
                ? n.call(t, r, t, e)
                : n) || (e.exports = i);
      })();
    },
    5666: function (e) {
      var t = (function (e) {
        'use strict';
        var t,
          r = Object.prototype,
          n = r.hasOwnProperty,
          i = 'function' == typeof Symbol ? Symbol : {},
          o = i.iterator || '@@iterator',
          a = i.asyncIterator || '@@asyncIterator',
          u = i.toStringTag || '@@toStringTag';
        function s(e, t, r) {
          return (
            Object.defineProperty(e, t, {
              value: r,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            }),
            e[t]
          );
        }
        try {
          s({}, '');
        } catch (P) {
          s = function (e, t, r) {
            return (e[t] = r);
          };
        }
        function c(e, t, r, n) {
          var i = t && t.prototype instanceof v ? t : v,
            o = Object.create(i.prototype),
            a = new L(n || []);
          return (
            (o._invoke = (function (e, t, r) {
              var n = f;
              return function (i, o) {
                if (n === h) throw new Error('Generator is already running');
                if (n === p) {
                  if ('throw' === i) throw o;
                  return S();
                }
                for (r.method = i, r.arg = o; ; ) {
                  var a = r.delegate;
                  if (a) {
                    var u = D(a, r);
                    if (u) {
                      if (u === m) continue;
                      return u;
                    }
                  }
                  if ('next' === r.method) r.sent = r._sent = r.arg;
                  else if ('throw' === r.method) {
                    if (n === f) throw ((n = p), r.arg);
                    r.dispatchException(r.arg);
                  } else 'return' === r.method && r.abrupt('return', r.arg);
                  n = h;
                  var s = l(e, t, r);
                  if ('normal' === s.type) {
                    if (((n = r.done ? p : d), s.arg === m)) continue;
                    return { value: s.arg, done: r.done };
                  }
                  'throw' === s.type &&
                    ((n = p), (r.method = 'throw'), (r.arg = s.arg));
                }
              };
            })(e, r, a)),
            o
          );
        }
        function l(e, t, r) {
          try {
            return { type: 'normal', arg: e.call(t, r) };
          } catch (P) {
            return { type: 'throw', arg: P };
          }
        }
        e.wrap = c;
        var f = 'suspendedStart',
          d = 'suspendedYield',
          h = 'executing',
          p = 'completed',
          m = {};
        function v() {}
        function g() {}
        function y() {}
        var b = {};
        b[o] = function () {
          return this;
        };
        var w = Object.getPrototypeOf,
          E = w && w(w(A([])));
        E && E !== r && n.call(E, o) && (b = E);
        var x = (y.prototype = v.prototype = Object.create(b));
        function k(e) {
          ['next', 'throw', 'return'].forEach(function (t) {
            s(e, t, function (e) {
              return this._invoke(t, e);
            });
          });
        }
        function _(e, t) {
          function r(i, o, a, u) {
            var s = l(e[i], e, o);
            if ('throw' !== s.type) {
              var c = s.arg,
                f = c.value;
              return f && 'object' == typeof f && n.call(f, '__await')
                ? t.resolve(f.__await).then(
                    function (e) {
                      r('next', e, a, u);
                    },
                    function (e) {
                      r('throw', e, a, u);
                    },
                  )
                : t.resolve(f).then(
                    function (e) {
                      (c.value = e), a(c);
                    },
                    function (e) {
                      return r('throw', e, a, u);
                    },
                  );
            }
            u(s.arg);
          }
          var i;
          this._invoke = function (e, n) {
            function o() {
              return new t(function (t, i) {
                r(e, n, t, i);
              });
            }
            return (i = i ? i.then(o, o) : o());
          };
        }
        function D(e, r) {
          var n = e.iterator[r.method];
          if (n === t) {
            if (((r.delegate = null), 'throw' === r.method)) {
              if (
                e.iterator.return &&
                ((r.method = 'return'),
                (r.arg = t),
                D(e, r),
                'throw' === r.method)
              )
                return m;
              (r.method = 'throw'),
                (r.arg = new TypeError(
                  "The iterator does not provide a 'throw' method",
                ));
            }
            return m;
          }
          var i = l(n, e.iterator, r.arg);
          if ('throw' === i.type)
            return (
              (r.method = 'throw'), (r.arg = i.arg), (r.delegate = null), m
            );
          var o = i.arg;
          return o
            ? o.done
              ? ((r[e.resultName] = o.value),
                (r.next = e.nextLoc),
                'return' !== r.method && ((r.method = 'next'), (r.arg = t)),
                (r.delegate = null),
                m)
              : o
            : ((r.method = 'throw'),
              (r.arg = new TypeError('iterator result is not an object')),
              (r.delegate = null),
              m);
        }
        function C(e) {
          var t = { tryLoc: e[0] };
          1 in e && (t.catchLoc = e[1]),
            2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])),
            this.tryEntries.push(t);
        }
        function F(e) {
          var t = e.completion || {};
          (t.type = 'normal'), delete t.arg, (e.completion = t);
        }
        function L(e) {
          (this.tryEntries = [{ tryLoc: 'root' }]),
            e.forEach(C, this),
            this.reset(!0);
        }
        function A(e) {
          if (e) {
            var r = e[o];
            if (r) return r.call(e);
            if ('function' == typeof e.next) return e;
            if (!isNaN(e.length)) {
              var i = -1,
                a = function r() {
                  for (; ++i < e.length; )
                    if (n.call(e, i)) return (r.value = e[i]), (r.done = !1), r;
                  return (r.value = t), (r.done = !0), r;
                };
              return (a.next = a);
            }
          }
          return { next: S };
        }
        function S() {
          return { value: t, done: !0 };
        }
        return (
          (g.prototype = x.constructor = y),
          (y.constructor = g),
          (g.displayName = s(y, u, 'GeneratorFunction')),
          (e.isGeneratorFunction = function (e) {
            var t = 'function' == typeof e && e.constructor;
            return (
              !!t &&
              (t === g || 'GeneratorFunction' === (t.displayName || t.name))
            );
          }),
          (e.mark = function (e) {
            return (
              Object.setPrototypeOf
                ? Object.setPrototypeOf(e, y)
                : ((e.__proto__ = y), s(e, u, 'GeneratorFunction')),
              (e.prototype = Object.create(x)),
              e
            );
          }),
          (e.awrap = function (e) {
            return { __await: e };
          }),
          k(_.prototype),
          (_.prototype[a] = function () {
            return this;
          }),
          (e.AsyncIterator = _),
          (e.async = function (t, r, n, i, o) {
            void 0 === o && (o = Promise);
            var a = new _(c(t, r, n, i), o);
            return e.isGeneratorFunction(r)
              ? a
              : a.next().then(function (e) {
                  return e.done ? e.value : a.next();
                });
          }),
          k(x),
          s(x, u, 'Generator'),
          (x[o] = function () {
            return this;
          }),
          (x.toString = function () {
            return '[object Generator]';
          }),
          (e.keys = function (e) {
            var t = [];
            for (var r in e) t.push(r);
            return (
              t.reverse(),
              function r() {
                for (; t.length; ) {
                  var n = t.pop();
                  if (n in e) return (r.value = n), (r.done = !1), r;
                }
                return (r.done = !0), r;
              }
            );
          }),
          (e.values = A),
          (L.prototype = {
            constructor: L,
            reset: function (e) {
              if (
                ((this.prev = 0),
                (this.next = 0),
                (this.sent = this._sent = t),
                (this.done = !1),
                (this.delegate = null),
                (this.method = 'next'),
                (this.arg = t),
                this.tryEntries.forEach(F),
                !e)
              )
                for (var r in this)
                  't' === r.charAt(0) &&
                    n.call(this, r) &&
                    !isNaN(+r.slice(1)) &&
                    (this[r] = t);
            },
            stop: function () {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ('throw' === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function (e) {
              if (this.done) throw e;
              var r = this;
              function i(n, i) {
                return (
                  (u.type = 'throw'),
                  (u.arg = e),
                  (r.next = n),
                  i && ((r.method = 'next'), (r.arg = t)),
                  !!i
                );
              }
              for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                var a = this.tryEntries[o],
                  u = a.completion;
                if ('root' === a.tryLoc) return i('end');
                if (a.tryLoc <= this.prev) {
                  var s = n.call(a, 'catchLoc'),
                    c = n.call(a, 'finallyLoc');
                  if (s && c) {
                    if (this.prev < a.catchLoc) return i(a.catchLoc, !0);
                    if (this.prev < a.finallyLoc) return i(a.finallyLoc);
                  } else if (s) {
                    if (this.prev < a.catchLoc) return i(a.catchLoc, !0);
                  } else {
                    if (!c)
                      throw new Error('try statement without catch or finally');
                    if (this.prev < a.finallyLoc) return i(a.finallyLoc);
                  }
                }
              }
            },
            abrupt: function (e, t) {
              for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                var i = this.tryEntries[r];
                if (
                  i.tryLoc <= this.prev &&
                  n.call(i, 'finallyLoc') &&
                  this.prev < i.finallyLoc
                ) {
                  var o = i;
                  break;
                }
              }
              o &&
                ('break' === e || 'continue' === e) &&
                o.tryLoc <= t &&
                t <= o.finallyLoc &&
                (o = null);
              var a = o ? o.completion : {};
              return (
                (a.type = e),
                (a.arg = t),
                o
                  ? ((this.method = 'next'), (this.next = o.finallyLoc), m)
                  : this.complete(a)
              );
            },
            complete: function (e, t) {
              if ('throw' === e.type) throw e.arg;
              return (
                'break' === e.type || 'continue' === e.type
                  ? (this.next = e.arg)
                  : 'return' === e.type
                  ? ((this.rval = this.arg = e.arg),
                    (this.method = 'return'),
                    (this.next = 'end'))
                  : 'normal' === e.type && t && (this.next = t),
                m
              );
            },
            finish: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var r = this.tryEntries[t];
                if (r.finallyLoc === e)
                  return this.complete(r.completion, r.afterLoc), F(r), m;
              }
            },
            catch: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var r = this.tryEntries[t];
                if (r.tryLoc === e) {
                  var n = r.completion;
                  if ('throw' === n.type) {
                    var i = n.arg;
                    F(r);
                  }
                  return i;
                }
              }
              throw new Error('illegal catch attempt');
            },
            delegateYield: function (e, r, n) {
              return (
                (this.delegate = { iterator: A(e), resultName: r, nextLoc: n }),
                'next' === this.method && (this.arg = t),
                m
              );
            },
          }),
          e
        );
      })(e.exports);
      try {
        regeneratorRuntime = t;
      } catch (r) {
        Function('r', 'regeneratorRuntime = r')(t);
      }
    },
    655: function (e, t, r) {
      'use strict';
      r.r(t),
        r.d(t, {
          __extends: function () {
            return i;
          },
          __assign: function () {
            return o;
          },
          __rest: function () {
            return a;
          },
          __decorate: function () {
            return u;
          },
          __param: function () {
            return s;
          },
          __metadata: function () {
            return c;
          },
          __awaiter: function () {
            return l;
          },
          __generator: function () {
            return f;
          },
          __createBinding: function () {
            return d;
          },
          __exportStar: function () {
            return h;
          },
          __values: function () {
            return p;
          },
          __read: function () {
            return m;
          },
          __spread: function () {
            return v;
          },
          __spreadArrays: function () {
            return g;
          },
          __spreadArray: function () {
            return y;
          },
          __await: function () {
            return b;
          },
          __asyncGenerator: function () {
            return w;
          },
          __asyncDelegator: function () {
            return E;
          },
          __asyncValues: function () {
            return x;
          },
          __makeTemplateObject: function () {
            return k;
          },
          __importStar: function () {
            return D;
          },
          __importDefault: function () {
            return C;
          },
          __classPrivateFieldGet: function () {
            return F;
          },
          __classPrivateFieldSet: function () {
            return L;
          },
        });
      var n = function (e, t) {
        return (n =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (e, t) {
              e.__proto__ = t;
            }) ||
          function (e, t) {
            for (var r in t)
              Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
          })(e, t);
      };
      function i(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Class extends value ' +
              String(t) +
              ' is not a constructor or null',
          );
        function r() {
          this.constructor = e;
        }
        n(e, t),
          (e.prototype =
            null === t
              ? Object.create(t)
              : ((r.prototype = t.prototype), new r()));
      }
      var o = function () {
        return (o =
          Object.assign ||
          function (e) {
            for (var t, r = 1, n = arguments.length; r < n; r++)
              for (var i in (t = arguments[r]))
                Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
            return e;
          }).apply(this, arguments);
      };
      function a(e, t) {
        var r = {};
        for (var n in e)
          Object.prototype.hasOwnProperty.call(e, n) &&
            t.indexOf(n) < 0 &&
            (r[n] = e[n]);
        if (null != e && 'function' == typeof Object.getOwnPropertySymbols) {
          var i = 0;
          for (n = Object.getOwnPropertySymbols(e); i < n.length; i++)
            t.indexOf(n[i]) < 0 &&
              Object.prototype.propertyIsEnumerable.call(e, n[i]) &&
              (r[n[i]] = e[n[i]]);
        }
        return r;
      }
      function u(e, t, r, n) {
        var i,
          o = arguments.length,
          a =
            o < 3
              ? t
              : null === n
              ? (n = Object.getOwnPropertyDescriptor(t, r))
              : n;
        if ('object' == typeof Reflect && 'function' == typeof Reflect.decorate)
          a = Reflect.decorate(e, t, r, n);
        else
          for (var u = e.length - 1; u >= 0; u--)
            (i = e[u]) &&
              (a = (o < 3 ? i(a) : o > 3 ? i(t, r, a) : i(t, r)) || a);
        return o > 3 && a && Object.defineProperty(t, r, a), a;
      }
      function s(e, t) {
        return function (r, n) {
          t(r, n, e);
        };
      }
      function c(e, t) {
        if ('object' == typeof Reflect && 'function' == typeof Reflect.metadata)
          return Reflect.metadata(e, t);
      }
      function l(e, t, r, n) {
        return new (r || (r = Promise))(function (i, o) {
          function a(e) {
            try {
              s(n.next(e));
            } catch (t) {
              o(t);
            }
          }
          function u(e) {
            try {
              s(n.throw(e));
            } catch (t) {
              o(t);
            }
          }
          function s(e) {
            var t;
            e.done
              ? i(e.value)
              : ((t = e.value),
                t instanceof r
                  ? t
                  : new r(function (e) {
                      e(t);
                    })).then(a, u);
          }
          s((n = n.apply(e, t || [])).next());
        });
      }
      function f(e, t) {
        var r,
          n,
          i,
          o,
          a = {
            label: 0,
            sent: function () {
              if (1 & i[0]) throw i[1];
              return i[1];
            },
            trys: [],
            ops: [],
          };
        return (
          (o = { next: u(0), throw: u(1), return: u(2) }),
          'function' == typeof Symbol &&
            (o[Symbol.iterator] = function () {
              return this;
            }),
          o
        );
        function u(o) {
          return function (u) {
            return (function (o) {
              if (r) throw new TypeError('Generator is already executing.');
              for (; a; )
                try {
                  if (
                    ((r = 1),
                    n &&
                      (i =
                        2 & o[0]
                          ? n.return
                          : o[0]
                          ? n.throw || ((i = n.return) && i.call(n), 0)
                          : n.next) &&
                      !(i = i.call(n, o[1])).done)
                  )
                    return i;
                  switch (((n = 0), i && (o = [2 & o[0], i.value]), o[0])) {
                    case 0:
                    case 1:
                      i = o;
                      break;
                    case 4:
                      return a.label++, { value: o[1], done: !1 };
                    case 5:
                      a.label++, (n = o[1]), (o = [0]);
                      continue;
                    case 7:
                      (o = a.ops.pop()), a.trys.pop();
                      continue;
                    default:
                      if (
                        !((i = a.trys),
                        (i = i.length > 0 && i[i.length - 1]) ||
                          (6 !== o[0] && 2 !== o[0]))
                      ) {
                        a = 0;
                        continue;
                      }
                      if (3 === o[0] && (!i || (o[1] > i[0] && o[1] < i[3]))) {
                        a.label = o[1];
                        break;
                      }
                      if (6 === o[0] && a.label < i[1]) {
                        (a.label = i[1]), (i = o);
                        break;
                      }
                      if (i && a.label < i[2]) {
                        (a.label = i[2]), a.ops.push(o);
                        break;
                      }
                      i[2] && a.ops.pop(), a.trys.pop();
                      continue;
                  }
                  o = t.call(e, a);
                } catch (u) {
                  (o = [6, u]), (n = 0);
                } finally {
                  r = i = 0;
                }
              if (5 & o[0]) throw o[1];
              return { value: o[0] ? o[1] : void 0, done: !0 };
            })([o, u]);
          };
        }
      }
      var d = Object.create
        ? function (e, t, r, n) {
            void 0 === n && (n = r),
              Object.defineProperty(e, n, {
                enumerable: !0,
                get: function () {
                  return t[r];
                },
              });
          }
        : function (e, t, r, n) {
            void 0 === n && (n = r), (e[n] = t[r]);
          };
      function h(e, t) {
        for (var r in e)
          'default' === r ||
            Object.prototype.hasOwnProperty.call(t, r) ||
            d(t, e, r);
      }
      function p(e) {
        var t = 'function' == typeof Symbol && Symbol.iterator,
          r = t && e[t],
          n = 0;
        if (r) return r.call(e);
        if (e && 'number' == typeof e.length)
          return {
            next: function () {
              return (
                e && n >= e.length && (e = void 0),
                { value: e && e[n++], done: !e }
              );
            },
          };
        throw new TypeError(
          t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
        );
      }
      function m(e, t) {
        var r = 'function' == typeof Symbol && e[Symbol.iterator];
        if (!r) return e;
        var n,
          i,
          o = r.call(e),
          a = [];
        try {
          for (; (void 0 === t || t-- > 0) && !(n = o.next()).done; )
            a.push(n.value);
        } catch (u) {
          i = { error: u };
        } finally {
          try {
            n && !n.done && (r = o.return) && r.call(o);
          } finally {
            if (i) throw i.error;
          }
        }
        return a;
      }
      function v() {
        for (var e = [], t = 0; t < arguments.length; t++)
          e = e.concat(m(arguments[t]));
        return e;
      }
      function g() {
        for (var e = 0, t = 0, r = arguments.length; t < r; t++)
          e += arguments[t].length;
        var n = Array(e),
          i = 0;
        for (t = 0; t < r; t++)
          for (var o = arguments[t], a = 0, u = o.length; a < u; a++, i++)
            n[i] = o[a];
        return n;
      }
      function y(e, t, r) {
        if (r || 2 === arguments.length)
          for (var n, i = 0, o = t.length; i < o; i++)
            (!n && i in t) ||
              (n || (n = Array.prototype.slice.call(t, 0, i)), (n[i] = t[i]));
        return e.concat(n || t);
      }
      function b(e) {
        return this instanceof b ? ((this.v = e), this) : new b(e);
      }
      function w(e, t, r) {
        if (!Symbol.asyncIterator)
          throw new TypeError('Symbol.asyncIterator is not defined.');
        var n,
          i = r.apply(e, t || []),
          o = [];
        return (
          (n = {}),
          a('next'),
          a('throw'),
          a('return'),
          (n[Symbol.asyncIterator] = function () {
            return this;
          }),
          n
        );
        function a(e) {
          i[e] &&
            (n[e] = function (t) {
              return new Promise(function (r, n) {
                o.push([e, t, r, n]) > 1 || u(e, t);
              });
            });
        }
        function u(e, t) {
          try {
            (r = i[e](t)).value instanceof b
              ? Promise.resolve(r.value.v).then(s, c)
              : l(o[0][2], r);
          } catch (n) {
            l(o[0][3], n);
          }
          var r;
        }
        function s(e) {
          u('next', e);
        }
        function c(e) {
          u('throw', e);
        }
        function l(e, t) {
          e(t), o.shift(), o.length && u(o[0][0], o[0][1]);
        }
      }
      function E(e) {
        var t, r;
        return (
          (t = {}),
          n('next'),
          n('throw', function (e) {
            throw e;
          }),
          n('return'),
          (t[Symbol.iterator] = function () {
            return this;
          }),
          t
        );
        function n(n, i) {
          t[n] = e[n]
            ? function (t) {
                return (r = !r)
                  ? { value: b(e[n](t)), done: 'return' === n }
                  : i
                  ? i(t)
                  : t;
              }
            : i;
        }
      }
      function x(e) {
        if (!Symbol.asyncIterator)
          throw new TypeError('Symbol.asyncIterator is not defined.');
        var t,
          r = e[Symbol.asyncIterator];
        return r
          ? r.call(e)
          : ((e = p(e)),
            (t = {}),
            n('next'),
            n('throw'),
            n('return'),
            (t[Symbol.asyncIterator] = function () {
              return this;
            }),
            t);
        function n(r) {
          t[r] =
            e[r] &&
            function (t) {
              return new Promise(function (n, i) {
                (function (e, t, r, n) {
                  Promise.resolve(n).then(function (t) {
                    e({ value: t, done: r });
                  }, t);
                })(n, i, (t = e[r](t)).done, t.value);
              });
            };
        }
      }
      function k(e, t) {
        return (
          Object.defineProperty
            ? Object.defineProperty(e, 'raw', { value: t })
            : (e.raw = t),
          e
        );
      }
      var _ = Object.create
        ? function (e, t) {
            Object.defineProperty(e, 'default', { enumerable: !0, value: t });
          }
        : function (e, t) {
            e.default = t;
          };
      function D(e) {
        if (e && e.__esModule) return e;
        var t = {};
        if (null != e)
          for (var r in e)
            'default' !== r &&
              Object.prototype.hasOwnProperty.call(e, r) &&
              d(t, e, r);
        return _(t, e), t;
      }
      function C(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function F(e, t, r, n) {
        if ('a' === r && !n)
          throw new TypeError('Private accessor was defined without a getter');
        if ('function' == typeof t ? e !== t || !n : !t.has(e))
          throw new TypeError(
            'Cannot read private member from an object whose class did not declare it',
          );
        return 'm' === r ? n : 'a' === r ? n.call(e) : n ? n.value : t.get(e);
      }
      function L(e, t, r, n, i) {
        if ('m' === n) throw new TypeError('Private method is not writable');
        if ('a' === n && !i)
          throw new TypeError('Private accessor was defined without a setter');
        if ('function' == typeof t ? e !== t || !i : !t.has(e))
          throw new TypeError(
            'Cannot write private member to an object whose class did not declare it',
          );
        return 'a' === n ? i.call(e, r) : i ? (i.value = r) : t.set(e, r), r;
      }
    },
  },
]);
