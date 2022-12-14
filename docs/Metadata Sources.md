This plugin can fetch note 'metadata' from several sources:

# FileMetadata
*The 'file' field containing metadata about the file itself*
**source**: Dataview Api
**included in**: [get](Api/Functions/MetaScryApi/Metadata%20Fetchers/get.md)(default), [dv](Api/Functions/MetaScryApi/Metadata%20Fetchers/dv.md), [Data](Api/Properties/MetaScryApi/Data.md)

# Frontmatter
*The Frontmatter (YAML at the top of a note)*
**source**: Obsidian Api or Dataview Api
**included in**: [get](Api/Functions/MetaScryApi/Metadata%20Fetchers/get.md)(default), [frontmatter](Api/Functions/MetaScryApi/Metadata%20Fetchers/frontmatter.md), [dv](Api/Functions/MetaScryApi/Metadata%20Fetchers/dv.md), [Data](Api/Properties/MetaScryApi/Data.md)

# DataviewInline
*Inline Dataview data fields*
**source**: Dataview Api
**included in**: [get](Api/Functions/MetaScryApi/Metadata%20Fetchers/get.md)(default), [dv](Api/Functions/MetaScryApi/Metadata%20Fetchers/dv.md), [Data](Api/Properties/MetaScryApi/Data.md)

# FileCache
*Cached values from the Metadata.Cache. These are accessable via a 'cache' property in the returned data object.*
**source**: Metadata Api
**included in**: [get](Api/Functions/MetaScryApi/Metadata%20Fetchers/get.md)(default), [cache](Api/Properties/Global/cache.md), [cache](Api/Functions/MetaScryApi/Metadata%20Fetchers/cache.md), [Data](Api/Properties/MetaScryApi/Data.md)

# Sections
*Provides a compiled list of sections in the note and info on them, as well as access to apis to render and fetch the text and markdown within the section itself*
**source**: Metadata Api
**included in**: [get](Api/Functions/MetaScryApi/Metadata%20Fetchers/get.md)(default)