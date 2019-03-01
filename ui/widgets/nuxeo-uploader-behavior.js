/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
 * Initializes a new default upload provider.
 *
 * @param {Object} connection an instance of nuxeo-connection to be used
 * @param {String} accept a string holding a comma separated list of accepted file types or mime types
 * @param {Boolean} batchAppend a boolean whether files should be appended to the current batch or not
 * */
function DefaultUploadProvider(connection, accept, batchAppend) {
  this.connection = connection;
  this.accept = accept;
  this.batchAppend = batchAppend;
  this.uploader = null;
  this.batchId = null;
}

DefaultUploadProvider.prototype._ensureBatch = function () {
  if (!this.batchAppend || !this.uploader) {
    return this.connection.batchUpload().then((uploader) => {
      this.uploader = uploader;
    });
  } else {
    return Promise.resolve();
  }
};

DefaultUploadProvider.prototype._newBatch = function () {
  return this.connection.batchUpload().then((uploader) => {
    this.uploader = uploader;
  });
};

/**
 * Uploads an array of files. Should implicitly create a new or use an already existing batch.
 *
 * @param {Object[]} files the list of files to upload
 * @param {Function} callback a callback function that should be called when a file upload starts,
 * when progress is updated, when a file upload ends, and when an upload batch is complete
 * */
DefaultUploadProvider.prototype.upload = function (files, callback) {
  if (files) {
    this._ensureBatch().then(() => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = new Nuxeo.Blob({ content: file });
        if (typeof callback === 'function') {
          callback({ type: 'uploadStarted', file });
        }
        this.uploader.upload(blob).then((result) => {
          callback({ type: 'uploadCompleted', fileIdx: result.blob.fileIdx });
        }).catch((error) => {
          callback({ type: 'uploadInterrupted', file, error });
        });
      }
      this.uploader.done().then((result) => {
        callback({ type: 'batchFinished', batchId: result.batch._batchId });
      }).catch((error) => {
        callback({ type: 'batchFailed', error });
      });
    });
  }
};

/**
 * Cancels the current batch.
 * */
DefaultUploadProvider.prototype.cancelBatch = function () {
  if (this.uploader) {
    if (this.uploader._batchId) {
      this.uploader.cancel();
    }
    this.uploader = null;
    this.batchId = null;
  }
};

/**
 * Executes an operation on the current batch.
 *
 * @param {String} operationId the operation to execute
 * @param {Object} params the operation params
 * @param {Object} headers the request headers
 * */
DefaultUploadProvider.prototype.batchExecute = function (operationId, params, headers) {
  return this.connection.operation(operationId).then((operation) => {
    const options = {};
    if (headers) {
      options.headers = headers;
    }
    if (params.context) {
      operation = operation.context(params.context);
    }
    return operation.input(this.uploader)
      .params(params)
      .execute(options);
  });
};

/**
 * Returns whether the provider accepts a given file for upload or not.
 *
 * @param {Object} file the file to be checked
 * @return {Boolean} true if the current file is accepted by the current provider, false otherwise
 * */
