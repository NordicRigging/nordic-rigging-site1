/**
 * Composes the plain-text body of a contact request. Used both for the JSON
 * payload sent to the form endpoint and for the mailto fallback, so the
 * message reads the same whichever way it arrives.
 */
export function buildMessage(values, f, needLabels) {
  const lines = [
    `${f.fields.who}: ${values.who === 'yard' ? f.whoYard : f.whoPrivate}`,
    `${f.fields.name}: ${values.name}`,
    `${f.fields.phone}: ${values.phone || '-'}`,
    `${f.fields.email}: ${values.email || '-'}`,
    `${values.who === 'yard' ? f.fields.org : f.fields.boat}: ${values.boat || '-'}`,
    `${f.fields.needs}: ${needLabels.length ? needLabels.join(', ') : '-'}`,
    '',
    `${f.fields.message}:`,
    values.message || '-'
  ];
  return lines.join('\n');
}

export function buildSubject(values, f) {
  return `${values.who === 'yard' ? f.subjectYard : f.subjectPrivate} – ${values.name.trim()}`;
}

export function buildMailto(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
