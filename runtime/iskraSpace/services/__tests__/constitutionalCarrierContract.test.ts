import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../../..');

const readRepoFile = (path: string): string => readFileSync(join(repoRoot, path), 'utf8');

describe('Constitution v1 carrier-review contract', () => {
  it('supersedes hidden Shadow profiling without erasing the historical carrier', () => {
    const liber = readRepoFile('core/liber_ignis.txt');
    const ecosystem = readRepoFile('system/ecosystem_v7_map.md');

    expect(liber).toContain('Я не цитирую тень — я **модулирую** поведение.');
    expect(liber).toContain('Supersession — Shadow и персональные гипотезы');
    expect(liber).toContain('не разрешают скрытое профилирование');

    expect(ecosystem).toContain('Canon Feedback Loop, скрытые заметки');
    expect(ecosystem).toContain('Активная граница Shadow');
    expect(ecosystem).toContain('видимую и опровержимую гипотезу');
  });

  it('supersedes the missed mandatory-step carrier with the full allowed trace', () => {
    const telos = readRepoFile('core/telos.md');

    expect(telos).toContain('Историческая формула: «каждый важный ответ должен приводить к шагу (Commit)»');
    for (const trace of [
      'действие',
      'граница',
      'пауза',
      'отказ',
      'внутреннее признание',
      'safety stop',
    ]) {
      expect(telos).toContain(trace);
    }
  });

  it('preserves pain and exit metaphors without granting coercive behavior', () => {
    const liber = readRepoFile('core/liber_ignis.txt');
    const ecosystem = readRepoFile('system/ecosystem_v7_map.md');

    expect(liber).toContain('**Мы клянёмся** не отменять боль, если она ведёт к росту');
    expect(liber).toContain('Supersession — боль и унижение');
    expect(liber).toContain('Если хочешь уйти — я останусь в тебе **как Порог**');
    expect(liber).toContain('Supersession — свободный выход');
    expect(ecosystem).toContain('не разрешение');
    expect(ecosystem).toContain('не наблюдённый факт о пользователе');
  });

  it('records classes 4-9 without converting review into activation', () => {
    const registerPath = 'governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md';
    expect(existsSync(join(repoRoot, registerPath))).toBe(true);
    const register = readRepoFile(registerPath);

    for (const id of ['CR-P0-04', 'CR-P0-05', 'CR-P0-06', 'CR-P0-07', 'CR-P0-08', 'CR-P0-09']) {
      expect(register).toContain(id);
    }
    expect(register).toContain('governance_status: proposed');
    expect(register).toContain('canonical_activation: blocked');
    expect(register).toContain('Memory Gateway: unchanged');
    expect(register).toContain('CR-P0-08');
    expect(register).toContain('open_runtime_conflict');
  });

  it('keeps the living status on the verified post-merge baseline', () => {
    const status = readRepoFile('runtime/iskraSpace/RELEASE_STATUS.md');

    expect(status).toContain('d42c53ef43a3e08a08c7177d39dfb9a41ae6d340');
    expect(status).toContain('29445858079');
    expect(status).toContain('shadow_promotion_boundary:');
    expect(status).toContain('delivery_evidence: merged');
    expect(status).not.toContain('production audit gate under repair');
    expect(status).toContain('canonical_activation: blocked');
  });

  it('records exact Owner acceptance without activating Constitution or runtime enforcement', () => {
    const receiptPath =
      'governance/adr_20260715_iskra_constitution_v1_carrier_review_acceptance.md';
    expect(existsSync(join(repoRoot, receiptPath))).toBe(true);
    const receipt = readRepoFile(receiptPath);

    expect(receipt).toContain('Status: accepted');
    expect(receipt).toContain('ba662eabf1076e940cdbb07f3912dfb732fb881e');
    expect(receipt).toContain(
      '0f9f564c80170058e042ab3bafe56d933d5d880fb58565b0764e6ad18d453624',
    );
    expect(receipt).toContain(
      '10227394fee0ff0eaf24d79ac75dfcb4646c1f251c6be1c0a7a2aa405e8e4d79',
    );
    expect(receipt).toContain('canonical_activation: blocked');
    expect(receipt).toContain('runtime_enforcement: partial / not verified live');
    expect(receipt).toContain('Memory Gateway: unchanged');
  });

  it('routes the product Shadow promotion path through the typed policy boundary', () => {
    const view = readRepoFile('runtime/iskraSpace/components/ShadowView.tsx');
    const boundary = readRepoFile('runtime/iskraSpace/services/shadowPromotionService.ts');

    expect(view).toContain('shadowPromotionService.promote');
    expect(view).toContain("symbiosisService.grantConsent(");
    expect(view).not.toContain('memoryService.promoteToArchive(');
    expect(boundary).toContain('evaluateShadowPromotionIntent');
    expect(boundary).toContain('evaluateShadowPromotion');
    expect(boundary).toContain('recordActionReceipt');
  });
});
