// Site glue for the RAG & Agents Engineering labs (Phase 2, FE-08), loaded by every lab.
// Labs are always sandboxed (the /labs CSP), so they cannot read the site's stored theme. Framed
// in a lesson, a lab turns on embedded mode and takes its theme from the lesson's postMessage;
// opened on its own, it follows the system setting.
(function () {
  var root = document.documentElement
  var framed = window.self !== window.top
  var dark = function (on) { root.classList.toggle('dark', on) }
  if (framed) {
    root.classList.add('embedded')
    window.addEventListener('message', function (e) {
      if (e.source === window.parent && e.data && (e.data.theme === 'dark' || e.data.theme === 'light')) dark(e.data.theme === 'dark')
    })
  }
  dark(window.matchMedia('(prefers-color-scheme: dark)').matches)
  // A region that scrolls must be reachable by keyboard (WCAG 2.1.1): give each one that
  // overflows, has no focusable content and no tabindex of its own a tab stop.
  var scrollable = function () {
    var els = document.body.querySelectorAll('*')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      var style = getComputedStyle(el)
      var scrolls = /auto|scroll/.test(style.overflowX + style.overflowY)
      var over = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
      if (scrolls && over && !el.hasAttribute('tabindex') && !el.querySelector('a[href], button, input, select, textarea, [tabindex]')) el.tabIndex = 0
    }
  }
  document.addEventListener('DOMContentLoaded', scrollable)
  window.addEventListener('resize', scrollable)
})()
