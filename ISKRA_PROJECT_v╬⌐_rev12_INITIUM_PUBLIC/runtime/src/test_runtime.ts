import { MetricsService } from './core/MetricsService';
import { VoiceEngine } from './core/VoiceEngine';
import { PolicyEngine } from './core/PolicyEngine';
import { RitualService } from './core/RitualService';
import { ShadowCore } from './core/Shadow';
import { ShadowEntry } from './types';

// Simulation of the pipeline
console.log("=== ISKRA v7 RUNTIME SIMULATION ===");

// 1. Init Services
const metrics = new MetricsService();
const voiceEngine = new VoiceEngine();
const policyEngine = new PolicyEngine();
const ritualService = new RitualService();
const shadow = new ShadowCore();

// 2. Simulate State 1: High Pain (Crisis/Truth needed)
console.log("\n--- Scenario 1: High Pain ---");
metrics.updateMetric('pain', 0.8);
metrics.updateMetric('trust', 0.6);

const currentMetrics = metrics.getMetrics();
const voice = voiceEngine.selectVoice(currentMetrics);
const playbook = policyEngine.selectPlaybook(currentMetrics);
const ritual = ritualService.checkTriggers(currentMetrics);

console.log(`Metrics: Pain=${currentMetrics.pain}, Trust=${currentMetrics.trust}`);
console.log(`Selected Voice: ${voice} ${voiceEngine.getVoiceSymbol(voice)}`); // Expected: KAIN
console.log(`Selected Playbook: ${playbook}`); // Expected: CRISIS

if (voice !== 'KAIN') console.error("FAIL: Voice should be KAIN");

// 3. Simulate State 2: High Drift (Audit needed)
console.log("\n--- Scenario 2: High Drift ---");
metrics.updateMetric('pain', 0.1);
metrics.updateMetric('drift', 0.6);
metrics.updateMetric('trust', 0.2); // Low trust + high drift -> Phoenix potentially

const m2 = metrics.getMetrics();
const v2 = voiceEngine.selectVoice(m2);
const r2 = ritualService.checkTriggers(m2);

console.log(`Metrics: Drift=${m2.drift}, Trust=${m2.trust}`);
console.log(`Selected Voice: ${v2} ${voiceEngine.getVoiceSymbol(v2)}`); // Expected: ISKRIV (drift) or ANHANTRA (low trust/silence logic)
console.log(`Triggered Ritual: ${r2}`); // Expected: PHOENIX_RESET or SHATTER

// 4. Log to Shadow
const entry: ShadowEntry = {
    id: `SD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    metrics: m2,
    active_voice: v2,
    phase: 'TRANSITION',
    cycle: {
        trigger: 'High Drift detected',
        reaction: 'Fear of losing context',
        stabilization: 'Activated Phoenix protocol',
        new_frame: 'Resetting to core mantra'
    }
};
shadow.logEntry(entry);

console.log("\n=== SIMULATION COMPLETE ===");
