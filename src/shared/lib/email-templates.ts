export type EmailTemplate = {
  subject: string;
  html: string;
};

const BRAND_HEADER = `<div style="background: linear-gradient(135deg, #1D6FAB, #0E9AAA); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
  <h1 style="color: white; font-family: Rubik, sans-serif; font-size: 20px; margin: 0;">RiskGuard</h1>
</div>`;

const WRAPPER = (content: string) => `<div dir="rtl" style="font-family: Assistant, Rubik, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #CBD5E1; border-radius: 12px; overflow: hidden;">
  ${BRAND_HEADER}
  <div style="padding: 24px; background: white;">${content}</div>
  <div style="padding: 12px 24px; background: #F5F7FA; font-size: 11px; color: #64748B; text-align: center;">
    RiskGuard \u2014 \u05E0\u05D9\u05D4\u05D5\u05DC \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05D7\u05DB\u05DD
  </div>
</div>`;

export function taskAssignedEmail(title: string, assigneeName: string): EmailTemplate {
  return {
    subject: `\u05D4\u05D5\u05E7\u05E6\u05EA\u05D4 \u05DC\u05DA \u05DE\u05E9\u05D9\u05DE\u05D4 \u05D7\u05D3\u05E9\u05D4: ${title}`,
    html: WRAPPER(`<p>\u05E9\u05DC\u05D5\u05DD ${assigneeName},</p><p>\u05D4\u05D5\u05E7\u05E6\u05EA\u05D4 \u05DC\u05DA \u05DE\u05E9\u05D9\u05DE\u05D4 \u05D7\u05D3\u05E9\u05D4:</p><div style="background: #F5F7FA; padding: 16px; border-radius: 8px; margin: 16px 0;"><strong>${title}</strong></div><p>\u05D4\u05D9\u05DB\u05E0\u05E1 \u05DC\u05DE\u05E2\u05E8\u05DB\u05EA RiskGuard \u05DC\u05E4\u05E8\u05D8\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD.</p>`),
  };
}

export function taskOverdueEmail(title: string, dueDate: string): EmailTemplate {
  return {
    subject: `\u05DE\u05E9\u05D9\u05DE\u05D4 \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8: ${title}`,
    html: WRAPPER(`<p>\u05D4\u05DE\u05E9\u05D9\u05DE\u05D4 \u05D4\u05D1\u05D0\u05D4 \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8:</p><div style="background: #FEE2E2; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #DC2626;"><strong>${title}</strong><br/><span style="color: #DC2626;">\u05EA\u05D0\u05E8\u05D9\u05DA \u05D9\u05E2\u05D3: ${dueDate}</span></div><p>\u05E0\u05D0 \u05DC\u05D8\u05E4\u05DC \u05D1\u05D4\u05E7\u05D3\u05DD.</p>`),
  };
}

export function documentPendingEmail(docTitle: string, reviewerName: string): EmailTemplate {
  return {
    subject: `\u05DE\u05E1\u05DE\u05DA \u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8\u05DA: ${docTitle}`,
    html: WRAPPER(`<p>\u05E9\u05DC\u05D5\u05DD ${reviewerName},</p><p>\u05DE\u05E1\u05DE\u05DA \u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8\u05DA:</p><div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #D97706;"><strong>${docTitle}</strong></div>`),
  };
}

export function boardMeetingReminderEmail(meetingType: string, date: string): EmailTemplate {
  return {
    subject: `\u05EA\u05D6\u05DB\u05D5\u05E8\u05EA: ${meetingType} \u05D1-${date}`,
    html: WRAPPER(`<p>\u05EA\u05D6\u05DB\u05D5\u05E8\u05EA \u05DC\u05D9\u05E9\u05D9\u05D1\u05D4 \u05E7\u05E8\u05D5\u05D1\u05D4:</p><div style="background: #E0F2FE; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #1D6FAB;"><strong>${meetingType}</strong><br/>\u05EA\u05D0\u05E8\u05D9\u05DA: ${date}</div>`),
  };
}

export function kriBreachEmail(kriName: string, currentValue: string): EmailTemplate {
  return {
    subject: `\u05D4\u05EA\u05E8\u05D0\u05D4: \u05DE\u05D3\u05D3 ${kriName} \u05D7\u05E8\u05D2 \u05DE\u05E1\u05E3`,
    html: WRAPPER(`<p>\u05DE\u05D3\u05D3 \u05E1\u05D9\u05DB\u05D5\u05DF \u05D7\u05E8\u05D2 \u05DE\u05D4\u05E1\u05E3 \u05D4\u05DE\u05D5\u05EA\u05E8:</p><div style="background: #FEE2E2; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #DC2626;"><strong>${kriName}</strong><br/>\u05E2\u05E8\u05DA \u05E0\u05D5\u05DB\u05D7\u05D9: ${currentValue}</div><p>\u05E0\u05D3\u05E8\u05E9\u05EA \u05D1\u05D3\u05D9\u05E7\u05D4 \u05DE\u05D9\u05D9\u05D3\u05D9\u05EA.</p>`),
  };
}

export function reportReadyEmail(reportName: string): EmailTemplate {
  return {
    subject: `\u05D3\u05D5\u05D7 ${reportName} \u05DE\u05D5\u05DB\u05DF \u05DC\u05E1\u05E7\u05D9\u05E8\u05D4`,
    html: WRAPPER(`<p>\u05D3\u05D5\u05D7 \u05D7\u05D3\u05E9 \u05DE\u05D5\u05DB\u05DF \u05DC\u05E1\u05E7\u05D9\u05E8\u05D4:</p><div style="background: #DCFCE7; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #16A34A;"><strong>${reportName}</strong></div>`),
  };
}
