# LinkedIn Post Draft

---

**Bilingual Angular apps break in ways your tests won't catch.**

A missing Arabic translation key silently shows the raw key string. A German label is 40% longer and truncates inside a button. A developer hardcodes "Save" instead of using the translate pipe. Nobody notices until a user reports it.

I built **ngx-i18n-guardrails** to catch these issues at dev time:

- **Pseudo-localization** — accents every string, expands by 40%, wraps in brackets. Hardcoded text stands out instantly in the browser, and you can see exactly which buttons will truncate in longer languages.

- **Cross-locale parity checker** — compares every locale file and reports missing keys, empty values, and zombies. Exits non-zero for CI gating.

- **Hardcoded string scanner** — finds literal user-facing text in Angular templates that bypasses the translate pipe.

Zero dependencies. Works with any ngx-translate project. One `npx` command.

I've been maintaining a bilingual Arabic/English enterprise app and these three checks would have caught every i18n bug we shipped in the last year. So I extracted them into a reusable open-source tool.

If you're working on multilingual Angular apps, give it a try and let me know what you think.

#Angular #i18n #OpenSource #ngxTranslate #RTL #FrontendDev #Localization

---

> **Note:** Put the repo link in the first comment, not in the post body (LinkedIn algorithm penalizes external links in the post). Post the link as a comment immediately after publishing.
