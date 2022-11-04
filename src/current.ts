import { TFile } from 'obsidian';
import { Cache, CurrentApi, Frontmatter, MetaData, MetadataApi, Sections, UpdateOptions } from './api';

/**
 * Access to current metadata
 */

export class CurrentMetadata implements CurrentApi {
  private _api: MetadataApi;

  constructor(metaApi: MetadataApi) {
    this._api = metaApi;
  }

  get Data(): MetaData  {
    return this._api.get() as MetaData;
  }

  get data(): MetaData {
    return this.Data;
  }

  get Note(): TFile {
    const current = app.workspace.getActiveFile();
    if (!current) {
      throw "No Current File";
    }

    return current;
  }

  get note(): TFile {
    return this.Note;
  }

  get Path(): string {
    const note: TFile = this.Note;
    let path = note.path;
    if (note.extension) {
      path = path.slice(0, 0 - (note.extension.length + 1));
    }

    return path;
  }

  get path(): string {
    return this.Path;
  }

  get PathEx(): string {
    return this.note.path;
  }

  get pathex(): string {
    return this.PathEx;
  }

  get Matter(): Frontmatter {
    return this._api.frontmatter() as Frontmatter;
  }

  get matter(): Frontmatter {
    return this.Matter;
  }

  get Cache(): Cache {
    return this._api.cache() as Cache;
  }

  get cache(): Cache {
    return this.Cache;
  }

  get Sections(): Sections {
    return this._api.sections() as Sections;
  }

  get sections(): Sections {
    return this.Sections;
  }
  patch(frontmatterData: any, propertyName: string | null = null, options: UpdateOptions = {toValuesFile: false, prototype: false}): any | object {
    return this._api.patch(this.path, frontmatterData, propertyName, options);
  }

  set(frontmatterData: any, options: UpdateOptions = {toValuesFile: false, prototype: false}): any | object {
    return this._api.set(this.path, frontmatterData, options);
  }

  clear(frontmatterProperties: string | Array<string> | object | null = null, options: UpdateOptions = {toValuesFile: false, prototype: false}) {
    return this._api.clear(this.path, frontmatterProperties, options);
  }
}