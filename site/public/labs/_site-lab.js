// Site glue for the RAG & Agents Engineering labs (Phase 2, FE-08), loaded by every lab.
// Framed in a lesson (sandboxed, so no storage), a lab turns on embedded mode and takes its
// theme from the lesson's postMessage. Opened on its own, it reads the site's stored theme
// the way the root layout does, else the system setting.
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
  var stored = null
  try { stored = framed ? null : localStorage.getItem('fd:v1:theme') } catch (e) {}
  dark(stored ? stored.replace(/"/g, '') === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
})()
