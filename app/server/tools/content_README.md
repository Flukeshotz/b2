# B2 content — full export

Every piece of learning content in the Skillcase B2 app, one JSON file per
unit, with answers. Generated from the live database by
`app/server/tools/export_content_tree.js`; do not hand-edit — change the
source and re-run the export.

```
content/
├── 1-placement-test/        10 comparable 15-min diagnostic tests (core-2026b-v1…v10) + _blueprint.json
├── 2-practice/              practice papers, grouped exactly like the app's 4 Home tiles
│   ├── reading/             reading + grammar + vocabulary drills (the app lists them under Reading)
│   ├── listening/
│   ├── writing/
│   └── speaking/
│       └── <tile>/goethe | telc | skillcase/<paper-id>.json
├── 3-full-exam-papers/      complete multi-part mock exams — goethe/ and telc/
├── 4-lessons/               guided B2 lessons ("Themen") — the `topics` table, level b2
├── 5-learning-experiences/  the step sequences lessons are built from
├── 6-sources/               listening/reading source texts: scripts, transcripts, audio
├── 7-writing-tasks-and-rubrics/
│   ├── rubrics/             scoring rubrics (dimensions, scale, pass marks)
│   └── tasks/               standalone writing prompts
├── 8-interview-practice/    job-interview question bank + model answers
├── 9-reference/             capability spine, audio registry, one legacy exam section
├── 10-admin-upload/         folders 1–3 converted to the /b2admin upload JSON format (see its README)
├── _database/               SQL data dump of every content table (load instead of re-seeding)
└── manifest.json            counts + list of every file
```

`skillcase` = content written in-house (board `custom` in the database).
`goethe` / `telc` = content in those boards' exam formats (not official papers).

## Paper file shape (folders 1, 2, 3)

```jsonc
{
  "id": "core-2026b-v4", "board": "custom", "title": "…", "minutes": 15,
  "item_count": 24,
  "sections": [{
    "module": "lesen | hoeren | sprachbausteine | schreiben | sprechen",
    "skill":  "reading | listening | grammar | vocabulary | writing | speaking",
    "instruction": "…", "passage": "reading text or null",
    "audio": { "file": "/b2/audio/<name>.mp3", "duration_seconds": 51.7 } ,
    "listening_script": [{ "speaker": "…", "text": "…" }],   // placement tests
    "items": [{
      "item_no": 1, "item_type": "MCQ", "capability": "structure", "difficulty": "B",
      "stem": "question", "options": ["…"], "payload": { /* type-specific data */ },
      "suggested_answer": { /* see below */ },
      "explanation": "why the answer is right, in German"
    }]
  }]
}
```

### `suggested_answer` by item type

| item_type | `key` (raw) | readable form |
|---|---|---|
| MCQ | option index | `text`: the correct option |
| TRUE_FALSE | `true`/`false` | `text`: Richtig / Falsch |
| MULTI_SELECT | index list | `text`: the correct options |
| MATCHING | `{left: right}` index map | `text`: "left → right" pairs |
| ORDERING | index order | `text`: items in correct order |
| GAP_FILL | accepted words per gap | `text`: "a / b" per gap |
| SHORT_TEXT / LONG_TEXT / SPOKEN_RESPONSE | `null` — open answer | see below |

Open tasks (writing and speaking) have no single right answer. They carry:

- `guidance` — the points a strong B2 answer covers
- `expected_answer` — one B2-level model answer at the task's length
- `task_guidance` / `author_criteria` — what the task itself / its author specified
- `expected_answer_status: "AI_DRAFT_UNREVIEWED"` — drafted by the project's
  LLM (`tools/generate_model_answers.js`); a teacher should review before
  learners see them.

## Audio

`audio.file` paths are served by the app from `app/server/public` and
`app/client/public` (same relative path). The placement tests' dialogue text
is in `listening_script`.

## Review status

Items are `AUTO_QA_PASS` at most: structurally audited (answer keys resolve,
comparable test structure, no duplicates) but **no native-speaker/SME review
yet**. See `B2_PRACTICE_TEST_PRD.md` §9.
