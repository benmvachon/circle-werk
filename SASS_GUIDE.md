# Circle Werk - Sass/SCSS Guide

Complete guide to the Sass stylesheet system in Circle Werk.

## Overview

Circle Werk uses **Sass (SCSS syntax)** for stylesheets, providing variables, mixins, nesting, and modular organization.

## Installation

Sass is already installed:

```bash
npm install --save-dev sass
```

Vite automatically compiles `.scss` files - no additional configuration needed.

## File Structure

```
src/
├── styles/
│   ├── _variables.scss    # Color, spacing, typography variables
│   ├── _mixins.scss        # Reusable mixins
│   ├── _base.scss          # Base styles and resets
│   ├── _layout.scss        # Layout components
│   └── _components.scss    # Component styles
├── index.scss              # Main entry point (imports all partials)
└── App.scss                # App-specific styles
```

## Import Order

The `index.scss` file imports partials in this order:

```scss
@import './styles/variables';  // 1. Variables first
@import './styles/mixins';     // 2. Mixins second
@import './styles/base';       // 3. Base styles
@import './styles/layout';     // 4. Layout
@import './styles/components'; // 5. Components
```

## Variables

### Colors

```scss
$primary-color: #646cff;
$primary-hover: #535bf2;
$error-color: #ef4444;
$success-color: #10b981;
$warning-color: #f59e0b;
```

### Spacing

```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px
```

### Typography

```scss
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-base: 1rem;    // 16px
$font-size-lg: 1.125rem;  // 18px
$font-size-xl: 1.25rem;   // 20px
$font-size-2xl: 1.5rem;   // 24px
$font-size-3xl: 2rem;     // 32px

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### Border Radius

```scss
$border-radius-sm: 0.25rem;
$border-radius-md: 0.5rem;
$border-radius-lg: 0.75rem;
$border-radius-xl: 1rem;
$border-radius-full: 9999px;
```

### Breakpoints

```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;
```

## Mixins

### Responsive Breakpoints

```scss
// Mobile-first approach
@include sm {
  // Styles for screens >= 640px
}

@include md {
  // Styles for screens >= 768px
}

@include lg {
  // Styles for screens >= 1024px
}
```

**Example:**
```scss
.container {
  padding: $spacing-md;
  
  @include md {
    padding: $spacing-xl;
  }
  
  @include lg {
    padding: $spacing-2xl;
  }
}
```

### Flexbox Utilities

```scss
// Center items
@include flex-center;

// Space between items
@include flex-between;

// Column direction
@include flex-column;
```

**Example:**
```scss
.header {
  @include flex-between;
  padding: $spacing-md;
}

.modal {
  @include flex-center;
  min-height: 100vh;
}
```

### Button Styles

```scss
button {
  @include button-primary;
}

.secondary-btn {
  @include button-secondary;
}
```

### Card Styles

```scss
.card {
  @include card;
}
```

### Input Styles

```scss
input {
  @include input-base;
}
```

### Text Utilities

```scss
// Single line truncation
.title {
  @include truncate;
}

// Multi-line truncation
.description {
  @include line-clamp(3); // Show 3 lines
}
```

### Transitions

```scss
.element {
  @include transition(background-color, transform);
}
```

## Using Variables

### In Component Styles

```scss
.my-component {
  padding: $spacing-lg;
  background-color: $primary-color;
  border-radius: $border-radius-md;
  
  &:hover {
    background-color: $primary-hover;
  }
}
```

### In Inline Styles

```tsx
// Import variables in TypeScript (requires sass module)
import styles from './MyComponent.module.scss';

<div className={styles.myComponent}>...</div>
```

## Component-Specific Styles

### Create a Component SCSS File

```scss
// src/components/MyComponent.scss
@import '../styles/variables';
@import '../styles/mixins';

.my-component {
  @include card;
  padding: $spacing-xl;
  
  .header {
    @include flex-between;
    margin-bottom: $spacing-md;
  }
  
  .content {
    color: $text-light;
    
    @include md {
      font-size: $font-size-lg;
    }
  }
}
```

### Import in Component

```tsx
import './MyComponent.scss';

export function MyComponent() {
  return (
    <div className="my-component">
      <div className="header">...</div>
      <div className="content">...</div>
    </div>
  );
}
```

## CSS Modules (Optional)

For scoped styles, use CSS Modules:

```scss
// MyComponent.module.scss
@import '../styles/variables';

.container {
  padding: $spacing-lg;
}

.title {
  color: $primary-color;
}
```

```tsx
import styles from './MyComponent.module.scss';

