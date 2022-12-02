import {
  CachedMetadata
} from "obsidian";
import {
  SMarkdownPage
} from "obsidian-dataview";
import { TaskResult } from "obsidian-dataview/lib/api/plugin-api";
import { Sections } from "./sections/sections";

/**
 * A full metadata set returned from MetaScryApi.get
 */
export type Metadata = {

  /**
   * The 'file' metadata object. This contains things about the file/note itself, such as the date it was made and edited, and it's path.
   * This info isn't written in the note anywhere.
   * This is compiled by Dataview
   *
   * @alias {@link Metadata.File}
   *
   * @see {@link MetaScryApi.get}
   * @see {@link MetaScryApi.file}
   * @see {@link MetaScryApi.dataviewFrontmatter}
   * @see {@link CurrentNoteMetaScryApi.note}
   * @see {@link CurrentNoteMetaScryApi.dataviewFrontmatter}
   */
  file?: FileData;

  /**
   * The 'file' metadata object. This contains things about the file/note itself, such as the date it was made and edited, and it's path.
   * This info isn't written in the note anywhere.
   * This is compiled by Dataview
   *
   * @alias {@link Metadata.file}
   *
   * @see {@link MetaScryApi.get}
   * @see {@link MetaScryApi.file}
   * @see {@link MetaScryApi.dataviewFrontmatter}
   * @see {@link CurrentNoteMetaScryApi.note}
   * @see {@link CurrentNoteMetaScryApi.dataviewFrontmatter}
   */
  File?: FileData;

  /**
   * The meta-scry api cache object for the file
   *
   * @alias {@link Metadata.Cache}
   * @alias {@link global#cache}
   *
   * @see {@link MetaScryApi.get}
   * @see {@link MetaScryApi.cache}
   * @see {@link CurrentNoteMetaScryApi.cache}
   */
  cache?: Cache;

  /**
   * The meta-scry api cache object for the file
   *
   * @alias {@link Metadata.cache}
   * @alias {@link global#cache}
   *
   * @see {@link MetaScryApi.get}
   * @see {@link MetaScryApi.cache}
   * @see {@link CurrentNoteMetaScryApi.cache}
   */
  Cache?: Cache;
} & Frontmatter;

/**
 * An internal cache for a note.
 */
export type Cache = {
  /**
   * A value cached by a key
   */
  [prpertyKey: string]: any;
} & Object;

/**
 * The frontmatter of a note.
 */
export type Frontmatter = {
  /**
   * A frontmatter property and value
   */
  [prpertyKey: string]: any;
} & Object;

/**
 * The data in the 'file' object provided by dataview.
 * Sections is added by the MetaScry Api.
 */
export type FileData = {

  /**
   * Sections under headings in the given file. You can load the content with md, html, and txt
   *
   * @alias {@link sections}
   */
  sections?: Sections;

  /**
   * Sections under headings in the given file. You can load the content with md, html, and txt
   *
   * @alias {@link sections}
   */
  Sections?: Sections;
} & Partial<SMarkdownPage["file"]>;

/**
 * Extension of cachedfilemetadata that just adds the path for internal use.
 */
export type CachedFileMetadata = CachedMetadata & {
  /**
   * Full path of the file the metadata is for.
   */
  path: string;
};

/**
 * Dataview style frontmatter data.
 */
export type DataviewMatter = {

  /**
   * The dv file object
   *
   * @see {@link Metadata.File}
   */
  file: FileData;
} & Frontmatter;

/**
 * Results for commands in the MetaScryApi can return one item, or a record tree of items, indexed by their paths.
 */
export type ScryResults<TResult>
  = ScryResult<TResult> | ScryResultMap<TResult>;

/**
 * A single item scry result.
 * (default for single)
 */
export type ScryResult<TResult>
  = TResult | undefined;

/**
 * A tree of result maps, with each item/sub-map indexed by a string key (usually the full path)
 * (default for multiuple)
 */
export type ScryResultMap<TResult> = {
  [path: string]: ScryResults<TResult>;
}

/**
 * Results for commands in the MetaScryApi can return one item, or a record tree of items, indexed by their paths.
 */
export type PromisedScryResults<TResult>
  = (PromisedScryResult<TResult> | ScryResultPromiseMap<TResult>)

/**
 * All scry results, awaiting a single promise. (default for single)
 */
export type PromisedScryResult<TResult>
  = Promise<ScryResults<TResult>>;

/**
 * A tree of maps promises for each scry result, indexed by a string key (default for multiple)
 */
export type ScryResultPromiseMap<TResult>
  = ScryResultMap<Promise<ScryResults<TResult>>>;
