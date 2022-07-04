import { html, LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import '../../components/icon-button/icon-button';
import '../../components/icon/icon';
import '../../components/progress-bar/progress-bar';
import { emit } from '../../internal/event';
import { LocalizeController } from '../../utilities/localize';
import styles from './file-dropzone.styles';
import { hasValidFileSize, hasValidFileType, HttpMethod } from './library';
import type { FileInfo } from './library';

/**
 * @since 2.0
 * @status experimental
 *
 * @dependency sl-progress-bar
 * @dependency sl-icon
 * @dependency sl-icon-button
 *
 * @slot content - The dropzone's content. Alternatively, you can use the icon slot and label prop.
 * @slot icon - The dropzone's icon.
 *
 * @event sl-drop - Emitted when dragged files have been dropped on the dropzone area.
 * @event sl-select - Emitted when files have been selected via the file dialog.
 * @event {{ fileList: FileList }} sl-change - Emitted when files have been uploaded via the dropzone or file dialog.
 * @event {{ response: unknown }} sl-load - Emitted when a file transfer was finished
 * @event {{ event: ProgressEvent }} sl-error - Emitted when a file transfer threw an error
 * @event {{ event: ProgressEvent }} sl-abort - Emitted when a file transfer was aborted by the user
 * @event {{ file: FileInfo }} sl-remove - Emitted when a file was removed
 *
 * @csspart base - The component's internal wrapper.
 * @csspart content - The dropzone container.
 * @csspart icon - The dropzone icon.
 * @csspart button - The dropzone button.
 *
 * @cssproperty --border-radius - The border radius of the dropzone borders.
 * @cssproperty --border-width - The width of the dropzone borders.
 * @cssproperty --border-style - The style of the dropzone borders.
 *
 */

@customElement('sl-file-dropzone')
export default class SlFileDropzone extends LitElement {
  static styles = styles;

  private readonly localize = new LocalizeController(this);

  /** Internal property to show a warning in the dropzone */
  @state() warning?: string;

  @query('#file-input') fileInput: HTMLInputElement;

  @property() files: FileInfo[] = [];

  /** Disables the dropzone. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** If true, hides button to open the native file selection dialog */
  @property({ type: Boolean, reflect: true, attribute: 'no-button' }) noButton = false;

  /** If true, shows only a button as a file input */
  @property({ type: Boolean, reflect: true, attribute: 'button-only' }) buttonOnly = false;

  /** If true, disables drag 'n' drop */
  @property({ type: Boolean, reflect: true, attribute: 'no-drag' }) noDrag = false;

  /** If true, no file list will be shown */
  @property({ type: Boolean, reflect: true, attribute: 'no-file-list' }) noFileList = false;

  /** Indicates whether file list items are closable */
  @property({ type: Boolean, reflect: true }) closable = false;

  /** An optional overwrite for the upload label */
  @property() label?: string;

  /** An optional overwrite for the preview button label */
  @property({ attribute: 'button-label' }) buttonLabel?: string;

  /** The locale to render the component in. */
  @property() lang: string;

  /** A string that defines the file types the file dropzone should accept. Defaults to '*' */
  @property({ type: String, reflect: true }) accept = '*';

  /** An optional maximum size of a file that will be considered valid. */
  @property({ attribute: 'max-file-size' }) maxFileSize?: number;

  /** The maximum amount of files that are allowed. */
  @property({ attribute: 'max-files' }) maxFiles = 1;

  /** Specifies a URL where the files should be uploaded to */
  @property() url?: string;

  /** Specifies the method to be used for the file transfer request */
  @property() method: HttpMethod = HttpMethod.POST;

  /** Specifies headers to be used for the file transfer request */
  @property() headers?: Record<string, string>;

  /** Specifies whether or not cross-site Access-Control requests should be made using credentials such as cookies, authorization headers or TLS client certificates */
  @property({ type: Boolean, reflect: true, attribute: 'with-credentials' }) withCredentials = false;

  /** Indicates whether the files should be send as binary data. Per default files will be send as FormData. */
  @property({ type: Boolean, reflect: true, attribute: 'binary-body' }) binaryBody = false;

  get multiple() {
    return this.maxFiles > 1;
  }

  updateTransferProgress(progressEvent: ProgressEvent, fileInfo: FileInfo) {
    if (progressEvent.lengthComputable) {
      fileInfo.progress = (progressEvent.loaded / progressEvent.total) * 100;
      this.requestUpdate();
    }
  }

  onTransferComplete(event: ProgressEvent, httpRequest: XMLHttpRequest, fileInfo: FileInfo) {
    fileInfo.loading = false;
    if (httpRequest.status === 200) {
      emit(this, 'sl-load', {
        detail: { response: httpRequest.response as unknown }
      });
    } else {
      fileInfo.warning = this.localize.term('serverError') as string;
      fileInfo.accepted = false;

      emit(this, 'sl-error', { detail: event });
    }
    this.requestUpdate();
  }

  onTransferError(event: ProgressEvent, fileInfo: FileInfo) {
    fileInfo.loading = false;
    fileInfo.warning = this.localize.term('transferError') as string;
    fileInfo.accepted = false;
    this.requestUpdate();

    emit(this, 'sl-error', { detail: event });
  }

  onTransferAbort(event: ProgressEvent, fileInfo: FileInfo) {
    fileInfo.loading = false;
    fileInfo.warning = this.localize.term('transferAbort') as string;
    fileInfo.accepted = false;
    this.requestUpdate();

    emit(this, 'sl-abort', { detail: event });
  }

  uploadFile(fileInfo: FileInfo, url: string) {
    fileInfo.loading = true;
    fileInfo.progress = 0;

    const xhr = new XMLHttpRequest();
    fileInfo.xhr = xhr;
    xhr.open(this.method, url);

    xhr.upload.onprogress = event => this.updateTransferProgress(event, fileInfo);
    xhr.upload.onload = event => this.onTransferComplete(event, xhr, fileInfo);
    xhr.upload.onerror = event => this.onTransferError(event, fileInfo);
    xhr.upload.onabort = event => this.onTransferAbort(event, fileInfo);

    if (this.headers) {
      Object.entries(this.headers).forEach(entry => xhr.setRequestHeader(entry[0], entry[1]));
    }

    if (this.withCredentials) {
      xhr.withCredentials = true;
    }

    if (this.binaryBody) {
      xhr.setRequestHeader('Content-Type', fileInfo.file.type);
      xhr.send(fileInfo.file);
    } else {
      const formData = new FormData();
      formData.append(fileInfo.file.name, fileInfo.file);
      xhr.setRequestHeader('Content-Type', 'multipart/form-data');
      xhr.send(formData);
    }
  }

  addFile(file: File) {
    if (this.maxFiles && this.files.length >= this.maxFiles) {
      this.warning = this.localize.term('maxFiles') as string;
      return;
    }

    const fileInfo: FileInfo = {
      file
    };

    if (!hasValidFileType(file, this.accept)) {
      fileInfo.accepted = false;
      fileInfo.warning = this.localize.term('fileTypeNotAccepted') as string;
    } else if (!hasValidFileSize(file, this.maxFileSize)) {
      fileInfo.accepted = false;
      fileInfo.warning = this.localize.term('fileSizeExceeded') as string;
    } else {
      fileInfo.accepted = true;
    }

    this.files = this.multiple ? [...this.files, fileInfo] : [fileInfo];

    if (this.url) {
      this.uploadFile(fileInfo, this.url);
    }
  }

  handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    this.warning = undefined;
    if (!this.multiple && fileList.length > 1) {
      this.warning = this.localize.term('noMultipleFiles') as string;
      return;
    }

    emit(this, 'sl-change', { detail: fileList });

    Object.values(fileList).forEach(file => this.addFile(file));
  }

  onDrop(event: CustomEvent<{ dataTransfer: { files: FileList } }>) {
    const files = event.detail.dataTransfer?.files;
    if (!files || this.disabled || this.noDrag) {
      // Abort if no files were transferred, the entire element or drag and drop is disabled
      return;
    }

    this.handleFiles(files);
  }

  handleBrowseFileClick() {
    this.fileInput.click();
  }

  handleFileInputChange() {
    emit(this, 'sl-select');
    this.handleFiles(this.fileInput.files);
  }

  handleFileRemove(index: number) {
    const fileInfo = this.files[index];
    if (fileInfo.loading) {
      fileInfo.xhr?.abort();
      emit(this, 'sl-abort', { detail: { fileInfo } });
    } else {
      emit(this, 'sl-remove', { detail: { fileInfo } });
    }
    this.files = this.files.filter((_, fileIndex) => fileIndex !== index);
  }

  get dragDroplabel(): string {
    if (this.warning) {
      return this.warning;
    }
    return this.label ? this.label : (this.localize.term('dragDrop') as string);
  }

  render() {
    const browseFilesButton = html`
      <sl-button
        part="button"
        variant=${this.warning ? 'warning' : 'primary'}
        ?disabled=${this.disabled}
        @click="${this.handleBrowseFileClick}"
      >
        ${this.buttonLabel ?? this.localize.term('browseFiles')}
      </sl-button>
    `;

    return html`
      <div
        part="base"
        class=${classMap({
          'file-dropzone': true,
          'file-dropzone--disabled': this.disabled,
          'file-dropzone--warning': !!this.warning,
          'file-dropzone--no-drag': this.noDrag
        })}
      >
        <input
          type="file"
          id="file-input"
          style="display: none"
          accept=${this.accept}
          ?multiple=${this.multiple}
          @change="${this.handleFileInputChange}"
        />
        ${this.buttonOnly
          ? browseFilesButton
          : html`
              <sl-drop-handler id="dropzone" @sl-drop="${this.onDrop}">
                <slot name="content">
                  <div part="content" class="file-dropzone__content">
                    <div class="file-dropzone__content__container">
                      <slot name="icon">
                        <sl-icon
                          part="icon"
                          name="cloud-arrow-up"
                          class="file-dropzone__content__container__icon"
                        ></sl-icon>
                      </slot>
                      ${!this.noDrag ? html` <div>${this.dragDroplabel}</div> ` : ''}
                      ${!this.noButton ? browseFilesButton : ''}
                    </div>
                  </div>
                </slot>
              </sl-drop-handler>
            `}
        ${!this.noFileList
          ? html`
              <div class="file-dropzone__file-items" id="file-items">
                ${this.files.map(
                  (fileInfo, index) => html`
                    <sl-file-item
                      size=${fileInfo.accepted ? fileInfo.file.size : nothing}
                      ?warning=${!fileInfo.accepted}
                      ?closable=${fileInfo.accepted ? this.closable : true}
                      ?loading=${fileInfo.loading}
                      progress=${fileInfo.progress}
                      @sl-hide=${(event: CustomEvent) => {
                        event.stopPropagation();
                        this.handleFileRemove(index);
                      }}
                    >
                      ${fileInfo.accepted ? fileInfo.file.name : fileInfo.warning}
                      <sl-icon name=${fileInfo.warning ? 'exclamation-triangle' : 'file-earmark'} slot="icon"></sl-icon>
                    </sl-file-item>
                  `
                )}
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-file-dropzone': SlFileDropzone;
  }
}