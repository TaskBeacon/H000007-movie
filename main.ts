import {
  BlockUnit,
  StimBank,
  SubInfo,
  TaskSettings,
  TrialBuilder,
  count_down,
  mountTaskApp,
  next_trial_id,
  parsePsyflowConfig,
  reset_trial_counter,
  type CompiledTrial,
  type Resolvable,
  type StimRef,
  type StimSpec
} from "psyflow-web";

import configText from "./config/config.yaml?raw";
import { run_trial } from "./src/run_trial";
import { resolveMovieConditions } from "./src/utils";

function buildWaitTrial(
  meta: { trial_id: string; condition: string; trial_index: number },
  blockId: string | null,
  unitLabel: string,
  stimInputs: Array<Resolvable<StimRef | StimSpec | null>>
): CompiledTrial {
  const trial = new TrialBuilder({
    trial_id: meta.trial_id,
    block_id: blockId,
    trial_index: meta.trial_index,
    condition: meta.condition
  });
  trial.unit(unitLabel).addStim(...stimInputs).waitAndContinue();
  return trial.build();
}

export async function run(root: HTMLElement): Promise<void> {
  const parsed = parsePsyflowConfig(configText, import.meta.url);
  const settings = TaskSettings.from_dict(parsed.task_config);
  const subInfo = new SubInfo(parsed.subform_config);
  const stimBank = new StimBank(parsed.stim_config);

  settings.triggers = parsed.trigger_config;

  await mountTaskApp({
    root,
    task_id: "H000007-movie",
    task_name: "Movie Watching Task",
    task_description: "HTML preview aligned to the local psyflow Movie Watching task procedure and parameters.",
    settings,
    subInfo,
    stimBank,
    buildTrials: (): CompiledTrial[] => {
      reset_trial_counter();
      const compiledTrials: CompiledTrial[] = [];

      const instructionInputs: Array<Resolvable<StimRef | StimSpec | null>> = [stimBank.get("instruction_text")];
      if (settings.voice_enabled) {
        instructionInputs.push(stimBank.get("instruction_text_voice"));
      }
      compiledTrials.push(
        buildWaitTrial(
          { trial_id: "instruction", condition: "instruction", trial_index: -1 },
          null,
          "instruction",
          instructionInputs
        )
      );

      const blockId = "block_0";
      compiledTrials.push(
        ...count_down({
          seconds: 3,
          block_id: blockId,
          trial_id_prefix: "countdown_block_0",
          stim: {
            color: "white",
            height: 3.5
          }
        })
      );

      const block = new BlockUnit({
        block_id: blockId,
        block_idx: 0,
        settings
      }).generate_conditions({
        func: resolveMovieConditions
      });

      block.conditions.forEach((condition, trialIndex) => {
        const trial = new TrialBuilder({
          trial_id: next_trial_id(),
          block_id: block.block_id,
          trial_index: trialIndex,
          condition
        });
        run_trial(trial, condition, {
          settings,
          stimBank,
          block_id: block.block_id,
          block_idx: 0
        });
        compiledTrials.push(trial.build());
      });

      const goodbyeInputs: Array<Resolvable<StimRef | StimSpec | null>> = [stimBank.get("good_bye")];
      if (settings.voice_enabled) {
        goodbyeInputs.push(stimBank.get("good_bye_voice"));
      }
      compiledTrials.push(
        buildWaitTrial(
          {
            trial_id: "goodbye",
            condition: "goodbye",
            trial_index: Number(settings.total_trials ?? 0)
          },
          null,
          "goodbye",
          goodbyeInputs
        )
      );

      return compiledTrials;
    }
  });
}

export async function main(root: HTMLElement): Promise<void> {
  await run(root);
}

export default main;
