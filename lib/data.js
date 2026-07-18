// Seed data ported from the HTML prototype. In-memory only — resets on server restart.

// Demo roles collapsed to two platform logins.
// Admin = Team Leader / Branch Staff / Call Centre Agent (front-line ops)
// Super Admin = Operations Manager / CEO / MD (executive / managerial)
export const ROLES = {
  admin: {
    name: 'Nadeesha Perera',
    title: 'Admin',
    init: 'NP',
    team: 'Operations',
    home: 'dash',
  },
  superadmin: {
    name: 'Priyantha Fernando',
    title: 'Super Admin',
    init: 'PF',
    team: 'Executive',
    home: 'dash',
  },
};

// The full set of departments a concern can be routed to. Adding a new
// department here (and, optionally, a roster entry below) is the only
// change needed to support it end-to-end.
export const DEPARTMENTS = ['Technology', 'Cards', 'Loans', 'Digital Banking', 'ATM Operations', 'Compliance', 'Fraud', 'Customer Service', 'Finance'];

// Small demo roster per department for the "Assign to Team Member" selector.
// Departments with no roster yet simply show an empty list — the UI handles
// that gracefully rather than requiring every department to be pre-populated.
export const DEPARTMENT_MEMBERS = {
  Technology: ['Ishara Jayasuriya', 'Sanduni Rajapakse'],
  'Digital Banking': ['Ishara Jayasuriya'],
  'Customer Service': ['Dilani W.'],
  Cards: [],
  Loans: [],
  'ATM Operations': [],
  Compliance: [],
  Fraud: [],
  Finance: [],
};

export const CHANNEL_ICON = {
  'Call Centre':'☎','Email':'✉','Branch':'🏦','App Review':'★','Social Media':'💬',
  'Existing System':'🗄','Digital App':'📱','Mobile App':'📱','WhatsApp':'💬'
};

