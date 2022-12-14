import { Plugin } from 'obsidian';
import {
  MetaScryApi
} from "./types/fetching/scrier";
import {
  MetaScryPluginApi, AppWithPlugins
} from "./types/plugin";
import { MetaScryPluginSettings } from "./types/settings";
import {
  Keys,
  DefaultPluginSettings,
  MetascryPluginDepencencies
} from "./constants";
import { InternalStaticMetadataScrierPluginContainer } from "./static";
import { MetadataScrierPluginSettingTab } from './settings';
import {
  ContainsDeepProperty,
  GetDeepProperty,
  IsFunction,
  IsObject,
  SetDeepProperty,
  TryToGetDeepProperty
} from './utilities';
import { ThenDoCallback } from './types/datas';

/**
 * Metadata Scrier Api Obsidian.md Plugin
 *
 * @internal
 */
export default class MetadataScrierPlugin extends Plugin implements MetaScryPluginApi {
  private _settings: MetaScryPluginSettings;
  // TODO: why is this unused? Did i forget to log and unload these?   
  private _addedGlobals: string[];

  //#region Api Access

  get Api(): MetaScryApi {
    return InternalStaticMetadataScrierPluginContainer.Api;
  }

  get api(): MetaScryApi {
    return InternalStaticMetadataScrierPluginContainer.Api;
  }

  get key(): string {
    return Keys.MetadataScrierPluginKey;
  }

  get settings(): MetaScryPluginSettings {
    return this._settings;
  }

  //#endregion

  //#region Initialization

  async onload(): Promise<void> {
    super.onload();
    await this.loadSettings();
    this.addSettingTab(new MetadataScrierPluginSettingTab(this.app, this));

    this._initApi();
  }

  onunload(): void {
    this._deinitApi();
  }

  async loadSettings(): Promise<void> {
    this._settings = Object.assign({}, DefaultPluginSettings, await this.loadData());
  }

  async updateSettings(newSettings: MetaScryPluginSettings): Promise<void> {
    // reset the api when settings are updated.
    this._deinitApi();

    // save settings
    await this.saveData({
      ...this.settings,
      newSettings
    });

    // reinit
    this._initApi();
  }

  tryToSetExtraGlobal(key: string, setValue: any = undefined): boolean {
    if (arguments.length == 2) {
      const [addedOnDesktop, addedOnMobile] = this._tryToAddToGlobals(key, setValue);
      return addedOnDesktop || addedOnMobile;
    } else {
      const [goneOnDesktop, goneOnMobile] = this._tryToRemoveFromGlobals(key);
      return goneOnDesktop && goneOnMobile;
    }
  }

  tryToGetExtraGlobal(key: string): any | undefined {
    try {
      return typeof global !== 'undefined'
        // @ts-ignore: Global Scope
        ? global[key]
        // @ts-ignore: Global Scope
        : window[key];
    } catch {
      return undefined;
    }
  }

  private _initApi(): void {
    this._verifyDependencies();

    const includeReactComponents
      = IsObject((app as AppWithPlugins)
        .plugins
        .plugins[Keys.ReactComponentsPluginKey]);

    InternalStaticMetadataScrierPluginContainer
      .InitalizeStaticApi({
        plugin: this,
        includeReactComponents
      });

    this._initGlobals();
    this._initHelperMethods();
  }

  /** 
   * if one of the dependenies is missing, disable the plugin and warn the user.
   * // TODO: remove when all dependencies are in npm
   * 
   * @throws Error on missing required dependency. This also disables the plugin on a dependency failure.
   */
  private _verifyDependencies(): void {
    const plugins = (app as AppWithPlugins).plugins.enabledPlugins;
    const missingDependencies =
      MetascryPluginDepencencies.filter(dependency => !plugins.has(dependency));

    if (missingDependencies.length) {
      const error =
        `Cannot initialize plugin: ${Keys.MetadataScrierPluginKey}. ` +
        ` the following dependency plugins are missing: ` +
        missingDependencies.join(", ") +
        `. (The ${Keys.MetadataScrierPluginKey} plugin has been automatically disabled. Please install the missing plugins and then try to re-enable this one!)`;

      (app as AppWithPlugins)
        .plugins
        .disablePlugin(Keys.MetadataScrierPluginKey);
      alert(error);
      throw error;
    }
  }

  //#region Object property and Global defenitions.

  private _initGlobals(): void {
    this._initGlobalPluginApis();
    this._initGlobalCache();
    this._initGlobalPath();
  }

  private _initHelperMethods(): void {
    this._initObjectPropertyHelperMethods();
    this._initArrayHelperMethods();
  }

