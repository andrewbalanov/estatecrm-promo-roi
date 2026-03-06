import React from 'react'
import './CasesSection.css'

function CasesSection() {
  return (
    <section className="cases-sec">
      <div className="cases-head">
        <h2>Кейсы застройщиков</h2>
        <p>Реальные результаты внедрения EstateCRM</p>
      </div>
      <div className="cases-grid">
        <div className="case c1">
          <div className="cco">Компания RDI</div>
          <div className="cres">Окупаемость за 9 месяцев</div>
          <div className="cttl">Автоматизация продаж и клиентского сервиса</div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">&times;2</span> скорость реакции менеджеров на изменения в заявках</div>
          </div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">+30%</span> эффективность колл-центра</div>
          </div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">&minus;40%</span> время обработки запросов клиентов</div>
          </div>
        </div>

        <div className="case c2">
          <div className="cco">Компания Dream City</div>
          <div className="cres">Элитная недвижимость</div>
          <div className="cttl">Автоматизация продаж элитной недвижимости</div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt">в <span className="cmv">2 раза</span> сократился цикл сделки</div>
          </div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">+14%</span> рост конверсии из лида в сделку</div>
          </div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">40%</span> квартир продано в первую неделю продаж</div>
          </div>
        </div>

        <div className="case c3">
          <div className="cco">Компания Alcon</div>
          <div className="cres">Клиентский сервис</div>
          <div className="cttl">Автоматизация обслуживания клиентов</div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">+20%</span> конверсии из заявки в сделку</div>
          </div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">&minus;40%</span> время обработки запросов</div>
          </div>
          <div className="cm">
            <div className="csep" />
            <div className="cmt"><span className="cmv">100%</span> заявок обрабатывается в срок</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CasesSection
