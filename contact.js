/* ==========================================================================
   Kontaktformular – Prüfung, Entwurf, Versand (Web3Forms) und E-Mail-Fallback
   Einstellungen stehen in form-config.js
   ========================================================================== */
(() => {
    'use strict';
    const form = document.getElementById('cform');
    if (!form) return;
    const $ = (s) => document.getElementById(s);
    const cfg = Object.assign({ accessKey: '', endpoint: 'https://api.web3forms.com/submit', to: 'julien.bernath@gmx.ch', timeoutMs: 15000 }, window.JB_FORM || {});

    const el = {
        name: $('cf-name'), email: $('cf-email'), msg: $('cf-msg'), consent: $('cf-consent'),
        hp: $('cf-hp'), bot: $('cf-bot'), send: $('cf-send'), status: $('cf-status'), count: $('cf-count'),
        done: $('cf-done'), doneTitle: $('cf-done-title'), doneText: $('cf-done-text'), copy: $('cf-copy'), again: $('cf-again')
    };
    const topic = () => (form.querySelector('input[name="topic"]:checked') || {}).value || 'Anderes';

    const store = {
        get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privater Modus */ } },
        del(k) { try { localStorage.removeItem(k); } catch (e) { /* ok */ } }
    };

    /* ---------- Prüfung ---------- */
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const clean = (s) => String(s || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
    const rules = {
        name: () => { const v = clean(el.name.value); return v.length < 2 ? 'Bitte gib deinen Namen an.' : ''; },
        email: () => { const v = clean(el.email.value); return !EMAIL.test(v) ? 'Bitte gib eine gültige E-Mail-Adresse an.' : ''; },
        msg: () => { const v = clean(el.msg.value); return v.length < 10 ? 'Bitte schreib mindestens 10 Zeichen.' : v.length > 2000 ? 'Maximal 2000 Zeichen.' : ''; },
        consent: () => (el.consent.checked ? '' : 'Bitte stimme der Verwendung deiner Angaben zu.')
    };
    function check(key, show = true) {
        const msg = rules[key]();
        const wrap = (key === 'consent' ? el.consent : el[key]).closest('.cf-field');
        const out = $('cf-' + key + '-err');
        if (show) { wrap.classList.toggle('invalid', !!msg); out.textContent = msg; (key === 'consent' ? el.consent : el[key]).setAttribute('aria-invalid', msg ? 'true' : 'false'); }
        return msg;
    }
    const keys = ['name', 'email', 'msg', 'consent'];
    keys.forEach((k) => {
        const f = k === 'consent' ? el.consent : el[k];
        f.addEventListener(k === 'consent' ? 'change' : 'input', () => { f.dataset.touched = '1'; if (f.closest('.cf-field').classList.contains('invalid')) check(k); });
    });
    el.email.addEventListener('blur', () => { if (clean(el.email.value)) check('email'); });
    el.name.addEventListener('blur', () => { if (clean(el.name.value)) check('name'); });
    el.msg.addEventListener('blur', () => { if (clean(el.msg.value)) check('msg'); });

    /* ---------- Zähler und Entwurf ---------- */
    let firstInput = 0, draftT = 0;
    const paintCount = () => { el.count.textContent = String(el.msg.value.length).padStart(4, '0'); };
    function saveDraft() {
        clearTimeout(draftT);
        draftT = setTimeout(() => {
            const d = { name: el.name.value, email: el.email.value, msg: el.msg.value, topic: topic() };
            if (d.name || d.email || d.msg) store.set('jb2-draft', d); else store.del('jb2-draft');
        }, 400);
    }
    form.addEventListener('input', () => { if (!firstInput) firstInput = Date.now(); paintCount(); saveDraft(); });
    form.addEventListener('change', saveDraft);
    (function restore() {
        const d = store.get('jb2-draft'); if (!d || typeof d !== 'object') return;
        if (typeof d.name === 'string') el.name.value = d.name.slice(0, 80);
        if (typeof d.email === 'string') el.email.value = d.email.slice(0, 120);
        if (typeof d.msg === 'string') el.msg.value = d.msg.slice(0, 2000);
        const r = form.querySelector(`input[name="topic"][value="${CSS.escape(String(d.topic || ''))}"]`); if (r) r.checked = true;
        paintCount();
    })();

    /* ---------- Status ---------- */
    function say(text, isErr, html) {
        el.status.classList.toggle('error', !!isErr);
        if (html) el.status.innerHTML = html; else el.status.textContent = text || '';
    }
    function mailBody() {
        return `${clean(el.msg.value)}\n\n–\n${clean(el.name.value)}\n${clean(el.email.value)}`;
    }
    function mailtoHref() {
        const subject = `Anfrage (${topic()}) von ${clean(el.name.value)}`;
        let body = mailBody(); if (body.length > 1500) body = body.slice(0, 1500) + ' …';
        return `mailto:${cfg.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body).replace(/%0A/g, '%0D%0A')}`;
    }
    function planeFx() {
        const r = el.send.getBoundingClientRect();
        document.dispatchEvent(new CustomEvent('jb:plane', { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
    }
    function showDone(kind) {
        const warn = kind === 'mail';
        el.done.classList.toggle('warn', warn);
        el.doneTitle.textContent = warn ? 'Fast geschafft' : 'Gesendet';
        el.doneText.textContent = warn
            ? 'Dein Mail-Programm sollte sich mit dem fertigen Text öffnen. Falls nicht, kopiere ihn und schick ihn an ' + cfg.to + '.'
            : 'Danke, ich melde mich so schnell wie möglich.';
        el.copy.hidden = !warn;
        form.hidden = true; el.done.hidden = false; el.done.focus({ preventScroll: true });
        el.done.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    function reset() {
        form.hidden = false; el.done.hidden = true; say('');
        el.send.disabled = false; form.classList.remove('busy');
        el.msg.value = ''; el.consent.checked = false; el.consent.dataset.touched = '';
        paintCount(); firstInput = 0;
        keys.forEach((k) => { const f = k === 'consent' ? el.consent : el[k]; f.closest('.cf-field').classList.remove('invalid'); $('cf-' + k + '-err').textContent = ''; });
        el.msg.focus({ preventScroll: true });
    }
    el.again.addEventListener('click', reset);
    el.copy.addEventListener('click', async () => {
        const txt = `An: ${cfg.to}\nBetreff: Anfrage (${topic()}) von ${clean(el.name.value)}\n\n${mailBody()}`;
        try { await navigator.clipboard.writeText(txt); el.copy.textContent = 'Kopiert'; }
        catch (e) {
            const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select();
            try { document.execCommand('copy'); el.copy.textContent = 'Kopiert'; } catch (err) { el.copy.textContent = 'Nicht möglich'; } t.remove();
        }
        setTimeout(() => { el.copy.textContent = 'Text kopieren'; }, 1800);
    });
    $('cf-privacy').addEventListener('click', () => { const b = $('privacy-open'); if (b) b.click(); });

    /* ---------- Versand ---------- */
    let sending = false;
    async function post() {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), cfg.timeoutMs);
        const payload = {
            access_key: cfg.accessKey,
            subject: `Anfrage (${topic()}) von ${clean(el.name.value)}`,
            from_name: 'julienbernath.ch',
            name: clean(el.name.value), email: clean(el.email.value), replyto: clean(el.email.value),
            thema: topic(), message: clean(el.msg.value), botcheck: el.bot.checked ? 'true' : ''
        };
        try {
            const res = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
            let data = null; try { data = await res.json(); } catch (e) { /* keine JSON-Antwort */ }
            return { ok: res.ok && !!(data && data.success), status: res.status, data };
        } catch (e) {
            return { ok: false, status: 0, aborted: e && e.name === 'AbortError' };
        } finally { clearTimeout(t); }
    }
    function fail(r) {
        form.classList.remove('busy'); el.send.disabled = false; sending = false;
        let why = 'Das hat leider nicht geklappt.';
        if (r.status === 429) why = 'Gerade zu viele Anfragen. Versuch es in einer Minute nochmals.';
        else if (r.aborted) why = 'Der Server antwortet nicht.';
        else if (r.status === 0) why = navigator.onLine === false ? 'Du bist offline.' : 'Keine Verbindung zum Server.';
        say('', true, '');
        el.status.textContent = why + ' ';
        const b = document.createElement('button'); b.type = 'button'; b.className = 'cf-link'; b.textContent = 'Stattdessen per E-Mail senden';
        b.addEventListener('click', () => { location.href = mailtoHref(); showDone('mail'); });
        el.status.appendChild(b);
        el.send.querySelector('.cf-send-label').textContent = 'Nochmals senden';
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); if (sending) return;
        const errs = keys.map((k) => [k, check(k)]).filter((x) => x[1]);
        if (errs.length) {
            const k = errs[0][0]; (k === 'consent' ? el.consent : el[k]).focus();
            say(errs.length === 1 ? errs[0][1] : 'Bitte prüfe die markierten Felder.', true); return;
        }
        // Bot-Fallen: ausgefülltes Lockfeld oder unmenschlich schnell -> stiller Scheinerfolg
        if (el.hp.value || el.bot.checked || (firstInput && Date.now() - firstInput < 1500)) { say(''); showDone('ok'); return; }
        const last = store.get('jb2-lastsend');
        if (last && Date.now() - last < 30000) { say('Bitte warte kurz, bevor du nochmals sendest.', true); return; }

        // Ohne Access Key: Mail-Programm öffnen
        if (!cfg.accessKey) { store.set('jb2-lastsend', Date.now()); planeFx(); location.href = mailtoHref(); showDone('mail'); return; }

        sending = true; el.send.disabled = true; form.classList.add('busy'); say('Wird gesendet …');
        const r = await post();
        if (!r.ok) { fail(r); return; }
        sending = false; store.set('jb2-lastsend', Date.now()); store.del('jb2-draft');
        planeFx(); showDone('ok');
        el.send.querySelector('.cf-send-label').textContent = 'Nachricht senden';
    });

    paintCount();
    window.__cf = { rules, mailtoHref, cfg, topic };
})();
