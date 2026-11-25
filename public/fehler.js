/* Fehler-Wächter: leitet auf 404.html um, wenn etwas Wichtiges nicht lädt oder die Seite wiederholt abstürzt.
   Wird auf der Hauptseite und in allen Tools als erstes Skript im <head> geladen. */
(function () {
    'use strict';
    var me = document.currentScript;
    if (!me || !me.src) return;
    var root = me.src.replace(/[^\/]*$/, '');
    var page = root + '404.html';
    if (/\/404\.html$/.test(location.pathname)) return;

    var done = false;
    function go(code, detail) {
        if (done) return;
        try {
            var last = +sessionStorage.getItem('jb-err-t') || 0;
            if (Date.now() - last < 8000) return;          // keine Umleitungsschleife
            sessionStorage.setItem('jb-err-t', String(Date.now()));
        } catch (e) { /* ohne Speicher trotzdem weiter */ }
        done = true;
        var from = location.pathname + location.search;
        var q = '?code=' + encodeURIComponent(code) + '&from=' + encodeURIComponent(from) + (detail ? '&d=' + encodeURIComponent(String(detail).slice(0, 80)) : '');
        location.replace(page + q);
    }
    window.JBFehler = go;

    function sameOrigin(url) {
        try { return new URL(url, location.href).origin === location.origin || location.protocol === 'file:' && /^file:/.test(url); }
        catch (e) { return false; }
    }

    // 1) Eigene Skripte oder Stylesheets lassen sich nicht laden
    window.addEventListener('error', function (ev) {
        var t = ev.target;
        if (!t || t === window || !t.tagName) return;
        var tag = t.tagName;
        var url = t.src || t.href || '';
        if ((tag === 'SCRIPT' || (tag === 'LINK' && /stylesheet/i.test(t.rel))) && sameOrigin(url)) {
            go(navigator.onLine === false ? 'offline' : 'load', url.replace(root, ''));
        }
    }, true);

    // 2) Eigener Code stürzt wiederholt ab (drei Fehler innerhalb von zehn Sekunden)
    var hits = [];
    window.addEventListener('error', function (ev) {
        if (ev.target && ev.target !== window) return;
        if (!ev.filename || !sameOrigin(ev.filename)) return;
        var now = Date.now();
        hits.push(now);
        hits = hits.filter(function (t) { return now - t < 10000; });
        if (hits.length >= 3) go('script', ev.message);
    });
})();
