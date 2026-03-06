import React, { useState, useEffect, useRef, useCallback } from 'react'
import { DEFAULTS, SCENARIOS, getTariff, compute, fmt, sc2str, buildTableRows } from '../utils/calculator'
import { TIPS } from '../utils/tooltips'
import './Calculator.css'

function Calculator({ onOpenForm, onCalcDone }) {
  const [inputs, setInputs] = useState({ ...DEFAULTS })
  const [calculated, setCalculated] = useState(false)
  const [results, setResults] = useState(null)
  const [showPdf, setShowPdf] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const resultsRef = useRef(null)
  const tipBoxRef = useRef(null)
  const activeIconRef = useRef(null)
  const hideTimerRef = useRef(null)

  const tariff = getTariff(inputs.num_zhk, inputs.num_users)
  const totalInvest = tariff.impl + tariff.lic + tariff.sup + tariff.int

  const revenue = inputs.deals_cur * inputs.avg_deal
  const profit = revenue * inputs.margin / 100
  const lostLeads = Math.max(0, inputs.leads - inputs.proc_leads)

  const handleInput = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const runCalc = useCallback((company) => {
    const C = compute(inputs, SCENARIOS.c)
    const B = compute(inputs, SCENARIOS.b)
    const O = compute(inputs, SCENARIOS.o)
    const rows = buildTableRows(inputs, C, B, O)
    setResults({ C, B, O, rows })
    setCalculated(true)
    setShowPdf(true)
    if (company) setCompanyName(company)
    if (onCalcDone) onCalcDone()
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 120)
  }, [inputs])

  const handleCalculate = () => {
    if (calculated) {
      runCalc(companyName)
    } else {
      onOpenForm(runCalc)
    }
  }

  const doReset = () => {
    setInputs({ ...DEFAULTS })
    setCalculated(false)
    setResults(null)
    setShowPdf(false)
    setCompanyName('')
  }

  const doPDF = () => {
    if (!calculated) {
      alert('Сначала нажмите «Рассчитать», чтобы сформировать отчёт')
      return
    }
    window.print()
  }

  const fillPct = (value, min, max) => {
    return ((value - min) / (max - min) * 100).toFixed(1) + '%'
  }

  // Tooltip system
  useEffect(() => {
    const box = document.createElement('div')
    box.className = 'tip-box'
    box.id = 'tip-box'
    document.body.appendChild(box)
    tipBoxRef.current = box

    const showTip = (icon) => {
      clearTimeout(hideTimerRef.current)
      const key = icon.dataset.tip
      const data = TIPS[key]
      if (!data) return

      const card = icon.closest('.scc')
      let scen = 'all'
      if (card) {
        if (card.classList.contains('s-cons')) scen = 'c'
        else if (card.classList.contains('s-base')) scen = 'b'
        else if (card.classList.contains('s-opt')) scen = 'o'
      }

      let html = `<div class="tip-box-title">${data.title}</div>`
      const labelClass = { c: 'tip-s-cons', b: 'tip-s-base', o: 'tip-s-opt' }

      if (scen === 'c' || scen === 'b' || scen === 'o') {
        const sd = data[scen]
        if (sd) html += `<div class="tip-scenario"><div class="tip-s-text">${sd.text}</div></div>`
      } else {
        ['c', 'b', 'o'].forEach(s => {
          const sd = data[s]
          if (!sd) return
          html += `<div class="tip-scenario"><div class="tip-s-label ${labelClass[s]}">${sd.label}</div><div class="tip-s-text">${sd.text}</div></div>`
        })
      }

      box.innerHTML = html
      box.style.visibility = 'hidden'
      box.style.top = '0px'
      box.style.left = '0px'
      box.classList.add('tip-active')

      const rect = icon.getBoundingClientRect()
      const boxH = box.offsetHeight
      const boxW = box.offsetWidth || 300
      const vw = window.innerWidth
      const vh = window.innerHeight

      const spaceBelow = vh - rect.bottom
      let top = (spaceBelow >= boxH + 10 || spaceBelow >= rect.top) ? rect.bottom + 6 : rect.top - boxH - 6
      let left = rect.left + rect.width / 2 - boxW / 2
      if (left < 8) left = 8
      if (left + boxW > vw - 8) left = vw - boxW - 8
      if (top < 8) top = 8

      box.style.top = top + 'px'
      box.style.left = left + 'px'
      box.style.visibility = 'visible'
      activeIconRef.current = icon
    }

    const hideTip = () => {
      hideTimerRef.current = setTimeout(() => {
        box.classList.remove('tip-active')
        activeIconRef.current = null
      }, 120)
    }

    const onMouseOver = (e) => {
      const icon = e.target.closest('.tip-icon')
      if (icon) { showTip(icon); return }
      if (e.target.closest('#tip-box')) { clearTimeout(hideTimerRef.current); return }
    }
    const onMouseOut = (e) => {
      const icon = e.target.closest('.tip-icon')
      const tipBox = e.target.closest('#tip-box')
      if (icon || tipBox) hideTip()
    }
    const onClick = (e) => {
      const icon = e.target.closest('.tip-icon')
      if (icon) {
        e.stopPropagation()
        if (activeIconRef.current === icon && box.classList.contains('tip-active')) {
          box.classList.remove('tip-active')
          activeIconRef.current = null
        } else {
          showTip(icon)
        }
        return
      }
      if (!e.target.closest('#tip-box')) {
        box.classList.remove('tip-active')
        activeIconRef.current = null
      }
    }

    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('click', onClick)
      if (box.parentNode) box.parentNode.removeChild(box)
    }
  }, [])

  const TipIcon = ({ tipKey }) => (
    <span className="tip-icon" data-tip={tipKey}>?</span>
  )

  const ScenarioLine = ({ label, tipKey, value }) => (
    <div className="sl">
      <span className="tip-wrap">{label}<TipIcon tipKey={tipKey} /></span>
      <span>{value}</span>
    </div>
  )

  const renderScenario = (key, label, data) => {
    const clsMap = { c: 's-cons', b: 's-base', o: 's-opt' }
    if (!data) {
      return (
        <div className={`scc ${clsMap[key]}`}>
          <div className="stag">{label}</div>
          <div className="sroi">{'\u2014'}</div>
          <div className="spb">{'Окупаемость: \u2014'}</div>
          <div className="sdiv" />
          <ScenarioLine label="Прирост сделок" tipKey="deals" value={'\u2014'} />
          <ScenarioLine label="Прирост выручки" tipKey="revenue" value={'\u2014'} />
          <ScenarioLine label="Прирост прибыли/мес" tipKey="profit_m" value={'\u2014'} />
          <ScenarioLine label="Прирост прибыли/год" tipKey="profit_y" value={'\u2014'} />
          <ScenarioLine label="Эффект в 1-й год" tipKey="effect1y" value={'\u2014'} />
          <div className="sdiv" style={{ marginTop: 6 }} />
          <ScenarioLine label="Фин. эффект (год)" tipKey="fin_eff" value={'\u2014'} />
          <ScenarioLine label="ROI (год 1)" tipKey="roi" value={'\u2014'} />
          <ScenarioLine label="Окупаемость" tipKey="payback" value={'\u2014'} />
          <ScenarioLine label="Чистая прибыль" tipKey="net_profit" value={'\u2014'} />
        </div>
      )
    }
    return (
      <div className={`scc ${clsMap[key]}`}>
        <div className="stag">{label}</div>
        <div className="sroi">{data.roi.toFixed(0)}%</div>
        <div className="spb">Окупаемость: {sc2str(data.pb)}</div>
        <div className="sdiv" />
        <ScenarioLine label="Прирост сделок" tipKey="deals" value={'+' + data.dd.toFixed(1) + ' шт.'} />
        <ScenarioLine label="Прирост выручки" tipKey="revenue" value={'+' + fmt(data.dr)} />
        <ScenarioLine label="Прирост прибыли/мес" tipKey="profit_m" value={'+' + fmt(data.dp)} />
        <ScenarioLine label="Прирост прибыли/год" tipKey="profit_y" value={'+' + fmt(data.dpY)} />
        <ScenarioLine label="Эффект в 1-й год" tipKey="effect1y" value={fmt(data.net)} />
        <div className="sdiv" style={{ marginTop: 6 }} />
        <ScenarioLine label="Фин. эффект (год)" tipKey="fin_eff" value={fmt(data.fin)} />
        <ScenarioLine label="ROI (год 1)" tipKey="roi" value={data.roi.toFixed(0) + '%'} />
        <ScenarioLine label="Окупаемость" tipKey="payback" value={sc2str(data.pb)} />
        <ScenarioLine label="Чистая прибыль" tipKey="net_profit" value={fmt(data.net)} />
      </div>
    )
  }

  const B = results?.B
  const printDate = new Date().toLocaleDateString('ru-RU')

  return (
    <div className="calc-wrap">
      {/* LEFT PANEL */}
      <aside className="panel-in">
        {/* Group 1: Текущие показатели */}
        <div className="gc">
          <div className="gtitle">Текущие показатели</div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">Лидов в месяц</span>
            </div>
            <div className="nw">
              <input type="number" value={inputs.leads} min={1} max={50000} step={10}
                onChange={e => handleInput('leads', +e.target.value || 0)} />
              <span className="nu">лид/мес</span>
            </div>
          </div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">Конверсия из лида в сделку</span>
              <span className="badge">{inputs.conv.toFixed(1)}%</span>
            </div>
            <input type="range" min={0.1} max={20} step={0.1} value={inputs.conv}
              style={{ '--pct': fillPct(inputs.conv, 0.1, 20) }}
              onChange={e => handleInput('conv', +e.target.value)} />
          </div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">% потерь лидов</span>
              <span className="badge">{inputs.loss.toFixed(0)}%</span>
            </div>
            <input type="range" min={0} max={80} step={1} value={inputs.loss}
              style={{ '--pct': fillPct(inputs.loss, 0, 80) }}
              onChange={e => handleInput('loss', +e.target.value)} />
          </div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">Менеджеров в отделе</span>
            </div>
            <div className="nw">
              <input type="number" value={inputs.managers} min={1} max={500} step={1}
                onChange={e => handleInput('managers', +e.target.value || 0)} />
              <span className="nu">чел.</span>
            </div>
          </div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">Средний чек</span>
            </div>
            <div className="nw">
              <input type="number" value={inputs.avg_deal} min={0.1} max={500} step={0.1}
                onChange={e => handleInput('avg_deal', +e.target.value || 0)} />
              <span className="nu">млн &#8381;</span>
            </div>
          </div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">Зарплата менеджера</span>
            </div>
            <div className="nw">
              <input type="number" value={inputs.salary} min={10} max={1000} step={10}
                onChange={e => handleInput('salary', +e.target.value || 0)} />
              <span className="nu">тыс. &#8381;/мес</span>
            </div>
          </div>

          <div className="ir">
            <div className="rt">
              <span className="lbl">Маржинальность</span>
              <span className="badge">{inputs.margin.toFixed(1)}%</span>
            </div>
            <input type="range" min={0.5} max={50} step={0.5} value={inputs.margin}
              style={{ '--pct': fillPct(inputs.margin, 0.5, 50) }}
              onChange={e => handleInput('margin', +e.target.value)} />
          </div>
        </div>

        {/* Group 2: Показатели отдела продаж */}
        <div className="gc">
          <div className="gtitle">Показатели отдела продаж</div>

          <div className="ir">
            <div className="rt"><span className="lbl">Обработано лидов</span></div>
            <div className="nw">
              <input type="number" value={inputs.proc_leads} min={0} max={50000} step={10}
                onChange={e => handleInput('proc_leads', +e.target.value || 0)} />
              <span className="nu">чел./мес</span>
            </div>
          </div>

          <div className="ir">
            <div className="rt"><span className="lbl">Сделки</span></div>
            <div className="nw">
              <input type="number" value={inputs.deals_cur} min={0} max={10000} step={1}
                onChange={e => handleInput('deals_cur', +e.target.value || 0)} />
              <span className="nu">шт./мес</span>
            </div>
          </div>

          <div className="ir">
            <div className="af">
              <div>
                <span className="afv">{revenue.toFixed(2)}</span>
                <span className="afu"> млн &#8381;/мес</span>
              </div>
              <span className="lbl">Выручка</span>
            </div>
            <div className="albl">Средний чек × сделки</div>
          </div>

          <div className="ir">
            <div className="af">
              <div>
                <span className="afv">{profit.toFixed(2)}</span>
                <span className="afu"> млн &#8381;/мес</span>
              </div>
              <span className="lbl">Прибыль</span>
            </div>
            <div className="albl">Выручка × маржинальность</div>
          </div>

          <div className="ir">
            <div className="rt"><span className="lbl">ФОТ отдела продаж</span></div>
            <div className="nw">
              <input type="number" value={inputs.fot} min={0} max={1000} step={0.1}
                onChange={e => handleInput('fot', +e.target.value || 0)} />
              <span className="nu">млн &#8381;/мес</span>
            </div>
          </div>

          <div className="ir">
            <div className="af">
              <div>
                <span className="afv">{lostLeads.toFixed(0)}</span>
                <span className="afu"> шт./мес</span>
              </div>
              <span className="lbl">Потеряно лидов</span>
            </div>
            <div className="albl">Лиды − обработано</div>
          </div>
        </div>

        {/* Group 3: Объём ввода жилья */}
        <div className="gc">
          <div className="gtitle">Объём ввода жилья</div>

          <div className="ir">
            <div className="rt"><span className="lbl">С каким количеством ЖК планируете начать работу в CRM?</span></div>
            <div className="nw">
              <input type="number" value={inputs.num_zhk} min={1} max={500} step={1}
                onChange={e => handleInput('num_zhk', +e.target.value || 0)} />
              <span className="nu">шт.</span>
            </div>
          </div>

          <div className="ir">
            <div className="rt"><span className="lbl">Количество пользователей в CRM</span></div>
            <div className="nw">
              <input type="number" value={inputs.num_users} min={1} max={1000} step={1}
                onChange={e => handleInput('num_users', +e.target.value || 0)} />
              <span className="nu">чел.</span>
            </div>
          </div>
        </div>

        {/* Group 4: Стоимость CRM */}
        <div className="gc">
          <div className="gtitle">Стоимость CRM</div>
          <p style={{ fontSize: 11, color: 'var(--g5)', marginBottom: 10 }}>
            Тарифный план определяется автоматически по количеству ЖК и пользователей
          </p>

          <div className="ir">
            <div className="ccr">
              <span className="cl">Тарифный план</span>
              <span className="cv" style={{ color: 'var(--primary)' }}>{tariff.name}</span>
            </div>
          </div>
          <div className="ir">
            <div className="ccr">
              <span className="cl">Внедрение (разово)</span>
              <span><span className="cv">{tariff.impl.toFixed(1)}</span><span className="cu"> млн &#8381;</span></span>
            </div>
          </div>
          <div className="ir">
            <div className="ccr">
              <span className="cl">Лицензия (1 год)</span>
              <span><span className="cv">{tariff.lic.toFixed(1)}</span><span className="cu"> млн &#8381;</span></span>
            </div>
          </div>
          <div className="ir">
            <div className="ccr">
              <span className="cl">Техподдержка (1 год)</span>
              <span><span className="cv">{tariff.sup.toFixed(1)}</span><span className="cu"> млн &#8381;</span></span>
            </div>
          </div>
          <div className="ir">
            <div className="ccr">
              <span className="cl">Интеграции</span>
              <span><span className="cv">{tariff.int.toFixed(1)}</span><span className="cu"> млн &#8381;</span></span>
            </div>
          </div>
          <div className="ir">
            <div className="trow">
              <span className="tl">Итого инвестиций (1-й год)</span>
              <span className="tv">{totalInvest.toFixed(1)} млн &#8381;</span>
            </div>
          </div>
          <div className="ir">
            <div className="ccr">
              <span className="cl">Ежегодные расходы со 2 года</span>
              <span><span className="cv">{tariff.ann.toFixed(1)}</span><span className="cu"> млн &#8381;</span></span>
            </div>
          </div>
        </div>

        {/* Group 5: Период внедрения */}
        <div className="gc">
          <div className="gtitle">Период внедрения</div>
          <div className="pdisp">
            <span className="pv">90 дней</span>
            <span className="plbl">Срок внедрения и обучения команды. В этот период CRM не используется в полном объёме</span>
          </div>
          <div className="albl" style={{ marginTop: 6 }}>Срок окупаемости рассчитывается от даты покупки</div>
        </div>

        {/* Buttons */}
        <div className="btns">
          {!calculated && (
            <div className="hint">Нажмите «Рассчитать», чтобы увидеть результаты</div>
          )}
          <button className="btn-calc" onClick={handleCalculate}>{calculated ? 'Пересчитать' : 'Рассчитать'}</button>
          <button className="btn-reset" onClick={doReset}>{'\u21A9'} Сбросить к значениям по умолчанию</button>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="panel-res" ref={resultsRef}>
        {/* Print header */}
        <div className="ph">
          <strong style={{ color: 'var(--primary)' }}>Расчёт ROI · EstateCRM</strong>
          <span className="pm">Дата: {printDate} · Компания: {companyName || '\u2014'}</span>
        </div>

        {/* KPI */}
        <div>
          <div className="sec-h"><h3>Ключевые показатели эффективности</h3></div>
          <div className={`kpi-strip ${calculated ? 'ready anim' : 'pending'}`}>
            <div className="kc" style={{ '--ac': 'var(--secondary)' }}>
              <div className="klbl">Прирост сделок/мес</div>
              <div className="kv" style={{ color: 'var(--secondary)' }}>
                {B ? '+' + B.dd.toFixed(1) : '\u2014'}
              </div>
              <div className="ks">
                {B ? `Было ${B.deals0.toFixed(1)} \u2192 стало ${B.deals1.toFixed(1)}` : 'Нажмите «Рассчитать»'}
              </div>
            </div>
            <div className="kc" style={{ '--ac': 'var(--gd)' }}>
              <div className="klbl">Прирост прибыли/мес</div>
              <div className="kv" style={{ color: 'var(--gd)' }}>
                {B ? '+' + fmt(B.dp) : '\u2014'}
              </div>
              <div className="ks">млн &#8381;</div>
            </div>
            <div className="kc" style={{ '--ac': 'var(--orange)' }}>
              <div className="klbl">ROI (1-й год)</div>
              <div className="kv" style={{ color: 'var(--orange)' }}>
                {B ? B.roi.toFixed(0) + '%' : '\u2014'}
              </div>
              <div className="ks">Базовый сценарий</div>
            </div>
            <div className="kc" style={{ '--ac': 'var(--td)' }}>
              <div className="klbl">Окупаемость</div>
              <div className="kv" style={{ color: 'var(--td)' }}>
                {B ? sc2str(B.pb) : '\u2014'}
              </div>
              <div className="ks">С учётом внедрения</div>
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div>
          <div className="sec-h"><h3>Три сценария расчёта</h3></div>
          <div className={`sc-grid ${calculated ? 'ready anim' : 'pending'}`}>
            {renderScenario('c', 'Консервативный', results?.C)}
            {renderScenario('b', 'Базовый', results?.B)}
            {renderScenario('o', 'Оптимистичный', results?.O)}
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="sec-h"><h3>Детальный расчёт</h3></div>
          <div className={`tw ${calculated ? 'ready anim' : 'pending'}`}>
            <div className="th">
              <h3>Финансовая модель · 1-й год</h3>
              <span>{B ? `Период внедрения: 90 дней · Рабочих месяцев: ${B.wm}` : 'Период внедрения: 90 дней'}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Показатель</th>
                  <th style={{ color: 'var(--g6)' }}>Сейчас</th>
                  <th style={{ color: 'var(--gd)' }}>Консерв.</th>
                  <th style={{ color: 'var(--secondary)' }}>Базовый</th>
                  <th style={{ color: 'var(--orange)' }}>Оптимист.</th>
                </tr>
              </thead>
              <tbody>
                {results ? results.rows.map((r, i) => {
                  if (r.s) return <tr key={i} className="rsec"><td colSpan={5}>{r.s}</td></tr>
                  const tc = r.tot ? 'rt2' : ''
                  const [cc, bc, oc] = r.pos ? ['cc', 'cb', 'co'] : r.neg ? ['cneg', 'cneg', 'cneg'] : ['', '', '']
                  return (
                    <tr key={i} className={tc}>
                      <td>{r.l}</td>
                      <td className="cn">{r.n}</td>
                      <td className={cc}>{r.c}</td>
                      <td className={bc}>{r.b}</td>
                      <td className={oc}>{r.o}</td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--g5)', padding: 22 }}>
                      Нажмите «Рассчитать», чтобы увидеть таблицу
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PDF button */}
        {showPdf && (
          <div className="pdf-btn-wrap" style={{ display: 'block' }}>
            <button className="pdf-btn" onClick={doPDF}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v10M8 11l-3-3M8 11l3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Скачать отчёт в PDF
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Calculator
