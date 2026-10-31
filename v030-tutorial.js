/* v0.3 guidance only; combat, rewards and RNG are untouched. */
(function(){'use strict';
const features=`<section class="v030-features" aria-label="v0.3 새 기능" style="overflow-wrap:anywhere;line-height:1.6">
<h3>🆕 v0.3 새 기능</h3>
<p>♻️ 이어가기 드로우는 항상 ON입니다. 구매 카드는 묘지에 들어가며 다음 셔플부터 등장합니다.</p>
<h4>연계 게이지와 점수</h4>
<p>이번 전투의 연계 콤보 공격 보너스와 카드의 게이지 전용 보너스를 합친 값이 <b>원시 게이지</b>입니다. 콤보 디버프를 반영한 <b>디버프 후 게이지</b>로 관통과 추가 공격을 계산합니다. 전투 미리보기의 원시 → 디버프 후 수치를 확인하세요.</p>
<table style="width:100%;font-size:13px"><caption>기본 변환 구간 · 디버프 후 게이지</caption><thead><tr><th>게이지 이상</th><th>변환 관통</th><th>공격 증가</th></tr></thead><tbody><tr><td>20</td><td>+1</td><td>+5%</td></tr><tr><td>40</td><td>+2</td><td>+10%</td></tr><tr><td>60</td><td>+3</td><td>+15%</td></tr><tr><td>80</td><td>+4</td><td>+20%</td></tr></tbody></table>
<p>변환 관통의 상한은 +4입니다. <b>연계 점수</b>(보너스 ×5 + 발동 ×40)는 기존 콤보 점수에 포함되는 기록이며 게이지와 별개입니다. 게이지 전용 보너스를 점수에 다시 더하지 않습니다.</p>
<h4>신규 카드와 관통창 강화</h4>
<p>증폭 문장(+15 게이지), 꿰뚫는 정점(확정 게이지의 30% 추가 공격), 연계 관통창(승급·게이지 10당 변환 관통), 기존 관통창 강화(연계 액션 사용 시 장당 게이지 +8)를 도감에서 확인하세요. ‘관통창 강화’는 기존 관통창의 효과 추가이며 별도 카드 이름이 아닙니다.</p>
<button type="button" onclick="showCardTable()">📚 신규 카드 · 전체 도감 보기</button>
<h4>상점교체 · 잠금과 씨앗 선택</h4>
<p>① 재고가 남은 상품 중 유지할 카드 최대 2장을 잠급니다. ② 잠금을 확정하면 재고가 남은 비잠금 상품 중 최대 3장이 교체됩니다. ③ 교체 결과를 확인하고 루트 씨앗 <b>3장 중 1장</b>을 무료로 선택합니다. 씨앗은 구매 재고를 소비하지 않습니다. 창을 다시 열어도 후보는 바뀌지 않으며 중복 지급되지 않습니다.</p>
<h4>재입고 A · 적용 시점과 할인 유효기간</h4>
<p>보스 보상에서 재입고를 선택하는 즉시 기본 상점 +3, 현재 랜덤 상점 +1을 적용합니다. <b>보상 선택 직전</b> 품절이던 상품 1종을 골라 재고 1개를 더 복구합니다. 해당 상품이 없으면 선택 복구는 0개입니다.</p>
<p>할인은 <b>다음 라운드 상점의 첫 성공 구매 1회</b>에만 적용합니다. 50% 할인, 할인액 최대 6, 최저 구매 가격 1이며 중첩되지 않습니다. 실패한 구매는 할인권을 소모하지 않고, 다음 상점 단계가 끝나면 미사용 할인권은 소멸합니다.</p>
<p>🔒 이 RC는 기기 저장 전용입니다. 운영 서버·정식 랭킹에는 전송하지 않으며 이전 버전 기록은 자동 이관하지 않습니다.</p>
</section>`;
const reference=showTutorialReference;
showTutorialReference=function(){const out=reference.apply(this,arguments);$('modalContent')?.insertAdjacentHTML('afterbegin',features);return out;};
document.addEventListener('DOMContentLoaded',()=>{const original=$('tutorialBtn');if(!original||$('v030FeaturesBtn'))return;const button=document.createElement('button');button.id='v030FeaturesBtn';button.type='button';button.textContent='🆕 v0.3 새 기능';button.onclick=()=>showTutorialReference();original.insertAdjacentElement('afterend',button);});
})();
