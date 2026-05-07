(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={currentDate:new Date,selectedDate:new Date,family:[{name:`Mom`,initial:`M`,color:`rose`},{name:`Dad`,initial:`D`,color:`blue`},{name:`Ava`,initial:`A`,color:`yellow`},{name:`Leo`,initial:`L`,color:`green`}],events:[{date:t(0),title:`Piano lesson`,time:`4:00 PM`,person:`Ava`,type:`activity`},{date:t(0),title:`Taco night`,time:`6:00 PM`,person:`Family`,type:`meal`},{date:t(1),title:`Library books due`,time:`All day`,person:`Family`,type:`reminder`},{date:t(2),title:`Soccer practice`,time:`5:30 PM`,person:`Leo`,type:`activity`}],chores:[{title:`Feed the dog`,assignee:`Leo`,done:!1},{title:`Clear table`,assignee:`Ava`,done:!0},{title:`Pack lunches`,assignee:`Mom`,done:!1}],meals:[{day:`Mon`,meal:`Chicken bowls`},{day:`Tue`,meal:`Pasta night`},{day:`Wed`,meal:`Breakfast for dinner`},{day:`Thu`,meal:`Slow cooker soup`},{day:`Fri`,meal:`Pizza + movie`}],groceries:[`Milk`,`Strawberries`,`Bread`,`Granola bars`]};function t(e){let t=new Date;return t.setDate(t.getDate()+e),n(t)}function n(e){return e.toISOString().slice(0,10)}function r(e,t){return n(e)===n(t)}function i(e){return e.toLocaleDateString(void 0,{month:`long`,year:`numeric`})}function a(e){let t=e.getFullYear(),n=e.getMonth(),r=new Date(t,n,1),i=new Date(r);return i.setDate(r.getDate()-r.getDay()),Array.from({length:42},(e,t)=>{let n=new Date(i);return n.setDate(i.getDate()+t),n})}function o(t){return e.events.filter(e=>e.date===n(t))}function s(){let t=o(e.selectedDate);return t.length?t.map(e=>`
    <div class="agenda-card ${e.type}">
      <div class="time-badge">${e.time||`Anytime`}</div>
      <div>
        <strong>${e.title}</strong>
        <small>${e.person}</small>
      </div>
    </div>
  `).join(``):`<div class="empty-state">🌤️ Nothing planned yet.<br><span>Add something cozy.</span></div>`}function c(){document.querySelector(`#app`).innerHTML=`
    <main class="shell">
      <aside class="sidebar">
        <div class="brand-card">
          <div class="brand-icon">🏡</div>
          <div>
            <p class="eyebrow">Family Hub</p>
            <h1>Today at Home</h1>
          </div>
        </div>

        <nav class="nav-stack" aria-label="Main navigation">
          ${[`Dashboard`,`Calendar`,`Meals`,`Chores`,`Lists`].map((e,t)=>`
            <button class="nav-pill ${t===0?`active`:``}" type="button">
              <span>${[`✨`,`📅`,`🍽️`,`🧺`,`🛒`][t]}</span>${e}
            </button>
          `).join(``)}
        </nav>

        <section class="mini-card">
          <p class="eyebrow">Family</p>
          <div class="avatar-row">
            ${e.family.map(e=>`<div class="avatar ${e.color}" title="${e.name}">${e.initial}</div>`).join(``)}
          </div>
        </section>
      </aside>

      <section class="content">
        <header class="hero">
          <div>
            <p class="eyebrow">${new Date().toLocaleDateString(void 0,{weekday:`long`,month:`long`,day:`numeric`})}</p>
            <h2>Everything your family needs, all in one cozy place.</h2>
          </div>
          <button class="primary-btn" type="button" id="add-event-btn">+ Add Event</button>
        </header>

        <section class="dashboard-grid">
          <article class="panel calendar-panel">
            <div class="panel-header">
              <button class="circle-btn" id="prev-month" aria-label="Previous month">‹</button>
              <h3>${i(e.currentDate)}</h3>
              <button class="circle-btn" id="next-month" aria-label="Next month">›</button>
            </div>
            <div class="weekdays">
              ${[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`].map(e=>`<span>${e}</span>`).join(``)}
            </div>
            <div class="calendar-grid">
              ${a(e.currentDate).map(t=>{let i=t.getMonth()===e.currentDate.getMonth(),a=r(t,e.selectedDate),s=r(t,new Date),c=o(t).slice(0,3).map(()=>`<i></i>`).join(``);return`
                  <button class="day-cell ${i?``:`muted`} ${a?`selected`:``} ${s?`today`:``}" data-date="${n(t)}">
                    <span>${t.getDate()}</span>
                    <div class="event-dots">${c}</div>
                  </button>
                `}).join(``)}
            </div>
          </article>

          <article class="panel agenda-panel">
            <div class="panel-header left">
              <div><p class="eyebrow">Agenda</p><h3>${e.selectedDate.toLocaleDateString(void 0,{weekday:`long`,month:`short`,day:`numeric`})}</h3></div>
            </div>
            <div class="agenda-list">${s()}</div>
          </article>

          <article class="panel chore-panel">
            <div class="panel-header left"><div><p class="eyebrow">Chores</p><h3>Household Helpers</h3></div></div>
            <div class="task-list">
              ${e.chores.map((e,t)=>`
                <label class="task-card">
                  <input type="checkbox" data-chore="${t}" ${e.done?`checked`:``}>
                  <span class="checkmark"></span>
                  <div><strong>${e.title}</strong><small>${e.assignee}</small></div>
                </label>
              `).join(``)}
            </div>
          </article>

          <article class="panel meals-panel">
            <div class="panel-header left"><div><p class="eyebrow">Meals</p><h3>This Week</h3></div></div>
            <div class="meal-list">
              ${e.meals.map(e=>`<div class="meal-row"><span>${e.day}</span><strong>${e.meal}</strong></div>`).join(``)}
            </div>
          </article>

          <article class="panel grocery-panel">
            <div class="panel-header left"><div><p class="eyebrow">Groceries</p><h3>Quick List</h3></div></div>
            <ul class="grocery-list">${e.groceries.map(e=>`<li>${e}</li>`).join(``)}</ul>
          </article>
        </section>
      </section>
    </main>

    <dialog class="event-dialog" id="event-dialog">
      <form method="dialog" class="dialog-card" id="event-form">
        <button class="close-btn" value="cancel" aria-label="Close">×</button>
        <p class="eyebrow">New Event</p>
        <h3>Add something to the family calendar</h3>
        <label>Title <input required name="title" placeholder="Dentist appointment"></label>
        <label>Date <input required name="date" type="date" value="${n(e.selectedDate)}"></label>
        <label>Time <input name="time" placeholder="3:30 PM"></label>
        <label>Person <input name="person" placeholder="Family"></label>
        <button class="primary-btn full" value="default">Save Event</button>
      </form>
    </dialog>
  `,l()}function l(){document.querySelector(`#prev-month`).addEventListener(`click`,()=>{e.currentDate.setMonth(e.currentDate.getMonth()-1),c()}),document.querySelector(`#next-month`).addEventListener(`click`,()=>{e.currentDate.setMonth(e.currentDate.getMonth()+1),c()}),document.querySelectorAll(`.day-cell`).forEach(t=>{t.addEventListener(`click`,()=>{e.selectedDate=new Date(t.dataset.date+`T12:00:00`),c()})}),document.querySelectorAll(`[data-chore]`).forEach(t=>{t.addEventListener(`change`,()=>{e.chores[Number(t.dataset.chore)].done=t.checked,c()})});let t=document.querySelector(`#event-dialog`);document.querySelector(`#add-event-btn`).addEventListener(`click`,()=>t.showModal()),document.querySelector(`#event-form`).addEventListener(`submit`,n=>{n.preventDefault();let r=new FormData(n.currentTarget);e.events.push({title:r.get(`title`),date:r.get(`date`),time:r.get(`time`)||`Anytime`,person:r.get(`person`)||`Family`,type:`reminder`}),t.close(),c()})}c();