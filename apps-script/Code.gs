/**
 * WBB x WakandaRides questionnaire mailer.
 * Receives the questionnaire as JSON and sends ONE email to WBB with a copy (cc) to the respondent.
 * Deploy as a Web app: Execute as "Me", Who has access "Anyone".
 */
var TO = 'hello@webuildbrands.in';   // WBB inbox that receives every submission
var MAX_PER_HOUR = 30;               // simple protection against abuse

function doGet() { return out({ ok: true, service: 'WBB questionnaire mailer' }); }

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > 90000) return out({ ok: false, error: 'too large' });
    var d = JSON.parse(raw);
    if (d.hp) return out({ ok: true });                       // honeypot: bots fill this

    var cc = String(d.cc || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cc)) return out({ ok: false, error: 'invalid email' });

    var cache = CacheService.getScriptCache();
    var key = 'n' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
    var n = Number(cache.get(key) || 0);
    if (n >= MAX_PER_HOUR) return out({ ok: false, error: 'busy, try again later' });
    cache.put(key, String(n + 1), 3700);

    var ref = String(d.ref || '').slice(0, 40);
    var name = String(d.name || '').slice(0, 120);
    var fields = (d.fields || []).slice(0, 200);

    var rows = fields.map(function (f) {
      return '<tr><td style="padding:9px 12px;border:1px solid #e3e1da;vertical-align:top;width:38%;background:#f6f5f1"><b>' + esc(f[0]) + '</b></td>' +
             '<td style="padding:9px 12px;border:1px solid #e3e1da;vertical-align:top">' + esc(f[1]).replace(/\n/g, '<br>') + '</td></tr>';
    }).join('');
    var html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:760px">' +
      '<h2 style="margin:0 0 4px">WakandaRides x WBB marketing questionnaire</h2>' +
      '<p style="margin:0 0 16px;color:#555">Reference ' + esc(ref) + '. Submitted by ' + esc(name) + ' (' + esc(cc) + ').</p>' +
      '<table style="border-collapse:collapse;width:100%">' + rows + '</table>' +
      '<p style="color:#555;margin-top:16px">This records preferences only and is not a binding agreement.</p></div>';
    var text = 'WakandaRides x WBB marketing questionnaire\nReference: ' + ref + '\nSubmitted by: ' + name + ' (' + cc + ')\n\n' +
      fields.map(function (f) { return f[0] + '\n   ' + f[1]; }).join('\n\n');

    MailApp.sendEmail({
      to: TO,
      cc: cc,
      replyTo: cc,
      subject: 'WakandaRides x WBB questionnaire from ' + name + ' (' + ref + ')',
      body: text,
      htmlBody: html,
      name: 'WBB Questionnaire'
    });
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
