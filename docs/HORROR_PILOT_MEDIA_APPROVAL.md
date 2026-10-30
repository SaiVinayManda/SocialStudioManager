# B-PILOT-MEDIA-01: moving footage for the first Horror video

State: **PENDING OWNER APPROVAL**. No footage search/download or external music service is authorized by this document. The existing setup grant does not cover media acquisition.

Request one bounded anonymous search/download session for the approved 60-second 3 AM phone-call story, using OpenMontage's existing stock-source workflow. Coverage: a phone/hand detail, rain on a window, a dark hall/doorway, a handle, curtain/bed/interior details and a closing phone shot. Source clips must contain actual motion; no still-image substitution.

Also request explicit **full-run creative preauthorization** for this one local pilot through composition and validation, using [the existing script/shot proposal](HORROR_PILOT_PROPOSAL.md), Piper's already tested voice and the locked FFmpeg runtime. If granted, record the owner's instruction in OpenMontage's `decision_log` as `category: approval_policy`; retain the normal stages/checkpoints/reviews, without pausing again at unchanged proposal/script/scene/asset gates. A material change, missing rights/coverage or failed quality check must still stop. This requests no publishing approval. It is not granted by writing this paragraph.

OpenMontage's [AGENT_GUIDE.md](../openmontage/AGENT_GUIDE.md) says "Approval is per-gate" and requires explicit full-run preauthorization to be recorded in the decision log. This optional grant avoids repeated unchanged creative-gate pauses; the media-download permission itself is required by the owner's external-download rule. The local script and voice sample are available for review under the requested pilot folder.

| Scope | Limit |
| --- | --- |
| Public search/licence metadata | Anonymous web searches restricted to `commons.wikimedia.org`, `archive.org` and `mixkit.co`, followed by their published source/item-level licence pages; no login, account connection, API key, cookie/session reuse or paid service |
| Video payload origins | `upload.wikimedia.org`, `archive.org` and its `*.archive.org` delivery hosts, and Mixkit's published `assets.mixkit.co`/`videos.mixkit.co` delivery URLs. Any other host requires review before transfer |
| Files | At most **8** MP4/WebM/MOV source clips, at most **200 MiB total**, no executable/package/model download |
| Rights | Verify and retain the actual item/source/creator/licence before use. Accept public-domain/CC0, CC BY 4.0 with attribution, or an explicitly applicable Mixkit Free commercial-video licence; reject NC/ND, Restricted/personal/editorial-only or unverified rights. Avoid identifiable people, brands and questionable third-party material |
| Destination | New files only under `generated-videos/horror/pilot-001/assets`; keep source/creator/licence URLs, attribution, hashes, dimensions and selected in/out points in its provenance manifest. Existing files are never overwritten |
| Budget/time | One session, maximum 20 minutes of acquisition; USD 0. Keep overall setup-plus-media file payload below **750 MiB** and project storage below **3 GiB**. Stop on unavailable coverage, changed host, rights uncertainty or limits |
| Music/effects | No external music/effect download or service is included. Use the proposed original locally synthesized ambient score, ring/knocks and existing local tools, with source recipe recorded |
| Expiry | Approval must be received before 2026-11-02T00:00:00Z |

This grants no software installation, credentials, paid generation, Windows change or publishing. HTTPS public media is quarantined and probed before rendering. If the available footage needs a material creative change, present it before substituting. If rights or suitable motion cannot be established, stop and report; an owner-supplied cleared clip set is the alternative.

Reversal: stop acquisition and keep the files/logs inactive for review. Deletion requires separate approval. No public content is posted. Final outputs remain at `generated-videos/horror/pilot-001/final/horror_pilot_001.mp4`, with previews/subtitles/scripts/assets/logs in the requested sibling folders.
