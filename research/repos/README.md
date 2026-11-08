# External source-code catalogue

This catalogue is append-only and numbered. Entries are discovery candidates, not claims that code has been vendored or audited. Before importing code, verify the upstream repository, current license file, commit/tag, dependency health, security posture, and compatibility. Prefer pinned dependencies or Git submodules over copying entire repositories.

| ID | Upstream project | Area | Intended Matrix Agent Hub use | Import status |
|---|---|---|---|---|
| REPO-0001 | [LangGraph](https://github.com/langchain-ai/langgraph) | Agent workflows | Stateful orchestration, checkpoints, human approval steps | Candidate; license and version review required |
| REPO-0002 | [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Coding agents | Sandboxed software engineering agent patterns | Candidate; license and version review required |
| REPO-0003 | [Mem0](https://github.com/mem0ai/mem0) | Agent memory | Long-term memory and retrieval | Candidate; license and version review required |
| REPO-0004 | [DeepChem](https://github.com/deepchem/deepchem) | Scientific ML | Chemistry and molecular research tooling | Candidate; scientific and license review required |
| REPO-0005 | [Boltz](https://github.com/jwohlwend/boltz) | Molecular modelling | Protein/ligand structure research experiments | Candidate; scientific and license review required |
| REPO-0006 | [RDKit](https://github.com/rdkit/rdkit) | Cheminformatics | Molecular representation and cheminformatics utilities | Candidate; license and version review required |

## Rules for adding entries

1. Assign the next unused ID; never recycle an ID.
2. Record the canonical upstream URL and the date discovered.
3. Verify the repository is not archived and inspect recent maintenance activity.
4. Read the actual LICENSE file; do not infer a license from a badge or description.
5. Record dependencies, security advisories, model/data terms, and hardware requirements.
6. Do not copy source into this repository until license compatibility and attribution obligations are understood.
7. Prefer a pinned upstream dependency, submodule, or small reviewed adapter. Keep third-party code clearly separated.
8. Run tests in an isolated Docker sandbox; never execute unknown repository scripts on the host.
9. For medical/chemical projects, use public research datasets and simulations only. Do not generate treatment instructions, dosing, or claims of clinical safety.

## Status meanings

- Candidate: discovered, not yet fully audited.
- Reviewed: license, maintenance, dependencies, and security checks completed.
- Integrated: a pinned dependency or reviewed adapter is included.
- Rejected: unsuitable; record the reason to avoid rediscovery.
