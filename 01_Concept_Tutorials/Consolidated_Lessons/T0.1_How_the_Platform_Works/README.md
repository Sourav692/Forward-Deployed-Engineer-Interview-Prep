# T0.1 How the Platform Works: Consolidated Lessons

These lessons are the site's teaching copy of module T0.1 "How the course works". Each concept is taught once, in the house tutorial format, drawing only on the repository sources below. The site publishes them at `/learn/orientation/how-the-platform-works`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [How the Material Is Built](01_How_the_Material_Is_Built.md) | `how-the-material-is-built` |
| 2 | [Choose a Reading Path](02_Choose_a_Reading_Path.md) | `choose-a-reading-path` (retired) |
| 3 | [Find Material by Interview Area](03_Find_Material_by_Interview_Area.md) | `find-material-by-interview-area` (retired) |

Lessons 2 and 3 are no longer published (11 October 2026). The site's `/start` page is the one place to choose a path, and "path" there means the role paths only, so the three reading paths in lesson 2 would contradict it. Lesson 3 maps the repository's folders, which site visitors cannot open. Their old URLs redirect to lesson 1, which links to `/start`.

## Sources

- `01_Concept_Tutorials/FDE_Handbook/00_Orientation/01_How_To_Use_This_Handbook.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/00_Orientation/README.md` (own material): the orientation checkpoint.
- `00_Start_Here/REPOSITORY_COVERAGE_GUIDE.md` (own material). Its `09_Study_Plans/` row indexes a purchased third-party library and is not repeated. Its "What the site publishes" section predates the Learn section and is not repeated either.

The source files stay in the repository unchanged. The site no longer publishes `how-to-use-this-handbook` and `repository-coverage-guide` as separate lessons; old URLs redirect to lessons here. The module is ready: the site walkthrough and the path diagnostic live on `/start`, which lesson 1 links to.

Every claim and number in these lessons comes from the sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