  private _initObjectPropertyHelperMethods(): void {
    if (this.settings.defineObjectPropertyHelperFunctions) {
      Object.defineProperty(Object.prototype, Keys.HasPropObjectHelperFunctionKey, {
        /**
         * Find a deep property in an object, returning true on success.
         *
         * @param path Array of keys, or dot seperated propery key."
         * @param thenDo A[set of] callback[s] that takes the found value as a parameter. Defaults to just the onTrue method if a single function is passed in on it's own.
         
         * @returns true if the property exists, false if not.
         */
        value: function (path: string | Array<string>, thenDo?: ThenDoCallback) {
          if (thenDo) {
            return TryToGetDeepProperty(path, thenDo, this);
          } else {
            return ContainsDeepProperty(path, this);
          }
        },
        enumerable: false
      });

      Object.defineProperty(Object.prototype, Keys.GetPropObjectHelperFunctionKey, {
        /**
         * Get a deep property from an object, or return null.
         *
         * @param path Array of keys, or dot seperated propery key.
         * @param defaultValue (Optional) a default value to return, or a function to execute to get the default value.
         * @param defaultValueFunctionIsNotTheValueAndIsUsedToFetchTheValue If this is true, and the defaultValue passed in is a function, this will execute that function with no parameters to try to get the value. (defautls to true)
         *
         * @returns The found deep property, or undefined if not found.
         */
        value: function (path: string | Array<string>, defaultValue?: any, defaultValueFunctionIsNotTheValueAndIsUsedToFetchTheValue?: true | boolean) : any | undefined {
          const value = GetDeepProperty(path, this);
          if (defaultValue !== undefined && (value === undefined)) {
            if (defaultValueFunctionIsNotTheValueAndIsUsedToFetchTheValue && IsFunction(defaultValue)) {
              return defaultValue();
            } else {
              return defaultValue;
            }
          }

          return value;
        },
        enumerable: false
      });

      Object.defineProperty(Object.prototype, Keys.SetPropObjectHelperFunctionKey, {
        /**
         * Set a deep property in an object, even if it doesn't exist.
         *
         * @param path Array of keys, or dot seperated propery key.
         * @param value The value to set, or a function to update the current value and return it.
         * @param valueFunctionIsNotTheValueAndIsUsedToFetchTheValue If this is true, and the value passed in is a function, this will execute that function with no parameters to try to get the value. (defautls to true)
         */
        value: function (path: string | Array<string>, value: any, valueFunctionIsNotTheValueAndIsUsedToFetchTheValue?: true | boolean) : void {
          return SetDeepProperty(path, value, this, valueFunctionIsNotTheValueAndIsUsedToFetchTheValue);
        },
        enumerable: false
      });

    }
  }

  private _initArrayHelperMethods(): void {
    if (this.settings.defineArrayHelperFunctions) {
      Object.defineProperty(Array.prototype, Keys.IndexByArrayHelperFunctionKey, {
        /**
         * index an array of objects by a shared property with unique values among the
         * 
         * @param uniqueKeyPropertyPath The path to the unique key on each object to use as the index of the object in the returned record.
         * 
         * @returns An aggregate object with the original objects from the input list indexed by the value of the property at the provided key path.
         */
        value: function (uniqueKeyPropertyPath: string): Record<any, any> {
          const result: Record<any, any> = {};

          for (const i of this) {
            const key = i.getProp(uniqueKeyPropertyPath);
            if (key === undefined) {
              throw `Aggregation Key not found at path: ${uniqueKeyPropertyPath}.`;
            }

            if (result[key]) {
              throw `Key already exists in aggregate object, can't index another object by it: ${uniqueKeyPropertyPath}.`;
            } else {
              result[key] = i;
            }
          }

          return result;
        },
        enumerable: false
      });

      Object.defineProperty(Array.prototype, Keys.AggregateByArrayHelperFunctionKey, {
        /**
         * Aggregate an array of objects by a value
         * 
         * @param key The key to aggegate by. This uses getProp so you can pass in a compound key
         * 
         * @returns An object with arrays indexed by the value of the property at the key within the object.
         */
        value: function (key: string): Record<any, any[]> {
          const result: Record<any, any[]> = {};

          for (const i of this) {
            const k = i
              ? i.getProp(key, "")
              : "";

            if (result[k]) {
              result[k].push(i);
            } else {
              result[k] = [i];
            }
          }

          return result;
        },
        enumerable: false
      });
    }
  }

  /**
   * Set up all the global api variables.
   */
  private _initGlobalPluginApis(): void {
    this._initGlobalScrys();
    this._initExtraApiGlobal();
    this._initCurrentFileGlobal();
  }

  private _tryToAddToGlobals(key: string, value: PropertyDescriptor & ThisType<any>): [boolean, boolean] {
    const results = [
      this._tryToAddToGlobal(key, value, true),
      this._tryToAddToGlobal(key, value, false)
    ];

    return results as [boolean, boolean];
  }

  private _tryToAddToGlobal(key: string, value: PropertyDescriptor & ThisType<any>, isMobile: boolean = false): boolean {
    let success: boolean = false;
    if (isMobile) {
      try {
        Object.defineProperty(window, key, value);
        success = true;
      } catch { }
    } else {
      try {
        Object.defineProperty(global, key, value);
        success = true;
      } catch { }
    }

    return success;
  }

