export const IMPL_M = 3

export const SCENARIOS = {
  c: { conv_add: 0.5, loss_cut: 0.30 },
  b: { conv_add: 1.0, loss_cut: 0.50 },
  o: { conv_add: 2.0, loss_cut: 0.65 },
}

export const DEFAULTS = {
  leads: 500,
  conv: 3,
  loss: 30,
  managers: 10,
  avg_deal: 8,
  salary: 120,
  margin: 7,
  proc_leads: 350,
  deals_cur: 15,
  fot: 1.2,
  num_zhk: 3,
  num_users: 4,
}

export function getTariff(zhk, users) {
  if (zhk <= 5 && users < 5) return { name: 'Старт', impl: 1.0, lic: 1.0, sup: 0.5, int: 0.2, ann: 1.7 }
  if (zhk >= 5 && users >= 5 && users <= 9) return { name: 'Базовый', impl: 3.0, lic: 1.0, sup: 0.5, int: 0.2, ann: 1.7 }
  if (zhk >= 5 && users >= 10 && users <= 14) return { name: 'Стандарт', impl: 4.0, lic: 1.0, sup: 0.5, int: 0.2, ann: 1.7 }
  return { name: 'Про', impl: 5.0, lic: 1.0, sup: 0.5, int: 0.2, ann: 1.7 }
}

export function compute(inputs, scenario) {
  const { leads, conv, loss, avg_deal, margin, num_zhk, num_users } = inputs
  const t = getTariff(num_zhk, num_users)
  const inv = t.impl + t.lic + t.sup + t.int

  const eff0 = leads * (1 - loss / 100)
  const deals0 = eff0 * conv / 100
  const rev0 = deals0 * avg_deal
  const prof0 = rev0 * margin / 100

  const nl = loss * (1 - scenario.loss_cut)
  const nc = conv + scenario.conv_add
  const eff1 = leads * (1 - nl / 100)
  const deals1 = eff1 * nc / 100
  const rev1 = deals1 * avg_deal
  const prof1 = rev1 * margin / 100

  const dd = deals1 - deals0
  const dr = rev1 - rev0
  const dp = prof1 - prof0
  const wm = Math.max(0, 12 - IMPL_M)
  const dpY = dp * wm
  const fin = dpY
  const net = fin - inv
  const roi = inv > 0 ? (fin - inv) / inv * 100 : 0
  const pb = IMPL_M + (dp > 0 ? inv / dp : 999)

  return { nc, nl, deals0, deals1, dd, rev0, rev1, dr, prof0, prof1, dp, dpY, fin, net, roi, pb, inv, wm }
}

export function fmt(v, d = 2) {
  return v.toFixed(d) + ' млн \u20BD'
}

export function sc2str(v) {
  return v < 120 ? v.toFixed(1) + ' мес.' : '>10 лет'
}

export function buildTableRows(inputs, C, B, O) {
  const { leads, conv, loss } = inputs
  return [
    { s: 'Воронка лидов' },
    { l: 'Лидов всего/мес', n: leads.toFixed(0), c: leads.toFixed(0), b: leads.toFixed(0), o: leads.toFixed(0) },
    { l: '% потерь лидов', n: loss.toFixed(0) + '%', c: C.nl.toFixed(1) + '%', b: B.nl.toFixed(1) + '%', o: O.nl.toFixed(1) + '%', neg: 1 },
    { l: 'Конверсия лид\u2192сделка', n: conv.toFixed(1) + '%', c: C.nc.toFixed(1) + '%', b: B.nc.toFixed(1) + '%', o: O.nc.toFixed(1) + '%', pos: 1 },
    { s: 'Продажи (месяц)' },
    { l: 'Сделок/мес', n: B.deals0.toFixed(1), c: C.deals1.toFixed(1), b: B.deals1.toFixed(1), o: O.deals1.toFixed(1), pos: 1 },
    { l: 'Прирост сделок/мес', n: '0', c: '+' + C.dd.toFixed(1), b: '+' + B.dd.toFixed(1), o: '+' + O.dd.toFixed(1), pos: 1 },
    { l: 'Выручка/мес, млн \u20BD', n: B.rev0.toFixed(2), c: C.rev1.toFixed(2), b: B.rev1.toFixed(2), o: O.rev1.toFixed(2), pos: 1 },
    { l: 'Прирост выручки/мес', n: '0', c: '+' + fmt(C.dr), b: '+' + fmt(B.dr), o: '+' + fmt(O.dr), pos: 1 },
    { l: 'Прибыль/мес, млн \u20BD', n: B.prof0.toFixed(2), c: C.prof1.toFixed(2), b: B.prof1.toFixed(2), o: O.prof1.toFixed(2), pos: 1 },
    { l: 'Прирост прибыли/мес', n: '0', c: '+' + fmt(C.dp), b: '+' + fmt(B.dp), o: '+' + fmt(O.dp), pos: 1 },
    { s: 'Финансовый эффект \u00B7 1-й год (' + B.wm + ' рабочих мес.)' },
    { l: 'Инвестиции (год 1)', n: '\u2014', c: fmt(C.inv), b: fmt(B.inv), o: fmt(O.inv) },
    { l: 'Прирост прибыли за год', n: '0', c: '+' + fmt(C.dpY), b: '+' + fmt(B.dpY), o: '+' + fmt(O.dpY), pos: 1 },
    { l: 'Финансовый эффект', n: '\u2014', c: fmt(C.fin), b: fmt(B.fin), o: fmt(O.fin), pos: 1 },
    { l: 'ROI (год 1)', n: '\u2014', c: C.roi.toFixed(0) + '%', b: B.roi.toFixed(0) + '%', o: O.roi.toFixed(0) + '%', pos: 1, tot: 1 },
    { l: 'Срок окупаемости', n: '\u2014', c: sc2str(C.pb), b: sc2str(B.pb), o: sc2str(O.pb) },
    { l: 'Чистая прибыль (год 1)', n: '\u2014', c: fmt(C.net), b: fmt(B.net), o: fmt(O.net), pos: 1, tot: 1 },
  ]
}
