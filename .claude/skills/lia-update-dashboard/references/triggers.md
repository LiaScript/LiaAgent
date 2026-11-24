# update-dashboard — automatic triggers

Run this task automatically after any task that changes project state:

- `:init-course`, `:scaffold`, `:analyze-existing`, `:create-mini-course`, `:activate-section`
- `:create-outline`, `:create-didactics`, `:create-agenda`
- `:configure-agent`, `:suggest-templates`, `:manage-templates`, `:create-learner-persona`
- `:create-session`, `:promote-session`, `:build-session`
- `:coauthor-materials` after approval, `:quick-fix`
- `:validate-course`, `:review-as-persona`
- `:save-notes` or `:save-decision`
- `:create-project` or `:update-project`
- Development-Agent: `:develop-template` (its `__State:__` changes) and `:publish-template`
- Artist-Agent: `:create-visuals`, `:create-logo`, `:create-image`, `:generate-image`, `:apply-theme`, `:review-images`
- `:try-as-learner` when it saved changes (they go through `:quick-fix`, which triggers this task)