DefaultUploadProvider.prototype.accepts = function (file) {
  if (!this.accept) {
    return true;
  }
  const mimeType = (file.type !== '') ? file.type.match(/^[^/]*\//)[0] : null;
  const fileType = (file.name.indexOf('.') !== -1) ? file.name.match(/\.[^.]*$/)[0] : null;
  return this.accept.indexOf(mimeType) > -1 || this.accept.indexOf(fileType) > -1;
};

/**
 * Returns whether or not the provider reports file upload progress.
 *
 * @return {Boolean} true if the provider reports progress, false otherwise
 * */
DefaultUploadProvider.prototype.hasProgress = function () {
  return false;
};

const _registry = { default: DefaultUploadProvider };
let _defaultProvider = 'default';

/**
 * @polymerBehavior Nuxeo.UploaderBehavior
 */
export const UploaderBehavior = {

  properties: {
    /**
     * Accepted file extensions or mime types (comma separated values).
     */
    accept: String,

    /**
     * This flag determines whether the file should be immediately uploaded or not.
     */
    immediate: {
      type: Boolean,
      value: true,
    },

    /**
     * Current batch id.
     */
    batchId: String,

    /**
     * List of files in the current batch.
     */
    files: {
      type: Array,
      value: [],
    },

    /**
     * Flag that indicates if an upload is in progress.
     */
    uploading: {
      type: Boolean,
      value: false,
    },

    /**
     * Allow multiple files to be added to the same batch.
     */
    batchAppend: {
      type: Boolean,
      value: false,
    },

    /**
     * Current upload provider being used. If `undefined`, the `defaultProvider` will be used.
     */
    provider: {
      type: String,
      notify: true,
      reflectToAttribute: true,
      observer: '_reloadProvider',
    },

    _provider: {
      type: String,
      value() {
        return _defaultProvider;
      },
    },
  },

  observers: ['_initProvider(_provider, connection, accept, batchAppend)'],

  _initProvider() {
    if (this._provider) {
      this._instance = new _registry[this._provider](this.connection, this.accept, this.batchAppend);
    }
  },

  _reloadProvider() {
    if (this.provider && this.provider !== this._provider) {
      this.set('_provider', this.provider);
    } else if (!this.provider) {
      this.set('_provider', _defaultProvider);
    }
  },

  created() {
    this.defaultProviderChangedHandler = this._reloadProvider.bind(this);
    document.addEventListener('defaultUploadProviderChanged', this.defaultProviderChangedHandler);
  },

  detached() {
    document.removeEventListener('defaultUploadProviderChanged', this.defaultProviderChangedHandler);
    this.defaultProviderChangedHandler = null;
  },

  /**
   * Registers a new upload provider.
   */
  registerProvider(name, provider) {
    _registry[name] = provider;
  },

  /**
   * Returns all registered upload providers.
   */
  getProviders() {
    return _registry;
  },

  /**
   * Gets the default upload provider.
   */
  get defaultProvider() {
    return _defaultProvider;
  },

  /**
   * Sets the default upload provider.
   *
   * Every element extending this behavior will use this provider from now on except if a `provider` was
   * explicitly set.
   */
  set defaultProvider(provider) {
    _defaultProvider = provider;
    document.dispatchEvent(new Event('defaultUploadProviderChanged'));
  },

  setupDropZone(el) {
    this._dropZone = el;
    this._dragoverHandler = this._dragover.bind(this);
    this._dragleaveHandler = this._dragleave.bind(this);
    this._dropHandler = this._drop.bind(this);
    this._dropZone.addEventListener('dragover', this._dragoverHandler);
    this._dropZone.addEventListener('dragleave', this._dragleaveHandler);
    this._dropZone.addEventListener('drop', this._dropHandler);
  },

  teardownDropZone() {
    this._dropZone.removeEventListener('dragover', this._dragoverHandler);
    this._dropZone.removeEventListener('dragleave', this._dragleaveHandler);
    this._dropZone.removeEventListener('drop', this._dropHandler);
    this._dropZone = null;
    this._dragoverHandler = null;
    this._dragleaveHandler = null;
    this._dropHandler = null;
  },

  uploadFiles(files) {
    if (!this.accepts(files)) {
      console.warn(`Can only upload ${this.accept} files.`);
      return;
    }
    if (!this.connection) {
      throw 'Missing connection'; // eslint-disable-line no-throw-literal
    }

    if (!this.batchAppend) {
      this.files = [];
    }

    this._instance.upload(files, (event) => {
      switch (event.type) {
        case 'uploadStarted':
          this._uploadStarted(event.file);
          break;
        case 'uploadProgress':
          this._uploadProgressUpdated(event.fileIdx, event.progress);
          break;
        case 'uploadCompleted':
          this._uploadFinished(event.fileIdx);
          break;
        case 'batchFinished':
          this._batchFinished(event.batchId);
          break;
        case 'uploadInterrupted':
          this._uploadInterrupted(event.file, event.error);
          break;
        case 'batchFailed':
          this._batchFailed(event.error);
          break;
        default:
          // do nothing
      }
    });
  },

  batchExecute(operationId, params, headers) {
    return this._instance.batchExecute(operationId, params, headers)
      .then((data) => {
        this.fire('response', { response: data });
        this.response = data;
        return this.response;
      }).catch((error) => {
        this.fire('error', error);
        console.log(`Batch Execute operation failed: ${error}`);
        throw error;
      });
  },

  cancelBatch() {
    return this._instance.cancelBatch();
  },

  hasProgress() {
    return this._instance.hasProgress();
  },

  accepts(files) {
    if (!this._instance) {
      return false;
    }
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        if (!this._accepts(files[i])) {
          return false;
        }
      }
      return true;
    } else {
      return this._accepts(files);
    }
  },

  _accepts(file) {
    return this._instance ? this._instance.accepts(file) : false;
  },

  _updateFile(index, values) {
    Object.keys(values).forEach((k) => {
      this.set(['files', index, k].join('.'), values[k]);
    });
  },

  _batchFinished(batchId) {
    this.uploading = false;
    this.batchId = batchId;
    this.fire('batchFinished', { batchId });
  },

  _batchFailed(error) {
    this.uploading = false;
    this.fire('batchFailed', { error });
  },

  _uploadStarted(file) {
    file.progress = 0;
    file.error = false;
    file.complete = false;
    this.push('files', file);
    this.uploading = true;
  },

  _uploadFinished(index) {
    this._updateFile(index, {
      progress: 100,
      complete: true,
      index,
    });
  },

  _uploadInterrupted(file, error) {
    this.fire('uploadInterrupted', { file, error: error || 'Upload Interrupted!' });
  },

  _uploadProgressUpdated(index, progress) {
    this._updateFile(index, { progress }); // in percentage
  },

  _uploadSpeedUpdated(index, file, speed) {
    this._updateFile(index, { speed }); // in KB/sec
  },

  // DnD
  _dragover(e) {
    e.preventDefault();
    this.toggleClass('hover', true, this._dropZone);
  },

  _dragleave() {
    this.toggleClass('hover', false, this._dropZone);
  },

  _drop(e) {
    this.toggleClass('hover', false, this._dropZone);
    e.preventDefault();
    this.uploadFiles(e.dataTransfer.files);
  },
};
