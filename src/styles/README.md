# Styles Directory

This directory contains all Sass partials for the Circle Werk application.

## Files

### `_variables.scss`
Global variables for colors, spacing, typography, breakpoints, and more.

**Usage:**
```scss
@import '../styles/variables';

.my-component {
  padding: $spacing-lg;
  color: $primary-color;
}
```

### `_mixins.scss`
Reusable mixins for common patterns.

**Usage:**
```scss
@import '../styles/mixins';

.header {
  @include flex-between;
  
  @include md {
    padding: $spacing-xl;
  }
}
```

### `_base.scss`
Base styles, resets, and global element styles.

Includes:
- Box-sizing reset
- HTML/body defaults
- Typography defaults
- Link styles
- Button defaults
- Input defaults
- Dark mode support

### `_layout.scss`
Layout-related styles.

Includes:
- `.app-layout` - Main app container
- `.main-nav` - Navigation bar
- `.loading-screen` - Loading state
- `.container` - Content containers
- `.grid` - Grid layouts

### `_components.scss`
Component-specific styles.

Includes:
- `.auth-page` - Authentication pages
- `.card` - Card components
- `.btn` - Button variants
- `.form-group` - Form fields
- `.badge` - Badge components
- `.list` - List components
- `.empty-state` - Empty states

## Creating New Partials

1. Create file with underscore prefix: `_mypartial.scss`
2. Add styles using variables and mixins
3. Import in `index.scss`:

```scss
@import './styles/mypartial';
```

## Naming Convention

- Use lowercase with hyphens: `my-component`
- Use BEM for complex components: `card__header`, `card--large`
- Prefix with component name: `.card-header`, `.card-body`

## Example Component

```scss
// _mycomponent.scss
.my-component {
  @include card;
  
  &__header {
    @include flex-between;
    padding: $spacing-md;
  }
  
  &__body {
    padding: $spacing-lg;
  }
  
  &--large {
    padding: $spacing-xl;
  }
  
  @include md {
    max-width: 600px;
  }
}
```