export function MyComponent() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Title</h1>
    </div>
  );
}
```

## Nesting

Sass allows nesting selectors:

```scss
.card {
  padding: $spacing-lg;
  
  .header {
    margin-bottom: $spacing-md;
    
    h2 {
      font-size: $font-size-xl;
    }
  }
  
  .content {
    color: $text-light;
  }
  
  &:hover {
    box-shadow: $shadow-lg;
  }
  
  &.active {
    border-color: $primary-color;
  }
}
```

## Parent Selector (&)

```scss
.button {
  background: $primary-color;
  
  &:hover {
    background: $primary-hover;
  }
  
  &:disabled {
    opacity: 0.5;
  }
  
  &.large {
    padding: $spacing-lg;
  }
  
  &-icon {
    // Becomes .button-icon
    margin-right: $spacing-sm;
  }
}
```

## Dark Mode

Dark mode styles are included:

```scss
.component {
  background: white;
  color: black;
  
  @media (prefers-color-scheme: dark) {
    background: #1a1a1a;
    color: white;
  }
}
```

## Utility Classes

Pre-built utility classes are available:

### Layout
- `.container` - Max-width container
- `.container-sm` - Smaller container
- `.grid` - Grid layout
- `.grid-2` - 2-column grid
- `.grid-3` - 3-column grid

### Components
- `.card` - Card component
- `.card-hover` - Card with hover effect
- `.btn` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-sm` - Small button
- `.btn-lg` - Large button
- `.btn-full` - Full-width button

### Forms
- `.form-group` - Form field wrapper
- `.error-message` - Error text
- `.help-text` - Help text

### Badges
- `.badge` - Base badge
- `.badge-primary` - Primary badge
- `.badge-success` - Success badge
- `.badge-warning` - Warning badge
- `.badge-error` - Error badge

### Lists
- `.list` - Styled list

### Empty States
- `.empty-state` - Empty state component

## Best Practices

### 1. Use Variables

```scss
// ❌ Bad
.button {
  padding: 16px 24px;
  color: #646cff;
}

// ✅ Good
.button {
  padding: $spacing-md $spacing-lg;
  color: $primary-color;
}
```

### 2. Use Mixins for Repeated Patterns

```scss
// ❌ Bad
.card-1 {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-2 {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ Good
.card-1 {
  @include flex-center;
}

.card-2 {
  @include flex-center;
}
```

### 3. Limit Nesting Depth

```scss
// ❌ Bad (too deep)
.page {
  .section {
    .container {
      .card {
        .header {
          .title {
            // Too nested!
          }
        }
      }
    }
  }
}

// ✅ Good (max 3 levels)
.card {
  .header {
    .title {
      font-size: $font-size-xl;
    }
  }
}
```

### 4. Use Partials

Create separate files for different concerns:
- `_variables.scss` - Variables only
- `_mixins.scss` - Mixins only
- `_buttons.scss` - Button styles
- `_forms.scss` - Form styles

### 5. Mobile-First Responsive Design

```scss
// ✅ Good - Mobile first
.container {
  padding: $spacing-md;
  
  @include md {
    padding: $spacing-xl;
  }
  
  @include lg {
    padding: $spacing-2xl;
  }
}
```

## Common Patterns

### Card Component

```scss
.card {
  @include card;
  
  &-header {
    @include flex-between;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $border-color;
  }
  
  &-body {
    padding: $spacing-md 0;
  }
  
  &-footer {
    padding-top: $spacing-md;
    border-top: 1px solid $border-color;
  }
}
```

### Form Component

```scss
.form {
  @include flex-column;
  gap: $spacing-lg;
  
  &-group {
    @include flex-column;
    gap: $spacing-xs;
  }
  
  label {
    font-weight: $font-weight-medium;
    font-size: $font-size-sm;
  }
  
  input {
    @include input-base;
  }
  
  button {
    @include button-primary;
    margin-top: $spacing-md;
  }
}
```

## Troubleshooting

### Styles Not Applying

1. Check import order in `index.scss`
2. Ensure file has `.scss` extension
3. Verify Sass is installed: `npm list sass`

### Variables Not Found

Make sure to import variables:
```scss
@import '../styles/variables';
```

### Build Errors

Run: `npm run build` to see detailed Sass compilation errors

## Resources

- [Sass Documentation](https://sass-lang.com/documentation)
- [Sass Guidelines](https://sass-guidelin.es/)
- [Vite CSS Documentation](https://vitejs.dev/guide/features.html#css)
