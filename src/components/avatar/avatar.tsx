import { Component, Prop, State, h } from '@stencil/core';

/**
 * @since 1.0
 * @status stable
 *
 * @slot icon - The default icon to use when no image or initials are present.
 *
 * @part base - The avatar base element.
 * @part icon - The container that wraps the avatar icon.
 * @part initials - The container that wraps the avatar initials.
 * @part image - The avatar image.
 */

@Component({
  tag: 'sl-avatar',
  styleUrl: 'avatar.scss',
  shadow: true
})
export class Avatar {
  constructor() {
    this.handleImageError = this.handleImageError.bind(this);
  }

  @State() hasError = false;

  /** The image source to use for the avatar. */
  @Prop() image = '';

  /** Alternative text for the image. */
  @Prop() alt = '';

  /** Initials to use as a fallback when no image is available (1-2 characters max recommended). */
  @Prop() initials = '';

  /** Initials to use as a fallback when no image is available (1-2 characters max recommended). */
  @Prop() shape: 'circle' | 'square' | 'rounded' = 'circle';

  handleImageError() {
    this.hasError = true;
  }

  render() {
    return (
      <div
        part="base"
        class={{
          avatar: true,
          'avatar--circle': this.shape === 'circle',
          'avatar--rounded': this.shape === 'rounded',
          'avatar--square': this.shape === 'square'
        }}
        role="image"
        aria-label={this.alt}
      >
        {!this.initials && (
          <div part="icon" class="avatar__icon">
            <slot name="icon">
              <sl-icon name="person-fill" />
            </slot>
          </div>
        )}

        {this.initials && (
          <div part="initials" class="avatar__initials">
            {this.initials}
          </div>
        )}

        {this.image && !this.hasError && (
          <img part="image" class="avatar__image" src={this.image} onError={this.handleImageError} />
        )}
      </div>
    );
  }
}
