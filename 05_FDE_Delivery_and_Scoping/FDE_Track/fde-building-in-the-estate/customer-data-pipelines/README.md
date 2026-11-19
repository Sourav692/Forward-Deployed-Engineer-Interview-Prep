# Data pipelines in the customer's estate: lesson sources

These files are the source of the module `customer-data-pipelines` in the `fde-building-in-the-estate` track (Building inside the customer's estate). The site publishes them at `/learn/fde-building-in-the-estate/customer-data-pipelines` once they are written and wired in `site/src/lib/curriculum.ts`.

| # | Lesson | Site slug | Status |
|---|---|---|---|
| 1 | [ETL, ELT, batch or stream](01_ETL_ELT_Batch_or_Stream.md) | `etl-elt-batch-or-stream` | Published |
| 2 | [Incremental loads and watermarks](02_Incremental_Loads_and_Watermarks.md) | `incremental-loads-and-watermarks` | Published |
| 3 | [Duplicates and entity resolution](03_Duplicates_and_Entity_Resolution.md) | `duplicates-and-entity-resolution` | Published |
| 4 | [Schema drift and late data](04_Schema_Drift_and_Late_Data.md) | `schema-drift-and-late-data` | Published |
| 5 | [Backfills while live](05_Backfills_While_Live.md) | `backfills-while-live` | Published |
| 6 | [Practise customer data pipelines](06_Practise_Customer_Data_Pipelines.md) | `practise-customer-data-pipelines` | Published |

## Sources

Each lesson lists its primary sources (standards, vendor documentation, engineering books and papers) in its own References section. Each teaching lesson opens with a composite engagement: customers, names and figures are illustrative, not real customers, and each Limits section says so.

## Editing

Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`. File names are working titles until each lesson is written; the site slug is fixed once the lesson is published.