  /**
   * Set up global access to the MetadataScryApi.
   */
  private _initCurrentFileGlobal(): void {
    this.settings.globalCurrentFilePropertyNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToAddToGlobals(
          key, {
          get() {
            return InternalStaticMetadataScrierPluginContainer.Api.Current;
          }
        });
      });
  }

  /**
   * Global access to the MetadataScryApi on mobile.
   * @name global#meta
   */
  private _initExtraApiGlobal(): void {
    this.settings.globalMetaScryExtraNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToAddToGlobals(
          key, {
          get() {
            return InternalStaticMetadataScrierPluginContainer.Api;
          }
        });
      });
  }

  /**
   * Global access to the cache on desktop.
   * @name global#cache
   */
  private _initGlobalCache(): void {
    this.settings.globalCacheNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToAddToGlobals(
          key, {
          get() {
            return InternalStaticMetadataScrierPluginContainer.Api.Current.Cache;
          }
        });
      });
  }

  /**
   * Global access to the cache on desktop.
   * @name global#path
   */
  private _initGlobalPath(): void {
    this.settings.globalPathFunctionNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToAddToGlobals(
          key,
          { value: InternalStaticMetadataScrierPluginContainer.Api.path }
        );
      });
  }

  private _initGlobalScrys(): void {
    if (this.settings.defineScryGlobalVariables) {
      // build the Static Api

      this._tryToAddToGlobals(
        Keys.ScryGlobalPropertyCapitalizedKey, {
        get() {
          return InternalStaticMetadataScrierPluginContainer.Static;
        }
      });
      this._tryToAddToGlobals(
        Keys.ScryGlobalPropertyLowercaseKey, {
        get() {
          return InternalStaticMetadataScrierPluginContainer.Api;
        }
      });
    }
  }

  //#endregion

  //#endregion

  //#region De-Initialization

  private _deinitApi(): void {
    this._deinitGlobals();
    this._deinitHelperMethods();

    InternalStaticMetadataScrierPluginContainer.ClearApi();
  }

  private _deinitHelperMethods(): void {
    this._deinitObjectPropertyHelpers();
    this._deinitArrayHelpers();
  }

  private _deinitGlobals(): void {
    this._deinitGlobalPluginApis();
    this._deinitGlobalCache();
    this._deinitGlobalPath();
  }

  private _tryToRemoveFromGlobals(key: string): [boolean, boolean] {
    return [
      this._tryToRemoveGlobal(key, true),
      this._tryToRemoveGlobal(key, false)
    ];
  }

  private _tryToRemoveGlobal(key: string, isMobile: boolean = false): boolean {
    if (isMobile) {
      try {
        // @ts-ignore: Global Scope
        delete window[key];
      } finally {
        try {
          // @ts-ignore: Global Scope
          return typeof window[key] === 'undefined';
        } catch {
          return true;
        }
      }
    } else {
      try {
        // @ts-ignore: Global Scope
        delete global[key];
      } finally {
        try {
          // @ts-ignore: Global Scope
          return typeof global[key] === 'undefined';
        } catch {
          return true;
        }
      }
    }
  }

  private _deinitGlobalCache(): void {
    this.settings.globalCacheNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToRemoveFromGlobals(key);
      });
  }

  private _deinitGlobalPath(): void {
    this.settings.globalPathFunctionNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToRemoveFromGlobals(key);
      });
  }


  private _deinitGlobalPluginApis(): void {
    if (this.settings.defineScryGlobalVariables) {
      this._tryToRemoveFromGlobals(Keys.ScryGlobalPropertyCapitalizedKey);
      this._tryToRemoveFromGlobals(Keys.ScryGlobalPropertyLowercaseKey);
    }

    this.settings.globalMetaScryExtraNames
      .split(",")
      .map(this._trimString)
      .forEach(key => {
        this._tryToRemoveFromGlobals(key);
      });
  }

  private _deinitObjectPropertyHelpers(): void {
    if (this.settings.defineObjectPropertyHelperFunctions) {
      try {
        // @ts-ignore: Global Scope
        delete Object.prototype[HasPropObjectHelperFunctionKey];
      } catch { }
      try {
        // @ts-ignore: Global Scope
        delete Object.prototype[GetPropObjectHelperFunctionKey];
      } catch { }
      try {
        // @ts-ignore: Global Scope
        delete Object.prototype[SetPropObjectHelperFunctionKey];
      } catch { }
    }
  }

  private _deinitArrayHelpers(): void {
    if (this.settings.defineArrayHelperFunctions) {
      try {
        // @ts-ignore: Global Scope
        delete Array.prototype[AggregateByArrayHelperFunctionKey];
      } catch { }
      try {
        // @ts-ignore: Global Scope
        delete Array.prototype[IndexByArrayHelperFunctionKey];
      } catch { }
    }
  }

  private _trimString(value: string) {
    return value?.trim();
  }

  //#endregion
}


