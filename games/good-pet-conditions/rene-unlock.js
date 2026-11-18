import {playUnlockSequence} from './unlock-sequence.js?v=3.3.0';

const beats=[
  {id:'records', duration:2900, caption:'九つの記録が、閉じられた。'},
  {id:'offline', duration:1300, caption:'所有登録網　接続なし', cue:'archive-seal'},
  {id:'knock', duration:1450, caption:'コン、コン。', cue:'knock'},
  {id:'opening', duration:1950, caption:'白い扉が、静かに滑った。'},
  {id:'arrival', duration:1500, caption:'「おはよう。入っても大丈夫かな？」'}
];
export function playReneUnlock(options){
  return playUnlockSequence({...options,beats,readyClass:'intro-ready'});
}
export function reneTableau(room, interior, records){
  const seals=['I','II','III','IV','V','VI','VII','VIII','IX'];
  const plates=records.map(({number,title},index)=>`<div class="ledger-plate" style="--plate:${index};--fold-x:${(1-index%3)*78}%;--fold-y:${(1-Math.floor(index/3))*78}%">
    <div class="ledger-print"><b class="ledger-seal">${seals[index]}</b><small>${number}</small><span>${title}</span></div></div>`).join('');
  return `<div class="rene-daylight" aria-hidden="true"><img class="rene-interior" data-unlock-art src="${interior}" alt=""><div class="rene-paper"></div></div>
    <svg class="rene-room" viewBox="0 0 864 1536" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <image id="rene-bedroom-plate" href="${room}" width="864" height="1536"/>
        <clipPath id="rene-door-opening"><path d="M260 78 756 0 762 922 263 892Z"/></clipPath>
        <linearGradient id="rene-door-depth"><stop stop-color="#34291e" stop-opacity=".52"/><stop offset=".16" stop-color="#fff1cd" stop-opacity="0"/><stop offset="1" stop-color="#f8d396" stop-opacity=".12"/></linearGradient>
      </defs>
      <g class="rene-room-camera"><use href="#rene-bedroom-plate"/>
        <g clip-path="url(#rene-door-opening)">
          <rect x="250" width="530" height="940" fill="#e8d5b6"/>
          <image href="${interior}" x="256" y="31" width="514" height="914" preserveAspectRatio="xMidYMin slice"/>
          <rect x="252" width="526" height="940" fill="url(#rene-door-depth)"/>
          <g class="rene-door-leaf"><g clip-path="url(#rene-door-opening)"><use href="#rene-bedroom-plate"/></g><path class="rene-door-light" d="m756 0 6 922" stroke="#fff0c0" stroke-width="5"/></g>
        </g>
        <g class="rene-knock-mark" fill="none" stroke="#fff2c5" stroke-width="2"><circle cx="748" cy="460" r="28"/><circle cx="748" cy="460" r="28"/></g>
      </g>
    </svg>
    <div class="rene-archive-veil" aria-hidden="true"></div>
    <div class="rene-ledger" aria-hidden="true"><div class="ledger-heading"><i></i><span>IMPERIAL RECORDS</span><i></i></div>
      <div class="ledger-mount"><div class="ledger-grid">${plates}</div></div>
      <div class="ledger-register"><span>所有登録記録</span><b>IX <i>/</i> IX</b></div>
    </div>
    <div class="rene-offline-mark" aria-hidden="true"><span>∅</span><i></i><small>REGISTRY OFFLINE</small></div>
    <div class="rene-arrival-copy unlock-result" data-unlock-result aria-hidden="true">
      <div class="rene-file"><i></i><span>OUTSIDE THE RECORDS</span><b>FILE 00</b></div>
      <p class="rene-whisper">記録の外で、君を待っている。</p><h1>レネ・アシュベル</h1>
      <p class="rene-first-words">「おはよう。入っても大丈夫かな？」</p>
    </div>`;
}