export const PROBLEMS_SEED = [
 {
  id:'PRB-2044', title:'Failed Interbank Transfers During Peak Hours', severity:'critical', status:'action-in-progress',
  description:'Customers are repeatedly experiencing failed interbank transfers during peak hours (6 PM – 9 PM): money is debited from the sender but never credited to the receiver, with no clear in-app status and no automatic reversal.',
  whyItMatters:'This is currently the single largest driver of customer-service load and reputational risk. It is trending up, concentrated in the highest-value evening window, and repeat contacts show customers are losing trust in the transfer feature entirely — not just annoyed by one incident.',
  executiveDecision:'Approve the 30-day auto-refund fast-track proposed by Digital Banking, or extend the deadline if the CEFTS reconciliation root cause needs more time to confirm.',
  concernCount:1240, channels:['Call Centre','Email','Branch','App Review','Social Media'],
  trendPct:180, trendWindow:'14 days', peakWindow:'6 PM – 9 PM', repeatContactRate:'High',
  affectedCustomers:12400, repeatedFrustration:2100, disengagement:680, highChurnRisk:240, valueAtRisk:1800000000,
  opCost:'High — 3.1x normal call-centre volume during peak window',
  rootCause:[
    {hyp:'Interbank switch (CEFTS / LankaPay) times out under peak load', conf:78, evidence:'62% of failed-transfer concerns explicitly mention "stuck processing" or timeout between 6–9 PM.', systems:'Core Banking ↔ LankaPay CEFTS Gateway'},
    {hyp:'Retry / reconciliation logic fails to auto-credit or auto-reverse after a timeout', conf:65, evidence:'Repeat-contact customers report the debit posted but no credit or reversal ever followed.', systems:'Transaction Reconciliation Service'},
    {hyp:'Mobile / web banking app does not reflect accurate pending or failed state', conf:54, evidence:'App Store reviews cite "app said success but money never arrived."', systems:'Mobile & Web Banking App'}
  ],
  nextChecks:['Pull CEFTS gateway timeout logs for 6–9 PM window, last 14 days','Cross-check reconciliation job run-times against peak transaction volume','Sample 25 affected accounts to confirm debit-without-credit pattern','Review app status-polling logic for failed/pending states'],
  teams:['Technology','Digital Banking'],
  evidenceChannels:[{label:'Call Centre',count:512},{label:'Email',count:298},{label:'Branch',count:184},{label:'App Review',count:151},{label:'Social Media',count:95}],
  hourly:[2,1,1,1,2,3,4,6,8,10,9,11,13,12,14,16,19,34,58,63,49,22,9,4],
  spark:[15,17,16,19,22,21,25,29,31,35,38,44,49,55],
  valueAtRiskDetail:{
    confidence:'Estimated', customers:12400,
    segments:[{name:'Mass Retail',count:8200},{name:'Premium / Wealth',count:2600},{name:'SME',count:1600}],
    products:['Savings Accounts','Current Accounts','Interbank Transfer (CEFTS)'],
    churnProbability:'6.5% of affected customers within 90 days if unresolved',
    calcText:'Value = average 90-day relationship revenue per affected segment × estimated churn-probability uplift caused by this problem × number of customers in each segment, summed across segments and rounded to the nearest Rs. 100M.',
    sources:['Call Centre & Branch concern logs (14 days)','App Store / Play Store reviews','Core banking transaction reconciliation exports','Historical churn-after-failed-transfer cohort (2025)'],
    assumptions:['Customers with 2+ repeat contacts are treated as high churn-probability','Relationship value uses trailing-12-month average, not point-in-time balance','Social media mentions are corroborating evidence, not counted as unique customers unless matched to an account']
  },
  valueProtectedDetail:{
    confidence:'AI Modelled', customers:180,
    segments:[{name:'Mass Retail',count:120},{name:'Premium / Wealth',count:40},{name:'SME',count:20}],
    calcText:'Modelled as the reduction in projected churn-driven value loss between the "before" and "after" cohorts, using the same per-segment relationship-value assumptions as the at-risk estimate, applied to the observed drop in repeat contacts and negative sentiment.',
    sources:['Same sources as Value at Risk, re-measured after intervention start (2026-07-09)'],
    assumptions:['Assumes customers who stopped repeat-contacting were retained, not silently churned through another channel','Does not yet include a full 90-day churn confirmation — will be revised as more data arrives']
  },
  intervention:{
    immediate:'Proactively contact the 2,100 customers showing repeated frustration; offer manual reconciliation / refund fast-track for confirmed debit-without-credit cases within 24 hours.',
    experience:'Add a real-time, accurate "Pending / Failed / Reversed" status to the transfer screen and transaction history, with a push notification the moment a transfer times out — replacing the current false "Success" state.',
    system:'Fix the interbank switch retry and reconciliation logic so a timeout at CEFTS automatically triggers either a successful retry or an automatic reversal, instead of leaving the transaction in limbo.',
    prevention:'Add peak-load monitoring and auto-scaling on the CEFTS gateway path, plus a weekly automated reconciliation sweep that flags any debit-without-credit transaction within 1 hour instead of relying on customer complaints to surface it.',
    recommended:[
      {title:'Real-time failed/pending status + push notification', impact:'High — removes the false "Success" confirmation driving anger', effort:'Medium', urgency:'High', confidence:82, dependencies:'Core banking status API, mobile/web app release', owner:'Digital Banking'},
      {title:'Auto-refund fast-track for confirmed non-credit cases', impact:'High — directly resolves the 2,100 repeat-contact customers', effort:'Low', urgency:'High', confidence:75, dependencies:'Manual reconciliation team capacity', owner:'Customer Service'},
      {title:'CEFTS gateway timeout fix + auto-reversal logic', impact:'Very High — addresses the underlying failure, not just the symptom', effort:'High', urgency:'High', confidence:68, dependencies:'LankaPay coordination, change-window approval', owner:'Technology'},
      {title:'Peak-load auto-scaling + hourly reconciliation sweep', impact:'Medium — prevents recurrence rather than fixing current backlog', effort:'High', urgency:'Medium', confidence:60, dependencies:'Infrastructure budget approval', owner:'Technology'}
    ]
  },
  actions:{
    'Technology':'Investigate peak-hour transaction failures at the interbank switch and reconciliation layer.',
    'Digital Banking':'Improve failed and pending transaction states; add real-time status and auto-notification.',
    'Customer Service':'Proactively contact the 2,100 customers showing repeated frustration.',
    'Product':'Redesign the failed-transfer recovery journey — auto-refund path, in-app tracking.',
    'Leadership':'Assign an owner and a 30-day deadline; review weekly.'
  },
  owner:'Ishara Jayasuriya — Head of Digital Banking', target:'Reduce failed-transfer volume by 60%', deadline:'2026-08-08', startedAt:'2026-07-09',
  impact:{
    before:{volume:1240, repeat:2100, negSentiment:81, churn:240, value:1800000000},
    after:{volume:409, repeat:1218, negSentiment:38, churnPrevented:180, valueProtected:1200000000}
  }
 },
 {
  id:'PRB-2045', title:'KYC Document Rejections Confusing New Customers at Branch Onboarding', severity:'high', status:'investigating',
  description:'New customers opening accounts at branches are having KYC documents rejected multiple times without a clear reason, causing onboarding delays and abandoned applications.',
  whyItMatters:'Onboarding is the first impression a new customer has of the bank. Repeated, unexplained document rejection risks losing the customer before the relationship even starts, and reflects poorly on branch staff who cannot explain the rejection either.',
  executiveDecision:null,
  concernCount:340, channels:['Branch','Call Centre','Email'], trendPct:64, trendWindow:'21 days', peakWindow:'Weekday mornings', repeatContactRate:'Medium',
  affectedCustomers:2100, repeatedFrustration:640, disengagement:210, highChurnRisk:70, valueAtRisk:210000000,
  opCost:'Medium — branch staff spend ~18 extra minutes per re-submission',
  rootCause:[
    {hyp:'Rejection reason is not communicated to the customer or the branch staff', conf:70, evidence:'71% of branch-logged concerns note "no reason given" for rejection.', systems:'KYC Document Verification Service'},
    {hyp:'Document scan quality requirements are inconsistently enforced across branches', conf:48, evidence:'Rejection rate varies 3x between branches for identical document types.', systems:'Branch Onboarding App'}
  ],
  nextChecks:['Audit rejection-reason logging in the KYC verification service','Compare rejection rates and scan-quality settings across branches'],
  teams:['Product','Digital Banking'],
  evidenceChannels:[{label:'Branch',count:210},{label:'Call Centre',count:88},{label:'Email',count:42}],
  hourly:[1,1,0,0,0,1,3,9,14,16,15,13,10,9,8,6,4,3,2,1,1,1,0,1],
  spark:[9,10,11,12,13,12,14,15,17,18,19,20,21,23],
  intervention:{
    immediate:'Have branch staff manually escalate any 2nd rejection to a same-day supervisor review instead of asking the customer to resubmit again.',
    experience:'Show the specific rejection reason on-screen for both the customer and branch staff, instead of a generic rejection.',
    system:'Standardize document scan-quality thresholds across all branches so the same document is not accepted at one branch and rejected at another.',
    prevention:'Add a pre-submission scan-quality check on the branch tablet/scanner that catches quality issues before the document is even sent for verification.',
    recommended:[
      {title:'Add rejection-reason messaging to onboarding flow', impact:'High — removes the single biggest source of confusion', effort:'Low', urgency:'Medium', confidence:74, dependencies:'Onboarding app release', owner:'Product'},
      {title:'Standardize scan-quality checks across branches', impact:'Medium — reduces branch-to-branch inconsistency', effort:'Medium', urgency:'Medium', confidence:58, dependencies:'Branch hardware/training rollout', owner:'Digital Banking'}
    ]
  },
  actions:{'Product':'Add clear rejection-reason messaging to the onboarding flow.','Digital Banking':'Standardize document scan-quality checks across branches.','Customer Service':'Follow up with abandoned applications within 48 hours.'},
  owner:'—', target:'Cut re-submission rate by 50%', deadline:'—', startedAt:'—',
  impact:{before:{volume:340, repeat:640, negSentiment:58, churn:70, value:210000000}, after:null}
 },
 {
  id:'PRB-2046', title:'Cards Blocked Without Notification While Travelling Abroad', severity:'medium', status:'evidence-gathering',
  description:'Customers travelling overseas are having their cards blocked by fraud rules with no advance notification, leaving them without access to funds while abroad.',
  whyItMatters:'Customers travelling abroad with a blocked card and no warning have effectively zero ability to self-serve a fix in the moment — this converts a routine fraud-safety measure into a trust-damaging emergency.',
  executiveDecision:null,
  concernCount:156, channels:['Call Centre','App Review','Social Media'], trendPct:22, trendWindow:'30 days', peakWindow:'Weekends', repeatContactRate:'Medium',
  affectedCustomers:890, repeatedFrustration:310, disengagement:120, highChurnRisk:35, valueAtRisk:95000000,
  opCost:'Medium — escalations often require international call-back',
  rootCause:[{hyp:'Fraud rule engine has no travel-notice override path', conf:60, evidence:'None of the affected customers had a travel notice on file, and none was offered one.', systems:'Fraud Detection Engine'}],
  nextChecks:['Confirm whether a travel-notice feature exists and is discoverable in-app','Review fraud-rule false-positive rate for cross-border transactions'],
  teams:['Technology','Customer Service'],
  evidenceChannels:[{label:'Call Centre',count:96},{label:'App Review',count:38},{label:'Social Media',count:22}],
  hourly:[1,1,1,1,1,1,2,3,4,5,6,7,8,7,6,5,6,7,8,7,5,3,2,1],
  spark:[6,6,7,7,8,7,9,10,9,11,12,12,13,14],
  intervention:{
    immediate:'Fast-track international card-unblock requests through a dedicated queue rather than the standard call queue.',
    experience:'Add a self-service "I\'m travelling" notice option in the app that temporarily raises the fraud-rule threshold for the stated destination and dates.',
    system:'Add a travel-notice override path into the fraud rule engine so flagged transactions from a declared travel window are handled differently.',
    prevention:'Prompt customers with international transaction history to set a travel notice proactively before departure.',
    recommended:[
      {title:'Self-service travel-notice option in app', impact:'High — removes the surprise block entirely for customers who use it', effort:'Medium', urgency:'Medium', confidence:66, dependencies:'Fraud engine override path', owner:'Technology'},
      {title:'Dedicated fast-track queue for international unblocks', impact:'Medium — faster recovery for customers already affected', effort:'Low', urgency:'High', confidence:72, dependencies:'Call centre routing change', owner:'Customer Service'}
    ]
  },
  actions:{'Technology':'Add a self-service travel-notice option in the app.','Customer Service':'Fast-track international card-unblock requests.'},
  owner:'—', target:'Reduce travel-related blocks by 40%', deadline:'—', startedAt:'—',
  impact:{before:{volume:156, repeat:310, negSentiment:66, churn:35, value:95000000}, after:null}
 },
 {
  id:'PRB-2047', title:'Delayed Loan Application Status Updates', severity:'medium', status:'resolved',
  description:'Loan applicants were not receiving timely status updates, leading to a high volume of "just checking in" contacts.',
  whyItMatters:'Kept here as the platform\'s proof point that a clear intervention plus ongoing monitoring actually closes the loop — this is what "resolved and confirmed" looks like, not just "marked closed."',
  executiveDecision:null,
  concernCount:210, channels:['Call Centre','Email','Branch'], trendPct:-71, trendWindow:'30 days', peakWindow:'—', repeatContactRate:'Low (after fix)',
  affectedCustomers:1450, repeatedFrustration:80, disengagement:20, highChurnRisk:5, valueAtRisk:140000000,
  opCost:'Low — resolved',
  rootCause:[{hyp:'No automated status notifications existed for loan applications', conf:90, evidence:'Confirmed via product audit — feature gap, not a defect.', systems:'Loan Origination System'}],
  nextChecks:[],
  teams:['Product'],
  evidenceChannels:[{label:'Call Centre',count:120},{label:'Email',count:60},{label:'Branch',count:30}],
  hourly:[2,1,1,1,1,2,3,5,7,8,7,6,6,5,5,4,4,3,3,2,2,1,1,1],
  spark:[28,26,24,20,18,15,12,10,9,7,6,5,4,3],
  intervention:{
    immediate:'Loan officers proactively called applicants awaiting a decision beyond 5 business days during the fix rollout.',
    experience:'Automated SMS + in-app status notification at each loan application stage.',
    system:'Loan Origination System now emits a status-change event consumed by the notification service.',
    prevention:'Status notification is now a standard requirement for any new application workflow, not an opt-in feature.',
    recommended:[{title:'Automated SMS + app status notifications', impact:'High — removed the reason customers felt the need to check in', effort:'Medium', urgency:'Medium', confidence:88, dependencies:'Loan Origination System event hooks', owner:'Product'}]
  },
  actions:{'Product':'Automated SMS + app status notifications at each loan stage.'},
  owner:'Product Team — Loans', target:'Reduce status-check contacts by 70%', deadline:'2026-06-01', startedAt:'2026-04-15',
  impact:{before:{volume:210, repeat:640, negSentiment:52, churn:40, value:140000000}, after:{volume:61, repeat:96, negSentiment:12, churnPrevented:35, valueProtected:140000000}}
 },
 {
  id:'PRB-2048', title:'Standing Order Double-Debit on Month-End', severity:'high', status:'investigating',
  description:'A cluster of customers report being debited twice for the same standing order at month-end, requiring manual reversal.',
  whyItMatters:'A duplicate debit is one of the few complaint types that directly and visibly removes money customers were not expecting to lose — it generates high anger and immediate escalation regardless of the value at risk.',
  executiveDecision:'Approve an emergency patch to the batch job before the next month-end run in 3 weeks, or accept the risk of another duplicate-debit cycle.',
  concernCount:188, channels:['Call Centre','Branch','Email'], trendPct:95, trendWindow:'10 days', peakWindow:'Last 2 days of month', repeatContactRate:'High',
  affectedCustomers:1600, repeatedFrustration:420, disengagement:150, highChurnRisk:55, valueAtRisk:180000000,
  opCost:'High — each case requires manual GL reversal',
  rootCause:[{hyp:'Standing order batch job re-triggers on retry after a partial failure', conf:72, evidence:'Every reported double-debit correlates with a batch-job retry timestamp.', systems:'Standing Order Batch Processor'}],
  nextChecks:['Review batch-job idempotency / retry-safety logic','Reconcile last 3 month-end batch runs against debit logs'],
  teams:['Technology'],
  evidenceChannels:[{label:'Call Centre',count:110},{label:'Branch',count:52},{label:'Email',count:26}],
  hourly:[1,1,1,1,1,1,2,3,5,6,7,8,9,9,8,7,6,5,4,3,2,2,1,1],
  spark:[4,5,6,7,9,11,13,15,17,20,24,27,31,36],
  intervention:{
    immediate:'Auto-reverse confirmed duplicate debits within 24 hours without requiring the customer to visit a branch.',
    experience:'Show a clear "Standing order processed once" confirmation with a reference ID so customers can immediately see if a second debit is a duplicate.',
    system:'Make the standing order batch job idempotent so a retry after partial failure cannot re-debit an already-processed order.',
    prevention:'Add a pre-run reconciliation check comparing this run\'s debits against the prior run before the batch job is allowed to complete.',
    recommended:[
      {title:'Make standing-order batch job idempotent on retry', impact:'Very High — eliminates the root cause', effort:'Medium', urgency:'High', confidence:76, dependencies:'Batch processing change window', owner:'Technology'},
      {title:'Auto-reverse confirmed duplicate debits within 24h', impact:'High — fixes the current backlog for affected customers', effort:'Low', urgency:'High', confidence:80, dependencies:'Reconciliation team capacity', owner:'Customer Service'}
    ]
  },
  actions:{'Technology':'Make the standing order batch job idempotent on retry.','Customer Service':'Auto-reverse confirmed duplicate debits within 24h.'},
  owner:'—', target:'Eliminate duplicate debits at next month-end run', deadline:'—', startedAt:'—',
  impact:{before:{volume:188, repeat:420, negSentiment:74, churn:55, value:180000000}, after:null}
 },
 {
  id:'PRB-2049', title:'Chatbot Cannot Resolve Card Dispute Requests', severity:'low', status:'evidence-gathering',
  description:'Customers attempting to raise a card dispute through the chatbot are being looped without resolution and eventually abandon the channel.',
  whyItMatters:'Every customer who abandons the chatbot on a dispute either gives up (silent dissatisfaction) or calls in anyway (no efficiency gained) — the channel is currently adding friction instead of removing it for this journey.',
  executiveDecision:null,
  concernCount:97, channels:['App Review','Social Media'], trendPct:14, trendWindow:'30 days', peakWindow:'—', repeatContactRate:'Low',
  affectedCustomers:410, repeatedFrustration:90, disengagement:40, highChurnRisk:10, valueAtRisk:22000000,
  opCost:'Low',
  rootCause:[{hyp:'Chatbot intent model has no "card dispute" branch and defaults to a generic FAQ loop', conf:55, evidence:'Transcript sampling shows repeated fallback responses for dispute-related phrasing.', systems:'Chatbot / Virtual Assistant'}],
  nextChecks:['Sample 30 chatbot transcripts tagged "card dispute"','Add a dedicated dispute-intent + human handoff path'],
  teams:['Digital Banking','Customer Service'],
  evidenceChannels:[{label:'App Review',count:61},{label:'Social Media',count:36}],
  hourly:[1,1,1,1,1,1,1,2,3,4,5,5,5,4,4,4,3,3,3,2,2,1,1,1],
  spark:[4,4,5,5,6,6,6,7,7,8,8,9,9,10],
  intervention:{
    immediate:'Add a manual handoff trigger so any dispute-related chatbot session can be escalated to a human agent on request.',
    experience:'Recognize dispute-related phrasing explicitly instead of falling back to a generic FAQ loop.',
    system:'Add a dedicated card-dispute intent to the chatbot/virtual assistant intent model with a human-handoff branch.',
    prevention:'Review chatbot fallback transcripts weekly to catch new unresolved intent patterns before they grow.',
    recommended:[{title:'Add dedicated dispute intent with human handoff', impact:'High — stops silent abandonment on this journey', effort:'Medium', urgency:'Low', confidence:62, dependencies:'Chatbot platform intent training', owner:'Digital Banking'}]
  },
  actions:{'Digital Banking':'Add a dedicated dispute intent with human handoff.'},
  owner:'—', target:'Cut chatbot abandonment on disputes by 80%', deadline:'—', startedAt:'—',
  impact:{before:{volume:97, repeat:90, negSentiment:44, churn:10, value:22000000}, after:null}
 },
 {
  id:'PRB-2050', title:'ATM Cash Not Dispensed But Account Debited', severity:'critical', status:'action-in-progress',
  description:'A recurring pattern of ATM withdrawals where the account is debited but cash is not dispensed, requiring manual reconciliation and refund.',
  whyItMatters:'Non-dispense debits are among the fastest complaints to turn into social media posts and formal regulatory complaints — customers see cash physically not appear, which erodes trust faster than a delayed transfer.',
  executiveDecision:'Approve capital spend for a hardware audit/replacement at the 6 flagged ATM sites, or accept the interim manual-refund cost as an ongoing operating expense.',
  concernCount:264, channels:['Call Centre','Branch','Social Media'], trendPct:58, trendWindow:'14 days', peakWindow:'Weekend evenings', repeatContactRate:'High',
  affectedCustomers:1980, repeatedFrustration:520, disengagement:190, highChurnRisk:60, valueAtRisk:260000000,
  opCost:'High — manual ATM journal reconciliation per case',
  rootCause:[{hyp:'ATM dispenser fault not detected by host system before debit posts', conf:66, evidence:'Concentrated at 6 ATM sites with known hardware age issues.', systems:'ATM Switch / Host Reconciliation'}],
  nextChecks:['Cross-check debit logs against ATM hardware fault codes','Prioritize hardware audit for the 6 highest-frequency sites'],
  teams:['Technology','Customer Service'],
  evidenceChannels:[{label:'Call Centre',count:150},{label:'Branch',count:70},{label:'Social Media',count:44}],
  hourly:[2,2,1,1,1,2,3,4,5,6,6,7,8,8,9,11,15,20,26,24,18,10,5,3],
  spark:[10,12,13,15,16,18,20,23,26,29,33,37,42,47],
  valueAtRiskDetail:{
    confidence:'Estimated', customers:1980,
    segments:[{name:'Mass Retail',count:1540},{name:'Premium / Wealth',count:280},{name:'SME',count:160}],
    products:['ATM Cash Withdrawal','Debit Cards'],
    churnProbability:'4.2% of affected customers within 90 days if unresolved',
    calcText:'Value = average relationship revenue per segment × churn-probability uplift × affected customers per segment, weighted toward the 6 highest-frequency ATM sites.',
    sources:['Call Centre & branch concern logs (14 days)','ATM journal reconciliation exports','Social media mentions (corroborating only)'],
    assumptions:['Assumes non-dispense cases without a branch visit are still recoverable via self-service claim','Hardware fault correlation is based on site ID, not yet confirmed by a physical audit']
  },
  valueProtectedDetail:{
    confidence:'AI Modelled', customers:18,
    calcText:'Early modelled estimate based on the partial reduction in repeat contacts since the pre-debit fault-detection pilot began at 2 of the 6 flagged sites; will be revised once all 6 sites are covered.',
    sources:['ATM journal reconciliation, pilot sites only'],
    assumptions:['Pilot-site results are assumed to generalize to the remaining 4 sites — not yet confirmed']
  },
  intervention:{
    immediate:'Auto-refund confirmed non-dispense cases within 24 hours without requiring a branch visit.',
    experience:'Show a clear on-screen and SMS confirmation of dispense success/failure at the moment of the transaction, not just an account-level debit entry.',
    system:'Add pre-debit dispenser-fault detection so the host system does not post a debit if the dispenser reports a fault.',
    prevention:'Prioritize a hardware audit and replacement schedule for the 6 highest-frequency ATM sites; add fault-code monitoring to catch degrading hardware before it causes non-dispense events.',
    recommended:[
      {title:'Pre-debit dispenser-fault detection', impact:'Very High — stops the problem at the source', effort:'Medium', urgency:'High', confidence:70, dependencies:'ATM switch vendor change request', owner:'Technology'},
      {title:'24h auto-refund for confirmed non-dispense cases', impact:'High — removes the manual reconciliation wait for customers', effort:'Low', urgency:'High', confidence:80, dependencies:'Reconciliation team capacity', owner:'Customer Service'},
      {title:'Hardware audit of 6 flagged ATM sites', impact:'Medium — addresses root cause but slower to land', effort:'High', urgency:'Medium', confidence:64, dependencies:'Capital budget approval', owner:'Technology'}
    ]
  },
  actions:{'Technology':'Add pre-debit dispenser-fault detection.','Customer Service':'Auto-refund confirmed non-dispense cases within 24h.'},
  owner:'Head of ATM Operations', target:'Reduce non-dispense debit cases by 55%', deadline:'2026-08-20', startedAt:'2026-07-05',
  impact:{before:{volume:264, repeat:520, negSentiment:79, churn:60, value:260000000}, after:{volume:210, repeat:470, negSentiment:70, churnPrevented:18, valueProtected:60000000}}
 }
];

