# Metadata Scrier Api for Obsidian
This is a plugin for [Obsidian](https://obsidian.md) that adds JS coding tools right into your notes and codeblocks to help easily read sections, metadata, and caches of files, and provides tools to update and edit frontmatter and other metadatas as well. 
Turn your vault into a *frontend, backend, and database* all in one!

## Features
 - Create, Edit, Delete, Update, and Retreive the data of YAML/Frontmatter, Inline [Dataview](https://github.com/blacksmithgu/obsidian-dataview)[editing/updating::WIP], and other Metadata properties of your notes quickly and easily from any executable code-block, templater snippet, or custom js class file within your vault.
 - The ability to quickly access markdown, plain-text, and rendered html under specific headings in your files, with support for embeddings and [Dataview](https://github.com/blacksmithgu/obsidian-dataview) and JSX code blocks/inlines.
 - The ability to store data temporatily between code-blocks in the same note using a cache.
 - The ability to store data perminantly and access it between notes using special value data storage files right in your vault.
 - Utilities to easily access and set deeply nested YAML/JSON/jsObject properties.
 - Utilities to help you access the current and nearby file's datas quicker.
 - The ability to quickly make and revoke your own globals (if you know what you're doing)
 - Syntax and utilities that prioritize both readability and speed. Most functions and properties have multiple aliases to fit different note and code styles, and front-matter data keys are splayed across kebab-case to camelCase and lowercase keys.

## Installation
### Dependencies
This plugin requires the following Obsidian plugins to be installed as dependencies prior to being activated:
  - [Copy As Html](https://github.com/mvdkwast/obsidian-copy-as-html) (**For:** *Converting to html and plain text from markdown source with imbeded blocks included.*)
  - [Dataview](https://github.com/blacksmithgu/obsidian-dataview) (**For:** *Speed and Inline Support*)
  - [ODP Metadata Edit Library](https://github.com/OPD-libs/OPD-libs/tree/main/libs/OPD-metadata-lib)  (**For:** *Basic Api for Updating Frontmatter and Dataview Inline Values*)

### Plugin Installation
After the above dependencies have been installed, you can install this plugin via the Obsidian Community Plugins menu, or manually:

#### Manual Plugin Installation
To manually install this plugin, copy the `manifest.json` and `main.js` from the release you want and add them to a new plugin folder named `meta-scry` within your `.obsidian` folder of your Vault.

## Api
The api is mostly built off of the class [[MetadataScrier]] (which extends the [[MetaScryApi]] interface) in `meta.ts`/`main.js`.
This api is designed to help you quickly edit and access metadata and retrieve whole sections of any file easily.
**For a full list of all available properties and methods, see the [Full Documentation](https://github.com/Meep-Tech/obsidian-metadata-api-plugin/tree/master/docs)**

### Global API Access
You can access the api from anywhere you use js in obsidian with a few handy variables:

### Access the MetaScryApi
You can access the full api via the global variable: [[Globals/meta|meta]], via the standards js app api path, or via one of the [[Scry and scry|Scry]] variables:
```
//example frontmatter:
---
name: jeff
count: 20
---
```
```
// access values via:
const {name, count} = meta.data;
```

```
//   or:
const {
  Data: metadata,
  Current: {
    Matter: {
      name,
      count
    }
    Cache
  }
} = meta;

```

```
//   or:
const {
  Data: metadata,
  Current: {
    Matter: {
      name,
      count
    }
    Cache
  }
} = scry;
```

```
//   or:
my.data.frontMatterValue;
```

```
//   or:
Note.FrontMatter.frontMatterKey;
```

```
//   or:
const {
  Data: metadata,
  Current: {
    Matter: frontmatter,
    Cache: cache,
    Sections: {
      FirstHeading,
      AnotherHeading
    }
  }
} = app.plugins.plugins["meta-scry"].api;
```

```
//   or:
const {
  Data: metadata,
  Current: {
    Matter: frontmatter,
    Cache: cache
  }
} = Scry.Api;
```

#### Cache
You can also access the current file's cache via the global variable `cache`:
```
// set:
cache["name"] = "tim";
cache["color"] = "blue";
```

```
// get:
const {
  name
} = cache;
```

```
//   vs from meta:
const {
  Current: {
    Cache: {
      name
    }
  }
} = meta;
```
**NOTE**: The names of the three global variables: (`path`, `cache`, and `meta`) can be changed in the settings. The name of `scry` cannot, but the variable can be disabled.

### Metadata Fetching
The api provides several ways to fetch several different kinds of metadata.
This api packages the metadata update functions from [Dataview](https://github.com/blacksmithgu/obsidian-dataview) and [Obsidian](https://obsidian.md)'s own api into an easy to use api with increased flexability.

The current file can be accessed via the [current](docs/Api/Properties/Current.md) property on the [meta](docs/Api//Globals/Metadata.md) global variable.
The [sources](docs/Metadata Sources.md) of metadata can be specified via different functions to fetch data from just the frontmatter, or the frontmatter plus dataview, or the frontmatter, dataview, cache, and other file info sources:
- [get](docs/Api/Functions/MetaScryApi/get.md)
- [omfc](docs/Api/Functions/MetaScryApi/omfc.md)
- [dv](docs/Api/Functions/MetaScryApi/dv.md)
- [frontmatter](docs/Api/Functions/MetaScryApi/frontmatter.md)
- [cache](docs/Api/Functions/MetaScryApi/cache.md)
- [prototypes](docs/Api/Functions/MetaScryApi/prototypes.md)
- [values](docs/Api/Functions/MetaScryApi/values.md)

### Metadata Edit Functions
This api packages the metadata update functions from [Metaedit](https://github.com/chhoumann/MetaEdit) into an easy to use api with the following functions:
- [set](docs/Api/Functions/set.md) (Set an entire file's frontmatter at once)
- [patch](docs/Api/Functions/patch.md) (Patch/Update parts of a file's frontmatter)
- [clear](docs/Api/Functions/clear.md) (Clear and remove the whole frontmatter of a file, or just certain properties)

**NOTE**: These functions can only modify the frontmatter of a note, they cannot currently modify dataview inline variables, cache values, or other file metadata values.

### Path helper
The [path](docs/Api/Functions/path.md) method can be used to access notes using relative paths from the current one:
```
const {file} = meta.get(meta.path("../Next Door/Neighbor"));
```

### Object Property Helper Methods
This plugin api provides methods to help with accessing 'deep' properies in js objects. This is usefull for accessing metadata that you're not sure exists.
EX:
```
// this allows you to set a potential nickname and other metadata while defaulting to the name if that's all that was provided:

const {metadata} = meta.Current;

metadata.getProp("name.nickname", metadata.name);
```

**NOTE:** These instance methods are only available if the "Declare Object Property Helper Methods" option is enabled in the app's plugin settings.

## Data Storage Solutions
This plugin comes with several super simple data storage and retreival solutions to aid in creating things like enumerations, prototypes, data tables, and archetypes.

### Cache
Each file has it's own cache object.
This cache is designed to work between different types of codeblocks within the same note. This allows you to store custom js values easily between codeblocks in the same note without needing to modify global state yourself!

**NOTE**: This cache is not a consistent data storage system and only exists in-memory. This means it may be cleared or re-set when you close the note or close or refeesh the Obsidian app.

EX:
*node.md:* 
```
---
name:
  first: John
  last: Madden
---
```dataview
const {
  name {
    first: firstName,
    last: lastName
  }
} = meta.Current;

cache["fullName"] = `${firstName} ${lastName}`;
``'
# Full Name
```jsx:
<p>{cache.fullName}</p>
'``
```

### Data Values
This plugin provides a system for storing easily accessable data in specific files via YAML.

You can set the Data Values Path in the Data Storage Settings in the Obsidian app plugin settings to point to a specific folder. This folder will be assumed to have `.md` files containing YAML data.

You can instantly access these YAML files as objects using the `values` method of the API described above, and edit them using the `toDataFile` property of the Patch, Set, and Clear methods described above.

### Data Prototypes
Prototypes provide a similar, but alternate storage to Data Values using the `prototypes` function and `prototype` variable. This provides an alternate data storage for your metadata's metadata!
