# WakandaRides x WBB marketing questionnaire

A one page, 73 question form for WakandaRides to record its marketing preferences with WBB (services, deliverables, budgets, engagement terms). Static HTML, no build step.

On submit, the answers are emailed to WBB (hello@webuildbrands.in) with a copy to the respondent. The email is sent by the Google Apps Script in `apps-script/Code.gs`, deployed as a web app by WBB. Put its /exec URL in `SCRIPT_URL` in `index.html`. The form records preferences only and is not a binding agreement.

Live page: https://yourtrulysatish.github.io/wbb-scope-form/
