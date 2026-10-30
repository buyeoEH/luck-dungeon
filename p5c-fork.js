/* Counterfactual via deterministic prefix replay, not partial state restoration. */
(function(){'use strict';let job=null,ordinal=0,point=null;const choose0=P5B.chooseReward;
function snapshot(){const state=V030ReferenceAI.snapshot(),index=id=>deck.findIndex(c=>c.id===id);return {state,rng:AutoLab.inspectRng(),p1_pending_guard:p1PendingGuard,p1_reward_round:p1RewardRound,p1_round:{...p1Round,lances:[...p1Round.lances].map(index).sort((a,b)=>a-b),paidLances:[...p1Round.paidLances].map(index).sort((a,b)=>a-b)},rewardLocked,rewardRevealPending,reward_names:rewards.map(x=>x[0])};}
P5B.chooseReward=function(profile){
 const before=job&&ordinal===job.target?JSON.parse(JSON.stringify(snapshot(),(_k,v)=>v===undefined?null:v)):null;
 const normal=choose0(profile);
 if(job&&ordinal<job.target&&normal!==job.prefix[ordinal])throw Error('Reference prefix diverged '+ordinal);
 if(job&&ordinal===job.target){point={snapshot:before,reference_choice:normal,forced_choice:job.choice,target:ordinal,round};ordinal++;return job.choice;}
 ordinal++;return normal;
};
window.P5C={run(j){job=j;ordinal=0;point=null;const r=P5Harness.run({experiment:'reward_fork',profile:j.profile,seed:j.seed,reward_policy:'mixed',mode:'normal',random_cards:3});if(!point)throw Error('Reward point never reached');const out={profile:j.profile,seed:j.seed,target:j.target,choice:j.choice,point,clear:r.clear,round:r.round,random_calls:r.random_calls,stats:r.stats,first_shop:r.first_shop,rewards:r.rewards,within_r30:r.battles.some(b=>b.round===30&&b.within_limits),last_battle:r.battles.at(-1),object_object_count:r.object_object_count,build_id:r.build_id,git_sha:r.git_sha};job=null;return out;},snapshot};
})();
