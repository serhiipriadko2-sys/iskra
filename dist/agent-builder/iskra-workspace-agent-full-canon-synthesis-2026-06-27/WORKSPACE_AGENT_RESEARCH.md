# ChatGPT Workspace Agent Research

Status: current official-source summary
Checked: 2026-06-27

## Findings

[FACT] ChatGPT Workspace Agents are built and refined in Agent Builder, can be
previewed before publishing, and can include tools, apps, custom MCPs, skills,
and files.

[FACT] Agent Builder can expose ChatGPT, schedule, Slack, and API channels. The
API channel uses a stable public `agtch_...` trigger id.

[FACT] The Workspace Agent API trigger endpoint is
`POST https://api.chatgpt.com/v1/workspace_agents/{id}/trigger`. `202 Accepted`
means the event was queued/accepted; the API does not currently return a public
run id or final agent response.

[FACT] Workspace Agent API calls use Workspace Agent access tokens provisioned
from ChatGPT admin access-token flow. They are not ordinary OpenAI Platform API
keys.

[FACT] Skills are reusable workflows that may include instructions, examples,
supporting files, and code. Uploading a skill requires source review; platform
scanning does not replace project security review.

## Sources

- https://help.openai.com/en/articles/20001143-chatgpt-workspace-agents-for-enterprise-and-business
- https://developers.openai.com/workspace-agents/trigger-runs
- https://developers.openai.com/workspace-agents/authentication
- https://help.openai.com/en/articles/20001066-skills-in-chatgpt

## Implications For Iskra

- The package must not conflate Agent Builder Files with Workspace Agent Memory.
- Live publish, instruction replacement, file upload, skill upload, app changes,
  and deployment/channel changes are live mutations requiring explicit approval.
- API tests can prove trigger acceptance only; behavioral verification needs
  ChatGPT/Builder output evidence or another supported result channel.
- Skills should stay small and task-oriented; the full canon belongs in files
  and consolidated knowledge, not only in skill instructions.

Delta: official Workspace Agent boundaries are encoded into the package.
Data: official OpenAI Help and Developers pages checked on 2026-06-27.
Omega: 0.86 because product documentation can change quickly.
Lambda: refresh before any live upload, API-channel change, or broad availability
claim.
