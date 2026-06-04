import type { LevelDefinition } from '@shared/puzzle';
import type { IPuzzleRuleSet } from './IPuzzleRuleSet';
import { PushBlocksRuleSet } from './PushBlocksRuleSet';

export class RuleSetRegistry {
  private readonly rules: IPuzzleRuleSet[] = [new PushBlocksRuleSet()];

  resolve(level: LevelDefinition): IPuzzleRuleSet {
    const rule = this.rules.find((r) => r.canHandle(level));
    if (!rule) {
      throw new Error(`No rule set registered for puzzle type: ${level.puzzleType}`);
    }
    return rule;
  }

  register(rule: IPuzzleRuleSet): void {
    this.rules.push(rule);
  }
}

export const ruleSetRegistry = new RuleSetRegistry();
