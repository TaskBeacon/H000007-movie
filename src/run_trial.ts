import {
  set_trial_context,
  type StimBank,
  type TaskSettings,
  type TrialBuilder
} from "psyflow-web";

export function run_trial(
  trial: TrialBuilder,
  condition: string,
  context: {
    settings: TaskSettings;
    stimBank: StimBank;
    block_id: string;
    block_idx: number;
  }
): TrialBuilder {
  const { settings, stimBank, block_id, block_idx } = context;
  const condition_id = String(condition);
  const key_list = ((settings.key_list as string[]) ?? ["space"]).map(String);

  const preFixationUnit = trial.unit("pre_movie_fixation").addStim(stimBank.get("fixation"));
  set_trial_context(preFixationUnit, {
    trial_id: trial.trial_id,
    phase: "pre_movie_fixation",
    deadline_s: Number(settings.pre_movie_fixation_duration ?? 0),
    valid_keys: [...key_list],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "pre_movie_fixation",
      block_idx
    },
    stim_id: "fixation"
  });
  preFixationUnit.show({ duration: Number(settings.pre_movie_fixation_duration ?? 0) }).to_dict();

  const leadInUnit = trial.unit("movie_lead_in").addStim(stimBank.get("fixation"));
  set_trial_context(leadInUnit, {
    trial_id: trial.trial_id,
    phase: "movie_lead_in",
    deadline_s: Number(settings.movie_lead_in_duration ?? 0),
    valid_keys: [...key_list],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "movie_lead_in",
      block_idx
    },
    stim_id: "fixation"
  });
  leadInUnit.show({ duration: Number(settings.movie_lead_in_duration ?? 0) }).to_dict();

  const movieUnit = trial.unit("movie").addStim(stimBank.get("movie"));
  set_trial_context(movieUnit, {
    trial_id: trial.trial_id,
    phase: "movie_playback",
    deadline_s: Number(settings.movie_duration ?? 4),
    valid_keys: [],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "movie_playback",
      block_idx
    },
    stim_id: "movie"
  });
  movieUnit
    .captureResponse({
      keys: [],
      duration: Number(settings.movie_duration ?? 4),
      terminate_on_response: false
    })
    .to_dict();

  return trial;
}