// Demo dataset for the Raised Concerns page — visible via demoRaisedConcerns.
export const RAISED_CONCERNS_SEED = [
 {id:'CCI-10065', channel:'Call Centre', customer:'Priyantha K. (Existing)', journey:'Money Transfer', lang:'English', raw:'Debit without successful credit on interbank transfer.', summary:'Debit without successful credit on interbank transfer. Matches 1,240 similar concerns, +180% in 14 days.', severity:'high', sentiment:'angry', status:'linked', linked:'PRB-2044', createdAt:'2026-07-10 08:42', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Technology', region:'Colombo Fort', repeatCount:4, financialImpact:85000, relatedConcernsCount:6, updatedAt:'2026-07-16 11:20', externalTicketStatus:'In Progress', tags:['repeat','cefts'], triageOverride:'repeat', workflowStatus:'in-progress', demoRaisedConcerns:true},
 {id:'CCI-10066', channel:'Mobile App', customer:'Nadeesha S. (New)', journey:'Card Payment', lang:'English', raw:'Card declined at POS despite sufficient balance.', summary:'Card declined at POS despite sufficient balance. First reported instance this week.', severity:'medium', sentiment:'frustrated', status:'new', linked:null, createdAt:'2026-07-12 09:15', createdBy:'admin', assignee:'Sanduni Rajapakse', assignedDepartment:'Cards', region:'Galle Face', repeatCount:0, financialImpact:12500, relatedConcernsCount:0, updatedAt:'2026-07-17 14:20', externalTicketStatus:'Waiting', tags:['pos'], triageOverride:'raised-new', workflowStatus:'waiting-customer', demoRaisedConcerns:true},
 {id:'CCI-10067', channel:'Email', customer:'Ruwan D. (Existing)', journey:'Loan Application', lang:'English', raw:'Loan approval delayed beyond SLA for 9 days.', summary:'Loan approval delayed beyond SLA for 9 days. Customer has contacted twice previously without resolution.', severity:'high', sentiment:'very-angry', status:'linked', linked:'PRB-2047', createdAt:'2026-07-13 02:31', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'Loans', region:'Negombo', repeatCount:2, financialImpact:2500000, relatedConcernsCount:1, updatedAt:'2026-07-15 16:40', externalTicketStatus:'Open', tags:['sla','escalation'], triageOverride:'escalation', workflowStatus:'assigned-department', demoRaisedConcerns:true},
 {id:'CCI-10068', channel:'Social Media', customer:'Anonymous (Public Post)', journey:'Digital Banking', lang:'English', raw:'App login failures reported across multiple public posts.', summary:'App login failures reported across multiple public posts in the last 6 hours, concentrated 6-9 PM.', severity:'medium', sentiment:'negative', status:'analyzing', linked:null, createdAt:'2026-07-14 17:00', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:1, financialImpact:0, relatedConcernsCount:3, updatedAt:'2026-07-14 18:10', externalTicketStatus:'Open', tags:['spike','login'], triageOverride:'spike', workflowStatus:'assigned-member', demoRaisedConcerns:true},
 {id:'CCI-10069', channel:'Branch', customer:'Kumari W. (Existing)', journey:'Account Opening', lang:'English', raw:'Documentation requested twice for the same account opening request.', summary:'Documentation requested twice for the same account opening request, causing delay.', severity:'low', sentiment:'neutral', status:'new', linked:null, createdAt:'2026-07-15 01:02', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'Customer Service', region:'Kandy', repeatCount:1, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-15 01:02', externalTicketStatus:'—', tags:['onboarding'], triageOverride:'raised-new', workflowStatus:'new', demoRaisedConcerns:true},
 {id:'CCI-10070', channel:'WhatsApp', customer:'Chathura P. (Existing)', journey:'Bill Payment', lang:'English', raw:'Utility bill payment shows as failed in-app but amount was deducted.', summary:'Utility bill payment shows as failed in-app but amount was deducted. Third report this month.', severity:'high', sentiment:'angry', status:'new', linked:null, createdAt:'2026-07-16 14:30', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:3, financialImpact:8500, relatedConcernsCount:2, updatedAt:'2026-07-16 15:05', externalTicketStatus:'Open', tags:['repeat','bill_pay'], triageOverride:'repeat', workflowStatus:'in-progress', demoRaisedConcerns:true},
 // Resolved earlier this week — feeds the 7-day chart
 {id:'CCI-10071', channel:'Call Centre', customer:'Amali F. (Existing)', journey:'Card Payment', lang:'English', raw:'Temporary card block lifted after travel was confirmed.', summary:'Travel-related card block resolved after customer confirmed itinerary with the branch.', severity:'medium', sentiment:'neutral', status:'linked', linked:null, createdAt:'2026-07-14 10:05', createdBy:'admin', assignee:'Sanduni Rajapakse', assignedDepartment:'Cards', region:'Colombo Fort', repeatCount:0, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-15 16:40', closedAt:'2026-07-15 16:40', externalTicketStatus:'Resolved', tags:['cards'], triageOverride:'raised-new', workflowStatus:'resolved', demoRaisedConcerns:true},
 {id:'CCI-10072', channel:'Branch', customer:'Heshan M. (Existing)', journey:'Account Opening', lang:'English', raw:'Missing NIC copy for joint account — customer returned with documents.', summary:'Joint account opening completed after customer provided the missing NIC copy.', severity:'low', sentiment:'positive', status:'linked', linked:null, createdAt:'2026-07-13 11:20', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'Customer Service', region:'Colombo Fort', repeatCount:0, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-16 09:15', closedAt:'2026-07-16 09:15', externalTicketStatus:'Resolved', tags:['onboarding'], triageOverride:'raised-new', workflowStatus:'closed', demoRaisedConcerns:true},
 // Resolved today — populates Resolved Today KPI
 {id:'CCI-10073', channel:'Call Centre', customer:'Dilrukshi P. (Existing)', journey:'Bill Payment', lang:'English', raw:'Duplicate utility payment reversed same day.', summary:'Duplicate bill payment reversed and credited back within the same business day.', severity:'medium', sentiment:'frustrated', status:'linked', linked:null, createdAt:'2026-07-17 08:40', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:1, financialImpact:4200, relatedConcernsCount:0, updatedAt:'2026-07-18 09:22', closedAt:'2026-07-18 09:22', externalTicketStatus:'Resolved', tags:['bill_pay'], triageOverride:'raised-new', workflowStatus:'resolved', demoRaisedConcerns:true},
 {id:'CCI-10074', channel:'Branch', customer:'Nimal R. (Existing)', journey:'Money Transfer', lang:'English', raw:'Branch-assisted CEFTS retry succeeded after first attempt timed out.', summary:'Customer completed interbank transfer successfully on retry at the counter.', severity:'high', sentiment:'frustrated', status:'linked', linked:null, createdAt:'2026-07-17 15:10', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Technology', region:'Colombo Fort', repeatCount:0, financialImpact:95000, relatedConcernsCount:1, updatedAt:'2026-07-18 08:05', closedAt:'2026-07-18 08:05', externalTicketStatus:'Resolved', tags:['cefts'], triageOverride:'raised-new', workflowStatus:'closed', demoRaisedConcerns:true},
 {id:'CCI-10075', channel:'Branch', customer:'Sajith K. (Existing)', journey:'Loan Application', lang:'English', raw:'Customer waiting on income document checklist for housing loan.', summary:'Housing loan application paused pending salary slip and bank statement from customer.', severity:'medium', sentiment:'neutral', status:'analyzing', linked:null, createdAt:'2026-07-16 11:45', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'Loans', region:'Colombo Fort', repeatCount:0, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-17 10:00', externalTicketStatus:'Waiting', tags:['loans'], triageOverride:'raised-new', workflowStatus:'waiting-customer', demoRaisedConcerns:true},
];

export const CONCERNS_SEED = [
 {id:'CCI-10032', channel:'Call Centre', customer:'W.A. Perera (existing)', journey:'Money Transfer', lang:'Sinhala', raw:'"Mama salli evva, eth receiver ta ganne na. Mudalata gaththa, credit unath na."', summary:'Transferred money to another bank but the receiver never got it — funds debited without credit.', severity:'critical', sentiment:'angry', status:'linked', linked:'PRB-2044', createdAt:'2026-07-08 19:12', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Technology', region:'Colombo Fort', repeatCount:2, financialImpact:75000, relatedConcernsCount:5, updatedAt:'2026-07-09 10:15', externalTicketStatus:'In Progress', tags:['cefts','high_value']},
 {id:'CCI-10033', channel:'Email', customer:'S. Jayawardena (existing)', journey:'Money Transfer', lang:'English', raw:'"I transferred Rs. 45,000 to my supplier via interbank transfer at 7:40 PM and it still shows pending. The money left my account but has not reached them."', summary:'Interbank transfer stuck in pending status since evening peak hours; debit confirmed, credit not received.', severity:'critical', sentiment:'angry', status:'linked', linked:'PRB-2044', createdAt:'2026-07-08 20:05', createdBy:'admin', assignee:'Sanduni Rajapakse', assignedDepartment:'Technology', region:'Colombo Fort', repeatCount:1, financialImpact:45000, relatedConcernsCount:5, updatedAt:'2026-07-09 08:40', externalTicketStatus:'In Progress', tags:['cefts','sme']},
 {id:'CCI-10034', channel:'Branch', customer:'M.F. Rizwan (existing)', journey:'Money Transfer', lang:'English', raw:'Customer visited Kandy branch, showed transaction history — Rs. 120,000 debited for interbank transfer, receiver bank confirms nothing received.', summary:'In-branch escalation of a failed interbank transfer, high value, receiver bank confirms non-receipt.', severity:'critical', sentiment:'frustrated', status:'linked', linked:'PRB-2044', createdAt:'2026-07-08 11:20', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Technology', region:'Kandy', repeatCount:0, financialImpact:120000, relatedConcernsCount:5, updatedAt:'2026-07-08 16:55', externalTicketStatus:'Open', tags:['cefts','vip']},
 {id:'CCI-10035', channel:'App Review', customer:'Anonymous (Play Store)', journey:'Money Transfer', lang:'English', raw:'"App said transfer successful but money never arrived at the other end. 2nd time this month. Fix your system!!" ★☆☆☆☆', summary:'Public 1-star review reporting repeat failed transfer with false success confirmation in-app.', severity:'high', sentiment:'angry', status:'linked', linked:'PRB-2044', createdAt:'2026-07-07 21:44', createdBy:'system', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:2, financialImpact:25000, relatedConcernsCount:4, updatedAt:'2026-07-08 09:00', externalTicketStatus:'Open', tags:['app_review','repeat']},
 {id:'CCI-10036', channel:'Social Media', customer:'@nimal_rk (Twitter/X)', journey:'Money Transfer', lang:'Code-mixed', raw:'"@BankSL evening 7 ta try karapu transfer eka ain fail una, mudal ain ne. Anyone else?"', summary:'Public social post about a failed evening transfer; multiple replies reporting the same issue.', severity:'high', sentiment:'frustrated', status:'linked', linked:'PRB-2044', createdAt:'2026-07-07 19:58', createdBy:'system', assignee:'Dilani W.', assignedDepartment:'Digital Banking', region:'Online', repeatCount:1, financialImpact:18000, relatedConcernsCount:4, updatedAt:'2026-07-08 11:30', externalTicketStatus:'Open', tags:['social','spike']},
 {id:'CCI-10037', channel:'Existing System', customer:'K.D. Silva (existing)', journey:'Money Transfer', lang:'English', raw:'Legacy helpdesk ticket #HD-88213 imported via CSV — "transfer debited, not credited, escalated to ops, unresolved after 4 days."', summary:'Historical unresolved helpdesk ticket matching the same failed-transfer pattern.', severity:'high', sentiment:'frustrated', status:'linked', linked:'PRB-2044', createdAt:'2026-06-29 09:10', createdBy:'system', assignee:'Sanduni Rajapakse', assignedDepartment:'Technology', region:'Kurunegala', repeatCount:3, financialImpact:62000, relatedConcernsCount:5, updatedAt:'2026-07-05 14:20', externalTicketStatus:'Blocked', tags:['legacy','escalation']},

 {id:'CCI-10041', channel:'Branch', customer:'T. Gunawardena (new)', journey:'KYC / Onboarding', lang:'English', raw:'Applicant\'s NIC copy rejected twice with no reason given by the system; had to redo scan 3 times.', summary:'KYC document rejected repeatedly without a stated reason during branch onboarding.', severity:'high', sentiment:'frustrated', status:'linked', linked:'PRB-2045', createdAt:'2026-07-06 10:40', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'Customer Service', region:'Matara', repeatCount:2, financialImpact:0, relatedConcernsCount:2, updatedAt:'2026-07-07 12:00', externalTicketStatus:'Open', tags:['kyc','onboarding']},
 {id:'CCI-10042', channel:'Call Centre', customer:'R. Abeysekera (new)', journey:'KYC / Onboarding', lang:'Sinhala', raw:'"Mage documents 2 varak reject unaa, mokakda wenne kiyala kiyanne na."', summary:'Customer confused after repeated KYC document rejection with no explanation.', severity:'medium', sentiment:'frustrated', status:'linked', linked:'PRB-2045', createdAt:'2026-07-05 14:22', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'Customer Service', region:'Colombo Fort', repeatCount:1, financialImpact:0, relatedConcernsCount:2, updatedAt:'2026-07-06 09:10', externalTicketStatus:'Open', tags:['kyc']},
 {id:'CCI-10043', channel:'Email', customer:'A. Fonseka (new)', journey:'KYC / Onboarding', lang:'English', raw:'"I have tried opening my account 3 times online and my ID keeps getting rejected. Is something wrong with your system?"', summary:'Onboarding abandonment risk after repeated KYC document rejection.', severity:'medium', sentiment:'frustrated', status:'linked', linked:'PRB-2045', createdAt:'2026-07-04 16:05', createdBy:'system', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:3, financialImpact:0, relatedConcernsCount:2, updatedAt:'2026-07-05 11:45', externalTicketStatus:'In Progress', tags:['kyc','abandonment']},

 {id:'CCI-10045', channel:'Call Centre', customer:'N. de Silva (existing)', journey:'Cards', lang:'English', raw:'"My card got blocked the moment I landed in Singapore, no warning at all, I had no cash for 2 days."', summary:'Card blocked without notice during overseas travel, no travel-notice offered.', severity:'medium', sentiment:'angry', status:'linked', linked:'PRB-2046', createdAt:'2026-07-06 08:15', createdBy:'admin', assignee:'Sanduni Rajapakse', assignedDepartment:'Fraud', region:'International', repeatCount:0, financialImpact:95000, relatedConcernsCount:1, updatedAt:'2026-07-07 15:30', externalTicketStatus:'In Progress', tags:['travel','cards']},
 {id:'CCI-10046', channel:'App Review', customer:'Anonymous (App Store)', journey:'Cards', lang:'English', raw:'"Card blocked while travelling with zero notification. Embarrassing at checkout." ★★☆☆☆', summary:'Public review describing card block while travelling with no advance notice.', severity:'medium', sentiment:'frustrated', status:'linked', linked:'PRB-2046', createdAt:'2026-07-03 22:30', createdBy:'system', assignee:'Sanduni Rajapakse', assignedDepartment:'Fraud', region:'Online', repeatCount:0, financialImpact:40000, relatedConcernsCount:1, updatedAt:'2026-07-04 10:00', externalTicketStatus:'Open', tags:['travel','app_review']},

 {id:'CCI-10050', channel:'Call Centre', customer:'H. Bandara (existing)', journey:'Standing Orders', lang:'Sinhala', raw:'"Mage standing order eka 2 varak debit una mema masaye ithiripura dawase."', summary:'Standing order debited twice at month-end for the same payment.', severity:'high', sentiment:'angry', status:'linked', linked:'PRB-2048', createdAt:'2026-06-30 09:50', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Technology', region:'Gampaha', repeatCount:1, financialImpact:32000, relatedConcernsCount:1, updatedAt:'2026-07-02 13:20', externalTicketStatus:'In Progress', tags:['double_debit']},
 {id:'CCI-10051', channel:'Branch', customer:'D. Wickrama (existing)', journey:'Standing Orders', lang:'English', raw:'Customer flagged duplicate standing-order debit on statement, requested manual reversal.', summary:'Duplicate standing-order debit confirmed on statement at month-end.', severity:'high', sentiment:'frustrated', status:'linked', linked:'PRB-2048', createdAt:'2026-06-30 13:05', createdBy:'admin', assignee:'Sanduni Rajapakse', assignedDepartment:'Technology', region:'Nugegoda', repeatCount:0, financialImpact:18500, relatedConcernsCount:1, updatedAt:'2026-07-01 09:40', externalTicketStatus:'Resolved', tags:['double_debit']},

 {id:'CCI-10054', channel:'App Review', customer:'Anonymous (Play Store)', journey:'Cards', lang:'English', raw:'"Chatbot just keeps looping when I try to dispute a card charge. Useless." ★☆☆☆☆', summary:'Chatbot fails to resolve card dispute intent, loops customer without escalation.', severity:'low', sentiment:'frustrated', status:'linked', linked:'PRB-2049', createdAt:'2026-07-01 12:15', createdBy:'system', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:0, financialImpact:8500, relatedConcernsCount:0, updatedAt:'2026-07-02 16:00', externalTicketStatus:'Open', tags:['chatbot','dispute']},

 {id:'CCI-10056', channel:'Call Centre', customer:'P. Rathnayake (existing)', journey:'ATM', lang:'Sinhala', raw:'"ATM eken salli ain una, eth cash ain awe na. Statement eke debit ekak thiyenawa."', summary:'ATM withdrawal debited the account but did not dispense cash.', severity:'critical', sentiment:'angry', status:'linked', linked:'PRB-2050', createdAt:'2026-07-08 21:40', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'ATM Operations', region:'Maharagama', repeatCount:1, financialImpact:15000, relatedConcernsCount:1, updatedAt:'2026-07-09 08:05', externalTicketStatus:'In Progress', tags:['atm','non_dispense']},
 {id:'CCI-10057', channel:'Branch', customer:'S. Kumarasinghe (existing)', journey:'ATM', lang:'English', raw:'Customer reported ATM did not dispense cash at Nugegoda branch ATM but account was debited Rs. 20,000.', summary:'Non-dispense ATM debit reported in person, awaiting manual reconciliation.', severity:'critical', sentiment:'frustrated', status:'linked', linked:'PRB-2050', createdAt:'2026-07-08 10:12', createdBy:'admin', assignee:'Dilani W.', assignedDepartment:'ATM Operations', region:'Nugegoda', repeatCount:0, financialImpact:20000, relatedConcernsCount:1, updatedAt:'2026-07-08 14:50', externalTicketStatus:'Open', tags:['atm','non_dispense']},

 {id:'CCI-10058', channel:'Call Centre', customer:'A. Ranasinghe (existing)', journey:'Account Services', lang:'English', raw:'"My entire savings account balance shows Rs. 0 after a system update overnight. This is my life savings, I need this fixed immediately."', summary:'Isolated critical case — full account balance shows zero after an overnight system update; needs urgent individual investigation.', severity:'critical', sentiment:'angry', status:'new', linked:null, createdAt:'2026-07-09 07:10', createdBy:'admin', assignee:'Sanduni Rajapakse', assignedDepartment:'Technology', region:'Colombo Fort', repeatCount:0, financialImpact:1250000, relatedConcernsCount:0, updatedAt:'2026-07-09 07:45', externalTicketStatus:'Open', tags:['critical','balance']},
 {id:'CCI-10059', channel:'Call Centre', customer:'W.A. Perera (existing)', journey:'Money Transfer', lang:'Sinhala', raw:'"Api kalin call eken kiyapu transfer eka gena thawa call ekak. Reference eka CCI-10032."', summary:'Follow-up call from the same customer referencing an already-logged concern (CCI-10032) about the same failed transfer.', severity:'critical', sentiment:'angry', status:'linked', linked:'PRB-2044', createdAt:'2026-07-08 19:40', createdBy:'admin', assignee:'Ishara Jayasuriya', assignedDepartment:'Technology', region:'Colombo Fort', repeatCount:3, financialImpact:75000, relatedConcernsCount:5, updatedAt:'2026-07-09 10:15', externalTicketStatus:'In Progress', tags:['duplicate','cefts'], triageOverride:'duplicate'},

 {id:'CCI-10060', channel:'Email', customer:'L. Herath (existing)', journey:'Loans', lang:'English', raw:'"Just checking on my loan application status again, no update in 2 weeks."', summary:'Loan applicant checking in due to lack of status visibility (resolved pattern).', severity:'medium', sentiment:'neutral', status:'linked', linked:'PRB-2047', createdAt:'2026-05-20 09:30', createdBy:'system', assignee:'Dilani W.', assignedDepartment:'Loans', region:'Battaramulla', repeatCount:2, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-06-01 11:00', externalTicketStatus:'Resolved', tags:['loans','status']},

 {id:'CCI-10062', channel:'Call Centre', customer:'C. Weerasinghe (existing)', journey:'Account Services', lang:'English', raw:'"I need my address updated on my account, the branch said it would take a week."', summary:'Routine address-update request, no pattern match, standard service request.', severity:'low', sentiment:'neutral', status:'new', linked:null, createdAt:'2026-07-09 08:05', createdBy:'admin', assignee:'—', assignedDepartment:'Customer Service', region:'Dehiwala', repeatCount:0, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-09 08:05', externalTicketStatus:'—', tags:[], triageOverride:'not-a-concern'},
 {id:'CCI-10063', channel:'Branch', customer:'G. Mendis (new)', journey:'Account Opening', lang:'English', raw:'New customer had a question about minimum balance requirements for a savings account.', summary:'General product inquiry captured at branch, not a complaint.', severity:'low', sentiment:'positive', status:'new', linked:null, createdAt:'2026-07-09 09:30', createdBy:'admin', assignee:'—', assignedDepartment:'Customer Service', region:'Moratuwa', repeatCount:0, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-09 09:30', externalTicketStatus:'—', tags:[], triageOverride:'not-a-concern'},
 {id:'CCI-10064', channel:'Email', customer:'V. Peiris (existing)', journey:'Digital Banking App', lang:'English', raw:'"The app logged me out repeatedly this morning, quite annoying but I could still log back in each time."', summary:'Intermittent session timeout on mobile app, low severity, isolated so far.', severity:'low', sentiment:'frustrated', status:'analyzing', linked:null, createdAt:'2026-07-09 07:50', createdBy:'system', assignee:'Ishara Jayasuriya', assignedDepartment:'Digital Banking', region:'Online', repeatCount:0, financialImpact:0, relatedConcernsCount:0, updatedAt:'2026-07-09 12:20', externalTicketStatus:'Open', tags:['session']},
 ...RAISED_CONCERNS_SEED,
];

export const ACTIONS_SEED = [
 {id:'ACT-501', problem:'PRB-2044', team:'Technology', title:'Investigate peak-hour interbank transfer failures at CEFTS gateway', intervention:'CEFTS gateway timeout fix + auto-reversal logic', targetMetric:'Confirm root cause within 10 days', currentResult:'Timeout spike confirmed 6–9 PM; fix design in progress', progressPct:40, customerOutcome:'Fewer transfers stuck in limbo once live', owner:'Tech Ops — Sanduni R.', deadline:'2026-07-18', status:'in-progress', notes:['Pulled gateway logs for last 14 days — timeout spike confirmed 6–9 PM.']},
 {id:'ACT-502', problem:'PRB-2044', team:'Digital Banking', title:'Add real-time failed/pending transaction status + push notification', intervention:'Real-time failed/pending status + push notification', targetMetric:'Ship accurate status + notification within 3 weeks', currentResult:'Design review scheduled with Product', progressPct:25, customerOutcome:'Customers see accurate status instead of a false "Success"', owner:'Ishara Jayasuriya', deadline:'2026-07-25', status:'in-progress', notes:['Design review scheduled with Product this week.']},
 {id:'ACT-503', problem:'PRB-2044', team:'Customer Service', title:'Proactively contact the 2,100 customers showing repeated frustration', intervention:'Immediate customer response — proactive outreach', targetMetric:'Contact 2,100 affected customers', currentResult:'1,860 of 2,100 contacted (89%)', progressPct:89, customerOutcome:'Reassured customers, fewer repeat calls', owner:'CX Team — Dilani W.', deadline:'2026-07-15', status:'done', notes:['1,860 of 2,100 customers contacted as of today.']},
 {id:'ACT-504', problem:'PRB-2044', team:'Product', title:'Redesign failed-transfer recovery journey (auto-refund + in-app tracking)', intervention:'Failed-transfer recovery journey redesign', targetMetric:'Ship auto-refund + in-app tracking journey', currentResult:'Not started', progressPct:0, customerOutcome:'Faster, self-service recovery when a transfer fails', owner:'Unassigned', deadline:'—', status:'todo', notes:[]},
 {id:'ACT-505', problem:'PRB-2044', team:'Leadership', title:'Assign owner and 30-day deadline; review weekly', intervention:'Ownership & governance', targetMetric:'Assign owner + 30-day deadline', currentResult:'Owner confirmed 2026-07-09; weekly review scheduled', progressPct:100, customerOutcome:'Clear accountability for the fix', owner:'Ishara Jayasuriya — Head of Digital Banking', deadline:'2026-08-08', status:'done', notes:['Owner and target confirmed 2026-07-09.']},

 {id:'ACT-511', problem:'PRB-2045', team:'Product', title:'Add clear rejection-reason messaging to onboarding flow', intervention:'Add rejection-reason messaging to onboarding flow', targetMetric:'Cut re-submission rate by 50%', currentResult:'Not started — awaiting design slot', progressPct:0, customerOutcome:'Customers understand why a document was rejected', owner:'Unassigned', deadline:'—', status:'todo', notes:[]},
 {id:'ACT-512', problem:'PRB-2045', team:'Digital Banking', title:'Standardize document scan-quality checks across branches', intervention:'Standardize scan-quality checks across branches', targetMetric:'Equalize rejection rate across branches', currentResult:'Branch audit scheduled', progressPct:10, customerOutcome:'Consistent onboarding experience regardless of branch', owner:'Ishara Jayasuriya', deadline:'2026-07-30', status:'todo', notes:[]},

 {id:'ACT-521', problem:'PRB-2046', team:'Technology', title:'Add self-service travel-notice option in app', intervention:'Self-service travel-notice option in app', targetMetric:'Reduce travel-related blocks by 40%', currentResult:'Not started', progressPct:0, customerOutcome:'Cards keep working while customers travel', owner:'Unassigned', deadline:'—', status:'todo', notes:[]},

 {id:'ACT-531', problem:'PRB-2048', team:'Technology', title:'Make standing-order batch job idempotent on retry', intervention:'Make standing-order batch job idempotent on retry', targetMetric:'Eliminate duplicate debits at next month-end run', currentResult:'Root cause confirmed; fix in code review', progressPct:55, customerOutcome:'No more surprise double debits at month-end', owner:'Ishara Jayasuriya', deadline:'2026-07-20', status:'in-progress', notes:['Root cause confirmed — retry logic reruns full batch on partial failure.']},

 {id:'ACT-541', problem:'PRB-2049', team:'Digital Banking', title:'Add dedicated card-dispute intent with human handoff', intervention:'Add dedicated dispute intent with human handoff', targetMetric:'Cut chatbot abandonment on disputes by 80%', currentResult:'Not started', progressPct:0, customerOutcome:'Disputes get resolved instead of looping', owner:'Ishara Jayasuriya', deadline:'2026-08-01', status:'todo', notes:[]},

 {id:'ACT-551', problem:'PRB-2050', team:'Technology', title:'Add pre-debit ATM dispenser-fault detection', intervention:'Pre-debit dispenser-fault detection', targetMetric:'Reduce non-dispense debit cases by 55%', currentResult:'6 highest-frequency sites identified; pilot live at 2 sites', progressPct:35, customerOutcome:'Cash and debit always match at the ATM', owner:'Ishara Jayasuriya', deadline:'2026-07-28', status:'in-progress', notes:['6 highest-frequency ATM sites identified for hardware audit.']},
 {id:'ACT-552', problem:'PRB-2050', team:'Customer Service', title:'Auto-refund confirmed non-dispense ATM cases within 24h', intervention:'24h auto-refund for confirmed non-dispense cases', targetMetric:'Refund all confirmed cases within 24h', currentResult:'Running at 24h for 90% of cases', progressPct:90, customerOutcome:'Faster resolution when cash isn\'t dispensed', owner:'CX Team — Dilani W.', deadline:'2026-07-16', status:'in-progress', notes:[]}
];

// Maps the short screen ids used in ROLES.home / nav config to actual Next.js routes.
export const ROUTE_MAP = {
  dash: '/dashboard',
  mydash: '/my-dashboard',
  queue: '/queue',
  mine: '/mine',
  problems: '/problems',
  actions: '/actions',
  mytasks: '/mytasks',
  deptqueue: '/department-queue',
};
